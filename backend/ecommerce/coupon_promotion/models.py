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

    def is_activate(self):
        now=timezone.now()
        return self.activate and self.start_date<=self.end_date
