from django.db.models.signals import post_migrate
from django.contrib.auth.models import Group, Permission
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VendorDocuments

User = get_user_model()


@receiver(post_migrate)
def create_user_groups(sender, **kwargs):
    groups = ['User', 'Vendor', 'Admin']
    for name in groups:
        Group.objects.get_or_create(name=name)


@receiver(post_save, sender=User)
def assign_admin_group_to_superuser(sender, instance, created, **kwargs):
    if created and instance.is_superuser:
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        instance.groups.add(admin_group)


# @receiver(post_save, sender=VendorDocuments)
# def update_profile_status_on_save(sender, instance, **kwargs):
#     """Update profile status after saving VendorDocuments."""
#     instance.update_profile_status()