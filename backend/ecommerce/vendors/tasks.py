from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from products.models import Product
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_and_notify_low_stock():
    low_stock_products = Product.objects.filter(stock__lt=5)
    
    for product in low_stock_products:
        vendor_email = product.vendor.email

        # Debugging logs
        logger.info(f"Checking product: {product.name}, stock: {product.stock}, vendor: {vendor_email}")
        
        send_mail(
            subject='Low Stock Alert',
            message=f'Your product "{product.name}" has only {product.stock} item(s) left in stock.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[vendor_email],
            fail_silently=False
        )

        logger.info(f"Email sent to {vendor_email} for product: {product.name}")
