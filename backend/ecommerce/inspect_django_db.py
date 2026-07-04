import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','ecommerce.settings')
django.setup()
from accounts.models import CustomUser
print('CustomUser count:', CustomUser.objects.count())
from django.db import connection
cursor = connection.cursor()
for tbl in ['accounts_userprofile','accounts_userlocation','user_otp']:
    cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
    print(tbl + ':', cursor.fetchone()[0])
