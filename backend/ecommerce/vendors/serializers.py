from rest_framework import serializers
from products.models import Product, Category, Review

from products.serializers import ProductSerializer, CategorySerializer


class VendorDashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    recent_products = ProductSerializer(many=True)
    registration_complete = serializers.BooleanField()
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_users = serializers.IntegerField()
    total_vendors = serializers.IntegerField()




class ProductStockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'stock']


class ProductForReviewSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'product_image']

    def get_product_image(self, obj):
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            return main_image.image.url
        # fallback to first image
        first_image = obj.images.first()
        return first_image.image.url if first_image else None
        

class VendorReviewSerializer(serializers.ModelSerializer):
    product = ProductForReviewSerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user_name', 'user_email', 'rating', 'comment', 'created_at']