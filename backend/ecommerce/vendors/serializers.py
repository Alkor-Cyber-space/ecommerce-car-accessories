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

class VendorProductSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['vendor']
        read_only_fields = ['vendor']  


class VendorCategorySerializer(CategorySerializer):
    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields


class VendorVehicleMakeSerializer(VehicleMakeSerializer):
    class Meta(VehicleMakeSerializer.Meta):
        fields = VehicleMakeSerializer.Meta.fields


class VendorVehicleModelSerializer(VehicleModelSerializer):
    class Meta(VehicleModelSerializer.Meta):
        fields = VehicleModelSerializer.Meta.fields


class VendorYearSerializer(YearSerializer):
    class Meta(YearSerializer.Meta):
        fields = YearSerializer.Meta.fields


class VendorVariantSerializer(VariantSerializer):
    class Meta(VariantSerializer.Meta):
        fields = VariantSerializer.Meta.fields


class VendorModelYearSerializer(ModelYearSerializer):
    class Meta(ModelYearSerializer.Meta):
        fields = ModelYearSerializer.Meta.fields


class VendorVariantYearSerializer(VariantYearSerializer):
    class Meta(VariantYearSerializer.Meta):
        fields = VariantYearSerializer.Meta.fields