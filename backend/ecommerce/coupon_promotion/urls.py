from django.urls import path, include
from rest_framework import routers
from .views import *


urlpatterns = [
    path('promotion/', PromotionListCreateAPIView.as_view(), name='promotion-list-create'),
    path('promotion/<int:pk>/', PromotionListCreateAPIView.as_view(), name='promotion-detail'),
    path('promotion/all/',promotionAllAPIView.as_view(),name='promotion-all'),
    path('promotion/apply/',ApplyPromotionApiview.as_view(),name='apply-promo'),

    path('coupon/', CouponAPIView.as_view(),name='coupon-create'),
    path('coupon/<int:pk>/', CouponAPIView.as_view(),name='coupon-create-single'),
    path('coupon/apply-coupon/', ApplycouponAPIView.as_view(), name='apply-coupon'),

]   
