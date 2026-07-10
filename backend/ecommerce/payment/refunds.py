import stripe
from razorpay import Client
from django.conf import settings
from payment.razorpay_payment import razorpay_client

stripe.api_key = settings.STRIPE_TEST_SECRET_KEY

def refund_stripe_payment(payment_intent_id, amount=None):
    """
    Refund a Stripe payment intent.
    If amount is provided, it should be in Decimal/float (e.g. 1500.50).
    Stripe expects amount in cents.
    """
    try:
        refund_data = {"payment_intent": payment_intent_id}
        if amount is not None:
            refund_data["amount"] = int(float(amount) * 100)
            
        refund = stripe.Refund.create(**refund_data)
        return {"success": True, "refund_id": refund.id, "status": refund.status}
    except Exception as e:
        return {"success": False, "error": str(e)}

def refund_razorpay_payment(payment_id, amount=None):
    """
    Refund a Razorpay payment.
    If amount is provided, it should be in Decimal/float (e.g. 1500.50).
    Razorpay expects amount in paise.
    """
    try:
        refund_data = {}
        if amount is not None:
            refund_data["amount"] = int(float(amount) * 100)
            
        refund = razorpay_client.refund.create(payment_id, refund_data)
        return {"success": True, "refund_id": refund.get("id"), "status": refund.get("status")}
    except Exception as e:
        return {"success": False, "error": str(e)}
