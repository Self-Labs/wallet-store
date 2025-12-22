from rest_framework import serializers
from .models import Order, OrderItem
from core.models import Produto

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
        fields = ['id', 'full_name', 'email', 'cpf', 'phone', 'address', 'status', 'created_at', 'items']
        read_only_fields = ['status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
            # Baixa de Estoque
            product_instance = item_data['product']
            # Validação simples para evitar erro se estoque for None
            if product_instance.estoque_atual is None:
                product_instance.estoque_atual = 0 # Segurança
            product_instance.estoque_atual -= item_data['quantity']
            product_instance.save()
            
        return order