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
    path("vendor/orders/<int:order_id>/couriers/", VendorOrderCourierListView.as_view(), name="vendor-order-couriers"),
    path("vendor/orders/<int:order_id>/ship/", VendorOrderShipNowView.as_view(), name="vendor-order-ship"),
    path("orders/<int:order_id>/track/", OrderTrackingAPIView.as_view(), name="order-track"),
    # path("orders/<int:order_id>/invoice/", InvoiceDownloadView.as_view(), name="download_invoice"),

    # ── Return & Refund Workflow ──
    # Customer: POST to create, GET to list own returns
    path("returns/", CustomerReturnRequestView.as_view(), name="customer-return-request"),

    # Vendor: GET to list all returns for their products; POST <return_id>/action/ to approve/reject
    path("returns/vendor/", VendorReturnActionView.as_view(), name="vendor-return-list"),
    path("returns/<int:return_id>/action/", VendorReturnActionView.as_view(), name="vendor-return-action"),

    # Shiprocket webhook — fires when reverse pickup item is collected from customer
    path("shiprocket-return-webhook/", ShiprocketReturnWebhookView.as_view(), name="shiprocket-return-webhook"),
]
