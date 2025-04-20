import hmac
import hashlib
import json
import random
import urllib.parse
import logging
from decimal import Decimal
from datetime import datetime, timedelta

import requests
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from spotify_user.models import SpotifyUser
from .vnpay import vnpay

logger = logging.getLogger(__name__)


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        logger.debug(f"Request data: {request.POST}")
        if not request.user.is_authenticated:
            logger.error("User is not authenticated")
            return Response(
                {"error": "User is not authenticated. Please provide a valid token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            spotify_user = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            logger.error("SpotifyUser not found for this user")
            return Response(
                {"error": "SpotifyUser not found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

    

        current_time = timezone.now()
        if spotify_user.vip and spotify_user.vip_start_date:
            time_elapsed = current_time - spotify_user.vip_start_date
            if time_elapsed <= timedelta(days=30):  # Nếu còn trong 30 ngày
                logger.info(f"User {spotify_user.username} is still within VIP period.")
                return Response(
                    {"error": "Bạn đã là thành viên VIP. Hệ thống sẽ cho phép gia hạn khi gói hiện tại kết thúc."},
                    status=status.HTTP_400_BAD_REQUEST,
                )


        if spotify_user.vip:
            logger.info(f"User {spotify_user.username} is already a VIP.")
            return Response(
                {"error": "Bạn đã là thành viên VIP. Không cần thanh toán thêm."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_id = "ORDER_" + datetime.now().strftime("%Y%m%d%H%M%S")
        amount = request.POST.get("amount", "10000")
        order_desc = request.POST.get("order_desc", "Thanh toan don hang " + order_id)
        bank_code = request.POST.get("bank_code", "NCB")

        try:
            logger.debug(f"Amount before conversion: {amount}")
            amount = Decimal(amount)
            if amount <= 0:
                logger.error("Amount must be greater than 0")
                return Response(
                    {"error": "Amount must be greater than 0"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            logger.debug(f"Amount after conversion: {amount}, vnp_Amount: {int(amount * 100)}")
        except (ValueError, TypeError):
            logger.error(f"Invalid amount format: {amount}")
            return Response(
                {"error": "Invalid amount format"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.create(
            user=spotify_user,
            order_id=order_id,
            amount=amount,
            status="PENDING",
        )

        # Sử dụng lớp vnpay để tạo URL thanh toán
        vnp = vnpay()
        vnp.requestData['vnp_Version'] = '2.1.0'
        vnp.requestData['vnp_Command'] = 'pay'
        vnp.requestData['vnp_TmnCode'] = settings.VNPAY_CONFIG['VNP_TMN_CODE']
        vnp.requestData['vnp_Amount'] = int(amount * 100)
        vnp.requestData['vnp_CurrCode'] = 'VND'
        vnp.requestData['vnp_TxnRef'] = order_id
        vnp.requestData['vnp_OrderInfo'] = order_desc
        vnp.requestData['vnp_OrderType'] = 'billpayment'
        vnp.requestData['vnp_Locale'] = 'vn'
        vnp.requestData['vnp_CreateDate'] = datetime.now().strftime('%Y%m%d%H%M%S')
        vnp.requestData['vnp_ExpireDate'] = (datetime.now() + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S")
        vnp.requestData['vnp_ReturnUrl'] = settings.VNPAY_CONFIG['VNP_RETURN_URL']

        if bank_code:
            vnp.requestData['vnp_BankCode'] = bank_code

        # Lấy địa chỉ IP của client
        ipaddr = self.get_client_ip(request)
        vnp.requestData['vnp_IpAddr'] = ipaddr

        logger.debug(f"VNPay params: {vnp.requestData}")

        # Kiểm tra các tham số bắt buộc
        required_params = [
            "vnp_Version", "vnp_Command", "vnp_TmnCode", "vnp_Amount",
            "vnp_CurrCode", "vnp_TxnRef", "vnp_OrderInfo", "vnp_Locale",
            "vnp_ReturnUrl", "vnp_CreateDate", "vnp_ExpireDate", "vnp_IpAddr"
        ]
        for param in required_params:
            if param not in vnp.requestData or not vnp.requestData[param]:
                logger.error(f"Missing or empty required parameter: {param}")
                return Response(
                    {"error": f"Missing or empty required parameter: {param}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Tạo URL thanh toán
        vnpay_payment_url = vnp.get_payment_url(
            settings.VNPAY_CONFIG['VNP_URL'],
            settings.VNPAY_CONFIG['VNP_HASH_SECRET']
        )
        logger.debug(f"VNPay URL: {vnpay_payment_url}")

        return Response(
            {"payment_url": vnpay_payment_url, "order_id": order_id},
            status=status.HTTP_200_OK
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip



class PaymentReturnView(APIView):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        vnp = vnpay()
        vnp.responseData = request.GET.dict()
        logger.debug(f"VNPay return data: {vnp.responseData}")

        if not vnp.validate_response(settings.VNPAY_CONFIG['VNP_HASH_SECRET']):
            logger.error("Invalid checksum")
            params = {
                'status': 'error',
                'message': 'Sai checksum',
                'vnp_Amount': vnp.responseData.get('vnp_Amount', ''),
                'vnp_BankCode': vnp.responseData.get('vnp_BankCode', ''),
                'vnp_ResponseCode': vnp.responseData.get('vnp_ResponseCode', ''),
                'vnp_TxnRef': vnp.responseData.get('vnp_TxnRef', ''),
            }
            redirect_url = f"{settings.FRONTEND_URL}?{urllib.parse.urlencode(params)}"
            logger.debug(f"Redirecting to: {redirect_url}")
            return HttpResponseRedirect(redirect_url)

        order_id = vnp.responseData.get('vnp_TxnRef')
        vnp_response_code = vnp.responseData.get('vnp_ResponseCode')
        vnp_amount = vnp.responseData.get('vnp_Amount', '')

        logger.debug(f"VNPay response code: {vnp_response_code}")

        try:
            payment = Payment.objects.get(order_id=order_id)
        except Payment.DoesNotExist:
            logger.error(f"Payment with order_id {order_id} not found")
            params = {
                'status': 'error',
                'message': 'Không tìm thấy giao dịch',
                'vnp_Amount': vnp_amount,
                'vnp_BankCode': vnp.responseData.get('vnp_BankCode', ''),
                'vnp_ResponseCode': vnp_response_code,
                'vnp_TxnRef': order_id,
            }
            redirect_url = f"{settings.FRONTEND_URL}?{urllib.parse.urlencode(params)}"
            logger.debug(f"Redirecting to: {redirect_url}")
            return HttpResponseRedirect(redirect_url)

        if vnp_response_code == "00":
            payment.status = "COMPLETED"
            payment.save()

            spotify_user = payment.user
            logger.debug(f"SpotifyUser instance: {spotify_user}, username: {spotify_user.username}, current vip: {spotify_user.vip}")
            if not spotify_user.vip:  # Chỉ cập nhật nếu chưa là VIP
                spotify_user.vip = True
                spotify_user.vip_start_date = datetime.now()  # Cập nhật lại thời gian bắt đầu VIP
                spotify_user.save()
                logger.debug(f"Updated SpotifyUser {spotify_user.username} to VIP with start date {spotify_user.vip_start_date}")
            else:
                logger.debug(f"SpotifyUser {spotify_user.username} is already VIP, updating start date")
                spotify_user.vip_start_date = datetime.now()  # Gia hạn bằng cách cập nhật thời gian
                spotify_user.save()

            params = {
                'status': 'success',
                'message': 'Thanh toán thành công',
                'vnp_Amount': vnp_amount,
                'vnp_BankCode': vnp.responseData.get('vnp_BankCode', ''),
                'vnp_ResponseCode': vnp_response_code,
                'vnp_TxnRef': order_id,
            }
        else:
            payment.status = "FAILED"
            payment.save()
            params = {
                'status': 'error',
                'message': 'Thanh toán thất bại',
                'vnp_Amount': vnp_amount,
                'vnp_BankCode': vnp.responseData.get('vnp_BankCode', ''),
                'vnp_ResponseCode': vnp_response_code,
                'vnp_TxnRef': order_id,
            }

        redirect_url = f"{settings.FRONTEND_URL}?{urllib.parse.urlencode(params)}"
        logger.debug(f"Redirecting to: {redirect_url}")
        return HttpResponseRedirect(redirect_url)

    
class QueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "User is not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        url = settings.VNPAY_CONFIG['VNP_API_URL']
        secret_key = settings.VNPAY_CONFIG['VNP_HASH_SECRET']
        vnp_TmnCode = settings.VNPAY_CONFIG['VNP_TMN_CODE']
        vnp_RequestId = str(random.randint(10**11, 10**12 - 1)).zfill(12)
        vnp_Version = '2.1.0'
        vnp_Command = 'querydr'
        vnp_TxnRef = request.data.get('order_id')
        vnp_OrderInfo = 'kiem tra gd'
        vnp_TransactionDate = request.data.get('trans_date')
        vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
        vnp_IpAddr = request.META.get('REMOTE_ADDR', '127.0.0.1')

        hash_data = "|".join([
            vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
            vnp_TxnRef, vnp_TransactionDate, vnp_CreateDate,
            vnp_IpAddr, vnp_OrderInfo
        ])

        secure_hash = hmac.new(secret_key.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

        data = {
            "vnp_RequestId": vnp_RequestId,
            "vnp_TmnCode": vnp_TmnCode,
            "vnp_Command": vnp_Command,
            "vnp_TxnRef": vnp_TxnRef,
            "vnp_OrderInfo": vnp_OrderInfo,
            "vnp_TransactionDate": vnp_TransactionDate,
            "vnp_CreateDate": vnp_CreateDate,
            "vnp_IpAddr": vnp_IpAddr,
            "vnp_Version": vnp_Version,
            "vnp_SecureHash": secure_hash
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, data=json.dumps(data))

        if response.status_code == 200:
            response_json = response.json()
        else:
            response_json = {"error": f"Request failed with status code: {response.status_code}"}

        return Response(response_json, status=status.HTTP_200_OK)

class RefundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "User is not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        url = settings.VNPAY_CONFIG['VNP_API_URL']
        secret_key = settings.VNPAY_CONFIG['VNP_HASH_SECRET']
        vnp_TmnCode = settings.VNPAY_CONFIG['VNP_TMN_CODE']
        vnp_RequestId = str(random.randint(10**11, 10**12 - 1)).zfill(12)
        vnp_Version = '2.1.0'
        vnp_Command = 'refund'
        vnp_TransactionType = request.data.get('transaction_type', '02')
        vnp_TxnRef = request.data.get('order_id')
        vnp_Amount = request.data.get('amount')
        vnp_OrderInfo = request.data.get('order_desc', 'Hoan tien')
        vnp_TransactionNo = '0'
        vnp_TransactionDate = request.data.get('trans_date')
        vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
        vnp_CreateBy = request.user.username
        vnp_IpAddr = request.META.get('REMOTE_ADDR', '127.0.0.1')

        try:
            vnp_Amount = int(Decimal(vnp_Amount) * 100)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid amount format"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hash_data = "|".join([
            vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode, vnp_TransactionType, vnp_TxnRef,
            str(vnp_Amount), vnp_TransactionNo, vnp_TransactionDate, vnp_CreateBy, vnp_CreateDate,
            vnp_IpAddr, vnp_OrderInfo
        ])

        secure_hash = hmac.new(secret_key.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

        data = {
            "vnp_RequestId": vnp_RequestId,
            "vnp_TmnCode": vnp_TmnCode,
            "vnp_Command": vnp_Command,
            "vnp_TxnRef": vnp_TxnRef,
            "vnp_Amount": vnp_Amount,
            "vnp_OrderInfo": vnp_OrderInfo,
            "vnp_TransactionDate": vnp_TransactionDate,
            "vnp_CreateDate": vnp_CreateDate,
            "vnp_IpAddr": vnp_IpAddr,
            "vnp_TransactionType": vnp_TransactionType,
            "vnp_TransactionNo": vnp_TransactionNo,
            "vnp_CreateBy": vnp_CreateBy,
            "vnp_Version": vnp_Version,
            "vnp_SecureHash": secure_hash
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, data=json.dumps(data))

        if response.status_code == 200:
            response_json = response.json()
            if response_json.get("vnp_ResponseCode") == "00":
                try:
                    payment = Payment.objects.get(order_id=vnp_TxnRef)
                    payment.status = "REFUNDED"
                    payment.save()
                    spotify_user = payment.user
                    spotify_user.vip = False
                    spotify_user.save()
                except Payment.DoesNotExist:
                    pass
        else:
            response_json = {"error": f"Request failed with status code: {response.status_code}"}

        return Response(response_json, status=status.HTTP_200_OK)