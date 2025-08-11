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
import os

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
        user.is_active = False
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
        model = VendorDocuments
        fields = ['pan_card', 'aadhar_passport_dl']


class Step4BusinessDocsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocuments
        fields = ['gst_certificate', 'business_registration_cert', 'shop_license']



class Step5BankTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocuments
        fields = ['cancelled_cheque', 'bank_statement', 'it_return', 'financial_statement']


class Step6AgreementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocuments
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
        

# from rest_framework import serializers
# from .models import VendorProfile, VendorDocuments
# import os

# class VendorDocumentsSerializer(serializers.ModelSerializer):
    
#     class Meta:
#         model = VendorDocuments
#         fields = [
#             'pan_card_status',
#             'aadhar_passport_dl_status',
#             'gst_certificate_status',
#             'business_registration_cert_status',
#             'shop_license_status',
#             'cancelled_cheque_status',
#             'bank_statement_status',
#             'it_return_status',
#             'financial_statement_status',
#             'dealership_letter_status',
#             'authorized_signatory_letter_status',
#             'vendor_registration_form_status',
#             'signed_terms_and_con_status',
#             'is_verified', 'submitted_at',
#         ]

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.custom_user = self.context.get('custom_user')

        
#     def validate(self,attrs):
        
#         valid_statuses = [choice[0] for choice in VendorDocuments.STATUS_CHOICES]
#         for field in['pan_card_status','aadhar_passport_dl_status','gst_certificate_status','business_registration_cert_status','shop_license_status',
#                      'cancelled_cheque_status','bank_statement_status ', 'it_return_status','financial_statement_status','dealership_letter_status ',
#                      'authorized_signatory_letter_status','vendor_registration_form_status','signed_terms_and_con_status'
#                      ]:
#             value=attrs.get(field)
#             if value and value not in valid_statuses:
#                 raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}.")

#         return attrs
#     def update(self,instance,validated_data):
#         rejected_fileds=[]
#         for field, value in validated_data.items():
#             if field.endswith('_status'):
#                 setattr(instance,field,value)

#     def validate_pan_card_status(self, value):
        
#         valid_statuses = [choice[0] for choice in VendorDocuments.STATUS_CHOICES]
#         if value not in valid_statuses:
#             raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}.")
#         instance = self.instance
        
#         if instance:
#             print(f"PAN card status updated to: {value}")
#             instance.pan_card_status = value
#             instance.update_profile_status()
#             instance.save()  # Save the instance to persist changes
#         return value

#     def validate_aadhar_passport_dl_status(self, value):

#         valid_statuses = [choice[0] for choice in VendorDocuments.STATUS_CHOICES]
#         if value not in valid_statuses:
#             raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}.")
#         instance = self.instance
#         print(f' instance:   {instance}')
#         if instance:
#             instance.aadhar_passport_dl_status = value
#             instance.update_profile_status()
#             instance.save()  
#         return value


#     def validate_gst_certificate_status(self, value):

#         valid_statuses = [choice[0] for choice in VendorDocuments.STATUS_CHOICES]
#         if value not in valid_statuses:
#             raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}.")
#         instance = self.instance
#         if value =='approved':
#             if instance.gst_certificate:
#                 instance.gst_certificate_status = value
#                 instance.update_profile_status()
#                 instance.save()  
#             else:
#                 raise serializers.ValidationError("first upload file then approve")
        
#         return value

#     # Add similar validate_<field> methods for other document fields if needed
#     def validate_business_registration_cert(self, value):
#         if not value:
#             print("Business registration certificate not uploaded.")
#             return value
#         print(f"Business registration certificate uploaded: {value.name}")
#         return value

#     def validate_shop_license(self, value):
#         if not value:
#             print("Shop license not uploaded.")
#             return value
#         print(f"Shop license uploaded: {value.name}")
#         return value

#     def validate_cancelled_cheque(self, value):
#         if not value:
#             print("Cancelled cheque not uploaded.")
#             return value
#         print(f"Cancelled cheque uploaded: {value.name}")
#         return value

#     def validate_bank_statement(self, value):
#         if not value:
#             print("Bank statement not uploaded.")
#             return value
#         print(f"Bank statement uploaded: {value.name}")
#         return value

#     def validate_it_return(self, value):
#         if not value:
#             print("IT return not uploaded.")
#             return value
#         print(f"IT return uploaded: {value.name}")
#         return value

#     def validate_financial_statement(self, value):
#         if not value:
#             print("Financial statement not uploaded.")
#             return value
#         print(f"Financial statement uploaded: {value.name}")
#         return value

#     def validate_dealership_letter(self, value):
#         if not value:
#             print("Dealership letter not uploaded.")
#             return value
#         print(f"Dealership letter uploaded: {value.name}")
#         return value

#     def validate_authorized_signatory_letter(self, value):
#         if not value:
#             print("Authorized signatory letter not uploaded.")
#             return value
#         print(f"Authorized signatory letter uploaded: {value.name}")
#         return value

