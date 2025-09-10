from django.db import models
from django.utils import timezone
# Create your models here.
class Promotion(models.Model):
    PROMOTION_TYPE_CHOICES=[
        ('percentage','PERCENTAGE'),
        ('FIXED','fixed'),
        ('BOGO','buy one get one')
    ]

    name =models.CharField(max_length=255,unique=True)
    code=models.CharField(max_length=255, unique=True)
    description=models.TextField(blank=True)
    promotion_type=models.CharField(max_length=20,choices=PROMOTION_TYPE_CHOICES)
    value=models.DecimalField(max_digits=10,decimal_places=2,help_text="Discount Value")
    start_date=models.DateTimeField(default=timezone.now)
    end_date=models.DateTimeField()
    activate=models.BooleanField(default=True)
    applicable_product=models.ManyToManyField('products.Product',blank=True,related_name='promotions')
    applicable_category=models.ManyToManyField('products.Category',blank=True,related_name='category')
    
    def is_activate(self):
        now=timezone.now()
        return self.activate and self.start_date<=self.end_date

    def __str__(self):
        return f"{self.name} ({self.code})"
    

class Coupon(models.Model):
    name=models.CharField(max_length=255,unique=True)
    discount_value=models.DecimalField(max_digits=5,decimal_places=2,help_text="enter the discount percentage" )
    min_purchase_amount=models.DecimalField(max_digits=10,decimal_places=2,default=0)
    start_date=models.DateTimeField(default=timezone.now)
    end_date=models.DateTimeField()
    activate=models.BooleanField(default=True)
    useage_limit=models.PositiveIntegerField(default=1)
    applicable_products=models.ManyToManyField('products.Product',blank=True,related_name='coupon')

    def is_valid(self):
        now=timezone.now()
        return (
            self.activate and
            self.start_date <= now <=self.end_date
        )
        
    def __str__(self):
        return f"{self.name} - {self.discount_value}% "
    
class Banner(models.Model):
    title=models.CharField(max_length=255)
    image=models.ImageField(upload_to='banners')
    is_active=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title