from django.urls import path
from . import views

urlpatterns = [
    path('vnpay/create/', views.CreatePaymentView.as_view(), name='create_payment'),
    path('vnpay/return/', views.PaymentReturnView.as_view(), name='payment_return'),
 
    path('vnpay/query/', views.QueryView.as_view(), name='payment_query'),
    path('vnpay/refund/', views.RefundView.as_view(), name='payment_refund'),
]