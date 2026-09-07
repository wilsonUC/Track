import calendar
from datetime import date
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

from .models import (
    Category,
    MetaAhorro,
    PerfilUsuario,
    PreferenciasUsuario,
    Presupuesto,
    Recurrente,
    Transaction,
)
from .metas_service import (
    calcular_acumulado,
    calcular_completada,
    calcular_estado_meta,
    calcular_porcentaje as calcular_porcentaje_meta,
    calcular_ahorro_sugerido,
)
from .presupuestos_service import calcular_estado, calcular_gastado_mes, calcular_porcentaje
from .recurrentes_service import MESES_ES, calcular_estado_recurrente


def perfil_desde_usuario(user):
    """Datos del usuario logueado para mostrar en la app."""
    try:
        perfil = user.perfil
        telefono = perfil.telefono
        estado_cuenta = perfil.estado_cuenta
        tipo_cuenta = perfil.tipo_cuenta
        tipo_cuenta_label = perfil.get_tipo_cuenta_display()
        fecha_expiracion = perfil.fecha_expiracion
        is_expired = perfil.is_expired
        dias_restantes = perfil.dias_restantes
    except PerfilUsuario.DoesNotExist:
        telefono = ""
        estado_cuenta = PerfilUsuario.EstadoCuenta.ACTIVA if user.is_staff else PerfilUsuario.EstadoCuenta.PENDIENTE
        tipo_cuenta = PerfilUsuario.TipoCuenta.AVANZADO if user.is_staff else PerfilUsuario.TipoCuenta.BASICO
        tipo_cuenta_label = "Avanzado" if user.is_staff else "Básico"
        fecha_expiracion = None
        is_expired = False
        dias_restantes = None
    return {
        "username": user.username,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "email": user.email,
        "telefono": telefono,
        "estado_cuenta": estado_cuenta,
        "tipo_cuenta": tipo_cuenta,
        "tipo_cuenta_label": tipo_cuenta_label,
        "fecha_expiracion": str(fecha_expiracion) if fecha_expiracion else None,
        "is_expired": is_expired,
        "dias_restantes": dias_restantes,
        "is_staff": user.is_staff,
    }

User = get_user_model()


class FinanzasTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login JWT con control de aprobación/bloqueo y expiración para usuarios normales."""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if user.is_staff or user.is_superuser:
            return data

        try:
            perfil = user.perfil
            estado_cuenta = perfil.estado_cuenta
            is_expired = perfil.is_expired
            fecha_expiracion = perfil.fecha_expiracion
        except PerfilUsuario.DoesNotExist:
            estado_cuenta = PerfilUsuario.EstadoCuenta.PENDIENTE
            is_expired = False
            fecha_expiracion = None

        if estado_cuenta == PerfilUsuario.EstadoCuenta.PENDIENTE:
            raise AuthenticationFailed("Tu cuenta está pendiente de aprobación.")
        if estado_cuenta == PerfilUsuario.EstadoCuenta.BLOQUEADA:
            raise AuthenticationFailed("Tu cuenta está bloqueada. Contacta al administrador.")
        if is_expired:
            if fecha_expiracion:
                from django.utils import timezone
                local_exp = timezone.localtime(fecha_expiracion) if timezone.is_aware(fecha_expiracion) else fecha_expiracion
                fecha_str = local_exp.strftime("%d/%m/%Y a las %H:%M")
            else:
                fecha_str = ""
            raise AuthenticationFailed(f"Tu periodo de acceso expiró ({fecha_str}). Contacta al administrador para renovar tu suscripción.")

        return data


class FinanzasTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken(attrs["refresh"])
        user_id = refresh.payload.get("user_id")
        if user_id:
            try:
                user = User.objects.get(pk=user_id)
                if not user.is_staff and not user.is_superuser:
                    perfil = user.perfil
                    if perfil.estado_cuenta == PerfilUsuario.EstadoCuenta.PENDIENTE:
                        raise AuthenticationFailed("Tu cuenta está pendiente de aprobación.")
                    if perfil.estado_cuenta == PerfilUsuario.EstadoCuenta.BLOQUEADA:
                        raise AuthenticationFailed("Tu cuenta está bloqueada. Contacta al administrador.")
                    if perfil.is_expired:
                        raise AuthenticationFailed("Tu periodo de acceso ha expirado. Contacta al administrador para renovar tu suscripción.")
            except (User.DoesNotExist, PerfilUsuario.DoesNotExist):
                raise AuthenticationFailed("Usuario no válido.")
        return data


class IaHistorialItemSerializer(serializers.Serializer):
    rol = serializers.ChoiceField(choices=["user", "assistant"])
    contenido = serializers.CharField(max_length=4000)


class IaChatSerializer(serializers.Serializer):
    mensaje = serializers.CharField(min_length=1, max_length=2000)
    historial = IaHistorialItemSerializer(many=True, required=False, default=list)


class CategorySerializer(serializers.ModelSerializer):
    """Categoría global: nombre y si es ingreso o gasto."""

    class Meta:
        model = Category
        # Estos son los datos que se envían y reciben por la API
        fields = ["id", "nombre", "tipo"]
        # El número id lo pone la base de datos; el usuario no puede inventárselo al crear
        read_only_fields = ["id"]

    def validate(self, attrs):
        """No permitir dos categorías globales con el mismo nombre y tipo."""
        ya_existe = Category.objects.filter(
            nombre=attrs["nombre"],
            tipo=attrs["tipo"],
        )
        if self.instance:
            ya_existe = ya_existe.exclude(pk=self.instance.pk)
        if ya_existe.exists():
            raise serializers.ValidationError(
                {"nombre": "Ya existe una categoría con ese nombre y tipo."}
            )
        return attrs


class PresupuestoSerializer(serializers.ModelSerializer):
    gastado = serializers.SerializerMethodField()
    porcentaje = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    consumos = serializers.SerializerMethodField()
    categoria_referencia_nombre = serializers.CharField(
        source="categoria_referencia.nombre",
        read_only=True,
        default=None,
    )

    class Meta:
        model = Presupuesto
        fields = [
            "id",
            "nombre",
            "limite",
            "monto_rapido",
            "categoria_referencia",
            "categoria_referencia_nombre",
            "activo",
            "gastado",
            "porcentaje",
            "estado",
            "consumos",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["id", "gastado", "porcentaje", "estado", "consumos", "creado_en", "actualizado_en"]

    def _gastado(self, obj: Presupuesto):
        if hasattr(obj, "gastado") and obj.gastado is not None:
            return obj.gastado
        reference_date = self.context.get("reference_date", date.today())
        return calcular_gastado_mes(obj, reference=reference_date)

    def get_gastado(self, obj):
        return self._gastado(obj)

    def get_porcentaje(self, obj):
        return calcular_porcentaje(self._gastado(obj), obj.limite)

    def get_estado(self, obj):
        return calcular_estado(self._gastado(obj), obj.limite)

    def get_consumos(self, obj):
        from .presupuestos_service import _month_bounds
        from .models import Transaction
        reference_date = self.context.get("reference_date", date.today())
        inicio, fin = _month_bounds(reference_date)
        txs = Transaction.objects.filter(
            presupuesto=obj,
            tipo=Transaction.Tipo.GASTO,
            fecha__gte=inicio,
            fecha__lte=fin,
        ).order_by("-fecha", "-creado_en")
        return [
            {
                "id": t.id,
                "monto": float(t.monto),
                "fecha": t.fecha.strftime("%Y-%m-%d"),
                "descripcion": t.descripcion,
            }
            for t in txs
        ]

    def validate_limite(self, value):
        if value <= 0:
            raise serializers.ValidationError("El límite debe ser mayor que cero.")
        return value

    def validate_monto_rapido(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto rápido debe ser mayor que cero.")
        return value

    def validate_categoria_referencia(self, value):
        if value and value.tipo != Category.Tipo.GASTO:
            raise serializers.ValidationError("La categoría de referencia debe ser de gasto.")
        return value


class RecurrenteSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    registrado_mes = serializers.SerializerMethodField()
    vencido = serializers.SerializerMethodField()
    mes_anterior_sin_registrar = serializers.SerializerMethodField()
    activo_en_mes = serializers.SerializerMethodField()
    estado_periodo = serializers.SerializerMethodField()
    monto_pagado = serializers.SerializerMethodField()
    abonos = serializers.SerializerMethodField()

    class Meta:
        model = Recurrente
        fields = [
            "id",
            "nombre",
            "monto",
            "tipo",
            "dia_pago",
            "categoria",
            "categoria_nombre",
            "permite_parciales",
            "fecha_inicio",
            "fecha_fin",
            "activo",
            "registrado_mes",
            "vencido",
            "mes_anterior_sin_registrar",
            "activo_en_mes",
            "estado_periodo",
            "monto_pagado",
            "abonos",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = [
            "id",
            "categoria_nombre",
            "registrado_mes",
            "vencido",
            "mes_anterior_sin_registrar",
            "activo_en_mes",
            "estado_periodo",
            "creado_en",
            "actualizado_en",
        ]

    def _estado(self, obj: Recurrente):
        reference_date = self.context.get("reference_date")
        return calcular_estado_recurrente(obj, reference=reference_date)

    def get_registrado_mes(self, obj):
        return self._estado(obj)["registrado_mes"]

    def get_vencido(self, obj):
        return self._estado(obj)["vencido"]

    def get_mes_anterior_sin_registrar(self, obj):
        return self._estado(obj)["mes_anterior_sin_registrar"]

    def get_activo_en_mes(self, obj):
        return self._estado(obj)["activo_en_mes"]

    def get_estado_periodo(self, obj):
        return self._estado(obj)["estado_periodo"]

    def get_monto_pagado(self, obj):
        return self._estado(obj)["monto_pagado"]

    def to_representation(self, instance: Recurrente):
        ret = super().to_representation(instance)
        from datetime import date
        from .recurrentes_service import obtener_monto_mes, obtener_permite_parciales_mes
        reference_date = self.context.get("reference_date") or date.today()
        monto_mes = obtener_monto_mes(instance, reference_date)
        permite_parciales_mes = obtener_permite_parciales_mes(instance, reference_date)
        ret["monto_base"] = str(instance.monto)
        ret["monto"] = str(monto_mes)
        ret["tiene_ajuste_mes"] = monto_mes != instance.monto
        ret["permite_parciales"] = permite_parciales_mes
        return ret

    def get_abonos(self, obj):
        from .recurrentes_service import _bounds_mes
        from .models import Transaction
        from datetime import date
        reference_date = self.context.get("reference_date") or date.today()
        inicio, fin = _bounds_mes(reference_date)
        txs = Transaction.objects.filter(
            recurrente=obj,
            fecha__gte=inicio,
            fecha__lte=fin,
        ).order_by("fecha", "creado_en")
        return [
            {
                "id": t.id,
                "monto": float(t.monto),
                "fecha": t.fecha.strftime("%Y-%m-%d"),
                "descripcion": t.descripcion,
            }
            for t in txs
        ]

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que cero.")
        return value

    def validate_dia_pago(self, value):
        if value < 1 or value > 31:
            raise serializers.ValidationError("El día debe estar entre 1 y 31.")
        return value

    def validate(self, attrs):
        categoria = attrs.get("categoria")
        tipo = attrs.get("tipo")

        # Ajustar fecha_inicio al día 1 del mes
        if "fecha_inicio" in attrs and attrs["fecha_inicio"] is not None:
            attrs["fecha_inicio"] = attrs["fecha_inicio"].replace(day=1)

        # Ajustar fecha_fin al último día del mes
        if "fecha_fin" in attrs and attrs["fecha_fin"] is not None:
            ultimo_dia = calendar.monthrange(attrs["fecha_fin"].year, attrs["fecha_fin"].month)[1]
            attrs["fecha_fin"] = attrs["fecha_fin"].replace(day=ultimo_dia)

        fecha_inicio = attrs.get("fecha_inicio")
        fecha_fin = attrs.get("fecha_fin")

        if self.instance:
            if categoria is None:
                categoria = self.instance.categoria
            if tipo is None:
                tipo = self.instance.tipo
            if fecha_inicio is None and "fecha_inicio" not in attrs:
                fecha_inicio = self.instance.fecha_inicio
            if fecha_fin is None and "fecha_fin" not in attrs:
                fecha_fin = self.instance.fecha_fin

            # Validar que no existan transacciones fuera del nuevo rango de fechas
            if fecha_inicio is not None:
                txs_antes = Transaction.objects.filter(
                    recurrente=self.instance,
                    fecha__lt=fecha_inicio,
                )
                if txs_antes.exists():
                    fechas_afectadas = txs_antes.values_list("fecha", flat=True).distinct()
                    meses_set = {f"{MESES_ES[f.month - 1].capitalize()} {f.year}" for f in fechas_afectadas}
                    meses_str = ", ".join(sorted(meses_set))
                    mes_inicio_str = f"{MESES_ES[fecha_inicio.month - 1].capitalize()} {fecha_inicio.year}"
                    raise serializers.ValidationError(
                        {
                            "fecha_inicio": (
                                f"No se puede cambiar la fecha de inicio a {mes_inicio_str} porque existen pagos/abonos registrados "
                                f"en fechas o meses anteriores ({meses_str}). Primero debes eliminar esas transacciones para poder mover el período."
                            )
                        }
                    )

            if fecha_fin is not None:
                txs_despues = Transaction.objects.filter(
                    recurrente=self.instance,
                    fecha__gt=fecha_fin,
                )
                if txs_despues.exists():
                    fechas_afectadas = txs_despues.values_list("fecha", flat=True).distinct()
                    meses_set = {f"{MESES_ES[f.month - 1].capitalize()} {f.year}" for f in fechas_afectadas}
                    meses_str = ", ".join(sorted(meses_set))
                    mes_fin_str = f"{MESES_ES[fecha_fin.month - 1].capitalize()} {fecha_fin.year}"
                    raise serializers.ValidationError(
                        {
                            "fecha_fin": (
                                f"No se puede cambiar la fecha de fin a {mes_fin_str} porque existen pagos/abonos registrados "
                                f"en fechas o meses posteriores ({meses_str}). Primero debes eliminar esas transacciones para poder mover el período."
                            )
                        }
                    )

        if categoria and tipo and categoria.tipo != tipo:
            raise serializers.ValidationError(
                {"categoria": "La categoría debe coincidir con el tipo (ingreso/gasto)."}
            )

        if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
            raise serializers.ValidationError(
                {"fecha_inicio": "La fecha de inicio no puede ser posterior a la fecha de fin."}
            )

        return attrs


class RecurrenteRegistrarPagoSerializer(serializers.Serializer):
    monto = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    fecha = serializers.DateField(required=False)
    meta_liberar_id = serializers.IntegerField(required=False, allow_null=True)
    liberar_de_ahorro_libre = serializers.BooleanField(required=False, default=False)


class MetaSerializer(serializers.ModelSerializer):
    acumulado = serializers.SerializerMethodField()
    porcentaje = serializers.SerializerMethodField()
    completada = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    monto_sugerido_mensual = serializers.SerializerMethodField()
    categoria_referencia_nombre = serializers.CharField(
        source="categoria_referencia.nombre",
        read_only=True,
        default=None,
    )

    class Meta:
        model = MetaAhorro
        fields = [
            "id",
            "nombre",
            "monto_objetivo",
            "fecha_inicio",
            "fecha_limite",
            "categoria_referencia",
            "categoria_referencia_nombre",
            "es_asignacion_libre",
            "activo",
            "acumulado",
            "porcentaje",
            "completada",
            "estado",
            "monto_sugerido_mensual",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = [
            "id",
            "acumulado",
            "porcentaje",
            "completada",
            "estado",
            "monto_sugerido_mensual",
            "creado_en",
            "actualizado_en",
        ]

    def _acumulado(self, obj: MetaAhorro):
        return calcular_acumulado(obj)

    def get_acumulado(self, obj):
        return self._acumulado(obj)

    def get_porcentaje(self, obj):
        return calcular_porcentaje_meta(self._acumulado(obj), obj.monto_objetivo)

    def get_completada(self, obj):
        return calcular_completada(self._acumulado(obj), obj.monto_objetivo)

    def get_estado(self, obj):
        return calcular_estado_meta(obj)

    def get_monto_sugerido_mensual(self, obj):
        return calcular_ahorro_sugerido(obj)

    def validate_monto_objetivo(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto objetivo debe ser mayor que cero.")
        return value

    def validate_categoria_referencia(self, value):
        if value and value.tipo != Category.Tipo.GASTO:
            raise serializers.ValidationError("La categoría de referencia debe ser de gasto.")
        return value

    def validate(self, attrs):
        # Ajustar fecha_inicio al día 1 del mes
        if "fecha_inicio" in attrs and attrs["fecha_inicio"] is not None:
            attrs["fecha_inicio"] = attrs["fecha_inicio"].replace(day=1)

        # Ajustar fecha_limite al último día del mes
        if "fecha_limite" in attrs and attrs["fecha_limite"] is not None:
            ultimo_dia = calendar.monthrange(attrs["fecha_limite"].year, attrs["fecha_limite"].month)[1]
            attrs["fecha_limite"] = attrs["fecha_limite"].replace(day=ultimo_dia)

        fecha_inicio = attrs.get("fecha_inicio")
        fecha_limite = attrs.get("fecha_limite")

        if self.instance:
            if fecha_inicio is None and "fecha_inicio" not in attrs:
                fecha_inicio = self.instance.fecha_inicio
            if fecha_limite is None and "fecha_limite" not in attrs:
                fecha_limite = self.instance.fecha_limite

        if fecha_inicio and fecha_limite and fecha_inicio > fecha_limite:
            raise serializers.ValidationError(
                {"fecha_inicio": "La fecha de inicio no puede ser posterior a la fecha límite."}
            )

        return attrs


class MetaAsignarSerializer(serializers.Serializer):
    monto = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que cero.")
        return value


class AhorroSerializer(serializers.ModelSerializer):
    """Aporte al pool de ahorros: transacción tipo saving sin meta ni categoría."""

    class Meta:
        model = Transaction
        fields = ["id", "monto", "fecha", "descripcion", "creado_en"]
        read_only_fields = ["id", "creado_en"]

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que cero.")
        return value

    def validate(self, attrs):
        from .ahorros_service import saldo_disponible_total

        request = self.context.get("request")
        user = getattr(request, "user", None)
        monto = attrs.get("monto")

        # Solo validar el tope al crear un ahorro nuevo (no al editar uno existente).
        if self.instance is None and user and monto is not None:
            disponible = saldo_disponible_total(user)
            if monto > disponible:
                raise serializers.ValidationError(
                    {
                        "monto": (
                            f"Solo tienes S/ {disponible:.2f} de saldo disponible "
                            "para apartar (ingresos − gastos − ahorros ya apartados)."
                        )
                    }
                )
        if user and monto is not None:
            from .ahorros_service import validar_limite_saldo
            validar_limite_saldo(
                user=user,
                tipo=Transaction.Tipo.AHORRO,
                monto=monto,
                transaccion_id=self.instance.id if self.instance else None
            )
        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    """
    Un movimiento de dinero: categoría o presupuesto (gastos), tipo, monto, fecha, etc.
    """

    presupuesto_nombre = serializers.CharField(source="presupuesto.nombre", read_only=True, default=None)
    recurrente_nombre = serializers.CharField(source="recurrente.nombre", read_only=True, default=None)
    meta_liberar_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    liberar_de_ahorro_libre = serializers.BooleanField(write_only=True, required=False, default=False)
    liberar_todo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "categoria",
            "presupuesto",
            "presupuesto_nombre",
            "recurrente",
            "recurrente_nombre",
            "tipo",
            "monto",
            "fecha",
            "descripcion",
            "meta_liberar_id",
            "liberar_de_ahorro_libre",
            "liberar_todo",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["id", "presupuesto_nombre", "recurrente_nombre", "creado_en", "actualizado_en"]

    def validate_monto(self, value):
        """El monto tiene que ser mayor que cero (un gasto o ingreso “en cero” no tiene sentido)."""
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que cero.")
        return value

    def validate(self, attrs):
        categoria = attrs.get("categoria")
        presupuesto = attrs.get("presupuesto")
        recurrente = attrs.get("recurrente")
        tipo = attrs.get("tipo")

        if self.instance:
            if "categoria" not in attrs:
                categoria = self.instance.categoria
            if "presupuesto" not in attrs:
                presupuesto = self.instance.presupuesto
            if "recurrente" not in attrs:
                recurrente = self.instance.recurrente
            if tipo is None:
                tipo = self.instance.tipo

        request = self.context.get("request")
        user = getattr(request, "user", None)

        if tipo == Transaction.Tipo.INGRESO:
            if not categoria:
                raise serializers.ValidationError(
                    {"categoria": "La categoría es obligatoria para ingresos."}
                )
            if presupuesto:
                raise serializers.ValidationError(
                    "Los ingresos no pueden asociarse a presupuesto."
                )
        elif tipo == Transaction.Tipo.AHORRO:
            if categoria or presupuesto or recurrente:
                raise serializers.ValidationError(
                    "Un ahorro no puede tener categoría, presupuesto ni recurrente."
                )
        elif tipo == Transaction.Tipo.GASTO:
            if presupuesto:
                if categoria or recurrente:
                    raise serializers.ValidationError(
                        "Un gasto de presupuesto no puede tener categoría ni recurrente."
                    )
            elif recurrente:
                if not categoria:
                    raise serializers.ValidationError(
                        {"categoria": "Un gasto recurrente requiere categoría."}
                    )
            else:
                if not categoria:
                    raise serializers.ValidationError(
                        {"categoria": "La categoría es obligatoria para gastos normales."}
                    )

            if presupuesto and user and presupuesto.usuario_id != user.id:
                raise serializers.ValidationError(
                    {"presupuesto": "El presupuesto no pertenece al usuario."}
                )
            if recurrente and user and recurrente.usuario_id != user.id:
                raise serializers.ValidationError(
                    {"recurrente": "El recurrente no pertenece al usuario."}
                )

        if categoria and tipo in (Transaction.Tipo.INGRESO, Transaction.Tipo.GASTO) and categoria.tipo != tipo:
            raise serializers.ValidationError(
                {"tipo": "El tipo debe coincidir con el de la categoría (ingreso/gasto)."}
            )

        if user and tipo:
            monto = attrs.get("monto", self.instance.monto if self.instance else None)
            if monto is not None:
                from .ahorros_service import validar_limite_saldo
                meta_liberar_id = attrs.pop("meta_liberar_id", None)
                liberar_de_ahorro_libre = attrs.pop("liberar_de_ahorro_libre", False)
                liberar_todo = attrs.pop("liberar_todo", False)
                validar_limite_saldo(
                    user=user,
                    tipo=tipo,
                    monto=monto,
                    transaccion_id=self.instance.id if self.instance else None,
                    meta_liberar_id=meta_liberar_id,
                    liberar_de_ahorro_libre=liberar_de_ahorro_libre,
                    liberar_todo=liberar_todo,
                )

        return attrs


class PreferenciasSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenciasUsuario
        fields = [
            "tema",
            "vista_compacta",
            "moneda",
            "dia_inicio_mes",
            "mostrar_decimales",
            "limitar_saldo_negativo",
            "permitir_asignacion_directa_metas",
            "descontar_ahorros_balance",
            "actualizado_en",
        ]
        read_only_fields = ["actualizado_en"]

    def validate_dia_inicio_mes(self, value):
        if value < 1 or value > 28:
            raise serializers.ValidationError("El día debe estar entre 1 y 28.")
        return value

    def validate_moneda(self, value):
        if value != "PEN":
            raise serializers.ValidationError("Por ahora solo está disponible la moneda PEN.")
        return value


class RegistroSerializer(serializers.Serializer):
    """
    Registro: campos del formulario Figma.
    No es ModelSerializer: creamos User + PerfilUsuario a mano en create().
    """

    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    telefono = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ese usuario ya existe.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ese correo ya está registrado.")
        return value

    def validate_telefono(self, value):
        if PerfilUsuario.objects.filter(telefono=value).exists():
            raise serializers.ValidationError("Ese teléfono ya está registrado.")
        return value

    def create(self, validated_data):
        telefono = validated_data.pop("telefono")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        PerfilUsuario.objects.create(
            usuario=user,
            telefono=telefono,
            estado_cuenta=PerfilUsuario.EstadoCuenta.PENDIENTE,
            tipo_cuenta=PerfilUsuario.TipoCuenta.BASICO,
        )
        return user


class AdminUsuarioSerializer(serializers.ModelSerializer):
    telefono = serializers.CharField(source="perfil.telefono", default="")
    estado_cuenta = serializers.CharField(source="perfil.estado_cuenta", default=PerfilUsuario.EstadoCuenta.PENDIENTE)
    estado_cuenta_label = serializers.SerializerMethodField()
    tipo_cuenta = serializers.CharField(source="perfil.tipo_cuenta", default=PerfilUsuario.TipoCuenta.BASICO)
    tipo_cuenta_label = serializers.SerializerMethodField()
    fecha_expiracion = serializers.DateTimeField(source="perfil.fecha_expiracion", default=None, allow_null=True)
    is_expired = serializers.BooleanField(source="perfil.is_expired", default=False)
    dias_restantes = serializers.IntegerField(source="perfil.dias_restantes", default=None, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "telefono",
            "estado_cuenta",
            "estado_cuenta_label",
            "tipo_cuenta",
            "tipo_cuenta_label",
            "fecha_expiracion",
            "is_expired",
            "dias_restantes",
            "is_staff",
            "date_joined",
            "last_login",
        ]
        read_only_fields = fields

    def get_estado_cuenta_label(self, obj):
        try:
            return obj.perfil.get_estado_cuenta_display()
        except PerfilUsuario.DoesNotExist:
            return "Pendiente"

    def get_tipo_cuenta_label(self, obj):
        try:
            return obj.perfil.get_tipo_cuenta_display()
        except PerfilUsuario.DoesNotExist:
            return "Básico"


def calcular_expiracion(duracion: str, base_date=None):
    from datetime import timedelta
    from django.utils import timezone

    if not duracion or str(duracion).lower() in ("permanente", "0", "none", ""):
        return None
    now = base_date or timezone.now()
    d_str = str(duracion).strip().lower()

    if d_str in ("1m", "1min", "1minuto", "1_min"):
        return now + timedelta(minutes=1)
    if d_str in ("5m", "5min"):
        return now + timedelta(minutes=5)

    try:
        meses = int(d_str)
    except (ValueError, TypeError):
        return None

    if meses == 1:
        return now + timedelta(days=30)
    elif meses == 2:
        return now + timedelta(days=60)
    elif meses == 6:
        return now + timedelta(days=180)
    elif meses == 12:
        return now + timedelta(days=365)
    else:
        return now + timedelta(days=30 * meses)


_MISSING = object()


class AdminUsuarioUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    telefono = serializers.CharField(max_length=15, required=False, allow_blank=True)
    estado_cuenta = serializers.ChoiceField(
        choices=PerfilUsuario.EstadoCuenta.choices,
        required=False,
    )
    tipo_cuenta = serializers.ChoiceField(
        choices=PerfilUsuario.TipoCuenta.choices,
        required=False,
    )
    fecha_expiracion = serializers.DateTimeField(required=False, allow_null=True)
    duracion = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_email(self, value):
        user = self.context["user"]
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Ese correo ya está registrado.")
        return value

    def validate_telefono(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("El teléfono es obligatorio.")
        user = self.context["user"]
        if PerfilUsuario.objects.filter(telefono=value).exclude(usuario=user).exists():
            raise serializers.ValidationError("Ese teléfono ya está registrado.")
        return value

    def save(self):
        user = self.context["user"]
        data = dict(self.validated_data)
        telefono = data.pop("telefono", None)
        estado_cuenta = data.pop("estado_cuenta", None)
        tipo_cuenta = data.pop("tipo_cuenta", None)

        duracion = data.pop("duracion", None)
        if duracion is not None:
            fecha_expiracion = calcular_expiracion(duracion)
        elif "fecha_expiracion" in data:
            fecha_expiracion = data.pop("fecha_expiracion")
        else:
            fecha_expiracion = _MISSING

        for field in ("first_name", "last_name", "email"):
            if field in data:
                setattr(user, field, data[field])
        user.save()

        if (
            telefono is not None
            or estado_cuenta is not None
            or tipo_cuenta is not None
            or fecha_expiracion is not _MISSING
        ):
            perfil, _ = PerfilUsuario.objects.get_or_create(
                usuario=user,
                defaults={
                    "telefono": telefono or "",
                    "estado_cuenta": estado_cuenta or PerfilUsuario.EstadoCuenta.PENDIENTE,
                    "tipo_cuenta": tipo_cuenta or PerfilUsuario.TipoCuenta.BASICO,
                },
            )
            if telefono is not None:
                perfil.telefono = telefono
            if estado_cuenta is not None:
                perfil.estado_cuenta = estado_cuenta
            if tipo_cuenta is not None:
                perfil.tipo_cuenta = tipo_cuenta
            if fecha_expiracion is not _MISSING:
                perfil.fecha_expiracion = fecha_expiracion
            perfil.save()

        return user


class PerfilUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    telefono = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate_email(self, value):
        user = self.context["user"]
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Ese correo ya está registrado.")
        return value

    def validate_telefono(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("El teléfono es obligatorio.")
        user = self.context["user"]
        if PerfilUsuario.objects.filter(telefono=value).exclude(usuario=user).exists():
            raise serializers.ValidationError("Ese teléfono ya está registrado.")
        return value

    def save(self):
        user = self.context["user"]
        data = self.validated_data
        telefono = data.pop("telefono", None)

        for field in ("first_name", "last_name", "email"):
            if field in data:
                setattr(user, field, data[field])
        user.save()

        if telefono is not None:
            perfil, created = PerfilUsuario.objects.get_or_create(
                usuario=user,
                defaults={"telefono": telefono},
            )
            if not created and perfil.telefono != telefono:
                perfil.telefono = telefono
                perfil.save()

        return user


class CambioPasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Las contraseñas no coinciden."}
            )
        user = self.context["user"]
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError(
                {"current_password": "La contraseña actual no es correcta."}
            )
        return attrs

    def save(self):
        user = self.context["user"]
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user