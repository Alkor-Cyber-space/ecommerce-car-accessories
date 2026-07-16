from rest_framework import serializers
from .models import *
from products.models import *
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils import timezone


class PromrotionSerializers(serializers.ModelSerializer):
    value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    class Meta:
        model = Promotion
        fields = '__all__'

class categorySerilzier(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "discription", "image", "available"]

class ProductSerilaizer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "description", "price", "stock"]

class PromotionReadSerializer(serializers.ModelSerializer):
    applicable_product = ProductSerilaizer(many=True, read_only=True)
    applicable_category = categorySerilzier(many=True, read_only=True)

    class Meta:
        model = Promotion
        fields = [
            "id", "name", "code", "description", "promotion_type", "value",
            "start_date", "end_date", "activate", "price_range",
            "applicable_product", "applicable_category"
        ]

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = "__all__"

class productSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'is_available']


# ── Updated: Cart-based coupon apply (no product_id needed) ───────────────────
class ApplyCartCouponSerializer(serializers.Serializer):
    """
    User only enters the coupon code.
    The backend fetches the user's cart, calculates the cart total,
    and applies the discount if eligible.
    """
    coupon_code = serializers.CharField(max_length=255)

    def validate(self, data):
        from cart_wishlist.models import Cart, CartItem

        # 1. Get coupon
        try:
            coupon = Coupon.objects.get(code=data['coupon_code'])
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})

        # 2. Check coupon validity (active + date range)
        if not coupon.is_valid():
            raise serializers.ValidationError({"coupon_code": "Coupon is expired or inactive."})

        # 3. Get the user's cart (user passed via context from view)
        user = self.context['request'].user
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError({"cart": "Your cart is empty. Add products before applying a coupon."})

        cart_items = CartItem.objects.filter(cart=cart).select_related('product')
        if not cart_items.exists():
            raise serializers.ValidationError({"cart": "Your cart is empty. Add products before applying a coupon."})

        # 4. If coupon is restricted to specific products, filter only those items
        applicable_items = []
        if coupon.applicable_products.exists():
            allowed_products = coupon.applicable_products.all()
            applicable_items = [item for item in cart_items if item.product in allowed_products]
            if not applicable_items:
                raise serializers.ValidationError({
                    "coupon_code": "This coupon is not applicable to any product in your cart."
                })
        else:
            # Coupon applies to all cart items
            applicable_items = list(cart_items)

        # 5. Calculate applicable subtotal
        applicable_subtotal = sum(
            (item.variant.price if item.variant and item.variant.price else item.product.price) * item.quantity
            for item in applicable_items
        )

        # 6. Check minimum purchase amount
        if applicable_subtotal < coupon.min_purchase_amount:
            raise serializers.ValidationError({
                "coupon_code": (
                    f"Minimum purchase amount of ₹{coupon.min_purchase_amount} required. "
                    f"Your applicable cart total is ₹{applicable_subtotal:.2f}."
                )
            })

        data['coupon'] = coupon
        data['cart'] = cart
        data['cart_items'] = cart_items
        data['applicable_items'] = applicable_items
        data['applicable_subtotal'] = applicable_subtotal
        return data

    def apply_discount(self):
        coupon = self.validated_data['coupon']
        cart_items = self.validated_data['cart_items']
        applicable_items = self.validated_data['applicable_items']
        applicable_subtotal = self.validated_data['applicable_subtotal']

        # Full cart subtotal (all items)
        full_cart_total = sum(
            (item.variant.price if item.variant and item.variant.price else item.product.price) * item.quantity
            for item in cart_items
        )

        # Discount calculated on applicable items only
        discount = (coupon.discount_value / Decimal(100)) * applicable_subtotal
        discount = min(discount, applicable_subtotal)  # cap at subtotal

        discounted_total = full_cart_total - discount

        return {
            "coupon_code": coupon.code,
            "coupon_name": coupon.name,
            "discount_percentage": coupon.discount_value,
            "cart_total": full_cart_total,
            "discount_amount": round(discount, 2),
            "total_after_discount": round(max(discounted_total, Decimal(0)), 2),
            "applicable_items_count": len(applicable_items),
            "cart_items": [
                {
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "unit_price": str(item.variant.price if item.variant and item.variant.price else item.product.price),
                }
                for item in cart_items
            ]
        }


