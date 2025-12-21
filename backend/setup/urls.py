from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import ProductViewSet
from sales.views import OrderViewSet

# Centralizando as rotas de todos os apps aqui
router = DefaultRouter()
router.register(r'produtos', ProductViewSet)
router.register(r'pedidos', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # O router gerencia /api/produtos/ e /api/pedidos/
]