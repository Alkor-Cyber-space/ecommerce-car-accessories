from django.db import models
from accounts.models import CustomUser

# Create your models here.

VARIANT_CHOICES = [
    ('Petrol', 'Petrol'),
    ('Diesel', 'Diesel'),
    ('CNG', 'CNG'),
    ('Electric', 'Electric'),
]


class VehicleMake(models.Model):
    name = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
    

    def __str__(self):
        return self.name
    
class VehicleModel(models.Model):
    make = models.ForeignKey(VehicleMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
   

    def __str__(self):
        return f"{self.make.name} {self.name}"
    
class VehicleVariant(models.Model):
    make = models.ForeignKey(VehicleMake, on_delete=models.CASCADE, related_name='variants')
    model = models.ForeignKey(VehicleModel, on_delete=models.CASCADE, related_name='variants')
    variant = models.CharField(max_length=20, choices=VARIANT_CHOICES)
    year = models.PositiveIntegerField()

    class Meta:
        unique_together = ('make', 'model', 'variant', 'year')

    def __str__(self):
        return f"{self.make.name} {self.model.name} - {self.variant} ({self.year})"

class SavedVehicle(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_vehicles')
    vehicle_variant = models.ForeignKey(VehicleVariant, on_delete=models.CASCADE, related_name='saved_by_users')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'vehicle_variant')  # Prevent saving same vehicle twice

    def __str__(self):
        return f"{self.user.username} saved {self.vehicle_variant}"