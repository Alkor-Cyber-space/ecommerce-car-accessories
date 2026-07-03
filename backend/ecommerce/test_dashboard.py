import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser, VendorProfile
from orders.models import Order, OrderItem
from products.models import Product
from django.db.models import Sum, F, Count
from django.db.models.functions import TruncMonth

def test_dashboard():
    user = CustomUser.objects.get(email='testuser@example.com')
    
    products_qs = Product.objects.filter(vendor=user)
    print("Total products:", products_qs.count())
    
    order_items = OrderItem.objects.filter(product__vendor=user)
    print("Order items count:", order_items.count())
    
    orders_qs = Order.objects.filter(items__product__vendor=user).distinct()
    print("Orders count:", orders_qs.count())
    
    total_sales = order_items.aggregate(
        total=Sum(F('price') * F('quantity'))
    )['total'] or 0
    print("Total Sales:", total_sales)

    # test documents
    try:
        profile = user.vendor_profile
        try:
            print("Docs submitted:", profile.vendordocuments.is_all_documents_submitted())
        except Exception as e:
            print("Vendor documents error:", e)
    except Exception as e:
        print("Vendor profile error:", e)

if __name__ == "__main__":
    test_dashboard()
