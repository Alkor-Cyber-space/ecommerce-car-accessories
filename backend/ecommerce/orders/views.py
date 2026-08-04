from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Order, OrderItem, ReturnRequest
from .serializers import *
from rest_framework.decorators import action
from rest_framework import status
from payment.stripe_payment import initiate_payment_intent
from payment.factory import *
from payment.razorpay_payment import *
from decimal import Decimal
from django.conf import settings
import razorpay
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from rest_framework.views import APIView
from .shiprocket_client import *
from datetime import datetime
from rest_framework import generics, permissions
from django.db.models import Q
import re
# from accounts.utils import generate_invoice_pdf
# from accounts.utils import send_order_invoice_email


def format_phone_number(phone):
    """Format phone number for Shiprocket API."""
    if not phone:
        return None

    cleaned = re.sub(r'\D', '', str(phone))

    if len(cleaned) == 10:
        cleaned = '91' + cleaned
    elif len(cleaned) != 12:
        return None

    return cleaned


class ShippingOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]


    def post(self, request):
        """
        Calculate available shipping rates from Shiprocket — resolved from user's cart.

        Frontend sends:
        {
            "delivery_postcode": "411001",  ← customer destination pincode
            "weight": 2.0,                  ← total parcel weight in kg
            "cod": 1,                       ← 1=COD, 0=Prepaid
            "user_id": 5,                   ← optional, defaults to logged-in user
            "length": 30,                   ← optional parcel dimensions
            "breadth": 20,
            "height": 15
        }

        Backend auto-resolves:
        - The user's active cart items
        - Groups products by vendor
        - Resolves each vendor's pickup_postcode from their saved Address
        - Calls Shiprocket serviceability API per vendor
        """
        from accounts.models import Address, CustomUser
        from cart_wishlist.models import Cart, CartItem

        delivery_postcode = request.data.get("delivery_postcode")
        if not delivery_postcode:
            return Response({"error": "delivery_postcode is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve user: frontend can pass user_id, fallback to authenticated user
        user_id = request.data.get("user_id")
        if user_id:
            try:
                target_user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            target_user = request.user

        # Parse weight and cod
        try:
            weight = float(request.data.get("weight", 0.5))
            cod = int(request.data.get("cod", 0))
        except (ValueError, TypeError):
            return Response({"error": "Invalid format for weight or cod"}, status=status.HTTP_400_BAD_REQUEST)

        # Parse optional dimensions
        extra_dims = {}
        try:
            for dim in ["length", "breadth", "height"]:
                val = request.data.get(dim)
                if val is not None:
                    extra_dims[dim] = float(val)
        except (ValueError, TypeError):
            return Response({"error": "Invalid format for length, breadth, or height"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user's cart and cart items
        cart = Cart.objects.filter(user=target_user).first()
        if not cart:
            return Response({"error": "No active cart found for this user"}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = CartItem.objects.filter(cart=cart).select_related("product", "product__vendor")
        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Group cart items by vendor
        vendor_items_map = {}
        for item in cart_items:
            vendor = item.product.vendor
            if vendor.id not in vendor_items_map:
                vendor_items_map[vendor.id] = {
                    "vendor": vendor,
                    "items": [],
                }
            vendor_items_map[vendor.id]["items"].append(item)

        results = []
        total_shipping_cost = Decimal("0.00")
        for vendor_id, data in vendor_items_map.items():
            vendor = data["vendor"]
            vendor_profile = getattr(vendor, "vendor_profile", None)
            vendor_name = getattr(vendor_profile, "company_name", None) or vendor.username

            # Resolve pickup postcode from vendor's saved Address
            vendor_address = Address.objects.filter(user=vendor).first()
            pickup_postcode = vendor_address.postal_code if vendor_address and vendor_address.postal_code else None

            if not pickup_postcode:
                cheapest_option = {
                    "courier_name": "Default Courier",
                    "rate": 50.0,
                    "etd": None,
                    "corrected_etd": None,
                    "estimated_delivery_days": "3-5 days",
                    "courier_company_id": 127
                }
                total_shipping_cost += Decimal("50.00")
                results.append({
                    "vendor_id": vendor.id,
                    "vendor_name": vendor_name,
                    "pickup_postcode": None,
                    "total_weight": None,
                    "pickup_location": getattr(vendor_profile, "pickup_location", None),
                    "selected_courier": cheapest_option,
                    "options": [],
                    "error": "Vendor has no address — pickup postcode unavailable",
                })
                continue

            # Calculate total weight for this vendor's items in the cart
            vendor_total_weight = 0.0
            for item in data["items"]:
                try:
                    w = float(item.product.weight) if getattr(item.product, 'weight', None) else 0.0
                except (ValueError, TypeError):
                    w = 0.0
                vendor_total_weight += w * item.quantity

            if vendor_total_weight <= 0.0:
                vendor_total_weight = weight

            payload = {
                "pickup_postcode": pickup_postcode,
                "delivery_postcode": delivery_postcode,
                "weight": vendor_total_weight,
                "cod": cod,
                **extra_dims,
            }
            print(f"[ShippingOptions] Vendor #{vendor.id} ({vendor_name}) -> pickup: {pickup_postcode}, payload: {payload}")

            try:
                rates = calculate_shipping_rate(payload)
                options = []
                if rates.get("data") and "available_courier_companies" in rates["data"]:
                    for courier in rates["data"]["available_courier_companies"]:
                        etd_str = courier.get("etd")
                        corrected_etd = etd_str
                        estimated_days = "3-5 days"
                        
                        if etd_str:
                            try:
                                from datetime import datetime, date, timedelta
                                etd_date = None
                                for fmt in ("%Y-%m-%d", "%b %d, %Y", "%B %d, %Y"):
                                    try:
                                        etd_date = datetime.strptime(etd_str.strip(), fmt).date()
                                        break
                                    except ValueError:
                                        continue

                                if etd_date:
                                    today = date.today()
                                    transit_days = (etd_date - today).days
                                    if transit_days < 1:
                                        transit_days = 2
                                        
                                    total_days = transit_days + 2
                                    corrected_date_obj = today + timedelta(days=total_days)
                                    corrected_etd = corrected_date_obj.strftime("%b %d, %Y")
                                    estimated_days = f"{total_days} days"
                            except Exception:
                                pass

                        options.append({
                            "courier_name": courier["courier_name"],
                            "rate": float(courier["rate"]),
                            "etd": etd_str,
                            "corrected_etd": corrected_etd,
                            "estimated_delivery_days": estimated_days,
                            "courier_company_id": courier["courier_company_id"],
                        })

                # Determine cheapest courier option
                cheapest_option = None
                if options:
                    cheapest_option = min(options, key=lambda x: x["rate"])
                    total_shipping_cost += Decimal(str(cheapest_option["rate"]))
                else:
                    cheapest_option = {
                        "courier_name": "Default Courier",
                        "rate": 50.0,
                        "etd": None,
                        "corrected_etd": None,
                        "estimated_delivery_days": "3-5 days",
                        "courier_company_id": 127
                    }
                    total_shipping_cost += Decimal("50.00")

                results.append({
                    "vendor_id": vendor.id,
                    "vendor_name": vendor_name,
                    "pickup_postcode": pickup_postcode,
                    "pickup_location": getattr(vendor_profile, "pickup_location", None),
                    "total_weight": vendor_total_weight,
                    "selected_courier": cheapest_option,
                    "options": options,
                })

            except Exception as e:
                cheapest_option = {
                    "courier_name": "Default Courier",
                    "rate": 50.0,
                    "etd": None,
                    "corrected_etd": None,
                    "estimated_delivery_days": "3-5 days",
                    "courier_company_id": 127
                }
                total_shipping_cost += Decimal("50.00")
                results.append({
                    "vendor_id": vendor.id,
                    "vendor_name": vendor_name,
                    "pickup_postcode": pickup_postcode,
                    "pickup_location": getattr(vendor_profile, "pickup_location", None),
                    "total_weight": vendor_total_weight,
                    "selected_courier": cheapest_option,
                    "options": [],
                    "error": str(e),
                })

        return Response({
            "total_shipping_cost": float(total_shipping_cost),
            "vendors": results
        }, status=status.HTTP_200_OK)




# class CheckoutViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     def create(self, request):
#         serializer = OrderSerializer(data=request.data, context={'request': request})
#         serializer.is_valid(raise_exception=True)

#         validated = serializer.validated_data
#         user = request.user
#         items = validated['items']
#         shipping_address = validated['shipping_address']
#         payment_method = validated['payment_method']

#         subtotal = Decimal('0.00')
#         tax_rate = Decimal('0.18')
#         shipping_fee = Decimal('50.00')

#         # Prepare metadata (keep it minimal for gateways)
#         metadata = {
#             "user_id": str(user.id),
#             "payment_method": payment_method,
#             "shipping_address": str(shipping_address.id),
#         }

#         for i, item in enumerate(items):
#             product = item['product']
#             quantity = item['quantity']
#             subtotal += product.price * quantity
#             metadata[f'product_{i}'] = str(product.id)
#             metadata[f'quantity_{i}'] = str(quantity)

#         tax = subtotal * tax_rate
#         total = subtotal + tax + shipping_fee

#         # Create pending order in DB
#         order = Order.objects.create(
#             user=user,
#             shipping_address=shipping_address,
#             tax=tax,
#             shipping_cost=shipping_fee,
#             total_price=total,
#             status="pending",
#             payment_method=payment_method
#         )

#         # Only pass minimal metadata to gateway
#         gateway_metadata = {"order_id": str(order.id)}

#         try:
#             gateway_handler = get_payment_gateway(payment_method)
#         except Exception:
#             raise ValidationError("Unsupported payment method")

#         gateway_response = gateway_handler(
#             user=user,
#             amount=float(total),  # convert to float for payment gateway
#             metadata=gateway_metadata
#         )

#         return Response({
#             "amount": float(total),
#             "payment_gateway_response": gateway_response,
#             "order_id": order.id
#         }, status=status.HTTP_200_OK)


# class CheckoutViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     def create(self, request):
#         serializer = OrderSerializer(data=request.data, context={'request': request})
#         serializer.is_valid(raise_exception=True)

#         validated = serializer.validated_data
#         user = request.user
#         items = validated['items']
#         shipping_address = validated['shipping_address']
#         payment_method = validated['payment_method']

#         subtotal = Decimal("0.00")
#         tax_rate = Decimal("0.18")
#         shipping_fee = Decimal(str(request.data.get("shipping_fee", "0.00")))
#         courier_company_id = request.data.get("courier_company_id")

#         for item in items:
#             product = item['product']
#             quantity = item['quantity']
#             subtotal += product.price * quantity

#         tax = subtotal * tax_rate
#         total = subtotal + tax + shipping_fee

#         # Create pending order in DB
#         order = Order.objects.create(
#             user=user,
#             shipping_address=shipping_address,
#             tax=tax,
#             shipping_cost=shipping_fee,
#             total_price=total,
#             status="pending",
#             payment_method=payment_method,
#             courier_company_id = courier_company_id
#         )

#         try:
#             order_payload = {
#                             "order_id": "TEST12345",   # your DB order ID
#                             "order_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
#                             "pickup_location": "VENDOR_2",
#                             "channel_id": "",         # leave blank unless using marketplace
#                             "comment": "Test order from Django",
                            
#                             "billing_customer_name": "Ramesh",
#                             "billing_last_name": "Sharma",
#                             "billing_address": "Panangad",
#                             "billing_address_2": "Kundanoor",
#                             "billing_city": "Ernakulam",
#                             "billing_pincode": "682001",
#                             "billing_state": "Kerala",
#                             "billing_country": "India",
#                             "billing_email": "ramesh@example.com",
#                             "billing_phone": "9876543210",
#                             "courier_company_id":"127",
#                             "shipping_is_billing": True,  # same as billing

#                             "order_items": [
#                                 {
#                                     "name": "Car Seat Cover",
#                                     "sku": "CAR-SEAT-001",
#                                     "units": 1,
#                                     "selling_price": 999,
#                                     "discount": 0,
#                                     "tax": 0,
#                                 }
#                             ],

#                             "payment_method": "COD",   # or "Prepaid"
#                             "sub_total": 999,
#                             "length": 10,
#                             "breadth": 10,
#                             "height": 10,
#                             "weight": 2.0
#                         }
#             sr_response = create_shiprocket_order(order_payload)
#             print("Shiprocket response:", sr_response)
#             if not sr_response.get("shipment_id") or sr_response.get("status_code") != 1:
#                 sr_response["error"] = "Shiprocket order not created. Check payload or credentials."    

#         except Exception as e:  
#             sr_response = {"error": str(e)}

#         for item in items:
#             product = item['product']
#             quantity = item['quantity']
#             OrderItem.objects.create(
#                 order=order,
#                 product=product,
#                 quantity=quantity,
#                 price=product.price
#             )

#         # Metadata to pass to payment provider
#         metadata = {"order_id": str(order.id)}

#         try:
#             gateway_handler = get_payment_gateway(payment_method)
#             gateway_response = gateway_handler(user, float(total), metadata)
#         except Exception as e:
#             raise ValidationError(str(e))

#         return Response({
#             "amount": float(total),
#             "payment_gateway_response": gateway_response,
#             "order_id": order.id,
#             "shiprocket_response": sr_response
#         }, status=status.HTTP_200_OK)

from datetime import datetime
from decimal import Decimal
from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

class CheckoutViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        user = request.user
        items = validated['items']
        shipping_address = validated['shipping_address']
        payment_method = validated['payment_method']

        subtotal = Decimal("0.00")
        tax_rate = Decimal("0.18")
        apply_coup_amt = Decimal(str(request.data.get("Apply_coup_Amt", "0.00")))

        for item in items:
            product = item['product']
            quantity = item['quantity']
            subtotal += product.price * quantity

        tax = subtotal * tax_rate

        # Group items by vendor to calculate weight and call Shiprocket serviceability API
        vendor_items_map = {}
        for item in items:
            prod = item['product']
            v = prod.vendor
            if v.id not in vendor_items_map:
                vendor_items_map[v.id] = {
                    "vendor": v,
                    "items": []
                }
            vendor_items_map[v.id]["items"].append(item)

        dynamic_shipping_fee = Decimal("0.00")
        selected_courier_company_id = None
        vendor_couriers = {}

        for v_id, vdata in vendor_items_map.items():
            vendor = vdata["vendor"]
            from accounts.models import Address as UserAddress
            vendor_address = UserAddress.objects.filter(user=vendor).first()
            pickup_postcode = vendor_address.postal_code if vendor_address and vendor_address.postal_code else None

            # Calculate total weight for this vendor's items
            v_weight = 0.0
            for it in vdata["items"]:
                prod = it['product']
                qty = it['quantity']
                try:
                    w = float(prod.weight) if getattr(prod, 'weight', None) else 0.0
                except (ValueError, TypeError):
                    w = 0.0
                v_weight += w * qty
            if v_weight <= 0.0:
                v_weight = 1.0

            cheapest_rate = None
            cheapest_courier_id = None

            if pickup_postcode and shipping_address.postal_code:
                # Prepare payload for rate calculator
                first_prod = vdata["items"][0]['product']
                payload = {
                    "pickup_postcode": pickup_postcode,
                    "delivery_postcode": shipping_address.postal_code,
                    "weight": v_weight,
                    "cod": 1 if payment_method == "cod" else 0,
                }
                if getattr(first_prod, 'length', None):
                    payload["length"] = float(first_prod.length)
                if getattr(first_prod, 'breadth', None):
                    payload["breadth"] = float(first_prod.breadth)
                if getattr(first_prod, 'height', None):
                    payload["height"] = float(first_prod.height)

                try:
                    rates = calculate_shipping_rate(payload)
                    if rates.get("data") and "available_courier_companies" in rates["data"]:
                        for courier in rates["data"]["available_courier_companies"]:
                            rate_val = float(courier["rate"])
                            if cheapest_rate is None or rate_val < cheapest_rate:
                                cheapest_rate = rate_val
                                cheapest_courier_id = courier["courier_company_id"]
                except Exception as e:
                    print(f"[CheckoutViewSet] Error calculating shipping rate for vendor {v_id}: {e}")

            # Accumulate cheapest rate or apply fallback of ₹50.00
            if cheapest_rate is not None:
                dynamic_shipping_fee += Decimal(str(cheapest_rate))
                if selected_courier_company_id is None:
                    selected_courier_company_id = cheapest_courier_id
                
                courier_name = "Courier"
                if rates.get("data") and "available_courier_companies" in rates["data"]:
                    for c in rates["data"]["available_courier_companies"]:
                        if c["courier_company_id"] == cheapest_courier_id:
                            courier_name = c["courier_name"]
                            break

                vendor_couriers[v_id] = {
                    "courier_company_id": cheapest_courier_id,
                    "courier_name": courier_name,
                    "rate": cheapest_rate
                }
            else:
                dynamic_shipping_fee += Decimal("50.00")
                if selected_courier_company_id is None:
                    selected_courier_company_id = 127  # Safe default fallback courier ID
                vendor_couriers[v_id] = {
                    "courier_company_id": 127,
                    "courier_name": "Default Courier",
                    "rate": 50.0
                }

        shipping_fee = dynamic_shipping_fee
        courier_company_id = selected_courier_company_id

        total = subtotal + tax + shipping_fee - apply_coup_amt
        if total < Decimal("0.00"):
            total = Decimal("0.00")

        # Create pending order
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            tax=tax,
            shipping_cost=shipping_fee,
            discount=apply_coup_amt,
            total_price=total,
            status="pending",  # initial state
            payment_method=payment_method,
            courier_company_id=courier_company_id
        )

        # Save order items
        order_item_objects = []
        for item in items:
            oi = OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['product'].price
            )
            order_item_objects.append(oi)

        # Trigger stock deduction if COD by saving the order again
        if payment_method == 'cod':
            order.save()

        # Shiprocket Order Registration & Courier Slot Reservation per vendor
        if items and shipping_address:
            # Group created OrderItems by vendor
            vendor_oi_map = {}
            for oi in order_item_objects:
                v = oi.product.vendor
                if v.id not in vendor_oi_map:
                    vendor_oi_map[v.id] = []
                vendor_oi_map[v.id].append(oi)

            first_vendor_registered = False
            sr_response = {}
            billing_phone = format_phone_number(

                getattr(shipping_address, "phone_number", None) or getattr(user, "phone_number", None)
            ) or "919999999999"

            for v_id, v_items in vendor_oi_map.items():
                first_product = v_items[0].product
                vendor = first_product.vendor
                vendor_profile = getattr(vendor, 'vendor_profile', None)
                pickup_location = "VENDOR_2"
                
                if vendor_profile and vendor_profile.pickup_location:
                    pickup_location = vendor_profile.pickup_location
                else:
                    if vendor_profile:
                        from accounts.models import Address as UserAddress
                        vendor_address = UserAddress.objects.filter(user=vendor).first()
                        if vendor_address:
                            pickup_name = f"VENDOR_{vendor_profile.id}"
                            pickup_payload = {
                                "pickup_location": pickup_name,
                                "name": vendor_profile.company_name or vendor.username,
                                "email": vendor_profile.company_email or vendor.email,
                                "phone": format_phone_number(
                                    vendor_profile.contact_number or vendor_address.phone_number or getattr(vendor, 'phone_number', None)
                                ) or "9999999999",
                                "address": vendor_address.line1 or "",
                                "address_2": vendor_address.line2 or "",
                                "city": vendor_address.city or "",
                                "state": vendor_address.state or "",
                                "country": vendor_address.country or "India",
                                "pin_code": vendor_address.postal_code or "",
                            }
                            try:
                                sr_pickup_response = create_pickup_location(pickup_payload)
                                if not sr_pickup_response.get("error"):
                                    vendor_profile.pickup_location = pickup_name
                                    vendor_profile.save()
                                    pickup_location = pickup_name
                            except Exception:
                                pass

                # Prepare items payload for this vendor's portion of the order
                sr_items = []
                v_subtotal = Decimal("0.00")
                for oi in v_items:
                    prod = oi.product
                    sr_items.append({
                        "name": prod.name,
                        "sku": f"SKU-{prod.id}",
                        "units": oi.quantity,
                        "selling_price": float(oi.price),
                        "discount": 0,
                        "tax": 0,
                        "hsn": getattr(prod, "hsn", "8708")
                    })
                    v_subtotal += prod.price * oi.quantity

                v_tax = v_subtotal * Decimal("0.18")
                
                v_courier_info = vendor_couriers.get(v_id, {})
                v_shipping_charge = float(v_courier_info.get("rate", 50.0))
                v_courier_company_id = v_courier_info.get("courier_company_id")
                
                v_total_amount = float(v_subtotal + v_tax + Decimal(str(v_shipping_charge)))

                length = float(first_product.length) if getattr(first_product, 'length', None) else 10.0
                breadth = float(first_product.breadth) if getattr(first_product, 'breadth', None) else 10.0
                height = float(first_product.height) if getattr(first_product, 'height', None) else 10.0
                
                total_weight = 0.0
                for oi in v_items:
                    prod = oi.product
                    qty = oi.quantity
                    try:
                        w = float(prod.weight) if getattr(prod, 'weight', None) else 0.0
                    except (ValueError, TypeError):
                        w = 0.0
                    total_weight += w * qty
                if total_weight <= 0.0:
                    total_weight = 1.0

                order_payload = {
                    "order_id": f"{order.id}_V{vendor.id}",
                    "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                    "pickup_location": pickup_location,
                    "comment": f"Order #{order.id} (Vendor #{vendor.id}) checkout by {user.email}",
                    "billing_customer_name": user.first_name or user.username,
                    "billing_last_name": user.last_name or "",
                    "billing_address": shipping_address.line1 or "",
                    "billing_address_2": shipping_address.line2 or "",
                    "billing_city": shipping_address.city or "",
                    "billing_pincode": shipping_address.postal_code or "",
                    "billing_state": shipping_address.state or "",
                    "billing_country": shipping_address.country or "India",
                    "billing_email": user.email,
                    "billing_phone": billing_phone,
                    
                    "shipping_is_billing": True,
                    "shipping_customer_name": user.first_name or user.username,
                    "shipping_last_name": user.last_name or "",
                    "shipping_address": shipping_address.line1 or "",
                    "shipping_address_2": shipping_address.line2 or "",
                    "shipping_city": shipping_address.city or "",
                    "shipping_pincode": shipping_address.postal_code or "",
                    "shipping_country": shipping_address.country or "India",
                    "shipping_state": shipping_address.state or "",
                    "shipping_email": user.email,
                    "shipping_phone": billing_phone,
                    
                    "payment_method": "COD" if payment_method == "cod" else "Prepaid",
                    "order_items": sr_items,
                    
                    "sub_total": float(v_subtotal),
                    "tax_total": float(v_tax),
                    "shipping_charges": v_shipping_charge,
                    "total_amount": v_total_amount,
                    
                    "length": length,
                    "breadth": breadth,
                    "height": height,
                    "weight": total_weight
                }

                if v_courier_company_id:
                    order_payload["courier_company_id"] = str(v_courier_company_id)

                try:
                    sr_response = create_shiprocket_order(order_payload)
                    sr_message = sr_response.get("message", "")
                    sr_details = sr_response.get("details", {})
                    if not sr_message and isinstance(sr_details, dict):
                        sr_message = sr_details.get("message", "")

                    if "Wrong Pickup location" in str(sr_message) or "Wrong Pickup location" in str(sr_details):
                        suggested_locations = []
                        data_block = sr_response.get("data", {})
                        if not data_block and isinstance(sr_details, dict):
                            data_block = sr_details.get("data", {})

                        if isinstance(data_block, dict) and "data" in data_block:
                            suggested_locations = data_block["data"]
                        elif isinstance(data_block, list):
                            suggested_locations = data_block

                        matched_location = None
                        if suggested_locations:
                            for loc in suggested_locations:
                                if loc.get("status") == 1 and loc.get("phone_verified") == 1:
                                    matched_location = loc["pickup_location"]
                                    break

                        if matched_location:
                            if vendor_profile:
                                vendor_profile.pickup_location = matched_location
                                vendor_profile.save()
                            order_payload["pickup_location"] = matched_location
                            sr_response = create_shiprocket_order(order_payload)

                    if sr_response.get("shipment_id") and sr_response.get("status_code") == 1:
                        # Save tracking details to all order items for this vendor
                        for oi in v_items:
                            oi.shiprocket_order_id = str(sr_response.get("order_id", ""))
                            oi.shipment_id = str(sr_response.get("shipment_id", ""))
                            oi.awb_code = sr_response.get("awb_code", "")
                            oi.courier_name = sr_response.get("courier_name", "")
                            oi.save()

                        # For backwards compatibility with single-shipment assumptions,
                        # populate the top-level Order fields with the first vendor's shipment details
                        if not first_vendor_registered:
                            order.shiprocket_order_id = str(sr_response.get("order_id", ""))
                            order.shipment_id = str(sr_response.get("shipment_id", ""))
                            order.awb_code = sr_response.get("awb_code", "")
                            order.courier_name = sr_response.get("courier_name", "")
                            order.save()
                            first_vendor_registered = True
                except Exception as e:
                    print(f"Error registering Shiprocket order for vendor {v_id}: {e}")

        # Payment metadata & gateway trigger
        gateway_response = None
        if payment_method != 'cod':
            metadata = {"order_id": str(order.id)}
            try:
                gateway_handler = get_payment_gateway(payment_method)
                gateway_response = gateway_handler(user, float(total), metadata)
                if payment_method == 'razorpay':
                    order.payment_id = gateway_response.get("order_id")
                elif payment_method == 'stripe':
                    order.payment_id = gateway_response.get("id")
                order.save()
            except Exception as e:
                order.delete()
                raise ValidationError(str(e))



        return Response({
            "order_id": order.id,
            "amount": round(float(total)),
            "payment_method": payment_method,
            "payment_gateway_response": gateway_response,
            "shiprocket_response": sr_response,
            "message": "Checkout initiated successfully."
        }, status=status.HTTP_200_OK)
 



class UserOrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Fetch order history"""
        if request.user.is_superuser:
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')

        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(orders, request)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


    def retrieve(self, request, pk=None):
        """Retrieve specific order details"""
        if request.user.is_superuser:
            order = get_object_or_404(Order, pk=pk)  # superuser can see all
        else:
            order = get_object_or_404(Order, pk=pk, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)


    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        """Cancel order before shipping"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status in ['pending', 'paid']:
            if order.shiprocket_order_id:
                try:
                    cancel_shiprocket_order([int(order.shiprocket_order_id)])
                except Exception as e:
                    import logging
                    import traceback
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to cancel order #{order.id} on Shiprocket during customer cancellation: {str(e)}", exc_info=True)
                    traceback.print_exc()

            order.status = 'cancelled'
            order.save()
            return Response({'message': 'Order cancelled successfully.'})
        return Response({'error': 'Order cannot be cancelled at this stage.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='track')
    def track_order(self, request, pk=None):
        """Track order status"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        return Response({
            'order_id': order.id,
            'status': order.status,
            'last_updated': order.updated_at,
        })

    
@csrf_exempt
def shiprocket_webhook(request):
    if request.method != "POST":
        return JsonResponse({"detail":"method not allowed"}, status=405)
    payload = json.loads(request.body.decode("utf-8"))
    order_id = payload.get("order_id") or payload.get("order")  # check actual key
    status = payload.get("status")
    # Update your Order/Shipment models accordingly
    # Order.objects.filter(order_id=order_id).update(shipment_status=status, last_payload=payload)
    return JsonResponse({"ok": True})

class VendorOrderListView(generics.ListAPIView):
    serializer_class = VendorOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Ensure only vendors can access
        if not user.groups.filter(name="Vendor").exists():
            return Order.objects.none()

        return Order.objects.filter(items__product__vendor=user).distinct()


def resolve_shiprocket_pickup_location(current_location, error_details):
    if isinstance(error_details, dict):
        data = error_details.get("data", {})
        if isinstance(data, dict):
            # Check for nested data list structure from the test
            locations = data.get("data", [])
            if isinstance(locations, list) and locations:
                first_loc = locations[0]
                if isinstance(first_loc, dict):
                    pickup = first_loc.get("pickup_location")
                    if pickup:
                        return pickup
            pickup = data.get("pickup_location")
            if pickup:
                return pickup
    return current_location


class VendorOrderStatusUpdateView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        vendor = request.user

        # Ensure the user is a vendor
        if not vendor.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can update orders"}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the order
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch only the vendor’s items from this order
        vendor_items = OrderItem.objects.filter(order=order, product__vendor=vendor)
        if not vendor_items.exists():
            return Response(
                {"error": "You don't have any products in this order"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Calculate subtotal, tax, shipping, totals for this vendor only
            tax_rate = Decimal("0.18")
            subtotal = sum(item.price * item.quantity for item in vendor_items)
            total_tax = subtotal * tax_rate
            shipping_fee = order.shipping_cost  # shared or per vendor if you decide to split
            total_amount = subtotal + total_tax + shipping_fee
            
            # Calculate total weight for vendor items
            vendor_total_weight = 0.0
            for item in vendor_items:
                try:
                    w = float(item.product.weight) if getattr(item.product, 'weight', None) else 0.0
                except (ValueError, TypeError):
                    w = 0.0
                vendor_total_weight += w * item.quantity
            if vendor_total_weight <= 0.0:
                vendor_total_weight = 1.0

            # Customer and shipping info
            shipping_address = order.shipping_address
            customer = order.user

            if not shipping_address:
                return Response({
                    "error": "Order has no shipping address. Cannot create Shiprocket shipment.",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Debug: log the address fields being sent
            print(f"[DEBUG] Shipping address for order #{order.id}:")
            print(f"  line1: '{shipping_address.line1}'")
            print(f"  line2: '{shipping_address.line2}'")
            print(f"  city: '{shipping_address.city}'")
            print(f"  state: '{shipping_address.state}'")
            print(f"  postal_code: '{shipping_address.postal_code}'")
            print(f"  country: '{shipping_address.country}'")

            # Prepare Shiprocket payload for this vendor's portion
            vendor_profile = getattr(vendor, 'vendor_profile', None)
            if not vendor_profile:
                return Response({
                    "error": f"Vendor {vendor.username} does not have a vendor profile configured."
                }, status=status.HTTP_400_BAD_REQUEST)
            # Auto-create Shiprocket pickup location if not configured
            if not vendor_profile.pickup_location:
                from accounts.models import Address
                vendor_address = Address.objects.filter(user=vendor).first()
                if not vendor_address:
                    return Response({
                        "error": "Please add your address in Profile & KYC before confirming orders."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Generate a unique pickup location name
                pickup_name = f"VENDOR_{vendor_profile.id}"
                pickup_payload = {
                    "pickup_location": pickup_name,
                    "name": vendor_profile.company_name or vendor.username,
                    "email": vendor_profile.company_email or vendor.email,
                    "phone": format_phone_number(
                        vendor_profile.contact_number or vendor_address.phone_number or getattr(vendor, 'phone_number', None)
                    ) or "9999999999",
                    "address": vendor_address.line1 or "",
                    "address_2": vendor_address.line2 or "",
                    "city": vendor_address.city or "",
                    "state": vendor_address.state or "",
                    "country": vendor_address.country or "India",
                    "pin_code": vendor_address.postal_code or "",
                }

                print(f"[AUTO-CREATE] Creating Shiprocket pickup location: {pickup_payload}")
                try:
                    sr_pickup_response = create_pickup_location(pickup_payload)
                    print(f"[AUTO-CREATE] Shiprocket pickup response: {sr_pickup_response}")

                    if sr_pickup_response.get("error"):
                        error_details = sr_pickup_response.get("details", {})
                        if isinstance(error_details, dict) and "pickup_location" in str(error_details):
                            print(f"[AUTO-CREATE] Pickup location might already exist, proceeding with name: {pickup_name}")
                        else:
                            return Response({
                                "error": f"Failed to auto-create Shiprocket pickup location.",
                                "shiprocket_error": error_details
                            }, status=status.HTTP_400_BAD_REQUEST)

                    # Save the pickup location name to vendor profile
                    vendor_profile.pickup_location = pickup_name
                    vendor_profile.save()
                    print(f"[AUTO-CREATE] Saved pickup_location='{pickup_name}' to vendor profile #{vendor_profile.id}")

                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    return Response({
                        "error": f"Failed to register pickup location with Shiprocket: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            pickup_location = vendor_profile.pickup_location

            order_payload = {
                "order_id": f"{order.id}_V{vendor_profile.id}",  # unique per vendor
                "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                "pickup_location": pickup_location,
                "comment": f"Order #{order.id} (Vendor #{vendor_profile.id}) from {customer.email}",

                # Billing / Shipping info
                "billing_customer_name": customer.first_name or customer.username,
                "billing_last_name": customer.last_name or "",
                "billing_address": shipping_address.line1 or "",
                "billing_address_2": shipping_address.line2 or "",
                "billing_city": shipping_address.city or "",
                "billing_pincode": shipping_address.postal_code or "",
                "billing_state": shipping_address.state or "",
                "billing_country": shipping_address.country or "",
                "billing_email": customer.email,
                "billing_phone": format_phone_number(getattr(shipping_address, "phone_number", None) or getattr(customer, "phone_number", None)) or "919999999999",
                
                "shipping_is_billing": True,
                "shipping_customer_name": customer.first_name or customer.username,
                "shipping_last_name": customer.last_name or "",
                "shipping_address": shipping_address.line1 or "",
                "shipping_address_2": shipping_address.line2 or "",
                "shipping_city": shipping_address.city or "",
                "shipping_pincode": shipping_address.postal_code or "",
                "shipping_country": shipping_address.country or "",
                "shipping_state": shipping_address.state or "",
                "shipping_email": customer.email,
                "shipping_phone": format_phone_number(getattr(shipping_address, "phone_number", None) or getattr(customer, "phone_number", None)) or "919999999999",

                # Payment info
                "payment_method": "COD" if order.payment_method == "cod" else "Prepaid",

                # Vendor's products only
                "order_items": [
                    {
                        "name": item.product.name,
                        "sku": f"SKU-{item.product.id}",
                        "units": item.quantity,
                        "selling_price": float(item.price),
                        "discount": 0,
                        "hsn": getattr(item.product, "hsn", "8708"),
                        "tax": 0
                    }
                    for item in vendor_items
                ],

                # Totals
                "sub_total": float(subtotal),
                "tax_total": float(total_tax),
                "shipping_charges": float(shipping_fee),
                "total_amount": float(total_amount),

                # Package dimensions (from first item)
                "length": float(vendor_items[0].product.length) if vendor_items else 10.0,
                "breadth": float(vendor_items[0].product.breadth) if vendor_items else 10.0,
                "height": float(vendor_items[0].product.height) if vendor_items else 10.0,
                "weight": vendor_total_weight,
            }

            # ✅ Send to Shiprocket
            sr_response = create_shiprocket_order(order_payload)
            print("Shiprocket response:", sr_response)

            # ✅ If Shiprocket says "Wrong Pickup location", auto-detect the correct one and retry
            sr_message = sr_response.get("message", "")
            sr_details = sr_response.get("details", {})
            if not sr_message:
                if isinstance(sr_details, dict):
                    sr_message = sr_details.get("message", "")
                elif isinstance(sr_details, str):
                    sr_message = sr_details

            if "Wrong Pickup location" in str(sr_message):
                # Try to find the correct pickup location from Shiprocket's suggested data
                suggested_locations = []
                data_block = sr_response.get("data", {})
                if not data_block and isinstance(sr_details, dict):
                    data_block = sr_details.get("data", {})

                if isinstance(data_block, dict) and "data" in data_block:
                    suggested_locations = data_block["data"]
                elif isinstance(data_block, list):
                    suggested_locations = data_block

                vendor_email = (vendor_profile.company_email or vendor.email or "").lower()
                matched_location = None

                # Match by vendor email first
                for loc in suggested_locations:
                    if loc.get("email", "").lower() == vendor_email and loc.get("status") == 1 and loc.get("phone_verified") == 1:
                        matched_location = loc["pickup_location"]
                        break

                # Match by address line 1
                from accounts.models import Address
                vendor_address = Address.objects.filter(user=vendor).first()
                if not matched_location and vendor_address:
                    addr_line1 = (vendor_address.line1 or "").lower().strip()
                    if addr_line1:
                        for loc in suggested_locations:
                            loc_addr = loc.get("address", "").lower()
                            if addr_line1 in loc_addr and loc.get("status") == 1 and loc.get("phone_verified") == 1:
                                matched_location = loc["pickup_location"]
                                break

                # Fallback: match by seller_name
                if not matched_location:
                    vendor_company = (vendor_profile.company_name or "").lower()
                    for loc in suggested_locations:
                        if loc.get("seller_name", "").lower() == vendor_company and loc.get("status") == 1 and loc.get("phone_verified") == 1:
                            matched_location = loc["pickup_location"]
                            break

                # Fallback 2: use the first suggested pickup location in the list that is verified and active (line 1 address)
                if not matched_location and suggested_locations:
                    for loc in suggested_locations:
                        if loc.get("status") == 1 and loc.get("phone_verified") == 1:
                            matched_location = loc["pickup_location"]
                            break

                if matched_location:
                    print(f"[AUTO-FIX] Found correct Shiprocket pickup location: {matched_location}")
                    # Save the correct pickup location to vendor profile
                    vendor_profile.pickup_location = matched_location
                    vendor_profile.save()

                    # Retry the order with the correct pickup location
                    order_payload["pickup_location"] = matched_location
                    sr_response = create_shiprocket_order(order_payload)
                    print("Shiprocket retry response:", sr_response)
                else:
                    print(f"[AUTO-FIX] Could not match vendor to any Shiprocket pickup location")

            # ✅ Check if Shiprocket returned an error (after possible retry)
            if sr_response.get("error"):
                return Response({
                    "message": f"Vendor {vendor.id} items for Order #{order.id} could not be confirmed with Shiprocket",
                    "shiprocket_error": sr_response.get("details"),
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Save shipment details if successful
            shipment_id = sr_response.get("shipment_id")
            shiprocket_order_id = sr_response.get("order_id")

            if shipment_id and sr_response.get("status_code") == 1:
                from .shiprocket_client import get_shiprocket_couriers, assign_shiprocket_awb, request_shiprocket_pickup
                
                awb_code = sr_response.get("awb_code") or ""
                courier_name = sr_response.get("courier_name") or ""
                shipped_successfully = False

                # Try to automatically assign courier and schedule pickup (Ship Now)
                try:
                    couriers_data = get_shiprocket_couriers(shipment_id)
                    if couriers_data and not couriers_data.get("error"):
                        available_couriers = couriers_data.get("data", {}).get("available_courier_companies", [])
                        if available_couriers:
                            # Pick cheapest courier
                            cheapest_courier = min(available_couriers, key=lambda x: float(x.get("rate", 999999)))
                            courier_company_id = cheapest_courier.get("courier_company_id")
                            
                            # Assign AWB
                            awb_response = assign_shiprocket_awb(shipment_id, courier_company_id)
                            if not awb_response.get("error"):
                                awb_data = awb_response.get("response", {}).get("data", {})
                                awb_code = awb_data.get("awb_code") or awb_response.get("awb_code") or awb_code
                                courier_name = awb_data.get("courier_name") or awb_response.get("courier_name") or courier_name
                                
                                # Request Pickup
                                pickup_response = request_shiprocket_pickup(shipment_id)
                                if not pickup_response.get("error"):
                                    shipped_successfully = True
                                    print(f"[AUTO-SHIP] Order #{order.id} automatically shipped using courier ID {courier_company_id} AWB={awb_code}")
                except Exception as ex:
                    print(f"[AUTO-SHIP] Warning: Automatic ship-now flow encountered an error: {ex}")

                # Update database items
                target_status = "shipped" if shipped_successfully else "confirmed"
                for item in vendor_items:
                    item.status = target_status
                    item.shiprocket_order_id = str(shiprocket_order_id)
                    item.shipment_id = str(shipment_id)
                    if awb_code:
                        item.awb_code = awb_code
                    if courier_name:
                        item.courier_name = courier_name
                    item.save()

                # Update parent order
                order_status_check = "shipped" if target_status == "shipped" else "confirmed"
                all_updated = not order.items.filter(status="pending").exists()
                if all_updated:
                    order.status = order_status_check
                    order.shiprocket_order_id = str(shiprocket_order_id)
                    order.shipment_id = str(shipment_id)
                    if awb_code:
                        order.awb_code = awb_code
                    if courier_name:
                        order.courier_name = courier_name
                    order.save()

                # If auto-shipping wasn't successful, call verify_shiprocket_order to mark it as ready to ship
                verify_response = None
                if not shipped_successfully and shiprocket_order_id:
                    try:
                        verify_response = verify_shiprocket_order(shiprocket_order_id)
                        print(f"[VERIFY] Shiprocket verify response for order {shiprocket_order_id}: {verify_response}")
                    except Exception as ve:
                        print(f"[VERIFY] Warning: verify_shiprocket_order raised exception: {ve}")

                msg_status = "confirmed and automatically shipped" if shipped_successfully else "confirmed and sent to Shiprocket"
                return Response({
                    "message": f"Vendor {vendor.id} items for Order #{order.id} {msg_status}",
                    "shiprocket_response": sr_response,
                    "auto_shipped": shipped_successfully,
                    "awb_code": awb_code,
                    "courier_name": courier_name,
                    "calculation_summary": {
                        "subtotal": float(subtotal),
                        "tax": float(total_tax),
                        "shipping": float(shipping_fee),
                        "total": float(total_amount),
                        "total_weight": vendor_total_weight
                    }
                }, status=status.HTTP_200_OK)

            else:
                return Response({
                    "message": f"Vendor {vendor.id} items for Order #{order.id} could not be confirmed with Shiprocket (incomplete order creation)",
                    "shiprocket_response": sr_response
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error confirming order #{order_id} for vendor #{vendor.id}: {str(e)}", exc_info=True)
            traceback.print_exc()
            
            # Print the detailed HTTP error body from Shiprocket if available
            error_detail = None
            if hasattr(e, 'response') and e.response is not None:
                print("=== SHIPROCKET API ERROR RESPONSE ===")
                print(e.response.text)
                print("=====================================")
                try:
                    error_detail = e.response.json()
                except Exception:
                    error_detail = e.response.text

            return Response({
                "message": f"Vendor {vendor.id} items for Order #{order.id} confirmed but Shiprocket API call failed",
                "error": str(e),
                "shiprocket_error_detail": error_detail
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class MarkOrderDeliveredView(APIView):
    """
    POST /api/orders/orders/<order_id>/mark-delivered/
    Vendor or Admin manually marks an order as delivered.
    Used when Shiprocket webhook does not fire or for COD orders.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        user = request.user
        is_vendor = user.groups.filter(name="Vendor").exists()
        is_admin = user.groups.filter(name="Admin").exists() or user.is_staff

        if not (is_vendor or is_admin):
            return Response(
                {"error": "Only vendors or admins can mark an order as delivered."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Vendors can only mark orders that contain their products
        if is_vendor and not is_admin:
            has_items = OrderItem.objects.filter(order=order, product__vendor=user).exists()
            if not has_items:
                return Response(
                    {"error": "You don't have any products in this order."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Only allow transition from valid pre-delivered statuses
        allowed_from = ["shipped", "confirmed", "processing", "paid"]
        if order.status not in allowed_from:
            return Response(
                {"error": f"Cannot mark as delivered. Current status is '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "delivered"
        order.save(update_fields=["status"])

        return Response({
            "success": True,
            "message": f"Order #{order.id} has been marked as delivered.",
            "order_id": order.id,
            "status": order.status,
        }, status=status.HTTP_200_OK)


class VendorOrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        user = request.user

        # Ensure only vendors can cancel orders
        if not user.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can cancel orders"}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(id=order_id, items__product__vendor=user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        # If order is confirmed and pushed to Shiprocket, cancel it there
        if order.shiprocket_order_id:
            try:
                cancel_shiprocket_order([int(order.shiprocket_order_id)])
            except Exception as e:
                import logging
                import traceback
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to cancel order #{order.id} on Shiprocket during vendor cancellation: {str(e)}", exc_info=True)
                traceback.print_exc()

        # Update order status to cancelled
        order.status = "cancelled"
        order.save()

        return Response({"message": f"Order #{order.id} has been cancelled"}, status=status.HTTP_200_OK)



class OrderTrackingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        """
        Get Shiprocket tracking status for a specific order.
        URL: /api/orders/<order_id>/track/
        """     
        try:
            order = Order.objects.get(id=order_id)
            print(order)
        except Order.DoesNotExist:  
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if not order.awb_code:
            return Response({"error": "No AWB code available for this order."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tracking_data = track_shiprocket_order(order.awb_code)
            return Response(tracking_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InvoiceDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        pdf_file = generate_invoice_pdf(order)
        return FileResponse(pdf_file, as_attachment=True, filename=pdf_file.name)


# ═══════════════════════════════════════════════════════════════
# RETURN & REFUND WORKFLOW
# ═══════════════════════════════════════════════════════════════

class CustomerReturnRequestView(APIView):
    """
    POST /api/orders/returns/
    Customer submits a return request for a delivered order item.

    Body:
        {
            "order_item_id": <int>,
            "reason": "<string>"
        }

    Validations:
        - order belongs to the authenticated user
        - order status is 'delivered'
        - request is within the 7-day return window
        - no existing pending/approved return for this item
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from datetime import timedelta
        from django.utils import timezone

        serializer = ReturnRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_item_id = serializer.validated_data["order_item_id"]
        reason = serializer.validated_data["reason"]

        # Fetch item and verify ownership
        try:
            order_item = OrderItem.objects.select_related('order__user', 'order__shipping_address').get(
                pk=order_item_id,
                order__user=request.user,
            )
        except OrderItem.DoesNotExist:
            return Response(
                {"error": "Order item not found or does not belong to you."},
                status=status.HTTP_404_NOT_FOUND,
            )

        order = order_item.order

        # Must be delivered
        if order.status != "delivered":
            return Response(
                {"error": f"Returns are only allowed for delivered orders. Current status: '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 7-day return window
        RETURN_WINDOW_DAYS = 7
        deadline = order.updated_at + timedelta(days=RETURN_WINDOW_DAYS)
        if timezone.now() > deadline:
            return Response(
                {"error": f"Return window has closed. Returns must be requested within {RETURN_WINDOW_DAYS} days of delivery."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for existing active return
        existing = ReturnRequest.objects.filter(
            order_item=order_item,
            status__in=["pending", "approved", "picked_up"],
        ).first()
        if existing:
            return Response(
                {"error": f"A return request already exists for this item (status: '{existing.status}')."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the return request
        return_request = ReturnRequest.objects.create(
            order=order,
            order_item=order_item,
            reason=reason,
            status="pending",
        )

        # Mark order as return_request
        order.status = "return_request"
        order.save(update_fields=["status"])

        return Response(
            ReturnRequestSerializer(return_request).data,
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        """List all return requests for the authenticated customer."""
        returns = ReturnRequest.objects.filter(order__user=request.user).select_related(
            'order', 'order_item__product'
        )
        return Response(ReturnRequestSerializer(returns, many=True).data)


class VendorReturnActionView(APIView):
    """
    POST /api/orders/returns/<return_id>/action/
    Vendor approves or rejects a customer return request.

    Body:
        { "action": "approve" | "reject" }

    On approve:
        1. Calls Shiprocket's return-order API to schedule reverse pickup.
        2. Stores return AWB code, order_id, shipment_id on ReturnRequest.
        3. Sets ReturnRequest.status = 'approved'.

    On reject:
        1. Sets ReturnRequest.status = 'rejected'.
        2. Reverts order.status back to 'delivered'.

    GET /api/orders/returns/vendor/ — lists pending return requests for this vendor.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List pending return requests for the authenticated vendor."""
        vendor = request.user
        if not vendor.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can access this endpoint."}, status=status.HTTP_403_FORBIDDEN)

        returns = ReturnRequest.objects.filter(
            order_item__product__vendor=vendor,
        ).select_related('order__user', 'order__shipping_address', 'order_item__product')

        return Response(VendorReturnRequestSerializer(returns, many=True).data)

    def post(self, request, return_id):
        vendor = request.user

        if not vendor.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can action return requests."}, status=status.HTTP_403_FORBIDDEN)

        action_value = request.data.get("action", "").lower()
        if action_value not in ("approve", "reject"):
            return Response(
                {"error": "action must be 'approve' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch return request and validate vendor ownership
        try:
            return_req = ReturnRequest.objects.select_related(
                'order__user', 'order__shipping_address', 'order_item__product'
            ).get(pk=return_id, order_item__product__vendor=vendor)
        except ReturnRequest.DoesNotExist:
            return Response(
                {"error": "Return request not found or you don't have access."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if return_req.status != "pending":
            return Response(
                {"error": f"Return request is already '{return_req.status}'. Only pending requests can be actioned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── REJECT ──
        if action_value == "reject":
            return_req.status = "rejected"
            return_req.save(update_fields=["status", "updated_at"])

            # Revert order back to delivered
            return_req.order.status = "delivered"
            return_req.order.save(update_fields=["status"])

            return Response(
                {"message": "Return request rejected.", "return": ReturnRequestSerializer(return_req).data},
                status=status.HTTP_200_OK,
            )

        # ── APPROVE: call Shiprocket return order API ──
        order = return_req.order
        order_item = return_req.order_item
        product = order_item.product
        customer = order.user
        shipping_address = order.shipping_address

        if not shipping_address:
            return Response(
                {"error": "Order has no shipping address. Cannot schedule reverse pickup."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vendor profile and address
        vendor_profile = getattr(vendor, 'vendor_profile', None)
        if not vendor_profile:
            return Response(
                {"error": f"Vendor {vendor.username} does not have a vendor profile configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from accounts.models import Address
        vendor_address = Address.objects.filter(user=vendor).first()
        if not vendor_address:
            return Response(
                {"error": "Vendor has no registered address. Cannot schedule reverse pickup."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build product weight/dimensions
        try:
            weight = float(getattr(product, 'weight', None) or 0.5)
            if weight <= 0:
                weight = 0.5
        except (ValueError, TypeError):
            weight = 0.5

        try:
            length = float(getattr(product, 'length', None) or 10.0)
            breadth = float(getattr(product, 'breadth', None) or 10.0)
            height = float(getattr(product, 'height', None) or 10.0)
        except (ValueError, TypeError):
            length = breadth = height = 10.0

        subtotal = float(order_item.price * order_item.quantity)

        # Shiprocket return payload:
        #   pickup = customer's current address (where the item is)
        #   shipping (destination) = vendor's registered pickup location
        return_payload = {
            "order_id": f"RETURN-{return_req.id}-O{order.id}",
            "order_date": return_req.requested_at.strftime("%Y-%m-%d %H:%M"),

            # Customer (pickup — where the item currently is)
            "pickup_customer_name": customer.first_name or customer.username,
            "pickup_last_name": customer.last_name or "",
            "pickup_address": shipping_address.line1 or "",
            "pickup_address_2": shipping_address.line2 or "",
            "pickup_city": shipping_address.city or "",
            "pickup_state": shipping_address.state or "",
            "pickup_country": shipping_address.country or "India",
            "pickup_pincode": shipping_address.postal_code or "",
            "pickup_email": customer.email,
            "pickup_phone": format_phone_number(
                getattr(shipping_address, "phone_number", None) or getattr(customer, "phone_number", None)
            ) or "919999999999",
            "pickup_isd_code": "91",

            # Vendor (destination — their pickup/warehouse location)
            "shipping_customer_name": vendor_profile.company_name or vendor.username,
            "shipping_last_name": "",
            "shipping_address": vendor_address.line1 or "",
            "shipping_address_2": vendor_address.line2 or "",
            "shipping_city": vendor_address.city or "",
            "shipping_state": vendor_address.state or "",
            "shipping_country": vendor_address.country or "India",
            "shipping_pincode": vendor_address.postal_code or "",
            "shipping_email": vendor_profile.company_email or vendor.email,
            "shipping_phone": format_phone_number(
                vendor_profile.contact_number or getattr(vendor, "phone_number", None)
            ) or "919999999999",

            "order_items": [
                {
                    "name": product.name,
                    "sku": f"SKU-{product.id}",
                    "units": order_item.quantity,
                    "selling_price": float(order_item.price),
                    "discount": 0,
                    "hsn": getattr(product, "hsn", "8708"),
                    "tax": 0,
                }
            ],
            "payment_method": "Prepaid",
            "sub_total": subtotal,
            "length": length,
            "breadth": breadth,
            "height": height,
            "weight": weight * order_item.quantity,
        }

        try:
            sr_response = create_shiprocket_return_order(return_payload)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Shiprocket API call failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if sr_response.get("error"):
            return Response(
                {"error": "Shiprocket rejected the return order.", "details": sr_response.get("details")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save Shiprocket reverse-pickup details
        return_req.return_shiprocket_order_id = str(sr_response.get("order_id", ""))
        return_req.return_shipment_id = str(sr_response.get("shipment_id", ""))
        return_req.return_awb_code = sr_response.get("awb_code", "")
        return_req.status = "approved"
        return_req.save(update_fields=[
            "return_shiprocket_order_id", "return_shipment_id",
            "return_awb_code", "status", "updated_at",
        ])

        return Response(
            {
                "message": "Return approved. Reverse pickup scheduled with Shiprocket.",
                "return_awb_code": return_req.return_awb_code,
                "shiprocket_response": sr_response,
                "return": ReturnRequestSerializer(return_req).data,
            },
            status=status.HTTP_200_OK,
        )


class ShiprocketReturnWebhookView(APIView):
    """
    POST /api/orders/shiprocket-return-webhook/
    No authentication — called by Shiprocket when shipment status changes.

    Workflow triggered when Shiprocket fires a 'Picked Up' status event:
        1. Match AWB code → ReturnRequest
        2. Extract freight_charges from payload (fallback: settings.SHIPROCKET_RETURN_CHARGE)
        3. Compute refund_amount = item_total - freight_charges
        4. Issue refund via Razorpay (pay_xxx) or Stripe (pi_xxx)
        5. Update ReturnRequest: status='refunded', refund_id, amounts
        6. Update Order: status='refunded'

    Shiprocket webhook payload (simplified):
        {
            "awb": "<awb_code>",
            "current_status": "Picked Up",
            "freight_charges": 85.0,   ← Shiprocket's reverse shipping charge
            ...
        }
    """
    permission_classes = []  # Public endpoint called by Shiprocket

    # Shiprocket status strings that indicate the item has been collected from the customer
    PICKED_UP_STATUSES = {"Picked Up", "picked up", "PICKED UP", "PickedUp"}

    def post(self, request):
        payload = request.data

        awb_code = payload.get("awb") or payload.get("awb_code") or payload.get("AWB")
        current_status = payload.get("current_status") or payload.get("status") or ""

        if not awb_code:
            return Response({"error": "AWB code missing in webhook payload."}, status=status.HTTP_400_BAD_REQUEST)

        print(f"[RETURN WEBHOOK] AWB={awb_code!r} status={current_status!r}")

        # Only act on "Picked Up"
        if current_status not in self.PICKED_UP_STATUSES:
            return Response({"message": f"Status '{current_status}' acknowledged, no action taken."}, status=status.HTTP_200_OK)

        # Find the ReturnRequest by AWB
        try:
            return_req = ReturnRequest.objects.select_related(
                'order__user', 'order_item'
            ).get(return_awb_code=awb_code)
        except ReturnRequest.DoesNotExist:
            print(f"[RETURN WEBHOOK] No ReturnRequest found for AWB {awb_code!r}")
            return Response({"error": "Return request not found for this AWB."}, status=status.HTTP_404_NOT_FOUND)

        if return_req.status in ("picked_up", "refunded"):
            return Response({"message": "Already processed."}, status=status.HTTP_200_OK)

        # ── Mark as picked up immediately ──
        return_req.status = "picked_up"
        return_req.save(update_fields=["status", "updated_at"])

        # ── Compute Shiprocket charge (from payload or settings fallback) ──
        from decimal import Decimal
        from django.conf import settings as django_settings

        raw_freight = payload.get("freight_charges") or payload.get("freight_charge") or 0
        try:
            shiprocket_charge = Decimal(str(raw_freight))
        except Exception:
            shiprocket_charge = Decimal("0")

        if shiprocket_charge <= 0:
            # Fallback to a settings-defined default
            fallback = getattr(django_settings, "SHIPROCKET_RETURN_CHARGE", 100)
            shiprocket_charge = Decimal(str(fallback))
            print(f"[RETURN WEBHOOK] freight_charges not in payload; using fallback Rs.{shiprocket_charge}")

        # ── Compute refund amount ──
        item_total = Decimal(str(return_req.order_item.price)) * return_req.order_item.quantity
        refund_amount = max(item_total - shiprocket_charge, Decimal("0"))

        print(f"[RETURN WEBHOOK] item_total=Rs.{item_total} charge=Rs.{shiprocket_charge} refund=Rs.{refund_amount}")

        if refund_amount <= 0:
            print(f"[RETURN WEBHOOK] Refund amount is zero after deducting Shiprocket charge. Skipping refund.")
            return_req.shiprocket_shipping_charge = shiprocket_charge
            return_req.refund_amount = Decimal("0")
            return_req.status = "refunded"
            return_req.save(update_fields=["shiprocket_shipping_charge", "refund_amount", "status", "updated_at"])
            return_req.order.status = "refunded"
            return_req.order.save(update_fields=["status"])
            return Response({"message": "Pickup confirmed. Refund amount is Rs.0 after deducting Shiprocket charge."}, status=status.HTTP_200_OK)

        # ── Issue the refund ──
        order = return_req.order
        payment_method = order.payment_method
        payment_id = order.payment_id  # Razorpay: order_id / Stripe: pi_xxx
        amount_paise = int(refund_amount * 100)

        refund_id = None
        refund_error = None

        try:
            if payment_method == "razorpay":
                from payment.razorpay_payment import issue_razorpay_refund, razorpay_client as rz_client
                # Razorpay refunds need the payment ID (pay_xxx), not the order ID.
                # Fetch the payment linked to the order to get pay_xxx.
                rz_order = rz_client.order.fetch(payment_id)
                payments = rz_client.order.payments(payment_id)
                pay_id = None
                for p in payments.get("items", []):
                    if p.get("status") == "captured":
                        pay_id = p["id"]
                        break
                if not pay_id:
                    raise ValueError(f"No captured Razorpay payment found for order {payment_id}")

                refund_obj = issue_razorpay_refund(pay_id, amount_paise)
                refund_id = refund_obj.get("id")

            elif payment_method == "stripe":
                from payment.stripe_payment import issue_stripe_refund
                refund_obj = issue_stripe_refund(payment_id, amount_paise)
                refund_id = refund_obj.get("id")

            elif payment_method == "cod":
                # COD orders — refund via bank transfer / manual process
                # We log and mark as refunded; actual transfer is done offline
                refund_id = f"MANUAL-COD-{return_req.id}"
                print(f"[RETURN WEBHOOK] COD order — manual bank transfer required for Rs.{refund_amount}")

            else:
                refund_error = f"Unsupported payment method: {payment_method}"

        except Exception as e:
            import traceback
            traceback.print_exc()
            refund_error = str(e)

        if refund_error:
            print(f"[RETURN WEBHOOK] Refund failed: {refund_error}")
            return Response(
                {"error": f"Pickup confirmed but refund failed: {refund_error}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── Persist final state ──
        return_req.shiprocket_shipping_charge = shiprocket_charge
        return_req.refund_amount = refund_amount
        return_req.refund_id = refund_id
        return_req.status = "refunded"
        return_req.save(update_fields=[
            "shiprocket_shipping_charge", "refund_amount", "refund_id", "status", "updated_at",
        ])

        order.status = "refunded"
        order.save(update_fields=["status"])

        print(f"[RETURN WEBHOOK] Refund issued. ID={refund_id} amount=Rs.{refund_amount}")

        return Response(
            {
                "message": "Item picked up. Refund issued successfully.",
                "refund_id": refund_id,
                "refund_amount": float(refund_amount),
                "shiprocket_charge_deducted": float(shiprocket_charge),
            },
            status=status.HTTP_200_OK,
        )


class VendorOrderCourierListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        vendor = request.user
        if not vendor.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can view courier options"}, status=status.HTTP_403_FORBIDDEN)

        # Get vendor order items
        vendor_items = OrderItem.objects.filter(order_id=order_id, product__vendor=vendor)
        if not vendor_items.exists():
            return Response({"error": "No items found for this vendor in this order"}, status=status.HTTP_404_NOT_FOUND)

        # Find first non-empty shipment ID
        shipment_id = None
        for item in vendor_items:
            if item.shipment_id:
                shipment_id = item.shipment_id
                break

        if not shipment_id:
            return Response({"error": "Shipment ID not found. Confirm the order first to create the shipment in Shiprocket."}, status=status.HTTP_400_BAD_REQUEST)

        # Call Shiprocket serviceability
        from .shiprocket_client import get_shiprocket_couriers
        try:
            couriers_data = get_shiprocket_couriers(shipment_id)
            if couriers_data.get("error"):
                return Response({
                    "error": "Failed to get courier serviceability from Shiprocket",
                    "details": couriers_data.get("details")
                }, status=status.HTTP_400_BAD_REQUEST)
            return Response(couriers_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error calling Shiprocket: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VendorOrderShipNowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        vendor = request.user
        if not vendor.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can ship orders"}, status=status.HTTP_403_FORBIDDEN)

        raw_courier_id = request.data.get("courier_company_id")
        courier_company_id = None
        if raw_courier_id:
            try:
                courier_company_id = int(raw_courier_id)
            except (ValueError, TypeError):
                return Response({"error": "courier_company_id must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        # Get vendor order items
        vendor_items = OrderItem.objects.filter(order_id=order_id, product__vendor=vendor)
        if not vendor_items.exists():
            return Response({"error": "No items found for this vendor in this order"}, status=status.HTTP_404_NOT_FOUND)

        # Get parent order to read customer choice
        order = Order.objects.get(id=order_id)
        if not courier_company_id:
            courier_company_id = order.courier_company_id

        shipment_id = None
        for item in vendor_items:
            if item.shipment_id:
                shipment_id = item.shipment_id
                break

        if not shipment_id:
            return Response({"error": "Shipment ID not found. Confirm the order first."}, status=status.HTTP_400_BAD_REQUEST)

        from .shiprocket_client import get_shiprocket_couriers, assign_shiprocket_awb, request_shiprocket_pickup

        # If we still don't have a courier_company_id, retrieve available options and select cheapest
        if not courier_company_id:
            try:
                couriers_data = get_shiprocket_couriers(shipment_id)
                if couriers_data and not couriers_data.get("error"):
                    available_couriers = couriers_data.get("data", {}).get("available_courier_companies", [])
                    if available_couriers:
                        cheapest_courier = min(available_couriers, key=lambda x: float(x.get("rate", 999999)))
                        courier_company_id = cheapest_courier.get("courier_company_id")
            except Exception as e:
                print(f"[SHIP] Failed to retrieve fallback couriers: {e}")

        if not courier_company_id:
            return Response({"error": "Could not determine a courier partner for this shipment."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Assign AWB
            awb_response = assign_shiprocket_awb(shipment_id, courier_company_id)
            if awb_response.get("error"):
                return Response({
                    "error": "Failed to assign AWB in Shiprocket",
                    "details": awb_response.get("details")
                }, status=status.HTTP_400_BAD_REQUEST)

            awb_data = awb_response.get("response", {}).get("data", {})
            awb_code = awb_data.get("awb_code") or awb_response.get("awb_code")
            courier_name = awb_data.get("courier_name") or awb_response.get("courier_name") or "Courier"

            if not awb_code:
                awb_code = awb_response.get("response", {}).get("awb_code")

            # 2. Request Pickup
            pickup_response = request_shiprocket_pickup(shipment_id)
            if pickup_response.get("error"):
                print(f"[SHIP] Warning: Pickup scheduling failed for shipment {shipment_id}: {pickup_response.get('details')}")

            # 3. Update Database
            for item in vendor_items:
                item.status = "shipped"
                if awb_code:
                    item.awb_code = awb_code
                if courier_name:
                    item.courier_name = courier_name
                item.save()

            all_shipped_or_confirmed = not order.items.filter(status="pending").exists()
            if all_shipped_or_confirmed:
                order.status = "shipped"
                if awb_code:
                    order.awb_code = awb_code
                if courier_name:
                    order.courier_name = courier_name
                order.save()

            return Response({
                "success": True,
                "message": "Shipment created successfully.",
                "awb_code": awb_code or "",
                "courier": courier_name,
                "tracking_url": f"https://shiprocket.co/tracking/{awb_code}" if awb_code else ""
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Error calling Shiprocket: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
