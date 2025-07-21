from rest_framework.permissions import BasePermission
from .models import CustomUser, VendorProfile

class IsVendor(BasePermission):
     def has_permission(self, request, view):
          return request.user.is_authenticated and request.user.groups.filter(name='Vendor').exists()
     
class IsAdmin(BasePermission):
     def has_permission(self, request, view):
          return request.user.is_authenticated and request.user.groups.filter(name='Admin').exists()

class IsVendorProfileComplete(BasePermission):
     def has_permission(self, request, view):
          user = request.user
          if not user.is_authenticated:
               return False
          try:
               profile = user.vendor_profile  
               return profile.is_registration_complete()
          except VendorProfile.DoesNotExist:
               return False