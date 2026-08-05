from django.forms import ValidationError
from rest_framework import viewsets,permissions,status
from .models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError 
from vehicles.models import *
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from coupon_promotion.models import Promotion
from vehicles.models import SavedVehicle
from django.utils import timezone
from products.models import Product
from django.db.models import Prefetch, Q
from accounts.permissions import IsVendor

class UserDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None

        # Fetch products for each section
        deals_for_you_qs = Product.objects.filter(is_featured=True, is_available=True)[:7]
        best_sellers_top_rated_qs = Product.objects.filter(
            is_available=True
        ).filter(
            models.Q(is_best_seller=True) | models.Q(is_top_rated=True)
        ).distinct()[:10]
        new_products_qs = Product.objects.filter(is_available=True).order_by('-created_at')[:7]

        now = timezone.now()
        promotions = Promotion.objects.filter(
            activate=True, start_date__lte=now, end_date__gte=now
        )
        big_savings_qs = Product.objects.filter(promotions__in=promotions, is_available=True).distinct()[:7]

        # Smart Picks For Your Garage (Compatible with user's saved vehicles)
        picks_for_you_qs = []
        if user:
            saved_variants = SavedVehicle.objects.filter(user=user).values_list('vehicle_variant', flat=True)
            if saved_variants.exists():
                picks_for_you_qs = list(Product.objects.filter(
                    compatible_varient_year__in=saved_variants,
                    is_available=True
                ).distinct()[:10])

        if not picks_for_you_qs:
            picks_for_you_qs = list(Product.objects.filter(is_available=True).order_by('?')[:10])

        # Pickup Where You Left Off (Active Shopping Session)
        pickup_where_you_left_off_qs = []
        if user:
            from cart_wishlist.models import CartItem
            cart_product_ids = CartItem.objects.filter(cart__user=user).values_list('product_id', flat=True).distinct()
            if cart_product_ids.exists():
                pickup_where_you_left_off_qs = list(Product.objects.filter(
                    id__in=cart_product_ids,
                    is_available=True
                )[:7])

        if not pickup_where_you_left_off_qs:
            pickup_where_you_left_off_qs = list(Product.objects.filter(is_available=True).order_by('?')[:7])

        # Serialize all
        data = {
            "deals_for_you": DashboardProductSerializer(deals_for_you_qs, many=True, context={'request': request}).data,
            "best_sellers_top_rated": DashboardProductSerializer(best_sellers_top_rated_qs, many=True, context={'request': request}).data,
            "new_products": DashboardProductSerializer(new_products_qs, many=True, context={'request': request}).data,
            "big_savings": DashboardProductSerializer(big_savings_qs, many=True, context={'request': request}).data,
            "pickup_where_you_left_off": DashboardProductSerializer(pickup_where_you_left_off_qs, many=True, context={'request': request}).data,
            "picks_for_you": DashboardProductSerializer(picks_for_you_qs, many=True, context={'request': request}).data,
        }

        return Response(data)


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
        products = Product.objects.select_related('vendor').prefetch_related(
            Prefetch('vendor__addresses', queryset=Address.objects.filter(is_pickup=True))
        ).order_by('-created_at')

        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(products, request)
        if page is not None:
            serializer = ProductSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class VehicleCategoryProductsAPIView(APIView):
    """
    Return products for a vehicle category such as sedan or coupe.
    Accepts either vehicle_category (name) or vehicle_category_id (ID).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicle_category = request.query_params.get('vehicle_category', '').strip()
        vehicle_category_id = request.query_params.get('vehicle_category_id', '').strip()

        category = None
        if vehicle_category_id:
            try:
                category = Category.objects.get(id=vehicle_category_id)
            except Category.DoesNotExist:
                available_categories = list(Category.objects.values_list('id', 'name'))
                return Response({
                    'message': 'No matching vehicle category found for the provided ID.',
                    'available_categories': [{'id': category_id, 'name': name} for category_id, name in available_categories]
                }, status=status.HTTP_400_BAD_REQUEST)
        elif vehicle_category:
            category = Category.objects.filter(name__iexact=vehicle_category).first()
            if not category:
                category = Category.objects.filter(name__icontains=vehicle_category).first()

        if not category:
            available_categories = list(Category.objects.values_list('id', 'name'))
            return Response({
                'message': f"No category matched '{vehicle_category or vehicle_category_id}'. Use an existing category name or ID.",
                'available_categories': [{'id': category_id, 'name': name} for category_id, name in available_categories]
            }, status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.filter(category=category).filter(is_available=True).order_by('-created_at')

        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(products, request)
        if page is not None:
            serializer = ProductSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

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

from drf_spectacular.utils import extend_schema, OpenApiParameter

class ProductSearchAPIView(APIView):
    """
    Search and filter products by name, category, and price range.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='query',
                type=str,
                description='Search products by name',
                required=False
            ),
            OpenApiParameter(
                name='category_id',
                type=int,
                description='Filter products by category ID',
                required=False
            ),
            OpenApiParameter(
                name='min_price',
                type=float,
                description='Filter products with price >= min_price',
                required=False
            ),
            OpenApiParameter(
                name='max_price',
                type=float,
                description='Filter products with price <= max_price',
                required=False
            ),
        ],
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        query = request.query_params.get('query', None)
        category_id = request.query_params.get('category_id', None)
        min_price = request.query_params.get('min_price', None)
        max_price = request.query_params.get('max_price', None)

        products = Product.objects.all()

        if query:
            products = products.filter(name__icontains=query)
        if category_id:
            products = products.filter(category_id=category_id)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)

        if not products.exists():
            return Response({"message": "No product available."}, status=status.HTTP_200_OK)
        
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


    

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product') or self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        product = serializer.validated_data['product']
        user = request.user
        
        # Check if the user already reviewed this product
        review = Review.objects.filter(product=product, user=user).first()
        if review:
            # Update the existing review instead of failing
            review.rating = serializer.validated_data.get('rating', review.rating)
            review.comment = serializer.validated_data.get('comment', review.comment)
            review.save()
            return Response(self.get_serializer(review).data, status=status.HTTP_200_OK)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[^/.]+)')
    def reviews_by_product(self, request, product_id=None):
        reviews = self.get_queryset().filter(product__id=product_id)
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

