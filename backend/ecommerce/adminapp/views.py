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
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from products.serializers import CategorySerializer
from vehicles.serializers import VehicleFullEntrySerializer
from products.models import Category
from vehicles.models import VehicleMake, VehicleModel, VehicleVariant
from products.models import *
from .serializers import *
from accounts.models import VendorDocuments
from accounts.mixin import AuditLogMixin

User = get_user_model()
# Create your views here.

class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')

        if not email_or_username or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Try fetching user by email or username
        user = User.objects.filter(email=email_or_username).first()
        if not user:
            user = User.objects.filter(username=email_or_username).first()
        
        if not user:
            return Response({"error": "No account found with the provided email/username."}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({"error": "Incorrect password."}, status=status.HTTP_401_UNAUTHORIZED)

        if user and user.check_password(password):
            if user.groups.filter(name='Admin').exists():  # or `user.role == 'admin'` if you're using a field
                refresh = RefreshToken.for_user(user)
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "role": "admin"
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Only Admin users can login here."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


class CreateAdminUserAPIView(APIView):
    permission_classes = [IsAdmin, IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        phone_number = request.data.get('phone_number')
        print(f"**********{email, username, password, phone_number}***********")

        if not all([email, username, password,phone_number]):
            return Response({"error": "Email, username, password and phone_number are required."}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(phone_number=phone_number).exists():
            return Response({"error": "User with this phone number already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.create(
            email=email,
            username=username,
            password=make_password(password),
            phone_number=phone_number,
            is_admin_staff=True
        )

        admin_group, _ = Group.objects.get_or_create(name='Admin')
        user.groups.add(admin_group)

        return Response({"message": "Admin user created successfully."}, status=status.HTTP_201_CREATED)


class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get users marked as admin or superuser
        admin_users = CustomUser.objects.filter(
            is_active=True
        ).filter(
            is_superuser=True
        ) | CustomUser.objects.filter(
            is_admin_staff=True
        ) | CustomUser.objects.filter(
            groups__name='Admin'
        )

        # Remove duplicates (in case a user meets more than one condition)
        admin_users = admin_users.distinct()

        serializer = UserSerializer(admin_users, many=True)
        return Response(serializer.data)
    def post(self,request):
        id=request.data.get("id",None)
        if not id :
            return Response({"status":"failed","status_code":status.HTTP_400_BAD_REQUEST,"message": "Id ismandatory"})
        user=CustomUser.objects.filter(id=id,is_admin_staff=True)
        if not user:
            return Response({"status":"failed","status_code":status.HTTP_400_BAD_REQUEST,"message":"not an employee"})
        serializer= UserSerializer(user,many=True)
        return Response({"status":"success","status_code":status.HTTP_200_OK,"data":serializer.data})
class VendorDetailsList(APIView):
    def post(self, request, *args, **kwargs):
        pk = request.data.get("pk")
        if not pk:
            return Response(
                {"message": "pk is required", "status": status.HTTP_400_BAD_REQUEST}
            )
        print("above the try")
        try:
            print("inside the try")
            print(f"filter :{Group.objects.get(name="Vendor")}")
            vendor_group = Group.objects.get(name="Vendor")
            print(f"vendor_group: {vendor_group}")

        except Exception as e:
            message = str(e)
            return Response({"status":"failed","response_code":status.HTTP_500_INTERNAL_SERVER_ERROR,"message":message})
        user = (CustomUser.objects.filter(id=pk, groups=vendor_group).select_related("vendor_profile").first())

        if not user:
            return Response(
                {"message": "Vendor user does not exist", "status": status.HTTP_404_NOT_FOUND}
            )

        serializer = VendorDetailsSerializer(user)
        return Response(
            {"message": "Successfully fetched vendor data", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
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

# Category CRUD by Vendor
class AdminCategoryViewSet(AuditLogMixin,viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminVehicleCreate(APIView):
    def post(self, request):
        serializer = VehicleFullEntrySerializer(data=request.data)
        if serializer.is_valid():
            variant = serializer.save()
            return Response({
                "message": "Vehicle entry saved successfully.",
                "data": {
                    "make": variant.make.name,
                    "model": variant.model.name,
                    "variant": variant.variant,
                    "year": variant.year
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class VendorViewProductAPIView(APIView):

    def post(self,request):
        pk=request.data.get('pk')
        if not pk:
            return Response({
                "status" : "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "pk is mandatory"
            },status=status.HTTP_400_BAD_REQUEST)
        
        custom_user=Product.objects.filter(vendor_id=pk)
        if not custom_user:
            return Response({
                "status" : "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "user does not exist"
            },status=status.HTTP_400_BAD_REQUEST)
        
        serializer=VendorViewProductSerilizer(custom_user , many=True)
        return Response({
            "status" : "success",
            "code": status.HTTP_200_OK,
            "data": serializer.data
        },status=status.HTTP_200_OK)


class UnverifiedVendorsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        unverified_vendors = VendorDocuments.objects.filter(is_verified=False)
        serializer = VendorDocumentsSerializer(unverified_vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminVehicleUpdate(APIView):
    def put(self, request, pk):
        try:
            variant = VehicleVariant.objects.get(pk=pk)
        except VehicleVariant.DoesNotExist:
            return Response({"error": "Vehicle entry not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VehicleFullEntrySerializer(instance=variant, data=request.data)
        if serializer.is_valid():
            updated_variant = serializer.save()
            return Response({
                "message": "Vehicle entry updated successfully.",
                "data": {
                    "make": updated_variant.make.name,
                    "model": updated_variant.model.name,
                    "variant": updated_variant.variant,
                    "year": updated_variant.year
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminVehicleDelete(APIView):
    def delete(self, request, pk):
        try:
            variant = VehicleVariant.objects.get(pk=pk)
            variant.delete()
            return Response({"message": "Vehicle entry deleted successfully."}, status=status.HTTP_200_OK)
        except VehicleVariant.DoesNotExist:
            return Response({"error": "Vehicle entry not found."}, status=status.HTTP_404_NOT_FOUND)

