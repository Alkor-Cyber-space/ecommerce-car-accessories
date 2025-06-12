from rest_framework import serializers
from .models import *
  

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        return attrs

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    compatible_variant_year =  serializers.PrimaryKeyRelatedField(
        queryset=VariantYear.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'created_at', 'updated_at', 'category', 'category_id','compatible_variant_year']
        
    def validate(self, attrs):
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        if attrs.get('price') <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return attrs
    
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
