from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from accounts.models import Address
from products.models import Product,ProductImage


class OrderItemSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        product = attrs.get('product')
        quantity = attrs.get('quantity')
        
        if not product.is_available:
            raise serializers.ValidationError(f"Product '{product.name}' is not available.")
        
        if product.stock < quantity:
            raise serializers.ValidationError(
                f"Insufficient stock for '{product.name}'. Available: {product.stock}, requested: {quantity}."
            )
        return attrs


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

class VendorOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    product_size = serializers.CharField(source='product.size', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'product_size', 'product_price', 'quantity', 'total_price']

    def get_product_image(self, obj):
        a = obj.product.images.all()
        main_image = obj.product.images.filter(is_main=True).first()
        if main_image:
            return main_image.image.url
        return None
    
    def get_total_price(self, obj):
        return round(obj.price * obj.quantity, 2)


class VendorOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    vendor_total_price = serializers.SerializerMethodField()
    vendor_tax = serializers.SerializerMethodField()
    vendor_shipping_cost = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'payment_method', 'status',
            'courier_name', 'awb_code', 'tracking_url', 'created_at',
            'items', 'vendor_total_price', 'vendor_tax', 'vendor_shipping_cost'
        ]

    def get_items(self, obj):
        vendor = self.context['request'].user
        items = obj.items.filter(product__vendor=vendor)
        return VendorOrderItemSerializer(items, many=True, context=self.context).data

    def get_vendor_total_price(self, obj):
        vendor = self.context['request'].user
        items = obj.items.filter(product__vendor=vendor)
        total = sum(item.price * item.quantity for item in items)
        return round(total, 2)

    def get_vendor_tax(self, obj):
        # Example logic: assume 18% tax on vendor subtotal
        vendor = self.context['request'].user
        items = obj.items.filter(product__vendor=vendor)
        subtotal = sum(item.price * item.quantity for item in items)
        tax = subtotal * Decimal('0.18')  # 18% GST, adjust as needed
        return round(tax, 2)

    def get_vendor_shipping_cost(self, obj):
        vendor = self.context['request'].user
        items = obj.items.filter(product__vendor=vendor)
        # You can modify this rule as per your logic (flat rate, per item, etc.)
        return Decimal('100.00') if items.exists() else Decimal('0.00')
