import requests
import os
import logging

logger = logging.getLogger(__name__)

class AtlasPixService:
    BASE_URL = "https://api.atlasdao.info/api/v1"
    
    @staticmethod
    def create_pix_charge(order, amount):
        api_key = os.getenv('ATLAS_API_KEY') # Lembre de por no .env
        if not api_key:
            raise ValueError("Atlas API Key não configurada")

        headers = {
            "Content-Type": "application/json",
            "X-API-Key": api_key
        }

        # O webhook deve apontar para sua API (precisaremos criar essa rota depois)
        # Por enquanto usamos um placeholder ou URL do ngrok para teste
        webhook_url = os.getenv('WEBHOOK_URL', 'https://api.jadewallet.com.br/api/webhooks/pix/')

        payload = {
            "amount": float(amount),
            "description": f"Pedido #{order.id} - Wallet Store",
            "merchantOrderId": str(order.id),
            "taxNumber": order.cpf.replace(".", "").replace("-", ""), # Remove formatação
            "webhook": {
                "url": webhook_url,
                "events": [
                    "transaction.paid",
                    "transaction.failed"
                ],
                "secret": os.getenv('ATLAS_WEBHOOK_SECRET', 'secret_temporaria')
            }
        }

        try:
            response = requests.post(
                f"{AtlasPixService.BASE_URL}/external/pix/create",
                json=payload,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "qr_code": data.get("qrCode"),
                "qr_code_base64": data.get("qrCodeImage"), # Imagem se vier
                "txid": data.get("id")
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro Atlas DAO: {e.response.text if e.response else e}")
            raise ValueError("Erro na comunicação com gateway Pix")