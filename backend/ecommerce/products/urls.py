
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet, basename='products')
router.register(r'browse-products', CategoryViewSet, basename='browse-products')
router.register(r'reviews', ReviewViewSet, basename='reviews')


urlpatterns = [
    path('', include(router.urls)),
]
