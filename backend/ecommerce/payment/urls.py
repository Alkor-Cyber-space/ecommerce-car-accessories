from django.urls import path
from .views import stripe_webhook
from .views import VerifyPaymentView

urlpatterns = [
    path('stripe/webhook/', stripe_webhook),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
]