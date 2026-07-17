from django.shortcuts import render
import stripe
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from orders.models import Order,OrderItem
from products.models import Product
from accounts.models import CustomUser, Address
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework import status
from orders.models import Order
from rest_framework import permissions
from rest_framework.response import Response
from .factory import get_gateway_verifier, get_payment_gateway
from payment.razorpay_payment import verify_razorpay_payment


class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id") or request.data.get("internal_order_id")
        payment_method = request.data.get("payment_method")

        if not order_id or not payment_method:
            return Response({"error": "order_id and payment_method are required"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            gateway_handler = get_payment_gateway(payment_method)
            metadata = {"order_id": str(order.id)}
            gateway_response = gateway_handler(request.user, float(order.total_price), metadata)
            
            # Save the payment ID/Order ID to the model
            if payment_method == "razorpay":
                order.payment_id = gateway_response.get("order_id")
            elif payment_method == "stripe":
                order.payment_id = gateway_response.get("id")
            
            order.payment_method = payment_method
            order.save()

            return Response({
                "order_id": order.id,
                "amount": float(order.total_price),
                "payment_method": payment_method,
                "payment_gateway_response": gateway_response
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        internal_order_id = request.data.get("internal_order_id") or request.data.get("order_id")
        payment_method = request.data.get("payment_method")

        # Gateway-specific payment details
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")
        stripe_payment_id = request.data.get("stripe_payment_id")

        print(f"Verifying payment for order {internal_order_id} with method {payment_method}")

        order = Order.objects.filter(id=internal_order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        verifier = get_gateway_verifier(payment_method)
        if payment_method == "razorpay":
            verified = verifier(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        elif payment_method == "stripe":
            verified = verifier(stripe_payment_id)
        else:
            return Response({"error": "Unsupported payment method"}, status=status.HTTP_400_BAD_REQUEST)

        if verified:
            order.status = "paid"
            order.save()
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        else:
            order.status = "cancelled"
            order.save()
            return Response({"status": "failed"}, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id=None, payment_id=None):
        # Support lookups via URL kwargs, or query parameters
        order_id = order_id or request.query_params.get("order_id") or request.query_params.get("internal_order_id")
        payment_id = payment_id or request.query_params.get("payment_id")

        order = None
        if order_id:
            order = Order.objects.filter(id=order_id, user=request.user).first()
        elif payment_id:
            order = Order.objects.filter(payment_id=payment_id, user=request.user).first()

        if not order:
            return Response({"error": "Order/Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        # Dynamically sync payment status with the gateway if currently pending
        if order.status == "pending" and order.payment_id:
            if order.payment_method == "stripe":
                try:
                    import stripe
                    stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
                    intent = stripe.PaymentIntent.retrieve(order.payment_id)
                    if intent.status == "succeeded":
                        order.status = "paid"
                        order.save()
                    elif intent.status in ["canceled", "requires_payment_method"]:
                        order.status = "cancelled"
                        order.save()
                except Exception as e:
                    print(f"Error auto-verifying Stripe payment {order.payment_id}: {e}")

            elif order.payment_method == "razorpay":
                try:
                    import razorpay
                    client = razorpay.Client(auth=(settings.RAZORPAY_TEST_KEY_ID, settings.RAZORPAY_TEST_KEY_SECRET))
                    rz_order = client.order.fetch(order.payment_id)
                    if rz_order.get("status") == "paid":
                        order.status = "paid"
                        order.save()
                except Exception as e:
                    print(f"Error auto-verifying Razorpay order {order.payment_id}: {e}")

        return Response({
            "order_id": order.id,
            "payment_id": order.payment_id,
            "payment_method": order.payment_method,
            "status": order.status,
            "total_price": float(order.total_price)
        }, status=status.HTTP_200_OK)


class InitiateCODPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id") or request.data.get("internal_order_id")
        if not order_id:
            return Response({"error": "order_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        order.payment_method = 'cod'
        order.status = 'pending'
        order.save()  # Triggers stock deduction if COD by saving the order again

        return Response({
            "order_id": order.id,
            "payment_method": order.payment_method,
            "status": order.status,
            "total_price": float(order.total_price),
            "message": "COD payment initiated/selected successfully."
        }, status=status.HTTP_200_OK)


class ConfirmCODPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id") or request.data.get("internal_order_id")
        if not order_id:
            return Response({"error": "order_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_method != 'cod':
            return Response({"error": "Not a COD order"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'paid'
        order.save()

        return Response({
            "order_id": order.id,
            "status": order.status,
            "message": "COD payment/order confirmed successfully."
        }, status=status.HTTP_200_OK)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        metadata = intent.get("metadata", {})

        try:
            user = CustomUser.objects.get(id=metadata["user_id"])
            address = Address.objects.get(id=metadata["shipping_address"])
        except Exception:
            return HttpResponse(status=400)

        subtotal = Decimal("0.00")
        tax_rate = Decimal("0.18")
        shipping_fee = Decimal("50.00")

        order = Order.objects.create(
            user=user,
            shipping_address=address,
            payment_method=metadata["payment_method"],
            total_price=0,
            status="paid"
        )

        i = 0
        while f"product_{i}" in metadata:
            product = Product.objects.get(id=metadata[f"product_{i}"])
            quantity = int(metadata[f"quantity_{i}"])
            subtotal += product.price * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )
            i += 1

        tax = subtotal * tax_rate
        total = subtotal + tax + shipping_fee
        order.tax = tax
        order.shipping_cost = shipping_fee
        order.total_price = total
        order.save()

        return JsonResponse({"status": "success"})

    return HttpResponse(status=200)