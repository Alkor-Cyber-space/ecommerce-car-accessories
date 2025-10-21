# audit/utils.py
from django.db.models import Sum, F
from datetime import timedelta
from django.utils import timezone
from orders.models import * 
import razorpay
from django.conf import settings
from .models import *


def log_action(user, action, description):
    
    VendorAuditLog.objects.create(
        vendor=user,
        action=action,
        description=description
    )

def is_vendor_registration_complete(user):
    """
    Returns True if the vendor profile and KYC documents are complete.
    """
    try:
        profile = user.vendor_profile
        registration_complete = profile.vendordocuments.is_registration_complete()
        print(registration_complete)
        return registration_complete
    except (VendorProfile.DoesNotExist, VendorDocuments.DoesNotExist):
        return False

# yourapp/utils.py
# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_TEST_KEY_ID, settings.RAZORPAY_TEST_KEY_SECRET))
def calculate_vendor_payouts(week_start=None, week_end=None):
    
    if not week_start or not week_end:
        today = timezone.now().date()
        week_end = today - timedelta(days=today.weekday() + 1)  # Last Sunday
        week_start = week_end - timedelta(days=6)  # Previous Monday

    payouts = []
    vendors = CustomUser.objects.filter(vendor_profile__isnull=False)
    print(f"vednors:{vendors}")
    for vendor in vendors:
        # Get delivered order items for the vendor's products
        order_items = OrderItem.objects.filter(
            product__vendor=vendor,
            # order__status='delivered',
            order__created_at__date__range=[week_start, week_end]
        )

        total_sales = 0
        total_commission = 0

        for item in order_items:
            item_total = item.price * item.quantity
            item_commission = item_total * 0.03  # 3% per product
            total_sales += item_total
            total_commission += item_commission

        payout_amount = total_sales - total_commission
        if total_sales > 0:
            payouts.append({
                'vendor': vendor,
                'total_sales': total_sales,
                'commission': total_commission,
                'payout_amount': payout_amount,
                'week_start': week_start,
                'week_end': week_end
            })

    return payouts

def create_and_process_payouts(week_start=None, week_end=None):
    payouts = calculate_vendor_payouts(week_start, week_end)
    for payout_data in payouts:
        vendor = payout_data['vendor']
        vendor_profile = vendor.vendor_profile

        # Check if bank details are available
        if not (vendor_profile.bank_account_no and vendor_profile.ifsc_code and vendor_profile.bank_account_holder_name):
            continue  # Skip if bank details are missing

        # Create Payout record
        payout = Payout.objects.create(
            vendor=vendor,
            amount=payout_data['payout_amount'],
            commission=payout_data['commission'],
            week_start=payout_data['week_start'],
            week_end=payout_data['week_end'],
            status='pending'
        )

        try:
            razorpay_payout = razorpay_client.payout.create({
                "account_number": settings.RAZORPAY_FUND_ACCOUNT,  # Your Razorpay fund account ID
                "amount": int(payout_data['payout_amount'] * 100),  # Convert to paise
                "currency": "INR",
                "mode": "IMPS",  # Or NEFT/RTGS based on your needs
                "purpose": "vendor_payout",
                "fund_account": {
                    "account_type": "bank_account",
                    "bank_account": {
                        "name": vendor_profile.bank_account_holder_name,
                        "account_number": vendor_profile.bank_account_no,
                        "ifsc": vendor_profile.ifsc_code
                    }
                },
                "queue_if_low_balance": True,
                "reference_id": f"payout_{payout.id}",
                "narration": f"Weekly payout for {vendor.email}"
            })

            payout.razorpay_payout_id = razorpay_payout['id']
            payout.status = 'completed'
            payout.save()

        except Exception as e:
            payout.status = 'failed'
            payout.save()
            print(f"Payout failed for {vendor.email}: {str(e)}")

    return len(payouts)