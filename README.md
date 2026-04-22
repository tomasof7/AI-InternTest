# Rappi Store Availability Dashboard

Plataforma de inteligencia de datos que visualiza la disponibilidad de tiendas Rappi y responde preguntas analíticas en lenguaje natural usando un asistente de IA con RAG.

**Stack:** Angular 18 · FastAPI · SQLite · Groq (llama-3.1-8b) · Chart.js

---

## El problema

Los equipos de operaciones necesitan monitorear patrones de disponibilidad de tiendas a lo largo del tiempo para detectar anomalías, picos de demanda y ventanas de baja actividad — sin escribir consultas SQL ni esperar a un analista de datos.

Esta plataforma lo resuelve combinando:
- **Análisis visual** — gráficos interactivos de 67,141 puntos de datos históricos
- **IA conversacional** — preguntas en lenguaje natural respondidas con contexto real de la base de datos (RAG), sin alucinaciones

---

## Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| Gráfico de serie de tiempo | Serie completa de disponibilidad, muestreada para rendimiento fluido |
| Gráfico de promedio diario | Barras agregadas por día |
| Patrón horario | Ciclo diurno promedio de 24 horas |
| Gráfico Min/Max/Promedio | Variación diaria de disponibilidad |
| Chatbot RAG | Groq LLM fundamentado en consultas SQLite en tiempo real |
| Página de Analytics | Tabla por día + mapa de calor por hora + insights automáticos |
| Página de Arquitectura | Diagrama del sistema, flujo RAG, referencia de endpoints |

---

## Arquitectura

```
Navegador (Angular 18)
  ├── /dashboard     → KPIs + 4 gráficos Chart.js
  ├── /insights      → Chatbot RAG (interfaz estilo ChatGPT)
  ├── /analytics     → Desglose por día y por hora
  ├── /architecture  → Diagramas del sistema
  └── /about         → Contexto del proyecto

        │  HTTP REST
        ▼

FastAPI (Python)
  ├── GET  /api/data    → 67,141 puntos de serie temporal + KPIs
  ├── POST /api/chat    → Pipeline RAG → Groq LLM
  └── GET  /api/health  → Estado de la base de datos

        │  sqlite3
        ▼

SQLite (data/availability.db)
  └── tabla: availability
        columnas: id, plot_name, metric, timestamp, value, source_file
        índices: timestamp, metric, (metric, timestamp)
        filas: 67,141
```

### Flujo RAG (Chatbot)

```
Pregunta del usuario
    │
    ▼
1. Análisis de keywords   → detecta "hora", "día", "pico", "mínimo"…
    │
    ▼
2. Consulta SQLite        → GROUP BY hour/date, ORDER BY value, etc.
    │
    ▼
3. Construcción del prompt → datos reales inyectados en el system prompt
    │
    ▼
4. Groq LLM               → llama-3.1-8b-instant genera la respuesta
    │
    ▼
Respuesta fundamentada en datos reales — sin alucinaciones
```

---

## Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| Frontend | Angular | 18 | SPA con routing, standalone components |
| Frontend | TypeScript | 5.9 | Lógica de componentes con tipado estático |
| Frontend | Chart.js | 4.5 | Visualización de datos interactiva |
| Backend | FastAPI | 0.104+ | API REST, async, documentación automática |
| Backend | Python | 3.10+ | Procesamiento de datos, orquestación RAG |
| Backend | Groq SDK | 0.4+ | Integración con LLM |
| Base de datos | SQLite | built-in | 67K registros, consultas indexadas |
| Datos | Pandas | 2.0+ | Pipeline CSV (formato wide → long) |
| Datos | Pydantic | 2.x | Validación de modelos de la API |

---

## Estructura del proyecto

```
AI-InternTest/
│
├── backend/
│   ├── main.py              # App FastAPI — 3 endpoints
│   ├── chatbot.py           # Lógica RAG — búsqueda SQLite + Groq LLM
│   ├── data_processor.py    # Parser de CSV (wide → long, normalización de timestamps)
│   ├── init_db.py           # Carga el CSV procesado en SQLite
│   ├── models.py            # Modelos Pydantic para request/response
│   └── requirements.txt
│
├── data/
│   ├── availability.db      # SQLite — 67,141 registros (incluido para demo)
│   └── raw/                 # CSVs fuente — en .gitignore (201 archivos)
│
├── scripts/
│   └── process_data.py      # Pipeline ETL de una sola vez (CSVs → CSV procesado)
│
├── frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── dashboard/    # KPIs + 4 gráficos
│       │   ├── insights/     # Chatbot RAG
│       │   ├── analytics/    # Desglose por día y hora
│       │   ├── architecture/ # Diagramas del sistema
│       │   └── about/        # Contexto del proyecto
│       ├── components/
│       │   ├── layout/       # Shell: sidebar + navbar
│       │   ├── sidebar/      # Navegación
│       │   └── navbar/       # Barra superior + breadcrumb
│       └── services/
│           ├── data.service.ts   # GET /api/data
│           └── chat.service.ts   # POST /api/chat
│
├── .env.example             # Plantilla de variables de entorno
└── README.md
```

---

## Instalación y ejecución

### Requisitos previos

- Python 3.10+
- Node.js 18+
- npm

### 1. Clonar el repositorio

```bash
git clone https://github.com/tomasof7/AI-InternTest.git
cd AI-InternTest
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y agrega tu clave de API de Groq:

```env
GROQ_API_KEY=tu_clave_aqui
```

Obtén una clave **gratuita** (sin tarjeta de crédito) en [console.groq.com/keys](https://console.groq.com/keys).

### 3. Iniciar el backend

```bash
cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### 4. Iniciar el frontend

