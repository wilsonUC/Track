"""Integración con Groq para el asistente de finanzas."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from datetime import date
from decimal import Decimal

from django.conf import settings
from django.db.models import Sum

from .models import Presupuesto, Recurrente, Transaction

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.1-8b-instant"
MAX_HISTORY = 10
MAX_RECENT_TX = 25


def _decimal(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value or 0))


def build_financial_context(user) -> str:
    today = date.today()
    month_start = today.replace(day=1)

    month_qs = Transaction.objects.filter(
        usuario=user,
        fecha__gte=month_start,
        fecha__lte=today,
    )

    income = _decimal(month_qs.filter(tipo=Transaction.Tipo.INGRESO).aggregate(total=Sum("monto"))["total"])
    expense = _decimal(month_qs.filter(tipo=Transaction.Tipo.GASTO).aggregate(total=Sum("monto"))["total"])
    balance = income - expense

    recent = (
        Transaction.objects.filter(usuario=user)
        .select_related("categoria", "presupuesto", "recurrente")
        .order_by("-fecha", "-creado_en")[:MAX_RECENT_TX]
    )

    presupuestos = Presupuesto.objects.filter(usuario=user, activo=True).order_by("nombre")
    recurrentes = Recurrente.objects.filter(usuario=user, activo=True).select_related("categoria")

    lines = [
        f"Usuario: {user.first_name or user.username}",
        f"Mes actual ({month_start.strftime('%B %Y')}):",
        f"- Ingresos: S/ {income:.2f}",
        f"- Gastos: S/ {expense:.2f}",
        f"- Balance del mes: S/ {balance:.2f}",
        "",
        "Presupuestos activos (límite mensual):",
    ]

    if not presupuestos:
        lines.append("- Sin presupuestos configurados.")
    else:
        from .presupuestos_service import calcular_estado, calcular_gastado_mes, calcular_porcentaje

        for p in presupuestos:
            gastado = calcular_gastado_mes(p, today)
            pct = calcular_porcentaje(gastado, p.limite)
            estado = calcular_estado(gastado, p.limite)
            lines.append(
                f"- {p.nombre}: gastado S/ {gastado:.2f} / límite S/ {p.limite:.2f} ({pct}%, {estado})"
            )

    lines.extend(["", "Recurrentes activos (mes actual):"])

    if not recurrentes:
        lines.append("- Sin recurrentes configurados.")
    else:
        from .recurrentes_service import calcular_estado_recurrente

        for r in recurrentes:
            estado = calcular_estado_recurrente(r, today)
            tipo = "Ingreso" if r.tipo == Transaction.Tipo.INGRESO else "Gasto"
            if estado["registrado_mes"]:
                situacion = "registrado"
            elif estado["vencido"]:
                situacion = "vencido"
            else:
                situacion = "pendiente"
            lines.append(
                f"- [{tipo}] {r.nombre}: S/ {r.monto:.2f}, día {r.dia_pago}, {situacion}"
            )

    lines.extend(["", "Últimas transacciones (más recientes primero):"])

    if not recent:
        lines.append("- Sin transacciones registradas.")
    else:
        for tx in recent:
            tipo = "Ingreso" if tx.tipo == Transaction.Tipo.INGRESO else "Gasto"
            desc = tx.descripcion.strip() or "Sin descripción"
            if tx.presupuesto_id:
                origen = f"Presupuesto: {tx.presupuesto.nombre}"
            elif tx.recurrente_id:
                origen = f"Recurrente: {tx.recurrente.nombre}"
            else:
                origen = tx.categoria.nombre if tx.categoria_id else "Sin categoría"
            lines.append(f"- {tx.fecha} | {tipo} | {origen} | S/ {tx.monto} | {desc}")

    return "\n".join(lines)


def _system_prompt(context: str) -> str:
    return (
        "Eres el asistente financiero de FinanzasTrack. Respondes en español, de forma clara, "
        "práctica y amigable. Usa los datos reales del usuario que aparecen abajo. "
        "Si no hay datos suficientes, dilo con honestidad y sugiere qué registrar. "
        "No inventes montos ni transacciones. Montos en soles peruanos (S/). "
        "Respuestas concisas (máximo 3 párrafos cortos salvo que pidan detalle).\n\n"
        f"DATOS DEL USUARIO:\n{context}"
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


def chat_with_groq(*, user, mensaje: str, historial: list[dict] | None = None) -> str:
    api_key = (getattr(settings, "GROQ_API_KEY", "") or "").strip().strip('"').strip("'")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY no está configurada en el servidor.")

    model = getattr(settings, "GROQ_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL
    context = build_financial_context(user)
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": _system_prompt(context)},
            *_normalize_history(historial or []),
            {"role": "user", "content": mensaje.strip()},
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
    }

    request = urllib.request.Request(
        GROQ_CHAT_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            # Cloudflare/Groq bloquean el User-Agent por defecto de Python (error 1010)
            "User-Agent": "FinanzasTrack/1.0 (Django backend)",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Groq respondió con error ({exc.code}): {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"No se pudo conectar con Groq: {exc.reason}") from exc

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("Respuesta inesperada de Groq.") from exc