#     def validate_vendor_registration_form(self, value):
#         if not value:
#             print("Vendor registration form not uploaded.")
#             return value
#         print(f"Vendor registration form uploaded: {value.name}")
#         return value

#     def validate_signed_terms_and_con(self, value):
#         if not value:
#             print("Signed terms and conditions not uploaded.")
#             return value
#         print(f"Signed terms and conditions uploaded: {value.name}")
#         return value

# class VendorProfileSerializer(serializers.ModelSerializer):
#     documents = VendorDocumentsSerializer()

#     class Meta:
#         model = VendorProfile
#         fields = '__all__'

#     def update(self, instance, validated_data):
#         documents_data = validated_data.pop('documents', None)
#         instance = super().update(instance, validated_data)

#         if documents_data:
#             documents, created = VendorDocuments.objects.get_or_create(vendor_profile=instance)
#             documents_serializer = VendorDocumentsSerializer(documents, data=documents_data, partial=True)
#             if documents_serializer.is_valid():
#                 documents_serializer.save()
#             else:
#                 raise serializers.ValidationError(documents_serializer.errors)
#         return instance
    
from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings
from .models import VendorDocuments, CustomUser

class VendorDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocuments
        fields = [
            'pan_card', 'pan_card_status',
            'aadhar_passport_dl', 'aadhar_passport_dl_status',
            'gst_certificate', 'gst_certificate_status',
            'business_registration_cert', 'business_registration_cert_status',
            'shop_license', 'shop_license_status',
            'cancelled_cheque', 'cancelled_cheque_status',
            'bank_statement', 'bank_statement_status',
            'it_return', 'it_return_status',
            'financial_statement', 'financial_statement_status',
            'dealership_letter', 'dealership_letter_status',
            'authorized_signatory_letter', 'authorized_signatory_letter_status',
            'vendor_registration_form', 'vendor_registration_form_status',
            'signed_terms_and_con', 'signed_terms_and_con_status',
            'profile_status', 'is_verified', 'submitted_at'
        ]
        read_only_fields = ['profile_status', 'is_verified', 'submitted_at']

    def validate(self, data):
        
        document_fields = [
            ('pan_card', 'pan_card_status'),
            ('aadhar_passport_dl', 'aadhar_passport_dl_status'),
            ('gst_certificate', 'gst_certificate_status'),
            ('business_registration_cert', 'business_registration_cert_status'),
            ('shop_license', 'shop_license_status'),
            ('cancelled_cheque', 'cancelled_cheque_status'),
            ('bank_statement', 'bank_statement_status'),
            ('it_return', 'it_return_status'),
            ('financial_statement', 'financial_statement_status'),
            ('dealership_letter', 'dealership_letter_status'),
            ('authorized_signatory_letter', 'authorized_signatory_letter_status'),
            ('vendor_registration_form', 'vendor_registration_form_status'),
            ('signed_terms_and_con', 'signed_terms_and_con_status'),
        ]

        errors = {}
        instance = self.instance

        for doc_field, status_field in document_fields:
            if status_field in data:
                new_status = data[status_field]
                
                # doc_value=getattr(instance,doc_field) if instance else None
                print(f"docvalues: {doc_value}")
                
                if new_status in ['approved', 'rejected'] :
                    # errors[status_field] = f"Cannot set {status_field} to {new_status} because {doc_field} is not uploaded."
                    # Check if the document file exists
                    doc_value = getattr(instance, doc_field) if instance else None
                    if not doc_value:
                        errors[status_field] = f"Cannot set {status_field} to {new_status} because {doc_field} is not uploaded."
                    if instance and new_status == 'rejected':
                        current_status = getattr(instance, status_field)
                        print(f"current staus: {current_status}")
                        print(f"current: {current_status}")
                        if current_status == 'approved':
                            errors[status_field] = f"Cannot change {status_field} from 'approved' to 'rejected'."

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def update(self, instance, validated_data):
        
        rejected_docs = []
        document_fields = [

            'pan_card_status', 'aadhar_passport_dl_status', 'gst_certificate_status',
            'business_registration_cert_status', 'shop_license_status',
            'cancelled_cheque_status', 'bank_statement_status', 'it_return_status',
            'financial_statement_status', 'dealership_letter_status',
            'authorized_signatory_letter_status', 'vendor_registration_form_status',
            'signed_terms_and_con_status'
        ]

        # Track rejected documents for email notification
        
        for status_field in document_fields:
            if status_field in validated_data:
                new_status = validated_data[status_field]
                if new_status == 'rejected':
                    rejected_docs.append(status_field.replace('_status', '').replace('_', ' ').title())

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        instance.update_profile_status()

        if rejected_docs:
            custom_user = self.context.get('custom_user')
            if custom_user and custom_user.email:
                subject = "Vendor Document Rejection Notification"
                message = (
                    f"Dear {custom_user.username},\n\n"
                    f"The following documents have been rejected:\n"
                    f"{', '.join(rejected_docs)}\n\n"
                    "Please review and re-upload the necessary documents.\n"
                    "Thank you,\nVendor Management Team"
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[custom_user.email],
                    fail_silently=True,
                )

        return instance