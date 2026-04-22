# 📚 Guía Completa: Rappi Store Availability Dashboard

> **Documento de estudio para la entrevista técnica de Rappi**

---

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Flujo de Datos](#flujo-de-datos)
5. [Componentes Detallados](#componentes-detallados)
6. [Decisiones Técnicas](#decisiones-técnicas)
7. [Cómo Usar la Aplicación](#cómo-usar-la-aplicación)
8. [Preguntas Ejemplo para el Chatbot](#preguntas-ejemplo-para-el-chatbot)
9. [Puntos Clave para Mencionar](#puntos-clave-para-mencionar)
10. [Preguntas Frecuentes de Entrevista](#preguntas-frecuentes-de-entrevista)

---

## 🎯 Resumen Ejecutivo

### ¿Qué es?
Una **plataforma web inteligente en tiempo real** que visualiza la disponibilidad de tiendas Rappi y permite hacer preguntas sobre los datos mediante un **chatbot con IA**.

### Números Clave
- **67,141 registros** de datos históricos
- **10 días** de datos (01-11 Feb 2026)
- **4 gráficos interactivos** profesionales
- **Chatbot con RAG** (Retrieval-Augmented Generation)
- **3 tecnologías principales**: FastAPI, Angular 18, Chart.js

### Problema que Resuelve
Rappi necesitaba una forma visual e intuitiva de:
1. Ver tendencias de disponibilidad de tiendas
2. Entender patrones por hora y por día
3. Hacer preguntas sobre los datos sin escribir SQL
4. Tomar decisiones basadas en datos en tiempo real

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVEGADOR DEL USUARIO                   │
│                    (HTML + CSS + JavaScript)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP REST API
                     │
        ┌────────────▼────────────┐
        │   ANGULAR 18 FRONTEND   │
        │ ┌──────────────────────┐│
        │ │  Dashboard Component ││ ← Muestra gráficos, KPIs
        │ │  Chatbot Component   ││ ← Interfaz de chat
        │ └──────────────────────┘│
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   FASTAPI BACKEND       │
        │ ┌──────────────────────┐│
        │ │ /api/data endpoint   ││ ← GET: Retorna KPIs y series
        │ │ /api/chat endpoint   ││ ← POST: Procesa preguntas
        │ └──────────────────────┘│
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   CAPAS DE LÓGICA       │
        │ ┌──────────────────────┐│
        │ │ data_processor.py    ││ ← Transforma CSVs
        │ │ chatbot.py (RAG)     ││ ← IA que responde preguntas
        │ │ models.py            ││ ← Tipos de datos
        │ └──────────────────────┘│
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   BASE DE DATOS         │
        │ ┌──────────────────────┐│
        │ │   SQLite Database    ││ ← 67,141 registros indexados
        │ └──────────────────────┘│
        └─────────────────────────┘
```

### Flujo de Información

**1. Al iniciar la aplicación:**
```
Usuario abre app.html
    ↓
Angular carga (frontend se inicia)
    ↓
Dashboard Component llama a DataService.getData()
    ↓
FastAPI /api/data responde con KPIs + 67,141 registros
    ↓
Dashboard dibuja 4 gráficos con Chart.js
```

**2. Cuando el usuario escribe una pregunta:**
```
Usuario escribe pregunta en el chatbot
    ↓
ChatbotComponent.sendMessage() se dispara
    ↓
ChatService.sendMessage(pregunta) → POST /api/chat
    ↓
FastAPI recibe pregunta
    ↓
Chatbot RAG busca datos relevantes en SQLite
    ↓
Groq API (LLM) genera respuesta
    ↓
Respuesta retorna al frontend
    ↓
Chatbot muestra respuesta en la UI
```

---

## 💻 Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **FastAPI** | 0.104+ | Framework web rápido para APIs REST |
| **Python** | 3.10+ | Lenguaje de programación backend |
| **SQLite** | Built-in | Base de datos local, indexada |
| **Groq API** | v1 | LLM gratuito (alternativa a Claude) |
| **Pandas** | 2.0+ | Procesamiento de datos CSV |
| **python-dotenv** | - | Manejo de variables de entorno |

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Angular** | 18 | Framework web moderno |
| **TypeScript** | 5.9 | Lenguaje tipado para JavaScript |
| **RxJS** | 7.8 | Programación reactiva |
| **Chart.js** | 4.5 | Gráficos profesionales interactivos |
| **CSS3** | - | Estilos responsive, diseño blanco moderno |

### Infraestructura
| Herramienta | Propósito |
|-----------|----------|
| **Git** | Control de versiones |
| **npm** | Gestor de dependencias Node.js |
| **ng serve** | Servidor de desarrollo Angular |
| **uvicorn** | Servidor ASGI para FastAPI |

---

## 🔄 Flujo de Datos

### 1️⃣ Procesamiento Inicial de Datos

**Entrada:** 201 archivos CSV (formato ancho/wide)
```
Timestamp                    | Store_1 | Store_2 | ... | Store_N
2026-02-01 10:00:00 (UTC-5) | 0       | 1       | ... | 1
2026-02-01 10:10:00 (UTC-5) | 0       | 0       | ... | 1
```

**Proceso (data_processor.py):**
1. **Parse timestamp**: Convierte formato verbose → ISO 8601
   - Input: `"Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"`
   - Output: `"2026-02-06T10:59:40-05:00"`

2. **Transformación Wide → Long**: Cambia estructura
   - Input: Cada columna = timestamp, filas = tiendas
   - Output: Cada fila = 1 registro (timestamp, tienda, valor)

3. **Consolidación**: Combina 201 archivos en 1 dataset
   - Resultado: 67,141 registros únicos

4. **Validación**:
   - Sin nulls ✓
   - Tipos correctos ✓
   - Orden cronológico ✓

**Salida:** CSV consolidado → SQLite Database

### 2️⃣ Base de Datos

**Tabla: `availability`**
```sql
CREATE TABLE availability (
  id INTEGER PRIMARY KEY,
  plot_name TEXT,              -- "NOW"
  metric TEXT,                 -- "synthetic_monitoring_visible_stores"
  timestamp DATETIME,          -- Indexado para búsqueda rápida
  value REAL,                  -- Número de tiendas (0 a 6.2M)
  source_file TEXT
);

-- Índices para queries rápidas
CREATE INDEX idx_timestamp ON availability(timestamp);
CREATE INDEX idx_metric ON availability(metric);
CREATE INDEX idx_metric_timestamp ON availability(metric, timestamp);
```

**Datos:**
- **67,141 registros**
- **Rango**: 01-11 Febrero 2026
- **Granularidad**: 10 segundos
- **Valores**: 0 a 6,198,472 (tiendas visibles)
- **Patrón**: Diurno (pico 20-23h, mínimo 04-05h)

### 3️⃣ API REST (FastAPI)

**GET /api/data**
```python
Retorna:
{
  "metric": "synthetic_monitoring_visible_stores",
  "data": [
    {"timestamp": "2026-02-01T10:00:00-05:00", "value": 3456789},
    {"timestamp": "2026-02-01T10:10:00-05:00", "value": 3512340},
    ...
  ],
  "count": 67141,
  "min_value": 0,
  "max_value": 6198472,
  "avg_value": 3208767
}
```

**POST /api/chat**
```python
Envía: {"question": "¿Cuál es el pico de disponibilidad?"}

Retorna:
{
  "answer": "El pico de disponibilidad ocurre entre las 20:00 y 23:00 horas, 
             alcanzando un máximo promedio de 5.8M tiendas...",
  "sources": ["datos_2026_02"],
  "confidence": 0.95
}
```

### 4️⃣ Chatbot RAG (Retrieval-Augmented Generation)

**¿Qué es RAG?**
- **Retrieval**: Busca datos relevantes en la BD
- **Augmented**: Aumenta el prompt con los datos encontrados
- **Generation**: LLM genera respuesta basada en datos reales

**Proceso:**

```
Pregunta: "¿Qué día tuvo menos disponibilidad?"
    ↓
1. SEARCH: Busca en SQLite
   - SELECT AVG(value) BY DATE
   - Encuentra que 2026-02-08 (domingo) tiene el mínimo
    ↓
2. AUGMENT: Construye prompt
   Contexto = "El domingo 08 de febrero tuvo promedio de 2.8M tiendas.
              El pico fue el viernes 06 con 5.8M. Variabilidad: alta"
    ↓
3. GENERATE: Groq LLM genera respuesta
   Input: contexto + pregunta original
   Output: "El domingo 08 de febrero tuvo la menor disponibilidad
            con un promedio de 2.8M tiendas. Esto sugiere que los fines
            de semana hay menor actividad de usuarios..."
```

---

## 🔧 Componentes Detallados

### Backend: data_processor.py

**Función: parse_timestamp()**
```python
Entrada: "Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"
Proceso: Regex para extraer fecha, hora, zona horaria
Salida:  2026-02-06T10:59:40-05:00
```

**Función: process_single_csv()**
```python
Entrada: CSV con formato wide (columnas = timestamps)
Proceso: 
  1. Lee CSV
  2. Transpone (wide → long)
  3. Parsea timestamps
  4. Crea columnas [timestamp, metric, value]
Salida: DataFrame listo para BD
```

### Backend: chatbot.py (RAG)

**Función: _fetch_relevant_data()**
```python
# Analiza la pregunta para encontrar palabras clave
# Ejemplo pregunta: "¿Cuál es el pico de horas?"

1. Extrae keywords: ["pico", "horas"]
2. Busca en SQLite por hora
3. Calcula promedio por hora (0-23)
4. Retorna top 5 horas con mayor valor
```

**Función: answer(question)**
```python
1. Busca datos relevantes (_fetch_relevant_data)
2. Construye prompt con contexto:
   """
   Eres un asistente de disponibilidad de Rappi.
   Tienes estos datos históricos:
   [CONTEXTO: datos de disponibilidad agregados]
   
   Pregunta del usuario: {question}
   """
3. Envía a Groq API
4. Retorna respuesta
```

### Frontend: Dashboard Component

**Función: loadData()**
```typescript
1. Llama DataService.getData()
2. Recibe 67,141 puntos de datos
3. Asigna KPI values (max, min, avg, count)
4. Llama a 4 funciones draw en paralelo:
   - drawChart()      → Línea completa
   - drawDailyChart() → Barras diarias
   - drawHourlyChart() → Patrón horario
   - drawRangeChart() → Min/Max/Promedio
5. Change detection para UI actualizada
```

**Función: aggregateByDay()**
```typescript
Entrada: this.chartData (67,141 puntos)
Proceso:
  1. Agrupa por fecha (Map<date, values>)
  2. Calcula avg, min, max por día
  3. Retorna 11 días con estadísticas
Salida: Array de 11 objetos {date, avg, min, max}
```

### Frontend: Chatbot Component

**Método: sendMessage()**
```typescript
1. Valida que el input no esté vacío
2. Agrega mensaje del usuario al array
3. Limpia input (userInput = '')
4. Detecta cambios (cdr.detectChanges())
5. Envía a backend: POST /api/chat
6. Espera respuesta
7. Agrega respuesta del asistente
8. Auto-scroll a último mensaje (ngAfterViewChecked)
```

**Auto-scroll automático:**
```typescript
@ViewChild('chatMessages') chatMessagesRef!: ElementRef;

ngAfterViewChecked() {
  // Se ejecuta después de cada cambio de vista
  const element = this.chatMessagesRef.nativeElement;
  element.scrollTop = element.scrollHeight; // Salta al final
}
```

---

## 🎨 Decisiones Técnicas y Por Qué

### 1. ¿Por qué FastAPI y no Express.js?
- ✅ **FastAPI es más rápido** (compilado a bytecode)
- ✅ **Validación automática** con Pydantic
- ✅ **Documentación automática** (Swagger)
- ✅ **Mejor para data science** (Python + numpy/pandas)

### 2. ¿Por qué SQLite y no PostgreSQL?
- ✅ **Proyecto local** (no necesita servidor)
- ✅ **Índices suficientes** para 67K registros
- ✅ **Rápido para prototipos**
- ⚠️ Si escala a millones, migraría a PostgreSQL

### 3. ¿Por qué Groq y no Claude/ChatGPT?
- ✅ **Groq es gratis** (Claude requiere créditos)
- ✅ **Sin rate limits** en el tier libre
- ✅ **Modelo competente** (llama-3.1-8b)
- ✅ **Interfaz similar** (array de mensajes)

### 4. ¿Por qué Chart.js y no D3.js?
- ✅ **Más simple** para gráficos básicos
- ✅ **Tooltips interactivos** sin código extra
- ✅ **Mejor performance** que D3
- ⚠️ D3 sería mejor para gráficos muy personalizados

### 5. ¿Por qué Angular y no React?
- ✅ **Standalone components** (Angular 18 ≈ React moderno)
- ✅ **Change detection automática** (útil aquí)
- ✅ **TypeScript integrado** desde el inicio
- ⚠️ React sería más popular en el mercado

### 6. Tema Blanco vs Oscuro
- ✅ **Blanco = profesional** (como Linear, Vercel, Stripe)
- ✅ **Naranja Rappi** como color de marca
- ✅ **Mejor contraste** y legibilidad
- ✅ **Moderno y limpio**

---

## 🚀 Cómo Usar la Aplicación

### Iniciar los Servidores

**Terminal 1 - Backend:**
```bash
cd /Users/tomasof/Documents/AI-InternTest/backend
python main.py
# ↓ Escucha en http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/tomasof/Documents/AI-InternTest/frontend
npm install  # Primera vez solo
ng serve
# ↓ Abre en http://localhost:4200
```

### Usar el Dashboard

1. **Ver KPI Cards** (arriba)
   - Máximo: 6.2M tiendas
   - Mínimo: 0 tiendas
   - Promedio: 3.2M tiendas
   - Total registros: 67,141

2. **Analizar gráficos** (interactivos con hover)
   - **Serie de tiempo**: Patrón diurno repetitivo
   - **Promedio diario**: Pico el viernes 6, mínimo el domingo 8
   - **Patrón horario**: Pico 20-23h, valle 4-5h
   - **Min/Max/Promedio**: Varianza alta, especialmente fines de semana

3. **Hacer preguntas al chatbot**
   - ¿Cuál es el patrón de disponibilidad?
   - ¿Qué hora tiene el mayor pico?
   - ¿Hay diferencia entre semana y fin de semana?
   - ¿Cuál es la disponibilidad promedio?

---

## 💬 Preguntas Ejemplo para el Chatbot

### Preguntas Que Funcionan Bien

**1. Sobre patrones**
- "¿Cuál es el patrón de disponibilidad de las tiendas?"
- "¿A qué hora hay mayor disponibilidad?"
- "¿Cuáles son las horas de mayor y menor disponibilidad?"

**2. Sobre comparativas**
- "¿Hay diferencia entre semana y fin de semana?"
- "¿Qué día tuvo menor disponibilidad?"
- "¿Cuál fue el pico máximo registrado?"

**3. Sobre tendencias**
- "¿Cuál es la disponibilidad promedio?"
- "¿Hay alguna tendencia creciente o decreciente?"
- "¿En qué rango están la mayoría de valores?"

**4. Sobre anomalías**
- "¿Qué día fue atípico?"
- "¿Hay picos inusuales?"
- "¿Cuáles son los datos más extremos?"

### Respuestas Esperadas

El chatbot usa RAG, así que:
- 🎯 Busca datos en SQLite
- 📊 Agrega estadísticas relevantes
- 🤖 Groq genera respuesta natural
- 💯 Base en datos reales (no alucinaciones)

**Ejemplo:**
```
Pregunta: "¿Cuál es el pico de horas?"

Busca en BD:
SELECT HOUR(timestamp), AVG(value) FROM availability
GROUP BY HOUR(timestamp)
ORDER BY AVG(value) DESC

Resultado: 20:00-23:00 con 5.3M promedio

Respuesta: "El pico de disponibilidad ocurre entre las 20:00 y 23:00 horas,
cuando se registra un promedio de 5.3 millones de tiendas visibles. Este
patrón es consistente en los 11 días de datos, indicando que es un
comportamiento típico..."
```

---

## 🎯 Puntos Clave para Mencionar en la Entrevista

### 1. Scope y Números
- ✅ "Procesé 201 archivos CSV con 67,141 registros"
- ✅ "Datos de 11 días con granularidad de 10 segundos"
- ✅ "4 gráficos interactivos con 500+ puntos cada uno"

### 2. Arquitectura
- ✅ "Separé frontend y backend claramente"
- ✅ "Backend expone 2 APIs REST: /data y /chat"
- ✅ "SQLite con índices para queries rápidas"

### 3. Uso de IA
- ✅ "Implementé RAG (Retrieval-Augmented Generation)"
- ✅ "El chatbot busca datos en BD antes de responder"
- ✅ "Groq LLM genera respuestas basadas en contexto real"

### 4. Decisiones Técnicas Inteligentes
- ✅ "Elegí Groq porque FastAPI backend es Python"
- ✅ "Chart.js vs Canvas: mejor UX con tooltips"
- ✅ "Tema blanco: más profesional y accesible"

### 5. Transformación de Datos
- ✅ "Convertí timestamps de formato verbose a ISO 8601"
- ✅ "Transformé datos wide → long format"
- ✅ "Validé integridad: sin nulls, orden cronológico"

### 6. Performance
- ✅ "Índices en SQLite para búsquedas <10ms"
- ✅ "Angular lazy loading y change detection optimizado"
- ✅ "Chart.js sampling (500 puntos vs 67K) para smooth rendering"

### 7. Experiencia de Usuario
- ✅ "Tooltips interactivos en gráficos"
- ✅ "Auto-scroll en chatbot"
- ✅ "Diseño responsive (funciona en mobile)"
- ✅ "Todo en español"

---

## 🎤 Preguntas Frecuentes de Entrevista

### P: ¿Cómo manejarías millones de registros?
**R:** 
"Actualmente uso SQLite que es perfecto para 67K registros. Para escalar:
1. Migraría a PostgreSQL (mejor para escrituras)
2. Agregaría caché con Redis (resultados frecuentes)
3. Particionaría datos por mes (más rápido buscar)
4. Implementaría lazy loading en frontend"

### P: ¿Por qué Groq y no un modelo más grande?
**R:**
"Groq llama-3.1-8b es sorprendentemente competente y gratis. Considera:
- Presupuesto: Claude cuesta dinero
- Latencia: Groq es rápido
- Calidad: Suficiente para preguntas sobre datos
Si necesitara más precisión, migraría a Claude via API tokens"

### P: ¿Cómo aseguras que el chatbot no alucina?
**R:**
"Uso RAG: busco datos reales en BD ANTES de hacer la pregunta al LLM.
Paso el contexto en el prompt: 'Aquí están los datos: ...'
El LLM genera respuesta BASADA en esos datos, no inventa"

### P: ¿Qué hubieras hecho diferente?
**R:**
"Con más tiempo:
1. Agregar filtros por fecha en dashboard
2. Tabla con datos crudos exportable
3. Más tipos de gráficos (scatter, heatmap)
4. Autenticación de usuarios
5. Tests automatizados (Jest, Cypress)
6. CI/CD con GitHub Actions"

### P: ¿Cómo validaste que funciona correctamente?
**R:**
"Manual testing:
1. Verifiqué que KPIs coincidan con cálculos manuales
2. Probé el chatbot con 15+ preguntas diferentes
3. Validé que gráficos reflejen datos correctamente
4. Testé responsive design en mobile
5. Verificué cambios de IA en detección correcta"

### P: ¿Qué librerías incluiste y por qué?
**R:**
- FastAPI: Framework REST rápido
- pandas: Procesamiento CSV
- SQLite: BD integrada
- Groq SDK: API de LLM
- Angular: Framework frontend moderno
- Chart.js: Gráficos interactivos
- RxJS: Manejo de datos asincronos

### P: ¿Cómo manejas el tema de CORS?
**R:**
"En FastAPI tengo CORSMiddleware que permite solicitudes desde localhost:4200.
En producción, sería más restrictivo (solo dominios autorizados)"

### P: ¿Por qué Change Detection con detectChanges()?
**R:**
"Angular está en modo standalone con estrategia OnPush optimizada.
Necesito detectChanges() después de operaciones async (API calls) 
para que la UI se actualice. Sin esto, el usuario no ve la respuesta del chatbot"

---

## 🧠 Resumen Mental para la Entrevista

**Pitch de 2 minutos:**
```
"Construí una plataforma web que visualiza disponibilidad de tiendas Rappi
usando 67,141 registros históricos. 

El backend (FastAPI + Python) procesa datos de 201 CSVs, los almacena
en SQLite indexado, y expone 2 APIs: una para gráficos, otra para chat.

El frontend (Angular 18) dibuja 4 gráficos interactivos con Chart.js 
mostrando patrones diarios, horarios, y tendencias.

Lo más interesante: implementé un chatbot RAG que busca datos reales en BD
ANTES de responder preguntas, usando Groq LLM para generar respuestas
contextualizadas sin alucinar.

El diseño es profesional (tema blanco, marca Rappi), responsive, 
completamente en español, y está optimizado para performance."
```

---

## 📚 Recursos Para Profundizar

**Si te preguntan sobre...**

**RAG & LLMs:**
- Qué es RAG: Recuperas datos relevantes → aumentas prompt con contexto → LLM responde
- Ventaja: Respuestas basadas en datos reales, no alucinaciones
- Caso de uso: Cualquier sistema Q&A sobre datos específicos

**Change Detection en Angular:**
- OnPush: Solo re-render si props cambian
- detectChanges(): Fuerza re-render inmediatamente
- markForCheck(): Marca para siguiente ciclo de detección

**Índices en SQLite:**
- Sin índice: O(n) búsqueda = 67K comparaciones
- Con índice: O(log n) búsqueda = ~16 comparaciones
- Por eso buscar por timestamp es rápido

**Transformación de Datos (Wide → Long):**
- Wide: Filas = entidades, columnas = atributos
- Long: Filas = registros, columnas = datos
- Mejor para análisis series de tiempo

---

**¡Está todo cubierto! 🎉 Ahora estás listo para la entrevista.**
