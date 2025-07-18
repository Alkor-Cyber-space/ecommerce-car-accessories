from .stripe_payment import initiate_payment_intent
# from .razorpay_gateway import initiate_razorpay_payment

def get_payment_gateway(payment_method):
    if payment_method == 'stripe':
        return initiate_payment_intent
    # elif method == "razorpay":     
    #     return initiate_razorpay_payment
    else:
        raise ValueError("Unsupported payment method")
