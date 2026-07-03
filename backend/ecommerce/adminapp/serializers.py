from rest_framework import serializers
from accounts.models import *
from products.models import *
from products.models import *  
from . models import *
from orders.models import *
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
    most_sold_products = serializers.ListField(child=serializers.DictField(), required=False)

    def get_monthly_sales(self, obj):
        return obj.get("monthly_sales", [])

    def get_monthly_products(self, obj):
        return obj.get("monthly_products", [])


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = '__all__' 

# class VendorListSerializer(serializers.ModelSerializer):
#     user_id = serializers.IntegerField(source='vendor_profile.id', read_only=True)
#     username = serializers.CharField(source='user.username', read_only=True)
#     email = serializers.EmailField(source='user.email', read_only=True)
#     phone = serializers.CharField(source='contact_number', read_only=True)
#     location = serializers.SerializerMethodField(read_only=True)
#     status = serializers.CharField(source='vendordocuments.profile_status', read_only=True)
#     date_joined = serializers.DateTimeField(source='user.date_joined', format='%Y-%m-%d', read_only=True)
#     products = serializers.SerializerMethodField()
#     orders = serializers.SerializerMethodField()

#     class Meta:
#         model = VendorProfile
#         fields = [
#             'user_id',
#             'username',
#             'email',
#             'phone',
#             'location',
#             'status',
#             'date_joined',
#             'products',
#             'orders',
#         ]

#     def get_location(self, obj):
#         """Return the vendor's pickup address from the Address model."""
#         address = obj.user.addresses.filter(is_pickup=True).first()
#         if address:
#             return str(address)  # Uses Address.__str__()
#         return None

#     def get_products(self, obj):
#         """Count total products belonging to this vendor."""
#         return obj.user.products.count()

#     def get_orders(self, obj):
#         """Count total orders received for this vendor."""
#         # Count orders where this vendor's products are ordered
#         return Order.objects.filter(user=obj.user).count()


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

# class VendorDetailsSerializer(serializers.ModelSerializer):
#     company_details = serializers.SerializerMethodField()
#     customer_details = serializers.SerializerMethodField()
#     basic_details = serializers.SerializerMethodField()
#     total_products = serializers.SerializerMethodField()
#     total_orders = serializers.SerializerMethodField()
#     total_stock = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser
#         fields = [
#             "id",
#             "basic_details",
#             "company_details",
#             "customer_details",
#             "total_products",
#             "total_orders",
#             "total_stock",
#         ]

#     # -------------------- BASIC DETAILS --------------------
#     def get_basic_details(self, obj):
#         address = obj.addresses.filter(is_primary=True).first()
#         profile = getattr(obj, "vendor_profile", None)

#         return {
#             "name": obj.username,
#             "email": obj.email,
#             "phone": profile.company_number if profile and profile.company_number else obj.phone_number,
#             "address": f"{address.line1}, {address.city}, {address.state}, {address.country}, {address.postal_code}" if address else None
#         }


#     # -------------------- COMPANY DETAILS --------------------
#     def get_company_details(self, obj):
#         profile = getattr(obj, "vendor_profile", None)
#         if not profile:
#             return None
#         return {
#             "company_name": profile.company_name,
#             "company_email": profile.company_email,
#             "company_number": profile.company_number,
#             "vendor_type": profile.type_of_vendor,
#             "bank_account_no": profile.bank_account_no,
#             "ifsc_code": profile.ifsc_code,
#             "account_holder_name": profile.bank_account_holder_name,
#         }

#     # -------------------- CUSTOMER DETAILS --------------------
#     def get_customer_details(self, obj):
#         profile = getattr(obj, "vendor_profile", None)
#         if not profile:
#             return None
#         return {
#             "name": profile.contact_name,
#             "designation": profile.designation,
#             "email": profile.contact_email,
#             "phone": profile.contact_number,
#         }

#     # -------------------- METRICS --------------------
#     def get_total_products(self, obj):
#         pass
#         # return obj.vendor_profile.products.count()

#     def get_total_stock(self, obj):
#         return obj.vendor_profile.products.aggregate(total_stock=Sum('stock'))['total_stock'] or 0

#     def get_total_orders(self, obj):
#         return Order.objects.filter(items__product__vendor_profile=obj.vendor_profile).distinct().count()

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


class VendorUnverifiedDocumentsSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer()
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='vendor_profile.user',  # fix: map to user of vendor_profile
        write_only=True
    )
    id = serializers.SerializerMethodField()  # override id field

    class Meta:
        model = VendorDocuments
        fields = ['id', 'user_id', 'vendor_profile', 'is_verified', 'profile_status']

    def get_id(self, obj):
        # Return the user's ID instead of VendorDocuments ID
        return obj.vendor_profile.user.id


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


class InventoryStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    in_stock = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    out_of_stock = serializers.IntegerField()
    stock_by_category = serializers.DictField(child=serializers.IntegerField())
    stock_movement = serializers.ListField(
        child=serializers.DictField()
    )


class GrowthTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_sales = serializers.FloatField()
    total_orders = serializers.IntegerField()


class VendorRevenueSerializer(serializers.Serializer):
    vendor_id = serializers.IntegerField()
    vendor_email = serializers.EmailField()
    total_revenue = serializers.FloatField()
    total_items = serializers.IntegerField()


class TopCustomerSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    total_spent = serializers.FloatField()
    total_orders = serializers.IntegerField()


class AdminAnalyticsSerializer(serializers.Serializer):
    growth_trends = GrowthTrendSerializer(many=True)
    vendor_vs_revenue = VendorRevenueSerializer(many=True)
    top_customers = TopCustomerSerializer(many=True)


class AdminSalesAnalyticsSerializer(serializers.Serializer):
    orders_today = serializers.IntegerField()
    products_sold_today = serializers.IntegerField()
    new_users = serializers.IntegerField()
    refunds_today = serializers.IntegerField()
    
    sales_trends = serializers.ListField(child=serializers.DictField())
    monthly_profit = serializers.ListField(child=serializers.DictField())
    total_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    returns_and_refunds = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    top_vendors = serializers.ListField(child=serializers.DictField())
    top_products = serializers.ListField(child=serializers.DictField())


class AdminSalesReportSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    order_id = serializers.IntegerField()
    product = serializers.CharField()
    vendor = serializers.CharField()
    buyer = serializers.CharField()
    quantity = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    commission = serializers.DecimalField(max_digits=10, decimal_places=2)
    earnings = serializers.DecimalField(max_digits=10, decimal_places=2)


class AdminTransactionTableSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    order_id = serializers.IntegerField()
    buyer = serializers.CharField()
    payment_method = serializers.CharField()
    status = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    refund = serializers.DecimalField(max_digits=12, decimal_places=2)
    gateway_fee = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_received = serializers.DecimalField(max_digits=12, decimal_places=2)

class AdminTaxTableSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    invoice = serializers.CharField()
    product = serializers.CharField()
    tax_type = serializers.CharField()
    base_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    tax = serializers.DecimalField(max_digits=12, decimal_places=2)
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    state = serializers.CharField()
    buyer_type = serializers.CharField()

class AdminLoginSerializer(serializers.Serializer):
    email_or_username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)