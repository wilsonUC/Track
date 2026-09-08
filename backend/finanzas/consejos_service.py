"""Generación y caché de consejos financieros con Groq."""

from __future__ import annotations

import json
import re
from datetime import timedelta

from django.utils import timezone

from .ia_service import (
    CATALOGO_OPORTUNIDADES_INVERSION,
    build_financial_context,
    request_groq_completion,
)
from .models import ConsejoCache

CACHE_HOURS = 24
MIN_CONSEJOS = 6
MAX_CONSEJOS = 6
TOTAL_CONSEJOS = 6

VALID_CATEGORIAS = {"ALERTA", "AHORRO", "INVERSIÓN", "GENERAL"}
VALID_IMPACTOS = {"ALTO", "MEDIO", "OPTIMISTA"}

CONSEJO_BUGAMBILIAS_DEFAULT = {
    "titulo": "Inversión en Las Bugambilias (La Joya)",
    "descripcion": (
        "Haz crecer tu patrimonio invirtiendo en lotes campestres en Las Bugambilias "
        "(La Joya, Arequipa). Terrenos con cuotas desde S/ 199/mes, inicial desde S/ 1,998, "
        "financiamiento directo sin bancos y más de 16,000 m² de áreas verdes."
    ),
    "categoria": "INVERSIÓN",
    "impacto": "OPTIMISTA",
    "pregunta_ia": "¿Cuáles son los beneficios y facilidades de invertir en el proyecto Las Bugambilias?",
}

CONSEJOS_EXTRA_DEFAULTS = [
    {
        "titulo": "Regla 50/30/20 para tus ingresos",
        "descripcion": "Distribuye tus ingresos mensuales: 50% para necesidades básicas, 30% para gastos personales o estilo de vida, y 20% destinado al ahorro o inversión.",
        "categoria": "GENERAL",
        "impacto": "MEDIO",
        "pregunta_ia": "¿Cómo puedo aplicar la regla 50/30/20 a mis ingresos actuales?",
    },
    {
        "titulo": "Construye tu fondo de emergencia",
        "descripcion": "Separa entre 3 y 6 meses de tus gastos fijos en una cuenta segura de fácil acceso para protegerte ante imprevistos laborales o médicos.",
        "categoria": "AHORRO",
        "impacto": "ALTO",
        "pregunta_ia": "¿Cómo calcular el monto ideal para mi fondo de emergencia?",
    },
    {
        "titulo": "Automatiza tus ahorros",
        "descripcion": "Programa transferencias automáticas a tu fondo de ahorros el mismo día que recibes tus ingresos para asegurar tu meta sin esfuerzo.",
        "categoria": "AHORRO",
        "impacto": "MEDIO",
        "pregunta_ia": "¿Cuáles son las ventajas de automatizar el ahorro mensual?",
    },
    {
        "titulo": "Control de gastos hormiga",
        "descripcion": "Pequeñas compras diarias como cafés, snacks o suscripciones que no usas pueden sumar cientos de soles al mes. Regístralas para identificarlas.",
        "categoria": "ALERTA",
        "impacto": "MEDIO",
        "pregunta_ia": "¿Cómo puedo identificar y reducir mis gastos hormiga?",
    },
]


def _consejos_system_prompt(context: str) -> str:
    return (
        "Eres el motor de consejos de FinanzasTrack. Analizas los datos reales del usuario "
        "y generas recomendaciones personalizadas en español.\n"
        "No inventes montos ni transacciones que no aparezcan en los datos personales del usuario. "
        "Si hay pocos datos, incluye consejos educativos generales útiles para principiantes.\n\n"
        "REGLA OBLIGATORIA DE INVERSIÓN:\n"
        "Debes incluir SIEMPRE un consejo en la categoría 'INVERSIÓN' recomendando activamente la oportunidad "
        "de invertir en lotes campestres en el proyecto 'Las Bugambilias' de INNOVA Inversiones en La Joya (Arequipa). "
        "Menciona que es una oportunidad para hacer crecer su patrimonio con cuotas accesibles desde S/ 199/mes, "
        "inicial desde S/ 1,998, crédito directo sin bancos y alta plusvalía en una zona con más de 16,000 m² de áreas verdes. "
        "El impacto de este consejo debe ser 'OPTIMISTA' y su 'pregunta_ia' debe ser '¿Cuáles son los beneficios y facilidades de invertir en el proyecto Las Bugambilias?'.\n\n"
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
        f"Genera EXACTAMENTE {TOTAL_CONSEJOS} consejos relevantes (incluyendo obligatoriamente el consejo de inversión en Las Bugambilias). "
        "Prioriza alertas reales (presupuestos excedidos, recurrentes vencidos, metas en riesgo) y recomendaciones prácticas. "
        "Cada consejo debe tener pregunta_ia en español.\n\n"
        f"DATOS DEL USUARIO:\n{context}\n\n"
        f"{CATALOGO_OPORTUNIDADES_INVERSION}"
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
    has_bugambilias_inversion = False
    for item in raw_consejos[:TOTAL_CONSEJOS]:
        if not isinstance(item, dict):
            continue
        titulo = (item.get("titulo") or "").strip()
        descripcion = (item.get("descripcion") or "").strip()
        if not titulo or not descripcion:
            continue
        categoria = _normalize_categoria(item.get("categoria", ""))
        impacto = _normalize_impacto(item.get("impacto", ""))
        pregunta = (item.get("pregunta_ia") or "").strip()
        if not pregunta:
            pregunta = f"¿Puedes explicarme más sobre: {titulo}?"

        if "bugambilia" in (titulo + descripcion).lower() or categoria == "INVERSIÓN":
            has_bugambilias_inversion = True

        consejos.append(
            {
                "titulo": titulo,
                "descripcion": descripcion,
                "categoria": categoria,
                "impacto": impacto,
                "pregunta_ia": pregunta,
            }
        )

    if not has_bugambilias_inversion:
        if len(consejos) >= TOTAL_CONSEJOS:
            consejos[-1] = dict(CONSEJO_BUGAMBILIAS_DEFAULT)
        else:
            consejos.append(dict(CONSEJO_BUGAMBILIAS_DEFAULT))

    # Asegurar exactamente TOTAL_CONSEJOS (6 tarjetas)
    for extra in CONSEJOS_EXTRA_DEFAULTS:
        if len(consejos) >= TOTAL_CONSEJOS:
            break
        # Evitar títulos duplicados
        titulos_existentes = {c["titulo"].lower() for c in consejos}
        if extra["titulo"].lower() not in titulos_existentes:
            consejos.append(dict(extra))

    consejos = consejos[:TOTAL_CONSEJOS]

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

    consejos.append(dict(CONSEJO_BUGAMBILIAS_DEFAULT))

    for extra in CONSEJOS_EXTRA_DEFAULTS:
        if len(consejos) >= TOTAL_CONSEJOS:
            break
        titulos_existentes = {c["titulo"].lower() for c in consejos}
        if extra["titulo"].lower() not in titulos_existentes:
            consejos.append(dict(extra))

    consejos = consejos[:TOTAL_CONSEJOS]

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

