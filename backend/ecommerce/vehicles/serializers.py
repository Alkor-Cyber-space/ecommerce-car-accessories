
from rest_framework import serializers
from .models import *

# class VehicleMakeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VehicleMake
#         fields = '__all__'

#     def validate(self, attrs):
#         if not attrs.get('name'):
#             raise serializers.ValidationError("Name is required.")
#         return attrs


# class VehicleModelSerializer(serializers.ModelSerializer):
#     make = VehicleMakeSerializer(read_only=True)
#     make_id = serializers.PrimaryKeyRelatedField(
#         queryset=VehicleMake.objects.all(), source='make', write_only=True
#     ) 
#     class Meta:
#         model = VehicleModel
#         fields = '__all__'

#     def validate(self, attrs):
#         if not attrs.get('name'):
#             raise serializers.ValidationError("Name is required.")
#         return attrs
    

# class YearSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Year
#         fields = '__all__'

#     def validate(self, attrs):
#         if attrs.get('year') <= 2002:
#             raise serializers.ValidationError("Year must be greater than 2002.")
#         return attrs
    

# class VariantSerializer(serializers.ModelSerializer):
#     model = VehicleModelSerializer(read_only=True)
#     model_id = serializers.PrimaryKeyRelatedField( 
#         queryset=VehicleModel.objects.all(),
#         source='model',
#         write_only=True
#     )
#     class Meta:
#         model = Variant
#         fields = '__all__'

#     def validate(self, attrs):
#         if not attrs.get('name'):
#             raise serializers.ValidationError("Name is required.")
#         return attrs
    

# class ModelYearSerializer(serializers.ModelSerializer):
#     model = serializers.PrimaryKeyRelatedField(
#         read_only=True
#     )
#     year = serializers.PrimaryKeyRelatedField(
#         read_only=True
#     )
#     model_id = serializers.PrimaryKeyRelatedField(
#         queryset=VehicleModel.objects.all(),
#         source='model',
#         write_only=True
#     )
#     year_id = serializers.PrimaryKeyRelatedField(
#         queryset=Year.objects.all(),
#         source='year',
#         write_only=True
#     )
#     class Meta:
#         model = ModelYear
#         fields = '__all__'

#     def validate(self, attrs):
#         if not attrs.get('model') or not attrs.get('year'):
#             raise serializers.ValidationError("Model and Year are required.")
#         return attrs
    

# class VariantYearSerializer(serializers.ModelSerializer):
#     variant = serializers.PrimaryKeyRelatedField(
#         read_only=True
#     )
#     year = serializers.PrimaryKeyRelatedField(
#         read_only=True
#     )
#     variant_id = serializers.PrimaryKeyRelatedField(
#         queryset=Variant.objects.all(),
#         source='variant',
#         write_only=True
#     )
#     year_id = serializers.PrimaryKeyRelatedField(
#         queryset=Year.objects.all(),
#         source='year',
#         write_only=True
#     )
#     class Meta:
#         model = VariantYear
#         fields = '__all__'

#     def validate(self, attrs):
#         if not attrs.get('variant') or not attrs.get('year'):
#             raise serializers.ValidationError("Variant and Year are required.")
#         return attrs


class VehicleFullEntrySerializer(serializers.Serializer):
    make = serializers.CharField()
    model = serializers.CharField()
    variant = serializers.ChoiceField(choices=['Petrol', 'Diesel', 'CNG', 'Electric'])
    year = serializers.IntegerField()

    def create(self, validated_data):
        make_name = validated_data['make']
        model_name = validated_data['model']
        variant = validated_data['variant']
        year = validated_data['year']

        # Get or create Make
        make_obj, _ = VehicleMake.objects.get_or_create(name__iexact=make_name, defaults={'name': make_name})

        # Get or create Model
        model_obj, _ = VehicleModel.objects.get_or_create(make=make_obj, name__iexact=model_name, defaults={'name': model_name})

        # Create Variant
        variant_obj, created = VehicleVariant.objects.get_or_create(
            make=make_obj,
            model=model_obj,
            variant=variant,
            year=year
        )

        return variant_obj

class VehicleVariantReadSerializer(serializers.ModelSerializer):
    make = serializers.CharField(source='make.name')
    model = serializers.CharField(source='model.name')

    class Meta:
        model = VehicleVariant
        fields = ['id', 'make', 'model', 'variant', 'year']


class SavedVehicleSerializer(serializers.ModelSerializer):
    vehicle_variant_year = serializers.PrimaryKeyRelatedField(
        queryset=VehicleVariant.objects.all()
    )

    class Meta:
        model = SavedVehicle
        fields = ['id', 'vehicle_variant_year', 'saved_at']
        read_only_fields = ['saved_at']