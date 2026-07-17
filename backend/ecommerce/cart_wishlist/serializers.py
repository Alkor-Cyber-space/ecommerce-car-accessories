from rest_framework import serializers
from .models import Wishlist, WishlistItem, Cart, CartItem
from products.models import Product, ProductVariant

# Shared variant serializer returning color_image URL and variant properties
class CartVariantSerializer(serializers.ModelSerializer):
    color_image = serializers.ImageField(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'weight_value', 'color_image', 'price', 'stock']

# Wishlist Item Serializer
class WishlistItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(),
        source='variant',
        write_only=True,
        required=False,
        allow_null=True
    )
    variant = CartVariantSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'wishlist', 'product', 'variant_id', 'variant', 'added_at']
        read_only_fields = ['wishlist', 'added_at']

# Wishlist Serializer
class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'created_at']
        read_only_fields = ['user']

# Cart Item Serializer
class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(),
        source='variant',
        write_only=True,
        required=False,
        allow_null=True
    )
    variant = CartVariantSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'variant_id', 'variant', 'quantity']
        read_only_fields = ['cart']

# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_weight = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_weight', 'created_at', 'updated_at']
        read_only_fields = ['user']

    def get_total_weight(self, obj):
        """Total weight of all items in the cart (kg). Optional — None if no weight data available."""
        total = 0.0
        has_weight = False
        for item in obj.items.all():
            weight = getattr(item.product, 'weight', None)
            if weight is not None:
                total += float(weight) * item.quantity
                has_weight = True
        return round(total, 3) if has_weight else None