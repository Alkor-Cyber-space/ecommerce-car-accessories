from django.db import models
from accounts.models import CustomUser
from products.models import Product, ProductVariant

class Wishlist(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='wishlists')
    products = models.ManyToManyField(Product, through='WishlistItem', related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Wishlist"

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='wishlist_items'
    )  # Optional: tracks selected variant (size / color_image)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product', 'variant')

    def __str__(self):
        variant_info = f" [{self.variant}]" if self.variant else ""
        return f"{self.product.name}{variant_info} in {self.wishlist.user.username}'s Wishlist"

class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='carts')
    products = models.ManyToManyField(Product, through='CartItem', related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Cart"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cart_items'
    )  # Optional: tracks selected variant (size / color_image)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        variant_info = f" [{self.variant}]" if self.variant else ""
        return f"{self.quantity} x {self.product.name}{variant_info} in {self.cart.user.username}'s Cart"