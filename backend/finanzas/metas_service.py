"""Cálculos de metas de ahorro (acumulado, porcentaje, estado).

El acumulado de una meta ya no viene de transacciones: viene de cuánto
ahorro del pool está asignado a esa meta (modelo AsignacionMeta).
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from .models import AsignacionMeta


def calcular_acumulado(meta) -> Decimal:
    asignacion = AsignacionMeta.objects.filter(meta=meta).first()
    if asignacion is None:
        return Decimal("0")
    return asignacion.monto


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
