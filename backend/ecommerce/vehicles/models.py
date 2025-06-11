from django.db import models
from accounts.models import CustomUser

# Create your models here.
class VehicleMake(models.Model):
    name = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='vehicles/', null=True, blank=True)

    def __str__(self):
        return self.name
    
class VehicleModel(models.Model):
    make = models.ForeignKey(VehicleMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='vehicles/vehicle_model', null=True, blank=True)

    def __str__(self):
        return f"{self.make.name} {self.name}"
    
class Year(models.Model):
    year = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.model.name} {self.year}"

class Variant(models.Model):
    model = models.ForeignKey(VehicleModel, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='vehicles/variant', null=True, blank=True)
    available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.model.name} {self.name}"
    
class ModelYear(models.Model):
    model = models.ForeignKey(VehicleModel, on_delete=models.CASCADE, related_name='years')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='models')

    def __str__(self):
        return f"{self.model.name} {self.year.year}"

class VariantYear(models.Model):
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name='years')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='variants')

    def __str__(self):
        return f"{self.variant.name} {self.year.year}"

class SavedVehicle(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_vehicles')
    vehicle_variant_year = models.ForeignKey(VariantYear, on_delete=models.CASCADE, related_name='saved_by_users')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'vehicle_variant_year')  # Prevent saving same vehicle twice

    def __str__(self):
        return f"{self.user.username} saved {self.vehicle_variant_year}"