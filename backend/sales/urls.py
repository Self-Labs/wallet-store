from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, PublicTrackingView

router = DefaultRouter()
router.register(r'pedidos', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('public/rastreio/', PublicTrackingView.as_view(), name='public-tracking'),
]