import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser, VendorProfile

vp = VendorProfile.objects.get(user_id=2)
print("Vendor Profile:")
print("Company:", vp.company_name)
print("Contact Name:", vp.contact_name)
print("Contact Email:", vp.contact_email)
print("Contact Number:", vp.contact_number)
print("Company Number:", vp.company_number)

print("\nAddresses:")
for addr in vp.user.addresses.all():
    print(f"ID: {addr.id}, Primary: {addr.is_primary}, Line 1: '{addr.line1}', Line 2: '{addr.line2}', City: '{addr.city}', State: '{addr.state}', Pincode: '{addr.postal_code}', Country: '{addr.country}'")
