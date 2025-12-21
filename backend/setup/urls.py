from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import ProductViewSet, CategoryViewSet
from sales.views import OrderViewSet

router = DefaultRouter()
router.register(r'produtos', ProductViewSet)
router.register(r'categorias', CategoryViewSet)
router.register(r'pedidos', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]