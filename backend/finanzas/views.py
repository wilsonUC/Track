from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Transaction 
from .serializers import ( 
    CategorySerializer, 
    TransactionSerializer, 
    RegistroSerializer,
)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Categorías del usuario logueado.
    ModelViewSet ya incluye: listar, ver una, crear, editar y borrar.
    """

    serializer_class = CategorySerializer

    def get_queryset(self):
        # Solo filas de la base que son de quien hizo la petición
        return Category.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # Al crear: guardar y poner dueño (el cliente no manda "usuario")
        serializer.save(usuario=self.request.user)

    def get_serializer_context(self):

        context = super().get_serializer_context()
        context["request"] = self.request
        return context

class TransactionViewSet(viewsets.ModelViewSet):
    """Movimientos de dinero: solo los del usuario logueado."""
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)    

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class RegistroView(APIView):
    """
    POST /api/registro/ — crear cuenta. Público (sin token).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "mensaje": "Usuario creado correctamente",
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )     
