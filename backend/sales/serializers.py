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
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            for item_data in items_data:
                OrderItem.objects.create(order=order, **item_data)
                # Lógica de Baixa de Estoque (Receita)
                product = item_data['product']
                qty = item_data['quantity']
                receitas = Receita.objects.filter(produto=product)
                for rec in receitas:
                    comp = rec.componente
                    necessario = rec.quantidade * qty
                    if comp.estoque_atual < necessario:
                        raise serializers.ValidationError(f"Estoque insuficiente: {comp.nome}")
                    comp.estoque_atual -= necessario
                    comp.save()
            return order