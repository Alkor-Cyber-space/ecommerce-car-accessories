from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from accounts.models import Address
from products.models import Product


class OrderItemSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    shipping_address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'tax', 'shipping_cost',
            'status', 'created_at', 'updated_at', 'items', 'shipping_address','payment_method'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at', 'total_price', 'tax', 'shipping_cost']
