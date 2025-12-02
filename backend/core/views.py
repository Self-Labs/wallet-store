from rest_framework import viewsets
from .models import Componente, Produto
from .serializers import ComponenteSerializer, ProdutoSerializer

class ComponenteViewSet(viewsets.ModelViewSet):
    queryset = Componente.objects.all()
    serializer_class = ComponenteSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer