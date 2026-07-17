
from rest_framework import viewsets, permissions,status
from rest_framework.response import Response
from products.models import Product, Category, ProductImage, ProductVariant
from vehicles.models import *
from products.serializers import ProductSerializer, CategorySerializer
from vehicles.serializers import *
from accounts.permissions import IsVendor
from .serializers import *
from products.models import Review
import csv
import io
import json
import pandas as pd
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import VendorProfile
from orders.models import Order, OrderItem
from django.db.models import Sum, F, Count,Avg
from django.db.models.functions import TruncMonth
from django.contrib.auth.models import Group
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from accounts.models import CustomUser,Payout
from django.utils import timezone
from accounts.utils import is_vendor_registration_complete



class VendorDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def list(self, request):
        user = request.user

        try:
            profile = user.vendor_profile
            registration_complete = profile.vendordocuments.is_all_documents_submitted()
        except VendorProfile.DoesNotExist:
            registration_complete = False

        # ---------- Products ----------
        products_qs = Product.objects.filter(vendor=user)
        total_products = products_qs.count()
        recent_products = products_qs.order_by('-created_at')[:10]

        # Stock summary
        stock_summary = {
            "out_of_stock": products_qs.filter(stock=0).count(),
            "low_stock": products_qs.filter(stock__gt=0, stock__lt=10).count(),
            "in_stock": products_qs.filter(stock__gte=10).count(),
        }

        # ---------- Orders --------------
        order_items = OrderItem.objects.filter(product__vendor=user)
        orders_qs = Order.objects.filter(items__product__vendor=user).distinct()

        total_sales = order_items.aggregate(
            total=Sum(F('price') * F('quantity'))
        )['total'] or 0

        total_orders = orders_qs.count()
        total_profit = total_sales

        # Recent orders
        recent_orders = orders_qs.order_by('-created_at')[:10]

        # ---------- Monthly Trends ----------
        monthly_sales_qs = (
            order_items.annotate(month=TruncMonth('order__created_at'))
            .values('month')
            .annotate(
                total_sales=Sum(F('price') * F('quantity')),
                total_profit=Sum(F('price') * F('quantity')),  # same as sales for now
                total_orders=Count('order', distinct=True),
            )
            .order_by('month')
        )

        # Convert to structured list
        sales_trends = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "total_sales": float(item["total_sales"] or 0),
                "total_profit": float(item["total_profit"] or 0),
                "total_orders": item["total_orders"] or 0,
            }
            for item in monthly_sales_qs
        ]

        # Separate monthly orders
        monthly_orders = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "total_orders": item["total_orders"] or 0,
            }
            for item in monthly_sales_qs
        ]

        # ---------- Monthly Top selling products ----------
        current_date = timezone.now()

        year_start = current_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Fetch all order items for this vendor from Jan 1st to today
        order_items = (
            OrderItem.objects.filter(
                product__vendor=user,
                order__created_at__gte=year_start,
                order__created_at__lte=current_date
            )
            .annotate(month=TruncMonth('order__created_at'))
            .values('month', 'product__id', 'product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('month', '-total_sold')
        )

        # Organize into dictionary {month: [products]}
        monthly_top_products = {}
        for item in order_items:
            month_key = item['month'].strftime("%Y-%m")
            if month_key not in monthly_top_products:
                monthly_top_products[month_key] = []
            if len(monthly_top_products[month_key]) < 10:
                monthly_top_products[month_key].append({
                    "product_id": item["product__id"],
                    "product_name": item["product__name"],
                    "total_sold": item["total_sold"]
                })

        data = {
            "total_products": total_products,
            "recent_products": recent_products,
            "registration_complete": registration_complete,
            "total_sales": total_sales,
            "total_orders": total_orders,
            "total_profit": total_profit,
            "stock_summary": stock_summary,
            "recent_orders": recent_orders,
            "sales_trends": sales_trends,
            "monthly_orders": monthly_orders,
            "monthly_top_products": monthly_top_products
        }

        serializer = VendorDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)