```bash
cd frontend
npm install
npx ng serve
# → http://localhost:4200
```

> La base de datos SQLite (`data/availability.db`) está incluida en el repositorio, por lo que no es necesario ejecutar el pipeline de datos para arrancar la app.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `GROQ_API_KEY` | Sí | Clave de API de Groq para el LLM. Gratuita en [console.groq.com](https://console.groq.com) |
| `ENV` | No | `development` o `production` (por defecto: `development`) |
| `DEBUG` | No | Activa logs detallados (por defecto: `true`) |

Si falta `GROQ_API_KEY`, el servidor muestra un error claro al iniciar:

```
ValueError: ❌ GROQ_API_KEY no está configurada en .env
   Obtén una gratis en: https://console.groq.com
```

---

## Cómo funciona

### Pipeline de datos (proceso único, ya ejecutado)

```
201 archivos CSV (formato wide)
    │  scripts/process_data.py
    ▼
data/processed/availability_processed.csv   (67,141 filas)
    │  backend/init_db.py
    ▼
data/availability.db   (SQLite, 3 índices, consultas < 10ms)
```

Cada CSV contenía ~10 minutos de mediciones con granularidad de 10 segundos en formato wide (columnas = timestamps, filas = métrica). El pipeline:
1. Parsea timestamps verbosos: `"Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"` → ISO 8601
2. Transpone de formato wide → long
3. Elimina duplicados en ventanas de tiempo superpuestas entre archivos
4. Normaliza a UTC y carga en SQLite

### API

```
GET  /api/data
     → Retorna los 67,141 DataPoints + KPIs (min, max, promedio, total)
     → Opcional: ?from_date=2026-02-05&to_date=2026-02-06

POST /api/chat
     Body: { "question": "¿A qué hora hay mayor disponibilidad?" }
     → Ejecuta el pipeline RAG → retorna respuesta del LLM fundamentada en datos
```

---

## Uso de IA (RAG)

El chatbot usa **Retrieval-Augmented Generation (RAG)** en lugar de una llamada directa al LLM:

**¿Por qué RAG?**
- Los LLMs no tienen conocimiento de este dataset específico
- Una llamada directa produciría números inventados (alucinaciones)
- RAG fundamenta cada respuesta en resultados reales de consultas SQL

**Implementación (`backend/chatbot.py`):**

```python
def answer(self, question: str) -> str:
    # 1. Consultar SQLite para obtener agregados relevantes
    summary = self._fetch_data_summary()           # estadísticas globales
    context = self._fetch_relevant_data(question)  # consultas por keywords

    # 2. Inyectar datos reales en el system prompt
    system_prompt = f"Tienes acceso a: {summary}\n{context}\n..."

    # 3. Llamar al Groq LLM con contexto fundamentado
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": system_prompt}, ...]
    )
```

El LLM tiene instrucciones explícitas de responder solo con los datos proporcionados y decir "no tengo datos para eso" cuando la pregunta esté fuera de alcance.

---

## Decisiones técnicas

**FastAPI sobre Flask/Express** — soporte async nativo, documentación OpenAPI automática, validación Pydantic sin código extra.

**Groq sobre OpenAI/Anthropic** — tier gratuito sin tarjeta de crédito, ~300ms de respuesta (10x más rápido que GPT-4), capacidad suficiente para preguntas sobre datos estructurados.

**SQLite sobre PostgreSQL** — autocontenido, sin infraestructura, consultas sub-10ms sobre 67K filas con índices correctos. Una versión de producción usaría Postgres.

**Angular sobre React** — tipado fuerte con TypeScript, inyección de dependencias nativa, OnPush change detection para rendimiento, routing sin librerías adicionales.

**Chart.js sobre D3** — API declarativa adecuada para los tipos de gráficos requeridos; D3 es sobredimensionado para este caso y añade complejidad sin beneficio.

**Muestreo en serie de tiempo** — renderizar los 67,141 puntos bloquearía el navegador. El frontend muestrea cada N puntos para mostrar ~500 preservando el patrón visual.

---

## Mejoras futuras

- [ ] Filtro por rango de fechas en el dashboard
- [ ] WebSocket para streaming de datos en tiempo real
- [ ] Historial de chat persistente (localStorage o BD)
- [ ] Exportar gráficos como PNG/CSV
- [ ] Autenticación con JWT
- [ ] Docker Compose para arranque con un solo comando
- [ ] Reemplazar SQLite con PostgreSQL para producción
- [ ] Tests unitarios (pytest para backend, Jasmine para frontend)
- [ ] Pipeline CI/CD con GitHub Actions

---

## Referencia de la API

Documentación interactiva completa disponible en `http://localhost:8000/docs` cuando el backend está corriendo.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor + conteo de registros |
| `GET` | `/api/data` | Serie temporal + KPIs |
| `POST` | `/api/chat` | Endpoint del chatbot RAG |

---

## Dataset

- **Fuente:** 201 archivos CSV exportados desde monitoreo sintético de Splunk/SignalFx
- **Métrica:** `synthetic_monitoring_visible_stores` — número de tiendas Rappi visibles en cada medición
- **Período:** 1 al 11 de Febrero de 2026
- **Granularidad:** 10 segundos
- **Rango de valores:** 0 a 6,198,472 tiendas
- **Total de registros:** 67,141

Los CSVs crudos y el CSV procesado intermedio están excluidos del repositorio (ver `.gitignore`). La base de datos SQLite pre-construida está incluida para que la app funcione inmediatamente después de clonar.
