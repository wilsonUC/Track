"""Cálculos del pool de ahorros del usuario.

Modelo:
- Los ahorros se acumulan como transacciones tipo `saving` (sin meta).
- Cada `AsignacionMeta` reparte parte de ese total hacia una meta.
- Libre = total ahorrado - total asignado.
- Al apartar ahorro nuevo el tope es el saldo disponible histórico:
  (todos los ingresos - todos los gastos - todo lo ya ahorrado).
"""

from __future__ import annotations

from decimal import Decimal

from django.db.models import Sum

from .models import AsignacionMeta, Transaction


def _dec(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value or 0))


def total_ahorrado(user) -> Decimal:
    total = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO)
        .aggregate(total=Sum("monto"))["total"]
    )
    return _dec(total)


def total_asignado(user) -> Decimal:
    total = (
        AsignacionMeta.objects.filter(usuario=user)
        .aggregate(total=Sum("monto"))["total"]
    )
    return _dec(total)


def ahorro_libre(user) -> Decimal:
    return total_ahorrado(user) - total_asignado(user)


def saldo_disponible_total(user) -> Decimal:
    """Ingresos históricos - gastos históricos - ahorros ya apartados.

    Es el tope para apartar nuevos ahorros (balance total aún no guardado).
    """
    qs = Transaction.objects.filter(usuario=user)
    ingresos = _dec(qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(t=Sum("monto"))["t"])
    gastos = _dec(qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(t=Sum("monto"))["t"])
    ahorros = _dec(qs.filter(tipo=Transaction.Tipo.AHORRO).aggregate(t=Sum("monto"))["t"])
    disponible = ingresos - gastos - ahorros
    return disponible if disponible > 0 else Decimal("0")


# Alias de compatibilidad: el tope ya no es solo del mes.
def saldo_disponible_mes(user, reference=None) -> Decimal:  # noqa: ARG001
    return saldo_disponible_total(user)


def resumen_ahorros(user) -> dict:
    total = total_ahorrado(user)
    asignado = total_asignado(user)
    disponible = saldo_disponible_total(user)
    return {
        "total": total,
        "asignado": asignado,
        "libre": total - asignado,
        "disponible": disponible,
        # Compatibilidad con clientes que aún lean disponible_mes
        "disponible_mes": disponible,
    }


def validar_limite_saldo(user, tipo, monto, transaccion_id=None):
    """
    Si el usuario tiene activado 'limitar_saldo_negativo', valida que la transacción
    no deje el saldo neto en negativo ni lo empeore si ya era negativo.
    """
    from .models import PreferenciasUsuario, Transaction
    from django.db.models import Sum
    from rest_framework.exceptions import ValidationError

    preferencias, _ = PreferenciasUsuario.objects.get_or_create(usuario=user)
    if not preferencias.limitar_saldo_negativo:
        return

    # Ingresos siempre están permitidos (mejoran o mantienen el saldo)
    if tipo == Transaction.Tipo.INGRESO:
        return

    # Calcular el saldo neto actual (Ingresos - Gastos - Ahorros)
    qs = Transaction.objects.filter(usuario=user)
    ingresos = _dec(qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(t=Sum("monto"))["t"])
    gastos = _dec(qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(t=Sum("monto"))["t"])
    ahorros = _dec(qs.filter(tipo=Transaction.Tipo.AHORRO).aggregate(t=Sum("monto"))["t"])
    current_net_balance = ingresos - gastos - ahorros

    # Calcular saldo base excluyendo la transacción a modificar
    net_balance_without_original = current_net_balance
    if transaccion_id:
        try:
            original = Transaction.objects.get(pk=transaccion_id)
            if original.tipo == Transaction.Tipo.INGRESO:
                net_balance_without_original -= original.monto
            elif original.tipo in (Transaction.Tipo.GASTO, Transaction.Tipo.AHORRO):
                net_balance_without_original += original.monto
        except Transaction.DoesNotExist:
            pass

    # Calcular el saldo neto futuro
    future_balance = net_balance_without_original - _dec(monto)

    # Bloquear si el saldo futuro es negativo Y empeora el saldo actual
    if future_balance < 0 and future_balance < current_net_balance:
        raise ValidationError(
            f"No tienes suficiente saldo disponible. Tu saldo neto actual es S/ {current_net_balance:.2f}."
        )
