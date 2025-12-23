from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_payment_confirmed(order):
        """Dispara e-mail de confirmação de pagamento (Via contato@)"""
        subject = f"Pagamento Confirmado - Pedido #{order.id}"
        message = f"""
        Olá, {order.full_name}!

        Recebemos o pagamento do seu pedido #{order.id}.
        Estamos preparando seus produtos para envio.

        Em breve você receberá o código de rastreio.

        Atenciosamente,
        Equipe Jade Wallet
        """
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_CONTATO, # De: contato@jadewallet.com.br
                [order.email],
                fail_silently=False,
            )
            logger.info(f"Email de pagamento enviado para pedido #{order.id}")
        except Exception as e:
            logger.error(f"Erro ao enviar email de pagamento: {e}")

    @staticmethod
    def send_tracking_code(order):
        """Dispara e-mail com código de rastreio (Via rastreio@)"""
        subject = f"Pedido Enviado! Rastreio: {order.tracking_code}"
        message = f"""
        Olá, {order.full_name}.

        Seu pedido #{order.id} já está a caminho!
        
        Código de Rastreio: {order.tracking_code}
        
        Você pode acompanhar a entrega diretamente em nosso site na página de Rastreio.

        Atenciosamente,
        Logística Jade Wallet
        """
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_RASTREIO, # De: rastreio@jadewallet.com.br
                [order.email],
                fail_silently=False,
            )
            logger.info(f"Email de rastreio enviado para pedido #{order.id}")
        except Exception as e:
            logger.error(f"Erro ao enviar email de rastreio: {e}")

    @staticmethod
    def send_data_destruction(order, original_email):
        """
        Dispara e-mail informando a destruição dos dados (Via contato@).
        Recebe 'original_email' separado pois o do objeto order já terá sido apagado.
        """
        subject = f"Entrega Confirmada e Dados Destruídos - Pedido #{order.id}"
        message = f"""
        Olá.

        Confirmamos a entrega do pedido #{order.id}.
        
        Conforme nossa política de soberania e privacidade, informamos que 
        SEUS DADOS PESSOAIS FORAM PERMANENTEMENTE APAGADOS de nossos servidores 
        neste exato momento.

        Mantivemos apenas os registros financeiros anônimos para fins contábeis.

        Obrigado pela confiança.
        Equipe Jade Wallet
        """
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_CONTATO, # De: contato@jadewallet.com.br
                [original_email],
                fail_silently=False,
            )
            logger.info(f"Email de destruição enviado para {original_email}")
        except Exception as e:
            logger.error(f"Erro ao enviar email de destruição: {e}")