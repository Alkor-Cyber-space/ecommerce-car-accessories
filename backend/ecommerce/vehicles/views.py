
from django.shortcuts import render

# Create your views here.
from .serializers import *
from .models import *
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


class VehicleMakeViewSet(viewsets.ModelViewSet):
    queryset = VehicleMake.objects.all()
    serializer_class = VehicleMakeSerializer
    permission_classes = [IsAuthenticated]

class VehicleModelViewSet(viewsets.ModelViewSet):
    queryset = VehicleModel.objects.all()
    serializer_class = VehicleModelSerializer
    permission_classes = [IsAuthenticated]
    
class YearViewSet(viewsets.ModelViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    permission_classes = [IsAuthenticated]

class VariantViewSet(viewsets.ModelViewSet):
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [IsAuthenticated]

class ModelYearViewSet(viewsets.ModelViewSet):
    queryset = ModelYear.objects.all()
    serializer_class = ModelYearSerializer
    permission_classes = [IsAuthenticated]

class VariantYearViewSet(viewsets.ModelViewSet):
    queryset = VariantYear.objects.all()
    serializer_class = VariantYearSerializer
    permission_classes = [IsAuthenticated]
