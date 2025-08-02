from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorListViewSet, UserListViewSet, VendorApprove

router = DefaultRouter()
router.register(r'vendors', VendorListViewSet, basename='vendor')
router.register(r'users', UserListViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('vendor/approve/<int:pk>/', VendorApprove.as_view(), name='approve-vendor'),
]