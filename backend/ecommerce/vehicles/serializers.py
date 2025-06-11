
from rest_framework import serializers
from .models import *

class VehicleMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleMake
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        return attrs


class VehicleModelSerializer(serializers.ModelSerializer):
    make = VehicleMakeSerializer(read_only=True)

    class Meta:
        model = VehicleModel
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        return attrs
    

class YearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Year
        fields = '__all__'

    def validate(self, attrs):
        if attrs.get('year') <= 2002:
            raise serializers.ValidationError("Year must be greater than 2002.")
        return attrs
    

class VariantSerializer(serializers.ModelSerializer):
    model = VehicleModelSerializer(read_only=True)

    class Meta:
        model = Variant
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('name'):
            raise serializers.ValidationError("Name is required.")
        return attrs
    

class ModelYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelYear
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('model') or not attrs.get('year'):
            raise serializers.ValidationError("Model and Year are required.")
        return attrs
    

class VariantYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariantYear
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('variant') or not attrs.get('year'):
            raise serializers.ValidationError("Variant and Year are required.")
        return attrs