# Product CRUD by Vendor
class VendorProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    print("reached function")

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

    def list(self, request, *args, **kwargs):
        user = request.user
        registration_complete = is_vendor_registration_complete(user)
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "registration_complete": registration_complete,
            "products": serializer.data
        })

    def create(self, request, *args, **kwargs):
        user = request.user
        registration_complete = is_vendor_registration_complete(user)

        if not registration_complete:
            return Response(
                {"error": "Vendor not verified. Cannot create product."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save(vendor=user)

        # Get image colors mapping
        image_colors_data = request.data.get('image_colors', '{}')
        image_colors = {}
        if image_colors_data:
            if isinstance(image_colors_data, str):
                try:
                    image_colors = json.loads(image_colors_data)
                except (json.JSONDecodeError, TypeError):
                    image_colors = {}
            elif isinstance(image_colors_data, dict):
                image_colors = image_colors_data

        # 1. Handle slot-specific images (e.g. images_0, images_1, etc.)
        for key in request.FILES.keys():
            if key.startswith('images_'):
                try:
                    slot_index = int(key.split('_')[1])
                except (ValueError, IndexError):
                    slot_index = 0
                
                is_main_image = (slot_index == 0)
                image_color = image_colors.get(key) or request.data.get(f"{key}_color") or request.data.get(f"color_{key}") or None
                for file in request.FILES.getlist(key):
                    ProductImage.objects.create(
                        product=product,
                        image=file,
                        slot=key,
                        is_main=is_main_image,
                        color_name=image_color
                    )

        # 2. Fallback for general 'images' list
        images = request.FILES.getlist('images')
        for index, image in enumerate(images):
            # Check if there is already a main image to avoid duplicate mains
            has_main = ProductImage.objects.filter(product=product, is_main=True).exists()
            
            # Find an unused slot index for general images
            slot_index = 0
            while ProductImage.objects.filter(product=product, slot=f"images_{slot_index}").exists():
                slot_index += 1
                
            slot_key = f"images_{slot_index}"
            image_color = image_colors.get(slot_key) or image_colors.get(str(index)) or request.data.get(f"images_{index}_color") or request.data.get(f"color_images_{index}") or None
            ProductImage.objects.create(
                product=product,
                image=image,
                slot=slot_key,
                is_main=not has_main and (slot_index == 0),
                color_name=image_color
            )

        # 3. Handle product variants (size, weight, color combinations)
        variants_data = request.data.get('variants', None)
        if variants_data:
            if isinstance(variants_data, str):
                try:
                    variants_data = json.loads(variants_data)
                except (json.JSONDecodeError, TypeError):
                    variants_data = []
            
            if isinstance(variants_data, list):
                for variant in variants_data:
                    ProductVariant.objects.create(
                        product=product,
                        size=variant.get('size', '') or None,
                        weight_value=variant.get('weight_value', '') or None,
                        length=variant.get('length') or None,
                        breadth=variant.get('breadth') or None,
                        height=variant.get('height') or None,
                        price=variant.get('price') or None,
                        stock=variant.get('stock', 0),
                        is_default=variant.get('is_default', False),
                    )


        return Response(
            {"message": "Product created successfully.", "product": ProductSerializer(product).data},
            status=status.HTTP_201_CREATED
            
        )



    def perform_update(self, serializer):
        print("reached update")
        product = serializer.save()
        new_images = self.request.FILES

        # Get image colors mapping
        image_colors_data = self.request.data.get('image_colors', '{}')
        image_colors = {}
        if image_colors_data:
            if isinstance(image_colors_data, str):
                try:
                    image_colors = json.loads(image_colors_data)
                except (json.JSONDecodeError, TypeError):
                    image_colors = {}
            elif isinstance(image_colors_data, dict):
                image_colors = image_colors_data

        for key in new_images.keys():
            # If the key is slot-specific (e.g. images_0)
            if key.startswith('images_'):
                ProductImage.objects.filter(product=product, slot=key).delete()
                
                try:
                    slot_index = int(key.split('_')[1])
                except (ValueError, IndexError):
                    slot_index = 0
                
                is_main_image = (slot_index == 0)
                image_color = image_colors.get(key) or self.request.data.get(f"{key}_color") or self.request.data.get(f"color_{key}") or None
                for file in new_images.getlist(key):
                    ProductImage.objects.create(
                        product=product,
                        image=file,
                        slot=key,
                        is_main=is_main_image,
                        color_name=image_color
                    )
            elif key != 'images':
                # Existing legacy/specific slot keys delete and recreate logic
                ProductImage.objects.filter(product=product, slot=key).delete()
                has_main = ProductImage.objects.filter(product=product, is_main=True).exists()
                image_color = image_colors.get(key) or self.request.data.get(f"{key}_color") or self.request.data.get(f"color_{key}") or None
                for index, file in enumerate(new_images.getlist(key)):
                    is_main_image = False
                    if key == "main_image":
                        is_main_image = True
                    elif key == "images" and not has_main and index == 0:
                        is_main_image = True

                    ProductImage.objects.create(
                        product=product,
                        image=file,
                        slot=None if key == "images" else key,
                        is_main=is_main_image,
                        color_name=image_color
                    )

        # Fallback for general 'images' list in update
        if 'images' in new_images:
            for index, file in enumerate(new_images.getlist('images')):
                has_main = ProductImage.objects.filter(product=product, is_main=True).exists()
                
                slot_index = 0
                while ProductImage.objects.filter(product=product, slot=f"images_{slot_index}").exists():
                    slot_index += 1
                
                slot_key = f"images_{slot_index}"
                image_color = image_colors.get(slot_key) or image_colors.get(str(index)) or self.request.data.get(f"images_{index}_color") or self.request.data.get(f"color_images_{index}") or None
                ProductImage.objects.create(
                    product=product,
                    image=file,
                    slot=slot_key,
                    is_main=not has_main and (slot_index == 0),
                    color_name=image_color
                )

        # Handle product variants update (clear and recreate)
        variants_data = self.request.data.get('variants', None)
        if variants_data is not None:
            if isinstance(variants_data, str):
                try:
                    variants_data = json.loads(variants_data)
                except (json.JSONDecodeError, TypeError):
                    variants_data = []
            
            # Delete existing variants and recreate
            ProductVariant.objects.filter(product=product).delete()
            
            if isinstance(variants_data, list):
                for variant in variants_data:
                    ProductVariant.objects.create(
                        product=product,
                        size=variant.get('size', '') or None,
                        weight_value=variant.get('weight_value', '') or None,
                        color_name=variant.get('color_name', '') or None,
                        color_code=variant.get('color_code', '') or None,
                        length=variant.get('length') or None,
                        breadth=variant.get('breadth') or None,
                        height=variant.get('height') or None,
                        price=variant.get('price') or None,
                        stock=variant.get('stock', 0),
                        is_default=variant.get('is_default', False),
                    )

        return product



    @action(detail=True, methods=['delete'], url_path='delete-image')
    def delete_image(self, request, pk=None):
        try:
            image = ProductImage.objects.get(pk=pk, product__vendor=request.user)
            print(f"image : {image}")
            image.delete()
            return Response({'message': 'Image deleted successfully.'}, status=status.HTTP_200_OK)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)
    
# Category CRUD by Vendor
class VendorCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]


