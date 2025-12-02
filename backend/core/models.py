from django.db import models

class Componente(models.Model):
    """Peças individuais (ex: Tela, Bateria, Case)"""
    nome = models.CharField(max_length=100)
    custo = models.DecimalField(max_digits=10, decimal_places=2, help_text="Preço de custo unitário")
    estoque_atual = models.IntegerField(default=0)
    link_compra = models.URLField(blank=True, null=True, help_text="Link do fornecedor (AliExpress, etc)")

    def __str__(self):
        return f"{self.nome} (Estoque: {self.estoque_atual})"

class Produto(models.Model):
    """O que você vende (ex: Jade S3 Completa)"""
    nome = models.CharField(max_length=100)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    descricao = models.TextField(blank=True)
    
    # Relação: Um produto é feito de vários componentes
    componentes = models.ManyToManyField(Componente, through='Receita')

    def custo_total(self):
        """Calcula o custo somando as peças"""
        total = 0
        for item in self.receita_set.all():
            total += item.componente.custo * item.quantidade
        return total

    def lucro_estimado(self):
        return self.preco_venda - self.custo_total()

    def __str__(self):
        return self.nome

class Receita(models.Model):
    """Ficha técnica: Quantas peças usa em cada produto"""
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    componente = models.ForeignKey(Componente, on_delete=models.PROTECT)
    quantidade = models.PositiveIntegerField(default=1, help_text="Qtd usada neste produto")

    def __str__(self):
        return f"{self.produto} usa {self.quantidade}x {self.componente}"