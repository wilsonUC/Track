from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Transaction
from .ia_service import chat_with_groq
from .serializers import (
    CategorySerializer,
    IaChatSerializer,
    TransactionSerializer,
    RegistroSerializer,
    perfil_desde_usuario,
)

class CategoryViewSet(viewsets.ModelViewSet):
    """Categorías globales: todos los usuarios ven la misma lista."""

    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.all()

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


class IaChatView(APIView):
    """POST /api/ia/chat/ — asistente financiero con contexto real del usuario."""

    def post(self, request):
        serializer = IaChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            respuesta = chat_with_groq(
                user=request.user,
                mensaje=serializer.validated_data["mensaje"],
                historial=serializer.validated_data.get("historial", []),
            )
        except RuntimeError as exc:
            return Response({"detalle": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({"respuesta": respuesta})


class PerfilView(APIView):
    """GET /api/perfil/ — datos del usuario logueado (nombre, correo, teléfono)."""

    def get(self, request):
        return Response(perfil_desde_usuario(request.user))


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
