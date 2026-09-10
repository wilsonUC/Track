import io
import uuid
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from PIL import Image, ImageOps


def foto_perfil_upload_to(instance, filename):
    unique_id = uuid.uuid4().hex[:8]
    return f"perfiles/user_{instance.usuario_id}_{unique_id}.webp"


def foto_original_upload_to(instance, filename):
    unique_id = uuid.uuid4().hex[:8]
    return f"perfiles/orig_user_{instance.usuario_id}_{unique_id}.webp"


def procesar_avatar_webp(imagen_file, target_size=(400, 400), quality=85):
    """Corrige rotación EXIF, recorta al centro y comprime en formato WebP."""
    img = Image.open(imagen_file)
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
    img = ImageOps.fit(img, target_size, Image.Resampling.LANCZOS)
    output = io.BytesIO()
    img.save(output, format="WEBP", quality=quality, optimize=True)
    output.seek(0)
    return ContentFile(output.read())


def procesar_imagen_original_webp(imagen_file, max_size=(1600, 1600), quality=90):
    """Corrige orientación EXIF y guarda la foto original completa (sin recortar) comprimida en WebP."""
    img = Image.open(imagen_file)
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    output = io.BytesIO()
    img.save(output, format="WEBP", quality=quality, optimize=True)
    output.seek(0)
    return ContentFile(output.read())


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
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
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
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
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


class RecurrenteAjusteMes(models.Model):
    """Monto personalizado para un recurrente en un mes específico (ej. 2026-07-01)."""

    recurrente = models.ForeignKey(
        Recurrente,
        on_delete=models.CASCADE,
        related_name="ajustes_mes",
    )
    mes = models.DateField(help_text="Primer día del mes del ajuste (YYYY-MM-01)")
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    permite_parciales = models.BooleanField(null=True, blank=True, default=None)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-mes"]
        verbose_name = "Ajuste mensual de recurrente"
        verbose_name_plural = "Ajustes mensuales de recurrentes"
        constraints = [
            models.UniqueConstraint(
                fields=["recurrente", "mes"],
                name="uniq_recurrente_ajuste_mes",
            ),
            models.CheckConstraint(
                condition=models.Q(monto__gt=0),
                name="chk_recurrente_ajuste_mes_monto_gt_zero",
            ),
        ]

    def __str__(self):
        return f"{self.recurrente.nombre} ({self.mes:%Y-%m}): S/ {self.monto}"


class MetaAhorro(models.Model):
    """Objetivo de ahorro del usuario (ej. fondo de emergencia)."""

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="metas",
    )
    nombre = models.CharField(max_length=120)
    monto_objetivo = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_limite = models.DateField(null=True, blank=True)
    monto_rapido = models.DecimalField(max_digits=12, decimal_places=2, default=100)
    categoria_referencia = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="metas_referencia",
    )
    es_asignacion_libre = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Meta de ahorro"
        verbose_name_plural = "Metas de ahorro"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(monto_objetivo__gt=0),
                name="chk_meta_monto_objetivo_mayor_que_cero",
            ),
            models.CheckConstraint(
                condition=models.Q(monto_rapido__gt=0),
                name="chk_meta_monto_rapido_mayor_que_cero",
            ),
        ]

    def __str__(self):
        return f"{self.nombre} (S/ {self.monto_objetivo})"


