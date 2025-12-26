import requests
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class TrackingService:
    """
    Motor de Rastreio Soberano.
    Integração direta com a API do Melhor Envio para verificar status de entrega.
    """
    
    # Mapeamento: Status Melhor Envio (Minúsculo) -> Status no Banco (Maiúsculo)
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
        # 1. Tenta pegar do settings ou variável de ambiente (Token de Produção geralmente)
        token = os.environ.get('MELHOR_ENVIO_TOKEN')
        email_contato = os.environ.get('MELHOR_ENVIO_EMAIL', 'contato@jadewallet.com.br')
        
        if not token:
            # Se não tiver token configurado, não quebra o sistema, apenas avisa
            logger.warning("Token do Melhor Envio não configurado. Pulando rastreio.")
            return None

        # 2. Montagem da Requisição (Endpoint de Busca)
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

class MelhorEnvioService:
    """
    Motor de Cálculo de Frete (Sandbox).
    Usa o ambiente de testes para simular etiquetas e preços.
    """
    
    # URL DO SANDBOX (Ambiente de Teste)
    API_URL = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate"
    
    # --- CONFIGURAÇÃO MANUAL PARA O TESTE ---
    # Cole o seu token Sandbox gerado aqui dentro das aspas:
    TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTYiLCJqdGkiOiI2NmZmNjBjNGVhZWNjMDQwOWVmMTliMGZmZDE0N2ZlNmVjMWQxNTRmMzUxYTI0MDYxMzIxOWRiZmM1NzU5OGYxMmQ3MTkyMDAxOGI2ZDNiYyIsImlhdCI6MTc2Njc4ODM2Ni44MTU5ODEsIm5iZiI6MTc2Njc4ODM2Ni44MTU5ODMsImV4cCI6MTc5ODMyNDM2Ni44MDc5MjIsInN1YiI6ImEwYjAzZWM0LTM0NDktNGE4Yi05ZGI1LTJmNjJjMjc2ODg0YyIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIiwid2ViaG9va3MtZGVsZXRlIiwidGRlYWxlci13ZWJob29rIl19.qz4-_TZGhDaCImj9fgxoz8ynkdxFWG7dnnBcOayJBNSWz4w1Q9WJnPtMTZUz5elk75S78qd4dwJbJwovwwYwmwlwEFWyv1163jbu0rh_UlHTvi5OGikdrrNLao_xfvZ1q5zDV8nzMUl72cTMYsBi17iULsfYIVdmcNPzPSBAli83KALshCkJcpkeDr09Ha6NE2QIBYD1k2p8_-79R9_cNfB6GPjaJRPjFHiY704Lvd49CA-8X66EQCP66KFxIvgj6P5cP9gP3m9gUy2hGnEKOXJMSS4GzLQuzPqQUexJuLc0i9hjyum_uMoCy_TJOtK7DEtzw219G9Wq4lk8eoC2fja7U8-24G0dbowyhpVfkvb1EvpfiUxu7baVEEzsF6qjL1NF6BVU0l2wk9E1KqEooSyl8ISbqW_GSPTPh4oUZY-6ngmz7I6GBbzR0L6dETq6lMJVa5rDqqOglpBCxi4z8oTpzxZsZ2LjOZx69F2wRLDv5YJUOT0wP20TZzxgGaj5VGkJ0FbLsOWRHGpjn84xrGhGL2D8AiqRzEwc6gUodG7OmDyQpXeNr6Xgx80MHUhgmostLFDBW8u9XrUwlQUePAF9bh8FHwQ9jWmVNyqGEnRXfN9xwJ1TiFFHUTUzkbXpvc59it55pg0hJuITObtEYzRsZJEOe-bdYVYDtEzy8rw" 
    
    # CEP da sua Loja (Origem) - Ex: Cachoeiro de Itapemirim
    FROM_CEP = "29304150" 

    @classmethod
    def calculate(cls, to_cep, items):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {cls.TOKEN}",
            "User-Agent": "WalletStore/1.0 (suporte@jadewallet.com.br)"
        }
        
        # Prepara a lista de produtos
        products_payload = []
        for item in items:
            # Converte valores para float/int seguros
            try:
                price = float(item.get('price', 0))
                qty = int(item.get('quantity', 1))
            except:
                price = 0.0
                qty = 1

            products_payload.append({
                "id": str(item.get('product_id', '1')),
                "width": 16,  # Dimensões mínimas aproximadas
                "height": 11,
                "length": 16,
                "weight": 0.3, # 300g (ajuste conforme seu produto real)
                "insurance_value": price,
                "quantity": qty
            })

        payload = {
            "from": { "postal_code": cls.FROM_CEP },
            "to": { "postal_code": to_cep },
            "products": products_payload,
            "options": {
                "receipt": False,
                "own_hand": False
            },
            "services": "1,2" # 1=SEDEX, 2=PAC
        }

        try:
            response = requests.post(cls.API_URL, json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                shipping_options = []

                # A resposta é uma lista de serviços (Sedex, Pac, Jadlog, etc)
                for service in data:
                    # Verifica se tem preço e prazo (às vezes retorna erro para transportadoras indisponíveis)
                    if 'price' in service and 'delivery_time' in service:
                        try:
                            price_val = float(service['price'])
                            shipping_options.append({
                                "name": service['name'],      # Ex: SEDEX
                                "price": price_val,           # Ex: 25.50
                                "days": service['delivery_time'], # Ex: 3
                                "company": service.get('company', {}).get('name', 'Correios')
                            })
                        except:
                            continue
                
                return shipping_options
            else:
                logger.error(f"Erro Cálculo Frete: {response.status_code} - {response.text}")
                return []

        except Exception as e:
            logger.error(f"Erro de conexão Melhor Envio: {e}")
            return []