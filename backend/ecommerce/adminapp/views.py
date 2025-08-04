from django.shortcuts import render
from rest_framework import viewsets
from .serializers import UserSerializer, VendorSerializer
from accounts.models import CustomUser, VendorProfile
from accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, status, permissions, serializers
from django.shortcuts import get_object_or_404
# Create your views here.

class VendorListViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin, IsAuthenticated]

    def get_queryset(self):
        vendor_group = Group.objects.get(name='Vendor')
        return CustomUser.objects.filter(groups=vendor_group)

    # @action(detail=True, methods=['post'], url_path='approve')
    # def approve_vendor(self, request, pk=None):
    #     vendor = self.get_object()
    #     vendor.is_active = True
    #     vendor.save()
    #     return Response({'message': 'Vendor approved successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='suspend')
    def suspend_vendor(self, request, pk=None):
        vendor = self.get_object()
        vendor.is_active = False
        vendor.save()
        return Response({'message': 'Vendor suspended successfully'}, status=status.HTTP_200_OK)

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin, IsAuthenticated]

    def get_queryset(self):
        user_group = Group.objects.get(name='User')
        return CustomUser.objects.filter(groups=user_group)

    #@action(detail=True,methods=['post'], url_path='approve')
    #def approve_user(self, request, pk=None):
    #    user = self.get_objects()
    #    user.is_active = True
    #    user.save()
    #    return Response({'message':'user added sucessfully'}, status=status.HTTP_200_Ok)

    @action(detail=True,methods=['post'], url_path='suspend')
    def suspend_user(self,request,pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message':'user blocked successfully'}, status=status.HTTP_200_OK)



class VendorApprove(generics.GenericAPIView):
    queryset = VendorProfile.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            vendor_profile = get_object_or_404(VendorProfile, pk=pk)
            print(vendor_profile)
            vendor_profile.is_verified = True
            vendor_profile.save()
            serializer = self.get_serializer(vendor_profile)
            return Response({
                "message": "Vendor approved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "message": "Error approving vendor.",
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)