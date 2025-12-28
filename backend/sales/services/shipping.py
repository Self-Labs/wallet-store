import requests
import logging

logger = logging.getLogger(__name__)

class MelhorEnvioService:
    API_URL = "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate"
    # Token Sandbox (Idealmente mover para .env, mas mantendo seu hardcode para teste)
    TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTYiLCJqdGkiOiI2NmZmNjBjNGVhZWNjMDQwOWVmMTliMGZmZDE0N2ZlNmVjMWQxNTRmMzUxYTI0MDYxMzIxOWRiZmM1NzU5OGYxMmQ3MTkyMDAxOGI2ZDNiYyIsImlhdCI6MTc2Njc4ODM2Ni44MTU5ODEsIm5iZiI6MTc2Njc4ODM2Ni44MTU5ODMsImV4cCI6MTc5ODMyNDM2Ni44MDc5MjIsInN1YiI6ImEwYjAzZWM0LTM0NDktNGE4Yi05ZGI1LTJmNjJjMjc2ODg0YyIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIiwid2ViaG9va3MtZGVsZXRlIiwidGRlYWxlci13ZWJob29rIl19.qz4-_TZGhDaCImj9fgxoz8ynkdxFWG7dnnBcOayJBNSWz4w1Q9WJnPtMTZUz5elk75S78qd4dwJbJwovwwYwmwlwEFWyv1163jbu0rh_UlHTvi5OGikdrrNLao_xfvZ1q5zDV8nzMUl72cTMYsBi17iULsfYIVdmcNPzPSBAli83KALshCkJcpkeDr09Ha6NE2QIBYD1k2p8_-79R9_cNfB6GPjaJRPjFHiY704Lvd49CA-8X66EQCP66KFxIvgj6P5cP9gP3m9gUy2hGnEKOXJMSS4GzLQuzPqQUexJuLc0i9hjyum_uMoCy_TJOtK7DEtzw219G9Wq4lk8eoC2fja7U8-24G0dbowyhpVfkvb1EvpfiUxu7baVEEzsF6qjL1NF6BVU0l2wk9E1KqEooSyl8ISbqW_GSPTPh4oUZY-6ngmz7I6GBbzR0L6dETq6lMJVa5rDqqOglpBCxi4z8oTpzxZsZ2LjOZx69F2wRLDv5YJUOT0wP20TZzxgGaj5VGkJ0FbLsOWRHGpjn84xrGhGL2D8AiqRzEwc6gUodG7OmDyQpXeNr6Xgx80MHUhgmostLFDBW8u9XrUwlQUePAF9bh8FHwQ9jWmVNyqGEnRXfN9xwJ1TiFFHUTUzkbXpvc59it55pg0hJuITObtEYzRsZJEOe-bdYVYDtEzy8rw" 
    FROM_CEP = "29304150" 

    @classmethod
    def calculate(cls, to_cep, items):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {cls.TOKEN}",
            "User-Agent": "WalletStore/1.0"
        }
        
        products_payload = []
        for index, item in enumerate(items):
            try:
                products_payload.append({
                    "id": str(item.get('product_id', '1')),
                    "width": 16, "height": 11, "length": 16, "weight": 0.3,
                    "insurance_value": float(item.get('price', 0)),
                    "quantity": int(item.get('quantity', 1))
                })
            except (ValueError, TypeError):
                continue

        payload = {
            "from": { "postal_code": cls.FROM_CEP },
            "to": { "postal_code": to_cep },
            "products": products_payload,
            "options": { "receipt": False, "own_hand": False }
        }

        try:
            response = requests.post(cls.API_URL, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            options = []
            for service in data:
                if 'price' in service and 'delivery_time' in service:
                    try:
                        options.append({
                            "name": service['name'],
                            "price": float(service['price']),
                            "days": service['delivery_time'],
                            "company": service.get('company', {}).get('name', 'Correios')
                        })
                    except ValueError:
                        continue
            return options
        except Exception as e:
            logger.error(f"Erro ao calcular frete: {e}")
            raise e