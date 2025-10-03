from rest_framework import serializers
from accounts.models import *
from products.models import *
from products.models import *  
from . models import *
from orders.serializers import *
from products.serializers import *
# from accour.models import VendorDocuments

class AdminDashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_sales = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    new_users = serializers.IntegerField()
    new_vendors = serializers.IntegerField()
    total_vendors = serializers.IntegerField()
    total_users = serializers.IntegerField()
    total_admins = serializers.IntegerField()

    recent_orders = OrderSerializer(many=True)
    recent_products = ProductSerializer(many=True)
    
    monthly_sales = serializers.SerializerMethodField()
    monthly_products = serializers.SerializerMethodField()

    def get_monthly_sales(self, obj):
        return obj.get("monthly_sales", [])

    def get_monthly_products(self, obj):
        return obj.get("monthly_products", [])


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
    created_by = serializers.StringRelatedField()
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

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "ticket_id",
            "vendor",
            "subject",
            "category",
            "priority",
            "description",
            "status",
            "is_read",
            "answer",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["ticket_id", "vendor", "status", "is_read", "answer"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["vendor"] = user
        return super().create(validated_data)