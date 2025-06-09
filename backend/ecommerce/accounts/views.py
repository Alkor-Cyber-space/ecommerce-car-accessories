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
from rest_framework.throttling import ScopedRateThrottle
from django.contrib.auth import authenticate
from rest_framework.decorators import action

from django.conf import settings
from .twilio_services import send_otp_via_twilio, verify_otp_via_twilio
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
    throttle_classes = [ScopedRateThrottle]

    throttle_scope_map = {
        'send_otp': 'otp_send',
        'verify_otp': 'otp_verify',
    }

    def get_throttles(self):
        print("ACTION:", self.action)
        self.throttle_scope = self.throttle_scope_map.get(self.action)
        print("Throttle scope:", self.throttle_scope)
        return super().get_throttles()

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    #send OTP via SMS service here
    def send_otp(self, request):

        serializer = PhoneNumberValidateSerializer(data=request.data)

        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')

            if not phone_number:
                return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)
        
            try:
                send_otp_via_twilio(phone_number=phone_number)
                masked = '*' * (len(phone_number) - 3) + phone_number[-3:]
                return Response({"message": f"OTP sent successfully to {masked}"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_otp(self, request):
        serializer = UserOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            otp_code = serializer.validated_data['otp']

            try:
                result = verify_otp_via_twilio(phone, otp_code)
                if result == "approved":
                    # user = CustomUser.objects.get(phone_number=phone)
                    # user.is_active = True
                    # user.save()
                    return Response({"message": "OTP verified"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)