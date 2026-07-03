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

    payload = generate_consejos_with_groq(user)
    now = timezone.now()

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
