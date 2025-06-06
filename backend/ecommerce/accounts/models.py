from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.timezone import now
from hashlib import sha256
from datetime import datetime, timedelta


# class CustomUser(AbstractUser):
#     # Additional fields if needed
#     pass

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15)
    is_admin_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    def __str__(self):
        return self.email


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