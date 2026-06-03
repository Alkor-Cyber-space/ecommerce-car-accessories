# audit/utils.py
from django.db.models import Sum, F
from datetime import timedelta
from django.utils import timezone
from orders.models import * 
import razorpay
from django.conf import settings
from .models import *

# from io import BytesIO
# from django.core.files.base import ContentFile
# from reportlab.lib.pagesizes import A4
# from reportlab.lib import colors
# from reportlab.platypus import (
#     Table, TableStyle, Paragraph, SimpleDocTemplate, Spacer, Image
# )
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.lib.units import cm
# from reportlab.pdfbase import pdfmetrics
# from reportlab.pdfbase.ttfonts import TTFont
# import os


from django.core.mail import EmailMessage
from django.conf import settings


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



# Register font for ₹ symbol
# pdfmetrics.registerFont(TTFont("DejaVuSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))

# def generate_invoice_pdf(order, logo_path=None):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1.5 * cm, bottomMargin=1.5 * cm)

    styles = getSampleStyleSheet()
    normal = ParagraphStyle("normal", parent=styles["Normal"], fontName="DejaVuSans", fontSize=10)
    bold = ParagraphStyle("bold", parent=styles["Normal"], fontName="DejaVuSans", fontSize=10, leading=12)
    elements = []

    width, height = A4

    # --- HEADER SECTION ---
    header_data = []
    if logo_path and os.path.exists(logo_path):
        logo = Image(logo_path, width=2.5 * cm, height=2.5 * cm)
        header_data.append([
            Paragraph("<b>INVOICE</b>", ParagraphStyle("title", fontName="DejaVuSans", fontSize=20, alignment=0)),
            logo
        ])
    else:
        header_data.append([
            Paragraph("<b>INVOICE</b>", ParagraphStyle("title", fontName="DejaVuSans", fontSize=20, alignment=0)),
            ""
        ])

    header = Table(header_data, colWidths=[420, 100])
    header.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "LEFT")]))
    elements.append(header)
    elements.append(Spacer(1, 10))

    # --- DATE AND INVOICE NO (LEFT ALIGNED) ---
    date_info = Paragraph(
        f"<b>Date:</b> {order.created_at.strftime('%Y-%m-%d')}<br/><b>Invoice No:</b> #{order.id}",
        normal
    )
    elements.append(date_info)
    elements.append(Spacer(1, 12))

    # --- COMPANY INFO (LEFT ALIGNED) ---
    company_info = Paragraph(
        "<b>Your Company Name</b><br/>123 Street Address<br/>City, State, ZIP<br/>Email: info@example.com",
        normal,
    )
    elements.append(company_info)
    elements.append(Spacer(1, 20))

    # --- BILL TO / PROJECT DETAILS ---
    bill_to = f"<b>Bill To</b><br/>{order.user.username}<br/>{order.shipping_address}<br/>{order.user.email}"
    project_details = f"<b>Project Details</b><br/>Order ID: {order.id}<br/>Payment: {order.payment_method.title()}<br/>Status: {order.status.title()}"

    bill_table = Table(
        [[Paragraph(bill_to, normal), Paragraph(project_details, normal)]],
        colWidths=[260, 260],
    )
    bill_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elements.append(bill_table)
    elements.append(Spacer(1, 20))

    # --- ITEMS TABLE ---
    data = [["Description", "Quantity", "Rate", "Total"]]
    for item in order.items.all():
        data.append([
            item.product.name,
            str(item.quantity),
            f"₹{item.price:.2f}",
            f"₹{item.price * item.quantity:.2f}",
        ])

    subtotal = order.total_price - order.tax - order.shipping_cost
    totals = [
        ["", "", "Subtotal", f"₹{subtotal:.2f}"],
        ["", "", "Tax (18%)", f"₹{order.tax:.2f}"],
        ["", "", "Shipping", f"₹{order.shipping_cost:.2f}"],
        ["", "", "Grand Total", f"₹{order.total_price:.2f}"],
    ]
    data += totals

    table = Table(data, colWidths=[240, 80, 100, 100])
    table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -5), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e73be")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, -1), "DejaVuSans"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (-2, -4), (-1, -1), colors.whitesmoke),
            ("SPAN", (0, -4), (1, -1)),
        ])
    )

    elements.append(table)
    elements.append(Spacer(1, 30))

    # --- FOOTER BLUE BAR ---
    footer = Table(
        [["Thank you for your business!"]],
        colWidths=[520],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1e73be")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, -1), "DejaVuSans"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
        ]),
    )
    elements.append(footer)

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return ContentFile(pdf, name=f"invoice_{order.id}.pdf")




def send_order_invoice_email(order, pdf_file):
    subject = f"Invoice for Order #{order.id}"
    message = f"""
    Hi {order.user.first_name or order.user.email},

    Thank you for your purchase!

    Your order #{order.id} has been placed successfully.
    Please find your invoice attached.

    Regards,
    Your Store Team
    """
    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[order.user.email],
    )
    email.attach(pdf_file.name, pdf_file.read(), "application/pdf")
    email.send(fail_silently=False)
