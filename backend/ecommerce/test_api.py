import os
import django
from django.test import Client

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser
from rest_framework.test import APIClient

def test_api():
    user = CustomUser.objects.get(email='testuser@example.com')
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get('/api/vendor/dashboard/')
    print("Status:", response.status_code)
    try:
        print("Data:", response.json())
    except:
        print("Content:", response.content)

if __name__ == "__main__":
    test_api()
