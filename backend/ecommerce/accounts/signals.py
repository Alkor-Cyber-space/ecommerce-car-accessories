from django.db.models.signals import post_migrate
from django.contrib.auth.models import Group, Permission
from django.dispatch import receiver

@receiver(post_migrate)
def create_user_groups(sender, **kwargs):
    groups = ['User', 'Vendor', 'Admin']
    for name in groups:
        Group.objects.get_or_create(name=name)