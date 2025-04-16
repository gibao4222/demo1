from django.db import models
from spotify_user.models import SpotifyUser

class Payment(models.Model):
    user = models.ForeignKey(SpotifyUser, on_delete=models.CASCADE, related_name='payments')
    order_id = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_id} - {self.user.username}"

class PaymentHistory(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bank_code = models.CharField(max_length=50, blank=True, null=True)
    response_code = models.CharField(max_length=10, blank=True, null=True)
    transaction_no = models.CharField(max_length=50, blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_history'

    def __str__(self):
        return f"History {self.payment.order_id} - {self.status}"