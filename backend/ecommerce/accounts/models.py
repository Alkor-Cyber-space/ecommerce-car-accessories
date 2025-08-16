from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.timezone import now
from hashlib import sha256
from datetime import datetime, timedelta
from django.utils import timezone


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_admin_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    def __str__(self):
        return self.username
# models.py

class VendorProfile(models.Model):

     VENDOR_TYPE = [
          ('business','business')
     ]

     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='vendor_profile')

     # Step 2: Company Details
     company_name = models.CharField(max_length=255, null=True, blank=True)
     type_of_vendor = models.CharField(max_length=20, choices=VENDOR_TYPE, default='business')
     company_email = models.EmailField(null=True,blank=True)
     company_number = models.IntegerField(null=True,blank=True)

     # Step 3: Contact Details
     contact_name = models.CharField(max_length=255, null=True, blank=True)
     contact_email = models.EmailField(null=True, blank=True)
     contact_number = models.IntegerField(null=True, blank=True)
     designation = models.CharField(null=True, blank=True)
     # Step 4: KYC Documents
     pan_card = models.FileField(upload_to='kyc/pan/', null=True, blank=True)
     aadhar_passport_dl = models.FileField(upload_to='kyc/id/', null=True, blank=True)

     # Step 5: Business Documents
     gst_certificate = models.FileField(upload_to='business/gst/', null=True, blank=True)
     business_registration_cert = models.FileField(upload_to='business/registration/', null=True, blank=True)
     shop_license = models.FileField(upload_to='business/shop_license/', null=True, blank=True)

     # Step 6: Bank and Tax Details
     cancelled_cheque = models.FileField(upload_to='bank/cheque/', null=True, blank=True)
     bank_statement = models.FileField(upload_to='bank/statement/', null=True, blank=True)
     it_return = models.FileField(upload_to='finance/it_return/', null=True, blank=True)
     financial_statement = models.FileField(upload_to='finance/statement/', null=True, blank=True)

     # step 8 Supporting Documents (optional)
     dealership_letter = models.FileField(upload_to='supporting/dealership/', null=True, blank=True)
     authorized_signatory_letter = models.FileField(upload_to='supporting/signatory/', null=True, blank=True)
     vendor_registration_form = models.FileField(upload_to='supporting/regform/', null=True, blank=True)
     signed_terms_and_con = models.FileField(upload_to='supporting/termsandcondition/', null=True, blank=True)

     is_verified = models.BooleanField(default=False)
     submitted_at = models.DateTimeField(auto_now_add=True)

     def is_registration_complete(self):
          required_fields = [
               self.company_name,
               self.company_email,
               self.company_number,
               self.contact_name,
               self.contact_email,
               self.contact_number,
               self.designation,
               self.pan_card,
               self.aadhar_passport_dl,
               self.gst_certificate,
               self.business_registration_cert,
               self.shop_license,
               self.cancelled_cheque,
               self.bank_statement,
               self.it_return,
               self.financial_statement,
          ]
          return all(required_fields)


     def __str__(self):
          return self.user.email


class UserOTPS(models.Model):
     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="reverse_Userotp_details")
     hashed_code = models.CharField(max_length=100, blank=False, null=False)
     created_at = models.DateTimeField(auto_now_add=True)
     expires_at = models.DateTimeField()
     updated_at = models.DateTimeField(auto_now=True)
     is_verified = models.BooleanField(default=False)
     is_used = models.BooleanField(default=False)
     is_expired = models.BooleanField(default=False)
     limit = models.IntegerField(default=3)
     is_limit_reached_at = models.DateTimeField(null=True, blank=True)

     def __str__(self):
          return f"user-otp:{self.user.username}"
     
     def save(self, *args, **kwargs):
          if not self.expires_at:
               self.expires_at = self.created_at + timedelta(minutes=5)
          return super().save( *args, **kwargs)
          
     def set_code(self, raw_code):
          self.hashed_code = sha256(raw_code.encode('utf-8')).hexdigest()

     def check_code(self, raw_code):
          return self.hashed_code == sha256(raw_code.encode('utf-8')).hexdigest()
     
     class Meta:
          ordering = ['created_at']  # Order by created_at
          verbose_name = 'User OTP'
          verbose_name_plural = 'User OTPs'
          db_table = 'user_otp'


class ThrottleLog(models.Model):
    # user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    endpoint = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=now)
    reason = models.TextField()

    def __str__(self):
        return f"{self.ip_address} @ {self.endpoint} - {self.timestamp}"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.user.email


class Address(models.Model):
     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
     line1 = models.CharField(max_length=255)
     line2 = models.CharField(max_length=255, blank=True, null=True)
     city = models.CharField(max_length=100)
     state = models.CharField(max_length=100)
     postal_code = models.CharField(max_length=20)
     country = models.CharField(max_length=100)
     is_primary = models.BooleanField(default=False)

     def __str__(self):
          return f"{self.line1}, {self.city}, {self.country}"
    

class UserLocation(models.Model):
     user = models.OneToOneField(
          settings.AUTH_USER_MODEL,
          on_delete=models.CASCADE,
          related_name='location'
     )
     latitude = models.DecimalField(max_digits=9, decimal_places=6)
     longitude = models.DecimalField(max_digits=9, decimal_places=6)
     city = models.CharField(max_length=100, blank=True, null=True)
     state = models.CharField(max_length=100, blank=True, null=True)
     country = models.CharField(max_length=100, blank=True, null=True)
     manually_selected = models.BooleanField(default=False)
     updated_at = models.DateTimeField(auto_now=True)

     def __str__(self):
          return f"{self.user.email} - {self.latitude}, {self.longitude}"

class FCMToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class OTP(models.Model):
     user=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='otps')
     otp=models.CharField(max_length=4)
     created_at=models.DateTimeField(auto_now_add=True)
     expire_at=models.DateTimeField()
     is_used=models.BooleanField(default=False)

     def is_valid(self):
          now=timezone.now()
          return not self.is_used and now <=self.expire_at

     def __str__(self):
          return f"OTP{self.otp} for {self.user.email}" 