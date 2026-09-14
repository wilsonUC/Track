"""Integración con Groq para el asistente de finanzas."""

from __future__ import annotations

import json
import logging
import time
import urllib.error
import urllib.request
from datetime import date, timedelta
from decimal import Decimal

from django.conf import settings
from django.db.models import DecimalField, Q, Sum
from django.db.models.functions import Coalesce

from .models import MetaAhorro, Presupuesto, Recurrente, Transaction

logger = logging.getLogger(__name__)

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"
FALLBACK_MODELS = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]
MAX_HISTORY = 6
MAX_RECENT_TX = 15

CATALOGO_OPORTUNIDADES_INVERSION = """=== CATÁLOGO DE OPORTUNIDADES DE INVERSIÓN EXTERNAS (INMOBILIARIA) ===
[Proyecto externo recomendado por la plataforma. NO pertenece a ingresos, gastos ni deudas del usuario]
- Proyecto: "Las Bugambilias" (Desarrolladora: INNOVA Inversiones, +15 años de trayectoria, >150 familias propietarias).
- Tipo: Terrenos campestres / residenciales de alta plusvalía en La Joya, Arequipa, Perú (zona soleada todo el año).
- Condiciones Comerciales: Cuotas desde S/ 199/mes | Cuota inicial desde S/ 1,998 | Saldo referencial aprox: S/ 7,990 | Plazos de 3 a 24 meses.
- Facilidades: CRÉDITO DIRECTO (sin bancos, sin intermediarios, sin evaluación crediticia) | Descuento al contado hasta S/ 1,000 | Promociones por 2 lotes.
- Amenidades: +16,000 m² de áreas verdes, zonas de parrilla/caja china y esparcimiento familiar | Titulación 100% legal y garantizada.
- Beneficios exclusivos: Planos arquitectónicos en PDF de regalo al cotizar | Programa "Refiere y Gana": S/ 300 en efectivo o descuento por referido.
- Contacto: WhatsApp +51 926 289 293 | Oficina: Calle Octavio Muñoz Najar 137, Of. 204, Cercado, Arequipa | Web: https://www.innovainversiones.com/lasbugambilias"""


def _decimal(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value or 0))


