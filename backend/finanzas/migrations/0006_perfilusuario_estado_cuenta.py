from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("finanzas", "0005_recurrente_transaction_recurrente_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="perfilusuario",
            name="estado_cuenta",
            field=models.CharField(
                choices=[
                    ("pending", "Pendiente"),
                    ("active", "Activa"),
                    ("blocked", "Bloqueada"),
                ],
                default="active",
                max_length=10,
            ),
        ),
    ]
