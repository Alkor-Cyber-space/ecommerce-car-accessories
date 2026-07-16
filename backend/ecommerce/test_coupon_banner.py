import os
import django
from decimal import Decimal
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser
from products.models import Product, Category, ProductVariant
from cart_wishlist.models import Cart, CartItem
from coupon_promotion.models import Coupon, Banner
from rest_framework.test import APIClient

def test_flow():
    # 1. Setup/Get testing objects
    print("Setting up test objects...")
    user, created = CustomUser.objects.get_or_create(
        username='testapiuser',
        email='testapiuser@example.com',
        defaults={'is_active': True}
    )
    if created:
        user.set_password('password123')
        user.save()
        print("Created test user.")
    else:
        print("Found existing test user.")

    category, _ = Category.objects.get_or_create(
        name='Test Accessories',
        defaults={'available': True}
    )

    product, _ = Product.objects.get_or_create(
        name='Premium Steering Wheel Cover',
        defaults={
            'price': Decimal('1500.00'),
            'stock': 10,
            'category': category,
            'is_available': True,
            'vendor': user,
            'weight': Decimal('1.5'),
            'length': Decimal('30.0'),
            'breadth': Decimal('30.0'),
            'height': Decimal('5.0')
        }
    )

    variant, _ = ProductVariant.objects.get_or_create(
        product=product,
        size='Standard',
        defaults={
            'price': Decimal('1600.00'),
            'stock': 5,
            'is_default': True
        }
    )

    # Clean existing cart items
    Cart.objects.filter(user=user).delete()
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, product=product, variant=variant, quantity=2)

    # Setup coupon
    coupon_code = 'TEST50'
    Coupon.objects.filter(code=coupon_code).delete()
    coupon = Coupon.objects.create(
        name='Test 50% Off Coupon',
        code=coupon_code,
        discount_value=Decimal('50.00'),
        min_purchase_amount=Decimal('1000.00'),
        start_date=timezone.now() - timezone.timedelta(days=1),
        end_date=timezone.now() + timezone.timedelta(days=2),
        activate=True
    )
    coupon.applicable_products.add(product)

    # Setup Banner
    Banner.objects.filter(title='Test Promo Banner').delete()
    banner = Banner.objects.create(
        title='Test Promo Banner',
        category=category,
        discount_percentage=Decimal('20.00'),
        image='banners/test.jpg',
        is_active=True
    )

    # 2. Test API client requests
    client = APIClient()
    client.force_authenticate(user=user)

    print("\n--- Testing Apply Coupon ---")
    response = client.post('/api/coupon_promo/coupon/apply-coupon/', {'coupon_code': coupon_code}, format='json')
    print("Status:", response.status_code)
    print("Response Data:", response.json())

    print("\n--- Testing Active Banners ---")
    banner_response = client.get('/api/coupon_promo/banner-create/')
    print("Status:", banner_response.status_code)
    print("Response Data:", banner_response.json())

if __name__ == "__main__":
    test_flow()
