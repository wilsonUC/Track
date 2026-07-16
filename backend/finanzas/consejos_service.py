"""Generación y caché de consejos financieros con Groq."""

from __future__ import annotations

import json
import re
from datetime import timedelta

from django.utils import timezone

from .ia_service import build_financial_context, request_groq_completion
from .models import ConsejoCache

CACHE_HOURS = 24
MIN_CONSEJOS = 4
MAX_CONSEJOS = 6

VALID_CATEGORIAS = {"ALERTA", "AHORRO", "INVERSIÓN", "GENERAL"}
VALID_IMPACTOS = {"ALTO", "MEDIO", "OPTIMISTA"}


def _consejos_system_prompt(context: str) -> str:
    return (
        "Eres el motor de consejos de FinanzasTrack. Analizas los datos reales del usuario "
        "y generas recomendaciones personalizadas en español. "
        "No inventes montos ni transacciones que no aparezcan en los datos. "
        "Si hay pocos datos, incluye consejos educativos generales útiles para principiantes. "
        "Responde ÚNICAMENTE con un objeto JSON válido (sin markdown ni texto extra) con esta forma:\n"
        "{\n"
        '  "puntaje": <entero 0-100 de salud financiera del mes>,\n'
        '  "resumen": "<2-3 oraciones sobre el diagnóstico general>",\n'
        '  "consejos": [\n'
        "    {\n"
        '      "titulo": "<título corto>",\n'
        '      "descripcion": "<2-4 oraciones prácticas>",\n'
        '      "categoria": "ALERTA" | "AHORRO" | "INVERSIÓN" | "GENERAL",\n'
        '      "impacto": "ALTO" | "MEDIO" | "OPTIMISTA",\n'
        '      "pregunta_ia": "<pregunta sugerida para profundizar en el chat de IA>"\n'
        "    }\n"
        "  ]\n"
        "}\n"
        f"Genera entre {MIN_CONSEJOS} y {MAX_CONSEJOS} consejos según la cantidad de hallazgos relevantes. "
        "Prioriza alertas reales (presupuestos excedidos, recurrentes vencidos, metas en riesgo). "
        "Cada consejo debe tener pregunta_ia en español.\n\n"
        f"DATOS DEL USUARIO:\n{context}"
    )


