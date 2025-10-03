from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Product

@shared_task
def mark_old_products_not_new():
    """
    Set is_new=False for products older than 30 days
    """
    threshold_date = timezone.now() - timedelta(days=30)
    updated_count = Product.objects.filter(is_new=True, created_at__lte=threshold_date).update(is_new=False)
    return f"{updated_count} products marked as not new"