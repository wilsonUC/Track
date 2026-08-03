"""Cálculos de metas de ahorro (acumulado, porcentaje, estado).

El acumulado de una meta ya no viene de transacciones: viene de cuánto
ahorro del pool está asignado a esa meta (modelo AsignacionMeta).
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from .models import AsignacionMeta


def calcular_acumulado(meta) -> Decimal:
    try:
        return meta.asignacion.monto
    except (AsignacionMeta.DoesNotExist, AttributeError):
        return Decimal("0")



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


def calcular_ahorro_sugerido(meta, reference: date | None = None) -> Decimal | None:
    """Calcula la cuota mensual sugerida de ahorro para cumplir la meta.

    Fórmula: (objetivo - acumulado) / meses_restantes.
    Si no hay fecha de inicio o fecha limite, retorna None.
    """
    today = reference or date.today()
    acumulado = calcular_acumulado(meta)
    restante = meta.monto_objetivo - acumulado

    if restante <= 0:
        return Decimal("0")

    if not meta.fecha_inicio or not meta.fecha_limite:
        return None

    # Si la fecha límite ya venció en el pasado, sugerir todo el monto restante
    if meta.fecha_limite < today:
        return restante

    # El cálculo empieza desde hoy, o desde fecha_inicio si es futura
    desde = max(today, meta.fecha_inicio)

    diff_anios = meta.fecha_limite.year - desde.year
    diff_meses = meta.fecha_limite.month - desde.month
    total_meses = diff_anios * 12 + diff_meses + 1

    if total_meses <= 0:
        total_meses = 1

    return restante / Decimal(str(total_meses))
