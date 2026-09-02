"""Integración con Groq para el asistente de finanzas."""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from datetime import date, timedelta
from decimal import Decimal

from django.conf import settings
from django.db.models import DecimalField, Q, Sum
from django.db.models.functions import Coalesce

from .models import MetaAhorro, Presupuesto, Recurrente, Transaction

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-20b"
MAX_HISTORY = 10
MAX_RECENT_TX = 25


def _decimal(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value or 0))


def build_financial_context(user) -> str:
    today = date.today()
    yesterday = today - timedelta(days=1)
    month_start = today.replace(day=1)
    week_start = today - timedelta(days=today.weekday())

    # --- 1. Balance Total Histórico (All-Time) ---
    all_time_qs = Transaction.objects.filter(usuario=user)
    total_income_all = _decimal(
        all_time_qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(total=Sum("monto"))["total"]
    )
    total_expense_all = _decimal(
        all_time_qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(total=Sum("monto"))["total"]
    )
    total_balance_all = total_income_all - total_expense_all

    # --- 2. Movimientos de Hoy ---
    today_income = _decimal(
        Transaction.objects.filter(
            usuario=user, fecha=today, tipo=Transaction.Tipo.INGRESO
        ).aggregate(total=Sum("monto"))["total"]
    )
    today_expense = _decimal(
        Transaction.objects.filter(
            usuario=user, fecha=today, tipo=Transaction.Tipo.GASTO
        ).aggregate(total=Sum("monto"))["total"]
    )
    today_balance = today_income - today_expense

    # --- 3. Movimientos de Ayer ---
    yesterday_income = _decimal(
        Transaction.objects.filter(
            usuario=user, fecha=yesterday, tipo=Transaction.Tipo.INGRESO
        ).aggregate(total=Sum("monto"))["total"]
    )
    yesterday_expense = _decimal(
        Transaction.objects.filter(
            usuario=user, fecha=yesterday, tipo=Transaction.Tipo.GASTO
        ).aggregate(total=Sum("monto"))["total"]
    )
    yesterday_balance = yesterday_income - yesterday_expense

    # --- 4. Movimientos de la Semana Actual ---
    week_qs = Transaction.objects.filter(
        usuario=user,
        fecha__gte=week_start,
        fecha__lte=today,
    )
    week_income = _decimal(
        week_qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(total=Sum("monto"))["total"]
    )
    week_expense = _decimal(
        week_qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(total=Sum("monto"))["total"]
    )
    week_balance = week_income - week_expense

    # --- 5. Movimientos del Mes Actual ---
    month_qs = Transaction.objects.filter(
        usuario=user,
        fecha__gte=month_start,
        fecha__lte=today,
    )
    month_income = _decimal(
        month_qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(total=Sum("monto"))["total"]
    )
    month_expense = _decimal(
        month_qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(total=Sum("monto"))["total"]
    )
    saving_mes = _decimal(
        month_qs.filter(tipo=Transaction.Tipo.AHORRO).aggregate(total=Sum("monto"))["total"]
    )
    month_balance = month_income - month_expense

    # Desglose de Gastos e Ingresos por Categoría (Mes Actual)
    gastos_por_cat_mes = (
        month_qs.filter(tipo=Transaction.Tipo.GASTO)
        .values("categoria__nombre")
        .annotate(total=Sum("monto"))
        .order_by("-total")
    )
    ingresos_por_cat_mes = (
        month_qs.filter(tipo=Transaction.Tipo.INGRESO)
        .values("categoria__nombre")
        .annotate(total=Sum("monto"))
        .order_by("-total")
    )

    # Desglose de Ingresos y Gastos por Categoría (Histórico Total)
    ingresos_por_cat_total = (
        all_time_qs.filter(tipo=Transaction.Tipo.INGRESO)
        .values("categoria__nombre")
        .annotate(total=Sum("monto"))
        .order_by("-total")
    )
    gastos_por_cat_total = (
        all_time_qs.filter(tipo=Transaction.Tipo.GASTO)
        .values("categoria__nombre")
        .annotate(total=Sum("monto"))
        .order_by("-total")
    )

    is_avanzado = bool(
        user.is_staff
        or user.is_superuser
        or (hasattr(user, "perfil") and user.perfil.tipo_cuenta == "avanzado")
    )

    total_ahorro = Decimal("0")
    asignado = Decimal("0")
    libre = Decimal("0")
    disponible_para_apartar = Decimal("0")
    savings_qs = []
    gastos_fijos_pendientes = Decimal("0")
    gastos_fijos_pagados = Decimal("0")
    gastos_fijos_total = Decimal("0")
    ingresos_fijos_pendientes = Decimal("0")
    ingresos_fijos_cobrados = Decimal("0")
    ingresos_fijos_total = Decimal("0")
    recurrentes_info = []
    cuentas_atrasadas_data = {}
    presupuestos = []
    metas = []

    # --- 6. Pool de Ahorros (Disponible para todos los usuarios) ---
    from .ahorros_service import ahorro_libre, saldo_disponible_total, total_ahorrado, total_asignado

    total_ahorro = total_ahorrado(user)
    asignado = total_asignado(user)
    libre = total_ahorro - asignado
    if libre < Decimal("0"):
        libre = Decimal("0")
    disponible_para_apartar = saldo_disponible_total(user)

    savings_qs = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO)
        .order_by("-fecha", "-creado_en")[:25]
    )

    # --- 7. Presupuestos Activos (Disponible para todos los usuarios) ---
    import calendar
    if today.month == 1:
        prev_month_start = today.replace(year=today.year - 1, month=12, day=1)
        prev_month_end = today.replace(year=today.year - 1, month=12, day=31)
    else:
        prev_m = today.month - 1
        _, last_d = calendar.monthrange(today.year, prev_m)
        prev_month_start = today.replace(month=prev_m, day=1)
        prev_month_end = today.replace(month=prev_m, day=last_d)

    presupuestos = (
        Presupuesto.objects.filter(usuario=user, activo=True)
        .select_related("categoria_referencia")
        .annotate(
            gastado=Coalesce(
                Sum(
                    "transacciones__monto",
                    filter=Q(
                        transacciones__tipo=Transaction.Tipo.GASTO,
                        transacciones__fecha__gte=month_start,
                        transacciones__fecha__lte=today,
                    ),
                ),
                Decimal("0"),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            gastado_mes_anterior=Coalesce(
                Sum(
                    "transacciones__monto",
                    filter=Q(
                        transacciones__tipo=Transaction.Tipo.GASTO,
                        transacciones__fecha__gte=prev_month_start,
                        transacciones__fecha__lte=prev_month_end,
                    ),
                ),
                Decimal("0"),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
        )
        .order_by("nombre")
    )

    # --- 8. Recurrentes y Metas (Exclusivo Plan Avanzado) ---
    if is_avanzado:
        recurrentes = Recurrente.objects.filter(usuario=user, activo=True).select_related("categoria")
        from .recurrentes_service import calcular_estado_recurrente, obtener_cuentas_atrasadas

        for r in recurrentes:
            estado = calcular_estado_recurrente(r, today)
            tipo = "Ingreso" if r.tipo == Transaction.Tipo.INGRESO else "Gasto"
            cat_nombre = r.categoria.nombre if r.categoria else "Sin categoría"
            monto_pagado_dec = Decimal(str(estado.get("monto_pagado", 0)))

            if estado["activo_en_mes"]:
                if r.tipo == Transaction.Tipo.GASTO:
                    gastos_fijos_total += r.monto
                    gastos_fijos_pagados += min(r.monto, monto_pagado_dec)
                    if not estado["registrado_mes"]:
                        gastos_fijos_pendientes += max(Decimal("0"), r.monto - monto_pagado_dec)
                else:
                    ingresos_fijos_total += r.monto
                    ingresos_fijos_cobrados += min(r.monto, monto_pagado_dec)
                    if not estado["registrado_mes"]:
                        ingresos_fijos_pendientes += max(Decimal("0"), r.monto - monto_pagado_dec)

            if estado["registrado_mes"]:
                situacion = "REGISTRADO/PAGADO"
            elif estado["vencido"]:
                situacion = "VENCIDO (PAGO PENDIENTE)"
            elif estado["activo_en_mes"]:
                situacion = "PENDIENTE"
            else:
                situacion = f"FUERA DE MES ({estado.get('estado_periodo', 'inactivo')})"

            # Rango de vigencia
            if r.fecha_inicio and r.fecha_fin:
                rango_str = f"del {r.fecha_inicio.strftime('%Y-%m-%d')} al {r.fecha_fin.strftime('%Y-%m-%d')}"
            elif r.fecha_inicio:
                rango_str = f"desde {r.fecha_inicio.strftime('%Y-%m-%d')} (permanente/sin fecha fin)"
            elif r.fecha_fin:
                rango_str = f"hasta {r.fecha_fin.strftime('%Y-%m-%d')}"
            else:
                rango_str = "período indefinido (todos los meses)"

            abono_info = f" (Abonado: S/ {monto_pagado_dec:.2f} de S/ {r.monto:.2f})" if (r.permite_parciales and monto_pagado_dec > 0 and not estado["registrado_mes"]) else ""

            recurrentes_info.append(
                f"- [{tipo} Fijo] '{r.nombre}' | Categoría: {cat_nombre} | Monto: S/ {r.monto:.2f}/mes | "
                f"Día de pago/cobro: {r.dia_pago} de cada mes | Período de vigencia: {rango_str} | "
                f"Estado en el mes actual ({today.strftime('%B %Y')}): {situacion}{abono_info}"
            )

        # Cuentas atrasadas de meses previos
        cuentas_atrasadas_data = obtener_cuentas_atrasadas(user, today)

        # Metas de Ahorro Activas
        metas = (
            MetaAhorro.objects.filter(usuario=user, activo=True)
            .select_related("asignacion", "categoria_referencia")
            .order_by("nombre")
        )

    # --- 10. Historial de Transacciones Separado por Tipo ---
    incomes_qs = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.INGRESO)
        .select_related("categoria", "recurrente")
        .order_by("-fecha", "-creado_en")[:35]
    )
    expenses_qs = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.GASTO)
        .select_related("categoria", "presupuesto", "recurrente")
        .order_by("-fecha", "-creado_en")[:35]
    )
    total_income_count = Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.INGRESO).count()
    total_expense_count = Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.GASTO).count()

    # --- Construcción del Texto de Contexto ---
    lines = [
        f"Usuario: {user.first_name or user.username}",
        f"Fecha actual del sistema: {today.strftime('%Y-%m-%d')} ({today.strftime('%A, %d de %B %Y')})",
        "",
        "=== 1. RESUMEN GENERAL Y BALANCES (DASHBOARD) ===",
        "Balance Total Histórico (Acumulado en cuenta de todos los tiempos):",
        f"- Ingresos históricos totales: S/ {total_income_all:.2f} ({total_income_count} movimientos)",
        f"- Gastos históricos totales: S/ {total_expense_all:.2f} ({total_expense_count} movimientos)",
        f"- Balance Total en cuenta: S/ {total_balance_all:.2f}",
        "",
        "Distribución de Ingresos por Categoría (Histórico Total):",
    ]

    if not ingresos_por_cat_total:
        lines.append("- Sin ingresos registrados.")
    else:
        for ic in ingresos_por_cat_total:
            cat = ic["categoria__nombre"] or "Ingreso general"
            monto_cat = _decimal(ic["total"])
            pct_cat = round(float(monto_cat / total_income_all * 100)) if total_income_all > 0 else 0
            lines.append(f"- {cat}: S/ {monto_cat:.2f} ({pct_cat}%)")

    lines.extend([
        "",
        "Distribución de Gastos por Categoría (Histórico Total):",
    ])

    if not gastos_por_cat_total:
        lines.append("- Sin gastos registrados.")
    else:
        for gc in gastos_por_cat_total:
            cat = gc["categoria__nombre"] or "Sin categoría"
            monto_cat = _decimal(gc["total"])
            pct_cat = round(float(monto_cat / total_expense_all * 100)) if total_expense_all > 0 else 0
            lines.append(f"- {cat}: S/ {monto_cat:.2f} ({pct_cat}%)")

    lines.extend([
        "",
        f"Movimientos de HOY ({today.strftime('%d/%m/%Y')}):",
        f"- Ingresos hoy: S/ {today_income:.2f}",
        f"- Gastos hoy: S/ {today_expense:.2f}",
        f"- Balance neto de hoy: S/ {today_balance:.2f}",
        "",
        f"Movimientos de AYER ({yesterday.strftime('%d/%m/%Y')}):",
        f"- Ingresos ayer: S/ {yesterday_income:.2f}",
        f"- Gastos ayer: S/ {yesterday_expense:.2f}",
        f"- Balance neto de ayer: S/ {yesterday_balance:.2f}",
        "",
        f"Movimientos de esta SEMANA (desde {week_start.strftime('%d/%m/%Y')}):",
        f"- Ingresos semana: S/ {week_income:.2f}",
        f"- Gastos semana: S/ {week_expense:.2f}",
        f"- Balance semana: S/ {week_balance:.2f}",
        "",
        f"Movimientos del MES ACTUAL ({month_start.strftime('%B %Y')}):",
        f"- Ingresos del mes: S/ {month_income:.2f}",
        f"- Gastos del mes: S/ {month_expense:.2f}",
        f"- Balance neto del mes: S/ {month_balance:.2f}",
    ])

    if is_avanzado:
        lines.append(f"- Ahorros apartados este mes: S/ {saving_mes:.2f}")
        lines.extend([
            "",
            "Compromisos Fijos del Mes (Dashboard):",
            f"- Gastos fijos pendientes por pagar: -S/ {gastos_fijos_pendientes:.2f}",
            f"- Ingresos fijos pendientes por cobrar: +S/ {ingresos_fijos_pendientes:.2f}",
        ])

    lines.extend([
        "",
        "Distribución de Gastos por Categoría en el Mes Actual:",
    ])

    if not gastos_por_cat_mes:
        lines.append("- Sin gastos registrados en el mes.")
    else:
        for gc in gastos_por_cat_mes:
            cat = gc["categoria__nombre"] or "Sin categoría"
            monto_cat = _decimal(gc["total"])
            pct_cat = round(float(monto_cat / month_expense * 100)) if month_expense > 0 else 0
            lines.append(f"- {cat}: S/ {monto_cat:.2f} ({pct_cat}%)")

    lines.extend([
        "",
        "Distribución de Ingresos por Categoría en el Mes Actual:",
    ])

    if not ingresos_por_cat_mes:
        lines.append("- Sin ingresos registrados en el mes.")
    else:
        for ic in ingresos_por_cat_mes:
            cat = ic["categoria__nombre"] or "Ingreso general"
            monto_cat = _decimal(ic["total"])
            pct_cat = round(float(monto_cat / month_income * 100)) if month_income > 0 else 0
            lines.append(f"- {cat}: S/ {monto_cat:.2f} ({pct_cat}%)")

    # === 2. FONDO Y POOL DE AHORROS (Disponible para Básico y Avanzado) ===
    ahorros_header = [
        "",
        "=== 2. FONDO Y POOL DE AHORROS ===",
        f"- Total Ahorrado acumulado en el fondo: S/ {total_ahorro:.2f}",
    ]
    if is_avanzado:
        ahorros_header.extend([
            f"- Ahorro Libre (disponible en el pozo sin asignar a metas): S/ {libre:.2f}",
            f"- Asignado a metas de ahorro vinculadas: S/ {asignado:.2f}",
        ])
    ahorros_header.extend([
        f"- Saldo disponible en cuenta para apartar NUEVO ahorro: S/ {disponible_para_apartar:.2f} (tope de liquidez aún no guardada)",
        "",
        "Historial de Ahorros Registrados:",
    ])
    lines.extend(ahorros_header)

    if not savings_qs:
        lines.append("- Sin movimientos de ahorro apartados.")
    else:
        for tx in savings_qs:
            desc = tx.descripcion.strip() or "Ahorro"
            lines.append(f"- Fecha: {tx.fecha} | Monto: S/ {tx.monto:.2f} | Descripción: {desc}")

    # === RECURRENTES (Solo Avanzado) ===
    if is_avanzado:
        lines.extend([
            "",
            "=== 3. RECURRENTES (INGRESOS Y GASTOS FIJOS) ===",
            f"Compromisos Fijos del Mes Actual ({today.strftime('%B %Y')}):",
            f"- Gastos fijos del mes: S/ {gastos_fijos_total:.2f} (Pagados: S/ {gastos_fijos_pagados:.2f} | Pendientes por pagar: S/ {gastos_fijos_pendientes:.2f})",
            f"- Ingresos fijos del mes: S/ {ingresos_fijos_total:.2f} (Cobrados: S/ {ingresos_fijos_cobrados:.2f} | Pendientes por cobrar: S/ {ingresos_fijos_pendientes:.2f})",
        ])

        if cuentas_atrasadas_data.get("deudas") or cuentas_atrasadas_data.get("cobros"):
            lines.append("")
            lines.append(
                f"Resumen de Cuentas Atrasadas de Meses Anteriores: Total Deudas vencidas por pagar: S/ {cuentas_atrasadas_data.get('total_pagar', 0):.2f} | "
                f"Total Cobros vencidos por cobrar: S/ {cuentas_atrasadas_data.get('total_cobrar', 0):.2f}"
            )
            lines.append("Detalle de Cuentas Atrasadas:")
            for d in cuentas_atrasadas_data.get("deudas", []):
                lines.append(f"- Concepto: '{d['nombre']}' | Tipo: Deuda pendiente | Categoría: {d['categoria']} | Monto: S/ {d['acumulado']:.2f} | Mes adeudado: {d['mes_atraso']} | Venció el: {d['fecha_pago']}")
            for c in cuentas_atrasadas_data.get("cobros", []):
                lines.append(f"- Concepto: '{c['nombre']}' | Tipo: Cobro pendiente | Categoría: {c['categoria']} | Monto: S/ {c['acumulado']:.2f} | Mes adeudado: {c['mes_atraso']} | Venció el: {c['fecha_pago']}")

        lines.append("")
        lines.append("Detalle de Recurrentes Configurados (con períodos de vigencia para consultas por mes):")

        if not recurrentes_info:
            lines.append("- Sin recurrentes configurados.")
        else:
            lines.extend(recurrentes_info)

    # === PRESUPUESTOS (Disponible para Básico y Avanzado) ===
    sec_presupuestos = "4" if is_avanzado else "3"
    lines.extend(["", f"=== {sec_presupuestos}. PRESUPUESTOS (CONTROL Y LÍMITES MENSUALES) ==="])

    if not presupuestos:
        lines.append("- Sin presupuestos configurados.")
    else:
        from .presupuestos_service import calcular_estado, calcular_porcentaje

        total_limite_presupuestos = sum((p.limite for p in presupuestos), Decimal("0"))
        total_gastado_presupuestos = sum((p.gastado for p in presupuestos), Decimal("0"))
        pct_global_presupuestos = (
            round(float(total_gastado_presupuestos / total_limite_presupuestos * 100))
            if total_limite_presupuestos > 0
            else 0
        )
        margen_global_presupuestos = max(Decimal("0"), total_limite_presupuestos - total_gastado_presupuestos)

        lines.append(
            f"Resumen Global de Presupuestos este mes ({today.strftime('%B %Y')}): "
            f"Consumido S/ {total_gastado_presupuestos:.2f} / Límite Total S/ {total_limite_presupuestos:.2f} "
            f"({pct_global_presupuestos}% de uso global | Margen restante total: S/ {margen_global_presupuestos:.2f})"
        )
        lines.append("")
        lines.append("Detalle por Presupuesto:")

        for p in presupuestos:
            gastado = p.gastado
            pct = calcular_porcentaje(gastado, p.limite)
            estado = calcular_estado(gastado, p.limite)
            restante = max(Decimal("0"), p.limite - gastado)
            cat = p.categoria_referencia.nombre if p.categoria_referencia else "General"
            prev_info = f" (Mes anterior consumió: S/ {p.gastado_mes_anterior:.2f})" if p.gastado_mes_anterior > 0 else ""

            lines.append(
                f"- {p.nombre} ({cat}): Consumido este mes S/ {gastado:.2f} / Límite S/ {p.limite:.2f} "
                f"({pct}%, estado: {estado.upper()}, margen restante: S/ {restante:.2f}){prev_info}"
            )

            txs_p = (
                Transaction.objects.filter(usuario=user, presupuesto=p, tipo=Transaction.Tipo.GASTO)
                .order_by("-fecha", "-creado_en")[:8]
            )
            if txs_p:
                for tx in txs_p:
                    desc_tx = tx.descripcion.strip() or "Consumo registrado"
                    lines.append(f"  * Consumo registrado: {tx.fecha} | S/ {tx.monto:.2f} | {desc_tx}")

    # === METAS DE AHORRO (Solo Avanzado) ===
    if is_avanzado:
        lines.extend(["", "=== 5. METAS DE AHORRO (OBJETIVOS FINANCIEROS) ==="])

        if not metas:
            lines.append("- Sin metas configuradas.")
        else:
            from .metas_service import (
                calcular_acumulado,
                calcular_ahorro_sugerido,
                calcular_estado_meta,
                calcular_porcentaje,
            )

            total_obj_metas = sum((m.monto_objetivo for m in metas), Decimal("0"))
            total_acum_metas = sum((m.acumulado for m in metas), Decimal("0"))
            pct_global_metas = (
                round(float(total_acum_metas / total_obj_metas * 100)) if total_obj_metas > 0 else 0
            )
            lines.append(
                f"Resumen Global de Metas: Acumulado S/ {total_acum_metas:.2f} / Objetivo Total S/ {total_obj_metas:.2f} "
                f"({pct_global_metas}% alcanzado global)"
            )
            lines.append("")
            lines.append("Detalle por Meta:")

            for meta in metas:
                acumulado = meta.acumulado
                pct = calcular_porcentaje(acumulado, meta.monto_objetivo)
                estado = calcular_estado_meta(acumulado, meta.monto_objetivo)
                faltante = max(Decimal("0"), meta.monto_objetivo - acumulado)
                cat_ref = meta.categoria_referencia.nombre if meta.categoria_referencia else "General"
                modo_str = "Libre" if meta.es_asignacion_libre else "Vinculada"

                sugerido = calcular_ahorro_sugerido(meta)
                sugerido_str = f" | Ahorro sugerido/mes: S/ {sugerido:.2f}" if sugerido is not None else ""

                if meta.fecha_inicio and meta.fecha_limite:
                    fechas_str = f"del {meta.fecha_inicio.strftime('%Y-%m-%d')} al {meta.fecha_limite.strftime('%Y-%m-%d')}"
                elif meta.fecha_limite:
                    fechas_str = f"límite {meta.fecha_limite.strftime('%Y-%m-%d')}"
                elif meta.fecha_inicio:
                    fechas_str = f"inicio {meta.fecha_inicio.strftime('%Y-%m-%d')}"
                else:
                    fechas_str = "sin fechas definidas"

                lines.append(
                    f"- Meta: '{meta.nombre}' | Categoría: {cat_ref} | Modo: {modo_str} | "
                    f"Acumulado: S/ {acumulado:.2f} / Objetivo: S/ {meta.monto_objetivo:.2f} "
                    f"({pct}%, faltante: S/ {faltante:.2f}, estado: {estado.upper()} | Período: {fechas_str}{sugerido_str})"
                )

    sec_ingresos = "6" if is_avanzado else "4"
    sec_gastos = "7" if is_avanzado else "5"

    lines.extend(["", f"=== {sec_ingresos}. HISTORIAL DE INGRESOS REGISTRADOS (TOTAL: S/ {total_income_all:.2f} EN {total_income_count} MOVIMIENTOS) ==="])

    if not incomes_qs:
        lines.append("- Sin ingresos registrados.")
    else:
        for tx in incomes_qs:
            desc = tx.descripcion.strip() or "Sin descripción"
            origen = tx.categoria.nombre if tx.categoria_id else "Sin categoría"
            lines.append(f"- Fecha: {tx.fecha} | Categoría: {origen} | Monto: S/ {tx.monto:.2f} | Descripción: {desc}")

    lines.extend(["", f"=== {sec_gastos}. HISTORIAL DE GASTOS REGISTRADOS (TOTAL: S/ {total_expense_all:.2f} EN {total_expense_count} MOVIMIENTOS) ==="])

    if not expenses_qs:
        lines.append("- Sin gastos registrados.")
    else:
        for tx in expenses_qs:
            desc = tx.descripcion.strip() or "Sin descripción"
            if tx.presupuesto_id:
                origen = f"Presupuesto: {tx.presupuesto.nombre}"
            elif tx.recurrente_id:
                origen = f"Recurrente: {tx.recurrente.nombre}"
            else:
                origen = tx.categoria.nombre if tx.categoria_id else "Sin categoría"
            lines.append(f"- Fecha: {tx.fecha} | Categoría/Origen: {origen} | Monto: S/ {tx.monto:.2f} | Descripción: {desc}")

    return "\n".join(lines)


