from unittest.mock import patch
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase
from rest_framework import status
from products.models import Product, Category
from orders.models import Order, OrderItem

User = get_user_model()

class CourierSelectionAndShipNowTests(APITestCase):

    def setUp(self):
        # 1. Create groups
        self.vendor_group, _ = Group.objects.get_or_create(name="Vendor")

        # 2. Create Users
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="password123",
            first_name="Customer",
            last_name="User"
        )
        self.vendor = User.objects.create_user(
            username="vendor_user",
            email="vendor@example.com",
            password="password123",
            first_name="Vendor",
            last_name="User"
        )
        self.vendor.groups.add(self.vendor_group)

        self.other_vendor = User.objects.create_user(
            username="other_vendor",
            email="other_vendor@example.com",
            password="password123",
            first_name="Other",
            last_name="Vendor"
        )
        self.other_vendor.groups.add(self.vendor_group)

        # Create Category
        self.category = Category.objects.create(name="Test Category")

        # 3. Create products
        self.product = Product.objects.create(
            name="Test Wheel",
            price=Decimal("150.00"),
            stock=10,
            vendor=self.vendor,
            category=self.category,
            length=Decimal("10.00"),
            breadth=Decimal("10.00"),
            height=Decimal("10.00"),
            weight=Decimal("1.00")
        )

        # 4. Create Order
        self.order = Order.objects.create(
            user=self.customer,
            total_price=Decimal("150.00"),
            payment_method="cod",
            status="confirmed"
        )

        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price=Decimal("150.00"),
            status="confirmed",
            shipment_id="shipment_9999"
        )

    def test_unauthenticated_user_cannot_view_couriers(self):
        url = f"/api/orders/vendor/orders/{self.order.id}/couriers/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_vendor_cannot_view_couriers(self):
        self.client.force_authenticate(user=self.customer)
        url = f"/api/orders/vendor/orders/{self.order.id}/couriers/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_cannot_view_couriers_for_unowned_items(self):
        self.client.force_authenticate(user=self.other_vendor)
        url = f"/api/orders/vendor/orders/{self.order.id}/couriers/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("orders.shiprocket_client.get_shiprocket_couriers")
    def test_vendor_can_view_couriers_success(self, mock_get_couriers):
        mock_get_couriers.return_value = {
            "status": 200,
            "data": {
                "available_courier_companies": [
                    {
                        "courier_name": "Delhivery Air",
                        "rate": "120.00",
                        "courier_company_id": 29
                    }
                ]
            }
        }

        self.client.force_authenticate(user=self.vendor)
        url = f"/api/orders/vendor/orders/{self.order.id}/couriers/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)
        mock_get_couriers.assert_called_once_with("shipment_9999")

    @patch("orders.shiprocket_client.request_shiprocket_pickup")
    @patch("orders.shiprocket_client.assign_shiprocket_awb")
    def test_vendor_ship_now_success(self, mock_assign_awb, mock_request_pickup):
        mock_assign_awb.return_value = {
            "response": {
                "data": {
                    "awb_code": "AWB12345678",
                    "courier_name": "Delhivery Air"
                }
            }
        }
        mock_request_pickup.return_value = {"status": "success"}

        self.client.force_authenticate(user=self.vendor)
        url = f"/api/orders/vendor/orders/{self.order.id}/ship/"
        response = self.client.post(url, {"courier_company_id": 29}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["awb_code"], "AWB12345678")
        self.assertEqual(response.data["courier"], "Delhivery Air")
        self.assertIn("tracking_url", response.data)

        # Verify DB updates
        self.order_item.refresh_from_db()
        self.assertEqual(self.order_item.status, "shipped")
        self.assertEqual(self.order_item.awb_code, "AWB12345678")
        self.assertEqual(self.order_item.courier_name, "Delhivery Air")

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "shipped")

        mock_assign_awb.assert_called_once_with("shipment_9999", 29)
        mock_request_pickup.assert_called_once_with("shipment_9999")
