
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from products.models import Product, Category
from vehicles.models import VehicleMake, VehicleModel, Year, Variant, ModelYear, VariantYear
from products.serializers import ProductSerializer, CategorySerializer
from vehicles.serializers import (
    VehicleMakeSerializer, VehicleModelSerializer, YearSerializer, 
    VariantSerializer, ModelYearSerializer, VariantYearSerializer
)
from accounts.permissions import IsVendor
from .serializers import VendorDashboardSerializer
import csv
import io
import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError


class VendorDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def list(self, request):
        user = request.user

        total_products = Product.objects.filter(vendor=user).count()

        recent_products = Product.objects.filter(vendor=user).order_by('-created_at')[:5]

        data = {
            'total_products': total_products,
            'recent_products': recent_products
        }

        serializer = VendorDashboardSerializer(data)
        return Response(serializer.data)
# Product CRUD by Vendor
class VendorProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

# Category CRUD by Vendor
class VendorCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

# Vehicle Makes CRUD by Vendor
class VendorVehicleMakeViewSet(viewsets.ModelViewSet):
    queryset = VehicleMake.objects.all()
    serializer_class = VehicleMakeSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

# Vehicle Model CRUD by Vendor
class VendorVehicleModelViewSet(viewsets.ModelViewSet):
    queryset = VehicleModel.objects.all()
    serializer_class = VehicleModelSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

# Year CRUD by Vendor
class VendorYearViewSet(viewsets.ModelViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

# Variant CRUD by Vendor
class VendorVariantViewSet(viewsets.ModelViewSet):
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

# ModelYear CRUD by Vendor
class VendorModelYearViewSet(viewsets.ModelViewSet):
    queryset = ModelYear.objects.all()
    serializer_class = ModelYearSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

# VariantYear CRUD by Vendor
class VendorVariantYearViewSet(viewsets.ModelViewSet):
    queryset = VariantYear.objects.all()
    serializer_class = VariantYearSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]



class ProductBulkUploadViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsVendor]

    @action(detail=False, methods=['post'], url_path='upload-csv')
    def upload_csv(self, request):
        file = request.FILES.get('file')
        if not file or not file.name.endswith('.csv'):
            return Response({'error': 'Please upload a valid CSV file.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded_file))

            products_created = []

            for row in reader:
                # Normalize keys to lowercase
                row = {k.strip().lower(): v.strip() for k, v in row.items()}

                product = Product.objects.create(
                    name=row.get('name'),
                    description=row.get('description', ''),
                    price=row.get('price'),
                    stock=row.get('stock'),
                    category_id=row.get('category_id'),
                    vendor=request.user
                )
                products_created.append(product)

            return Response({'message': f'{len(products_created)} products uploaded successfully.'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='upload-excel')
    def upload_excel(self, request):
        file = request.FILES.get('file')
        if not file or not file.name.endswith(('.xlsx', '.xls')):
            return Response({'error': 'Please upload a valid Excel file (.xlsx or .xls).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file)
        except Exception as e:
            return Response({'error': f'Failed to read Excel file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        required_columns = {'name', 'description', 'price', 'stock', 'category_id'}
        if not required_columns.issubset(df.columns):
            return Response({'error': f'Missing columns. Required: {required_columns}'}, status=status.HTTP_400_BAD_REQUEST)

        products_created = []
        for _, row in df.iterrows():
            try:
                product = Product.objects.create(
                    name=row['name'],
                    description=row['description'],
                    price=row['price'],
                    stock=row['stock'],
                    category_id=row['category_id'],
                    vendor=request.user
                )
                products_created.append(product)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': f'{len(products_created)} products uploaded successfully.'}, status=status.HTTP_201_CREATED)