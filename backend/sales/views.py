from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Order
from .serializers import OrderSerializer
from .services import TrackingService

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
class PublicTrackingView(APIView):
    """
    Permite que qualquer pessoa consulte o status de um pedido via código de rastreio.
    Não exige login.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "Código de rastreio obrigatório"}, status=400)

        # 1. Tenta achar no nosso banco local
        try:
            order = Order.objects.filter(tracking_code=code).first()
        except:
            order = None

        # 2. Consulta o Serviço (Melhor Envio) para status atualizado
        status_atual = TrackingService.check_status(code)

        if not status_atual and not order:
            return Response({"error": "Rastreio não encontrado"}, status=404)

        # Lógica Inteligente: Se a API falhar (None), usa o status do banco
        status_final = status_atual or (order.status if order else "UNKNOWN")

        return Response({
            "tracking_code": code,
            "status": status_final,
            "order_id": order.id if order else None,
            "message": self._get_message_for_status(status_final)
        })

    def _get_message_for_status(self, status):
        msgs = {
            'PENDING': 'Aguardando postagem ou pagamento.',
            'SHIPPED': 'Objeto em trânsito. A caminho!',
            'DELIVERED': 'Objeto entregue. Dados do cliente anonimizados.',
            'CANCELED': 'Envio cancelado.'
        }
        # Se não achar no mapa, retorna texto genérico
        return msgs.get(status, "Aguardando atualização...")