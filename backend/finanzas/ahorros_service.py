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
