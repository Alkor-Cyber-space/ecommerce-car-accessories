from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from accounts.models import Address
from products.models import Product, Category
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer

User = get_user_model()

class OrderStockTestCase(TestCase):
    def setUp(self):
        # Create users
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="testpassword123",
            phone_number="1234567890"
        )
        self.vendor = User.objects.create_user(
            username="vendor",
            email="vendor@example.com",
            password="testpassword123",
            phone_number="0987654321"
        )

        # Create category
        self.category = Category.objects.create(name="Accessories")

        # Create products
        self.product1 = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Car Seat Cover",
            description="Premium car seat cover",
            price=1500.00,
            stock=10,
            weight=2.5,
            length=40,
            breadth=40,
            height=10,
            is_available=True
        )
        self.product2 = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Steering Wheel Cover",
            description="Leather steering wheel cover",
            price=500.00,
            stock=5,
            weight=0.5,
            length=35,
            breadth=35,
            height=5,
            is_available=True
        )

        # Create address
        self.address = Address.objects.create(
            user=self.customer,
            line1="123 Main St",
            city="Ernakulam",
            state="Kerala",
            postal_code="682001",
            country="India"
        )

    def test_stock_validation_success(self):
        """Test serializer validates successfully when stock is sufficient."""
        data = {
            "shipping_address": self.address.id,
            "payment_method": "cod",
            "items": [
                {"product": self.product1.id, "quantity": 3},
                {"product": self.product2.id, "quantity": 2},
            ]
        }
        serializer = OrderSerializer(data=data, context={'request': None})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_stock_validation_insufficient_stock(self):
        """Test serializer raises ValidationError when quantity exceeds stock."""
        data = {
            "shipping_address": self.address.id,
            "payment_method": "cod",
            "items": [
                {"product": self.product1.id, "quantity": 11} # Exceeds stock (10)
            ]
        }
        serializer = OrderSerializer(data=data, context={'request': None})
        with self.assertRaises(ValidationError) as ctx:
            serializer.is_valid(raise_exception=True)
        self.assertIn("Insufficient stock", str(ctx.exception))

    def test_stock_validation_product_unavailable(self):
        """Test serializer raises ValidationError when product is not available."""
        self.product1.is_available = False
        self.product1.save()
        
        data = {
            "shipping_address": self.address.id,
            "payment_method": "cod",
            "items": [
                {"product": self.product1.id, "quantity": 1}
            ]
        }
        serializer = OrderSerializer(data=data, context={'request': None})
        with self.assertRaises(ValidationError) as ctx:
            serializer.is_valid(raise_exception=True)
        self.assertIn("is not available", str(ctx.exception))

    def test_cod_order_deducts_stock(self):
        """Test that placing a COD order immediately deducts stock."""
        order = Order.objects.create(
            user=self.customer,
            total_price=2000.00,
            shipping_address=self.address,
            payment_method="cod",
            status="pending",
            courier_company_id=127
        )
        OrderItem.objects.create(order=order, product=self.product1, quantity=2, price=1500.00)
        
        # Verify stock not deducted yet (no save after item creation)
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 10)
        
        # Trigger save as done in views.py checkout endpoint
        order.save()
        
        # Verify stock deducted
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 8)
        order.refresh_from_db()
        self.assertTrue(order.stock_deducted)

    def test_prepaid_order_does_not_deduct_stock_initially(self):
        """Test that placing a prepaid order does not deduct stock while status is pending."""
        order = Order.objects.create(
            user=self.customer,
            total_price=2000.00,
            shipping_address=self.address,
            payment_method="stripe",
            status="pending",
            courier_company_id=127
        )
        OrderItem.objects.create(order=order, product=self.product1, quantity=2, price=1500.00)
        #erp set
        
        # Even if we save order, since status is pending and payment is stripe, stock is not deducted
        order.save()
        
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 10)
        order.refresh_from_db()
        self.assertFalse(order.stock_deducted)

    def test_prepaid_order_deducts_stock_when_paid(self):
        """Test that a prepaid order deducts stock once status becomes paid."""
        order = Order.objects.create(
            user=self.customer,
            total_price=2000.00,
            shipping_address=self.address,
            payment_method="stripe",
            status="pending",
            courier_company_id=127
        )
        OrderItem.objects.create(order=order, product=self.product1, quantity=2, price=1500.00)
        
        # Simulate payment success webhook/view updating status
        order.status = "paid"
        order.save()
        
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 8)
        order.refresh_from_db()
        self.assertTrue(order.stock_deducted)

    def test_cancellation_restores_stock(self):
        """Test that cancelling a stock-deducted order restores the stock."""
        # 1. Place COD order and deduct stock
        order = Order.objects.create(
            user=self.customer,
            total_price=2000.00,
            shipping_address=self.address,
            payment_method="cod",
            status="pending",
            courier_company_id=127
        )
        OrderItem.objects.create(order=order, product=self.product1, quantity=3, price=1500.00)
        order.save()
        
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 7)
        
        # 2. Cancel order
        order.status = "cancelled"
        order.save()
        
        # 3. Verify stock is restored
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 10)
        order.refresh_from_db()
        self.assertFalse(order.stock_deducted)

    def test_failure_restores_stock(self):
        """Test that transitioning a stock-deducted order to failed restores the stock."""
        # 1. Place prepaid order and mark paid
        order = Order.objects.create(
            user=self.customer,
            total_price=2000.00,
            shipping_address=self.address,
            payment_method="razorpay",
            status="pending",
            courier_company_id=127
        )
        OrderItem.objects.create(order=order, product=self.product1, quantity=3, price=1500.00)
        order.status = "paid"
        order.save()
        
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 7)
        
        # 2. Mark order status failed
        order.status = "failed"
        order.save()
        
        # 3. Verify stock is restored
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 10)
        order.refresh_from_db()
        self.assertFalse(order.stock_deducted)
