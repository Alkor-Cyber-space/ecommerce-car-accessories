
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.contrib import admin
from django.http import HttpResponse
import csv
from .models import *
from .utils import create_and_process_payouts
# admin.site.register(Group)



# from .models import CustomUser

# class CustomUserAdmin(UserAdmin):
#     model = CustomUser
#     list_display = ['username', 'email', 'is_staff']
#     filter_horizontal = ('groups',)

# admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'amount', 'commission', 'status', 'razorpay_payout_id', 'week_start', 'week_end', 'created_at']
    list_filter = ['status', 'week_start']
    actions = ['generate_weekly_payouts', 'export_payouts_csv']

    def generate_weekly_payouts(self, request, queryset):
        """Generate and process payouts via Razorpay for the previous week."""
        count = create_and_process_payouts()
        self.message_user(request, f"Processed {count} payouts for the previous week.")
    generate_weekly_payouts.short_description = "Generate and process weekly payouts via Razorpay"

    def export_payouts_csv(self, request, queryset):
        """Export selected payouts as CSV."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="vendor_payouts.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Vendor Email', 'Company Name', 'Payout Amount', 'Commission', 'Razorpay Payout ID', 'Week Start', 'Week End', 'Status'])
        
        for payout in queryset:
            writer.writerow([
                payout.vendor.email,
                payout.vendor.vendor_profile.company_name or 'N/A',
                payout.amount,
                payout.commission,
                payout.razorpay_payout_id or 'N/A',
                payout.week_start,
                payout.week_end,
                payout.status
            ])
        
        return response
    export_payouts_csv.short_description = "Export payouts to CSV"

    def has_module_permission(self, request):
        return request.user.is_superuser or getattr(request.user, "is_admin_staff", False)


    def has_change_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_add_permission(self, request):
        return self.has_module_permission(request)
    
admin.site.register(CustomUser)
admin.site.register(VendorProfile)
