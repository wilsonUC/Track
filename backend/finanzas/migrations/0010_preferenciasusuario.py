from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("finanzas", "0009_ahorros_pool"),
    ]

    operations = [
        migrations.CreateModel(
            name="PreferenciasUsuario",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "tema",
                    models.CharField(
                        choices=[
                            ("claro", "Claro"),
                            ("oscuro", "Oscuro"),
                            ("sistema", "Sistema"),
                        ],
                        default="claro",
                        max_length=10,
                    ),
                ),
                ("vista_compacta", models.BooleanField(default=False)),
                ("moneda", models.CharField(default="PEN", max_length=3)),
                ("dia_inicio_mes", models.PositiveSmallIntegerField(default=1)),
                ("mostrar_decimales", models.BooleanField(default=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                (
                    "usuario",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="preferencias",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Preferencias de usuario",
                "verbose_name_plural": "Preferencias de usuarios",
            },
        ),
        migrations.AddConstraint(
            model_name="preferenciasusuario",
            constraint=models.CheckConstraint(
                condition=models.Q(
                    ("dia_inicio_mes__gte", 1),
                    ("dia_inicio_mes__lte", 28),
                ),
                name="chk_preferencias_dia_inicio_mes",
            ),
        ),
    ]
