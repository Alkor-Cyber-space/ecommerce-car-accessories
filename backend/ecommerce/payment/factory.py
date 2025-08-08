from .stripe_payment import initiate_payment_intent
from .razorpay_payment import initiate_razorpay_order, verify_razorpay_payment

def get_payment_gateway(payment_method):
    if payment_method == 'stripe':
        return initiate_payment_intent
    elif payment_method == 'razorpay':
        return initiate_razorpay_order
    else:
        raise ValueError("Unsupported payment method")


def get_gateway_verifier(payment_method):
    if payment_method == "stripe":
        return verify_stripe_payment
    elif payment_method == "razorpay":
        return verify_razorpay_payment
    else:
        raise ValueError("Unsupported payment method")