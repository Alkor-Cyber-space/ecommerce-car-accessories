from django.shortcuts import render

# Create your views here.
from .serializers import *
from .models import *
from rest_framework import viewsets,permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status



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