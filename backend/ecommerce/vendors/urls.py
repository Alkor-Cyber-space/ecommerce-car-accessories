from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ProductBulkUploadViewSet,
      VendorDashboardViewSet, VendorProductViewSet,InventoryUpdateViewSet, VendorReviewViewSet
)

router = DefaultRouter()
router.register(r'dashboard', VendorDashboardViewSet, basename='vendor-dashboard')
router.register(r'products', VendorProductViewSet, basename='vendor-products')
# router.register(r'upload-products', ProductBulkUploadViewSet, basename='upload-products')
router.register(r'inventory', InventoryUpdateViewSet, basename='inventory')
router.register(r'product-reviews', VendorReviewViewSet, basename='vendor-reviews')


urlpatterns = [
    path('', include(router.urls)),
]