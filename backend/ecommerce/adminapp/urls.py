from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorListViewSet, UserListViewSet

router = DefaultRouter()
router.register(r'vendors', VendorListViewSet, basename='vendor')
router.register(r'users', UserListViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]