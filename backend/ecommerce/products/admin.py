from django.contrib import admin
from .models import *
# Register your models here.


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['size', 'weight_value', 'color_name', 'color_code', 'length', 'breadth', 'height', 'price', 'stock', 'is_default']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_main', 'slot', 'color_name']


class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline, ProductImageInline]
    list_display = ['name', 'price', 'stock', 'category', 'is_available']


admin.site.register(Product, ProductAdmin)
admin.site.register(Category)
admin.site.register(ProductVariant)
admin.site.register(ProductImage)