from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from decimal import Decimal

# Models e Serializers
from .models import Order, Transaction
from .serializers import OrderSerializer

# Importando serviços
from .services import (
    TrackingService, 
    MelhorEnvioService, 
    PriceOracle, 
    CryptoService, 
    AtlasPixService
)

import logging
import requests

logger = logging.getLogger(__name__)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated] # Padrão: só logado mexe

    # Define permissões específicas por ação
    def get_permissions(self):
        # Ações públicas que não exigem login
        if self.action in ['create', 'start_payment', 'calculate_shipping', 'tracking', 'public_details']:
            return [AllowAny()]
        return super().get_permissions()

    # ============================================================================
    # 1. MOTOR DE PAGAMENTOS (BTC, LBTC, DEPIX, PIX)
    # ============================================================================
    @action(detail=True, methods=['post'], url_path='start-payment')
    def start_payment(self, request, pk=None):
        order = self.get_object()
        method = request.data.get('method') 
        
        if not method:
            return Response({"error": "Método de pagamento obrigatório"}, status=400)

        # 1. Verifica cache de transação (15 min)
        active_tx = order.transactions.filter(
            payment_method=method, 
            status='PENDING',
            expires_at__gt=timezone.now()
        ).first()

        if active_tx:
            return Response(self._serialize_transaction(active_tx))

        # 2. Lógica de Valor (Taxa do Pix)
        # O valor base é o total do pedido.
        transaction_amount_brl = order.total

        # Se for PIX, aplica sobretaxa de 15% (Custos Governamentais)
        if method == 'PIX':
            transaction_amount_brl = transaction_amount_brl * Decimal('1.15')
            # Arredonda para 2 casas decimais
            transaction_amount_brl = transaction_amount_brl.quantize(Decimal('0.01'))

        # 3. Gera nova transação
        try:
            with transaction.atomic():
                # A. Cotação
                amount_crypto, rate = PriceOracle.convert_brl_to_crypto(transaction_amount_brl, method)
                
                wallet_address = None
                qr_code_data = None

                # B. Geração de Endereço / Payload
                if method == 'BTC':
                    # Mainnet Native Segwit (zpub)
                    wallet_address = CryptoService.generate_address('BTC', order.id)
                    qr_code_data = f"bitcoin:{wallet_address}?amount={amount_crypto}"
                
                elif method == 'LBTC':
                    # Liquid Network (xpub)
                    wallet_address = CryptoService.generate_address('LBTC', order.id)
                    qr_code_data = wallet_address 
                
                elif method == 'DEPIX':
                    # DePix usa a mesma infraestrutura da Liquid (LBTC)
                    # O endereço é gerado da mesma xpub Liquid
                    wallet_address = CryptoService.generate_address('LBTC', order.id)
                    qr_code_data = wallet_address
                
                elif method == 'PIX':
                    # Cria cobrança na Atlas com o valor acrescido (15%)
                    pix_data = AtlasPixService.create_pix_charge(order, transaction_amount_brl)
                    qr_code_data = pix_data['qr_code']
                    wallet_address = pix_data['txid']

                # C. Salva no Banco
                tx = Transaction.objects.create(
                    order=order,
                    payment_method=method,
                    amount_brl=transaction_amount_brl,
                    amount_crypto=amount_crypto,
                    exchange_rate=rate,
                    wallet_address=wallet_address,
                    qr_code_data=qr_code_data
                )
                
                return Response(self._serialize_transaction(tx))

        except ValueError as e:
            # Erros de validação (ex: API Key faltando)
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Erro crítico no pagamento ({method}): {e}")
            return Response({"error": "Erro ao processar pagamento. Tente novamente."}, status=500)

    # ============================================================================
    # 2. CÁLCULO DE FRETE
    # ============================================================================
    @action(detail=False, methods=['post'], url_path='calculate-shipping')
    def calculate_shipping(self, request):
        cep = request.data.get('cep')
        items = request.data.get('items', [])
        
        if not cep:
            return Response({"error": "CEP obrigatório"}, status=400)

        try:
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

    # ============================================================================
    # 3. RASTREIO PÚBLICO
    # ============================================================================
    @action(detail=False, methods=['get'], url_path='tracking')
    def tracking(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "Código de rastreio obrigatório"}, status=400)

        # 1. Busca local
        try:
            order = Order.objects.filter(tracking_code=code).first()
        except Exception as e:
            logger.error(f"Erro banco tracking: {e}")
            order = None

        # 2. Busca externa
        try:
            status_atual = TrackingService.check_status(code)
        except requests.exceptions.RequestException:
            if not order:
                return Response({"error": "Serviço indisponível temporariamente."}, status=503)
            status_atual = None

        if not status_atual and not order:
            return Response({"error": "Rastreio não encontrado"}, status=404)

        # Fallback: Se API falhar, usa status do banco
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
            'DELIVERED': 'Objeto entregue. Dados anonimizados.',
            'CANCELED': 'Envio cancelado.'
        }
        return msgs.get(status, "Aguardando atualização...")

    # ============================================================================
    # 4. DETALHES PÚBLICOS DO PEDIDO (Para Tela de Sucesso/Pagamento)
    # ============================================================================
    @action(detail=True, methods=['get'], url_path='public-details')
    def public_details(self, request, pk=None):
        """
        Retorna dados seguros para a tela de checkout/sucesso sem expor dados sensíveis.
        """
        order = self.get_object()
        return Response({
            "id": order.id,
            "total": float(order.total),
            "status": order.status,
            "created_at": order.created_at
        })

    # ============================================================================
    # HELPER: SERIALIZAÇÃO DE TRANSAÇÃO
    # ============================================================================
    def _serialize_transaction(self, tx):
        return {
            "id": tx.id,
            "method": tx.payment_method,
            "amount_brl": str(tx.amount_brl),
            "amount_crypto": f"{tx.amount_crypto:.8f}" if tx.amount_crypto else None,
            "rate": str(tx.exchange_rate) if tx.exchange_rate else None,
            "address": tx.wallet_address,
            "qr_code": tx.qr_code_data,
            "expires_at": tx.expires_at,
            "seconds_remaining": int((tx.expires_at - timezone.now()).total_seconds())
        }