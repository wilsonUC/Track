from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def borrar_savings_viejos(apps, schema_editor):
    """Reset del modelo viejo: los aportes saving iban ligados a meta.

    Se eliminan para poder quitar el campo `meta` y estrenar el pool de ahorros.
    """
    Transaction = apps.get_model("finanzas", "Transaction")
    Transaction.objects.filter(tipo="saving").delete()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("finanzas", "0008_consejocache"),
    ]

    operations = [
        migrations.RunPython(borrar_savings_viejos, noop),
        migrations.RemoveConstraint(
            model_name="transaction",
            name="chk_transaction_origen",
        ),
        migrations.RemoveField(
            model_name="transaction",
            name="meta",
        ),
        migrations.AddConstraint(
            model_name="transaction",
            constraint=models.CheckConstraint(
                condition=models.Q(
                    models.Q(
                        ("categoria__isnull", False),
                        ("presupuesto__isnull", True),
                        ("tipo", "income"),
                    ),
                    models.Q(
                        ("categoria__isnull", True),
                        ("presupuesto__isnull", False),
                        ("recurrente__isnull", True),
                        ("tipo", "expense"),
                    ),
                    models.Q(
                        ("categoria__isnull", False),
                        ("presupuesto__isnull", True),
                        ("recurrente__isnull", True),
                        ("tipo", "expense"),
                    ),
                    models.Q(
                        ("categoria__isnull", False),
                        ("presupuesto__isnull", True),
                        ("recurrente__isnull", False),
                        ("tipo", "expense"),
                    ),
                    models.Q(
                        ("categoria__isnull", True),
                        ("presupuesto__isnull", True),
                        ("recurrente__isnull", True),
                        ("tipo", "saving"),
                    ),
                    _connector="OR",
                ),
                name="chk_transaction_origen",
            ),
        ),
        migrations.CreateModel(
            name="AsignacionMeta",
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
                ("monto", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                (
                    "meta",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="asignacion",
                        to="finanzas.metaahorro",
                    ),
                ),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="asignaciones_meta",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Asignación de meta",
                "verbose_name_plural": "Asignaciones de metas",
            },
        ),
        migrations.AddConstraint(
            model_name="asignacionmeta",
            constraint=models.CheckConstraint(
                condition=models.Q(("monto__gte", 0)),
                name="chk_asignacion_monto_no_negativo",
            ),
        ),
    ]
