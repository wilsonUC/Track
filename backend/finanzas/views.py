from datetime import date
from decimal import Decimal

from django.db.models import DecimalField, Q, Sum
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Presupuesto, Recurrente, Transaction
from .ia_service import chat_with_groq
from .recurrentes_service import transacciones_mes_actual
from .serializers import (
    CategorySerializer,
    IaChatSerializer,
    PresupuestoSerializer,
    RecurrenteRegistrarPagoSerializer,
    RecurrenteSerializer,
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
        return Transaction.objects.filter(usuario=self.request.user).select_related(
            "categoria", "presupuesto", "recurrente"
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)    

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class PresupuestoViewSet(viewsets.ModelViewSet):
    """Presupuestos del usuario: límites mensuales con gastado calculado."""

    serializer_class = PresupuestoSerializer

    def get_queryset(self):
        today = date.today()
        month_start = today.replace(day=1)
        return (
            Presupuesto.objects.filter(usuario=self.request.user, activo=True)
            .select_related("categoria_referencia")
            .annotate(
                gastado=Coalesce(
                    Sum(
                        "transacciones__monto",
                        filter=Q(
                            transacciones__tipo=Transaction.Tipo.GASTO,
                            transacciones__fecha__gte=month_start,
                            transacciones__fecha__lte=today,
                        ),
                    ),
                    Decimal("0"),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                )
            )
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def perform_destroy(self, instance):
        instance.activo = False
        instance.save(update_fields=["activo", "actualizado_en"])

    @action(detail=True, methods=["post"], url_path="gasto-rapido")
    def gasto_rapido(self, request, pk=None):
        presupuesto = self.get_object()
        Transaction.objects.create(
            usuario=request.user,
            presupuesto=presupuesto,
            categoria=None,
            tipo=Transaction.Tipo.GASTO,
            monto=presupuesto.monto_rapido,
            fecha=date.today(),
            descripcion=f"Gasto presupuesto: {presupuesto.nombre}",
        )
        presupuesto = self.get_queryset().get(pk=presupuesto.pk)
        serializer = self.get_serializer(presupuesto)
        return Response(serializer.data)


class RecurrenteViewSet(viewsets.ModelViewSet):
    """Ingresos y gastos fijos mensuales del usuario."""

    serializer_class = RecurrenteSerializer

    def get_queryset(self):
        return (
            Recurrente.objects.filter(usuario=self.request.user, activo=True)
            .select_related("categoria")
            .order_by("tipo", "nombre")
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user, permite_parciales=False)

    def perform_destroy(self, instance):
        instance.activo = False
        instance.save(update_fields=["activo", "actualizado_en"])

    @action(detail=True, methods=["post"], url_path="registrar-pago")
    def registrar_pago(self, request, pk=None):
        recurrente = self.get_object()
        body = RecurrenteRegistrarPagoSerializer(data=request.data)
        body.is_valid(raise_exception=True)

        if recurrente.permite_parciales:
            return Response(
                {"detalle": "Abonos parciales aún no están disponibles."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if transacciones_mes_actual(recurrente).exists():
            return Response(
                {"detalle": "Ya hay un registro de este mes para este recurrente."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        monto = body.validated_data.get("monto") or recurrente.monto
        etiqueta = "cobro" if recurrente.tipo == Transaction.Tipo.INGRESO else "pago"
        Transaction.objects.create(
            usuario=request.user,
            recurrente=recurrente,
            categoria=recurrente.categoria,
            presupuesto=None,
            tipo=recurrente.tipo,
            monto=monto,
            fecha=date.today(),
            descripcion=f"Recurrente {etiqueta}: {recurrente.nombre}",
        )
        serializer = self.get_serializer(recurrente)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="desmarcar-pago")
    def desmarcar_pago(self, request, pk=None):
        recurrente = self.get_object()
        eliminados, _ = transacciones_mes_actual(recurrente).delete()
        if eliminados == 0:
            return Response(
                {"detalle": "No hay registro de este mes para desmarcar."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(recurrente)
        return Response(serializer.data)


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
