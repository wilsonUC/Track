"""Cálculos de recurrentes (registro del mes, vencido, mes anterior)."""

from __future__ import annotations

import calendar
from datetime import date, timedelta

from .models import Transaction

MESES_ES = (
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
)


def dia_efectivo(dia_pago: int, reference: date) -> int:
    ultimo_dia = calendar.monthrange(reference.year, reference.month)[1]
    return min(dia_pago, ultimo_dia)


def fecha_vencimiento_mes(dia_pago: int, reference: date) -> date:
    return reference.replace(day=dia_efectivo(dia_pago, reference))


def _bounds_mes(reference: date) -> tuple[date, date]:
    inicio = reference.replace(day=1)
    return inicio, reference


def _bounds_mes_anterior(reference: date) -> tuple[date, date]:
    primer_dia = reference.replace(day=1)
    ultimo_anterior = primer_dia - timedelta(days=1)
    return ultimo_anterior.replace(day=1), ultimo_anterior


def tiene_registro_en_rango(recurrente, inicio: date, fin: date) -> bool:
    return Transaction.objects.filter(
        recurrente=recurrente,
        fecha__gte=inicio,
        fecha__lte=fin,
    ).exists()


def transacciones_mes_actual(recurrente, reference: date | None = None):
    today = reference or date.today()
    inicio, fin = _bounds_mes(today)
    return Transaction.objects.filter(
        recurrente=recurrente,
        fecha__gte=inicio,
        fecha__lte=fin,
    )


def calcular_estado_recurrente(recurrente, reference: date | None = None) -> dict:
    today = reference or date.today()
    inicio, fin = _bounds_mes(today)
    registrado_mes = tiene_registro_en_rango(recurrente, inicio, fin)

    vencido = False
    mes_anterior_sin_registrar = None

    if not registrado_mes:
        creado = (
            recurrente.creado_en.date()
            if hasattr(recurrente.creado_en, "date")
            else recurrente.creado_en
        )
        vencimiento = fecha_vencimiento_mes(recurrente.dia_pago, today)
        # Vencido: pasó el día de cobro/pago Y el recurrente ya existía para esa fecha
        if today > vencimiento and creado <= vencimiento:
            vencido = True
        prev_inicio, prev_fin = _bounds_mes_anterior(today)
        # Solo avisar si el recurrente ya existía el mes anterior (no recién creado)
        if (
            creado <= prev_fin
            and not tiene_registro_en_rango(recurrente, prev_inicio, prev_fin)
        ):
            mes_anterior_sin_registrar = MESES_ES[prev_inicio.month - 1]

    return {
        "registrado_mes": registrado_mes,
        "vencido": vencido,
        "mes_anterior_sin_registrar": mes_anterior_sin_registrar,
    }
