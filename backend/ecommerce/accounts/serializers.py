import re
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import *
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import password_validation
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password


User = get_user_model()


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password',"phone_number")
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        # Assign to "User" group by default
        user_group, _ = Group.objects.get_or_create(name='User')
        user.groups.add(user_group)

        return user


class VendorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)

        # Assign user to 'Vendor' group
        vendor_group, created = Group.objects.get_or_create(name='Vendor')
        user.groups.add(vendor_group)

        return user

class VendorProfileFullEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = '__all__'
        extra_kwargs = {
            field: {
                'required': False,
                'allow_null': True,
                **({'allow_blank': True} if field in [
                    'company_name', 'contact_name', 'designation',
                    'company_email', 'contact_email'
                ] else {})
            }
            for field in [
                'company_name', 'type_of_vendor', 'company_email', 'company_number',
                'contact_name', 'contact_email', 'contact_number', 'designation',
                'pan_card', 'aadhar_passport_dl',
                'gst_certificate', 'business_registration_cert', 'shop_license',
                'cancelled_cheque', 'bank_statement', 'it_return', 'financial_statement',
                'dealership_letter', 'authorized_signatory_letter', 'vendor_registration_form', 'signed_terms_and_con',
            ]
        }

    # --- Step 1 Validations ---
    def validate_company_name(self, value):
        if value and VendorProfile.objects.filter(company_name=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This company name already exists.")
        return value

    def validate_company_email(self, value):
        if value and VendorProfile.objects.filter(company_email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This company email is already used.")
        return value

    def validate_company_number(self, value):
        if value and VendorProfile.objects.filter(company_number=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This company number is already used.")
        return value

    # --- Step 2 Validations ---
    def validate_contact_email(self, value):
        if value and VendorProfile.objects.filter(contact_email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This contact email is already used.")
        return value

    def validate_contact_number(self, value):
        if value and VendorProfile.objects.filter(contact_number=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This contact number is already used.")
        return value

    def _validate_file_size(self, file, label):
        max_size_mb = 5
        if file and file.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"{label} file too large. Max size is {max_size_mb}MB.")
        return file

    def validate_pan_card(self, value):
        return self._validate_file_size(value, "PAN Card")

    def validate_aadhar_passport_dl(self, value):
        return self._validate_file_size(value, "Aadhar/Passport/DL")

    def validate_gst_certificate(self, value):
        return self._validate_file_size(value, "GST Certificate")

    def validate_business_registration_cert(self, value):
        return self._validate_file_size(value, "Business Registration Certificate")

    def validate_shop_license(self, value):
        return self._validate_file_size(value, "Shop License")

    def validate_cancelled_cheque(self, value):
        return self._validate_file_size(value, "Cancelled Cheque")

    def validate_bank_statement(self, value):
        return self._validate_file_size(value, "Bank Statement")

    def validate_it_return(self, value):
        return self._validate_file_size(value, "IT Return")

    def validate_financial_statement(self, value):
        return self._validate_file_size(value, "Financial Statement")

    def validate_dealership_letter(self, value):
        return self._validate_file_size(value, "Dealership Letter")

    def validate_authorized_signatory_letter(self, value):
        return self._validate_file_size(value, "Authorized Signatory Letter")

    def validate_vendor_registration_form(self, value):
        return self._validate_file_size(value, "Vendor Registration Form")

    def validate_signed_terms_and_con(self, value):
        return self._validate_file_size(value, "Signed Terms and Conditions")



class Step1CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['company_name', 'type_of_vendor', 'company_email', 'company_number']

    def validate_company_name(self, value):
        if VendorProfile.objects.filter(company_name=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This company nam already exist.")
        return value

    def validate_company_email(self, value):
        if VendorProfile.objects.filter(company_email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This company email is already used.")
        return value

    def validate_company_number(self, value):
        if VendorProfile.objects.filter(company_number=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This company number is already used.")
        
        return value


class Step2ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['contact_name', 'contact_email', 'contact_number', 'designation']

    def validate_contact_email(self, value):
        if VendorProfile.objects.filter(contact_email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This contact email is already used.")
        return value

    def validate_contact_number(self, value):
        if VendorProfile.objects.filter(contact_number=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This contact number is already used.")
        return value

class Step3KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['pan_card', 'aadhar_passport_dl']


class Step4BusinessDocsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['gst_certificate', 'business_registration_cert', 'shop_license']



class Step5BankTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['cancelled_cheque', 'bank_statement', 'it_return', 'financial_statement']


class Step6AgreementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['dealership_letter', 'authorized_signatory_letter', 'vendor_registration_form', 'signed_terms_and_con']


# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)

#     class Meta:
#         model = CustomUser
#         fields = ('email', 'username', 'password', 'phone_number')

#     def create(self, validated_data):
#         return CustomUser.objects.create_user(**validated_data)

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

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError('Token is invalid or expired.')
        
class PhoneNumberValidateSerializer(serializers.Serializer):
    
     phone_number = serializers.CharField(max_length=13, required=True)

     def validate(self, attrs):
          """
          Validate phone number to ensure it includes a country code like +91 and is numeric.
          E.g., +919876543210
          """
          phone_number = attrs.get('phone_number')
          pattern = r'^\+\d{10,15}$'  # starts with + and has 10–15 digits
          if not re.match(pattern, phone_number):
               raise serializers.ValidationError("Invalid phone number. Must include country code and be numeric.")
          
          return attrs

class UserOTPSerializer(serializers.Serializer):
     phone_number = serializers.CharField(max_length=13,required=True)
     otp = serializers.CharField(max_length=6, required=True)
     
     def validate_phone_number(self, value):
        """
        Validate phone number to ensure it includes a country code like +91 and is numeric.
        E.g., +919876543210
        """
        pattern = r'^\+\d{10,15}$'  # starts with + and has 10–15 digits
        if not re.match(pattern, value):
            raise serializers.ValidationError("Invalid phone number. Must include country code and be numeric.")
        return value

     def validate_otp(self, value):
          """
          Validate OTP to ensure it's exactly 6 digits.
          """
          if not re.fullmatch(r'\d{6}', value):
               raise serializers.ValidationError("OTP must be a 6-digit number.")
          return value
     

class UserOTPResendSerializer(serializers.ModelSerializer):
     class Meta:
          model = UserOTPS
          fields = ['phone_number']
          extra_kwargs = {'phone_number': {'required': True}}

     def create(self, validated_data):
          user = UserOTPS.objects.create(**validated_data)
          return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "New password and confirm password do not match."})

        # Custom password validation
        if len(new_password) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})
        if not re.search(r'[A-Z]', new_password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one uppercase letter."})
        if not re.search(r'[a-z]', new_password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one lowercase letter."})
        if not re.search(r'\d', new_password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one number."})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one special character."})

        # Validate password strength using Django's built-in validators
        password_validation.validate_password(new_password)

        return attrs

class UserEditSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name','username', 'email', 'phone_number', 'old_password', 'new_password']

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def validate(self, attrs):
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')

        if old_password or new_password:
            if not old_password or not new_password:
                raise serializers.ValidationError("Both old and new passwords are required to change password.")

            user = self.context['request'].user
            if not check_password(old_password, user.password):
                raise serializers.ValidationError({"old_password": "Old password is incorrect."})

            validate_password(new_password, user)

        return attrs

    def update(self, instance, validated_data):
        old_password = validated_data.pop('old_password', None)
        new_password = validated_data.pop('new_password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance

    
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is associated with this email address.")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if new_password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")

        if len(new_password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', new_password):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', new_password):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', new_password):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', new_password):
            raise serializers.ValidationError("Password must contain at least one special character.")

        return data
    
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']

class VendorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)

        # Assign user to 'Vendor' group
        vendor_group, created = Group.objects.get_or_create(name='Vendor')
        user.groups.add(vendor_group)

        return user
        
class OTPVerificationSerializer(serializers.Serializer):
    email=serializers.EmailField()
    otp=serializers.CharField(max_length=4)

    def validate(self, data):
        email=data.get('email')
        otp=data.get('otp')

        try:
            user=CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"email": "user with the id does not exist"})
        
        try:
            otp_obj=OTP.objects.get(user=user,otp=otp)
        except OTP.DoesNotExist:
            raise serializers.ValidationError({"otp": "invalid otp"})
        
        if not otp_obj.is_valid():
            raise serializers.ValidationError({"otp": "the session expired or already used"})
        
        otp_obj.is_used=True
        otp_obj.save()

        user.is_active=True
        user.save()
        
        data['user'] = user
        return data
        