from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from accounts.models import CustomUser
from products.models import Product, Category, ProductImage

class VendorProductImageTests(APITestCase):
    def setUp(self):
        # Create vendor user
        self.vendor = CustomUser.objects.create_user(
            email="vendor@example.com",
            username="vendor",
            phone_number="1234567890",
            password="vendorpassword"
        )
        
        # Create Category
        self.category = Category.objects.create(
            name="Accessories",
            discription="Car accessories"
        )
        
        # Create test images
        self.image1 = SimpleUploadedFile("image1.jpg", b"file_content_1", content_type="image/jpeg")
        self.image2 = SimpleUploadedFile("image2.jpg", b"file_content_2", content_type="image/jpeg")
        self.image3 = SimpleUploadedFile("image3.jpg", b"file_content_3", content_type="image/jpeg")

        # Create Product
        self.product = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name="Car Mat",
            description="Premium floor mats",
            price=1200.00,
            stock=10,
            weight=2.5,
            length=60.0,
            breadth=40.0,
            height=2.0
        )
        
        # Add initial image
        self.prod_image = ProductImage.objects.create(
            product=self.product,
            image=self.image1,
            is_main=True,
            slot=None
        )
        
        self.client.force_authenticate(user=self.vendor)
        self.detail_url = reverse('vendor-products-detail', kwargs={'pk': self.product.id})

    def test_update_product_appends_image_without_deleting_old_ones(self):
        # We perform a PATCH request to edit the product and upload a second image
        data = {
            "name": "Car Mat Updated",
            "price": 1300.00,
            "images": self.image2
        }
        
        response = self.client.patch(self.detail_url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify both images exist on the product
        images = ProductImage.objects.filter(product=self.product)
        self.assertEqual(images.count(), 2)
        
        # Verify the new image was created with slot="0"
        new_img = images.get(image__contains="image2")
        self.assertEqual(new_img.slot, "0")

    def test_consecutive_updates_preserve_previously_added_images(self):
        # 1st edit: add image2
        data1 = {
            "images": self.image2
        }
        response = self.client.patch(self.detail_url, data1, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2nd edit: add image3
        data2 = {
            "images": self.image3
        }
        response = self.client.patch(self.detail_url, data2, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify all 3 images are present (image1, image2, image3)
        images = ProductImage.objects.filter(product=self.product)
        self.assertEqual(images.count(), 3)