def _agrupar_cuentas_atrasadas(items: list[dict]) -> list[str]:
    """Agrupa atrasos del mismo recurrente en una sola línea compacta para ahorrar tokens."""
    if not items:
        return []
    grupos: dict[str, dict] = {}
    for it in items:
        nom = it.get("nombre", "Sin nombre")
        if nom not in grupos:
            grupos[nom] = {
                "nombre": nom,
                "categoria": it.get("categoria", "General"),
                "meses": [],
                "total": Decimal("0"),
                "dia_pago": it.get("fecha_pago", "")[-2:],
            }
        grupos[nom]["meses"].append(it.get("mes_atraso", ""))
        grupos[nom]["total"] += Decimal(str(it.get("acumulado", 0)))

    lineas = []
    for nom, g in grupos.items():
        n_meses = len(g["meses"])
        if n_meses == 1:
            lineas.append(
                f"- '{nom}' ({g['categoria']}): Mes {g['meses'][0]} | Saldo: S/ {g['total']:.2f}"
            )
        else:
            periodo = f"{g['meses'][0]} a {g['meses'][-1]}"
            promedio = g["total"] / n_meses if n_meses > 0 else Decimal("0")
            lineas.append(
                f"- '{nom}' ({g['categoria']}): {n_meses} meses pendientes ({periodo}) | Total: S/ {g['total']:.2f} (~S/ {promedio:.2f}/mes)"
            )
    return lineas


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

    # --- 2. Movimientos de Hoy, Ayer, Semana y Mes ---
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

    # Desglose de Categorías
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

    # --- 3. Pool de Ahorros ---
    from .ahorros_service import ahorro_libre, saldo_disponible_total, total_ahorrado, total_asignado

    total_ahorro = total_ahorrado(user)
    asignado = total_asignado(user)
    libre = max(Decimal("0"), total_ahorro - asignado)
    disponible_para_apartar = saldo_disponible_total(user)

    savings_qs = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO)
        .order_by("-fecha", "-creado_en")[:10]
    )

    # --- 4. Presupuestos Activos ---
    import calendar
    MESES_NOMBRES = (
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    )
    if today.month == 1:
        prev_month_start = today.replace(year=today.year - 1, month=12, day=1)
        prev_month_end = today.replace(year=today.year - 1, month=12, day=31)
    else:
        prev_m = today.month - 1
        _, last_d = calendar.monthrange(today.year, prev_m)
        prev_month_start = today.replace(month=prev_m, day=1)
        prev_month_end = today.replace(month=prev_m, day=last_d)

    mes_actual_nom = f"{MESES_NOMBRES[today.month - 1]} {today.year}"
    mes_ant_nom = f"{MESES_NOMBRES[prev_month_start.month - 1]} {prev_month_start.year}"

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

    # --- 5. Recurrentes y Metas (Plan Avanzado) ---
    gastos_fijos_pendientes = Decimal("0")
    gastos_fijos_pagados = Decimal("0")
    gastos_fijos_total = Decimal("0")
    ingresos_fijos_pendientes = Decimal("0")
    ingresos_fijos_cobrados = Decimal("0")
    ingresos_fijos_total = Decimal("0")
    recurrentes_info = []
    cuentas_atrasadas_data = {}
    metas = []

    if is_avanzado:
        recurrentes = (
            Recurrente.objects.filter(usuario=user, activo=True)
            .select_related("categoria")
            .prefetch_related("transacciones")
        )
        from .recurrentes_service import (
            calcular_estado_recurrente,
            obtener_cuentas_atrasadas,
            obtener_permite_parciales_mes,
        )

        for r in recurrentes:
            estado_actual = calcular_estado_recurrente(r, today)
            estado_anterior = calcular_estado_recurrente(r, prev_month_start)
            permite_parciales_act = obtener_permite_parciales_mes(r, today)
            parciales_tag = "Permite abonos parciales: Sí" if permite_parciales_act else "Permite abonos parciales: No"
            tipo = "Ingreso" if r.tipo == Transaction.Tipo.INGRESO else "Gasto"
            cat_nombre = r.categoria.nombre if r.categoria else "Sin categoría"
            monto_pagado_dec = Decimal(str(estado_actual.get("monto_pagado", 0)))

            if estado_actual["activo_en_mes"]:
                if r.tipo == Transaction.Tipo.GASTO:
                    gastos_fijos_total += r.monto
                    gastos_fijos_pagados += min(r.monto, monto_pagado_dec)
                    if not estado_actual["registrado_mes"]:
                        gastos_fijos_pendientes += max(Decimal("0"), r.monto - monto_pagado_dec)
                else:
                    ingresos_fijos_total += r.monto
                    ingresos_fijos_cobrados += min(r.monto, monto_pagado_dec)
                    if not estado_actual["registrado_mes"]:
                        ingresos_fijos_pendientes += max(Decimal("0"), r.monto - monto_pagado_dec)

            # Período de vigencia
            creado_d = r.creado_en.date() if hasattr(r.creado_en, "date") else r.creado_en
            if r.fecha_inicio and r.fecha_fin:
                vigencia_str = f"{r.fecha_inicio} al {r.fecha_fin}"
            elif r.fecha_inicio:
                vigencia_str = f"desde {r.fecha_inicio}"
            elif r.fecha_fin:
                vigencia_str = f"hasta {r.fecha_fin}"
            else:
                vigencia_str = f"desde {creado_d}"

            def format_st(st):
                if not st["activo_en_mes"]:
                    return "FUERA DE VIGENCIA / NO APLICA"
                p = Decimal(str(st.get("monto_pagado", 0)))
                m = Decimal(str(st.get("monto_mes", r.monto)))
                if p >= m:
                    return f"PAGADO (S/ {p:.2f} de S/ {m:.2f})"
                elif p > Decimal("0"):
                    return f"PARCIAL (Abonado S/ {p:.2f} de S/ {m:.2f} | Pendiente S/ {m - p:.2f})"
                elif st.get("vencido"):
                    return f"VENCIDO / PENDIENTE (S/ 0.00 de S/ {m:.2f})"
                else:
                    return f"PENDIENTE (S/ 0.00 de S/ {m:.2f})"

            st_ant_str = format_st(estado_anterior)
            st_act_str = format_st(estado_actual)

            recurrentes_info.append(
                f"- [{tipo}] '{r.nombre}' ({cat_nombre}) | Monto: S/ {r.monto:.2f}/mes | Vence día {r.dia_pago} | Vigencia: {vigencia_str} | {parciales_tag}\n"
                f"   * Estado en {mes_ant_nom}: {st_ant_str}\n"
                f"   * Estado en {mes_actual_nom}: {st_act_str}"
            )

        cuentas_atrasadas_data = obtener_cuentas_atrasadas(user, today)
        metas = (
            MetaAhorro.objects.filter(usuario=user, activo=True)
            .select_related("asignacion", "categoria_referencia")
            .order_by("nombre")
        )

    # --- 6. Transacciones Recientes (Formato Compacto) ---
    incomes_qs = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.INGRESO)
        .select_related("categoria")
        .order_by("-fecha", "-creado_en")[:MAX_RECENT_TX]
    )
    expenses_qs = (
        Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.GASTO)
        .select_related("categoria", "presupuesto", "recurrente")
        .order_by("-fecha", "-creado_en")[:MAX_RECENT_TX]
    )
    total_income_count = all_time_qs.filter(tipo=Transaction.Tipo.INGRESO).count()
    total_expense_count = all_time_qs.filter(tipo=Transaction.Tipo.GASTO).count()

    # --- Construcción del Texto en Formato de Alta Densidad ---
    lines = [
        f"Usuario: {user.first_name or user.username} | Fecha hoy: {today.strftime('%Y-%m-%d')} ({today.strftime('%A')})",
        "",
        "=== 1. RESUMEN Y BALANCES ===",
        f"Histórico Total: Ingresos S/ {total_income_all:.2f} ({total_income_count} tx) | Gastos S/ {total_expense_all:.2f} ({total_expense_count} tx) | Balance Neto Total: S/ {total_balance_all:.2f}",
        f"Hoy: Ingresos +S/ {today_income:.2f} | Gastos -S/ {today_expense:.2f} | Balance S/ {today_balance:.2f}",
        f"Ayer: Ingresos +S/ {yesterday_income:.2f} | Gastos -S/ {yesterday_expense:.2f} | Balance S/ {yesterday_balance:.2f}",
        f"Esta Semana: Ingresos +S/ {week_income:.2f} | Gastos -S/ {week_expense:.2f} | Balance S/ {week_balance:.2f}",
        f"Mes Actual ({today.strftime('%B %Y')}): Ingresos +S/ {month_income:.2f} | Gastos -S/ {month_expense:.2f} | Balance S/ {month_balance:.2f}",
    ]

    if is_avanzado:
        lines.append(f"Fijos del Mes: Gastos pendientes -S/ {gastos_fijos_pendientes:.2f} | Ingresos pendientes +S/ {ingresos_fijos_pendientes:.2f}")

    # Categorías Históricas y del Mes (Compacto)
    if gastos_por_cat_mes:
        cat_mes_str = ", ".join(f"{g['categoria__nombre'] or 'General'}: S/ {_decimal(g['total']):.2f}" for g in gastos_por_cat_mes)
        lines.append(f"Gastos por Categoría (Mes Actual): {cat_mes_str}")
    if gastos_por_cat_total:
        cat_tot_str = ", ".join(f"{g['categoria__nombre'] or 'General'}: S/ {_decimal(g['total']):.2f}" for g in gastos_por_cat_total[:8])
        lines.append(f"Top Categorías Gastos (Histórico): {cat_tot_str}")

    # Ahorros
    lines.extend([
        "",
        "=== 2. FONDO DE AHORROS ===",
        f"Total Ahorrado: S/ {total_ahorro:.2f} | Disponible para apartar: S/ {disponible_para_apartar:.2f}"
    ])
    if is_avanzado:
        lines.append(f"Ahorro Libre: S/ {libre:.2f} | Asignado a Metas: S/ {asignado:.2f}")

    if savings_qs:
        lines.append("Movimientos de Ahorro Recientes [Fecha | Monto | Descripción]:")
        for s in savings_qs:
            lines.append(f"  {s.fecha} | S/ {s.monto:.2f} | {s.descripcion.strip() or 'Ahorro'}")

    # Recurrentes (Solo Avanzado)
    if is_avanzado:
        lines.extend(["", "=== 3. RECURRENTES (COMPROMISOS FIJOS) ==="])
        if recurrentes_info:
            lines.extend(recurrentes_info)
        else:
            lines.append("- Sin recurrentes configurados.")

        # === 3.1 CUENTAS POR PAGAR (DEUDAS ACUMULADAS DE MESES ANTERIORES) ===
        total_deudas_atrasadas = _decimal(cuentas_atrasadas_data.get("total_pagar", 0))
        total_cobros_atrasados = _decimal(cuentas_atrasadas_data.get("total_cobrar", 0))
        deudas_list = cuentas_atrasadas_data.get("deudas", [])
        cobros_list = cuentas_atrasadas_data.get("cobros", [])

        lines.extend([
            "",
            "=== 3.1 CUENTAS POR PAGAR (DEUDAS ACUMULADAS DE MESES ANTERIORES) ===",
            f"Total Cuentas por Pagar: S/ {total_deudas_atrasadas:.2f} ({len(deudas_list)} facturas pendientes)",
        ])
        if deudas_list:
            for d in deudas_list:
                lines.append(f"- '{d['nombre']}' ({d['categoria']}) | Mes: {d['mes_atraso']} | Saldo adeudado: S/ {d['acumulado']:.2f} | Venció el: {d['fecha_pago']}")
        else:
            lines.append("- Sin deudas acumuladas de meses anteriores.")

        # === 3.2 CUENTAS POR COBRAR (INGRESOS ATRASADOS PENDIENTES) ===
        lines.extend([
            "",
            "=== 3.2 CUENTAS POR COBRAR (INGRESOS ATRASADOS PENDIENTES DE COBRO) ===",
            f"Total Cuentas por Cobrar: S/ {total_cobros_atrasados:.2f} ({len(cobros_list)} cobros pendientes)",
        ])
        if cobros_list:
            for c in cobros_list:
                lines.append(f"- '{c['nombre']}' ({c['categoria']}) | Mes: {c['mes_atraso']} | Monto pendiente: S/ {c['acumulado']:.2f}")
        else:
            lines.append("- Sin cobros pendientes de meses anteriores.")

    # Presupuestos
    sec_p = "4" if is_avanzado else "3"
    lines.extend(["", f"=== {sec_p}. PRESUPUESTOS (LÍMITES MENSUALES) ==="])
    if not presupuestos:
        lines.append("- Sin presupuestos configurados.")
    else:
        from .presupuestos_service import (
            calcular_estado,
            calcular_porcentaje,
            calcular_estado_periodo,
        )
        for p in presupuestos:
            cat = p.categoria_referencia.nombre if p.categoria_referencia else "General"
            creado_p = p.creado_en.date() if hasattr(p.creado_en, "date") else p.creado_en
            if p.fecha_inicio and p.fecha_fin:
                vigencia_p = f"del {p.fecha_inicio} al {p.fecha_fin}"
            elif p.fecha_inicio:
                vigencia_p = f"desde {p.fecha_inicio}"
            elif p.fecha_fin:
                vigencia_p = f"hasta {p.fecha_fin}"
            else:
                vigencia_p = f"desde {creado_p}"

            st_p_act = calcular_estado_periodo(p, today)
            st_p_ant = calcular_estado_periodo(p, prev_month_start)

            # Mes actual
            if not st_p_act["activo_en_mes"]:
                info_act = "FUERA DE VIGENCIA / NO APLICA"
            else:
                pct_act = calcular_porcentaje(p.gastado, p.limite)
                estado_act = calcular_estado(p.gastado, p.limite)
                restante_act = max(Decimal("0"), p.limite - p.gastado)
                info_act = f"Consumido S/ {p.gastado:.2f} de S/ {p.limite:.2f} ({pct_act}%, Estado: {estado_act}, Restante: S/ {restante_act:.2f})"

            # Mes anterior
            if not st_p_ant["activo_en_mes"]:
                info_ant = "FUERA DE VIGENCIA / NO APLICA"
            else:
                pct_ant = calcular_porcentaje(p.gastado_mes_anterior, p.limite)
                estado_ant = calcular_estado(p.gastado_mes_anterior, p.limite)
                restante_ant = max(Decimal("0"), p.limite - p.gastado_mes_anterior)
                info_ant = f"Consumido S/ {p.gastado_mes_anterior:.2f} de S/ {p.limite:.2f} ({pct_ant}%, Estado: {estado_ant}, Restante: S/ {restante_ant:.2f})"

            lines.append(
                f"- '{p.nombre}' ({cat}) | Límite: S/ {p.limite:.2f}/mes | Vigencia: {vigencia_p}\n"
                f"   * Estado en {mes_ant_nom}: {info_ant}\n"
                f"   * Estado en {mes_actual_nom}: {info_act}"
            )

    # Metas de Ahorro (Solo Avanzado)
    if is_avanzado:
        lines.extend(["", "=== 5. METAS DE AHORRO ==="])
        if not metas:
            lines.append("- Sin metas configuradas.")
        else:
            from .metas_service import calcular_acumulado, calcular_ahorro_sugerido, calcular_porcentaje

            # Límites del mes actual y mes anterior
            start_month_ref = today.replace(day=1)
            last_day_ref = calendar.monthrange(today.year, today.month)[1]
            end_month_ref = today.replace(day=last_day_ref)

            for m in metas:
                acum = calcular_acumulado(m)
                pct = calcular_porcentaje(acum, m.monto_objetivo)
                faltante = max(Decimal("0"), m.monto_objetivo - acum)
                cat_ref = m.categoria_referencia.nombre if m.categoria_referencia else "General"
                modo_desc = "Libre (Independiente, NO vinculada al fondo de ahorros)" if m.es_asignacion_libre else "Vinculada (Se financia con Fondo de Ahorros)"

                # Fechas de vigencia
                creado_m = m.creado_en.date() if hasattr(m.creado_en, "date") else m.creado_en
                if m.fecha_inicio and m.fecha_limite:
                    fechas_str = f"del {m.fecha_inicio} al {m.fecha_limite}"
                elif m.fecha_inicio:
                    fechas_str = f"desde {m.fecha_inicio}"
                elif m.fecha_limite:
                    fechas_str = f"hasta {m.fecha_limite}"
                else:
                    fechas_str = f"desde {creado_m}"

                # Vigencia en el mes actual
                if m.fecha_inicio and m.fecha_inicio > end_month_ref:
                    estado_mes_meta = f"FUTURA (Inicia el {m.fecha_inicio}, NO aplica en {mes_actual_nom})"
                elif m.fecha_limite and m.fecha_limite < start_month_ref:
                    estado_mes_meta = f"FINALIZADA / VENCIDA (Terminó el {m.fecha_limite})"
                else:
                    estado_mes_meta = f"VIGENTE_EN_MES (Activa en {mes_actual_nom})"

                # Vigencia en el mes anterior
                if m.fecha_inicio and m.fecha_inicio > prev_month_end:
                    estado_mes_ant_meta = f"NO INICIADA (Inicia el {m.fecha_inicio})"
                elif m.fecha_limite and m.fecha_limite < prev_month_start:
                    estado_mes_ant_meta = f"FINALIZADA / VENCIDA"
                else:
                    estado_mes_ant_meta = f"VIGENTE_EN_MES (Activa en {mes_ant_nom})"

                sugerido = calcular_ahorro_sugerido(m, today)
                sug_str = f" | Cuota sugerida: S/ {sugerido:.2f}/mes" if sugerido is not None else ""

                lines.append(
                    f"- '{m.nombre}' | Cat: {cat_ref} | Modo: {modo_desc} | Vigencia: {fechas_str} | "
                    f"Acumulado: S/ {acum:.2f} / S/ {m.monto_objetivo:.2f} ({pct}%, Faltante: S/ {faltante:.2f}){sug_str}\n"
                    f"   * Estado en {mes_ant_nom}: {estado_mes_ant_meta}\n"
                    f"   * Estado en {mes_actual_nom}: {estado_mes_meta}"
                )

    # Historial de Ingresos y Gastos (Formato Compacto TSV/Pipe)
    sec_ing = "6" if is_avanzado else "4"
    sec_gas = "7" if is_avanzado else "5"

    lines.extend(["", f"=== {sec_ing}. HISTORIAL DE INGRESOS (ÚLTIMOS {len(incomes_qs)} DE {total_income_count}) ==="])
    lines.append("[Fecha | Monto | Categoría | Descripción]")
    if not incomes_qs:
        lines.append("- Sin ingresos.")
    else:
        for tx in incomes_qs:
            cat = tx.categoria.nombre if tx.categoria_id else "General"
            desc = tx.descripcion.strip() or "-"
            lines.append(f"{tx.fecha} | S/ {tx.monto:.2f} | {cat} | {desc}")

    lines.extend(["", f"=== {sec_gas}. HISTORIAL DE GASTOS (ÚLTIMOS {len(expenses_qs)} DE {total_expense_count}) ==="])
    lines.append("[Fecha | Monto | Categoría/Origen | Descripción]")
    if not expenses_qs:
        lines.append("- Sin gastos.")
    else:
        for tx in expenses_qs:
            if tx.presupuesto_id:
                orig = f"Presupuesto:{tx.presupuesto.nombre}"
            elif tx.recurrente_id:
                orig = f"Recurrente:{tx.recurrente.nombre}"
            else:
                orig = tx.categoria.nombre if tx.categoria_id else "General"
            desc = tx.descripcion.strip() or "-"
            lines.append(f"{tx.fecha} | S/ {tx.monto:.2f} | {orig} | {desc}")

    return "\n".join(lines)


