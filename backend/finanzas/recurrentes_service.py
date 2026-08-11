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
    ultimo_dia = calendar.monthrange(reference.year, reference.month)[1]
    fin = reference.replace(day=ultimo_dia)
    return inicio, fin


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

    activo_en_mes = True
    estado_periodo = "activo"

    ref_inicio_mes = today.replace(day=1)

    if recurrente.fecha_inicio and ref_inicio_mes < recurrente.fecha_inicio.replace(day=1):
        activo_en_mes = False
        estado_periodo = "no_iniciado"

    if recurrente.fecha_fin and ref_inicio_mes > recurrente.fecha_fin.replace(day=1):
        activo_en_mes = False
        estado_periodo = "finalizado"

    # Si es un mes del futuro relativo al mes real actual, se bloquea el pago/cobro
    real_today = date.today()
    if activo_en_mes and ref_inicio_mes > real_today.replace(day=1):
        activo_en_mes = False
        estado_periodo = "futuro"

    # Calcular abonos de este mes
    from django.db.models import Sum
    from decimal import Decimal
    
    if hasattr(recurrente, "monto_pagado_anotado"):
        monto_pagado = recurrente.monto_pagado_anotado
    else:
        monto_pagado = Transaction.objects.filter(
            recurrente=recurrente,
            fecha__gte=inicio,
            fecha__lte=fin,
        ).aggregate(total=Sum("monto"))["total"]
        
    monto_pagado = Decimal(str(monto_pagado or 0))

    registrado_mes = monto_pagado >= recurrente.monto

    vencido = False
    mes_anterior_sin_registrar = None

    if activo_en_mes and not registrado_mes:
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
        if hasattr(recurrente, "registrado_mes_anterior"):
            registrado_anterior = recurrente.registrado_mes_anterior
        else:
            registrado_anterior = tiene_registro_en_rango(recurrente, prev_inicio, prev_fin)

        if creado <= prev_fin and not registrado_anterior:
            # Solo alertar si el mes anterior estaba dentro del periodo de vigencia
            mes_anterior_activo = True
            if recurrente.fecha_inicio and prev_fin < recurrente.fecha_inicio:
                mes_anterior_activo = False
            if recurrente.fecha_fin and prev_inicio > recurrente.fecha_fin:
                mes_anterior_activo = False
            
            if mes_anterior_activo:
                mes_anterior_sin_registrar = MESES_ES[prev_inicio.month - 1]

    return {
        "registrado_mes": registrado_mes if activo_en_mes else False,
        "vencido": vencido,
        "mes_anterior_sin_registrar": mes_anterior_sin_registrar,
        "activo_en_mes": activo_en_mes,
        "estado_periodo": estado_periodo,
        "monto_pagado": float(monto_pagado),
    }


def obtener_cuentas_atrasadas(usuario, reference: date | None = None) -> dict:
    from .models import Recurrente

    reference = reference or date.today()
    primer_dia_actual = reference.replace(day=1)

    deudas = []
    cobros = []

    recurrentes = Recurrente.objects.filter(usuario=usuario, activo=True).select_related("categoria")

    for r in recurrentes:
        creado = r.creado_en.date() if hasattr(r.creado_en, "date") else r.creado_en
        fecha_start = r.fecha_inicio if r.fecha_inicio else creado

        # Alinear iter_date al primer día de fecha_start
        iter_date = fecha_start.replace(day=1)

        while iter_date < primer_dia_actual:
            if r.fecha_fin and iter_date > r.fecha_fin.replace(day=1):
                break

            ultimo_dia = calendar.monthrange(iter_date.year, iter_date.month)[1]
            inicio_mes = iter_date
            fin_mes = iter_date.replace(day=ultimo_dia)

            registrado = Transaction.objects.filter(
                recurrente=r,
                fecha__gte=inicio_mes,
                fecha__lte=fin_mes,
            ).exists()

            if not registrado:
                mes_nombre = MESES_ES[iter_date.month - 1].capitalize()
                dia_vencimiento = dia_efectivo(r.dia_pago, iter_date)
                fecha_venc = iter_date.replace(day=dia_vencimiento)

                atraso_item = {
                    "id": f"{r.id}-{iter_date.strftime('%Y-%m')}",
                    "id_recurrente": r.id,
                    "nombre": r.nombre,
                    "categoria": r.categoria.nombre,
                    "mes_atraso": f"{mes_nombre} {iter_date.year}",
                    "fecha_pago": fecha_venc.strftime("%Y-%m-%d"),
                    "acumulado": float(r.monto),
                }

                if r.tipo == Transaction.Tipo.INGRESO:
                    cobros.append(atraso_item)
                else:
                    deudas.append(atraso_item)

            if iter_date.month == 12:
                iter_date = iter_date.replace(year=iter_date.year + 1, month=1)
            else:
                iter_date = iter_date.replace(month=iter_date.month + 1)

    total_pagar = sum(item["acumulado"] for item in deudas)
    total_cobrar = sum(item["acumulado"] for item in cobros)

    return {
        "total_pagar": total_pagar,
        "total_cobrar": total_cobrar,
        "deudas": deudas,
        "cobros": cobros,
    }
