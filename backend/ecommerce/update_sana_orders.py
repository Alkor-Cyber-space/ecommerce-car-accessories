import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser, Address
from orders.models import Order, OrderItem
from products.models import Product

def update_sana_orders():
    # Get sana user
    sana = CustomUser.objects.get(email='sana@gmail.com')
    
    # Get Sana's product
    products = Product.objects.filter(vendor=sana)
    if not products.exists():
        print("Sana has no products!")
        return
    product = products.first()
    
    # Create address
    address, _ = Address.objects.get_or_create(
        user=sana,
        line1='123 Sana St',
        city='Mumbai',
        state='MH',
        postal_code='400001',
        country='India'
    )
    
    # Create orders for sana's product
    now = timezone.now()
    dates = [
        now - timedelta(days=5),
        now - timedelta(days=2),
        now - timedelta(hours=5)
    ]
    
    for i, date in enumerate(dates):
        order = Order.objects.create(
            user=sana,
            total_price=product.price + 15,
            tax=5.00,
            shipping_cost=10.00,
            shipping_address=address,
            payment_method='cod',
            status='delivered' if i == 0 else 'processing',
            courier_company_id=1
        )
        
        # Override created_at
        order.created_at = date
        order.save(update_fields=['created_at'])
        
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=1,
            price=product.price
        )
        print(f"Created Order #{order.id} for Sana's product on {order.created_at}")
        
if __name__ == "__main__":
    update_sana_orders()
