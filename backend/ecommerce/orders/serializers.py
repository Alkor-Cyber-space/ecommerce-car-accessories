from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from accounts.models import Address
from accounts.serializers import AddressSerializer
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


class UserOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items with product details and images"""
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    item_total = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    product_sku = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'product_image', 'product_price', 'unit_price', 'product_sku', 'quantity', 'item_total']

    def get_product_image(self, obj):
        """Get main product image or first available image"""
        try:
            # First try to get image marked as main
            main_image = obj.product.images.filter(is_main=True).first()
            if main_image and main_image.image:
                return main_image.image.url
            
            # Fallback: get first available image
            first_image = obj.product.images.first()
            if first_image and first_image.image:
                return first_image.image.url
                
            return None
        except Exception as e:
            return None
    
    def get_item_total(self, obj):
        """Calculate total price for this line item"""
        try:
            return str(round(float(obj.price) * obj.quantity, 2))
        except:
            return "0.00"

    def get_unit_price(self, obj):
        """Return the unit price recorded on the order (order-time price)."""
        try:
            return str(round(float(obj.price), 2))
        except:
            return "0.00"

    def get_product_sku(self, obj):
        return getattr(obj.product, 'sku', None)


class OrderSerializer(serializers.ModelSerializer):
    items = UserOrderItemSerializer(many=True, read_only=True)
    # expose full shipping address for the management UI
    shipping_address = AddressSerializer(read_only=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES)
    # helpful computed/read-only fields for UI
    subtotal = serializers.SerializerMethodField()
    user_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_info', 'subtotal', 'total_price', 'tax', 'shipping_cost',
            'status', 'created_at', 'updated_at', 'items', 'shipping_address','payment_method',
            'courier_company_id', 'shiprocket_order_id', 'shipment_id', 'courier_name', 'awb_code', 'tracking_url', 'stock_deducted'
        ]
        read_only_fields = ['user', 'user_info', 'status', 'created_at', 'updated_at', 'total_price', 'tax', 'shipping_cost', 'items', 'shiprocket_order_id', 'shipment_id', 'courier_name', 'awb_code', 'tracking_url', 'stock_deducted', 'subtotal']

    def get_subtotal(self, obj):
        try:
            return float(round((obj.total_price or Decimal('0.00')) - (obj.tax or Decimal('0.00')) - (obj.shipping_cost or Decimal('0.00')), 2))
        except Exception:
            return 0.0

    def get_user_info(self, obj):
        try:
            user = obj.user
            return {
                'id': user.id,
                'email': getattr(user, 'email', None),
                'username': getattr(user, 'username', None),
                'phone': getattr(user, 'phone_number', None),
            }
        except Exception:
            return None


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders with writable items"""
    items = OrderItemSerializer(many=True)
    shipping_address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES)
    courier_company_id = serializers.IntegerField(required=False, allow_null=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'tax', 'shipping_cost', 'courier_company_id',
            'status', 'created_at', 'updated_at', 'items', 'shipping_address','payment_method'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at', 'total_price', 'tax']

    def get_validated_data_items_subtotal(self, validated_items):
        subtotal = Decimal('0.00')
        for it in validated_items:
            product = it.get('product')
            qty = it.get('quantity', 0)
            subtotal += product.price * qty
        return subtotal

    def validate(self, data):
        # calculate and attach subtotal if items provided so that views can use it
        items = data.get('items', [])
        if items:
            data['_calculated_subtotal'] = self.get_validated_data_items_subtotal(items)
        return data

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
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone_number', read_only=True)
    shipping_address_details = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'payment_method', 'status',
            #             'courier_name', 'awb_code', 'tracking_url', 'created_at',
            # 'items', 'vendor_total_price', 'vendor_tax', 'vendor_shipping_cost',
            # 'customer_name', 'customer_email', 'customer_phone', 'shipping_address_details'


            'courier_company_id', 'shiprocket_order_id', 'shipment_id', 'shipping_cost', 'courier_name', 'awb_code', 'tracking_url', 'created_at',
            'items', 'vendor_total_price', 'vendor_tax', 'vendor_shipping_cost'
        ]

    def get_customer_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username

    def get_shipping_address_details(self, obj):
        addr = obj.shipping_address
        if addr:
            return {
                'line1': addr.line1,
                'line2': addr.line2,
                'city': addr.city,
                'state': addr.state,
                'postal_code': addr.postal_code,
                'country': addr.country,
            }
        return None

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
