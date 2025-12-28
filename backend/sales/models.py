import uuid
from core.models import Produto
from django.db import models
from django.utils import timezone

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pendente'),
        ('PAID', 'Pago'),
        ('SHIPPED', 'Enviado'),
        ('DELIVERED', 'Entregue'),
        ('CANCELED', 'Cancelado'),
    ]

    # --- DADOS SENSÍVEIS ---
    full_name = models.CharField("Nome Completo", max_length=255)
    email = models.EmailField("E-mail")
    cpf = models.CharField("CPF", max_length=14)
    phone = models.CharField("Telefone", max_length=20, default="")
    address = models.TextField("Endereço de Entrega")
    
    # --- METADADOS ---
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Rastreio e Pagamento
    tracking_code = models.CharField("Código de Rastreio", max_length=50, blank=True, null=True)
    transaction_id = models.CharField("ID Transação", max_length=100, blank=True, null=True)

    # --- FRETE ---
    shipping_method = models.CharField("Método de Envio", max_length=50, blank=True, null=True)
    shipping_cost = models.DecimalField("Custo de Frete", max_digits=10, decimal_places=2, default=0.00)

    delivered_at = models.DateTimeField("Data de Entrega", null=True, blank=True)

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ['-created_at']

    def __str__(self):
        return f"Pedido #{self.id} - {self.status}"

    @property
    def total(self):
        # Soma itens + custo do frete
        items_total = sum(item.total for item in self.items.all())
        return items_total + (self.shipping_cost or 0)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Produto, on_delete=models.PROTECT) # Se deletar produto, mantém o registro da venda
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2) # Preço congelado no momento da compra

    def __str__(self):
        return f"{self.quantity}x {self.product.nome}"
    
    @property
    def total(self):
        return self.quantity * self.price_at_purchase

class Transaction(models.Model):
    METHOD_CHOICES = [
        ('PIX', 'Pix (BRL)'),
        ('BTC', 'Bitcoin (Mainnet)'),
        ('LBTC', 'Liquid Bitcoin (Sidechain)'),
        ('DEPIX', 'DePix (Liquid Token)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    payment_method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    
    # Valores
    amount_brl = models.DecimalField(max_digits=10, decimal_places=2) # Valor original
    amount_crypto = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True) # Valor convertido
    exchange_rate = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True) # Cotação usada
    
    # Dados de Pagamento
    wallet_address = models.CharField(max_length=255, null=True, blank=True) # Endereço Crypto ou Payload Pix
    qr_code_data = models.TextField(null=True, blank=True) # Base64 ou texto cru para gerar QR
    
    # Controle
    status = models.CharField(max_length=20, default='PENDING') # PENDING, CONFIRMED, EXPIRED
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Define 15 minutos de validade por padrão
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.payment_method} - {self.status} (Order {self.order.id})"