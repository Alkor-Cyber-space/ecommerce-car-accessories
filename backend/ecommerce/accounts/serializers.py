import re
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import *
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import password_validation


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password')
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
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'groups']

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
