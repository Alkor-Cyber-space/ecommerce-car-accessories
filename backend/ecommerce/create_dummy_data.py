import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser, Address
from orders.models import Order

def create_data():
    # Create User
    user, created = CustomUser.objects.get_or_create(
        email='testuser@example.com',
        defaults={
            'username': 'testuser',
            'phone_number': '1234567890'
        }
    )
    if created:
        user.set_password('testpassword123')
        user.save()
        print("Created new user:", user.email)
    else:
        print("User already exists:", user.email)

    # Create Address for the user if needed
    address, addr_created = Address.objects.get_or_create(
        user=user,
        line1='123 Test St',
        city='Testville',
        state='Test State',
        postal_code='12345',
        country='Testland',
        is_primary=True,
        is_pickup=False
    )
    
    # Check if orders already exist to avoid duplicating endlessly
    if Order.objects.filter(user=user).count() >= 3:
        print("Orders already exist for user:", user.email)
        return

    # Create 3 orders with different dates
    now = timezone.now()
    dates = [
        now - timedelta(days=5),
        now - timedelta(days=2),
        now - timedelta(hours=5)
    ]
    
    for i, date in enumerate(dates):
        order = Order.objects.create(
            user=user,
            total_price=100.00 + (i * 20),
            tax=5.00,
            shipping_cost=10.00,
            shipping_address=address,
            payment_method='cod',
            status='delivered' if i == 0 else 'processing',
            courier_company_id=1
        )
        
        # In Django, auto_now_add fields cannot be overridden during create()
        # We need to explicitly update the field and save again
        order.created_at = date
        order.save(update_fields=['created_at'])
        print(f"Created Order #{order.id} on {order.created_at}")

if __name__ == "__main__":
    create_data()
