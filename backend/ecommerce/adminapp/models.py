from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

# Create your models here.


CustomUser = get_user_model()

class Notification(models.Model):
    users = models.ManyToManyField(CustomUser, related_name="notifications", blank=True)
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True, blank=True
    )
    heading = models.CharField(max_length=100)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.heading} - {self.message[:20]}"