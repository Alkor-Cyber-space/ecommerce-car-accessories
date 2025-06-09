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
    
     phone_number = serializers.CharField(max_length=13, required=True)

     def validate(self, attrs):
          """
          Validate phone number to ensure it includes a country code like +91 and is numeric.
          E.g., +919876543210
          """
          phone_number = attrs.get('phone_number')
          pattern = r'^\+\d{10,15}$'  # starts with + and has 10–15 digits
          if not re.match(pattern, phone_number):
               raise serializers.ValidationError("Invalid phone number. Must include country code and be numeric.")
          
          return attrs

class UserOTPSerializer(serializers.Serializer):
     phone_number = serializers.CharField(max_length=13,required=True)
     otp = serializers.CharField(max_length=6, required=True)
     
     def validate_phone_number(self, value):
        """
        Validate phone number to ensure it includes a country code like +91 and is numeric.
        E.g., +919876543210
        """
        pattern = r'^\+\d{10,15}$'  # starts with + and has 10–15 digits
        if not re.match(pattern, value):
            raise serializers.ValidationError("Invalid phone number. Must include country code and be numeric.")
        return value

     def validate_otp(self, value):
          """
          Validate OTP to ensure it's exactly 6 digits.
          """
          if not re.fullmatch(r'\d{6}', value):
               raise serializers.ValidationError("OTP must be a 6-digit number.")
          return value
     

class UserOTPResendSerializer(serializers.ModelSerializer):
     class Meta:
          model = UserOTPS
          fields = ['phone_number']
          extra_kwargs = {'phone_number': {'required': True}}

     def create(self, validated_data):
          user = UserOTPS.objects.create(**validated_data)
          return user
                
