from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'vehicle-makes', VehicleMakeViewSet)
router.register(r'vehicle-models', VehicleModelViewSet)
router.register(r'years', YearViewSet)
router.register(r'variants', VariantViewSet)
router.register(r'model-years', ModelYearViewSet)
router.register(r'variant-years', VariantYearViewSet)
router.register(r'saved-vehicles', SavedVehicleViewSet, basename='savedvehicles')

urlpatterns = [
    path('', include(router.urls)),

]   
