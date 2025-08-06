from rest_framework import serializers
from accounts.models import CustomUser,VendorProfile

class UserSerializer(serializers.ModelSerializer):
    contact_number = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'username',
            'phone_number',
            'is_admin_staff',
            'is_superuser',
            'date_joined',
            'contact_number'  # from VendorProfile
        ]

    def get_contact_number(self, obj):
        if hasattr(obj, 'vendor_profile') and obj.vendor_profile:
            return obj.vendor_profile.contact_number
        return None

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = '__all__' 


