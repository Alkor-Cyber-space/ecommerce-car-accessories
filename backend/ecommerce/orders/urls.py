from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CheckoutViewSet, UserOrderViewSet

router = DefaultRouter()
router.register(r'checkout', CheckoutViewSet, basename='orders')
router.register(r'user-orders', UserOrderViewSet, basename='user-orders')

urlpatterns = [
    path('', include(router.urls)),
]
