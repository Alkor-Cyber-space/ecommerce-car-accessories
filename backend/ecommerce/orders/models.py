from django.db import models
from django.conf import settings
from products.models import Product
from accounts.models import Address

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('stripe', 'Stripe'),
        ('phonepe', 'PhonePe'),
        ('cod', 'Cash on Delivery'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    courier_company_id = models.IntegerField(null=True, blank=True)
    shipment_id = models.CharField(max_length=255, blank=True, null=True)
    courier_name = models.CharField(max_length=255, blank=True, null=True)
    awb_code = models.CharField(max_length=255, blank=True, null=True)   # Tracking number
    tracking_url = models.URLField(blank=True, null=True)                # Shiprocket tracking URL
    shiprocket_order_id = models.CharField(max_length=255, blank=True, null=True)
    coupon_code = models.CharField(max_length=255, blank=True, null=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    stock_deducted = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)

    def save(self, *args, **kwargs):
        # Determine if we need to deduct or restore stock
        should_deduct = (
            self.status in ['paid', 'confirmed', 'shipped', 'delivered'] or
            (self.status == 'pending' and self.payment_method == 'cod')
        )
        should_restore = self.status in ['cancelled', 'failed']

        # Call standard save first so the record (and ID) exists
        super().save(*args, **kwargs)

        # Apply stock updates
        if should_deduct and not self.stock_deducted:
            items = self.items.all()
            if items.exists():
                for item in items:
                    product = item.product
                    product.stock = max(0, product.stock - item.quantity)
                    product.save(update_fields=['stock'])
                # Direct SQL update to avoid calling save() again and recursing
                self.__class__.objects.filter(id=self.id).update(stock_deducted=True)
                self.stock_deducted = True
        elif should_restore and self.stock_deducted:
            items = self.items.all()
            if items.exists():
                for item in items:
                    product = item.product
                    product.stock += item.quantity
                    product.save(update_fields=['stock'])
                # Direct SQL update to avoid calling save() again and recursing
                self.__class__.objects.filter(id=self.id).update(stock_deducted=False)
                self.stock_deducted = False

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('confirmed', 'Confirmed')], default='pending')
    shiprocket_order_id = models.CharField(max_length=255, blank=True, null=True)
    shipment_id = models.CharField(max_length=255, blank=True, null=True)
    courier_name = models.CharField(max_length=255, blank=True, null=True)
    awb_code = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
