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
from .factory import get_gateway_verifier
from payment.razorpay_payment import verify_razorpay_payment

# Create your views here.
stripe.api_key = settings.STRIPE_TEST_SECRET_KEY




class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        internal_order_id = request.data.get("internal_order_id")  # Our DB order
        payment_method = request.data.get("payment_method")

        # Gateway-specific payment details
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")
        stripe_payment_id = request.data.get("stripe_payment_id")

        print(f"Verifying payment for order {internal_order_id} with method {payment_method}")
        print(f"Razorpay Order ID: {razorpay_order_id}, Payment ID: {razorpay_payment_id}, Signature: {razorpay_signature}")

        order = Order.objects.filter(id=internal_order_id, user=request.user).first()
        print(f"Order found: {order}")
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        verifier = get_gateway_verifier(payment_method)
        print(f"Using verifier: {verifier}")
        if payment_method == "razorpay":
            verified = verifier(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        elif payment_method == "stripe":
            verified = verifier(stripe_payment_id)
        else:
            return Response({"error": "Unsupported payment method"}, status=status.HTTP_400_BAD_REQUEST)

        if verified:
            order.status = "paid"
            print(order.status)
            order.save()
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        else:
            order.status = "failed"
            order.save()
            return Response({"status": "failed"}, status=status.HTTP_400_BAD_REQUEST)

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