from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'vendors', VendorListViewSet, basename='vendor')
router.register(r'users', UserListViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('vendor/approve/<int:pk>/', VendorApprove.as_view(), name='approve-vendor'),
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('create_admin/', CreateAdminUserAPIView.as_view(), name='create-admin'),
    path('list_admins/', AdminUserListAPIView.as_view(), name='list_admin_users'),
]