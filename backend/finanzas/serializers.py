# Aquí se prepara lo que entra y sale por la API: leer datos del usuario,
# comprobar que tengan sentido y pasarlos a la base de datos (o al revés).
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, PerfilUsuario, Transaction

User = get_user_model()


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


class TransactionSerializer(serializers.ModelSerializer):
    """
    Un movimiento de dinero: categoría, tipo, monto, fecha, etc.
    "categoria" es el id de una categoría global existente.
    """

    class Meta:
        model = Transaction
        fields = [
            "id",
            "categoria",
            "tipo",
            "monto",
            "fecha",
            "descripcion",
            "creado_en",
            "actualizado_en",
        ]
        # Fechas de creación y cambio, y el id: solo para mostrar, no para que el cliente los cambie
        read_only_fields = ["id", "creado_en", "actualizado_en"]

    def validate_monto(self, value):
        """El monto tiene que ser mayor que cero (un gasto o ingreso “en cero” no tiene sentido)."""
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que cero.")
        return value

    def validate(self, attrs):
        """
        El tipo del movimiento (ingreso/gasto) tiene que coincidir con el tipo
        de la categoría que eligió. Si solo cambia un dato al editar, usamos
        lo que ya estaba guardado para el otro.
        """
        categoria = attrs.get("categoria")
        tipo = attrs.get("tipo")
        if self.instance:
            if categoria is None:
                categoria = self.instance.categoria
            if tipo is None:
                tipo = self.instance.tipo
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