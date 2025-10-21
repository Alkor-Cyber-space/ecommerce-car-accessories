from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from accounts.models import CustomUser

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
    is_read = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        CustomUser,
        related_name="created_notifications",
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.heading} - {self.message[:20]}"


class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ("order_issue", "Order Issue"),
        ("product_listing", "Product Listing"),
        ("accounts_kyc", "Accounts and KYC"),
        ("returns_refunds", "Returns and Refunds"),
        ("payments_earnings", "Payments and Earnings"),
        ("app_feedback", "App Feedback or Suggestion"),
        ("technical_issue", "Technical Issue"),
        ("other", "Other"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("answered", "Answered"),
        ("resolved", "Resolved"),
    ]

    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    vendor = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="tickets"
    )
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="low")
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    is_read = models.BooleanField(default=False)
    answer = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            last_id = SupportTicket.objects.count() + 1
            self.ticket_id = f"TKT-{last_id:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_id} - {self.subject}"
