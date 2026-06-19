# Aquí se prepara lo que entra y sale por la API: leer datos del usuario,
# comprobar que tengan sentido y pasarlos a la base de datos (o al revés).
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, PerfilUsuario, Presupuesto, Recurrente, Transaction
from .presupuestos_service import calcular_estado, calcular_gastado_mes, calcular_porcentaje
from .recurrentes_service import calcular_estado_recurrente


def perfil_desde_usuario(user):
    """Datos del usuario logueado para mostrar en la app."""
    try:
        telefono = user.perfil.telefono
    except PerfilUsuario.DoesNotExist:
        telefono = ""
    return {
        "username": user.username,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "email": user.email,
        "telefono": telefono,
    }

User = get_user_model()


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
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["id", "gastado", "porcentaje", "estado", "creado_en", "actualizado_en"]

    def _gastado(self, obj: Presupuesto):
        if hasattr(obj, "gastado") and obj.gastado is not None:
            return obj.gastado
        return calcular_gastado_mes(obj)

    def get_gastado(self, obj):
        return self._gastado(obj)

    def get_porcentaje(self, obj):
        return calcular_porcentaje(self._gastado(obj), obj.limite)

    def get_estado(self, obj):
        return calcular_estado(self._gastado(obj), obj.limite)

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
            "activo",
            "registrado_mes",
            "vencido",
            "mes_anterior_sin_registrar",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = [
            "id",
            "categoria_nombre",
            "registrado_mes",
            "vencido",
            "mes_anterior_sin_registrar",
            "creado_en",
            "actualizado_en",
        ]

    def _estado(self, obj: Recurrente):
        return calcular_estado_recurrente(obj)

    def get_registrado_mes(self, obj):
        return self._estado(obj)["registrado_mes"]

    def get_vencido(self, obj):
        return self._estado(obj)["vencido"]

    def get_mes_anterior_sin_registrar(self, obj):
        return self._estado(obj)["mes_anterior_sin_registrar"]

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
        if self.instance:
            if categoria is None:
                categoria = self.instance.categoria
            if tipo is None:
                tipo = self.instance.tipo
        if categoria and tipo and categoria.tipo != tipo:
            raise serializers.ValidationError(
                {"categoria": "La categoría debe coincidir con el tipo (ingreso/gasto)."}
            )
        return attrs


class RecurrenteRegistrarPagoSerializer(serializers.Serializer):
    monto = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)


class TransactionSerializer(serializers.ModelSerializer):
    """
    Un movimiento de dinero: categoría o presupuesto (gastos), tipo, monto, fecha, etc.
    """

    presupuesto_nombre = serializers.CharField(source="presupuesto.nombre", read_only=True, default=None)
    recurrente_nombre = serializers.CharField(source="recurrente.nombre", read_only=True, default=None)

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
                    {"presupuesto": "Los ingresos no pueden asociarse a un presupuesto."}
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
                if presupuesto:
                    raise serializers.ValidationError(
                        {"presupuesto": "Un gasto recurrente no puede tener presupuesto."}
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

        if categoria and tipo and categoria.tipo != tipo:
            raise serializers.ValidationError(
                {"tipo": "El tipo debe coincidir con el de la categoría (ingreso/gasto)."}
            )
        return attrs


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
        PerfilUsuario.objects.create(usuario=user, telefono=telefono)
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