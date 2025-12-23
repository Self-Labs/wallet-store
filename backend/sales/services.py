import requests
import os
import logging

logger = logging.getLogger(__name__)

class TrackingService:
    """
    Motor de Rastreio Soberano.
    Integração direta com a API do Melhor Envio para verificar status de entrega.
    """
    
    # Mapeamento: Status Melhor Envio (Minúsculo) -> Status no Banco (Maiúsculo)
    # Fonte: Documentação Melhor Envio - Parâmetros de Status 
    STATUS_MAP = {
        'pending': 'PENDING',      # Etiqueta no carrinho ou aguardando pagamento
        'released': 'PENDING',     # Etiqueta liberada/gerada, mas não postada
        'posted': 'SHIPPED',       # Postado na transportadora
        'delivered': 'DELIVERED',  # Entregue ao destinatário (Gatilho do Ceifador)
        'canceled': 'CANCELED',    # Etiqueta cancelada
        'undelivered': 'SHIPPED',  # Tentativa falhou, mas ainda está no fluxo logístico
        'suspended': 'CANCELED'    # Suspenso
    }

    @staticmethod
    def check_status(tracking_code):
        """
        Consulta o status atual de um código de rastreio.
        Retorna: 'DELIVERED', 'SHIPPED', 'PENDING', 'CANCELED' ou None.
        """
        if not tracking_code:
            return None

        try:
            return TrackingService._consultar_api_melhor_envio(tracking_code)
        except Exception as e:
            logger.error(f"Falha no rastreio do código {tracking_code}: {e}")
            return None

    @staticmethod
    def _consultar_api_melhor_envio(code):
        # 1. Configurações e Tokens
        token = os.environ.get('MELHOR_ENVIO_TOKEN')
        email_contato = os.environ.get('MELHOR_ENVIO_EMAIL', 'contato@jadewallet.com.br')
        
        if not token:
            logger.warning("Token do Melhor Envio não configurado. Pulando rastreio.")
            return None

        # 2. Montagem da Requisição (Endpoint de Busca)
        # Fonte: Documentação - Pesquisar etiqueta [cite: 2723]
        url = "https://melhorenvio.com.br/api/v2/me/orders/search"
        
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
            "User-Agent": f"Wallet Store ({email_contato})"
        }
        
        params = {"q": code} # Busca pelo código de rastreio

        # 3. Chamada à API
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # A API retorna uma lista de pedidos que casam com a busca
            if isinstance(data, dict) and 'data' in data:
                orders = data['data']
            else:
                orders = data # Em alguns endpoints v2 a lista vem direta

            if not orders:
                logger.info(f"Rastreio {code} não encontrado na conta Melhor Envio.")
                return None

            # Pega o status do primeiro pedido encontrado
            me_status = orders[0].get('status', '').lower()
            
            # Traduz para o nosso sistema
            return TrackingService.STATUS_MAP.get(me_status, 'SHIPPED')
            
        else:
            logger.error(f"Erro API Melhor Envio: {response.status_code} - {response.text}")
            return None