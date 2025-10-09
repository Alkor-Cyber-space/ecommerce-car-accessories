from rest_framework import serializers
from .models import *
from accounts.models import *
from vehicles.serializers import VehicleVariantReadSerializer

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

    available = serializers.BooleanField(default=True)

    def validate(self, attrs):
        name= attrs.get('name') or getattr(self.instance,'name',None)
        print(f"serailzier name: {name}")
        if not name:
            raise serializers.ValidationError("Name is required.")
        return attrs
    

class VendorPickupAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'line1', 'line2', 'city', 'state', 'postal_code', 'country']

class VendorSerializer(serializers.ModelSerializer):
    pickup_locations = VendorPickupAddressSerializer(
        many=True,
        source='addresses',  # addresses related_name from Address model
        read_only=True
    )

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'pickup_locations']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'slot']



class ProductSerializer(serializers.ModelSerializer):
    image_list = ProductImageSerializer(many=True, read_only=True, source='images')
    category = CategorySerializer(read_only=True)
    tag = serializers.CharField(required=False, allow_blank=True)
    vendor = VendorSerializer(read_only=True)

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
            "length","breadth","height","weight","vendor","is_available"
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

        # if attrs.get('weight') is not None and attrs.get('weight') <= 0:
        #     raise serializers.ValidationError("Weight must be greater than zero.")
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

        # if attrs.get('price') <= 0:
        #     raise serializers.ValidationError("Price must be greater than zero.")
        # if not attrs.get("length")z:
        #     raise serializers.ValidationError("length is mandatory field")
        # if not attrs.get("breadth"):
        #     raise serializers.ValidationError("breadth is mandatory field")
        # if not attrs.get("height"):
        #     raise serializers.ValidationError("height is mandatory field")
        # if not attrs.get("weight"):
        #     raise serializers.ValidationError("weight is mandatory field")

        return attrs

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        # Convert tags string into list
        if ret.get("tag"):
            ret["tag"] = [tag.strip() for tag in ret["tag"].split(",") if tag.strip()]
        else:
            ret["tag"] = []
        
        # Keep your existing images_by_slot logic
        ret['images_by_slot'] = {
            img.slot: {
                "id": img.id,
                "image": img.image.url if img.image else None,
                "is_main": img.is_main
            }
            for img in instance.images.all()
        }
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


class DashboardProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "stock",
            "category", "is_featured", "is_best_seller",
            "is_top_rated", "is_new", "compatible_varient_year","images",
        ]