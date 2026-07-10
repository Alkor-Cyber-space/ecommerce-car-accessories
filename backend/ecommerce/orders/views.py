from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Order,OrderItem
from .serializers import *
from rest_framework.decorators import action
from rest_framework import status
from payment.stripe_payment import initiate_payment_intent
from payment.factory import *
from payment.razorpay_payment import *
from decimal import Decimal
from django.conf import settings
import razorpay
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from rest_framework.views import APIView
from .shiprocket_client import *
from datetime import datetime
from rest_framework import generics, permissions
from django.db.models import Q
# from accounts.utils import generate_invoice_pdf
# from accounts.utils import send_order_invoice_email


class ShippingOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Calculate available shipping rates from Shiprocket.
        Expects:
        {
            "pickup_postcode": "400001",
            "delivery_postcode": "411001",
            "weight": 2.0,
            "cod": 1,
            "declared_value": 999
        }
        """
        payload = {
            "pickup_postcode": request.data.get("pickup_postcode"),
            "delivery_postcode": request.data.get("delivery_postcode"),
            "weight": float(request.data.get("weight", 0.5)),
            "cod": int(request.data.get("cod", 0)),
            "declared_value": float(request.data.get("declared_value", 0)),
        }
        print(payload)

        try:
            rates = calculate_shipping_rate(payload)
            if rates.get("data") and "available_courier_companies" in rates["data"]:
                options = []
                for courier in rates["data"]["available_courier_companies"]:
                    options.append({
                        "courier_name": courier["courier_name"],
                        "rate": Decimal(str(courier["rate"])),
                        "etd": courier.get("etd"),  # estimated days
                        "courier_company_id": courier["courier_company_id"],
                    })
                return Response({"options": options}, status=status.HTTP_200_OK)

            return Response({"error": "No couriers available"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class CheckoutViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     def create(self, request):
#         serializer = OrderSerializer(data=request.data, context={'request': request})
#         serializer.is_valid(raise_exception=True)

#         validated = serializer.validated_data
#         user = request.user
#         items = validated['items']
#         shipping_address = validated['shipping_address']
#         payment_method = validated['payment_method']

#         subtotal = Decimal('0.00')
#         tax_rate = Decimal('0.18')
#         shipping_fee = Decimal('50.00')

#         # Prepare metadata (keep it minimal for gateways)
#         metadata = {
#             "user_id": str(user.id),
#             "payment_method": payment_method,
#             "shipping_address": str(shipping_address.id),
#         }

#         for i, item in enumerate(items):
#             product = item['product']
#             quantity = item['quantity']
#             subtotal += product.price * quantity
#             metadata[f'product_{i}'] = str(product.id)
#             metadata[f'quantity_{i}'] = str(quantity)

#         tax = subtotal * tax_rate
#         total = subtotal + tax + shipping_fee

#         # Create pending order in DB
#         order = Order.objects.create(
#             user=user,
#             shipping_address=shipping_address,
#             tax=tax,
#             shipping_cost=shipping_fee,
#             total_price=total,
#             status="pending",
#             payment_method=payment_method
#         )

#         # Only pass minimal metadata to gateway
#         gateway_metadata = {"order_id": str(order.id)}

#         try:
#             gateway_handler = get_payment_gateway(payment_method)
#         except Exception:
#             raise ValidationError("Unsupported payment method")

#         gateway_response = gateway_handler(
#             user=user,
#             amount=float(total),  # convert to float for payment gateway
#             metadata=gateway_metadata
#         )

#         return Response({
#             "amount": float(total),
#             "payment_gateway_response": gateway_response,
#             "order_id": order.id
#         }, status=status.HTTP_200_OK)


# class CheckoutViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     def create(self, request):
#         serializer = OrderSerializer(data=request.data, context={'request': request})
#         serializer.is_valid(raise_exception=True)

#         validated = serializer.validated_data
#         user = request.user
#         items = validated['items']
#         shipping_address = validated['shipping_address']
#         payment_method = validated['payment_method']

#         subtotal = Decimal("0.00")
#         tax_rate = Decimal("0.18")
#         shipping_fee = Decimal(str(request.data.get("shipping_fee", "0.00")))
#         courier_company_id = request.data.get("courier_company_id")

#         for item in items:
#             product = item['product']
#             quantity = item['quantity']
#             subtotal += product.price * quantity

#         tax = subtotal * tax_rate
#         total = subtotal + tax + shipping_fee

#         # Create pending order in DB
#         order = Order.objects.create(
#             user=user,
#             shipping_address=shipping_address,
#             tax=tax,
#             shipping_cost=shipping_fee,
#             total_price=total,
#             status="pending",
#             payment_method=payment_method,
#             courier_company_id = courier_company_id
#         )

#         try:
#             order_payload = {
#                             "order_id": "TEST12345",   # your DB order ID
#                             "order_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
#                             "pickup_location": "VENDOR_2",
#                             "channel_id": "",         # leave blank unless using marketplace
#                             "comment": "Test order from Django",
                            
#                             "billing_customer_name": "Ramesh",
#                             "billing_last_name": "Sharma",
#                             "billing_address": "Panangad",
#                             "billing_address_2": "Kundanoor",
#                             "billing_city": "Ernakulam",
#                             "billing_pincode": "682001",
#                             "billing_state": "Kerala",
#                             "billing_country": "India",
#                             "billing_email": "ramesh@example.com",
#                             "billing_phone": "9876543210",
#                             "courier_company_id":"127",
#                             "shipping_is_billing": True,  # same as billing

#                             "order_items": [
#                                 {
#                                     "name": "Car Seat Cover",
#                                     "sku": "CAR-SEAT-001",
#                                     "units": 1,
#                                     "selling_price": 999,
#                                     "discount": 0,
#                                     "tax": 0,
#                                 }
#                             ],

#                             "payment_method": "COD",   # or "Prepaid"
#                             "sub_total": 999,
#                             "length": 10,
#                             "breadth": 10,
#                             "height": 10,
#                             "weight": 2.0
#                         }
#             sr_response = create_shiprocket_order(order_payload)
#             print("Shiprocket response:", sr_response)
#             if not sr_response.get("shipment_id") or sr_response.get("status_code") != 1:
#                 sr_response["error"] = "Shiprocket order not created. Check payload or credentials."    

#         except Exception as e:  
#             sr_response = {"error": str(e)}

#         for item in items:
#             product = item['product']
#             quantity = item['quantity']
#             OrderItem.objects.create(
#                 order=order,
#                 product=product,
#                 quantity=quantity,
#                 price=product.price
#             )

#         # Metadata to pass to payment provider
#         metadata = {"order_id": str(order.id)}

#         try:
#             gateway_handler = get_payment_gateway(payment_method)
#             gateway_response = gateway_handler(user, float(total), metadata)
#         except Exception as e:
#             raise ValidationError(str(e))

#         return Response({
#             "amount": float(total),
#             "payment_gateway_response": gateway_response,
#             "order_id": order.id,
#             "shiprocket_response": sr_response
#         }, status=status.HTTP_200_OK)

from datetime import datetime
from decimal import Decimal
from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

class CheckoutViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        user = request.user
        items = validated['items']
        shipping_address = validated['shipping_address']
        payment_method = validated['payment_method']

        subtotal = Decimal("0.00")
        tax_rate = Decimal("0.18")
        shipping_fee = Decimal(str(request.data.get("shipping_fee", "0.00")))
        courier_company_id = request.data.get("courier_company_id")

        print(shipping_fee)

        for item in items:
            product = item['product']
            quantity = item['quantity']
            subtotal += product.price * quantity

        tax = subtotal * tax_rate
        total = subtotal + tax + shipping_fee
        print(total)
        # Create pending order
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            tax=tax,
            shipping_cost=shipping_fee,
            total_price=total,
            status="pending",  # initial state
            payment_method=payment_method,
            courier_company_id=courier_company_id
        )

        # Save order items
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['product'].price
            )

        # Trigger stock deduction if COD by saving the order again
        if payment_method == 'cod':
            order.save()

        # Payment metadata
        gateway_response = None
        if payment_method != 'cod':
            metadata = {"order_id": str(order.id)}
            try:
                gateway_handler = get_payment_gateway(payment_method)
                gateway_response = gateway_handler(user, float(total) / 100, metadata)
            except Exception as e:
                raise ValidationError(str(e))

        return Response({
            "amount": float(total),
            "payment_gateway_response": gateway_response,
            "order_id": order.id,
            "message": "Order created successfully and awaiting vendor confirmation"
        }, status=status.HTTP_200_OK)
 



class UserOrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Fetch order history"""
        if request.user.is_superuser:
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')

        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(orders, request)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


    def retrieve(self, request, pk=None):
        """Retrieve specific order details"""
        if request.user.is_superuser:
            order = get_object_or_404(Order, pk=pk)  # superuser can see all
        else:
            order = get_object_or_404(Order, pk=pk, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)


    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        """Cancel order before shipping"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status in ['pending', 'paid']:
            if order.shiprocket_order_id:
                try:
                    cancel_shiprocket_order([int(order.shiprocket_order_id)])
                except Exception as e:
                    import logging
                    import traceback
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to cancel order #{order.id} on Shiprocket during customer cancellation: {str(e)}", exc_info=True)
                    traceback.print_exc()

            order.status = 'cancelled'
            order.save()
            return Response({'message': 'Order cancelled successfully.'})
        return Response({'error': 'Order cannot be cancelled at this stage.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='track')
    def track_order(self, request, pk=None):
        """Track order status"""
        order = get_object_or_404(Order, pk=pk, user=request.user)
        return Response({
            'order_id': order.id,
            'status': order.status,
            'last_updated': order.updated_at,
        })

    
def process_order_refund(order, amount=None):
    """
    Trigger Stripe/Razorpay refund for a paid order.
    """
    if order.payment_method == "cod":
        return {"success": True, "method": "cod", "message": "COD order, no gateway refund required."}

    if not order.payment_id:
        return {"success": False, "error": "No payment_id recorded for this order."}

    refund_amount = amount if amount is not None else order.total_price

    if order.payment_method == "stripe":
        from payment.refunds import refund_stripe_payment
        return refund_stripe_payment(order.payment_id, refund_amount)
    elif order.payment_method == "razorpay":
        from payment.refunds import refund_razorpay_payment
        return refund_razorpay_payment(order.payment_id, refund_amount)
    else:
        return {"success": False, "error": f"Refund not supported for payment method: {order.payment_method}"}


@csrf_exempt
def shiprocket_webhook(request):
    if request.method != "POST":
        return JsonResponse({"detail":"method not allowed"}, status=405)
    payload = json.loads(request.body.decode("utf-8"))
    
    # Check if this webhook corresponds to a reverse pickup / return request
    awb = payload.get("awb") or payload.get("awb_code")
    status_name = str(payload.get("status", "")).lower()
    
    if awb:
        ret_req = ReturnRequest.objects.filter(reverse_awb=awb).first()
        if ret_req:
            # Map Shiprocket tracking status to ReturnRequest states
            if status_name in ["delivered", "received"]:
                if ret_req.status not in ["received", "refunded"]:
                    ret_req.status = "received"
                    ret_req.save()
                    
                    # Trigger the refund process
                    refund_res = process_order_refund(ret_req.order)
                    if refund_res.get("success"):
                        ret_req.status = "refunded"
                        ret_req.save()
            elif status_name in ["picked up", "picked_up", "out for pickup", "out_for_pickup"]:
                ret_req.status = "picked_up"
                ret_req.save()
            return JsonResponse({"ok": True, "handled": "return_request"})
            
        # Fallback to forward order update if it matches a forward AWB
        order = Order.objects.filter(awb_code=awb).first()
        if order:
            if status_name in ["delivered", "received"]:
                order.status = "delivered"
                order.save()
            elif status_name in ["shipped", "in transit"]:
                order.status = "shipped"
                order.save()
            return JsonResponse({"ok": True, "handled": "order"})

    return JsonResponse({"ok": True, "handled": "none"})

class VendorOrderListView(generics.ListAPIView):
    serializer_class = VendorOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Ensure only vendors can access
        if not user.groups.filter(name="Vendor").exists():
            return Order.objects.none()

        return Order.objects.filter(items__product__vendor=user).distinct()


class VendorOrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        vendor = request.user

        # Ensure the user is a vendor
        if not vendor.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can update orders"}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the order
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch only the vendor’s items from this order
        vendor_items = OrderItem.objects.filter(order=order, product__vendor=vendor)
        if not vendor_items.exists():
            return Response(
                {"error": "You don't have any products in this order"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Mark this vendor’s portion as confirmed
        order.status = "confirmed"
        order.save()

        try:
            # Calculate subtotal, tax, shipping, totals for this vendor only
            tax_rate = Decimal("0.18")
            subtotal = sum(item.price * item.quantity for item in vendor_items)
            total_tax = subtotal * tax_rate
            shipping_fee = order.shipping_cost  # shared or per vendor if you decide to split
            total_amount = subtotal + total_tax + shipping_fee

            # Customer and shipping info
            shipping_address = order.shipping_address
            customer = order.user

            # Prepare Shiprocket payload for this vendor’s portion
            order_payload = {
                "order_id": f"{order.id}_V{vendor.id}",  # unique per vendor
                "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                "pickup_location": f"VENDOR_{vendor.id}",
                "comment": f"Order #{order.id} (Vendor #{vendor.id}) from {customer.email}",

                # Billing / Shipping info
                "billing_customer_name": customer.first_name or customer.username,
                "billing_last_name": customer.last_name or "",
                "billing_address": shipping_address.line1,
                "billing_address_2": shipping_address.line2 or "",
                "billing_city": shipping_address.city,
                "billing_pincode": shipping_address.postal_code,
                "billing_state": shipping_address.state,
                "billing_country": shipping_address.country,
                "billing_email": customer.email,
                "billing_phone": getattr(customer, "phone_number", "9999999999"),
                "shipping_is_billing": True,

                # Courier and payment info
                "courier_company_id": str(order.courier_company_id or ""),
                "payment_method": "COD" if order.payment_method == "cod" else "Prepaid",

                # Vendor’s products only
                "order_items": [
                    {
                        "name": item.product.name,
                        "sku": f"SKU-{item.product.id}",
                        "units": item.quantity,
                        "selling_price": float(item.price),
                        "discount": 0,
                        "hsn": getattr(item.product, "hsn", "8708"),
                        "tax": ""
                    }
                    for item in vendor_items
                ],

                # Totals
                "sub_total": float(subtotal),
                "tax_total": float(total_tax),
                "shipping_charges": float(shipping_fee),
                "total_amount": float(total_amount),

                # Package dimensions (from first item)
                "length": float(vendor_items[0].product.length) if vendor_items else 10.0,
                "breadth": float(vendor_items[0].product.breadth) if vendor_items else 10.0,
                "height": float(vendor_items[0].product.height) if vendor_items else 10.0,
                "weight": float(vendor_items[0].product.weight) if vendor_items else 1.0,
            }

            # ✅ Send to Shiprocket
            sr_response = create_shiprocket_order(order_payload)
            print("Shiprocket response:", sr_response)

            # ✅ Save shipment details if successful
            if sr_response.get("shipment_id") and sr_response.get("status_code") == 1:
                order.shiprocket_order_id = str(sr_response.get("order_id", ""))
                order.awb_code = sr_response.get("awb_code", "")
                order.courier_name = sr_response.get("courier_name", "")
                order.save()

                return Response({
                    "message": f"Vendor {vendor.id} items for Order #{order.id} confirmed and sent to Shiprocket",
                    "shiprocket_response": sr_response,
                    "calculation_summary": {
                        "subtotal": float(subtotal),
                        "tax": float(total_tax),
                        "shipping": float(shipping_fee),
                        "total": float(total_amount)
                    }
                }, status=status.HTTP_200_OK)

            else:
                return Response({
                    "message": f"Vendor {vendor.id} items for Order #{order.id} confirmed but Shiprocket order creation failed",
                    "shiprocket_response": sr_response
                }, status=status.HTTP_200_OK)

        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error confirming order #{order_id} for vendor #{vendor.id}: {str(e)}", exc_info=True)
            traceback.print_exc()
            
            # Print the detailed HTTP error body from Shiprocket if available
            error_detail = None
            if hasattr(e, 'response') and e.response is not None:
                print("=== SHIPROCKET API ERROR RESPONSE ===")
                print(e.response.text)
                print("=====================================")
                try:
                    error_detail = e.response.json()
                except Exception:
                    error_detail = e.response.text

            return Response({
                "message": f"Vendor {vendor.id} items for Order #{order.id} confirmed but Shiprocket API call failed",
                "error": str(e),
                "shiprocket_error_detail": error_detail
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class VendorOrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        user = request.user

        # Ensure only vendors can cancel orders
        if not user.groups.filter(name="Vendor").exists():
            return Response({"error": "Only vendors can cancel orders"}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(id=order_id, items__product__vendor=user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        # If order is confirmed and pushed to Shiprocket, cancel it there
        if order.shiprocket_order_id:
            try:
                cancel_shiprocket_order([int(order.shiprocket_order_id)])
            except Exception as e:
                import logging
                import traceback
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to cancel order #{order.id} on Shiprocket during vendor cancellation: {str(e)}", exc_info=True)
                traceback.print_exc()

        # Update order status to cancelled
        order.status = "cancelled"
        order.save()

        return Response({"message": f"Order #{order.id} has been cancelled"}, status=status.HTTP_200_OK)



class OrderTrackingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        """
        Get Shiprocket tracking status for a specific order.
        URL: /api/orders/<order_id>/track/
        """     
        try:
            order = Order.objects.get(id=order_id)
            print(order)
        except Order.DoesNotExist:  
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if not order.awb_code:
            return Response({"error": "No AWB code available for this order."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tracking_data = track_shiprocket_order(order.awb_code)
            return Response(tracking_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InvoiceDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        pdf_file = generate_invoice_pdf(order)
        return FileResponse(pdf_file, as_attachment=True, filename=pdf_file.name)


class ReturnRequestViewSet(viewsets.ModelViewSet):
    queryset = ReturnRequest.objects.all()
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ReturnRequest.objects.all().order_by('-created_at')
        elif user.groups.filter(name="Vendor").exists():
            return ReturnRequest.objects.filter(order__items__product__vendor=user).distinct().order_by('-created_at')
        return ReturnRequest.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        order = serializer.validated_data['order']
        user = self.request.user

        # Ensure order belongs to user
        if order.user != user:
            raise ValidationError("You cannot request a return for this order.")

        # Ensure order status is delivered
        if order.status != 'delivered':
            raise ValidationError("Only delivered orders can be returned.")

        # Check if return request already exists
        if ReturnRequest.objects.filter(order=order).exists():
            raise ValidationError("A return request has already been submitted for this order.")

        # Trigger Shiprocket reverse pickup per vendor in the order
        vendors = {item.product.vendor for item in order.items.all()}
        
        for vendor in vendors:
            vendor_items = order.items.filter(product__vendor=vendor)
            
            # Fetch vendor address (reverse shipping destination)
            from accounts.models import Address as UserAddress
            vendor_address = UserAddress.objects.filter(user=vendor, is_pickup=True).first() or UserAddress.objects.filter(user=vendor).first()
            shipping_address = order.shipping_address

            pickup_phone = getattr(user, 'phone_number', '') or '9999999999'
            shipping_phone = vendor_address.phone_number if vendor_address else '9999999999'

            payload = {
                "order_id": f"RET_{order.id}_V{vendor.id}",
                "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                
                # Pickup Info (Customer returning the item)
                "pickup_customer_name": user.first_name or user.username,
                "pickup_last_name": user.last_name or "",
                "pickup_address": shipping_address.line1 if shipping_address else "Customer Address",
                "pickup_address_2": shipping_address.line2 if (shipping_address and shipping_address.line2) else "",
                "pickup_city": shipping_address.city if shipping_address else "",
                "pickup_state": shipping_address.state if shipping_address else "",
                "pickup_country": shipping_address.country if shipping_address else "India",
                "pickup_pincode": shipping_address.postal_code if shipping_address else "",
                "pickup_email": user.email,
                "pickup_phone": pickup_phone,

                # Shipping Info (Vendor warehouse receiving the item)
                "shipping_customer_name": vendor.username,
                "shipping_last_name": "",
                "shipping_address": vendor_address.line1 if vendor_address else "Vendor Warehouse",
                "shipping_address_2": vendor_address.line2 if (vendor_address and vendor_address.line2) else "",
                "shipping_city": vendor_address.city if vendor_address else "",
                "shipping_state": vendor_address.state if vendor_address else "",
                "shipping_country": vendor_address.country if vendor_address else "India",
                "shipping_pincode": vendor_address.postal_code if vendor_address else "",
                "shipping_email": vendor.email,
                "shipping_phone": shipping_phone,

                "order_items": [
                    {
                        "name": item.product.name,
                        "sku": f"SKU-{item.product.id}",
                        "units": item.quantity,
                        "selling_price": float(item.price),
                        "discount": 0,
                        "hsn": getattr(item.product, "hsn", "8708"),
                        "tax": ""
                    }
                    for item in vendor_items
                ],
                "payment_method": "Prepaid",
                "sub_total": float(sum(item.price * item.quantity for item in vendor_items)),
                "length": float(vendor_items[0].product.length) if vendor_items else 10.0,
                "breadth": float(vendor_items[0].product.breadth) if vendor_items else 10.0,
                "height": float(vendor_items[0].product.height) if vendor_items else 10.0,
                "weight": float(vendor_items[0].product.weight) if vendor_items else 1.0,
            }

            reverse_shipment_id = None
            reverse_awb = None
            
            try:
                sr_response = create_shiprocket_return(payload)
                if sr_response.get("shipment_id"):
                    reverse_shipment_id = str(sr_response.get("shipment_id"))
                    reverse_awb = sr_response.get("awb_code")
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to create Shiprocket return request: {e}", exc_info=True)

            # Create a separate ReturnRequest tracking record for this vendor portion
            ReturnRequest.objects.create(
                order=order,
                user=user,
                reason=serializer.validated_data['reason'],
                status='pending',
                reverse_shipment_id=reverse_shipment_id,
                reverse_awb=reverse_awb
            )

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_return(self, request, pk=None):
        """
        Manually approve/confirm a return request (vendor/superuser only).
        Processes the automated refund via Stripe/Razorpay.
        """
        ret_req = self.get_object()
        user = request.user
        
        # Ensure only vendor of this order or superuser can approve
        is_vendor = ret_req.order.items.filter(product__vendor=user).exists()
        if not (user.is_superuser or is_vendor):
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            
        if ret_req.status in ['received', 'refunded']:
            return Response({"error": "Return request is already completed/refunded."}, status=status.HTTP_400_BAD_REQUEST)
            
        ret_req.status = 'received'
        ret_req.save()
        
        # Trigger payment gateway refund
        refund_res = process_order_refund(ret_req.order)
        if refund_res.get("success"):
            ret_req.status = 'refunded'
            ret_req.save()
            return Response({
                "message": "Return request approved and refund processed successfully.",
                "refund_details": refund_res
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Return marked as received, but automated refund failed.",
                "error": refund_res.get("error")
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
