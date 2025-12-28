from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from sales.models import Order
from sales.services import TrackingService 
from sales.emails import EmailService 
import time
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Protocolo Ceifador: Atualiza rastreios e destrói dados após 72h da entrega.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("💀 INICIANDO PROTOCOLO CEIFADOR (DELAY 72H)..."))

        # ==============================================================================
        # FASE 1: ATUALIZAÇÃO (Monitorar quem está em trânsito)
        # ==============================================================================
        orders_in_transit = Order.objects.filter(status__in=['SHIPPED', 'PENDING'])
        
        for order in orders_in_transit:
            if not order.tracking_code:
                continue

            # Se já tem tracking, mas está como PENDING, assume que foi postado
            if order.status == 'PENDING' and len(order.tracking_code) > 5:
                 order.status = 'SHIPPED'
                 order.save()

            try:
                # Consulta API
                new_status = TrackingService.check_status(order.tracking_code)

                if new_status == 'DELIVERED':
                    # CHEGOU AGORA!
                    self.stdout.write(self.style.SUCCESS(f" > Pedido #{order.id} foi ENTREGUE."))
                    order.status = 'DELIVERED'
                    if not order.delivered_at:
                        order.delivered_at = timezone.now() # Inicia contagem regressiva
                    order.save()
                
                elif new_status and new_status != order.status:
                    # Mudou status (ex: saiu para entrega), mas não finalizou
                    order.status = new_status
                    order.save()
                
                time.sleep(1) # Respeito à API
            except Exception as e:
                logger.error(f"Erro ao rastrear #{order.id}: {e}")

        # ==============================================================================
        # FASE 2: DESTRUIÇÃO (Verificar quem já cumpriu a quarentena de 72h)
        # ==============================================================================
        
        # Define o limite: Agora menos 72 horas
        limit_time = timezone.now() - timedelta(hours=72)
        
        # Busca pedidos Entregues ANTES desse limite e que ainda não foram anonimizados
        targets = Order.objects.filter(
            status='DELIVERED',
            delivered_at__lte=limit_time 
        ).exclude(email__startswith="deleted_") # Evita reprocessar os já destruídos

        if targets.exists():
            self.stdout.write(self.style.WARNING(f" > Encontrados {targets.count()} pedidos para destruição imediata."))
            for order in targets:
                self.process_destruction(order)
        else:
            self.stdout.write(" > Nenhum pedido expirou o prazo de 72h ainda.")

        self.stdout.write(self.style.SUCCESS("💀 CICLO FINALIZADO."))

    def process_destruction(self, order):
        """
        Executa a limpeza dos dados PII.
        """
        try:
            # 1. Notificação
            try:
                EmailService.send_data_destruction(order, order.email)
            except Exception:
                pass # Falha silenciosa no email não impede destruição

            # 2. Destruição
            order.full_name = "ANONYMIZED USER"
            order.email = f"deleted_{order.id}@anon.store"
            order.cpf = "000.000.000-00"
            order.phone = "00000000000"
            order.address = "DATA DESTROYED // REAPER PROTOCOL EXECUTED"
            order.tracking_code = "DESTROYED" 
            order.save()

            self.stdout.write(self.style.SUCCESS(f" > Pedido #{order.id}: DADOS PESSOAIS ELIMINADOS."))
            
        except Exception as e:
            logger.critical(f"FALHA DESTRUIÇÃO #{order.id}: {e}")