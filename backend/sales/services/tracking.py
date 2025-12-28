import requests
import os
import logging

logger = logging.getLogger(__name__)

class TrackingService:
    STATUS_MAP = {
        'pending': 'PENDING',
        'released': 'PENDING',
        'posted': 'SHIPPED',
        'delivered': 'DELIVERED',
        'canceled': 'CANCELED',
        'undelivered': 'SHIPPED',
        'suspended': 'CANCELED'
    }

    @staticmethod
    def check_status(tracking_code):
        if not tracking_code:
            return None
        try:
            return TrackingService._consultar_api_melhor_envio(tracking_code)
        except requests.exceptions.RequestException as e:
            logger.error(f"Falha de conexão no rastreio: {e}")
            raise e
        except Exception as e:
            logger.error(f"Falha no rastreio: {e}")
            return None

    @staticmethod
    def _consultar_api_melhor_envio(code):
        token = os.environ.get('MELHOR_ENVIO_TOKEN')
        email_contato = os.environ.get('MELHOR_ENVIO_EMAIL', 'contato@jadewallet.com.br')
        
        if not token:
            logger.warning("Token ME ausente.")
            return None

        url = "https://melhorenvio.com.br/api/v2/me/orders/search"
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
            "User-Agent": f"Wallet Store ({email_contato})"
        }
        
        response = requests.get(url, headers=headers, params={"q": code}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            orders = data.get('data', data) if isinstance(data, dict) else data

            if not orders:
                return None

            me_status = orders[0].get('status', '').lower()
            return TrackingService.STATUS_MAP.get(me_status, 'SHIPPED')
        else:
            logger.error(f"Erro API Melhor Envio: {response.status_code}")
            return None