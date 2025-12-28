import requests
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class PriceOracle:
    BINANCE_URL = "https://api.binance.com/api/v3/ticker/price"
    
    @staticmethod
    def get_price(symbol="BTCBRL"):
        try:
            # Para Liquid BTC, usamos o preço do BTC mesmo, pois a paridade é 1:1
            if symbol == 'LBTC': 
                symbol = 'BTCBRL'
            
            response = requests.get(f"{PriceOracle.BINANCE_URL}?symbol={symbol}", timeout=5)
            data = response.json()
            market_price = Decimal(data['price'])
            
            # Adiciona 1% de Spread
            return market_price * Decimal('1.01')
        except Exception as e:
            logger.error(f"Erro ao obter cotação Binance: {e}")
            return None

    @staticmethod
    def convert_brl_to_crypto(amount_brl, method):
        """
        Retorna (quantidade_crypto, cotacao_usada)
        """
        amount_brl = Decimal(str(amount_brl))

        if method == 'DEPIX':
            # DePix é stablecoin BRL (1:1)
            return amount_brl, Decimal('1.00')
        
        if method == 'PIX':
            return amount_brl, Decimal('1.00')

        # Para BTC e LBTC
        rate = PriceOracle.get_price("BTCBRL")
        if not rate:
            raise ValueError("Serviço de cotação indisponível")
            
        # Calcula crypto (8 casas decimais)
        crypto_amount = (amount_brl / rate).quantize(Decimal("0.00000001"))
        return crypto_amount, rate