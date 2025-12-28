from embit.descriptor import Descriptor
from embit.networks import NETWORKS
import logging

logger = logging.getLogger(__name__)

class CryptoService:
    # BTC Mainnet (Native Segwit - BIP84)
    # ZPUB convertida internamente pela lib através do descritor wpkh()
    BTC_DESCRIPTOR = "wpkh([ff296acc/84'/0'/0']xpub6CmArHGEq1crwVm7MTo88K5XgXdkRJXMAjej6xVEHajZompSzAVCDLJbkayftngjSs1VuMAhg2LSidLbSXgrxcrABzRmQmyJDJH7eLTMFWm/0/{index})"

    # Liquid Network (Confidential Native Segwit)
    # Usa chave de cegueira (slip77) + xpub
    LBTC_DESCRIPTOR = "ct(slip77(d617e43a708b3e389121ff151c5f5f7e6caf7e4e84ec4e8157031f0a299601be),elwpkh([ff296acc/84'/1776'/0']xpub6DBpqRBmMgR66AmmyDpFpnTqd6fEsyb7BzggzoRZjsjQtY2arA82Lf7WFYo34Ny4itpNKmDVJq1mFtAfo6XG9f1Fgix8u7svsX5SGFYg93o/0/{index}))"

    @staticmethod
    def generate_address(method, index):
        """
        Gera endereços on-chain seguros e (no caso da Liquid) confidenciais.
        """
        try:
            if method == 'BTC':
                # Parse do descritor com o index injetado
                desc_str = CryptoService.BTC_DESCRIPTOR.format(index=int(index))
                descriptor = Descriptor.from_string(desc_str)
                
                # Derivação e geração de endereço (network='main')
                # A lib embit detecta 'main' pelo xpub, mas forçamos pra garantir.
                return descriptor.script_pubkey().address(NETWORKS['main'])

            elif method == 'LBTC':
                # Parse do descritor Liquid
                desc_str = CryptoService.LBTC_DESCRIPTOR.format(index=int(index))
                descriptor = Descriptor.from_string(desc_str)
                
                # Para Liquid, o endereço confidencial começa com 'lq1' (mainnet)
                # A rede 'liquidv1' é a mainnet da Liquid no embit
                return descriptor.script_pubkey().address(NETWORKS['liquidv1'])

            return None

        except Exception as e:
            logger.error(f"Erro crítico gerando endereço {method}: {e}")
            # Em produção financeira, melhor falhar do que gerar endereço errado
            raise ValueError(f"Falha na criptografia da carteira: {str(e)}")