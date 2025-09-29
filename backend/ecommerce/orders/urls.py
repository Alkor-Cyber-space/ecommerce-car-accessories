from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'checkout', CheckoutViewSet, basename='orders')
router.register(r'user-orders', UserOrderViewSet, basename='user-orders')

urlpatterns = [
    path('', include(router.urls)),
    path('vendor/orders/', VendorOrderListView.as_view(), name='vendor-orders'),
]
