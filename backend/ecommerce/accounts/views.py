import random
from django.shortcuts import render
from django.contrib.auth import get_user_model
from . serializers import *
from rest_framework import viewsets
from django.contrib.auth.models import Group
from .models import *
from rest_framework.response import Response
from rest_framework import status,permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdmin, IsVendor
from rest_framework.views import APIView
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import ScopedRateThrottle
from django.contrib.auth import authenticate
from rest_framework.decorators import action
import string
from django.conf import settings
from .twilio_services import send_otp_via_twilio, verify_otp_via_twilio
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from .serializers import *
from rest_framework.generics import GenericAPIView
from firebase_admin import auth as firebase_auth
from . import firebase_config 
from django.db.models import Q

User = get_user_model()

# Create your views here.

class UserViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        email = request.data.get('email')

        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            if not existing_user.is_active:
                existing_user.delete()
            else:
                return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        otp= str(random.randint(1000,9999))
        OTP.objects.create(
            user=user,
            otp=otp,
            expire_at=timezone.now()+timedelta(minutes=10)
        )
        
        subject='User Register Otp'
        message= f'your OTP for User registeration is {otp}.it is valid for 10 minutes '
        from_email=settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]

        try:
            send_mail(subject,message,from_email,recipient_list,fail_silently=False)
        except Exception as e:
            user.delete()  # remove the inactive user
            print(f"Email send error: {e}")  
            return Response({
                "message": "USER created, but failed to send OTP. Please contact support.",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
            
        return Response({
            "message": "User created successfully. Please verify your email with the OTP sent.",
            "user_id": user.id
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def Verify(self,request):
        email_or_username=request.data.get('email_or_username')
        otp_input=request.data.get('otp')

        if not email_or_username or not otp_input: 
            return Response({
                "status":"failed",
                "code":status.HTTP_400_BAD_REQUEST,
                "message": "email_or_username and otp is madatory for verification"
            },status=status.HTTP_400_BAD_REQUEST 
            )
        user=CustomUser.objects.filter( Q(email=email_or_username) | Q(username=email_or_username)).first()
        print(f"user:{user}")
        if not user:
            return Response({
                "status":"Failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "The user name or email is valid , please register"
            },status=status.HTTP_400_BAD_REQUEST)
        otp_obj=OTP.objects.filter(user=user,otp=otp_input,is_used=False).last()
        if not otp_obj:
             return Response({
            "status": "failed",
            "message": "Invalid or expired OTP."
        }, status=status.HTTP_400_BAD_REQUEST)

        if not otp_obj.is_valid():
            return Response({
                "status": "failed",
                "message": "OTP has expired."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        otp_obj.is_used = True
        otp_obj.save()

        user.is_active = True  # or user.is_email_verified = True if using that field
        user.save()

        return Response({
            "status": "success",
            "message": "OTP verified successfully. Your account is now active."
        }, status=status.HTTP_200_OK)        
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')

        if not email_or_username or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        try:
            user = User.objects.filter(email=email_or_username,is_active=True).first()
            if not user:
                user = User.objects.filter(username=email_or_username).first()
            if user:
                user = authenticate(request, email=user.email, password=password)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        if user:
            if not user.is_active:
                return Response({"error": "User account is not active."}, status=status.HTTP_403_FORBIDDEN)
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

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def edit_profile(self, request):
        user = request.user

        if not user or not user.is_authenticated:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserEditSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    
    # @action(detail=False, methods=['post'], url_path='change-password', permission_classes=[IsAuthenticated])
    # def change_password(self, request):
    #     serializer = ChangePasswordSerializer(data=request.data)
    #     user = request.user

    #     if serializer.is_valid():
    #         old_password = serializer.validated_data['old_password']
    #         new_password = serializer.validated_data['new_password']

    #         if not user.check_password(old_password):
    #             return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)

    #         user.set_password(new_password)
    #         user.save()

    #         return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)

    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class VendorRegistrationViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='register', permission_classes=[AllowAny])
    def register_vendor(self, request):
        email = request.data.get('email')

        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer =  VendorRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Deactivate vendor until verification
        user.is_active = False
        user.save()

        # VendorProfile.objects.create(user=user)
        otp = ''.join(random.choices(string.digits, k=4))

        # Store OTP with 10-minute expiration
        OTP.objects.create(
            user=user,
            otp=otp,
            expire_at=timezone.now() + timedelta(minutes=10)
        )


        subject = 'Vendor Registration OTP'
        message = f'Your OTP for vendor registration is: {otp}. It is valid for 10 minutes.'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]

        try:
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            # Log the error if needed, but don't fail the registration
            return Response({
                "message": "Vendor created, but failed to send OTP. Please contact support.",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)

        return Response({
            "message": "Vendor created successfully. Please verify your email with the OTP sent.",
            "user_id": user.id
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile_details(self, request):
        try:
            vendor_profile = request.user.vendor_profile
            serializer = VendorProfileFullEditSerializer(vendor_profile)
            return Response(serializer.data)
        except VendorProfile.DoesNotExist:
            return Response({"error": "Vendor profile not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def edit_account(self, request):
        user = request.user

        if not user or not user.is_authenticated:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserEditSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def edit_profile(self, request):
        user = request.user
        try:
            vendor_profile = user.vendor_profile
        except VendorProfile.DoesNotExist:
            return Response({"error": "Vendor profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VendorProfileFullEditSerializer(vendor_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Vendor profile updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='login', permission_classes=[AllowAny])
    def login(self, request):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')
        print("Email or Username:", email_or_username)
        print("Password:", password)
        if not email_or_username or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check for user by email or username
        user = User.objects.filter(email=email_or_username).first()
        print("User found by email:", user)
        if not user:
            user = User.objects.filter(username=email_or_username).first()
            print("User found by username:", user)
        print("User found:", user)
        if user:
            print(user.email, user.username)
            print("Checking user credentials:", user)
            # Verify password directly against the stored hashed password
            if user.check_password(password):
                print("Password verified for user:", user)
                # Check if user is in Vendor group
                if user.groups.filter(name='Vendor').exists():
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Only Vendor users can login here."}, status=status.HTTP_403_FORBIDDEN)
            else:
                print("Password verification failed for user:", user)
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            print("User not found for email/username:", email_or_username)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post','put'], url_path='step1/(?P<user_id>[^/.]+)')
    def step1_company_details(self, request, user_id):
        print(f'User ID: {user_id}')
        try:
            print(f"user_id ::{user_id}")
            profile = User.objects.get(id=user_id)
            print(f'***************{profile}')
        except User.DoesNotExist:
            return Response({"error": "vendor not registered"}, status=status.HTTP_404_NOT_FOUND)
        
        profile, created = VendorProfile.objects.get_or_create(user=profile)

        serializer = Step1CompanySerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Company details saved","data":serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post','put'], url_path='step2/(?P<user_id>[^/.]+)')
    def step2_contact_details(self, request, user_id):
        try:
            profile = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        profile, created = VendorProfile.objects.get_or_create(user=profile)

        serializer = Step2ContactSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Contact details saved","data":serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post','put'], url_path='step3/(?P<user_id>[^/.]+)')
    def step3_kyc_documents(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        vendor_profile, _ = VendorProfile.objects.get_or_create(user=user)

        vendor_documents, _ = VendorDocuments.objects.get_or_create(vendor_profile=vendor_profile)

        serializer = Step3KYCSerializer(vendor_documents, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "KYC documents uploaded","data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post','put'], url_path='step4/(?P<user_id>[^/.]+)')
    def step4_business_documents(self, request, user_id):
        try:
            profile = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        vendor_profile, _ = VendorProfile.objects.get_or_create(user=profile)

        vendor_documents, _ = VendorDocuments.objects.get_or_create(vendor_profile=vendor_profile)


        serializer = Step4BusinessDocsSerializer(vendor_documents, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Business documents uploaded","data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post','put'], url_path='step5/(?P<user_id>[^/.]+)')
    def step5_bank_tax_details(self, request, user_id):
        try:
            profile = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
                
        vendor_profile, _ = VendorProfile.objects.get_or_create(user=profile)

        vendor_documents, _ = VendorDocuments.objects.get_or_create(vendor_profile=vendor_profile)

        serializer = Step5BankTaxSerializer(vendor_documents, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Bank and tax details saved","data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post','put'], url_path='step6/(?P<user_id>[^/.]+)')
    def step6_supporting_documents(self, request, user_id):
        try:
            profile = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        

        vendor_profile, created = VendorProfile.objects.get_or_create(user=profile)
        vendor_documents, _ = VendorDocuments.objects.get_or_create(vendor_profile=vendor_profile)

        serializer = Step6AgreementsSerializer(vendor_documents, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Supporting documents uploaded and vendor activated","data": serializer.data}, status=status.HTTP_200_OK)


# class VendorProfileEditAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#     def put(self, request, user_id):
#         try:
#             profile = VendorProfile.objects.get(user_id=user_id)
#         except VendorProfile.DoesNotExist:
#             return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)

#         serializer = VendorProfileFullEditSerializer(instance=profile, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({
#                 "message": "Vendor profile updated successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class UserProfileEditAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request, user_id):
#         try:
#             user = User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         serializer = UserProfileUpdateSerializer(instance=user, data=request.data, context={'request': request}, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "User profile updated successfully"}, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginAPIView(APIView):
    def post(self, request):
        id_token = request.data.get("idToken")
        if not id_token:
            return Response({'error': 'idToken is required'}, status=400)

        try:
            # Verify Firebase token
            decoded = firebase_auth.verify_id_token(id_token)
            email = decoded.get('email')
            uid = decoded.get('uid')
            name = decoded.get('name', 'User')
            picture = decoded.get('picture', '')

            # Get or create user in your backend
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': name}
            )

            # Optionally: update profile picture or UID if needed

            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=400)

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
           

    def resent_otp(self, request):
        # serializer = UserResendOTPSerializer(data=request.data)
        # if serializer.is_valid():
        #     phone_number = serializer.validated_data['phone_number']
        ...


class PasswordResetViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='forgot-password')
    def forgot_password(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_link = f"http://localhost:8000/api/auth/password/reset-password/{uid}/{token}/"  # Replace with your frontend URL

                send_mail(
                    subject="Password Reset Request",
                    message=f"Click the link to reset your password: {reset_link}",
                    from_email="nandakishore.p.r2002@gmail.com",
                    recipient_list=[email],
                    fail_silently=False,
                )
            return Response({"message": "A reset link has been sent to this mail."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='reset-password/(?P<uidb64>[^/.]+)/(?P<token>[^/.]+)')
    def reset_password(self, request, uidb64=None, token=None):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

            if default_token_generator.check_token(user, token):
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({"message": "Password has been reset successfully."})
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the current logged-in user
        serializer.save(user=self.request.user)


class SaveFCMTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        print(token)
        if token:
            FCMToken.objects.update_or_create(user=request.user, defaults={'token': token})
            return Response({"message": "Token saved"})
        return Response({"error": "No token provided"}, status=400)

class OTPVerification(GenericAPIView):
    serializer_class=OTPVerificationSerializer
    permission_classes=[AllowAny]

    def post(self,request):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=serializer.validated_data['user']
        return Response({
            "message":"otp verified successfully",
            "user_id": user.id
        },status=status.HTTP_200_OK)
    
class ResendOptVerification(GenericAPIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_active:
            return Response({"error": "User is already verified."}, status=status.HTTP_400_BAD_REQUEST)

        otp = ''.join(random.choices(string.digits, k=4))
        OTP.objects.create(
            user=user,
            otp=otp,
            expire_at=timezone.now() + timedelta(minutes=10)
        )

        subject = 'Vendor Registration OTP (Resend)'
        message = f'Your new OTP for vendor registration is: {otp}. It is valid for 10 minutes.'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]

        try:
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        except Exception as e:
            return Response({"error": "Failed to send OTP. Please contact support."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "OTP resent successfully."}, status=status.HTTP_200_OK)
    

class VendorProfileUpdateView(APIView):
    # permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            profile = VendorProfile.objects.get(user_id=pk)
            
            return profile
        except VendorProfile.DoesNotExist:
            return None

    def get(self, request, pk):
        profile = self.get_object(pk)    
        if not profile:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        documents, _ = VendorDocuments.objects.get_or_create(vendor_profile=profile)
        serializer = VendorDocumentsSerializer(documents)
        return Response(serializer.data)

    def put(self, request, pk):
        profile = self.get_object(pk)
        if profile:
            custom_user=CustomUser.objects.get(id=pk)
        
        if not profile:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        documents, _ = VendorDocuments.objects.get_or_create(vendor_profile=profile)
        serializer = VendorDocumentsSerializer(documents, data=request.data, partial=True,context={'custom_user': custom_user} ) # Fixed: Pass custom_user as a dictionary value)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VendorDocumentsFinalApprovalView(APIView):

    def post(self, request, vendor_profile_id):

        try:

            vendor_profile = VendorProfile.objects.get(id=vendor_profile_id)
            documents = VendorDocuments.objects.get(vendor_profile=vendor_profile)
        except (VendorProfile.DoesNotExist, VendorDocuments.DoesNotExist):
            return Response({"error": "Vendor profile or documents not found."}, status=status.HTTP_404_NOT_FOUND)
        

        final_status = request.data.get('final_status')  
        if documents.is_verified==True and final_status=="rejected":
            return Response({
                "status": "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "can't able to change is_verified to rejected. it is already approved,"
            })
        # print(f"final_status: {final_status}")
        if final_status=="approved":
            document_statuses = [
                documents.pan_card_status,
                documents.aadhar_passport_dl_status,
                documents.gst_certificate_status,
                documents.business_registration_cert_status,
                documents.shop_license_status,
                documents.cancelled_cheque_status,
                documents.bank_statement_status,
                documents.it_return_status,
                documents.financial_statement_status,
                documents.dealership_letter_status,
                documents.authorized_signatory_letter_status,
                documents.vendor_registration_form_status,
                documents.signed_terms_and_con_status,
            ]
            
            if all(status == 'approved' for status in document_statuses):
                final_status = 'approved'
                
            else:
                final_status = 'pending'
                return Response({"error": "cant able to approve there are non approved documents"}, status=status.HTTP_400_BAD_REQUEST)


        documents.profile_status = final_status
        documents.is_verified = (final_status == 'approved')
        documents.save()

        # Send notification email to vendor
        user_email = vendor_profile.user.email
        subject = "Vendor Documents Final Approval Status"
        if final_status == 'approved':
            message = (
                f"Dear {vendor_profile.user.username},\n\n"
                "Congratulations! Your vendor documents have been fully approved.\n"
                "You can now proceed with further steps.\n\n"
                "Thank you."
            )
        else:
            message = (
                f"Dear {vendor_profile.user.username},\n\n"
                "Unfortunately, your vendor documents have not been fully approved. "
                "Please review and resubmit the necessary documents.\n\n"
                "Thank you."
            )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=True,
        )

        return Response({
            "status": "success",
            "message": f"Vendor documents have been {final_status}.",
            "profile_status": documents.profile_status,
            "is_verified": documents.is_verified,
        }, status=status.HTTP_200_OK)