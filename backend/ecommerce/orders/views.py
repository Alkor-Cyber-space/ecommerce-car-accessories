from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Order,OrderItem
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
        Calculate available shipping rates from Shiprocket — per vendor.
        Pickup postcode is auto-resolved from each vendor's saved address.

        Request:
        {
            "product_ids": [1, 2, 3],     ← list of product IDs in the order
            "delivery_postcode": "411001", ← customer pincode
            "cod": 1,                      ← 1=COD, 0=Prepaid
            "quantities": {"1": 2, "2": 1} ← optional: qty per product_id
        }

        Response:
        {
            "vendors": [
                {
                    "vendor_id": 3,
                    "vendor_name": "Auto Parts Co",
                    "pickup_postcode": "400001",
                    "total_weight": 4.0,
                    "options": [
                        {
                            "courier_name": "Bluedart",
                            "rate": 120.0,
                            "etd": "2026-07-19 23:59:00",
                            "courier_company_id": 127
                        }
                    ]
                }
            ]
        }
        """
        from products.models import Product
        from accounts.models import Address

        product_ids = request.data.get("product_ids", [])
        delivery_postcode = request.data.get("delivery_postcode")
        cod = int(request.data.get("cod", 0))
        quantities = request.data.get("quantities", {})  # {"product_id": qty}

        if not product_ids:
            return Response({"error": "product_ids is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not delivery_postcode:
            return Response({"error": "delivery_postcode is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch all products
        products = Product.objects.filter(id__in=product_ids).select_related("vendor")
        if not products.exists():
            return Response({"error": "No valid products found"}, status=status.HTTP_400_BAD_REQUEST)

        # Group products by vendor
        vendor_products_map = {}
        for product in products:
            vendor = product.vendor
            if vendor.id not in vendor_products_map:
                vendor_products_map[vendor.id] = {
                    "vendor": vendor,
                    "products": [],
                }
            vendor_products_map[vendor.id]["products"].append(product)

        results = []
        for vendor_id, data in vendor_products_map.items():
            vendor = data["vendor"]
            vendor_products = data["products"]

            # Resolve pickup postcode from vendor's saved address
            vendor_address = Address.objects.filter(user=vendor).first()
            pickup_postcode = vendor_address.postal_code if vendor_address and vendor_address.postal_code else None

            if not pickup_postcode:
                results.append({
                    "vendor_id": vendor.id,
                    "vendor_name": getattr(getattr(vendor, "vendor_profile", None), "company_name", None) or vendor.username,
                    "pickup_postcode": None,
                    "total_weight": None,
                    "options": [],
                    "error": "Vendor has no address — pickup postcode unavailable",
                })
                continue

            # Calculate total weight from product weights × quantities
            total_weight = 0.0
            has_weight = False
            # Use max dimensions from vendor's products for parcel size
            max_length = max_breadth = max_height = 10.0
            for product in vendor_products:
                qty = int(quantities.get(str(product.id), 1))
                w = getattr(product, "weight", None)
                if w is not None:
                    total_weight += float(w) * qty
                    has_weight = True
                l = getattr(product, "length", None)
                b = getattr(product, "breadth", None)
                h = getattr(product, "height", None)
                if l: max_length = max(max_length, float(l))
                if b: max_breadth = max(max_breadth, float(b))
                if h: max_height = max(max_height, float(h))

            total_weight = round(total_weight, 3) if has_weight else 0.5  # default 500g

            payload = {
                "pickup_postcode": pickup_postcode,
                "delivery_postcode": delivery_postcode,
                "weight": total_weight,
                "cod": cod,
                "length": max_length,
                "breadth": max_breadth,
                "height": max_height,
            }
            print(f"[ShippingOptions] Vendor #{vendor.id} → pickup: {pickup_postcode}, payload: {payload}")

            try:
                rates = calculate_shipping_rate(payload)
                options = []
                if rates.get("data") and "available_courier_companies" in rates["data"]:
                    for courier in rates["data"]["available_courier_companies"]:
                        options.append({
                            "courier_name": courier["courier_name"],
                            "rate": float(courier["rate"]),
                            "etd": courier.get("etd"),
                            "courier_company_id": courier["courier_company_id"],
                        })

                results.append({
                    "vendor_id": vendor.id,
                    "vendor_name": getattr(getattr(vendor, "vendor_profile", None), "company_name", None) or vendor.username,
                    "pickup_postcode": pickup_postcode,
                    "total_weight": total_weight,
                    "options": options,
                })

            except Exception as e:
                results.append({
                    "vendor_id": vendor.id,
                    "vendor_name": getattr(getattr(vendor, "vendor_profile", None), "company_name", None) or vendor.username,
                    "pickup_postcode": pickup_postcode,
                    "total_weight": total_weight,
                    "options": [],
                    "error": str(e),
                })

        return Response({"vendors": results}, status=status.HTTP_200_OK)




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
        shipping_fee = Decimal(str(request.data.get("shipping_fee", "0.00")))
        courier_company_id = request.data.get("courier_company_id")
        apply_coup_amt = Decimal(str(request.data.get("Apply_coup_Amt", "0.00")))

        for item in items:
            product = item['product']
            quantity = item['quantity']
            subtotal += product.price * quantity

        tax = subtotal * tax_rate
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
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['product'].price
            )

        # Trigger stock deduction if COD by saving the order again
        if payment_method == 'cod':
            order.save()

        # Shiprocket Order Registration & Courier Slot Reservation
        sr_response = None
        if items and shipping_address:
            first_product = items[0]['product']
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

            sr_items = []
            for item in items:
                prod = item['product']
                sr_items.append({
                    "name": prod.name,
                    "sku": f"SKU-{prod.id}",
                    "units": item['quantity'],
                    "selling_price": float(prod.price),
                    "discount": 0,
                    "tax": 0,
                    "hsn": getattr(prod, "hsn", "8708")
                })

            length = float(first_product.length) if getattr(first_product, 'length', None) else 10.0
            breadth = float(first_product.breadth) if getattr(first_product, 'breadth', None) else 10.0
            height = float(first_product.height) if getattr(first_product, 'height', None) else 10.0
            weight = float(first_product.weight) if getattr(first_product, 'weight', None) else 1.0

            billing_phone = format_phone_number(
                getattr(shipping_address, "phone_number", None) or getattr(user, "phone_number", None)
            ) or "919999999999"

            order_payload = {
                "order_id": str(order.id),
                "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                "pickup_location": pickup_location,
                "comment": f"Order #{order.id} checkout by {user.email}",
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
                
                "sub_total": float(subtotal),
                "tax_total": float(tax),
                "shipping_charges": float(shipping_fee),
                "total_amount": float(total),
                
                "length": length,
                "breadth": breadth,
                "height": height,
                "weight": weight
            }

            if courier_company_id:
                order_payload["courier_company_id"] = str(courier_company_id)

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
                    order.shiprocket_order_id = str(sr_response.get("order_id", ""))
                    order.shipment_id = str(sr_response.get("shipment_id", ""))
                    order.awb_code = sr_response.get("awb_code", "")
                    order.courier_name = sr_response.get("courier_name", "")
                    order.save()
            except Exception as e:
                sr_response = {"error": True, "message": str(e)}

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
            total_amount = subtotal + total_tax + shipping_fee            # Customer and shipping info
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
                "weight": float(vendor_items[0].product.weight) if vendor_items else 1.0,
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
            if sr_response.get("shipment_id") and sr_response.get("status_code") == 1:
                # Update individual vendor items in this order
                for item in vendor_items:
                    item.status = "confirmed"
                    item.shiprocket_order_id = str(sr_response.get("order_id", ""))
                    item.shipment_id = str(sr_response.get("shipment_id", ""))
                    item.awb_code = sr_response.get("awb_code", "")
                    item.courier_name = sr_response.get("courier_name", "")
                    item.save()

                # Check if all items in the order are now confirmed
                all_items_confirmed = not order.items.filter(status="pending").exists()
                if all_items_confirmed:
                    order.status = "confirmed"
                    order.shiprocket_order_id = str(sr_response.get("order_id", ""))
                    order.shipment_id = str(sr_response.get("shipment_id", ""))
                    order.awb_code = sr_response.get("awb_code", "")
                    order.courier_name = sr_response.get("courier_name", "")
                    order.save()

                # ✅ AUTO-VERIFY: Push order to "Ready to Ship" on Shiprocket dashboard
                shiprocket_order_id = sr_response.get("order_id")
                verify_response = None
                if shiprocket_order_id:
                    try:
                        verify_response = verify_shiprocket_order(shiprocket_order_id)
                        print(f"[VERIFY] Shiprocket verify response for order {shiprocket_order_id}: {verify_response}")
                        if verify_response.get("error"):
                            print(f"[VERIFY] Warning: Could not auto-verify order {shiprocket_order_id} on Shiprocket: {verify_response.get('details')}")
                    except Exception as ve:
                        print(f"[VERIFY] Warning: verify_shiprocket_order raised exception: {ve}")

                return Response({
                    "message": f"Vendor {vendor.id} items for Order #{order.id} confirmed and sent to Shiprocket",
                    "shiprocket_response": sr_response,
                    "shiprocket_verify_response": verify_response,
                    "calculation_summary": {
                        "subtotal": float(subtotal),
                        "tax": float(total_tax),
                        "shipping": float(shipping_fee),
                        "total": float(total_amount)
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
