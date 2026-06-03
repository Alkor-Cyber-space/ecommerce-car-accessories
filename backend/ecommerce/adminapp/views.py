from django.shortcuts import render
from rest_framework import viewsets
from accounts.models import *
from accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, status, permissions, serializers
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from products.serializers import *
from vehicles.serializers import VehicleFullEntrySerializer
from products.models import *
from vehicles.models import VehicleMake, VehicleModel, VehicleVariant
from products.models import *
from orders.models import Order,OrderItem
from .serializers import *
from . models import *
from accounts.mixin import AuditLogMixin
from accounts.serializers import UserEditSerializer,UserSerializer
from orders.models import *
from django.db.models import Sum, F, Count
from django.db.models.functions import TruncMonth
from datetime import timedelta,date
from django.utils import timezone
from accounts.utils import is_vendor_registration_complete
from django.db.models import Q, Sum

User = get_user_model()
# Create your views here.

class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        # ---------- Users ----------
        total_users = CustomUser.objects.filter(groups__name="User").count()
        total_vendors = CustomUser.objects.filter(groups__name="Vendor").count()
        total_admins = CustomUser.objects.filter(groups__name="Admin").count()

        # New users & vendors in last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)

        new_users = CustomUser.objects.filter(
            groups__name="User",
            date_joined__gte=thirty_days_ago
        ).count()

        new_vendors = CustomUser.objects.filter(
            groups__name="Vendor",
            date_joined__gte=thirty_days_ago
        ).count()

        # ---------- Products ----------
        products_qs = Product.objects.all()
        total_products = products_qs.count()
        recent_products = products_qs.order_by('-created_at')[:10]

        # ---------- Orders ----------
        order_items = OrderItem.objects.all()
        orders_qs = Order.objects.all()

        total_sales = order_items.aggregate(total=Sum(F('price') * F('quantity')))['total'] or 0
        total_profit = total_sales  # modify if profit calculation differs

        recent_orders = orders_qs.order_by('-created_at')[:10]
        total_orders = orders_qs.count()

        # ---------- Monthly trends ----------
        monthly_sales_qs = (
            order_items.annotate(month=TruncMonth('order__created_at'))
            .values('month')
            .annotate(
                total_sales=Sum(F('price') * F('quantity')),
                total_profit=Sum(F('price') * F('quantity')),
                total_orders=Count('order', distinct=True),
            )
            .order_by('month')
        )

        monthly_sales = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "total_sales": float(item["total_sales"] or 0),
                "total_profit": float(item["total_profit"] or 0),
                "total_orders": item["total_orders"],
            }
            for item in monthly_sales_qs
        ]

        monthly_products_qs = (
            products_qs.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total_products=Count('id'))
            .order_by('month')
        )

        monthly_products = [
            {"month": item["month"].strftime("%Y-%m"), "total_products": item["total_products"]}
            for item in monthly_products_qs
        ]

        most_sold_products_qs = (
            order_items.values(
                "product__id",
                "product__name",
                "product__category__name"
            )
            .annotate(
                total_sold=Sum("quantity"),
                revenue=Sum(F("price") * F("quantity"))
            )
            .order_by("-total_sold")[:10]
        )

        most_sold_products = [
            {
                "product_name": item["product__name"],
                "category": item["product__category__name"],
                "total_sold": int(item["total_sold"] or 0),
                "revenue": float(item["revenue"] or 0),
            }
            for item in most_sold_products_qs
        ]

        data = {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_sales": total_sales,
            "total_profit": total_profit,
            "new_users": new_users,
            "new_vendors": new_vendors,
            "total_vendors": total_vendors,
            "total_users": total_users,
            "total_admins": total_admins,
            "recent_orders": recent_orders,
            "recent_products": recent_products,
            "monthly_sales": monthly_sales,
            "monthly_products": monthly_products,
            "most_sold_products": most_sold_products,
        }

        serializer = AdminDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)




class AdminSalesAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        today = date.today()
        week_ago = today - timedelta(days=7)

        # Orders today
        orders_today = Order.objects.filter(created_at__date=today).count()

        # Products sold today
        products_sold_today = OrderItem.objects.filter(order__created_at__date=today).aggregate(
            total=Sum('quantity')
        )['total'] or 0

        # new users are taken 5 days before from today
        five_days_ago = today - timedelta(days=5)
        new_users = CustomUser.objects.filter(date_joined__date__gte=five_days_ago).count()

        # Refunds (assuming cancelled orders count as refunds)
        refunds_today = Order.objects.filter(status='cancelled', updated_at__date=today).count()

        # Sales trends (last 7 days)
        sales_trends = (
            Order.objects.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(
                total_sales=Sum('total_price', filter=Q(status__in=['paid', 'confirmed', 'delivered'])),
                total_refunds=Sum('total_price', filter=Q(status='cancelled'))
            )
            .order_by('month')
        )

        # Total payouts (completed only)
        total_payouts = Payout.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0

        # Total vendor commissions (3% platform profit)
        total_commission = Payout.objects.aggregate(total=Sum('commission'))['total'] or 0

        # Total order revenue (only successful ones)
        total_revenue = Order.objects.filter(status__in=['delivered', 'paid', 'confirmed']).aggregate(
            total=Sum('total_price')
        )['total'] or 0

        # Returns and refunds amount (cancelled/refunded orders)
        returns_and_refunds = Order.objects.filter(status__in=['cancelled']).aggregate(
            total=Sum('total_price')
        )['total'] or 0

        monthly_refunds = (
            Order.objects.filter(status='cancelled')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total_refunds=Sum('total_price'))
            .order_by('month')
        )

        refunds_dict = {
            entry['month'].strftime('%b %Y'): float(entry['total_refunds'] or 0)
            for entry in monthly_refunds
        }

        # ---  Monthly Profit ---
        monthly_profit = (
            Order.objects.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(
                total_revenue=Sum('total_price', filter=Q(status__in=['delivered', 'paid', 'confirmed'])),
                refunds=Sum('total_price', filter=Q(status='cancelled')),
            )
            .order_by('month')
        )

        # Profit = Total revenue - total payouts - refunds
        total_profit = (total_revenue or 0) - (total_payouts or 0) - (returns_and_refunds or 0)

        # Top 5 Vendors by total sales
        top_vendors = (
            OrderItem.objects.values(vendor_email=F('product__vendor__email'))
            .annotate(total_sales=Sum(F('price') * F('quantity')))
            .order_by('-total_sales')[:5]
        )

        # Top 5 Pnoroducts by total sales
        top_products = (
            OrderItem.objects.values(product_name=F('product__name'))
            .annotate(total_sales=Sum(F('price') * F('quantity')))
            .order_by('-total_sales')[:5]
        )

        data = {
            "orders_today": orders_today,
            "products_sold_today": products_sold_today,
            "new_users": new_users,
            "refunds_today": refunds_today,
            "monthly_profit": list(monthly_profit),
            "refunds_dict": refunds_dict,
            "sales_trends": list(sales_trends),
            "total_profit": total_profit,
            "returns_and_refunds": returns_and_refunds,
            "top_vendors": list(top_vendors),
            "top_products": list(top_products),
        }

        serializer = AdminSalesAnalyticsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')


        if not email_or_username or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Try fetching user by email or username
        user = User.objects.filter(email=email_or_username).first()
        print(f'User fetched by email: {user}')
        if not user:
            user = User.objects.filter(username=email_or_username).first()
            print(f'User fetched by username: {user}')
        
        if not user:
            return Response({"error": "No account found with the provided email/username."}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            print(password)
            print(f'Password check failed for user: {user.username}')
            return Response({"error": "Incorrect password."}, status=status.HTTP_401_UNAUTHORIZED)

        if user and user.check_password(password):
            if user.groups.filter(name='Admin').exists():  # or `user.role == 'admin'` if you're using a field
                print(f'Admin user {user.username} logged in successfully.')
                refresh = RefreshToken.for_user(user)
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "role": "admin"
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Only Admin users can login here."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


class CreateAdminUserAPIView(APIView):
    permission_classes = [IsAdmin, IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        phone_number = request.data.get('phone_number')
        print(f"**********{email, username, password, phone_number}***********")

        if not all([email, username, password,phone_number]):
            return Response({"error": "Email, username, password and phone_number are required."}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(phone_number=phone_number).exists():
            return Response({"error": "User with this phone number already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.create(
            email=email,
            username=username,
            password=make_password(password),
            phone_number=phone_number,
            is_admin_staff=True
        )

        admin_group, _ = Group.objects.get_or_create(name='Admin')
        user.groups.add(admin_group)

        return Response({"message": "Admin user created successfully."}, status=status.HTTP_201_CREATED)


class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Get users marked as admin or superuser
        admin_users = CustomUser.objects.filter(
            is_active=True
        ).filter(
            is_superuser=True
        ) | CustomUser.objects.filter(
            is_admin_staff=True
        ) | CustomUser.objects.filter(
            groups__name='Admin'
        )

        # Remove duplicates (in case a user meets more than one condition)
        admin_users = admin_users.distinct()

        serializer = UserSerializer(admin_users, many=True)
        return Response(serializer.data)
    def post(self,request):
        id=request.data.get("id",None)
        if not id :
            return Response({"status":"failed","status_code":status.HTTP_400_BAD_REQUEST,"message": "Id ismandatory"})
        user=CustomUser.objects.filter(id=id,is_admin_staff=True)
        if not user:
            return Response({"status":"failed","status_code":status.HTTP_400_BAD_REQUEST,"message":"not an employee"})
        serializer= UserSerializer(user,many=True)
        return Response({"status":"success","status_code":status.HTTP_200_OK,"data":serializer.data})


class VendorDetailsList(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        pk = request.data.get("pk")
        print(pk)
        if not pk:
            return Response(
                {"message": "pk is required", "status": status.HTTP_400_BAD_REQUEST}
            )

        try:
            vendor_group = Group.objects.get(name="Vendor")
            print(f"vendor_group: {vendor_group}")

        except Exception as e:
            message = str(e)
            return Response({"status":"failed","response_code":status.HTTP_500_INTERNAL_SERVER_ERROR,"message":message})
        user = (CustomUser.objects.filter(id=pk, groups=vendor_group).select_related("vendor_profile").first())
        print(f"Fetched user: {user}")

        if not user:
            return Response(
                {"message": "Vendor user does not exist", "status": status.HTTP_404_NOT_FOUND}
            )

        serializer = VendorDetailsSerializer(user)
        print(f"serializer.data:{serializer.data}")
        return Response(
            {"message": "Successfully fetched vendor data", "data": serializer.data},
            status=status.HTTP_200_OK,
        )

      
class VendorListViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin, IsAuthenticated]

    def get_queryset(self):
        vendor_group = Group.objects.get(name='Vendor')
        return CustomUser.objects.filter(groups=vendor_group)
        
    # @action(detail=True, methods=['post'], url_path='approve')
    # def approve_vendor(self, request, pk=None):
    #     vendor = self.get_object()
    #     vendor.is_active = True
    #     vendor.save()
    #     return Response({'message': 'Vendor approved successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='suspend')
    def suspend_vendor(self, request, pk=None):
        vendor = self.get_object()
        vendor.is_active = False
        vendor.save()
        return Response({'message': 'Vendor suspended successfully'}, status=status.HTTP_200_OK)

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin, IsAuthenticated]

    
    def get_queryset(self):
        user_group = Group.objects.get(name='User')
        return (
            CustomUser.objects.filter(groups=user_group)
            .prefetch_related('orders')
        )

    #@action(detail=True,methods=['post'], url_path='approve')
    #def approve_user(self, request, pk=None):
    #    user = self.get_objects()
    #    user.is_active = True
    #    user.save()
    #    return Response({'message':'user added sucessfully'}, status=status.HTTP_200_Ok)

    @action(detail=True,methods=['post'], url_path='suspend')
    def suspend_user(self,request,pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message':'user blocked successfully'}, status=status.HTTP_200_OK)


class VendorApprove(generics.GenericAPIView):
    queryset = VendorProfile.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            vendor_profile = get_object_or_404(VendorProfile, pk=pk)
            print(vendor_profile)
            vendor_profile.is_verified = True
            vendor_profile.save()
            serializer = self.get_serializer(vendor_profile)
            return Response({
                "message": "Vendor approved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "message": "Error approving vendor.",
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Category CRUD by Vendor
class AdminCategoryViewSet(AuditLogMixin,viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AdminVehicleCreate(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = VehicleFullEntrySerializer(data=request.data)
        if serializer.is_valid():
            variant = serializer.save()
            return Response({
                "message": "Vehicle entry saved successfully.",
                "data": {
                    "make": variant.make.name,
                    "model": variant.model.name,
                    "variant": variant.variant,
                    "year": variant.year
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class VendorViewProductAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self,request):
        pk=request.data.get('pk')
        # print(pk)
        if not pk:
            return Response({
                "status" : "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "pk is mandatory"
            },status=status.HTTP_400_BAD_REQUEST)
        
        custom_user=Product.objects.filter(vendor_id=pk)
        if not custom_user:
            return Response({
                "status" : "failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "user does not exist"
            },status=status.HTTP_400_BAD_REQUEST)
        
        serializer=VendorViewProductSerilizer(custom_user , many=True)
        return Response({
            "status" : "success",
            "code": status.HTTP_200_OK,
            "data": serializer.data
        },status=status.HTTP_200_OK)


# class UnverifiedVendorsAPIView(APIView):
#     permission_classes = [IsAuthenticated, IsAdmin]

#     def get(self, request):
#         unverified_vendors = VendorDocuments.objects.filter(is_verified=False)
#         serializer = VendorUnverifiedDocumentsSerializer(unverified_vendors, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class UnverifiedVendorsAPIView(APIView):
    permission_classes = [IsAdmin, IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        vendor_group = Group.objects.get(name='Vendor')
        all_vendors = CustomUser.objects.filter(groups=vendor_group)

        # Filter vendors whose registration is incomplete
        incomplete_vendors = [
            vendor for vendor in all_vendors if not is_vendor_registration_complete(vendor)
        ]

        serializer = self.serializer_class(incomplete_vendors, many=True)
        return Response(serializer.data)


class AdminVehicleUpdate(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            variant = VehicleVariant.objects.get(pk=pk)
        except VehicleVariant.DoesNotExist:
            return Response({"error": "Vehicle entry not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VehicleFullEntrySerializer(instance=variant, data=request.data)
        if serializer.is_valid():
            updated_variant = serializer.save()
            return Response({
                "message": "Vehicle entry updated successfully.",
                "data": {
                    "make": updated_variant.make.name,
                    "model": updated_variant.model.name,
                    "variant": updated_variant.variant,
                    "year": updated_variant.year
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminVehicleDelete(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            variant = VehicleVariant.objects.get(pk=pk)
            variant.delete()
            return Response({"message": "Vehicle entry deleted successfully."}, status=status.HTTP_200_OK)
        except VehicleVariant.DoesNotExist:
            return Response({"error": "Vehicle entry not found."}, status=status.HTTP_404_NOT_FOUND)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user

        # notifications assigned directly to user
        qs = Notification.objects.filter(users=user)

        
        group_ids = user.groups.values_list("id", flat=True)
        qs |= Notification.objects.filter(group_id__in=group_ids)

        return qs.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        users = self.request.data.get("users", None)
        group = serializer.validated_data.get("group", None)

        notification = serializer.save(created_by=self.request.user)  

        if users:
            notification.users.set(users)
        elif group:
            members = group.user_set.all()
            notification.users.set(members)

    @action(detail=False, methods=["get"], url_path="sent")
    def sent_notifications(self, request):
        queryset = Notification.objects.filter(
            created_by=request.user
        ).order_by("-created_at")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="mark-as-read")
    def mark_as_read(self, request, pk=None):
        """
        Mark a single notification as read
        """
        try:
            notification = self.get_queryset().get(pk=pk)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save()
        return Response({"detail": "Notification marked as read."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_as_read(self, request):
        """
        Mark all notifications for the current user as read
        """
        qs = self.get_queryset()
        updated_count = qs.update(is_read=True)
        return Response(
            {"detail": f"{updated_count} notifications marked as read."},
            status=status.HTTP_200_OK
        )


class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        serializer = UserEditSerializer(user,data=request.data,
            partial=True,
            context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all().order_by("-created_at")
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_staff or IsAdmin:  # Admins can see all
            return SupportTicket.objects.all().order_by("-created_at")
        return SupportTicket.objects.filter(vendor=user).order_by("-created_at")

    @action(detail=False, methods=["get"], url_path="ticket-counts")
    def ticket_counts(self, request):
        user = request.user
        qs = self.get_queryset()

        counts = {
            "total": qs.count(),
            "pending": qs.filter(status="pending").count(),
            "in_progress": qs.filter(status="in_progress").count(),
            "answered": qs.filter(status="answered").count(),
            "resolved": qs.filter(status="resolved").count(),
        }

        return Response(counts)

    # --- New API: Mark as in progress ---
    @action(detail=True, methods=["post"])
    def mark_in_progress(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = "in_progress"
        ticket.save()
        return Response({"message": "Ticket marked as in progress."})


    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

    # Mark ticket as read
    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        ticket = self.get_object()
        ticket.is_read = True
        ticket.status = "in_progress"
        ticket.save()
        return Response({"message": "Ticket marked as read."})

    # Answer a ticket
    @action(detail=True, methods=["post"])
    def answer_ticket(self, request, pk=None):
        ticket = self.get_object()
        answer = request.data.get("answer")
        if not answer:
            return Response({"error": "Answer is required"}, status=status.HTTP_400_BAD_REQUEST)
        ticket.answer = answer
        ticket.status = "answered"
        ticket.save()

        Notification.objects.create(
                heading=f"Your ticket '{ticket.subject}' has been answered",
                message=answer,
                created_by=request.user,
            ).users.add(ticket.vendor)

        return Response({"message": "Ticket answered successfully."})

    # Resolve a ticket
    @action(detail=True, methods=["post"])
    def mark_resolved(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = "resolved"
        ticket.save()
        return Response({"message": "Ticket marked as resolved."})

class InventoryStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """
        Returns stock and inventory statistics.
        Accepts optional filters: ?month=&year=&category=&vendor=
        """
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        category = request.query_params.get("category")
        vendor = request.query_params.get("vendor")

        products = Product.objects.all()

        # ---- Optional Filters ----
        if year:
            products = products.filter(created_at__year=year)
        if month:
            products = products.filter(created_at__month=month)
        if category and category.lower() != "all":
            products = products.filter(category__name__iexact=category)
        if vendor and vendor.lower() != "all":
            products = products.filter(vendor__id=vendor)

        # ---- Stock Summary ----
        total_products = products.count()
        in_stock = products.filter(stock__gt=10).count()      # Stock > 10
        low_stock = products.filter(stock__gt=0, stock__lte=10).count()  # 1–10
        out_of_stock = products.filter(stock=0).count()

        # ---- Stock by Category ----
        stock_by_category = (
            products.values("category__name")
            .annotate(total=Count("id"))
            .order_by("category__name")
        )
        stock_by_category_dict = {
            item["category__name"]: item["total"] for item in stock_by_category
        }

        stock_movement = []
        recent_products = products.order_by("-created_at")[:3]
        for p in recent_products:
            stock_movement.append({
                "date": p.created_at.strftime("%Y-%m-%d"),
                "stock_added": p.stock,  
                "stock_sold": max(0, int(p.stock * 0.3)) 
            })

        # ---- Prepare Data ----
        data = {
            "total_products": total_products,
            "in_stock": in_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "stock_by_category": stock_by_category_dict,
            "stock_movement": stock_movement,
        }

        serializer = InventoryStatsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminRevenueViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        # ---------- 1. GROWTH TRENDS ----------
        growth_data_qs = (
            Order.objects.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(
                total_sales=Sum('total_price'),
                total_orders=Count('id')
            )
            .order_by('month')
        )

        growth_trends = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "total_sales": float(item["total_sales"] or 0),
                "total_orders": item["total_orders"]
            }
            for item in growth_data_qs
        ]

        # ---------- 2. VENDOR VS REVENUE ----------
        vendor_revenue_qs = (
            OrderItem.objects
            .values('product__vendor__id', 'product__vendor__email')
            .annotate(
                total_revenue=Sum(F('price') * F('quantity')),
                total_items=Sum('quantity')
            )
            .order_by('-total_revenue')
        )

        vendor_vs_revenue = [
            {
                "vendor_id": v["product__vendor__id"],
                "vendor_email": v["product__vendor__email"],
                "total_revenue": float(v["total_revenue"] or 0),
                "total_items": v["total_items"]
            }
            for v in vendor_revenue_qs
        ]

        # ---------- 3. TOP PURCHASED CUSTOMERS ----------
        top_customers_qs = (
            Order.objects
            .values('user__id', 'user__email')
            .annotate(
                total_spent=Sum('total_price'),
                total_orders=Count('id')
            )
            .order_by('-total_spent')[:10]
        )

        top_customers = [
            {
                "user_id": c["user__id"],
                "email": c["user__email"],
                "total_spent": float(c["total_spent"] or 0),
                "total_orders": c["total_orders"]
            }
            for c in top_customers_qs
        ]

        # ---------- Final data ----------
        data = {
            "growth_trends": growth_trends,
            "vendor_vs_revenue": vendor_vs_revenue,
            "top_customers": top_customers
        }

        # Pass data through the serializer
        serializer = AdminAnalyticsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminSalesReportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        """
        Returns payout summary for each order item:
        Date, Order ID, Product, Vendor, Buyer, Qty, Price, Total, Commission, Earnings
        """

        # Fetch all delivered or paid orders (i.e., completed sales)
        order_items = (
            OrderItem.objects
            .filter(order__status__in=["paid", "confirmed", "shipped", "delivered"])
            .select_related("order", "product", "product__vendor", "order__user")
            .order_by("-order__created_at")
        )

        data = []
        for item in order_items:
            total = item.price * item.quantity
            commission = total * Decimal("0.03")  # assuming 3% platform commission
            earnings = commission

            data.append({
                "date": item.order.created_at,
                "order_id": item.order.id,
                "product": item.product.name,
                "vendor": item.product.vendor.email if item.product.vendor else None,
                "buyer": item.order.user.email if item.order.user else None,
                "quantity": item.quantity,
                "price": item.price,
                "total": total,
                "commission": commission,
                "earnings": earnings,
            })

        serializer = AdminSalesReportSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminTransactionTableViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        data = []

        order_items = OrderItem.objects.select_related('order', 'order__user').all().order_by('-order__created_at')
        
        for item in order_items:
            order = item.order
            amount = item.price * item.quantity
            refund = Decimal("0.00")  # Replace with refund calculation if you have refund model
            gateway_fee = amount * Decimal("0.02")  # Example 2% payment gateway fee
            net_received = amount - refund - gateway_fee

            data.append({
                "date": order.created_at,
                "order_id": order.id,
                "buyer": order.user.email,
                "payment_method": order.payment_method,
                "status": order.status,
                "amount": amount,
                "refund": refund,
                "gateway_fee": gateway_fee,
                "net_received": net_received,
            })

        serializer = AdminTransactionTableSerializer(data, many=True)
        return Response(serializer.data)

class AdminTaxTableViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        data = []

        order_items = OrderItem.objects.select_related('order', 'order__user', 'product').all().order_by('-order__created_at')

        for item in order_items:
            order = item.order
            base_amount = item.price * item.quantity
            tax = base_amount * Decimal("0.18")  # Example 18% GST
            total = base_amount + tax
            state = order.shipping_address.state if order.shipping_address else "Unknown"
            buyer_type = "B2C"  # Example, or calculate from user group

            data.append({
                "date": order.created_at,
                "invoice": f"INV-{order.id}",
                "product": item.product.name,
                "tax_type": "GST", 
                "base_amount": base_amount,
                "tax": tax,
                "total": total,
                "state": state,
                "buyer_type": buyer_type,
            })

        serializer = AdminTaxTableSerializer(data, many=True)
        return Response(serializer.data)
