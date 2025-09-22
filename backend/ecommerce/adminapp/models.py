from django.db import models
from accounts.models import CustomUser
# Create your models here.

class Notification(models.Model):
    user=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='notifications')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message