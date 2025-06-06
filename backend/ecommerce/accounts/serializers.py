import re
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import *
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

class CreateUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(max_length=10, write_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role', 'User')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        group = Group.objects.get(name=role)
        user.groups.add(group)
        return user

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password', 'phone_number')

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'groups']

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
    
     phone_number = serializers.CharField(max_length=10)
     code = serializers.CharField(max_length=2)

     def validate(self, attrs):
          phone_number = attrs.get('phone_number')
          code = attrs.get('code')
          if not phone_number or not code:
               raise serializers.ValidationError('Phone number and code are required.')
          
          # Check if the phone number is valid
          if not re.match(r'^\d{10}$', phone_number):
              raise serializers.ValidationError('Invalid phone number.')
          
          return attrs

class UserOTPSerializer(serializers.ModelSerializer):
    
     class Meta:
          model = UserOTPS
          fields = ['phone_number', 'otp']
          extra_kwargs = {'otp': {'required': True}, 'phone_number': {'required': True}}

     def create(self, validated_data):
         user = UserOTPS.objects.create(**validated_data)
         return user
     
class UserOTPVerifySerializer(serializers.Serializer):
     phone_number = serializers.CharField()
     otp = serializers.CharField()

     def validate(self, attrs):
          phone = attrs.get('phone_number')
          otp = attrs.get('otp')

          if not re.match(r'^\d{10}$', phone):
               raise serializers.ValidationError("Invalid phone number")

          if not re.match(r'^\d{4,6}$', otp):
               raise serializers.ValidationError("Invalid OTP format")

          try:
               user = CustomUser.objects.get(phone_number=phone)
          except CustomUser.DoesNotExist:
               raise serializers.ValidationError("User does not exist")

          try:
               user_otp = UserOTPS.objects.get(user=user)
          except UserOTPS.DoesNotExist:
               raise serializers.ValidationError("No OTP found for this user")

          if user_otp.is_verified:
               raise serializers.ValidationError("OTP already verified")

          if user_otp.is_expired or user_otp.expires_at < datetime.now():
               user_otp.is_expired = True
               user_otp.save()
               raise serializers.ValidationError("OTP expired")

          if user_otp.is_used:
               raise serializers.ValidationError("OTP already used")

          if not user_otp.check_code(otp):
               user_otp.limit -= 1
               if user_otp.limit <= 0:
                    user_otp.is_limit_reached_at = datetime.now()
               user_otp.save()
               raise serializers.ValidationError("Incorrect OTP")

          # OTP is correct
          attrs['user'] = user
          attrs['otp_record'] = user_otp
          return attrs

class UserOTPResendSerializer(serializers.ModelSerializer):
     class Meta:
          model = UserOTPS
          fields = ['phone_number']
          extra_kwargs = {'phone_number': {'required': True}}

     def create(self, validated_data):
          user = UserOTPS.objects.create(**validated_data)
          return user
                
