from django.forms import ValidationError
from rest_framework import viewsets,permissions,status
from .models import Product, Category,Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError 
from vehicles.models import *
from rest_framework.views import APIView

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

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

# class ProductViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     permission_classes = [permissions.AllowAny]

class ProductListAPIView(APIView):
    """
    Return all products.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        print("hgamshgasdhgasdjh")
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

class CategoryListAPIView(APIView):
    """
    Return all products.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)

class ProductSearchAPIView(APIView):
    """
    Search products by name using ?query=
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('query', None)
        if not query:
            return Response({"message": "Query parameter is required."}, status=400)

        products = Product.objects.filter(name__icontains=query)
        if not products.exists():
            return Response({"message": "No product available."})
        
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
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


# class VehicleProductSearchViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.AllowAny]  # Or IsAuthenticated, as required.

#     @action(detail=False, methods=['get'], url_path='vehicle-specific')
#     def vehicle_specific(self, request):
#         manufacturer = request.query_params.get('manufacturer')  # Expecting VehicleMake name
#         model = request.query_params.get('model')               # Expecting VehicleModel name
#         year = request.query_params.get('year')                 # Integer
#         variant = request.query_params.get('variant')           # Expecting Variant name

#         if not (manufacturer and model and year and variant):
#             return Response(
#                 {"error": "Please provide manufacturer, model, year, and variant as query parameters."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             make_obj = VehicleMake.objects.get(name__iexact=manufacturer)
#             model_obj = VehicleModel.objects.get(make=make_obj, name__iexact=model)
#             year_obj = Year.objects.get(year=year)
#             variant_obj = Variant.objects.get(model=model_obj, name__iexact=variant)
#             variant_year_obj = VariantYear.objects.get(variant=variant_obj, year=year_obj)

#             products = Product.objects.filter(compatible_varient_year=variant_year_obj).distinct()

#             serializer = ProductSerializer(products, many=True, context={'request': request})
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         except VehicleMake.DoesNotExist:
#             return Response({"error": "Manufacturer not found."}, status=status.HTTP_404_NOT_FOUND)
#         except VehicleModel.DoesNotExist:
#             return Response({"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Year.DoesNotExist:
#             return Response({"error": "Year not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Variant.DoesNotExist:
#             return Response({"error": "Variant not found."}, status=status.HTTP_404_NOT_FOUND)
#         except VariantYear.DoesNotExist:
#             return Response({"error": "Variant-Year combination not found."}, status=status.HTTP_404_NOT_FOUND)