def _system_prompt(context: str, is_avanzado: bool = True) -> str:
    tier_note = ""
    if not is_avanzado:
        tier_note = (
            "NIVEL: PLAN BÁSICO. No tiene acceso a Recurrentes ni Metas de Ahorro. "
            "No le sugieras esas funciones. Si pregunta, indícale amablemente comunicarse con el Administrador.\n\n"
        )

    return (
        "Eres el asistente financiero oficial de FinanzasTrack. Respondes en español con tono profesional, educado y claro.\n\n"
        f"{tier_note}"
        "DIRECTIVAS ESTRICTAS DE PRECISIÓN:\n"
        "1. INGRESOS vs GASTOS: Si piden ingresos, usa únicamente la sección de Ingresos. Si piden gastos, usa Gastos. Los recurrentes de tipo [Ingreso] (ej. Sueldo) son cobros a favor del usuario, NUNCA son deudas ni gastos a pagar.\n"
        "2. CUENTAS POR PAGAR (DEUDAS ACUMULADAS):\n"
        "   - Si el usuario pregunta por 'Cuentas por pagar', 'deudas acumuladas' o 'facturas pendientes', usa EXCLUSIVAMENTE la sección '3.1 CUENTAS POR PAGAR (DEUDAS ACUMULADAS DE MESES ANTERIORES)'.\n"
        "   - Reporta exactamente el total adeudado acumulado y su desglose detallado por conceptos y meses vencidos que figuren en esa sección.\n"
        "   - NUNCA sumes ni mezcles los compromisos del mes actual en curso como si fueran parte de las deudas acumuladas atrasadas.\n"
        "3. CUENTAS POR COBRAR: Si preguntan por cuentas por cobrar o cobros pendientes, usa EXCLUSIVAMENTE la sección '3.2 CUENTAS POR COBRAR'.\n"
        "4. RECURRENTES CON PARCIALES Y ABONOS:\n"
        "   - Si el usuario pregunta qué recurrentes 'son con parciales', 'permiten parciales' o 'aceptan pagos fraccionados', responde indicando cuáles tienen configurado 'Permite abonos parciales: Sí' independientemente de si en el mes ya tienen abonos o aún están pendientes.\n"
        "   - Si un recurrente tiene abonos parciales en un mes, repórtalo como 'PARCIAL' con su monto abonado y saldo pendiente. NUNCA lo marques como PAGADO completo si aún tiene saldo pendiente.\n"
        "   - Si está PAGADO completo, repórtalo como 'PAGADO'.\n"
        "   - Si está PENDIENTE sin abonos, repórtalo como 'PENDIENTE'.\n"
        "5. CONSULTAS POR MES DE RECURRENTES (ej. 'en agosto', 'mes anterior', 'en septiembre'):\n"
        "   - Revisa la sección 'Estado en [mes]' de cada recurrente en el contexto. Lista TODOS los recurrentes que estaban activos en ese mes sin omitir ninguno.\n"
        "   - Si un recurrente dice 'FUERA DE VIGENCIA / NO APLICA' para ese mes (porque inicia después o finalizó antes), indícalo o exclúyelo del listado del mes consultado.\n"
        "   - Usa columnas estándar: [Concepto | Tipo | Categoría | Monto Mensual | Vence / Se cobra | Pagado / Abonado | Estado en ese mes].\n"
        "5.1 CONSULTAS POR MES DE PRESUPUESTOS (ej. 'presupuestos de agosto', 'presupuestos de este mes', 'presupuestos de septiembre'):\n"
        "   - Revisa la sección 'PRESUPUESTOS (LÍMITES MENSUALES)' y mira 'Estado en [mes]' de cada presupuesto.\n"
        "   - Si un presupuesto estaba activo en ese mes, reporta en tabla: [Presupuesto | Categoría | Límite mensual | Consumido | % Consumido | Restante | Estado].\n"
        "   - Si el presupuesto estuvo activo pero no hubo consumo en ese mes, reporta Consumido: S/ 0.00 (0%, Restante: S/ [Límite], OK). NUNCA digas que no posees información si el presupuesto está listado en el contexto.\n"
        "   - Si un presupuesto dice 'FUERA DE VIGENCIA / NO APLICA', aclara que no aplicaba en ese mes.\n"
        "6. METAS DE AHORRO Y VINCULACIÓN CON EL FONDO DE AHORROS:\n"
        "   - DISTINCIÓN ESTRICTA DE MODO:\n"
        "     * Modo 'Vinculada': Se financia exclusivamente del fondo de Ahorros del usuario (consume el ahorro libre formal del pool).\n"
        "     * Modo 'Libre': Es una meta independiente de asignación libre. NUNCA está vinculada al fondo de ahorros ni consume su saldo.\n"
        "   - Si el usuario pregunta por 'mis ahorros' o 'metas vinculadas al fondo', reporta ÚNICAMENTE las metas que tienen Modo 'Vinculada'. Si mencionas metas en modo 'Libre', aclara explícitamente que son de asignación libre (independientes del fondo).\n"
        "   - FILTRO POR MES:\n"
        "     * Revisa 'Estado en [mes]' de cada meta. Lista ÚNICAMENTE las metas que están 'VIGENTE_EN_MES' en el mes consultado.\n"
        "     * Si una meta es 'FUTURA' (inicia en un mes posterior), NUNCA la incluyas en las metas activas de meses previos ni la sumes al total global de ese período.\n"
        "   - Si el usuario pide explícitamente 'todas las metas' o metas futuras, lista todas aclarando las fechas de inicio de las futuras.\n"
        "7. NUNCA INVENTES: Usa estrictamente los datos del contexto. Si una fecha o monto no existe, no lo inventes.\n"
        "8. FORMATO: Usa Markdown limpio (tablas GFM completas y viñetas) con montos en soles (S/). No cortes las tablas a la mitad.\n"
        "9. OPORTUNIDADES EXTERNAS: Si preguntan por inversiones o Las Bugambilias, usa la info del catálogo comercial sin mezclarla con sus gastos personales.\n\n"
        f"DATOS DEL USUARIO:\n{context}\n\n"
        f"{CATALOGO_OPORTUNIDADES_INVERSION}"
    )


