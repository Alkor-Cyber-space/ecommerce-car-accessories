from django.urls import path, include
from rest_framework import routers
from .views import *  # make sure this is your custom viewset

router = routers.DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register('otp', OTPViewSet, basename='otp')
router.register(r'password', PasswordResetViewSet, basename='password')
router.register(r'addresses', AddressViewSet, basename='addresses')

urlpatterns = [
    path('', include(router.urls)),
    path('password/reset-password/<uidb64>/<token>/', PasswordResetViewSet.as_view({'post': 'reset_password'}), name='reset-password'),
]