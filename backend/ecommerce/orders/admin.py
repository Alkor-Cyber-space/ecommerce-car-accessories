from django.contrib import admin
from .models import Order, OrderItem, ReturnRequest

# Register your models here.
admin.site.register(Order)
admin.site.register(OrderItem)


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'order', 'order_item', 'status',
        'return_awb_code', 'shiprocket_shipping_charge',
        'refund_amount', 'refund_id', 'requested_at',
    ]
    list_filter = ['status']
    search_fields = ['return_awb_code', 'refund_id', 'order__id']
    readonly_fields = [
        'return_shiprocket_order_id', 'return_shipment_id', 'return_awb_code',
        'shiprocket_shipping_charge', 'refund_amount', 'refund_id',
        'requested_at', 'updated_at',
    ]