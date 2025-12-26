from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, PublicTrackingView, CalculateShippingView, get_public_order_details
from django.urls import path, include

router = DefaultRouter()
router.register(r'pedidos', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('public/rastreio/', PublicTrackingView.as_view(), name='public-tracking'),
    path('public/frete/calcular/', CalculateShippingView.as_view(), name='public-shipping-calc'),
    path('public/pedido/<int:pk>/', get_public_order_details, name='public-order-details'),
]