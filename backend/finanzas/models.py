from django.conf import settings
from django.db import models


# Create your models here.

class Category(models.Model):
    """Categoría global de ingresos o gastos (compartida por todos los usuarios)."""

    class Tipo(models.TextChoices):
        INGRESO = "income", "Ingreso"
        GASTO = "expense", "Gasto"


    nombre = models.CharField(max_length = 120)
    tipo = models.CharField(max_length = 10, choices = Tipo.choices)

    class Meta: 
        constraints = [
            models.UniqueConstraint(
                fields = ["nombre", "tipo"],
                name = "uniq_finanzas_category_nombre_tipo",
            ),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"

class Presupuesto(models.Model):
    """Dinero apartado por el usuario para un gasto concreto (ej. pasajes)."""

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="presupuestos",
    )
    nombre = models.CharField(max_length=120)
    limite = models.DecimalField(max_digits=12, decimal_places=2)
    monto_rapido = models.DecimalField(max_digits=12, decimal_places=2, default=30)
    categoria_referencia = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="presupuestos_referencia",
    )
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nombre"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(limite__gt=0),
                name="chk_presupuesto_limite_mayor_que_cero",
            ),
            models.CheckConstraint(
                condition=models.Q(monto_rapido__gt=0),
                name="chk_presupuesto_monto_rapido_mayor_que_cero",
            ),
        ]

    def __str__(self):
        return f"{self.nombre} (S/ {self.limite})"


class Recurrente(models.Model):
    """Plantilla de ingreso o gasto fijo mensual (ej. Netflix, sueldo)."""

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recurrentes",
    )
    nombre = models.CharField(max_length=120)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=Category.Tipo.choices)
    dia_pago = models.PositiveSmallIntegerField()
    categoria = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="recurrentes",
    )
    permite_parciales = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nombre"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(monto__gt=0),
                name="chk_recurrente_monto_mayor_que_cero",
            ),
            models.CheckConstraint(
                condition=models.Q(dia_pago__gte=1, dia_pago__lte=31),
                name="chk_recurrente_dia_pago_rango",
            ),
        ]

    def __str__(self):
        return f"{self.nombre} (S/ {self.monto})"


class Transaction(models.Model):
    """transaccion de ingreso o gasto, por usuario """

    class Tipo(models.TextChoices):
        INGRESO = "income", "Ingreso"
        GASTO = "expense", "Gasto"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "transacciones",
    ) 

    categoria = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="transacciones",
        null=True,
        blank=True,
    )
    presupuesto = models.ForeignKey(
        Presupuesto,
        on_delete=models.PROTECT,
        related_name="transacciones",
        null=True,
        blank=True,
    )
    recurrente = models.ForeignKey(
        "Recurrente",
        on_delete=models.PROTECT,
        related_name="transacciones",
        null=True,
        blank=True,
    )

    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateField()
    descripcion = models.CharField(max_length=255, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [
            models.CheckConstraint(
                condition = models.Q(monto__gt=0),
                name = "chk_transaction_monto_mayor_que_cero"
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(tipo="income", presupuesto__isnull=True, categoria__isnull=False)
                    | models.Q(
                        tipo="expense",
                        presupuesto__isnull=False,
                        categoria__isnull=True,
                        recurrente__isnull=True,
                    )
                    | models.Q(
                        tipo="expense",
                        presupuesto__isnull=True,
                        categoria__isnull=False,
                        recurrente__isnull=True,
                    )
                    | models.Q(
                        tipo="expense",
                        presupuesto__isnull=True,
                        categoria__isnull=False,
                        recurrente__isnull=False,
                    )
                ),
                name="chk_transaction_origen",
            ),
        ]
        ordering = ["-fecha", "-creado_en"]
    def __str__(self):
        return f"{self.get_tipo_display()} - S/ {self.monto} - {self.fecha}"


class PerfilUsuario(models.Model):
    """Datos extra del usuario (teléfono, etc.). Un registro por usuario."""
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "perfil",
    )
    telefono = models.CharField(max_length=15, unique=True)

    class Meta: 
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuarios"

    def __str__(self):  
        return f"{self.usuario.username} - {self.telefono}"