#     @action(detail=False, methods=['post'], url_path='upload-csv')
#     def upload_csv(self, request):
#         file = request.FILES.get('file')
#         print(file)
#         if not file or not file.name.endswith('.csv'):
#             return Response({'error': 'Please upload a valid CSV file.'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             decoded_file = file.read().decode('utf-8')
#             reader = csv.DictReader(io.StringIO(decoded_file))

#             products_created = []

#             for row in reader:
#                 row = {k.strip().lower(): v.strip() for k, v in row.items()}

#                 category = self.get_or_create_category_hierarchy(row.get('category_hierarchy'))
#                 make, _ = VehicleMake.objects.get_or_create(name=row.get('vehicle_make'))
#                 model, _ = VehicleModel.objects.get_or_create(make=make, name=row.get('vehicle_model'))
#                 year_obj, _ = Year.objects.get_or_create(year=int(row.get('vehicle_year')))
#                 variant, _ = Variant.objects.get_or_create(model=model, name=row.get('vehicle_variant'))
#                 variant_year, _ = VariantYear.objects.get_or_create(variant=variant, year=year_obj)

#                 product = Product.objects.create(
#                     name=row.get('product_name'),
#                     description=row.get('product_description', ''),
#                     price=row.get('product_price'),
#                     stock=row.get('product_stock'),
#                     category=category,
#                     vendor=request.user
#                 )
#                 product.compatible_varient_year.add(variant_year)
#                 products_created.append(product)

#             return Response({'message': f'{len(products_created)} products uploaded successfully.'}, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['post'], url_path='upload-excel')
#     def upload_excel(self, request):
#         file = request.FILES.get('file')
#         print(file)
#         if not file or not file.name.endswith(('.xlsx', '.xls')):
#             return Response({'error': 'Please upload a valid Excel file (.xlsx or .xls).'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             df = pd.read_excel(file)
#         except Exception as e:
#             return Response({'error': f'Failed to read Excel file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

#         required_columns = {'category_hierarchy', 'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_variant', 'product_name', 'product_description', 'product_price', 'product_stock'}
#         if not required_columns.issubset(set(df.columns.str.lower())):
#             return Response({'error': f'Missing columns. Required: {required_columns}'}, status=status.HTTP_400_BAD_REQUEST)

#         products_created = []
#         for _, row in df.iterrows():
#             try:
#                 row = {str(k).strip().lower(): str(v).strip() for k, v in row.items()}

