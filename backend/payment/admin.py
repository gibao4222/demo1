from django.contrib import admin

from .models import Payment, PaymentHistory

# Register your models here.
# admin.site.register(Payment)
# admin.site.register(PaymentHistory)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'user', 'amount', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_id', 'user__username']