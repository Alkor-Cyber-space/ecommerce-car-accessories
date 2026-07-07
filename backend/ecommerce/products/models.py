from decimal import Decimal
from django.conf import settings
from django.db import models
from accounts.models import CustomUser
from vehicles.models import VehicleVariant
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta
# Create your models here.

class Product(models.Model):
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    weight = models.CharField(max_length=256, blank=False, null=False)
    length = models.IntegerField( help_text="Length in CM", default=10)
    breadth = models.IntegerField( help_text="Breadth in CM", default=10)
    height = models.IntegerField( help_text="Height in CM", default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    size = models.CharField(max_length=50, null=True, blank=True)
    manufacturing_date = models.DateField(null=True, blank=True)
    tag = models.CharField(max_length=100, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    is_best_seller = models.BooleanField(default=False)
    is_top_rated = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    compatible_varient_year = models.ManyToManyField('vehicles.VehicleVariant', blank=True, related_name='compatible_products')
    length=models.DecimalField(max_digits=10, decimal_places=2)
    breadth=models.DecimalField(max_digits=10, decimal_places=2)
    height=models.DecimalField(max_digits=10, decimal_places=2)
    weight=models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        # Automatically mark is_new to false after 30 days
        if self.created_at and timezone.now() > self.created_at + timedelta(days=30):
            self.is_new = False
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products_image/')
    is_main = models.BooleanField(default=False)
    slot = models.CharField(max_length=50, null=True, blank=True)  # "main_image", "close_view", etc.
    created_at = models.DateTimeField(auto_now_add=True)


class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    discription = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Review(models.Model):
    product =  models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(Decimal('1.0')), MaxValueValidator(Decimal('5.0'))]
    )
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating} stars"

class ReviewReply(models.Model):
    review = models.OneToOneField(
        'Review', on_delete=models.CASCADE, related_name='reply'
    )
    replier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )  # who replied (admin/vendor)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reply by {self.replier.username} to Review {self.review.id}"