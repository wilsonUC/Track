from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import DecimalField, Q, Sum, Exists, OuterRef
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    AsignacionMeta,
    Category,
    ConsejoCache,
    MetaAhorro,
    Presupuesto,
    PreferenciasUsuario,
    Recurrente,
    Transaction,
)
from .ia_service import chat_with_groq
from .consejos_service import get_or_generate_consejos
from .ahorros_service import ahorro_libre, resumen_ahorros
from .recurrentes_service import (
    transacciones_mes_actual,
    _bounds_mes,
    _bounds_mes_anterior,
    obtener_cuentas_atrasadas,
)
from .serializers import (
    AhorroSerializer,
    CategorySerializer,
    FinanzasTokenObtainPairSerializer,
    IaChatSerializer,
    AdminUsuarioSerializer,
    AdminUsuarioUpdateSerializer,
    MetaAsignarSerializer,
    MetaSerializer,
    PreferenciasSerializer,
    PresupuestoSerializer,
    RecurrenteRegistrarPagoSerializer,
    RecurrenteSerializer,
    TransactionSerializer,
    RegistroSerializer,
    CambioPasswordSerializer,
    PerfilUpdateSerializer,
    perfil_desde_usuario,
)

User = get_user_model()


class FinanzasTokenObtainPairView(TokenObtainPairView):
    serializer_class = FinanzasTokenObtainPairSerializer


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
        from .ahorros_service import validar_limite_saldo
        validar_limite_saldo(request.user, Transaction.Tipo.GASTO, presupuesto.monto_rapido)

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
        mes_param = self.request.query_params.get("mes")
        reference_date = date.today()
        if mes_param:
            try:
                reference_date = date.fromisoformat(mes_param)
            except ValueError:
                pass

        inicio_mes, fin_mes = _bounds_mes(reference_date)
        inicio_anterior, fin_anterior = _bounds_mes_anterior(reference_date)

        txs_este_mes = Transaction.objects.filter(
            recurrente=OuterRef("pk"),
            fecha__gte=inicio_mes,
            fecha__lte=fin_mes,
        )

        txs_mes_anterior = Transaction.objects.filter(
            recurrente=OuterRef("pk"),
            fecha__gte=inicio_anterior,
            fecha__lte=fin_anterior,
        )

        incluir_inactivos = self.request.query_params.get("incluir_inactivos") in ("true", "1", "yes")
        es_detalle = self.action in ("retrieve", "update", "partial_update", "destroy") or "pk" in self.kwargs
        base_qs = Recurrente.objects.filter(usuario=self.request.user)
        if not incluir_inactivos and not es_detalle:
            base_qs = base_qs.filter(activo=True)

        return (
            base_qs.select_related("categoria")
            .annotate(
                registrado_este_mes=Exists(txs_este_mes),
                registrado_mes_anterior=Exists(txs_mes_anterior),
            )
            .order_by("tipo", "nombre")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        mes_param = self.request.query_params.get("mes")
        reference_date = date.today()
        if mes_param:
            try:
                reference_date = date.fromisoformat(mes_param)
            except ValueError:
                pass
        context["reference_date"] = reference_date
        return context

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def perform_destroy(self, instance):
        instance.activo = False
        instance.save(update_fields=["activo", "actualizado_en"])

    @action(detail=True, methods=["post"], url_path="registrar-pago")
    def registrar_pago(self, request, pk=None):
        recurrente = self.get_object()
        body = RecurrenteRegistrarPagoSerializer(data=request.data)
        body.is_valid(raise_exception=True)

        fecha_pago = body.validated_data.get("fecha") or date.today()

        # Calcular el monto ya pagado este mes
        inicio_mes, fin_mes = _bounds_mes(fecha_pago)
        from django.db.models import Sum
        monto_pagado = Transaction.objects.filter(
            recurrente=recurrente,
            fecha__gte=inicio_mes,
            fecha__lte=fin_mes,
        ).aggregate(total=Sum("monto"))["total"] or Decimal("0")
        
        monto_restante = recurrente.monto - Decimal(str(monto_pagado))

        # Si permite abonos parciales
        if recurrente.permite_parciales:
            monto = body.validated_data.get("monto")
            if monto is None:
                monto = monto_restante
            
            if monto_restante <= 0:
                return Response(
                    {"detalle": "Este recurrente ya ha sido pagado/cobrado por completo este mes."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if monto <= 0:
                return Response(
                    {"detalle": "El monto del abono debe ser mayor que cero."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if monto > monto_restante:
                return Response(
                    {"detalle": f"El monto ingresado (S/ {monto:.2f}) supera el saldo restante (S/ {monto_restante:.2f})."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # Si NO permite abonos parciales
            monto = body.validated_data.get("monto")
            if monto is None:
                monto = monto_restante

            if transacciones_mes_actual(recurrente, reference=fecha_pago).exists() and monto_restante <= 0:
                return Response(
                    {"detalle": "Ya hay un registro de este mes para este recurrente."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if monto <= 0:
                return Response(
                    {"detalle": "El monto del pago debe ser mayor que cero."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        from .ahorros_service import validar_limite_saldo
        validar_limite_saldo(request.user, recurrente.tipo, monto)

        etiqueta = "cobro" if recurrente.tipo == Transaction.Tipo.INGRESO else "pago"
        Transaction.objects.create(
            usuario=request.user,
            recurrente=recurrente,
            categoria=recurrente.categoria,
            presupuesto=None,
            tipo=recurrente.tipo,
            monto=monto,
            fecha=fecha_pago,
            descripcion=f"Recurrente {etiqueta}: {recurrente.nombre}",
        )

        context = self.get_serializer_context()
        context["reference_date"] = fecha_pago
        recurrente = self.get_queryset().get(pk=recurrente.pk)
        serializer = self.get_serializer(recurrente, context=context)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="desmarcar-pago")
    def desmarcar_pago(self, request, pk=None):
        recurrente = self.get_object()
        fecha_pago_str = request.data.get("fecha")
        fecha_pago = date.today()
        if fecha_pago_str:
            try:
                fecha_pago = date.fromisoformat(fecha_pago_str)
            except ValueError:
                pass

        eliminados, _ = transacciones_mes_actual(recurrente, reference=fecha_pago).delete()
        if eliminados == 0:
            return Response(
                {"detalle": "No hay registro de este mes para desmarcar."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        context = self.get_serializer_context()
        context["reference_date"] = fecha_pago
        recurrente = self.get_queryset().get(pk=recurrente.pk)
        serializer = self.get_serializer(recurrente, context=context)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="cuentas-atrasadas")
    def cuentas_atrasadas(self, request):
        res = obtener_cuentas_atrasadas(request.user, reference=date.today())
        return Response(res)


class MetaViewSet(viewsets.ModelViewSet):
    """Metas de ahorro del usuario."""

    serializer_class = MetaSerializer

    def get_queryset(self):
        return (
            MetaAhorro.objects.filter(usuario=self.request.user, activo=True)
            .select_related("categoria_referencia", "asignacion")
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def perform_destroy(self, instance):
        # Liberamos el dinero asignado borrando el registro de asignación
        try:
            if hasattr(instance, "asignacion"):
                instance.asignacion.delete()
        except Exception:
            pass
        instance.activo = False
        instance.save(update_fields=["activo", "actualizado_en"])

    @action(detail=True, methods=["post"], url_path="asignar")
    def asignar(self, request, pk=None):
        """Asigna ahorro libre a la meta. No puede superar el ahorro libre."""
        meta = self.get_object()
        body = MetaAsignarSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        monto = body.validated_data["monto"]

        libre = ahorro_libre(request.user)
        if monto > libre:
            return Response(
                {"detalle": f"Solo tienes S/ {libre:.2f} de ahorro libre para asignar."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        asignacion, _ = AsignacionMeta.objects.get_or_create(
            meta=meta,
            defaults={"usuario": request.user, "monto": Decimal("0")},
        )
        asignacion.monto = asignacion.monto + monto
        asignacion.save(update_fields=["monto", "actualizado_en"])

        return Response(self.get_serializer(meta).data)

    @action(detail=True, methods=["post"], url_path="desasignar")
    def desasignar(self, request, pk=None):
        """Quita ahorro asignado de la meta; vuelve a estar libre."""
        meta = self.get_object()
        body = MetaAsignarSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        monto = body.validated_data["monto"]

        asignacion = AsignacionMeta.objects.filter(meta=meta).first()
        asignado = asignacion.monto if asignacion else Decimal("0")
        if monto > asignado:
            return Response(
                {"detalle": f"La meta solo tiene S/ {asignado:.2f} asignados."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        asignacion.monto = asignado - monto
        asignacion.save(update_fields=["monto", "actualizado_en"])

        return Response(self.get_serializer(meta).data)


class AhorroViewSet(viewsets.ModelViewSet):
    """Pool de ahorros del usuario (transacciones tipo saving, sin meta)."""

    serializer_class = AhorroSerializer

    def get_queryset(self):
        return Transaction.objects.filter(
            usuario=self.request.user,
            tipo=Transaction.Tipo.AHORRO,
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user, tipo=Transaction.Tipo.AHORRO)

    def perform_destroy(self, instance):
        """No se puede borrar ahorro si dejaría el pool por debajo de lo asignado."""
        libre = ahorro_libre(self.request.user)
        if instance.monto > libre:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {
                    "detalle": (
                        "No puedes eliminar este ahorro: parte ya está asignado a metas. "
                        "Desasigna primero."
                    )
                }
            )
        instance.delete()

    @action(detail=False, methods=["get"], url_path="resumen")
    def resumen(self, request):
        return Response(resumen_ahorros(request.user))


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


class ConsejosView(APIView):
    """GET /api/consejos/ — consejos IA con caché 24 h. ?regenerar=1 fuerza nueva generación."""

    def get(self, request):
        force = request.query_params.get("regenerar") in ("1", "true", "yes")
        try:
            payload = get_or_generate_consejos(request.user, force=force)
        except RuntimeError as exc:
            return Response({"detalle": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(payload)


class PerfilView(APIView):
    """GET/PATCH /api/perfil/ — datos y actualización del usuario logueado."""

    def get(self, request):
        return Response(perfil_desde_usuario(request.user))

    def patch(self, request):
        serializer = PerfilUpdateSerializer(
            data=request.data,
            partial=True,
            context={"user": request.user},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(perfil_desde_usuario(request.user))


class PreferenciasView(APIView):
    """GET/PATCH /api/preferencias/ — preferencias de la app del usuario logueado."""

    def get(self, request):
        prefs, _ = PreferenciasUsuario.objects.get_or_create(usuario=request.user)
        return Response(PreferenciasSerializer(prefs).data)

    def patch(self, request):
        prefs, _ = PreferenciasUsuario.objects.get_or_create(usuario=request.user)
        serializer = PreferenciasSerializer(prefs, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PreferenciasSerializer(prefs).data)


class CambioPasswordView(APIView):
    """POST /api/perfil/cambiar-password/ — cambiar contraseña del usuario logueado."""

    def post(self, request):
        serializer = CambioPasswordSerializer(
            data=request.data,
            context={"user": request.user},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"mensaje": "Contraseña actualizada correctamente."})


class ResetDatosView(APIView):
    """POST /api/perfil/resetear-datos/ — borra los datos financieros del usuario.

    Elimina transacciones, presupuestos, recurrentes, metas y la caché de consejos.
    NO toca la cuenta del usuario (credenciales, perfil, teléfono).
    """

    def post(self, request):
        user = request.user

        eliminados = {
            "transacciones": Transaction.objects.filter(usuario=user).delete()[0],
            "presupuestos": Presupuesto.objects.filter(usuario=user).delete()[0],
            "recurrentes": Recurrente.objects.filter(usuario=user).delete()[0],
            "asignaciones": AsignacionMeta.objects.filter(usuario=user).delete()[0],
            "metas": MetaAhorro.objects.filter(usuario=user).delete()[0],
            "consejos_cache": ConsejoCache.objects.filter(usuario=user).delete()[0],
        }

        return Response(
            {
                "mensaje": "Tus datos financieros se borraron. Empiezas desde cero.",
                "eliminados": eliminados,
            }
        )


class AdminUsuariosView(APIView):
    """GET /api/admin/usuarios/ — lista usuarios para el panel administrativo."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        usuarios = User.objects.select_related("perfil").order_by("-date_joined")
        serializer = AdminUsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)


class AdminUsuarioDetalleView(APIView):
    """PATCH /api/admin/usuarios/<id>/ — editar datos o estado de un usuario."""

    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.select_related("perfil").get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detalle": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {"detalle": "Solo un superusuario puede editar a otro superusuario."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user.pk == request.user.pk and request.data.get("estado_cuenta"):
            return Response(
                {"detalle": "No puedes cambiar el estado de tu propia cuenta desde este panel."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AdminUsuarioUpdateSerializer(
            data=request.data,
            partial=True,
            context={"user": user},
        )
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        updated_user = User.objects.select_related("perfil").get(pk=updated_user.pk)
        return Response(AdminUsuarioSerializer(updated_user).data)

    def delete(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detalle": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {"detalle": "Solo un superusuario puede eliminar a otro superusuario."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user.pk == request.user.pk:
            return Response(
                {"detalle": "No puedes eliminar tu propia cuenta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response({"mensaje": "Usuario eliminado correctamente."}, status=status.HTTP_200_OK)



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
