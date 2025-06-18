from django.forms import ValidationError
from rest_framework import viewsets,permissions
from .models import Product, Category,Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError 

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """List products under a specific category (including direct subcategories)."""
        category = self.get_object()
        subcategories = category.subcategories.all()

        if subcategories.exists():
            categories = [category] + list(subcategories)
            products = Product.objects.filter(category__in=categories)
        else:
            products = Product.objects.filter(category=category)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='search')
    def search_products(self, request):
        """Search products by name using ?query=param"""
        query = request.query_params.get('query', None)
        if query:
            products = Product.objects.filter(name__icontains=query)
        else:
            products = Product.objects.none()  

        if not products.exists():
            return Response({"message": "No product available."})

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        user = self.request.user
        if Review.objects.filter(product=product, user=user).exists():
            raise ValidationError({"detail": "You have already reviewed this product."})
        serializer.save(user=user)

    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[^/.]+)')
    def reviews_by_product(self, request, product_id=None):
        reviews = self.queryset.filter(product__id=product_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
