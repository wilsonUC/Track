# Aquí se prepara lo que entra y sale por la API: leer datos del usuario,
# comprobar que tengan sentido y pasarlos a la base de datos (o al revés).
from rest_framework import serializers

from .models import Category, Transaction


class CategorySerializer(serializers.ModelSerializer):
    """
    Una categoría en la app: nombre y si es ingreso o gasto.
    No pedimos el usuario por aquí: quien atiende la petición ya sabe quién es
    y lo guardará al crear la categoría.
    """

    class Meta:
        model = Category
        # Estos son los datos que se envían y reciben por la API
        fields = ["id", "nombre", "tipo"]
        # El número id lo pone la base de datos; el usuario no puede inventárselo al crear
        read_only_fields = ["id"]

    def validate(self, attrs):
        """
        Revisamos todo junto: que no haya dos categorías iguales
        (mismo nombre y mismo tipo) para la misma persona.
        """
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return attrs

        # Buscamos si ya existe otra categoría así para este usuario
        ya_existe = Category.objects.filter(
            usuario=request.user,
            nombre=attrs["nombre"],
            tipo=attrs["tipo"],
        )
        # Si estamos editando una categoría, no contamos la misma fila
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
    "categoria" es el número de la categoría que ya existe para ese usuario.
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

    def __init__(self, *args, **kwargs):
        """
        Al arrancar el serializer: en la lista de categorías solo aparecen
        las de la persona que está usando la app (no las de otros).
        """
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["categoria"].queryset = Category.objects.filter(
                usuario=request.user
            )

    def validate_monto(self, value):
        """El monto tiene que ser mayor que cero (un gasto o ingreso “en cero” no tiene sentido)."""
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que cero.")
        return value

    def validate_categoria(self, categoria):
        """La categoría tiene que ser de la misma persona que hace la petición."""
        request = self.context.get("request")
        if request and categoria.usuario_id != request.user.pk:
            raise serializers.ValidationError("Categoría no válida para este usuario.")
        return categoria

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
