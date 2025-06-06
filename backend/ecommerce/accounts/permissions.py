from rest_framework.permissions import BasePermission

class IsVendor(BasePermission):
     def has_permission(self, request, view):
          return request.user.is_authenticated and request.user.groups.filter(name='vendor').exists()
     
class IsAdmin(BasePermission):
     def has_permission(self, request, view):
          return request.user.is_authenticated and request.user.groups.filter(name='admin').exists()