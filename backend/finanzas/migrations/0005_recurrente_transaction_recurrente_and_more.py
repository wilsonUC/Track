# Generated for recurrentes v1

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0004_presupuesto_transaction_presupuesto_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Recurrente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=120)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=12)),
                ('tipo', models.CharField(choices=[('income', 'Ingreso'), ('expense', 'Gasto')], max_length=10)),
                ('dia_pago', models.PositiveSmallIntegerField()),
                ('permite_parciales', models.BooleanField(default=False)),
                ('activo', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='recurrentes', to='finanzas.category')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recurrentes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['nombre'],
            },
        ),
        migrations.AddField(
            model_name='transaction',
            name='recurrente',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='transacciones', to='finanzas.recurrente'),
        ),
        migrations.RemoveConstraint(
            model_name='transaction',
            name='chk_transaction_origen',
        ),
        migrations.AddConstraint(
            model_name='recurrente',
            constraint=models.CheckConstraint(condition=models.Q(('monto__gt', 0)), name='chk_recurrente_monto_mayor_que_cero'),
        ),
        migrations.AddConstraint(
            model_name='recurrente',
            constraint=models.CheckConstraint(condition=models.Q(('dia_pago__gte', 1), ('dia_pago__lte', 31)), name='chk_recurrente_dia_pago_rango'),
        ),
        migrations.AddConstraint(
            model_name='transaction',
            constraint=models.CheckConstraint(
                condition=models.Q(
                    models.Q(('categoria__isnull', False), ('presupuesto__isnull', True), ('tipo', 'income')),
                    models.Q(('categoria__isnull', True), ('presupuesto__isnull', False), ('recurrente__isnull', True), ('tipo', 'expense')),
                    models.Q(('categoria__isnull', False), ('presupuesto__isnull', True), ('recurrente__isnull', True), ('tipo', 'expense')),
                    models.Q(('categoria__isnull', False), ('presupuesto__isnull', True), ('recurrente__isnull', False), ('tipo', 'expense')),
                    _connector='OR',
                ),
                name='chk_transaction_origen',
            ),
        ),
    ]
