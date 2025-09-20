
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from products.models import Product, Category,ProductImage
from vehicles.models import *
from products.serializers import ProductSerializer, CategorySerializer
from vehicles.serializers import *
from accounts.permissions import IsVendor,IsVendorProfileComplete
from .serializers import ProductStockUpdateSerializer, VendorDashboardSerializer
import csv
import io
import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import VendorProfile


class VendorDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def list(self, request):
        user = request.user

        try:
            profile = user.vendor_profile
            registration_complete = profile.is_registration_complete()
        except VendorProfile.DoesNotExist:
            registration_complete = False

        total_products = Product.objects.filter(vendor=user).count()
        recent_products = Product.objects.filter(vendor=user).order_by('-created_at')[:5]

        data = {
            'total_products': total_products,
            'recent_products': recent_products,
            'registration_complete': registration_complete
        }

        serializer = VendorDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Product CRUD by Vendor
class VendorProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    # permission_classes = [permissions.IsAuthenticated, IsVendor]
    print("reached function")
    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

    def perform_create(self, serializer):
        product = serializer.save(vendor=self.request.user)
        # Get image files from request.FILES
        images = self.request.FILES.getlist('images')
        print(f"images: {images}")
        for image in images:
            ProductImage.objects.create(product=product, image=image)

    def perform_update(self, serializer):
        print("reached update")
        product = serializer.save()
        new_images = self.request.FILES

        for key in new_images.keys():
            # delete old image for this slot
            ProductImage.objects.filter(product=product, slot=key).delete()

            for file in new_images.getlist(key):  # handle multiple files in same slot
                ProductImage.objects.create(
                    product=product,
                    image=file,
                    slot=key,
                    is_main=(key == "main_image")
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

# Vehicle Makes CRUD by Vendor
# class VendorVehicleMakeViewSet(viewsets.ModelViewSet):
#     queryset = VehicleMake.objects.all()
#     serializer_class = VehicleMakeSerializer
#     permission_classes = [permissions.IsAuthenticated, IsVendor]

# # Vehicle Model CRUD by Vendor
# class VendorVehicleModelViewSet(viewsets.ModelViewSet):
#     queryset = VehicleModel.objects.all()
#     serializer_class = VehicleModelSerializer
#     permission_classes = [permissions.IsAuthenticated, IsVendor]

# # Year CRUD by Vendor
# class VendorYearViewSet(viewsets.ModelViewSet):
#     queryset = Year.objects.all()
#     serializer_class = YearSerializer
#     permission_classes = [permissions.IsAuthenticated, IsVendor]

# # Variant CRUD by Vendor
# class VendorVariantViewSet(viewsets.ModelViewSet):
#     queryset = Variant.objects.all()
#     serializer_class = VariantSerializer
#     permission_classes = [permissions.IsAuthenticated, IsVendor]

# # ModelYear CRUD by Vendor
# class VendorModelYearViewSet(viewsets.ModelViewSet):
#     queryset = ModelYear.objects.all()
#     serializer_class = ModelYearSerializer
#     permission_classes = [permissions.IsAuthenticated, IsVendor]

# # VariantYear CRUD by Vendor
# class VendorVariantYearViewSet(viewsets.ModelViewSet):
#     queryset = VariantYear.objects.all()
#     serializer_class = VariantYearSerializer
#     permission_classes = [permissions.IsAuthenticated, IsVendor]

# class ProductBulkUploadViewSet(viewsets.ViewSet):
#     permission_classes = [IsAuthenticated, IsVendor]

#     def get_or_create_category_hierarchy(self, hierarchy_str):
#         parent = None
#         for name in map(str.strip, hierarchy_str.split('>')):
#             category, _ = Category.objects.get_or_create(name=name, parent=parent)
#             parent = category
#         return parent

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
    
    