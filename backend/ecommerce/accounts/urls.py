from django.urls import path, include
from rest_framework import routers
from .views import *  # make sure this is your custom viewset

router = routers.DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register('otp', OTPViewSet, basename='otp')

urlpatterns = [
    path('', include(router.urls)),
]