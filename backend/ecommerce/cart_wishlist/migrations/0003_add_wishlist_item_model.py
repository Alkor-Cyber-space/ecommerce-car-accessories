# Manually written migration to add WishlistItem through model
# The old implicit M2M table doesn't exist (fresh DB), so we:
# 1. Create the new WishlistItem model
# 2. Point Wishlist.products to use WishlistItem as through model via state-only operations

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cart_wishlist', '0002_add_variant_to_cartitem'),
        ('products', '0004_replace_color_fields_with_color_image'),
    ]

    operations = [
        # Step 1: Remove old M2M field from Django state only (no DB change needed since table is empty/new)
        migrations.SeparateDatabaseAndState(
            database_operations=[],  # nothing to do at DB level
            state_operations=[
                migrations.RemoveField(
                    model_name='wishlist',
                    name='products',
                ),
            ]
        ),

        # Step 2: Create the new WishlistItem through model
        migrations.CreateModel(
            name='WishlistItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product')),
                ('variant', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='wishlist_items',
                    to='products.productvariant'
                )),
                ('wishlist', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='items',
                    to='cart_wishlist.wishlist'
                )),
            ],
            options={
                'unique_together': {('wishlist', 'product', 'variant')},
            },
        ),

        # Step 3: Re-add Wishlist.products pointing to WishlistItem as through model
        migrations.AddField(
            model_name='wishlist',
            name='products',
            field=models.ManyToManyField(
                related_name='wishlisted_by',
                through='cart_wishlist.WishlistItem',
                to='products.product'
            ),
        ),
    ]