class VendorCategoryRequest(APIView):
    def post(self,request):
        all=Category.objects.all()
        data=request.data.get("name")
        discription=request.data.get("discription")
        image = request.FILES.get("image")
        print(f"all :{all}")
        if not data:
              return Response({
                        "status": "Failed",
                        "code" : status.HTTP_400_BAD_REQUEST,
                        "message" : "category name is required"
                    },status.HTTP_400_BAD_REQUEST)
        if Category.objects.filter(name__iexact=data).exists():
            return Response({
                        "status": "Failed",
                        "code" : status.HTTP_400_BAD_REQUEST,
                        "message" : "same name category item is already there"
                    },status.HTTP_400_BAD_REQUEST)
        serializer=CategorySerializer(data={"name": data,"available": False,"discription":discription,"image":image})
        if serializer.is_valid():
            serializer.save()
            return Response({
                    "status": "Updated successfully",
                    "code" : status.HTTP_200_OK,
                    "message" : serializer.data
                })
        else:
            return Response({
                    "status": "Failed",
                    "code" : status.HTTP_400_BAD_REQUEST,
                    "message" : serializer.errors
                },status.HTTP_400_BAD_REQUEST)
        

class VendorCategoryApprove(APIView):
    def get(self, request):
        obj = Category.objects.filter(available=False)
        if obj.exists():
            try:
                serializer = CategorySerializer(obj, many=True)
                return Response({
                    "status": "success",
                    "code": status.HTTP_200_OK,
                    "message": serializer.data
                })
            except Exception as e:
                return Response({
                    "status": "failed",
                    "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "message": str(e)
                })
        return Response({
            "status": "failed",
            "code": status.HTTP_404_NOT_FOUND,
            "message": "No pending categories"
        })

    def post(self, request):
        id = request.data.get("id")
        request_status = request.data.get("status")

        if not id or not request_status:
            return Response({
                "status": "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "Missing id or status field"
            })

        try:
            queryset = Category.objects.get(id=id)
        except Category.DoesNotExist:
            return Response({
                "status": "failed",
                "code": status.HTTP_404_NOT_FOUND,
                "message": f"Category with id {id} does not exist."
            })

        
        if request_status == "approved":
            serializer = CategorySerializer(queryset, data={"available": True}, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "code": status.HTTP_200_OK,
                    "message": serializer.data
                })
            return Response({
                "status": "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": serializer.errors
            })

       
        elif request_status == "rejected":
            queryset.delete()

            return Response({"status": "rejected SuccessFully","code" : status.HTTP_200_OK,"message" : "rejected"})
        return Response({"status": "failed","code" : status.HTTP_400_BAD_REQUEST,"message" : serializer.errors})


class ReviewReplyView(APIView):
    permission_classes = [permissions.IsAuthenticated,IsVendor]  # Only logged-in users

    def post(self, request, review_id):
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(review, 'reply'):
            return Response({"error": "Review already has a reply"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(review=review, replier=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, review_id):
        """Get reply for a specific review"""
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(review, 'reply'):
            return Response({"message": "No reply yet"}, status=status.HTTP_200_OK)

        serializer = ReviewReplySerializer(review.reply)
        return Response(serializer.data)