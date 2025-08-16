import razorpay
from django.conf import settings
import hmac
import hashlib


razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_TEST_KEY_ID, settings.RAZORPAY_TEST_KEY_SECRET))


def initiate_razorpay_order(user, amount, metadata):
    order_data = {
        "amount": int(amount * 100),
        "currency": "INR",
        "payment_capture": 1,
        "notes": metadata,
    }
    order = razorpay_client.order.create(order_data)
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": settings.RAZORPAY_TEST_KEY_ID,
    }


def verify_razorpay_payment(order_id, payment_id, signature):
    generated_signature = hmac.new(
        settings.RAZORPAY_TEST_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    print(generated_signature)
    return generated_signature == signature
