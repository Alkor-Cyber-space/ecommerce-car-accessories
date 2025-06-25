from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, UserOrderViewSet

router = DefaultRouter()
router.register(r'checkout', OrderViewSet, basename='orders')
router.register(r'user-orders', UserOrderViewSet, basename='user-orders')

urlpatterns = [
    path('', include(router.urls)),
]