def _extract_json(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise RuntimeError("La IA no devolvió JSON válido.") from None
        return json.loads(match.group(0))


def _normalize_categoria(value: str) -> str:
    normalized = (value or "").strip().upper()
    if normalized == "INVERSION":
        normalized = "INVERSIÓN"
    if normalized not in VALID_CATEGORIAS:
        return "GENERAL"
    return normalized


def _normalize_impacto(value: str) -> str:
    normalized = (value or "").strip().upper()
    if normalized not in VALID_IMPACTOS:
        return "MEDIO"
    return normalized


def _normalize_payload(data: dict) -> dict:
    puntaje = data.get("puntaje", 50)
    try:
        puntaje = int(puntaje)
    except (TypeError, ValueError):
        puntaje = 50
    puntaje = max(0, min(100, puntaje))

    resumen = (data.get("resumen") or "").strip()
    if not resumen:
        resumen = "Revisa tus presupuestos, metas y hábitos de gasto para mejorar tu salud financiera."

    raw_consejos = data.get("consejos") or []
    if not isinstance(raw_consejos, list):
        raw_consejos = []

    consejos: list[dict] = []
    for item in raw_consejos[:MAX_CONSEJOS]:
        if not isinstance(item, dict):
            continue
        titulo = (item.get("titulo") or "").strip()
        descripcion = (item.get("descripcion") or "").strip()
        if not titulo or not descripcion:
            continue
        pregunta = (item.get("pregunta_ia") or "").strip()
        if not pregunta:
            pregunta = f"¿Puedes explicarme más sobre: {titulo}?"
        consejos.append(
            {
                "titulo": titulo,
                "descripcion": descripcion,
                "categoria": _normalize_categoria(item.get("categoria", "")),
                "impacto": _normalize_impacto(item.get("impacto", "")),
                "pregunta_ia": pregunta,
            }
        )

    if len(consejos) < MIN_CONSEJOS:
        raise RuntimeError(
            f"La IA devolvió menos de {MIN_CONSEJOS} consejos válidos. Intenta actualizar de nuevo."
        )

    return {
        "puntaje": puntaje,
        "resumen": resumen,
        "consejos": consejos,
    }


def generate_consejos_with_groq(user) -> dict:
    context = build_financial_context(user)
    raw = request_groq_completion(
        messages=[
            {"role": "system", "content": _consejos_system_prompt(context)},
            {
                "role": "user",
                "content": (
                    "Genera el diagnóstico y los consejos personalizados en JSON según las instrucciones."
                ),
            },
        ],
        temperature=0.4,
        max_tokens=2048,
        response_format={"type": "json_object"},
        timeout=60,
    )
    return _normalize_payload(_extract_json(raw))


def _cache_is_fresh(cache: ConsejoCache) -> bool:
    return timezone.now() - cache.generado_en < timedelta(hours=CACHE_HOURS)


def _payload_from_cache(cache: ConsejoCache, *, desde_cache: bool) -> dict:
    return {
        "puntaje": cache.puntaje,
        "resumen": cache.resumen,
        "consejos": cache.consejos,
        "generado_en": cache.generado_en.isoformat(),
        "desde_cache": desde_cache,
    }


def get_or_generate_consejos(user, *, force: bool = False) -> dict:
    cache = ConsejoCache.objects.filter(usuario=user).first()

    if cache and not force and _cache_is_fresh(cache):
        return _payload_from_cache(cache, desde_cache=True)

    try:
        payload = generate_consejos_with_groq(user)
        is_fallback = False
    except RuntimeError:
        if cache:
            result = _payload_from_cache(cache, desde_cache=True)
            result["fallback"] = True
            result["mensaje_fallback"] = (
                "El asistente de IA no está disponible temporalmente. "
                "Mostrando consejos anteriores."
            )
            return result
        payload = generate_local_fallback_consejos(user)
        is_fallback = True

    now = timezone.now()

    if is_fallback:
        return {
            "puntaje": payload["puntaje"],
            "resumen": payload["resumen"],
            "consejos": payload["consejos"],
            "generado_en": now.isoformat(),
            "desde_cache": False,
            "fallback": True,
            "mensaje_fallback": (
                "El asistente de IA no está disponible. "
                "Mostrando diagnóstico básico local."
            ),
        }

    if cache:
        cache.puntaje = payload["puntaje"]
        cache.resumen = payload["resumen"]
        cache.consejos = payload["consejos"]
        cache.generado_en = now
        cache.save(update_fields=["puntaje", "resumen", "consejos", "generado_en"])
    else:
        cache = ConsejoCache.objects.create(
            usuario=user,
            puntaje=payload["puntaje"],
            resumen=payload["resumen"],
            consejos=payload["consejos"],
            generado_en=now,
        )

    return _payload_from_cache(cache, desde_cache=False)


def generate_local_fallback_consejos(user) -> dict:
    from .models import Presupuesto, Recurrente, MetaAhorro, Transaction
    from .presupuestos_service import calcular_gastado_mes
    from .recurrentes_service import calcular_estado_recurrente
    from .ahorros_service import ahorro_libre
    from datetime import date
    from decimal import Decimal

    today = date.today()
    presupuestos = Presupuesto.objects.filter(usuario=user, activo=True)
    recurrentes = Recurrente.objects.filter(usuario=user, activo=True)
    metas = MetaAhorro.objects.filter(usuario=user, activo=True)

    excedidos = 0
    alerta_presupuestos = 0
    for p in presupuestos:
        gastado = calcular_gastado_mes(p, today)
        if gastado > p.limite:
            excedidos += 1
        elif p.limite > 0 and gastado >= p.limite * Decimal("0.9"):
            alerta_presupuestos += 1

    vencidos = 0
    for r in recurrentes:
        estado = calcular_estado_recurrente(r, today)
        if estado.get("vencido"):
            vencidos += 1

    puntaje = 100
    if excedidos > 0:
        puntaje -= min(40, excedidos * 15)
    if vencidos > 0:
        puntaje -= min(30, vencidos * 10)
    if alerta_presupuestos > 0:
        puntaje -= min(20, alerta_presupuestos * 5)
    if not metas.exists():
        puntaje -= 10
    puntaje = max(10, puntaje)

    consejos = []

    if excedidos > 0:
        consejos.append({
            "titulo": "Presupuestos excedidos",
            "descripcion": f"Tienes {excedidos} presupuesto(s) donde tus gastos superaron el límite establecido. Intenta recortar egresos no esenciales en estas categorías.",
            "categoria": "ALERTA",
            "impacto": "ALTO",
            "pregunta_ia": "¿Cómo puedo recortar gastos en mis presupuestos excedidos?",
        })
    elif alerta_presupuestos > 0:
        consejos.append({
            "titulo": "Presupuestos al límite",
            "descripcion": f"Tienes {alerta_presupuestos} presupuesto(s) cerca de alcanzar su límite mensual (90% o más). Vigila tus próximos consumos.",
            "categoria": "ALERTA",
            "impacto": "MEDIO",
            "pregunta_ia": "¿Qué estrategias me recomiendas para no pasarme de mis presupuestos?",
        })

    if vencidos > 0:
        consejos.append({
            "titulo": "Pagos recurrentes pendientes",
            "descripcion": f"Tienes {vencidos} pago(s) o cobro(s) fijos que se encuentran vencidos este mes. Regístralos para mantener al día tus cuentas.",
            "categoria": "ALERTA",
            "impacto": "ALTO",
            "pregunta_ia": "¿Cómo afectan los pagos vencidos a mi salud financiera?",
        })

    if not metas.exists():
        consejos.append({
            "titulo": "Define tu primera meta",
            "descripcion": "Establecer objetivos claros (ej. un fondo de emergencia o unas vacaciones) facilita el hábito del ahorro y te da un propósito.",
            "categoria": "AHORRO",
            "impacto": "MEDIO",
            "pregunta_ia": "¿Cómo puedo definir una meta de ahorro realista?",
        })
    else:
        libre = ahorro_libre(user)
        if libre > 0:
            consejos.append({
                "titulo": "Asigna tu ahorro libre",
                "descripcion": f"Tienes S/ {libre:.2f} en tu pool de ahorro sin asignar a ninguna meta. Distribúyelo para ver tu progreso real.",
                "categoria": "AHORRO",
                "impacto": "MEDIO",
                "pregunta_ia": "¿Cómo debería distribuir mis ahorros libres entre mis metas?",
            })

    if len(consejos) < 4:
        consejos.append({
            "titulo": "Ahorra de forma automática",
            "descripcion": "Una de las mejores reglas financieras es págate a ti mismo primero. Separa al menos el 10% de tus ingresos apenas los recibas.",
            "categoria": "AHORRO",
            "impacto": "MEDIO",
            "pregunta_ia": "¿Cómo puedo crear un hábito de ahorro constante?",
        })
    if len(consejos) < 4:
        consejos.append({
            "titulo": "Fondo de emergencia",
            "descripcion": "Es aconsejable acumular entre 3 y 6 meses de tus gastos básicos para imprevistos (médicos, reparaciones o desempleo).",
            "categoria": "INVERSIÓN",
            "impacto": "ALTO",
            "pregunta_ia": "¿Cómo calculo el tamaño de mi fondo de emergencia?",
        })
    if len(consejos) < 4:
        consejos.append({
            "titulo": "Evita deudas de consumo",
            "descripcion": "Las tarjetas de crédito son excelentes herramientas si pagas el total del mes, pero sus intereses pueden desestabilizar tus finanzas si te financias con ellas.",
            "categoria": "GENERAL",
            "impacto": "ALTO",
            "pregunta_ia": "¿Cuáles son las mejores prácticas para usar tarjetas de crédito?",
        })

    consejos = consejos[:6]

    resumen = "Diagnóstico local: "
    if excedidos > 0 or vencidos > 0:
        resumen += "Tienes alertas importantes (presupuestos excedidos o pagos vencidos) que requieren tu atención inmediata."
    elif alerta_presupuestos > 0:
        resumen += "Tus finanzas están bajo control, pero tienes presupuestos muy cerca de su límite mensual. Monitorea tus transacciones."
    else:
        resumen += "Tus finanzas se ven estables y sin alertas críticas este mes. ¡Sigue así!"

    return {
        "puntaje": puntaje,
        "resumen": resumen,
        "consejos": consejos,
    }

