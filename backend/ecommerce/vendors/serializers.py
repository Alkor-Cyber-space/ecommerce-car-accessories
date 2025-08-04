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




class ProductStockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'stock']