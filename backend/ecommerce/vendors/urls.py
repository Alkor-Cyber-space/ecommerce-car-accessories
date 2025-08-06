from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductBulkUploadViewSet, VendorDashboardViewSet, VendorProductViewSet,InventoryUpdateViewSet
)

router = DefaultRouter()
router.register(r'dashboard', VendorDashboardViewSet, basename='vendor-dashboard')
router.register(r'products', VendorProductViewSet, basename='vendor-products')
router.register(r'upload-products', ProductBulkUploadViewSet, basename='upload-products')
router.register(r'inventory', InventoryUpdateViewSet, basename='inventory')


urlpatterns = [
    path('', include(router.urls)),
]