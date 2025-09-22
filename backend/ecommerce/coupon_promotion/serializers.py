from rest_framework import serializers
from .models import *
from products.models import *
from decimal import Decimal
from django.core.exceptions import ValidationError
class PromrotionSerializers(serializers.ModelSerializer):
    value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,  # 👈 not required
        allow_null=True
    )
    class Meta:
        model=Promotion
        fields='__all__'

class categorySerilzier(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields=["id","name","discription","image","available"]

class ProductSerilaizer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields = ["id", "name", "description", "price", "stock"]

class PromotionReadSerializer(serializers.ModelSerializer):
    
    applicable_product = ProductSerilaizer(many=True,read_only=True)
    applicable_category= categorySerilzier(many=True,read_only=True)

    class Meta:
        model=Promotion
        fields=[
            "id", "name", "code", "description", "promotion_type", "value",
            "start_date", "end_date", "activate", "price_range",
            "applicable_product", "applicable_category"
        ]
class CouponSerializer(serializers.ModelSerializer):
     class Meta:
        model=Coupon
        fields= "__all__"

class productSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product 
        fields=['id','name','price','is_available']

class ApplyCouponSerializer(serializers.Serializer):
    coupon_code =serializers.CharField(max_length=255)
    product_id=serializers.IntegerField()
    
    def validate(self, data):
        try:
            coupon=Coupon.objects.get(name=data['coupon_code'])
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})
        try:
            product=Product.objects.get(id=data['product_id'])
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
        
        data['coupon']=coupon
        data['product']=product

        return data

    def apply_discount(self):
        
        coupon=self.validated_data['coupon']
        product=self.validated_data['product']
        discount=(coupon.discount_value/Decimal(100))*product.price
        discount_price= product.price - discount
        return max(discount_price,Decimal(0))

class ApplyPromotionSerializer(serializers.Serializer):
    promotion_code = serializers.CharField(max_length=255)
    product_id = serializers.IntegerField()

    def validate(self,data):
        try:
            promotion=Promotion.objects.get(code=data['promotion_code'])
        except Promotion.DoesNotExist:
            raise serializers.ValidationError({"promotion_code":"invalid promotion code"})
        try:
            product=Product.objects.get(id=data['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id":"invalid product id"})
        
        now=timezone.now()

        if not(promotion.activate and promotion.start_date <= now <= promotion.end_date):
            raise serializers.ValidationError({"promotion_code":"promotion code is not activate or expired "} )
        
        if promotion.applicable_product.exists() and product not in promotion.applicable_product.all():
            raise serializers.ValidationError({"promotion_code": "Promotion is not applicable to this product."})

        data['promotion']=promotion
        data['product']=product

        return data
    
    def apply_promotion(self):
        
        promotion=self.validated_data['promotion']
        product=self.validated_data['product']
        result={
            'product':productSerializer(product).data,
            'promotion':promotion.code,
            'promotion_type':promotion.promotion_type,
            'original_price':product.price
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
    
class BannerSerilizer(serializers.ModelSerializer):
    class  Meta:
        model = Banner
        fields= "__all__"
        read_only_field=['created_at']