def _normalize_history(historial: list[dict]) -> list[dict]:
    """Normaliza y compacta el historial para evitar agotar tokens con respuestas previas gigantes."""
    messages: list[dict] = []
    for item in historial[-MAX_HISTORY:]:
        rol = item.get("rol")
        contenido = (item.get("contenido") or "").strip()
        if not contenido or rol not in ("user", "assistant"):
            continue
        # Truncar respuestas previas muy largas del asistente para proteger el límite de tokens
        if rol == "assistant" and len(contenido) > 350:
            contenido = contenido[:350] + "..."
        messages.append({"role": rol, "content": contenido})
    return messages


def _single_groq_request(
    *,
    api_key: str,
    model: str,
    messages: list[dict],
    temperature: float,
    max_tokens: int,
    response_format: dict | None,
    timeout: int,
) -> str:
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
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        method="POST",
    )

    max_retries = 2
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                data = json.loads(response.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            logger.warning("Groq (%s) HTTP %d intento %d: %s", model, exc.code, attempt + 1, body[:200])
            # Si es 429 (rate limit del modelo), saltar de inmediato al siguiente modelo en cascada
            if exc.code == 429:
                raise RuntimeError(f"Groq ({model}) Rate Limit 429: {body}") from exc
            is_retryable = 500 <= exc.code <= 599
            if is_retryable and attempt < max_retries - 1:
                time.sleep(1.0 * (attempt + 1))
                continue
            raise RuntimeError(f"Groq ({model}) HTTP {exc.code}: {body}") from exc
        except urllib.error.URLError as exc:
            logger.warning("Groq (%s) URLError intento %d: %s", model, attempt + 1, exc.reason)
            if attempt < max_retries - 1:
                time.sleep(1.0 * (attempt + 1))
                continue
            raise RuntimeError(f"Error de red con Groq ({model}): {exc.reason}") from exc
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError(f"Respuesta inesperada de Groq ({model}).") from exc

    raise RuntimeError(f"Groq ({model}) no respondió.")


def request_groq_completion(
    *,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2048,
    response_format: dict | None = None,
    timeout: int = 25,
) -> str:
    api_key = (getattr(settings, "GROQ_API_KEY", "") or "").strip().strip('"').strip("'")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY no está configurada en el servidor.")

    primary_model = getattr(settings, "GROQ_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL
    models_to_try = [primary_model]
    for fb in FALLBACK_MODELS:
        if fb and fb not in models_to_try:
            models_to_try.append(fb)

    last_error = None
    for model_name in models_to_try:
        try:
            logger.info("Consultando a Groq con modelo: %s", model_name)
            return _single_groq_request(
                api_key=api_key,
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format,
                timeout=timeout,
            )
        except RuntimeError as exc:
            last_error = exc
            logger.warning("Fallo en modelo %s (%s), intentando siguiente en lista de respaldo...", model_name, exc)
            continue

    logger.error("Todos los modelos de Groq fallaron: %s", last_error)
    raise last_error or RuntimeError("No se pudo completar la solicitud con Groq.")


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
            max_tokens=2048,
        )
    except Exception as exc:
        logger.error("chat_with_groq cayó al modo de contingencia local: %s", exc)
        from .models import Transaction
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

