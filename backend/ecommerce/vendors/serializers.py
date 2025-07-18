from rest_framework import serializers
from products.models import Product, Category
from vehicles.models import (
    VehicleMake, VehicleModel, Year, Variant, ModelYear, VariantYear
)
from products.serializers import ProductSerializer, CategorySerializer
from vehicles.serializers import (
    VehicleMakeSerializer, VehicleModelSerializer, YearSerializer, 
    VariantSerializer, ModelYearSerializer, VariantYearSerializer
)

class VendorDashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    recent_products = ProductSerializer(many=True)
    registration_complete = serializers.BooleanField()

class VendorProductSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['vendor']
        read_only_fields = ['vendor']  


class VendorCategorySerializer(CategorySerializer):
    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields


class ProductStockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'stock']