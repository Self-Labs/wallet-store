from django.db import models
from core.models import Produto

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

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ['-created_at']

    def __str__(self):
        return f"Pedido #{self.id} - {self.status}"

    @property
    def total(self):
        return sum(item.total for item in self.items.all())

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