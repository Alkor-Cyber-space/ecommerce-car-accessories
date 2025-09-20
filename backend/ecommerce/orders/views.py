from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Order,OrderItem
from .serializers import OrderSerializer
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
from .shiprocket_client import calculate_shipping_rate
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

        # Create pending order in DB
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            tax=tax,
            shipping_cost=shipping_fee,
            total_price=total,
            status="pending",
            payment_method=payment_method,
            courier_company_id = courier_company_id
        )

        for item in items:
            product = item['product']
            quantity = item['quantity']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )

        # Metadata to pass to payment provider
        metadata = {"order_id": str(order.id)}

        try:
            gateway_handler = get_payment_gateway(payment_method)
            gateway_response = gateway_handler(user, float(total), metadata)
        except Exception as e:
            raise ValidationError(str(e))

        return Response({
            "amount": float(total),
            "payment_gateway_response": gateway_response,
            "order_id": order.id
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