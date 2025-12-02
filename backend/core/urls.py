from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComponenteViewSet, ProdutoViewSet

router = DefaultRouter()
router.register(r'componentes', ComponenteViewSet)
router.register(r'produtos', ProdutoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]