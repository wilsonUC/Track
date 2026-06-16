"""Cálculos de presupuestos (gastado del mes, estado, porcentaje)."""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from django.db.models import Sum

from .models import Transaction


def _month_bounds(reference: date | None = None) -> tuple[date, date]:
    today = reference or date.today()
    return today.replace(day=1), today


def calcular_gastado_mes(presupuesto, reference: date | None = None) -> Decimal:
    month_start, month_end = _month_bounds(reference)
    total = (
        Transaction.objects.filter(
            presupuesto=presupuesto,
            tipo=Transaction.Tipo.GASTO,
            fecha__gte=month_start,
            fecha__lte=month_end,
        ).aggregate(total=Sum("monto"))["total"]
    )
    return total if total is not None else Decimal("0")


def calcular_porcentaje(gastado: Decimal, limite: Decimal) -> int:
    if limite <= 0:
        return 0
    return round(float(gastado / limite * 100))


def calcular_estado(gastado: Decimal, limite: Decimal) -> str:
    if gastado > limite:
        return "excedido"
    if limite > 0 and gastado >= limite * Decimal("0.9"):
        return "alerta"
    return "ok"
