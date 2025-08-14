# audit/utils.py
from .models import VendorAuditLog

def log_action(user, action, description):
    
    VendorAuditLog.objects.create(
        vendor=user,
        action=action,
        description=description
    )

    