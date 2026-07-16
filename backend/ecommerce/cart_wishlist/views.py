from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Wishlist, WishlistItem, Cart, CartItem
from .serializers import WishlistSerializer, WishlistItemSerializer, CartSerializer, CartItemSerializer
from products.models import Product, ProductVariant
from accounts.send_push_notification import send_push_notification

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WishlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(wishlist__user=self.request.user)

    def perform_create(self, serializer):
        wishlist, _ = Wishlist.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data.get('product')
        variant = serializer.validated_data.get('variant', None)

        # Validate variant belongs to the selected product
        if variant and variant.product != product:
            raise ValidationError({"variant": "This variant does not belong to the selected product."})

        # Prevent duplicate wishlist item additions
        if WishlistItem.objects.filter(wishlist=wishlist, product=product, variant=variant).exists():
            raise ValidationError({"detail": "This product (with the selected variant) is already in your wishlist."})

        serializer.save(wishlist=wishlist)
        send_push_notification(
            user=self.request.user,
            title="Wishlist Updated",
            body=f"{product.name} has been added to your wishlist.",
            data={"type": "wishlist_update"}
        )

    @action(detail=False, methods=['post'], url_path=r'remove-product/(?P<product_id>\d+)')
    def remove_from_wishlist(self, request, product_id=None):
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            variant_id = request.data.get('variant_id', None)

            qs = WishlistItem.objects.filter(wishlist=wishlist, product__id=product_id)
            if variant_id is not None:
                qs = qs.filter(variant__id=variant_id)

            deleted_count, _ = qs.delete()
            if deleted_count == 0:
                return Response({'error': 'Product not in wishlist.'}, status=status.HTTP_404_NOT_FOUND)

            # Auto-delete empty wishlist
            if not WishlistItem.objects.filter(wishlist=wishlist).exists():
                wishlist.delete()
                return Response({'message': 'Wishlist is now empty and has been cleared.'}, status=status.HTTP_200_OK)

            return Response({'message': 'Product removed from wishlist.'}, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Wishlist not found.'}, status=status.HTTP_404_NOT_FOUND)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data.get('product')
        variant = serializer.validated_data.get('variant', None)

        if variant and variant.product != product:
            raise ValidationError({"variant": "This variant does not belong to the selected product."})

        # Increment quantity if product/variant combination exists in cart
        existing_item = CartItem.objects.filter(cart=cart, product=product, variant=variant).first()
        if existing_item:
            existing_item.quantity += serializer.validated_data.get('quantity', 1)
            existing_item.save()
        else:
            serializer.save(cart=cart)

    @action(detail=False, methods=['post'], url_path=r'remove-product/(?P<product_id>\d+)')
    def remove_from_cart(self, request, product_id=None):
        try:
            cart = Cart.objects.get(user=request.user)
            variant_id = request.data.get('variant_id', None)

            qs = CartItem.objects.filter(cart=cart, product__id=product_id)
            if variant_id is not None:
                qs = qs.filter(variant__id=variant_id)

            deleted_count, _ = qs.delete()
            if deleted_count == 0:
                return Response({'error': 'Product not in cart.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'message': 'Product removed from cart.'}, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
