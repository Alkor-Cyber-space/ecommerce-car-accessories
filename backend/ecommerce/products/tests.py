from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase
from rest_framework import status
from products.models import Product, Category
from cart_wishlist.models import Cart, CartItem

User = get_user_model()

class UserDashboardPickupTest(APITestCase):

    def setUp(self):
        # Create group
        self.vendor_group, _ = Group.objects.get_or_create(name="Vendor")

        # Create user / vendor
        self.vendor = User.objects.create_user(
            username="test_vendor",
            email="vendor@example.com",
            password="vendorpassword123"
        )
        self.vendor.groups.add(self.vendor_group)

        # Create category
        self.category = Category.objects.create(name="Accessories")

        # Create some products
        self.product1 = Product.objects.create(
            name="Spoiler",
            price=150.00,
            stock=10,
            category=self.category,
            vendor=self.vendor,
            length=10, breadth=5, height=3, weight=1
        )
        self.product2 = Product.objects.create(
            name="Mat",
            price=50.00,
            stock=5,
            category=self.category,
            vendor=self.vendor,
            length=8, breadth=8, height=1, weight=2
        )
        self.product3 = Product.objects.create(
            name="Light",
            price=80.00,
            stock=8,
            category=self.category,
            vendor=self.vendor,
            length=5, breadth=5, height=4, weight=1
        )

        # Create user
        self.user = User.objects.create_user(
            username="test_customer",
            email="test_customer@example.com",
            password="customerpassword123"
        )

    def test_dashboard_unauthenticated_returns_random_products(self):
        response = self.client.get("/api/products/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pickup_where_you_left_off", response.data)
        self.assertTrue(len(response.data["pickup_where_you_left_off"]) > 0)

    def test_dashboard_authenticated_empty_cart_returns_random_products(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/products/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pickup_where_you_left_off", response.data)
        self.assertTrue(len(response.data["pickup_where_you_left_off"]) > 0)

    def test_dashboard_authenticated_with_cart_items_returns_cart_products(self):
        # Add product1 to user's cart
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product1, quantity=1)

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/products/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pickup_where_you_left_off", response.data)
        
        # Should contain only product1 since that's in the cart
        items = response.data["pickup_where_you_left_off"]
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["id"], self.product1.id)
