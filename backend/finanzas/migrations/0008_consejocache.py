from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("finanzas", "0007_metaahorro_transaction_saving"),
    ]

    operations = [
        migrations.CreateModel(
            name="ConsejoCache",
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
                ("puntaje", models.PositiveSmallIntegerField()),
                ("resumen", models.TextField()),
                ("consejos", models.JSONField()),
                ("generado_en", models.DateTimeField()),
                (
                    "usuario",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="consejo_cache",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Caché de consejos",
                "verbose_name_plural": "Cachés de consejos",
            },
        ),
    ]
