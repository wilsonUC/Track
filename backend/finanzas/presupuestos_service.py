"""Cálculos de presupuestos (gastado del mes, estado, porcentaje)."""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from django.db.models import Sum

from .models import Transaction


import calendar


def _month_bounds(reference: date | None = None) -> tuple[date, date]:
    ref = reference or date.today()
    ultimo_dia = calendar.monthrange(ref.year, ref.month)[1]
    return ref.replace(day=1), ref.replace(day=ultimo_dia)


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


def calcular_estado_periodo(presupuesto, reference: date | None = None) -> dict:
    today = reference or date.today()
    activo_en_mes = True
    estado_periodo = "activo"

    ref_inicio_mes = today.replace(day=1)

    # Si no tiene fecha_inicio explícita, su fecha de inicio efectiva es el mes en que fue creado
    fecha_inicio_efectiva = presupuesto.fecha_inicio
    if not fecha_inicio_efectiva and presupuesto.creado_en:
        creado_date = (
            presupuesto.creado_en.date()
            if hasattr(presupuesto.creado_en, "date")
            else presupuesto.creado_en
        )
        fecha_inicio_efectiva = creado_date.replace(day=1)

    if fecha_inicio_efectiva and ref_inicio_mes < fecha_inicio_efectiva.replace(day=1):
        activo_en_mes = False
        estado_periodo = "no_iniciado"

    if presupuesto.fecha_fin and ref_inicio_mes > presupuesto.fecha_fin.replace(day=1):
        activo_en_mes = False
        estado_periodo = "finalizado"

    real_today = date.today()
    if activo_en_mes and ref_inicio_mes > real_today.replace(day=1):
        estado_periodo = "futuro"

    return {
        "activo_en_mes": activo_en_mes,
        "estado_periodo": estado_periodo,
    }

