import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_TEST_SECRET_KEY

def initiate_payment_intent(user,amount, metadata):
    intent = stripe.PaymentIntent.create(
        amount=int(amount * 100),  # Stripe expects the amount in cents
        currency="inr",  # Change to your desired currency
        metadata=metadata,
    )
    return {
        "id": intent.id,
        "client_secret": intent.client_secret,
    }

def verify_stripe_payment(payment_id):
    payment_intent = stripe.PaymentIntent.retrieve(payment_id)
    return payment_intent.status == "succeeded"


def issue_stripe_refund(payment_intent_id: str, amount_paise: int) -> dict:
    """
    Issue a partial or full refund via Stripe.

    Stripe refunds must reference the latest charge of a PaymentIntent.
    We retrieve the intent to find the charge ID first.

    Args:
        payment_intent_id: The Stripe PaymentIntent ID (pi_xxx) stored on Order.payment_id.
        amount_paise: Amount to refund in paise (mirrors Razorpay convention; converted to
                      Stripe's paisa-equivalent which is the same for INR — 1 rupee = 100 paisa).

    Returns:
        Stripe Refund object dict.
    """
    # Retrieve the PaymentIntent to get the latest charge
    intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    charge_id = intent.get("latest_charge")

    if not charge_id:
        raise ValueError(
            f"No charge found on Stripe PaymentIntent {payment_intent_id}. "
            "Cannot issue refund."
        )

    refund = stripe.Refund.create(
        charge=charge_id,
        amount=amount_paise,  # Stripe uses the same paisa/cent unit as Razorpay for INR
    )
    return dict(refund)