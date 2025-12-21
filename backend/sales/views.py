from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    # Permite criar pedidos (POST) sem autenticação por enquanto (Checkout Público)
    # Futuramente podemos restringir visualização (GET) apenas para admins
    def get_permissions(self):
        return super().get_permissions()