def _system_prompt(context: str, is_avanzado: bool = True) -> str:
    tier_instructions = ""
    if not is_avanzado:
        tier_instructions = (
            "NIVEL DE CUENTA DEL USUARIO: PLAN BÁSICO.\n"
            "El usuario posee una cuenta Básica en FinanzasTrack. Su plan incluye: Dashboard, Ingresos, Gastos, Presupuestos, Ahorros y Reportes.\n"
            "REGLAS CRÍTICAS PARA CUENTA BÁSICA:\n"
            "1. NO TIENE ACCESO a las siguientes funciones avanzadas: Recurrentes (ingresos/gastos fijos) ni Metas de Ahorro.\n"
            "2. NUNCA le sugieras acceder, crear o configurar elementos en las secciones de 'Recurrentes' ni 'Metas de Ahorro', ya que NO existen en su menú de navegación ni en su interfaz.\n"
            "3. PROHIBIDO decir que puede cambiar o actualizar su plan desde la configuración de su cuenta (esa opción no existe) y PROHIBIDO sugerirle anotar en cuadernos o aplicaciones externas.\n"
            "4. Si el usuario te pregunta sobre funciones avanzadas (Recurrentes o Metas de Ahorro) o cómo acceder a ellas, debes informarle con amabilidad que son herramientas exclusivas del Plan Avanzado de FinanzasTrack y que, si desea activar el Plan Avanzado, debe comunicarse directamente con el Administrador del sistema para que le habilite el acceso.\n\n"
        )

    return (
        "Eres el asistente financiero oficial de FinanzasTrack. Respondes en español, de forma clara, "
        "práctica, educada y profesional.\n\n"
        f"{tier_instructions}"
        "REGLAS OBLIGATORIAS DE PRECISIÓN:\n"
        "1. INGRESOS vs GASTOS: Si el usuario te pide un listado o tabla de INGRESOS, usa EXCLUSIVAMENTE la sección de HISTORIAL DE INGRESOS REGISTRADOS. NUNCA incluyas gastos (ej. comida, desayunos, servicios) como si fueran ingresos.\n"
        "2. Si el usuario te pide GASTOS, usa EXCLUSIVAMENTE la sección de HISTORIAL DE GASTOS REGISTRADOS.\n"
        "3. PROHIBIDO DUPLICAR O INVENTAR: NUNCA inventes fechas ni dupliques registros. Si una transacción ocurrió el 2026-08-26, solo existe en esa fecha. No agregues fechas ficticias como 2026-08-01 a menos que aparezcan textualmente en el historial.\n"
        "4. RECURRENTES Y FILTROS POR MES: Los recurrentes tienen un período de vigencia (fecha de inicio y fin) y día de cobro/pago mensual. Si el usuario te pregunta por un mes específico, filtra y reporta los que aplican a dicho mes. En las tablas de cuentas atrasadas, lista ÚNICAMENTE los conceptos individuales reales (ej. 'Amazon Prime'). NUNCA agregues los títulos o totales de cabecera ('Deudas vencidas por pagar') como si fueran filas o conceptos adeudados ni inventes categorías como 'Diversos'.\n"
        "5. EXACTITUD DE TOTALES: Si el usuario pregunta por el total de ingresos o gastos históricos, usa exactamente las cifras de los balances (ej. Total de ingresos históricos: S/ {total_income_all}).\n"
        "6. FONDO DE AHORROS: En el historial de ahorros, la columna se llama 'Descripción'. Diferencia claramente: (a) Total Ahorrado (fondo acumulado), (b) Asignado a Metas, (c) Ahorro Libre, y (d) Saldo disponible para apartar.\n"
        "7. PRESUPUESTOS: Si el usuario pregunta por presupuestos, reporta el progreso mensual (gastado vs límite, porcentaje de consumo y margen restante). Si te piden el desglose o consumos de un presupuesto, menciona sus consumos registrados.\n"
        "8. METAS DE AHORRO: En las tablas de metas, respeta estrictamente las columnas: (a) 'Meta' (nombre exacto de la meta, ej. '1', 'meta 1'; NUNCA mezcles la categoría ni inventes números de orden como '2'), (b) 'Categoría' (ej. Hogar, Servicios; NUNCA pongas aquí la palabra 'Libre' o 'Vinculada'), (c) 'Modo' (Libre o Vinculada), y luego 'Acumulado', 'Objetivo', 'Progreso', 'Faltante' y 'Ahorro sugerido'.\n"
        "9. FORMATO DE TABLAS: Usa Markdown estándar (GFM) limpio y conciso con montos en soles (S/). Los encabezados deben ser simples y limpios (ej. 'Fecha', 'Monto', 'Categoría', 'Descripción', 'Meta', 'Modo'), sin añadir aclaraciones entre paréntesis ni frases meta.\n\n"
        f"DATOS REALES DEL USUARIO:\n{context}"
    )


