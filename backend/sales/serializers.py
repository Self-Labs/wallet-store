from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from core.models import Produto, Receita

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all(), source='product'
    )

    class Meta:
        model = OrderItem
        fields = ['product_id', 'quantity', 'price_at_purchase']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'full_name', 'email', 'cpf', 'phone', 'address', 
                  'status', 'created_at', 'items', 'shipping_method', 'shipping_cost']
        read_only_fields = ['status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Uso de Atomic Transaction: Ou salva tudo (pedido + itens + baixa estoque) ou nada.
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            
            for item_data in items_data:
                product = item_data['product']
                quantity_sold = item_data['quantity']

                # 1. Cria o item do pedido
                OrderItem.objects.create(order=order, **item_data)
                
                # 2. Baixa de Estoque Inteligente (Baseado na Receita)
                # O Produto não tem estoque, mas seus componentes têm.
                receita_itens = Receita.objects.filter(produto=product)
                
                if not receita_itens.exists():
                    # Opcional: Logar aviso que produto não tem receita definida
                    pass 

                for item_receita in receita_itens:
                    componente = item_receita.componente
                    qtd_necessaria = item_receita.quantidade * quantity_sold
                    
                    # Verifica se tem estoque suficiente no componente
                    if componente.estoque_atual < qtd_necessaria:
                        raise serializers.ValidationError(
                            f"Estoque insuficiente do componente '{componente.nome}' para o produto '{product.nome}'."
                        )
                    
                    componente.estoque_atual -= qtd_necessaria
                    componente.save()
            
            return order