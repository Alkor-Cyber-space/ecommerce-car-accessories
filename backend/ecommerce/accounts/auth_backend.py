from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        print("Authenticating user with email or username")
        login_value = email or username
        print("Login value:", login_value)
        if not login_value:
            return None

        try:
            user = User.objects.get(email=login_value)
            print("User found by email:", user)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=login_value)
            except User.DoesNotExist:
                return None
        print("User found by username:", user)
        if user.check_password(password):
            print("Password is correct for user:", user)
            return user
        print("Password is incorrect for user:", user)
        return None