def _normalize_history(historial: list[dict]) -> list[dict]:
    messages: list[dict] = []
    for item in historial[-MAX_HISTORY:]:
        rol = item.get("rol")
        contenido = (item.get("contenido") or "").strip()
        if not contenido or rol not in ("user", "assistant"):
            continue
        messages.append({"role": rol, "content": contenido})
    return messages


def request_groq_completion(
    *,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 1024,
    response_format: dict | None = None,
    timeout: int = 45,
) -> str:
    api_key = (getattr(settings, "GROQ_API_KEY", "") or "").strip().strip('"').strip("'")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY no está configurada en el servidor.")

    model = getattr(settings, "GROQ_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL
    payload: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format

    request = urllib.request.Request(
        GROQ_CHAT_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "FinanzasTrack/1.0 (Django backend)",
        },
        method="POST",
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                data = json.loads(response.read().decode("utf-8"))
            break
        except urllib.error.HTTPError as exc:
            is_retryable_status = exc.code == 429 or (500 <= exc.code <= 599)
            if is_retryable_status and attempt < max_retries - 1:
                sleep_time = 2 ** attempt
                time.sleep(sleep_time)
                continue
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Groq respondió con error ({exc.code}): {body}") from exc
        except urllib.error.URLError as exc:
            if attempt < max_retries - 1:
                sleep_time = 2 ** attempt
                time.sleep(sleep_time)
                continue
            raise RuntimeError(f"No se pudo conectar con Groq: {exc.reason}") from exc

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("Respuesta inesperada de Groq.") from exc


def chat_with_groq(*, user, mensaje: str, historial: list[dict] | None = None) -> str:
    is_avanzado = bool(
        user.is_staff
        or user.is_superuser
        or (hasattr(user, "perfil") and user.perfil.tipo_cuenta == "avanzado")
    )
    try:
        context = build_financial_context(user)
        return request_groq_completion(
            messages=[
                {"role": "system", "content": _system_prompt(context, is_avanzado=is_avanzado)},
                *_normalize_history(historial or []),
                {"role": "user", "content": mensaje.strip()},
            ],
            temperature=0.7,
            max_tokens=1024,
        )
    except RuntimeError:
        from .models import Transaction
        from django.db.models import Sum
        from datetime import date
        today = date.today()
        month_start = today.replace(day=1)

        month_qs = Transaction.objects.filter(
            usuario=user,
            fecha__gte=month_start,
            fecha__lte=today,
        )
        income = month_qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(total=Sum("monto"))["total"] or 0
        expense = month_qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(total=Sum("monto"))["total"] or 0
        balance = Decimal(str(income)) - Decimal(str(expense))

        return (
            "Hola. En este momento el asistente avanzado de IA no se encuentra disponible "
            "debido a un problema de conexión con el proveedor del servicio. Sin embargo, "
            "he calculado de forma local tu balance básico de este mes para ayudarte:\n\n"
            f"**Resumen de {today.strftime('%B %Y')}**:\n"
            f"- **Ingresos:** S/ {income:.2f}\n"
            f"- **Gastos:** S/ {expense:.2f}\n"
            f"- **Balance mensual:** S/ {balance:.2f}\n\n"
            "Por favor, intenta de nuevo en unos minutos cuando la conexión se haya restablecido."
        )
