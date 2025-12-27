from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer
from .services import TrackingService, MelhorEnvioService
from django.shortcuts import get_object_or_404
import requests
import logging

logger = logging.getLogger(__name__)

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
        except Exception as e:
            logger.error(f"Erro ao buscar pedido no banco: {e}")
            order = None

        # 2. Consulta o Serviço (Melhor Envio) para status atualizado
        try:
            status_atual = TrackingService.check_status(code)
        except requests.exceptions.RequestException:
            # Se falhar conexão com a API externa e não tivermos pedido local, retornamos 503
            if not order:
                return Response({"error": "Serviço de rastreio indisponível temporariamente."}, status=503)
            status_atual = None

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

@api_view(['GET'])
@permission_classes([AllowAny]) # Permite que o cliente acesse sem estar logado
def get_public_order_details(request, pk):
    """
    Retorna apenas os dados seguros do pedido para a tela de pagamento.
    Não expõe dados sensíveis do cliente (endereço/CPF) nesta rota pública.
    """
    order = get_object_or_404(Order, pk=pk)
    
    return Response({
        "id": order.id,
        "total": float(order.total), # Usa a propriedade calculada no models
        "status": order.status,
        "created_at": order.created_at
    })

class CalculateShippingView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cep = request.data.get('cep')
        items = request.data.get('items', [])
        
        if not cep:
            return Response({"error": "CEP obrigatório"}, status=400)

        try:
            # Chama o serviço do Melhor Envio (Sandbox)
            options = MelhorEnvioService.calculate(cep, items)
            return Response(options)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro externo cálculo frete: {e}")
            return Response({"error": "Serviço de cálculo de frete indisponível."}, status=503)

        except Exception as e:
            logger.error(f"Erro interno cálculo frete: {e}")
            return Response({"error": "Erro ao calcular frete."}, status=500)