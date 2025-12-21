from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price_at_purchase']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'status', 'created_at', 'total_pedido')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'email', 'cpf', 'tracking_code')
    inlines = [OrderItemInline]
    readonly_fields = ['created_at']

    def total_pedido(self, obj):
        total = sum(item.total for item in obj.items.all())
        return f"R$ {total}"
    total_pedido.short_description = "Total"