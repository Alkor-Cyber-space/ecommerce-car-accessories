from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'checkout', CheckoutViewSet, basename='orders')
router.register(r'user-orders', UserOrderViewSet, basename='user-orders')

urlpatterns = [
    path('', include(router.urls)),

    path('shiping-options',ShippingOptionsView.as_view(),name='shiping-options'),

    path('vendor/orders/', VendorOrderListView.as_view(), name='vendor-orders'),
    path("vendor/orders/<int:order_id>/confirm/", VendorOrderStatusUpdateView.as_view(), name="vendor-order-confirm"),  
    path("vendor/orders/<int:order_id>/cancel/", VendorOrderCancelView.as_view(), name="vendor-order-cancel"),
    path("orders/<int:order_id>/track/", OrderTrackingAPIView.as_view(), name="order-track"),
]
