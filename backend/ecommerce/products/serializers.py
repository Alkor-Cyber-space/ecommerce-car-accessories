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

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'created_at', 'updated_at', 'category', 'category_id']
        
    def validate(self, attrs):
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        if attrs.get('price') <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return attrs