# Keep old serializer for backward compatibility (but view now uses new one)
class ApplyCouponSerializer(serializers.Serializer):
    coupon_code = serializers.CharField(max_length=255)
    product_id = serializers.IntegerField()

    def validate(self, data):
        try:
            coupon = Coupon.objects.get(code=data['coupon_code'])
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})
        try:
            product = Product.objects.get(id=data['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Invalid product ID."})

        if not coupon.is_valid():
            raise serializers.ValidationError({"coupon_code": "Coupon is not active or has expired."})

        if coupon.applicable_products.exists() and product not in coupon.applicable_products.all():
            raise serializers.ValidationError({"coupon_code": "Coupon is not applicable to this product."})

        if product.price < coupon.min_purchase_amount:
            raise serializers.ValidationError({
                "coupon_code": f"Product price ({product.price}) is less than minimum purchase amount ({coupon.min_purchase_amount})."
            })

        data['coupon'] = coupon
        data['product'] = product
        return data

    def apply_discount(self):
        coupon = self.validated_data['coupon']
        product = self.validated_data['product']
        discount = (coupon.discount_value / Decimal(100)) * product.price
        discount_price = product.price - discount
        return max(discount_price, Decimal(0))


class ApplyPromotionSerializer(serializers.Serializer):
    promotion_code = serializers.CharField(max_length=255)
    product_id = serializers.IntegerField()

    def validate(self, data):
        try:
            promotion = Promotion.objects.get(code=data['promotion_code'])
        except Promotion.DoesNotExist:
            raise serializers.ValidationError({"promotion_code": "invalid promotion code"})
        try:
            product = Product.objects.get(id=data['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "invalid product id"})

        now = timezone.now()
        if not (promotion.activate and promotion.start_date <= now <= promotion.end_date):
            raise serializers.ValidationError({"promotion_code": "promotion code is not activate or expired "})

        if promotion.applicable_product.exists() and product not in promotion.applicable_product.all():
            raise serializers.ValidationError({"promotion_code": "Promotion is not applicable to this product."})

        data['promotion'] = promotion
        data['product'] = product
        return data

    def apply_promotion(self):
        promotion = self.validated_data['promotion']
        product = self.validated_data['product']
        result = {
            'product': productSerializer(product).data,
            'promotion': promotion.code,
            'promotion_type': promotion.promotion_type,
            'original_price': product.price
        }
        if promotion.promotion_type == 'percentage':
            discount = (promotion.value / Decimal(100)) * product.price
            result['discounted_price'] = max(product.price - discount, Decimal(0))
            result['discount_value'] = promotion.value
        elif promotion.promotion_type == 'fixed':
            result['discounted_price'] = max(product.price - promotion.value, Decimal(0))
            result['discount_value'] = promotion.value
        elif promotion.promotion_type == 'BOGO':
            result['discounted_price'] = product.price
            result['bogo_free_item'] = productSerializer(product).data
            result['discount_value'] = product.price
        return result


# ── Banner serializer: now includes category + its products ───────────────────
class BannerProductSerializer(serializers.ModelSerializer):
    """Minimal product info shown in banner category offer listing"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock', 'is_available']

class BannerSerilizer(serializers.ModelSerializer):
    # Return category name inline
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    # Return products belonging to the banner's category (for mobile app display)
    category_products = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'image', 'is_active', 'created_at',
            'category', 'category_name', 'discount_percentage',
            'category_products'
        ]
        read_only_fields = ['created_at', 'category_name', 'category_products']

    def get_category_products(self, obj):
        """Return products in the linked category so mobile can show them under the banner"""
        if obj.category:
            products = Product.objects.filter(category=obj.category, is_available=True)
            return BannerProductSerializer(products, many=True, context=self.context).data
        return []