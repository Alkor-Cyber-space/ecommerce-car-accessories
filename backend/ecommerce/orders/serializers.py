from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from accounts.models import Address
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    shipping_address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'tax', 'shipping_cost',
            'status', 'created_at', 'updated_at', 'items', 'shipping_address'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at', 'total_price', 'tax', 'shipping_cost']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        shipping_address = validated_data.pop('shipping_address')

        # Default rates
        tax_rate = Decimal('0.18')  # 18% GST
        flat_shipping_fee = Decimal('50.00')

        subtotal = Decimal('0.00')
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            total_price=0,  # will be updated below
        )

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            price = product.price * quantity
            subtotal += price
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price=product.price)

        tax_amount = subtotal * tax_rate
        total = subtotal + tax_amount + flat_shipping_fee

        order.tax = tax_amount
        order.shipping_cost = flat_shipping_fee
        order.total_price = total
        order.save()

        return order