
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
from .serializers import (
    VendorDashboardSerializer, VendorProductSerializer, VendorCategorySerializer,
    VendorVehicleMakeSerializer, VendorVehicleModelSerializer,
    VendorYearSerializer, VendorVariantSerializer, VendorModelYearSerializer)


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
