"""Cálculos de metas de ahorro (acumulado, porcentaje, estado)."""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from django.db.models import Sum

from .models import Transaction


def calcular_acumulado(meta) -> Decimal:
    total = Transaction.objects.filter(
        meta=meta,
        tipo=Transaction.Tipo.AHORRO,
    ).aggregate(total=Sum("monto"))["total"]
    return total if total is not None else Decimal("0")


def calcular_porcentaje(acumulado: Decimal, objetivo: Decimal) -> int:
    if objetivo <= 0:
        return 0
    return min(100, round(float(acumulado / objetivo * 100)))


def calcular_completada(acumulado: Decimal, objetivo: Decimal) -> bool:
    return objetivo > 0 and acumulado >= objetivo


def calcular_estado_meta(meta, reference: date | None = None) -> str:
    today = reference or date.today()
    acumulado = calcular_acumulado(meta)
    if calcular_completada(acumulado, meta.monto_objetivo):
        return "completada"
    if meta.fecha_limite and meta.fecha_limite < today:
        return "vencida"
    return "en_progreso"


def ultimo_aporte(meta):
    return (
        Transaction.objects.filter(meta=meta, tipo=Transaction.Tipo.AHORRO)
        .order_by("-fecha", "-creado_en", "-id")
        .first()
    )
