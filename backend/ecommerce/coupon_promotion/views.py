from django.shortcuts import render
from rest_framework import generics,status
from rest_framework.response import Response
from .models import *
from accounts.models import FCMToken
from .serializers import *
from rest_framework.generics import GenericAPIView
from firebase_admin import messaging
# Create your views here.

class PromotionListCreateAPIView(generics.GenericAPIView):
    queryset=Promotion.objects.all()
    serializer_class=PromrotionSerializers

        # serializer_class=PromrotionSerializers
    def get_serializer_class(self):
        if self.request.method in ["POST","GET","PUT"]:
            return PromrotionSerializers
        return PromotionReadSerializer
        
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()

            # Send FCM notifications
            tokens = FCMToken.objects.values_list('token', flat=True)
            for token in tokens:
                try:
                    self.send_notification(
                        token,
                        f"New Promotion: {instance.name}",   # 👈 changed here
                        instance.description
                    )
                except Exception as e:
                    print(f"Failed to send notification to {token}: {e}")

            return Response({
                "status": "created successfully",
                "code": status.HTTP_201_CREATED,
                "message": serializer.data
            })

        return Response({
            "status": "Failed",
            "code": status.HTTP_400_BAD_REQUEST,
            "message": serializer.errors
        })

    @staticmethod
    def send_notification(token, title, body):
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            token=token
        )
        response = messaging.send(message)
        print('Successfully sent message:', response)


    def get(self,request,pk,*args,**kwargs):
        try:
            instance=Promotion.objects.get(pk=pk)
        except Promotion.DoesNotExist:
            return Response({
                "status":"Failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": "Promotion with the given ID does not exist",
            })
        serializer =self.get_serializer(instance)
        return Response({
            "status": "Success",
            "code": status.HTTP_200_OK,
            "data": serializer.data
        })
    
    def put(self,request,pk):
        try:
            instance=Promotion.objects.get(pk=pk)
        except Promotion.DoesNotExist:
            return Response({
                "status" :"failed",
                "code":  status.HTTP_400_BAD_REQUEST,
                "message": "promotion not found"
            })
        serializer = self.get_serializer(instance=instance, data=self.request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "Updated successfully",
                "code": status.HTTP_200_OK,
                "message": serializer.data
            })
        else:
            return Response({
                "status": "Failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message" : serializer.errors
            },status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,*args,**kwargs):
        pk=kwargs.get("pk")
        try:
            instance=Promotion.objects.get(pk=pk)
            instance.delete()
            return Response({
                "status": "Deleted Successfully",
                "code": status.HTTP_200_OK
            })
        except Promotion.DoesNotExist:
            return Response({
                "status" :"failed",
                "code" : status.HTTP_400_BAD_REQUEST,
                "message" : "promotion does not exist"
            },status.HTTP_400_BAD_REQUEST)
         
class promotionAllAPIView(generics.GenericAPIView):
    queryset=Promotion.objects.all()
    serializer_class=PromrotionSerializers

    def get(self,request):
        
            promotion=self.get_queryset()
            if not promotion.exists():
                return Response({
                "status" : "failed",
                "code": status.HTTP_204_NO_CONTENT,
                "message" : "no data found"
            })
            serializer = self.get_serializer(promotion,many=True)
            return Response({
                "status": "Success",
                "code" : status.HTTP_200_OK,
                "message" : serializer.data
            })
        

