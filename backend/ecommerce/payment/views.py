from django.shortcuts import render
import strip
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from orders.models import Order,OrderItem
from products.models import Product
from accounts.models import CustomUser, Address
from decimal import Decimal

# Create your views here.

strip.api_key = settings.STRIP_TEST_SECRET_KEY

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