from django.contrib import admin
from .models import Componente, Produto, Receita

class ReceitaInline(admin.TabularInline):
    model = Receita
    extra = 1

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'preco_venda', 'custo_total', 'lucro_estimado')
    inlines = [ReceitaInline] # Permite adicionar peças direto na tela do produto

@admin.register(Componente)
class ComponenteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'custo', 'estoque_atual')
    search_fields = ('nome',)