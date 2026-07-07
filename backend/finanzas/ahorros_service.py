"""Cálculos del pool de ahorros del usuario.

Modelo:
- Los ahorros se acumulan como transacciones tipo `saving` (sin meta).
- Cada `AsignacionMeta` reparte parte de ese total hacia una meta.
- Libre = total ahorrado - total asignado.
- Al apartar ahorro nuevo el tope es el saldo disponible del período
  (ingresos - gastos - ahorros ya apartados en ese período).
"""

from __future__ import annotations

from datetime import date
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


def saldo_disponible_periodo(user, inicio: date, fin: date) -> Decimal:
    """Ingresos - Gastos - Ahorros ya apartados dentro del período dado."""
    qs = Transaction.objects.filter(usuario=user, fecha__gte=inicio, fecha__lte=fin)
    ingresos = _dec(qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(t=Sum("monto"))["t"])
    gastos = _dec(qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(t=Sum("monto"))["t"])
    ahorros = _dec(qs.filter(tipo=Transaction.Tipo.AHORRO).aggregate(t=Sum("monto"))["t"])
    return ingresos - gastos - ahorros


def saldo_disponible_mes(user, reference: date | None = None) -> Decimal:
    today = reference or date.today()
    inicio = today.replace(day=1)
    return saldo_disponible_periodo(user, inicio, today)


def resumen_ahorros(user) -> dict:
    total = total_ahorrado(user)
    asignado = total_asignado(user)
    return {
        "total": total,
        "asignado": asignado,
        "libre": total - asignado,
        "disponible_mes": saldo_disponible_mes(user),
    }
