from rest_framework import serializers
from .models import *
from vehicles.serializers import VehicleVariantReadSerializer

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

    def validate(self, attrs):
        name= attrs.get('name') or getattr(self.instance,'name',None)
        print(f"serailzier name: {name}")
        if not name:
            raise serializers.ValidationError("Name is required.")
        return attrs
    
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']



class ProductSerializer(serializers.ModelSerializer):
    image_list = ProductImageSerializer(many=True, read_only=True, source='images')
    category = CategorySerializer(read_only=True)
    tag = serializers.CharField(required=False, allow_blank=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    compatible_varient_year = VehicleVariantReadSerializer(many=True, read_only=True)

    compatible_varient_year_ids = serializers.PrimaryKeyRelatedField(
        queryset=VehicleVariant.objects.all(),
        many=True,
        required=False,
        write_only=True,
        source='compatible_varient_year')   

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'created_at', 'updated_at', 'weight', 'length', 'breadth', 'height',
            "manufacturing_date", "tag", "size", 'category', 'category_id',
            "image_list","compatible_varient_year_ids" , 'compatible_varient_year',
            "length","breadth","height","weight"
        ]
        extra_kwargs = {
            'size': {'required': False, 'allow_null': True, 'allow_blank': True},
            'weight': {'required': True},
            'length': {'required': True},
            'breadth': {'required': True},
            'height': {'required': True},
        }

    def validate(self, attrs):
        print(attrs.get("price"))
        print("reached serilaasjaj")
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        if attrs.get('price') <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")

        if attrs.get('weight') is not None and attrs.get('weight') <= 0:
            raise serializers.ValidationError("Weight must be greater than zero.")
        if attrs.get('length') is not None and attrs.get('length') <= 0:
            raise serializers.ValidationError("Length must be greater than zero.")
        if attrs.get('breadth') is not None and attrs.get('breadth') <= 0:
            raise serializers.ValidationError("Breadth must be greater than zero.")
        if attrs.get('height') is not None and attrs.get('height') <= 0:
            raise serializers.ValidationError("Height must be greater than zero.")

        if not attrs.get("length"):
            raise serializers.ValidationError("length is mandatory field")
        if not attrs.get("breadth"):
            raise serializers.ValidationError("breadth is mandatory field")
        if not attrs.get("height"):
            raise serializers.ValidationError("height is mandatory field")
        if not attrs.get("weight"):
            raise serializers.ValidationError("weight is mandatory field")

        return attrs

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        tags_str = ret.get('tag', '')
        ret['tag'] = [t.strip() for t in tags_str.split(',')] if tags_str else []
        return ret

    def to_internal_value(self, data):
        tags = data.get('tag', [])
        if isinstance(tags, list):
            data['tag'] = ', '.join(tags)
        return super().to_internal_value(data)
    
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        if value < 1.0 or value > 5.0:
            raise serializers.ValidationError("Rating must be between 1.0 and 5.0.")
        return value
