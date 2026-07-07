import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from accounts.models import VendorProfile
from orders.shiprocket_client import create_pickup_location
import traceback

from accounts.models import CustomUser

try:
    user = CustomUser.objects.get(id=9)
    vp = user.vendor_profile
    addr = user.addresses.filter(is_primary=True).first() or user.addresses.first()
    if not addr:
        print('Vendor 9 has no address')
    else:
        pickup_payload = {
            'pickup_location': f'VENDOR_9',
            'name': vp.company_name or vp.contact_name or vp.user.username,
            'email': vp.company_email or vp.contact_email or vp.user.email,
            'phone': str(vp.company_number or vp.contact_number or vp.user.phone_number or '9999999999'),
            'address': "House No 1, " + addr.line1,
            'address_2': addr.line2 or '',
            'city': addr.city,
            'state': addr.state,
            'country': addr.country,
            'pin_code': addr.postal_code,
        }
        print('Sending payload:', pickup_payload)
        resp = create_pickup_location(pickup_payload)
        print('Response:', resp)
except Exception as e:
    print('Error:', traceback.format_exc())
