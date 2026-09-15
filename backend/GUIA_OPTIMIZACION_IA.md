# 🧠 Guía de Optimización de la IA (Groq LLM) - FinanzasTrack

Esta guía documenta los pasos exactos para optimizar el consumo de tokens, reducir la latencia y evitar el error **`HTTP 429 (Rate Limit Exceeded)`** en la API de Groq cuando el volumen de datos de los usuarios o las consultas frecuentes saturen la ventana de tokens por minuto (TPM).

---

## 📌 ¿Cuándo aplicar esta optimización?

Aplica estos ajustes si notas que:
1. Al hacer **2 o más preguntas seguidas en menos de 1 minuto**, la IA responde con el mensaje de contingencia local:
   > *"En este momento el asistente avanzado de IA no se encuentra disponible..."*
2. Usuarios con **muchas transacciones históricas** experimentan demoras o fallos en el chat.
3. Deseas reducir a la mitad el costo y consumo de tokens por mensaje.

---

## 🛠️ Modificaciones en `backend/finanzas/ia_service.py`

### 1. Reducir transacciones recientes e historial
Ubica las constantes en las líneas ~24-25:

```python
# --- ESTADO ESTÁNDAR (Completo) ---
MAX_HISTORY = 8
MAX_RECENT_TX = 30

# --- ESTADO OPTIMIZADO (Ahorro de tokens) ---
MAX_HISTORY = 6
MAX_RECENT_TX = 15
```

---

### 2. Reducir listado de depósitos de ahorro
Ubica la consulta `savings_qs` dentro de `build_financial_context` (línea ~188):

```python
# --- ESTADO ESTÁNDAR ---
savings_qs = (
    Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO)
    .order_by("-fecha", "-creado_en")[:20]
)

# --- ESTADO OPTIMIZADO ---
savings_qs = (
    Transaction.objects.filter(usuario=user, tipo=Transaction.Tipo.AHORRO)
    .order_by("-fecha", "-creado_en")[:10]
)
```

---

### 3. Compactar respuestas previas en el historial
Ubica la función `_normalize_history` (línea ~605):

```python
# --- ESTADO ESTÁNDAR (Recorte a 500 caracteres) ---
if rol == "assistant" and len(contenido) > 500:
    contenido = contenido[:500] + "..."

# --- ESTADO OPTIMIZADO (Recorte a 350 caracteres) ---
if rol == "assistant" and len(contenido) > 350:
    contenido = contenido[:350] + "..."
```

---

### 4. Salto inmediato ante Error HTTP 429 (Sin bloqueos)
Ubica el bloque `except urllib.error.HTTPError as exc:` en `_single_groq_request` (línea ~655):

```python
# --- ESTADO ESTÁNDAR (Reintenta con el mismo modelo esperando 1 segundo) ---
except urllib.error.HTTPError as exc:
    body = exc.read().decode("utf-8", errors="replace")
    is_retryable = exc.code == 429 or (500 <= exc.code <= 599)
    logger.warning("Groq (%s) HTTP %d intento %d: %s", model, exc.code, attempt + 1, body[:200])
    if is_retryable and attempt < max_retries - 1:
        time.sleep(1.0 * (attempt + 1))
        continue
    raise RuntimeError(f"Groq ({model}) HTTP {exc.code}: {body}") from exc

# --- ESTADO OPTIMIZADO (Si da 429, salta directo al modelo de respaldo) ---
except urllib.error.HTTPError as exc:
    body = exc.read().decode("utf-8", errors="replace")
    logger.warning("Groq (%s) HTTP %d intento %d: %s", model, exc.code, attempt + 1, body[:200])
    if exc.code == 429:
        raise RuntimeError(f"Groq ({model}) Rate Limit 429: {body}") from exc
    is_retryable = 500 <= exc.code <= 599
    if is_retryable and attempt < max_retries - 1:
        time.sleep(1.0 * (attempt + 1))
        continue
    raise RuntimeError(f"Groq ({model}) HTTP {exc.code}: {body}") from exc
```

---

### 5. Ajuste de Timeout y Diagnóstico en Logs
Ubica `request_groq_completion` (línea ~675):

```python
# --- ESTADO ESTÁNDAR ---
def request_groq_completion(
    *,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2048,
    response_format: dict | None = None,
    timeout: int = 35,
) -> str:
...
    except RuntimeError as exc:
        last_error = exc
        logger.warning("Fallo en modelo %s, intentando siguiente en lista de respaldo...", model_name)
        continue

# --- ESTADO OPTIMIZADO (Timeout a 25s y log con motivo del fallo) ---
def request_groq_completion(
    *,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2048,
    response_format: dict | None = None,
    timeout: int = 25,
) -> str:
...
    except RuntimeError as exc:
        last_error = exc
        logger.warning("Fallo en modelo %s (%s), intentando siguiente en lista de respaldo...", model_name, exc)
        continue
```

---

## 📊 Comparativa de Rendimiento

| Métrica | Modo Estándar (Actual) | Modo Optimizado |
| :--- | :--- | :--- |
| **Tokens por pregunta (promedio)** | ~3,500 a 4,500 tokens | ~1,800 a 2,200 tokens (**-50%**) |
| **Consultas permitidas por minuto (TPM)** | 1 a 2 preguntas consecutivas | 3 a 5 preguntas consecutivas |
| **Velocidad de respuesta** | Normal (~1.5s - 3s) | Rápida (~0.8s - 1.5s) |
| **Comportamiento ante error 429** | Reintenta 1s y cae a contingencia | Salta inmediato al modelo `gpt-oss-20b` |

---

## 🧪 Verificación tras aplicar cambios

Cada vez que apliques o reviertas estos cambios, ejecuta la suite de pruebas para confirmar que todo el backend responda con éxito:

```bash
cd backend
.venv\Scripts\python.exe manage.py test
```
*(Debe reportar: `Ran 45 tests ... OK`)*
