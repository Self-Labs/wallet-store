from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'pedidos', OrderViewSet)

urlpatterns = [
    # Rotas padrão do ViewSet (CRUD)
    path('', include(router.urls)),    
    # Rastreio Público: GET /api/sales/public/rastreio/?code=...
    path('public/rastreio/', OrderViewSet.as_view({'get': 'tracking'}), name='public-tracking'),
    # Cálculo de Frete: POST /api/sales/public/frete/calcular/
    path('public/frete/calcular/', OrderViewSet.as_view({'post': 'calculate_shipping'}), name='public-shipping-calc'),
    # Detalhes Públicos do Pedido: GET /api/sales/public/pedido/{id}/
    path('public/pedido/<int:pk>/', OrderViewSet.as_view({'get': 'public_details'}), name='public-order-details'),
    # Iniciar Pagamento: POST /api/sales/public/pedido/{id}/pagar/
    path('public/pedido/<int:pk>/pagar/', OrderViewSet.as_view({'post': 'start_payment'}), name='public-start-payment'),
]