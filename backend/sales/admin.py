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

    # Carrega os itens junto com o pedido para evitar N+1 queries
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items')

    def total_pedido(self, obj):
        # A propriedade .total já existe no model, use-a.
        # Converter para float/str para garantir exibição correta
        return f"R$ {obj.total}"
    total_pedido.short_description = "Total"