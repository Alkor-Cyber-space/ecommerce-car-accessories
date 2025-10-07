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


class ShippingOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Calculate available shipping rates from Shiprocket.
        Expects:
        {
            "pickup_postcode": "400001",
            "delivery_postcode": "411001",
            "weight": 2.0,
            "cod": 1,
            "declared_value": 999
        }
        """
        payload = {
            "pickup_postcode": request.data.get("pickup_postcode"),
            "delivery_postcode": request.data.get("delivery_postcode"),
            "weight": float(request.data.get("weight", 0.5)),
            "cod": int(request.data.get("cod", 0)),
            "declared_value": float(request.data.get("declared_value", 0)),
        }
        print(payload)

        try:
            rates = calculate_shipping_rate(payload)
            if rates.get("data") and "available_courier_companies" in rates["data"]:
                options = []
                for courier in rates["data"]["available_courier_companies"]:
                    options.append({
                        "courier_name": courier["courier_name"],
                        "rate": Decimal(str(courier["rate"])),
                        "etd": courier.get("etd"),  # estimated days
                        "courier_company_id": courier["courier_company_id"],
                    })
                return Response({"options": options}, status=status.HTTP_200_OK)

            return Response({"error": "No couriers available"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        serializer = OrderSerializer(data=request.data, context={'request': request})
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

        for item in items:
            product = item['product']
            quantity = item['quantity']
            subtotal += product.price * quantity

        tax = subtotal * tax_rate
        total = subtotal + tax + shipping_fee

        # Create pending order
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            tax=tax,
            shipping_cost=shipping_fee,
            total_price=total,
            status="pending",
            payment_method=payment_method,
            courier_company_id=courier_company_id
        )

        # Save order items
        order_items = []
        for item in items:
            product = item['product']
            quantity = item['quantity']
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )
            order_items.append(order_item)

        # Build dynamic Shiprocket payload
        try:
            order_payload = {
                "order_id": str(order.id),  # DB order ID
                "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                "pickup_location": "VENDOR_2",   # you can map vendor pickup locations if you store them
                "channel_id": "",  # leave blank unless marketplace
                "comment": f"Order #{order.id} from {user.email}",

                # Billing/Shipping info (from Address model)
                "billing_customer_name": user.first_name or user.username,
                "billing_last_name": user.last_name or "",
                "billing_address": shipping_address.line1,
                "billing_address_2": shipping_address.line2 or "",
                "billing_city": shipping_address.city,
                "billing_pincode": shipping_address.postal_code,
                "billing_state": shipping_address.state,
                "billing_country": shipping_address.country,
                "billing_email": user.email,
                "billing_phone": getattr(user, "phone_number", "9999999999"),  # fallback

                "courier_company_id": str(courier_company_id or ""),
                "shipping_is_billing": True,
                
                # Products in the order
                "order_items": [
                    {
                        "name": item.product.name,
                        "sku": f"SKU-{item.product.id}",
                        "units": item.quantity,
                        "selling_price": float(item.price),
                        "discount": 0,
                        "tax": float(item.price) * float(tax_rate),
                    }
                    for item in order_items
                ],

                "payment_method": "COD" if payment_method == "cod" else "Prepaid",
                "sub_total": float(subtotal),
                
                # Package dimensions (taking first product as ref or you can calculate max)
                "length": float(order_items[0].product.length) if order_items else 10,
                "breadth": float(order_items[0].product.breadth) if order_items else 10,
                "height": float(order_items[0].product.height) if order_items else 10,
                "weight": float(order_items[0].product.weight) if order_items else 1.0,
            }
            print(f"order_payload:{order_payload}")

            print("before sr_response")
            sr_response = create_shiprocket_order(order_payload)
            print("Shiprocket response:", sr_response)
            print("after sr_response")

            if sr_response.get("shipment_id") and sr_response.get("status_code") == 1:
                order.shiprocket_order_id = str(sr_response.get("order_id", ""))
                order.awb_code = sr_response.get("awb_code", "")  # may be empty initially
                shipment_id = sr_response.get("shipment_id")
                order.courier_name = sr_response.get("courier_name", "")
                order.status = "pending"  # or map status if Shiprocket returns
                order.save()
            else:
                sr_response["error"] = "Shiprocket order not created. Check payload or credentials."

            if not sr_response.get("shipment_id") or sr_response.get("status_code") != 1:
                sr_response["error"] = "Shiprocket order not created. Check payload or credentials."

        except Exception as e:
            sr_response = {"error": str(e)}

        # Metadata for payment provider
        metadata = {"order_id": str(order.id)}

        try:
            gateway_handler = get_payment_gateway(payment_method)
            gateway_response = gateway_handler(user, float(total), metadata)
        except Exception as e:
            raise ValidationError(str(e))

        return Response({
            "amount": float(total),
            "payment_gateway_response": gateway_response,
            "order_id": order.id,
            "shiprocket_response": sr_response
        }, status=status.HTTP_200_OK)

class UserOrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Fetch order history"""
        if request.user.is_superuser:
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')

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


class VendorOrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request, order_id):
        user = request.user

        if not user.groups.filter(name="Vendor").exists():
            return Response({"error":"Only vendors can update orders"}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(id=order_id, items__product__vendor=user)
        except Order.DoesNotExist:
            return Response({"error":"Order not found or access denied"}, status=status.HTTP_404_NOT_FOUND)
        
        order.status = "confirmed"
        order.save()

        return Response({"message": f"Order #{order.id} has been confirmed"}, status=status.HTTP_200_OK)


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
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if not order.awb_code:
            return Response({"error": "No AWB code available for this order."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tracking_data = track_shiprocket_order(order.awb_code)
            return Response(tracking_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)