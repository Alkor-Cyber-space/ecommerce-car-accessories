from django.urls import path, include
from rest_framework import routers
from .views import *  

router = routers.DefaultRouter()
router.register(r'user', UserViewSet, basename='user')

router.register(r'vendor', VendorRegistrationViewSet, basename='vendor-registration')

router.register('otp', OTPViewSet, basename='otp')
router.register(r'password', PasswordResetViewSet, basename='password')
router.register(r'addresses', AddressViewSet, basename='addresses')

urlpatterns = [
    path('', include(router.urls)),
    path('password/reset-password/<uidb64>/<token>/', PasswordResetViewSet.as_view({'post': 'reset_password'}), name='reset-password'),
    path('social_auth/', GoogleLoginAPIView.as_view(), name='google-login'),
    path('save-fcm-token/', SaveFCMTokenView.as_view(), name='save_fcm_token'),
    path('otp-verification/',OTPVerification.as_view(),name='otp-verification'),
    path('resend-otp/',ResendOptVerification.as_view(),name='resend-otp')
]