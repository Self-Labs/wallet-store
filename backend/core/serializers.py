from rest_framework import serializers
from .models import Componente, Produto, Receita

class ComponenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Componente
        fields = ['id', 'nome', 'custo', 'estoque_atual', 'link_compra']

class ReceitaSerializer(serializers.ModelSerializer):
    componente_nome = serializers.ReadOnlyField(source='componente.nome')
    
    class Meta:
        model = Receita
        fields = ['componente_nome', 'quantidade']

class ProdutoSerializer(serializers.ModelSerializer):
    # Mostra os componentes usados (ficha técnica) dentro do produto
    receita = ReceitaSerializer(source='receita_set', many=True, read_only=True)
    lucro = serializers.DecimalField(source='lucro_estimado', max_digits=10, decimal_places=2, read_only=True)
    custo_total = serializers.DecimalField(source='custo_total', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco_venda', 'descricao', 'lucro', 'custo_total', 'receita']