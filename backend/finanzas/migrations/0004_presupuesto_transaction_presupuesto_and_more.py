# Generated manually for presupuestos feature

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0003_remove_category_uniq_finanzas_category_usuario_nombre_tipo_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Presupuesto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=120)),
                ('limite', models.DecimalField(decimal_places=2, max_digits=12)),
                ('monto_rapido', models.DecimalField(decimal_places=2, default=30, max_digits=12)),
                ('activo', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('categoria_referencia', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='presupuestos_referencia', to='finanzas.category')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='presupuestos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['nombre'],
            },
        ),
        migrations.AddField(
            model_name='transaction',
            name='presupuesto',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='transacciones', to='finanzas.presupuesto'),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='categoria',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='transacciones', to='finanzas.category'),
        ),
        migrations.AddConstraint(
            model_name='presupuesto',
            constraint=models.CheckConstraint(condition=models.Q(('limite__gt', 0)), name='chk_presupuesto_limite_mayor_que_cero'),
        ),
        migrations.AddConstraint(
            model_name='presupuesto',
            constraint=models.CheckConstraint(condition=models.Q(('monto_rapido__gt', 0)), name='chk_presupuesto_monto_rapido_mayor_que_cero'),
        ),
        migrations.AddConstraint(
            model_name='transaction',
            constraint=models.CheckConstraint(condition=models.Q(models.Q(('categoria__isnull', False), ('presupuesto__isnull', True), ('tipo', 'expense')), models.Q(('categoria__isnull', True), ('presupuesto__isnull', False), ('tipo', 'expense')), models.Q(('categoria__isnull', False), ('presupuesto__isnull', True), ('tipo', 'income')), _connector='OR'), name='chk_transaction_origen'),
        ),
    ]
