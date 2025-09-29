from rest_framework import serializers
from accounts.models import *
from products.models import *
from products.models import Product  
from . models import *
# from accour.models import VendorDocuments



class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = '__all__' 


class VendorViewProductSerilizer(serializers.ModelSerializer):
    class Meta:
        model = Product         
        fields = '__all__' 

class AddressSerilaizer(serializers.ModelSerializer):
    class Meta:
        model=Address
        fields = ["id", "line1", "line2", "city", "state", "postal_code", "country", "is_primary"]

class VendorDetailsSerializer(serializers.ModelSerializer):
    vendor_profile = serializers.SerializerMethodField()
    addresses=AddressSerilaizer(many=True,read_only=True)
    class Meta:
        model = CustomUser
        fields = ["id", "email", "username", "phone_number","addresses", "vendor_profile"]

    def get_vendor_profile(self, obj):
        try:
            profile = obj.vendor_profile
            return {
                "company_name": profile.company_name,
                "type_of_vendor": profile.type_of_vendor,
                "company_email": profile.company_email,
                "company_number": profile.company_number,
                "contact_name": profile.contact_name,
                "contact_email": profile.contact_email,
                "contact_number": profile.contact_number,
                "designation": profile.designation,
            }
        except VendorProfile.DoesNotExist:
            return None


class VendorProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email')

    class Meta:
        model = VendorProfile
        fields = [
            'id',
            'user_email',
            'company_name',
            'type_of_vendor',
            'company_email',
            'company_number',
            'contact_name',
            'contact_email',
            'contact_number',
            'designation',
        ]


class VendorDocumentsSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer()
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),  # 🔹 allow passing user_id
        source='user',                # maps to FK field user
        write_only=True               # hide from response if you want
    )
    class Meta:
        model = VendorDocuments

        fields = ['id', 'user_id', 'vendor_profile', 'is_verified', 'profile_status']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        extra_kwargs = {
            'users': {'required': False},
            'group': {'required': False, 'allow_null': True},
        }

    def validate_group(self, value):
        if value and not Group.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Invalid group ID. This group does not exist.")
        return value

