from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import viewsets,permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
class SavedVehicleViewSet(viewsets.ModelViewSet):
    
    serializer_class = SavedVehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedVehicle.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        vehicle_variant = serializer.validated_data['vehicle_variant']  
        
        if SavedVehicle.objects.filter(user=self.request.user, vehicle_variant=vehicle_variant).exists():
            raise serializers.ValidationError("You have already saved this vehicle.")
        
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Saved vehicle deleted successfully.'}, status=status.HTTP_200_OK)


class compatibleYearListAPIView(APIView):
    
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicles = VehicleVariant.objects.all()
        serializer = VehicleVariantReadSerializer(vehicles, many=True, context={'request': request})
        return Response(serializer.data)

        