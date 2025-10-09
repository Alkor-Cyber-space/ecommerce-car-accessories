from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'vendors', VendorListViewSet, basename='vendor')
router.register(r'users', UserListViewSet, basename='user')
router.register(r'categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'support-tickets', SupportTicketViewSet, basename='support-tickets')   
router.register(r'ad-dashboard', AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'revenue', AdminRevenueViewSet, basename='admin-revenue')
router.register(r'sales-report', AdminSalesReportViewSet, basename='admin-payouts')
router.register(r'Transaction-report', AdminTransactionTableViewSet, basename='admin-sales-table')
router.register(r'tax-report', AdminTaxTableViewSet, basename='admin-invoice-table')



urlpatterns = [
    path('vendors/unverified/', UnverifiedVendorsAPIView.as_view(), name='unverified-vendors'),
    path('', include(router.urls)),
    path('vendor/approve/<int:pk>/', VendorApprove.as_view(), name='approve-vendor'),
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('create_admin/', CreateAdminUserAPIView.as_view(), name='create-admin'),
    path('list_admins/', AdminUserListAPIView.as_view(), name='list_admin_users'),
    path('vehicle-create/', AdminVehicleCreate.as_view(), name='vehicle-entry'),

    path('list-vendor-products/',VendorViewProductAPIView.as_view(),name='list-vendor-products'),

    path('vehicles/<int:pk>/update/', AdminVehicleUpdate.as_view(), name='vehicle-update'),
    path('vehicles/<int:pk>/delete/', AdminVehicleDelete.as_view(), name='vehicle-delete'),
    path("vendor/details/", VendorDetailsList.as_view(), name="vendor-details"),
    path("profile/", AdminProfileView.as_view(), name="admin-profile"),
    path("inventory/stats/", InventoryStatsView.as_view(), name="inventory-stats"),
    path("sales-analytics/", AdminSalesAnalyticsView.as_view(), name="sales-analytics"),

]