class CouponAPIView(generics.GenericAPIView):
    queryset=Coupon.objects.all()
    serializer_class=CouponSerializer

    @staticmethod
    def send_notification(token, title, body):
        """Send FCM push notification to a single token"""
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                token=token
            )
            response = messaging.send(message)
            print(f"Successfully sent message to {token}: {response}")
        except Exception as e:
            print(f"Failed to send notification to {token}: {e}")

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            coupon = serializer.save()

            # Send notification to all users with FCM tokens
            tokens = FCMToken.objects.values_list('token', flat=True)
            for token in tokens:
                self.send_notification(
                    token,
                    title=f"New Coupon: {coupon.title}",
                    body=f"Use code {coupon.code} to get your discount!"
                )

            return Response({
                "status": "Created successfully",
                "code": status.HTTP_201_CREATED,
                "message": serializer.data
            })
        else:
            return Response({
                "status": "Failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": serializer.errors
            }, status.HTTP_400_BAD_REQUEST)
        
    def get(self,request,*args,**kwargs):
        pk=kwargs.get('pk',None)
        if pk is None:
            coupon=self.get_queryset()
            serializer=self.get_serializer(coupon,many=True)
            return Response({
                "status": "Success",
                "code" : status.HTTP_200_OK,
                "message": serializer.data
            })
        else:
            try:
                coupon=self.get_queryset().get(pk=pk)
                serializer=self.get_serializer(coupon)
                return Response({
                    "status": "Success",
                    "code" : status.HTTP_200_OK,
                    "message": serializer.data
                })
            except self.get_queryset().model.DoesNotExist:
                return Response({
                    "status": "failed",
                    "code" : status.HTTP_400_BAD_REQUEST,
                    "message" : "coupon not found"
                },status.HTTP_400_BAD_REQUEST)
    
    def put(self,request,*args,**kwargs):
        try:
            pk=self.kwargs['pk']
            coupon=Coupon.objects.filter(pk=pk).first()
            if coupon:
                data=self.request.data
                serializer = self.get_serializer(instance=coupon,data=data,partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        "status": "Updated successfully",
                        "code" : status.HTTP_200_OK,
                        "message" : serializer.data
                    })
                else: 
                    return Response({
                        "status": "Failed",
                        "code" : status.HTTP_400_BAD_REQUEST,
                        "message" : serializer.errors
                    },status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "status": "Failed",
                    "code" : status.HTTP_400_BAD_REQUEST,
                    "message" : "coupon not found"
                })
                

        except Exception as e:
            return Response({
                "status": "Failed",
                "code" : status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message" : str(e)
            },status.HTTP_500_INTERNAL_SERVER_ERROR)
    def delete(self,request,*args,**kwargs):
        try:
            pk =kwargs.get('pk')
            if not pk:
                return Response({
                    "status":"Failed",
                    "code" : status.HTTP_400_BAD_REQUEST,
                    "message": "id not provided"
                })
            else:
                instance=Coupon.objects.filter(pk=pk).first()
                if not instance:
                    return Response({
                        "status": "Failed",
                        "code": status.HTTP_400_BAD_REQUEST,
                        "message": "coupon not found"
                    },status.HTTP_400_BAD_REQUEST)
                instance.delete()
                return Response({
                    "status" : "Deleted successfully",
                    "code" : status.HTTP_200_OK
                })
        except Exception as e:
            return Response({
                "status" : "Failed",
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message" : str(e)
            },status.HTTP_500_INTERNAL_SERVER_ERROR)            

class ApplycouponAPIView(generics.GenericAPIView):
    serializer_class=ApplyCouponSerializer

    def post(self,request):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        coupon=serializer.validated_data['coupon']
        product=serializer.validated_data['product']
        discount_price= serializer.apply_discount()

        response_data = {
            'product': productSerializer(product).data,
            'coupon': coupon.name,
            'original_price': product.price,
            'discounted_price': discount_price,
            'discount_value': coupon.discount_value
        }
        return Response(response_data, status=status.HTTP_200_OK)
    
class ApplyPromotionApiview(GenericAPIView):
    serializer_class=ApplyPromotionSerializer
    def post(self,request):
        serializer =self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result=serializer.apply_promotion()
        return Response(result,status=status.HTTP_200_OK)
    

class BannerAPIview(generics.GenericAPIView):
    serializer_class=BannerSerilizer
    queryset = Banner.objects.all()

    def get(self,request):

        banners=self.get_queryset()
        if banners:
            serializer =self.get_serializer(banners,many=True)
            return Response({
                "status": "success",
                "code" : status.HTTP_200_OK,
                "message": serializer.data
            })
        return Response({
        "status": "Failed",
        "code": 404,
        "message": "No banners found"
    })
    
    def post(self,request):
        try:
            serializer =self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status" : "Created successfully",
                    "code": status.HTTP_200_OK,
                    "message" : serializer.data
                },status=status.HTTP_200_OK)
            return Response({
                "status": "Failed",
                "code": status.HTTP_400_BAD_REQUEST,
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                    "status" : "Failed",
                    "code": status.HTTP_400_BAD_REQUEST,
                    "message" : str(e)
                },status=status.HTTP_400_BAD_REQUEST)
        
class RetrieveBannerAPIview(generics.GenericAPIView):
    serializer_class=BannerSerilizer
    queryset=Banner.objects.all()

    def get_object(self,pk):
        try:
            return Banner.objects.get(pk=pk)
        except:
            return None
    
    def get(self,request,pk):
        banner=self.get_object(pk)
        if not banner:
            return Response({
                    "status" : "Failed",
                    "code": status.HTTP_404_NOT_FOUND,
                    "message" : "not found"
            },status=status.HTTP_404_NOT_FOUND)
    
    def put(self,request,pk):
        banner=self.get_object(pk)
        if not banner:
            return Response({
                    "status" : "Failed",
                    "code": status.HTTP_404_NOT_FOUND,
                    "message" : "not found"
            },status=status.HTTP_404_NOT_FOUND)
        serializer=self.get_serializer(banner,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                    "status" : "Updated Successfully",
                    "code": status.HTTP_200_OK,
                    "message" : serializer.data
            },status=status.HTTP_200_OK)
        return Response({
                    "status" : "Failed",
                    "code": status.HTTP_400_BAD_REQUEST,
                    "message" : "not found"
            },status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        banner=self.get_object(pk=pk)
        if not banner:
            return Response({
                    "status" : "Failed",
                    "code": status.HTTP_404_NOT_FOUND,
                    "message" : "not found"
            },status=status.HTTP_404_NOT_FOUND)
        banner.delete()
        return Response({
                    "status" : "Deleted Successfully",
                    "code": status.HTTP_204_NO_CONTENT
                })
    