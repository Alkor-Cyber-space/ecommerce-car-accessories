from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .models import Order
from .serializers import OrderSerializer
from rest_framework.decorators import action
from rest_framework import status
from payment.stripe_payment import initiate_payment_intent


class CheckoutViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        user = request.user
        items = validated['items']
        shipping_address = validated['shipping_address']
        payment_method = validated['payment_method']

        subtotal = Decimal('0.00')
        tax_rate = Decimal('0.18')
        shipping_fee = Decimal('50.00')

        metadata = {
            "user_id": str(user.id),
            "payment_method": payment_method,
            "shipping_address": str(shipping_address.id),
        }

        for i, item in enumerate(items):
            product = item['product']
            quantity = item['quantity']
            subtotal += product.price * quantity
            metadata[f'product_{i}'] = str(product.id)
            metadata[f'quantity_{i}'] = str(quantity)

        tax = subtotal * tax_rate
        total = subtotal + tax + shipping_fee

        try:
            gateway_handler = get_payment_gateway(payment_method)
        except Exception:
            raise ValidationError("Unsupported payment method")

        gateway_response = gateway_handler(
            user=user,
            amount=total,
            metadata=metadata
        )

        return Response({
            "amount": float(total),
            "payment_gateway_response": gateway_response
        }, status=status.HTTP_200_OK)


class UserOrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Fetch user order history"""
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Retrieve specific order details"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)


    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        """Cancel order before shipping"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status in ['pending', 'paid']:
            order.status = 'cancelled'
            order.save()
            return Response({'message': 'Order cancelled successfully.'})
        return Response({'error': 'Order cannot be cancelled at this stage.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='track')
    def track_order(self, request, pk=None):
        """Track order status"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        return Response({
            'order_id': order.id,
            'status': order.status,
            'last_updated': order.updated_at,
        })
