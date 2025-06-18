from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WishlistViewSet, CartViewSet, CartItemViewSet

router = DefaultRouter()
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-item', CartItemViewSet, basename='cartitem')

urlpatterns = [
    path('', include(router.urls)),
]