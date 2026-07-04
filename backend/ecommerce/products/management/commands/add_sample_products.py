from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample categories and products for development'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5, help='Number of products to create')

    def handle(self, *args, **options):
        count = options.get('count', 5)

        # Choose vendor: first user or create a dummy one
        vendor = User.objects.filter(is_active=True).first()
        if not vendor:
            vendor = User.objects.create_user(email='vendor@example.com', username='vendor', password='vendorpass')
            self.stdout.write(self.style.SUCCESS(f'Created vendor user: {vendor.email}'))

        # Ensure at least one category exists
        category, created = Category.objects.get_or_create(name='Accessories')
        if created:
            self.stdout.write(self.style.SUCCESS('Created Category: Accessories'))

        created_products = []
        for i in range(count):
            name = f"Sample Product {random.randint(1000,9999)}"
            prod = Product.objects.create(
                vendor=vendor,
                category=category,
                name=name,
                description='This is a sample product created for testing.',
                price=random.uniform(99.0, 1999.0),
                stock=random.randint(1, 100),
                weight=1.0,
                length=10.0,
                breadth=5.0,
                height=3.0,
                size='M',
                is_available=True,
            )
            created_products.append(prod)
            self.stdout.write(self.style.SUCCESS(f'Created product: {prod.name} (id={prod.id})'))

        self.stdout.write(self.style.SUCCESS(f'Finished creating {len(created_products)} products'))
