from django.conf import settings
from django.db import models


# Create your models here.

class Category(models.Model):
    """categoria de ingresos o de gastos, por usuario """

    class Tipo(models.TextChoices):
        INGRESO = "income", "Ingreso"
        GASTO = "expense", "Gasto"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "categorias",
    )

    nombre = models.CharField(max_length = 120)
    tipo = models.CharField(max_length = 10, choices = Tipo.choices)

    class Meta: 
        constraints = [
            models.UniqueConstraint(
                fields = ["usuario", "nombre", "tipo"],
                name = "uniq_finanzas_category_usuario_nombre_tipo",
            ),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"

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
        on_delete = models.PROTECT,
        related_name = "transacciones",
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
        ]
        ordering = ["-fecha", "-creado_en"]
    def __str__(self):
        return f"{self.get_tipo_display()} - S/ {self.monto} - {self.fecha}"


