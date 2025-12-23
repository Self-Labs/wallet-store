from django.core.management.base import BaseCommand
from sales.models import Order
from sales.services import TrackingService
import time
import logging

# Configuração de Log para auditoria (aparece no terminal)
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Executa o Protocolo Ceifador: Verifica entregas e destrói dados sensíveis.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("💀 INICIANDO PROTOCOLO CEIFADOR..."))

        # 1. Busca apenas pedidos que foram ENVIADOS (SHIPPED)
        orders_in_transit = Order.objects.filter(status='SHIPPED')
        
        count = orders_in_transit.count()
        if count == 0:
            self.stdout.write(self.style.WARNING(" > Nenhum pedido em trânsito para verificar."))
            return

        self.stdout.write(f" > Monitorando {count} pedidos em trânsito.")

        for order in orders_in_transit:
            if not order.tracking_code:
                self.stdout.write(self.style.ERROR(f" > Pedido #{order.id}: Sem código de rastreio. Pulando."))
                continue

            self.stdout.write(f" > Consultando rastro: {order.tracking_code} (Pedido #{order.id})...")

            # 2. Consulta o Oráculo (Service de Rastreio)
            new_status = TrackingService.check_status(order.tracking_code)

            if new_status == 'DELIVERED':
                self.process_destruction(order)
            elif new_status and new_status != order.status:
                # Se mudou de status mas não entregou (ex: PENDING -> SHIPPED na API), atualiza
                order.status = new_status
                order.save()
                self.stdout.write(f" > Status atualizado para: {new_status}")
            else:
                self.stdout.write(" > Ainda em trânsito.")

            # 3. Respeito à API (Rate Limiting)
            # Pausa de 2 segundos entre consultas para não ser bloqueado pelo Melhor Envio
            time.sleep(2)

        self.stdout.write(self.style.SUCCESS("------------------------------------------------"))
        self.stdout.write(self.style.SUCCESS("💀 PROTOCOLO FINALIZADO."))

    def process_destruction(self, order):
        """
        Executa a limpeza dos dados PII (Personally Identifiable Information).
        Mantém os dados financeiros e os produtos para contabilidade.
        """
        try:
            self.stdout.write(self.style.SUCCESS(f" > ALVO CONFIRMADO: Pedido #{order.id} Entregue."))
            
            # --- Envia E-mail ANTES de destruir ---
            self.stdout.write(" > Enviando e-mail de notificação...")
            EmailService.send_data_destruction(order, order.email)

            self.stdout.write(" > Executando destruição de dados...")

            # Atualiza Status
            order.status = 'DELIVERED'

            # --- DADOS SENSÍVEIS (Sobrescrever com Hash/Lixo) ---
            order.full_name = "ANONYMIZED USER"
            order.email = "deleted@anon.store"
            order.cpf = "000.000.000-00"
            order.phone = "00000000000"
            
            # Removemos o endereço real, mantendo apenas UF/Cidade para estatísticas (opcional)
            order.address = "DATA DESTROYED // REAPER PROTOCOL EXECUTED"

            order.save()
            self.stdout.write(self.style.SUCCESS(f" > Pedido #{order.id}: DADOS PESSOAIS ELIMINADOS COM SUCESSO."))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f" > ERRO AO DESTRUIR DADOS DO PEDIDO #{order.id}: {e}"))