class Transaction(models.Model):
    """Movimiento de dinero: ingreso, gasto o ahorro hacia una meta."""

    class Tipo(models.TextChoices):
        INGRESO = "income", "Ingreso"
        GASTO = "expense", "Gasto"
        AHORRO = "saving", "Ahorro"

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
                    models.Q(
                        tipo="income",
                        presupuesto__isnull=True,
                        categoria__isnull=False,
                    )
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
                    | models.Q(
                        tipo="saving",
                        categoria__isnull=True,
                        presupuesto__isnull=True,
                        recurrente__isnull=True,
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

    class EstadoCuenta(models.TextChoices):
        PENDIENTE = "pending", "Pendiente"
        ACTIVA = "active", "Activa"
        BLOQUEADA = "blocked", "Bloqueada"

    class TipoCuenta(models.TextChoices):
        BASICO = "basico", "Básico"
        AVANZADO = "avanzado", "Avanzado"

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "perfil",
    )
    telefono = models.CharField(max_length=15, unique=True)
    estado_cuenta = models.CharField(
        max_length=10,
        choices=EstadoCuenta.choices,
        default=EstadoCuenta.ACTIVA,
    )
    tipo_cuenta = models.CharField(
        max_length=15,
        choices=TipoCuenta.choices,
        default=TipoCuenta.BASICO,
    )
    foto = models.ImageField(
        upload_to=foto_perfil_upload_to,
        null=True,
        blank=True,
        help_text="Foto de perfil recortada del usuario.",
    )
    foto_original = models.ImageField(
        upload_to=foto_original_upload_to,
        null=True,
        blank=True,
        help_text="Foto original completa sin recortar.",
    )
    fecha_expiracion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora límite de acceso. Null significa acceso permanente.",
    )

    @property
    def is_expired(self) -> bool:
        if not self.fecha_expiracion:
            return False
        from django.utils import timezone
        return timezone.now() > self.fecha_expiracion

    @property
    def dias_restantes(self) -> int | None:
        if not self.fecha_expiracion:
            return None
        from django.utils import timezone
        diff = self.fecha_expiracion - timezone.now()
        if diff.total_seconds() <= 0:
            return 0
        return diff.days

    def save(self, *args, **kwargs):
        # Si se actualiza el perfil y cambió la foto, eliminar el archivo físico antiguo del disco
        if self.pk:
            try:
                perfil_previo = PerfilUsuario.objects.get(pk=self.pk)
                if perfil_previo.foto and perfil_previo.foto != self.foto:
                    perfil_previo.foto.delete(save=False)
                if perfil_previo.foto_original and perfil_previo.foto_original != self.foto_original:
                    perfil_previo.foto_original.delete(save=False)
            except PerfilUsuario.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    class Meta: 
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuarios"

    def __str__(self):
        return f"{self.usuario.username} - {self.telefono}"


@receiver(post_delete, sender=PerfilUsuario)
def auto_delete_foto_on_perfil_delete(sender, instance, **kwargs):
    """Elimina los archivos físicos de fotos si se elimina el perfil de usuario."""
    if instance.foto:
        instance.foto.delete(save=False)
    if instance.foto_original:
        instance.foto_original.delete(save=False)


class PreferenciasUsuario(models.Model):
    """Preferencias de la app por usuario (configuración)."""

    class Tema(models.TextChoices):
        CLARO = "claro", "Claro"
        OSCURO = "oscuro", "Oscuro"
        SISTEMA = "sistema", "Sistema"

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="preferencias",
    )
    tema = models.CharField(
        max_length=10,
        choices=Tema.choices,
        default=Tema.CLARO,
    )
    vista_compacta = models.BooleanField(default=False)
    moneda = models.CharField(max_length=3, default="PEN")
    dia_inicio_mes = models.PositiveSmallIntegerField(default=1)
    mostrar_decimales = models.BooleanField(default=True)
    limitar_saldo_negativo = models.BooleanField(default=False)
    permitir_asignacion_directa_metas = models.BooleanField(default=False)
    descontar_ahorros_balance = models.BooleanField(default=False)
    actualizado_en = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name = "Preferencias de usuario"
        verbose_name_plural = "Preferencias de usuarios"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(dia_inicio_mes__gte=1, dia_inicio_mes__lte=28),
                name="chk_preferencias_dia_inicio_mes",
            ),
        ]

    def __str__(self):
        return f"Preferencias de {self.usuario.username}"


class ConsejoCache(models.Model):
    """Última generación de consejos IA por usuario (caché 24 h)."""

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consejo_cache",
    )
    puntaje = models.PositiveSmallIntegerField()
    resumen = models.TextField()
    consejos = models.JSONField()
    generado_en = models.DateTimeField()

    class Meta:
        verbose_name = "Caché de consejos"
        verbose_name_plural = "Cachés de consejos"

    def __str__(self):
        return f"Consejos de {self.usuario.username} ({self.generado_en:%Y-%m-%d %H:%M})"


class AsignacionMeta(models.Model):
    """Cuánto del ahorro acumulado del usuario está asignado a una meta.

    No mueve dinero: reparte el pool de ahorros (transacciones tipo saving)
    entre las metas. Una fila por meta; el monto sube al asignar y baja al desasignar.
    """

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="asignaciones_meta",
    )
    meta = models.OneToOneField(
        MetaAhorro,
        on_delete=models.CASCADE,
        related_name="asignacion",
    )
    monto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Asignación de meta"
        verbose_name_plural = "Asignaciones de metas"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(monto__gte=0),
                name="chk_asignacion_monto_no_negativo",
            ),
        ]

    def __str__(self):
        return f"{self.meta.nombre}: S/ {self.monto}"