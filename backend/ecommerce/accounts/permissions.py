from rest_framework.permissions import BasePermission
from .models import CustomUser, VendorProfile

class IsVendor(BasePermission):
     def has_permission(self, request, view):
          return request.user.is_authenticated and request.user.groups.filter(name='Vendor').exists()
     
class IsAdmin(BasePermission):
     def has_permission(self, request, view):
          return request.user.is_authenticated and (request.user.is_superuser or request.user.groups.filter(name='Admin').exists())

class IsVendorProfileComplete(BasePermission):
     message = "Vendor profile is incomplete. Please complete your registration."


     def has_permission(self, request, view):
          user = request.user
          if not user.is_authenticated:
               return False
          try:
               vendor_profile = user.vendor_profile  
               documents = vendor_profile.vendordocuments 
               return documents.is_registration_complete()
          except (VendorProfile.DoesNotExist, VendorDocuments.DoesNotExist):
               return False