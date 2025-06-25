from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductBulkUploadViewSet, VendorDashboardViewSet, VendorProductViewSet, VendorCategoryViewSet,
    VendorVehicleMakeViewSet, VendorVehicleModelViewSet,
    VendorYearViewSet, VendorVariantViewSet,
    VendorModelYearViewSet, VendorVariantYearViewSet,
)

router = DefaultRouter()
router.register(r'dashboard', VendorDashboardViewSet, basename='vendor-dashboard')
router.register(r'products', VendorProductViewSet, basename='vendor-products')
router.register(r'categories', VendorCategoryViewSet, basename='vendor-categories')
router.register(r'vehicle-makes', VendorVehicleMakeViewSet, basename='vendor-vehicle-makes')
router.register(r'vehicle-models', VendorVehicleModelViewSet, basename='vendor-vehicle-models')
router.register(r'years', VendorYearViewSet, basename='vendor-years')
router.register(r'variants', VendorVariantViewSet, basename='vendor-variants')
router.register(r'model-years', VendorModelYearViewSet, basename='vendor-model-years')
router.register(r'variant-years', VendorVariantYearViewSet, basename='vendor-variant-years')
router.register(r'upload-products', ProductBulkUploadViewSet, basename='upload-products')


urlpatterns = [
    path('', include(router.urls)),
]