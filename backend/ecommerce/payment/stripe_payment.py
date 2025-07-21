import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_TEST_SECRET_KEY

def initiate_payment_intent(user,amount, metadata):
    intent = stripe.PaymentIntent.create(
        amount=int(amount * 100),  # Stripe expects the amount in cents
        currency="inr",  # Change to your desired currency
        metadata=metadata,
    )
    return{
        "client_secret": intent.client_secret,
    }