from embit.descriptor import Descriptor
from embit.networks import NETWORKS
from hdwallet import HDWallet
from hdwallet.symbols import BTC
import logging

logger = logging.getLogger(__name__)

class CryptoService:
    # SUAS CHAVES
    BTC_ZPUB = "zpub6rRhTcc58Nhpe69M2BNNYVGY2TveJYWLzxhAfkH13bVKuySuVUpKTTcsnztqtbzaG9F7QJMpbM3YVCZisvWtZ6DMvfpcabcGkkQQRVEKWFM"
    LBTC_XPUB = "xpub6DBpqRBmMgR66AmmyDpFpnTqd6fEsyb7BzggzoRZjsjQtY2arA82Lf7WFYo34Ny4itpNKmDVJq1mFtAfo6XG9f1Fgix8u7svsX5SGFYg93o"

    # Descritores Originais
    BTC_DESC = "wpkh([ff296acc/84'/0'/0']xpub6CmArHGEq1crwVm7MTo88K5XgXdkRJXMAjej6xVEHajZompSzAVCDLJbkayftngjSs1VuMAhg2LSidLbSXgrxcrABzRmQmyJDJH7eLTMFWm/0/{index})"
    # LBTC com chave de cegueira (slip77)
    LBTC_DESC = "ct(slip77(d617e43a708b3e389121ff151c5f5f7e6caf7e4e84ec4e8157031f0a299601be),elwpkh([ff296acc/84'/1776'/0']xpub6DBpqRBmMgR66AmmyDpFpnTqd6fEsyb7BzggzoRZjsjQtY2arA82Lf7WFYo34Ny4itpNKmDVJq1mFtAfo6XG9f1Fgix8u7svsX5SGFYg93o/0/{index}))"

    @staticmethod
    def generate_address(method, index):
        """
        Gera endereços on-chain seguros e (no caso da Liquid) confidenciais.
        """
        try:
            if method == 'BTC':
                # Tenta via Descriptor (Embit)
                try:
                    desc = Descriptor.from_string(CryptoService.BTC_DESC.format(index=int(index)))
                    return desc.script_pubkey().address(NETWORKS['main'])
                except Exception as e:
                    logger.warning(f"Embit BTC falhou, tentando HDWallet fallback: {e}")
                    # Fallback para HDWallet se Embit falhar
                    hd = HDWallet(symbol=BTC)
                    hd.from_xpublic_key(CryptoService.BTC_ZPUB)
                    hd.from_path(f"m/0/{index}")
                    return hd.p2wpkh_address()

            elif method == 'LBTC':
                # Tenta via Descriptor Liquid (Embit) - Endereço Confidencial (lq1...)
                try:
                    desc = Descriptor.from_string(CryptoService.LBTC_DESC.format(index=int(index)))
                    return desc.script_pubkey().address(NETWORKS['liquidv1'])
                except Exception as e:
                    logger.error(f"Embit LBTC falhou: {e}")
                    # Fallback: Gera um endereço Liquid NÃO-Confidencial usando HDWallet
                    # (Ainda funciona para receber, mas começa com 'ex1' ou similar, não 'lq1')
                    # Usamos 'BTC' como base matemática pois a curva é a mesma
                    hd = HDWallet(symbol=BTC) 
                    hd.from_xpublic_key(CryptoService.LBTC_XPUB)
                    hd.from_path(f"m/0/{index}")
                    # Nota: Isso vai gerar formato Bech32 Mainnet (bc1). 
                    # Na prática, mande para logs para auditoria se cair aqui.
                    raise ValueError(f"Erro crítico Liquid: {e}")

            return None

        except Exception as e:
            logger.error(f"Erro crítico gerando endereço {method}: {e}")
            raise ValueError(f"Falha na criptografia da carteira: {str(e)}")