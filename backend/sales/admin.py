from django.contrib import admin
from .models import Order, OrderItem, Transaction

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price_at_purchase']

class TransactionInline(admin.TabularInline):
    """Permite ver tentativas de pagamento dentro do Pedido"""
    model = Transaction
    extra = 0
    ordering = ['-created_at'] # Mais recentes primeiro
    readonly_fields = ['payment_method', 'amount_brl', 'amount_crypto', 'status', 'created_at', 'is_expired']
    # Evita edição acidental de logs financeiros
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False # Transações devem ser criadas via API/Checkout

# --- ADMIN PRINCIPAL ---
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'status', 'created_at', 'total_pedido')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'email', 'cpf', 'tracking_code')
    inlines = [OrderItemInline, TransactionInline]
    readonly_fields = ['created_at']

    # Carrega itens e transações numa única query
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items', 'transactions')

    def total_pedido(self, obj):
        return f"R$ {obj.total}"
    total_pedido.short_description = "Total"

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Painel dedicado para auditoria financeira"""
    list_display = ('short_id', 'order_link', 'payment_method', 'amount_brl', 'status', 'created_at', 'is_expired')
    list_filter = ('payment_method', 'status', 'created_at')
    search_fields = ('id', 'order__id', 'order__email', 'wallet_address', 'transaction_id')
    readonly_fields = ('id', 'created_at', 'expires_at', 'qr_code_data')
    ordering = ['-created_at']

    def short_id(self, obj):
        return str(obj.id)[:8] + "..."
    short_id.short_description = "ID Transação"

    def order_link(self, obj):
        return f"Pedido #{obj.order.id}"
    order_link.short_description = "Referência"