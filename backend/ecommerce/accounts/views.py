import random
from django.shortcuts import render
from django.contrib.auth.models import User
from . serializers import *
from rest_framework import viewsets
from django.contrib.auth.models import Group
from .models import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdmin, IsVendor

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import action

# Create your views here.

class UserViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
            except Group.DoesNotExist:
                return Response({"error": "Role does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def home(self, request):
        serializer = UserSerializer(request.user)
        return Response({"user": serializer.data})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class OTPViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    #send OTP via SMS service here
    def send_otp_or_resent(self, request):

        purpose = request.data.get('purpose')

        

        serializer = PhoneNumberValidateSerializer(data=request.data)

        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')

            if not phone_number:
                return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

            otp = str(random.randint(100000, 999999))

            try:
                user = User.objects.get(phone_number=phone_number)

                # Get or create OTP object for user
                user_otp, created = UserOTPS.objects.get_or_create(user=user)

                # Set new OTP code
                user_otp.set_code(otp)
                user_otp.created_at = datetime.now()
                user_otp.expires_at = datetime.now() + timedelta(minutes=5)
                user_otp.is_used = False
                user_otp.is_verified = False
                user_otp.is_expired = False
                user_otp.save()


                return Response({"message": "OTP sent successfully", "otp": otp}, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_otp(self, request):
        serializer = UserOTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            otp_record = serializer.validated_data['otp_record']

            user.is_active = True
            user.save()

            otp_record.is_verified = True
            otp_record.is_used = True
            otp_record.save()

            return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def resent_otp(self, request):
        serializer = PhoneNumberValidateSerializer(data=request.data)

        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')

            if not phone_number:
                return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

            otp = str(random.randint(100000, 999999))
