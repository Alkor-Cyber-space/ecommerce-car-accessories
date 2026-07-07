
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
# router.register(r'products', ProductViewSet, basename='products')
router.register(r'browse-products', CategoryViewSet, basename='browse-products')
router.register(r'reviews', ReviewViewSet, basename='reviews')


urlpatterns = [
    path('', include(router.urls)),
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('vehicle-category-products/', VehicleCategoryProductsAPIView.as_view(), name='vehicle-category-products'),
    path('dashboard/', UserDashboardView.as_view(), name='user-dashboard'),
    path('category/', CategoryListAPIView.as_view(), name='product-list'),
    path('search/', ProductSearchAPIView.as_view(), name='product-search'),
    # path('vehicle-specific/', VehicleProductSearchViewSet.as_view({'get': 'vehicle_specific'}), name='vehicle-specific-search'),
    path('new-category-request',VendorCategoryRequest.as_view(),name="new-category-request"),
    path('new-request-approve',VendorCategoryApprove.as_view(),name="new-request-approve"),
    path('reviews/<int:review_id>/reply/', ReviewReplyView.as_view(), name='review-reply'),
]
