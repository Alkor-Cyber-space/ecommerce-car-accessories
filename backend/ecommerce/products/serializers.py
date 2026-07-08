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
    image_list = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    tag = serializers.CharField(required=False, allow_blank=True)
    vendor = VendorSerializer(read_only=True)

    def get_image_list(self, obj):
        images = list(obj.images.all())
        slots_data = [None] * 6
        
        # First, place slot-specific images into their respective slots if they are in 0-5 range
        unplaced_images = []
        for img in images:
            placed = False
            if img.slot and img.slot.startswith('images_'):
                try:
                    idx = int(img.slot.split('_')[1])
                    if 0 <= idx < 6:
                        slots_data[idx] = ProductImageSerializer(img, context=self.context).data
                        placed = True
                except (ValueError, IndexError):
                    pass
            if not placed:
                unplaced_images.append(img)
                
        # For any unplaced images (like legacy main_image, etc.), place them in empty slots
        for img in unplaced_images:
            # find first empty slot
            for idx in range(6):
                if slots_data[idx] is None:
                    serialized = ProductImageSerializer(img, context=self.context).data
                    serialized['slot'] = f"images_{idx}"
                    slots_data[idx] = serialized
                    break
                    
        # Fill any remaining empty slots with blank image dicts so the frontend maps them correctly
        for idx in range(6):
            if slots_data[idx] is None:
                slots_data[idx] = {
                    "id": None,
                    "image": None,
                    "is_main": (idx == 0),
                    "slot": f"images_{idx}"
                }
                
        return slots_data

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
        
        name = attrs.get('name') or getattr(self.instance, 'name', None)
        price = attrs.get('price') if 'price' in attrs else getattr(self.instance, 'price', None)
        length = attrs.get('length') if 'length' in attrs else getattr(self.instance, 'length', None)
        breadth = attrs.get('breadth') if 'breadth' in attrs else getattr(self.instance, 'breadth', None)
        height = attrs.get('height') if 'height' in attrs else getattr(self.instance, 'height', None)
        weight = attrs.get('weight') if 'weight' in attrs else getattr(self.instance, 'weight', None)

        if not name:
            raise serializers.ValidationError("Name is required.")
        if price is not None and price <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")

        if length is not None and length <= 0:
            raise serializers.ValidationError("Length must be greater than zero.")
        if breadth is not None and breadth <= 0:
            raise serializers.ValidationError("Breadth must be greater than zero.")
        if height is not None and height <= 0:
            raise serializers.ValidationError("Height must be greater than zero.")

        if not length:
            raise serializers.ValidationError("length is mandatory field")
        if not breadth:
            raise serializers.ValidationError("breadth is mandatory field")
        if not height:
            raise serializers.ValidationError("height is mandatory field")
        if not weight:
            raise serializers.ValidationError("weight is mandatory field")

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
        if hasattr(data, 'copy'):
            data = data.copy()
        
        if hasattr(data, 'getlist'):
            tags = data.getlist('tag')
        else:
            tags = data.get('tag', [])
            
        if isinstance(tags, list):
            flat_tags = []
            for t in tags:
                if isinstance(t, str):
                    flat_tags.extend([item.strip() for item in t.split(',') if item.strip()])
                else:
                    flat_tags.append(str(t))
            data['tag'] = ', '.join(flat_tags)
        elif isinstance(tags, str):
            flat_tags = [item.strip() for item in tags.split(',') if item.strip()]
            data['tag'] = ', '.join(flat_tags)
            
        return super().to_internal_value(data)
    
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user(self, obj):
        return obj.user.username

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

class ReviewReplySerializer(serializers.ModelSerializer):
    replier = serializers.StringRelatedField(read_only=True)
    review = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ReviewReply
        fields = ['id', 'review', 'replier', 'message', 'created_at', 'updated_at']