#                 category = self.get_or_create_category_hierarchy(row.get('category_hierarchy'))
#                 make, _ = VehicleMake.objects.get_or_create(name=row.get('vehicle_make'))
#                 model, _ = VehicleModel.objects.get_or_create(make=make, name=row.get('vehicle_model'))
#                 year_obj, _ = Year.objects.get_or_create(year=int(row.get('vehicle_year')))
#                 variant, _ = Variant.objects.get_or_create(model=model, name=row.get('vehicle_variant'))
#                 variant_year, _ = VariantYear.objects.get_or_create(variant=variant, year=year_obj)

#                 product = Product.objects.create(
#                     name=row.get('product_name'),
#                     description=row.get('product_description', ''),
#                     price=row.get('product_price'),
#                     stock=row.get('product_stock'),
#                     category=category,
#                     vendor=request.user
#                 )
#                 product.compatible_varient_year.add(variant_year)
#                 products_created.append(product)

#             except Exception as e:
#                 return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#         return Response({'message': f'{len(products_created)} products uploaded successfully.'}, status=status.HTTP_201_CREATED)
    
    
class InventoryUpdateViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    @action(detail=True, methods=['patch'], url_path='update-stock')
    def update_stock(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk, vendor=request.user)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductStockUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            if product.stock < 5:
                send_mail(
                    subject='Low Stock Alert',
                    message=f'Your product "{product.name}" has only {product.stock} item(s) left in stock.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[product.vendor.email],
                    fail_silently=False
                )

            return Response({'message': 'Stock updated successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class VendorReviewViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def list(self, request):
        vendor = request.user

        # Filter reviews for products created by this vendor
        reviews = Review.objects.filter(product__vendor=vendor).order_by('-created_at')

        serializer = VendorReviewSerializer(reviews, many=True)
        total_reviews = reviews.count()

        # Monthly review count
        monthly_reviews_qs = (
            reviews.annotate(month=TruncMonth('created_at'))
                   .values('month')
                   .annotate(count=Count('id'))
                   .order_by('month')
        )
        monthly_reviews = [
            {"month": item["month"].strftime("%Y-%m"), "count": item["count"]}
            for item in monthly_reviews_qs
        ]

        products_qs = (
            Product.objects.filter(vendor=vendor)
            .annotate(
                average_rating=Avg('reviews__rating'),  
                total_reviews=Count('reviews')          
            )
            .order_by('name')
        )

        products_data = [
            {
                "id": product.id,
                "name": product.name,
                "average_rating": round(product.average_rating or 0, 1),
                "total_reviews": product.total_reviews
            }
            for product in products_qs
        ]

        return Response({
            "total_reviews": total_reviews,
            "monthly_reviews": monthly_reviews,
            "products": products_data,
            "reviews": serializer.data
        })



class VendorTransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get_vendor_sales(self, vendor):
        sales = []
        order_items = OrderItem.objects.filter(product__vendor=vendor).select_related('order', 'product')

        for item in order_items:
            total_amount = item.price * item.quantity
            admin_commission = total_amount * Decimal('0.03')
            vendor_amount = total_amount - admin_commission
            txn_id = f"TXN{item.order.id}{item.id}"

            sales.append({
                "date": item.order.created_at.date(),
                "transaction_id": txn_id,
                "type": "Sale",
                "product": item.product.name,
                "status": item.order.status.capitalize(),
                "order_id": str(item.order.id),
                "amount": float(total_amount),
                "admin_commission": float(admin_commission),
                "vendor_amount": float(vendor_amount),
                "description": "Payment received"
            })

        sales.sort(key=lambda x: x['date'], reverse=True)
        return sales

    def get_vendor_payouts(self, vendor):
        payouts_list = []
        payouts = Payout.objects.filter(vendor=vendor)

        for payout in payouts:
            txn_id = f"PAYOUT{payout.id}"
            payouts_list.append({
                "date": payout.created_at.date(),
                "transaction_id": txn_id,
                "type": "Payout",
                "product": "-",
                "status": payout.status.capitalize(),
                "order_id": "-",
                "amount": float(payout.amount + payout.commission),
                "admin_commission": float(payout.commission),
                "vendor_amount": float(payout.amount),
                "description": "Vendor payout"
            })

        payouts_list.sort(key=lambda x: x['date'], reverse=True)
        return payouts_list

    def get(self, request, *args, **kwargs):
        vendor = request.user
        if not hasattr(vendor, 'vendor_profile'):
            return Response({"error": "User is not a vendor"}, status=400)

        sales = self.get_vendor_sales(vendor)
        payouts = self.get_vendor_payouts(vendor)

        # Combine two lists in the response
        return Response({
            "sales": sales,
            "payouts": payouts
        })