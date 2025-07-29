from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Wishlist, Cart, CartItem
from .serializers import WishlistSerializer, CartSerializer, CartItemSerializer
from products.models import Product
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from firebase_admin.messaging import Message
from accounts.send_push_notification import send_push_notification
from accounts.models import FCMToken

# Create your views here.
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # If token exists, send notification
        send_push_notification(
            user=self.request.user,
            title="Wishlist Updated",
            body="A product has been added to your wishlist.",
            data={"type": "wishlist_update"}
        )
        
    @action(detail=False, methods=['delete'], url_path='remove-product/(?P<product_id>[^/.]+)')
    def remove_from_wishlist(self, request, product_id=None):
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            product = Product.objects.get(id=product_id)
            wishlist.products.remove(product)
            send_push_notification(
                user=self.request.user,
                title="Product Removed",
                body=f"{product.name} was removed from your wishlist.",
                data={"type": "wishlist_update"}
            )
            return Response({'message': 'Product removed from wishlist.'}, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Wishlist not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)



# Cart ViewSet
class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# CartItem ViewSet (for adding items to cart)
class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def perform_create(self, serializer):
        # Ensure that cart for this user exists or create it
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)
    
    @action(detail=False, methods=['post'], url_path='remove-product/(?P<product_id>[^/.]+)')
    def remove_from_cart(self, request, product_id=None):
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(cart=cart, product__id=product_id)
            cart_item.delete()
            return Response({'message': 'Product removed from cart.'}, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        except CartItem.DoesNotExist:
            return Response({'error': 'Product not in cart.'}, status=status.HTTP_404_NOT_FOUND)
