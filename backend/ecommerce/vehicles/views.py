from django.shortcuts import render

# Create your views here.
from .serializers import *
from .models import *
from rest_framework import viewsets,permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


class VehicleMakeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VehicleMake.objects.all()
    serializer_class = VehicleMakeSerializer
    permission_classes = [permissions.AllowAny]

class VehicleModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VehicleModel.objects.all()
    serializer_class = VehicleModelSerializer
    permission_classes = [permissions.AllowAny]
    
class YearViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    permission_classes = [permissions.AllowAny]

class VariantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [permissions.AllowAny]

class ModelYearViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ModelYear.objects.all()
    serializer_class = ModelYearSerializer
    permission_classes = [permissions.AllowAny]

class VariantYearViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VariantYear.objects.all()
    serializer_class = VariantYearSerializer
    permission_classes = [permissions.AllowAny]


class SavedVehicleViewSet(viewsets.ModelViewSet):
    serializer_class = SavedVehicleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return SavedVehicle.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Saved vehicle deleted successfully.'}, status=status.HTTP_200_OK)