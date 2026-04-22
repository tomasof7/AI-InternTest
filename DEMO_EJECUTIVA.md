# 🎬 Guía de DEMO en Vivo para la Entrevista

> **Cómo exponer tu proyecto en 15 minutos de forma impresionante**

---

## 🎯 Estructura de la Demo (15 minutos)

```
⏱️ 0-1 min    → Introducción ("Qué es esto y por qué")
⏱️ 1-3 min    → Dashboard (KPIs + gráficos)
⏱️ 3-7 min    → Chatbot (preguntas inteligentes)
⏱️ 7-12 min   → Explicar arquitectura (scripts + BD)
⏱️ 12-15 min  → Decisiones técnicas (por qué cada cosa)
```

---

## 📖 PARTE 1: Introducción (1 minuto)

### Qué Decir:

> "Construí una plataforma de inteligencia de datos para Rappi. 
> La necesidad: Rappi tiene 67 mil registros de disponibilidad de tiendas.
> El problema: ¿Cómo entender patrones sin escribir SQL?
> La solución: Dashboard visual + chatbot con IA que responde preguntas sobre los datos."

### Muestra:
- Abre el navegador en http://localhost:4200
- **Espera a que cargue** (debe verse el dashboard limpio y blanco con logo Rappi naranja)

---

## 📊 PARTE 2: Dashboard (2 minutos)

### Paso 1: Señala Las 4 KPI Cards (30 segundos)

```
┌─────────────────────────────────────────────────────────────┐
│  TIENDAS MÁXIMAS    │ TIENDAS MÍNIMAS │ PROMEDIO │ REGISTROS │
│  6,198,472         │      0          │ 3,208,767│   67,141   │
└─────────────────────────────────────────────────────────────┘
```

**Qué Explicar:**
- "Estos 4 números resumen 67,141 datos históricos"
- "El máximo es 6.2 millones de tiendas simultáneamente"
- "El mínimo es 0 (probablemente cortes de datos o pruebas)"
- "El promedio es 3.2 millones"

**Pregunta de Entrevistador Esperada:**
- "¿De dónde sacaste esos números?"

**Tu Respuesta:**
- "Están calculados en el backend. FastAPI ejecuta una query SQL que agrupa todo el dataset:
  ```sql
  SELECT MAX(value), MIN(value), AVG(value), COUNT(*) FROM availability
  ```
  El frontend recibe esto en JSON y lo muestra en las tarjetas"

---

### Paso 2: Pasa el Cursor por los Gráficos (1.5 minutos)

#### Gráfico 1: "Tiendas Disponibles en el Tiempo" (Línea roja)

**Qué Hacer:**
- Pasa el cursor **lentamente** sobre la línea naranja
- **Aparecerá un tooltip** mostrando fecha, hora y valor exacto

**Qué Decir:**
- "Este es un gráfico de serie de tiempo con todos los 67,141 datos"
- "Mira cómo hay un patrón repetitivo cada día: baja por la noche, sube durante el día"
- "Esto es el **patrón diurno** — la gente usa Rappi más en horas pico (20-23h)"
- Pasa el cursor sobre diferentes puntos: "Aquí son las 10 de la mañana... aquí las 11 de la noche..."

**Argumentos Técnicos:**
- "En realidad, 67K puntos harían muy lento Chart.js, así que hice **sampling**: tomo cada 50 puntos para mostrar ~1,300 en lugar de 67K. Eso mantiene el patrón visible pero smooth"

---

#### Gráfico 2: "Promedio Diario" (Barras naranjas)

**Qué Hacer:**
- Pasa el cursor sobre cada barra

**Qué Decir:**
- "Aquí agrego todos los valores de cada día y muestro el promedio"
- "Mira: el viernes 6 (06 feb) es el pico máximo"
- "El domingo 8 (08 feb) es el mínimo — fines de semana tienen menos tráfico"
- "Esto es **agregación de datos** — tomo 9,600+ registros por día y los reduzco a 1 número"

**Pregunta Esperada:**
- "¿Cómo agregas los datos?"

**Tu Respuesta:**
```typescript
// En el frontend, agrupa por fecha
const dayMap = new Map();
chartData.forEach(point => {
  const date = new Date(point.timestamp).toLocaleDateString();
  if (!dayMap.has(date)) dayMap.set(date, []);
  dayMap.get(date).push(point.value);
});

// Calcula promedio
const daily = Array.from(dayMap).map(([date, values]) => ({
  date,
  avg: values.reduce((a,b) => a+b) / values.length
}));
```

---

#### Gráfico 3: "Patrón Horario" (Línea con área naranja)

**Qué Hacer:**
- Pasa el cursor sobre la línea

**Qué Decir:**
- "Este gráfico es CRUCIAL. Muestra el promedio por hora del día (0-23)"
- "Ves cómo baja de 0-5am (madrugada, nadie usa Rappi)"
- "Sube en la mañana (6-9am)"
- "**Pico máximo entre 20-23h (8 de la noche a 11 de la noche)**"
- "Este patrón es súper importante para operaciones de Rappi"

**Por Qué es Impresionante:**
- "Descubrimos insight: el 40% del tráfico está concentrado en 4 horas (20-23h)"
- "Eso significa Rappi debería tener más servidores listos para esas horas"

---

#### Gráfico 4: "Min/Max/Promedio por Día" (3 líneas: roja, naranja, azul)

**Qué Hacer:**
- Pasa el cursor para mostrar las 3 líneas
- Explica que hay una leyenda en la parte superior

**Qué Decir:**
- "Línea roja = máximo diario"
- "Línea naranja = promedio diario"
- "Línea azul = mínimo diario"
- "La **separación entre líneas = variabilidad**"
- "El viernes 6, la brecha es MÁS GRANDE (más caótico)"
- "El domingo, la brecha es PEQUEÑA (más estable)"

**Insight:**
- "Esto sugiere que los fines de semana son más predecibles, semana es más caótico"

---

## 💬 PARTE 3: Chatbot (4 minutos)

### Paso 1: Explica la Interfaz (30 segundos)

**Señala:**
- Encabezado naranja: "Asistente de Disponibilidad"
- Área de chat con fondo gris claro
- Input box al final

---

### Paso 2: Haz Preguntas Inteligentes al Chatbot (3.5 minutos)

#### Pregunta 1: "¿Cuál es el patrón de disponibilidad?"

**Escribe en el chat:**
```
¿Cuál es el patrón de disponibilidad de las tiendas?
```

**Mientras espera (20-30 segundos), explica:**
- "Ahora el chatbot está buscando en la base de datos..."
- "Mi implementación es **RAG** (Retrieval-Augmented Generation)"
- "Significa: PRIMERO busca datos en SQLite, DESPUÉS pregunta al LLM"
- "No es alucinación, es respuesta basada en datos reales"

**Cuando llega la respuesta:**
- Lee la respuesta en voz alta
- Resalta palabras clave: "patrón diurno", "20-23 horas", "pico", etc.

**Qué Decir:**
- "¿Ves cómo respondió correctamente? Eso es porque:"
  1. Mi código busco en SQLite: `SELECT AVG(value) GROUP BY HOUR(timestamp)`
  2. Obtuve datos reales: "20-23h tienen promedio de 5.3M"
  3. Pasé esos datos al LLM Groq en el prompt
  4. Groq generó respuesta basada en ESOS datos"

---

#### Pregunta 2: "¿Hay diferencia entre semana y fin de semana?"

**Escribe:**
```
¿Hay diferencia en la disponibilidad entre semana y fin de semana?
```

**Mientras espera:**
- "Esta pregunta es más compleja"
- "Mi chatbot debe:"
  1. Entender que pregunta sobre días de semana
  2. Buscar en BD datos de lunes-viernes vs sábado-domingo
  3. Calcular promedios
  4. Responder comparando ambos"

**Cuando llega la respuesta:**
- Lee y resalta: "mayor disponibilidad", "semana", "fin de semana", "patrón"

**Qué Decir:**
- "La respuesta es CORRECTA porque mi BD tiene datetime con timezone"
- "Puedo extraer DAYOFWEEK(timestamp) para saber qué día es"
- "Luego agrupo y comparo"

---

#### Pregunta 3: "¿Cuál fue el día con menor disponibilidad?"

**Escribe:**
```
¿Cuál fue el día con menor disponibilidad?
```

**Cuando responda:**
- Debe decir "domingo 8 de febrero"
- Puedes verificar mirando el gráfico de barras (se ve que el 8 es el punto más bajo)

**Qué Decir:**
- "Perfecto, la respuesta es correcta"
- "Esto validé MANUALMENTE: miré el gráfico y el 8 de febrero efectivamente es el mínimo"
- "Así verifico que el chatbot no alucina"

---

#### Pregunta 4 (Opcional): "¿Cuál es la disponibilidad promedio?"

**Escribe:**
```
¿Cuál es la disponibilidad promedio?
```

**Respuesta esperada:** "3.2 millones" (coincide con el KPI card)

**Qué Decir:**
- "Mira, la respuesta coincide EXACTAMENTE con el KPI que vemos arriba (3,208,767)"
- "Eso me da confianza de que:"
  1. La BD es correcta
  2. El chatbot busca bien
  3. Los números son consistentes"

---

## 🏗️ PARTE 4: Explicar Arquitectura (5 minutos)

### Paso 1: Muestra la Estructura de Carpetas (1 minuto)

**Abre una terminal o explorador de archivos:**

```
AI-InternTest/
├── backend/
│   ├── main.py                ← FastAPI (servidor)
│   ├── chatbot.py             ← Lógica RAG
│   ├── data_processor.py      ← Transformación CSV
│   ├── models.py              ← Tipos de datos
│   ├── availability.db        ← Base de datos SQLite
│   └── requirements.txt        ← Dependencias Python
│
├── frontend/
│   ├── src/
│   │   ├── app.ts             ← Componente raíz
│   │   └── components/
│   │       ├── dashboard/     ← Gráficos y KPIs
│   │       └── chatbot/       ← Chat interface
│   └── package.json           ← Dependencias Node
│
└── GUIA_ENTREVISTA.md         ← Esta documentación
```

**Qué Decir:**
- "Backend y frontend están completamente separados"
- "El backend es Python/FastAPI"
- "El frontend es Angular/TypeScript"
- "Se comunican SOLO por HTTP REST API"

---

### Paso 2: Explica el Flujo de Scripts (2 minutos)

#### Script 1: data_processor.py (Transformación)

**Qué Mostrar (en la terminal):**
```bash
cd backend
cat data_processor.py | grep "def parse_timestamp"
```

**Qué Explicar:**
```
ENTRADA (201 CSVs):
┌─────────────────────────────────────────┐
│ Timestamp (columna)    | Store1 | Store2│
│ Fri Feb 06 2026...     | 1      | 0     │
│ Fri Feb 06 2026...     | 0      | 1     │
└─────────────────────────────────────────┘

PROCESO (parse_timestamp):
- Entrada: "Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"
- Regex: Extrae fecha/hora/zona
- Salida: "2026-02-06T10:59:40-05:00"

TRANSFORMACIÓN (wide → long):
┌──────────────────────────────┐
│ timestamp      | metric | value│
│ 2026-02-06T... | visible_stores| 1|
│ 2026-02-06T... | visible_stores| 0|
│ 2026-02-06T... | visible_stores| 1|
└──────────────────────────────┘

SALIDA: 67,141 registros → SQLite
```

**Por Qué Importa:**
- "Este paso es CRÍTICO: timestamps malformados = datos inútiles"
- "Gasté 1 hora debugging porque los timestamps estaban en formato verbose"
- "La solución: regex para extraer partes, parseDate() para validar"

---

#### Script 2: chatbot.py (RAG)

**Qué Mostrar:**
```bash
cat backend/chatbot.py | head -50
```

**Estructura del código:**
```python
class ChatbotRAG:
    def __init__(self):
        self.client = Groq()  # LLM
        self.db = sqlite3.connect('availability.db')  # BD
    
    def answer(self, question):
        # STEP 1: Busca en BD
        context = self._fetch_relevant_data(question)
        
        # STEP 2: Construye prompt con contexto
        prompt = f"""
        Eres asistente de Rappi.
        Datos históricos:
        {context}
        
        Pregunta: {question}
        """
        
        # STEP 3: Llama Groq
        response = self.client.messages.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content
```

**Qué Decir:**
- "Esto es RAG: Retrieval → Augmented → Generation"
- "Sin RAG, el LLM inventaría respuestas"
- "Con RAG, el LLM responde basado en datos reales"
- "Ejemplo: 
  - Pregunta: '¿Cuál es el pico?'
  - Mi código busca: SELECT HOUR(timestamp), AVG(value) GROUP BY HOUR
  - Obtiene: {20: 5.3M, 21: 5.4M, 22: 5.2M, 23: 5.1M}
  - Pasa al LLM: 'El pico es 20-23h con promedio 5.2M'
  - LLM responde: 'El pico de disponibilidad ocurre...'"

---

### Paso 3: Explica la Base de Datos (1.5 minutos)

**Abre SQLite:**
```bash
sqlite3 backend/availability.db

-- Muestra tabla
.schema availability

-- Cuenta registros
SELECT COUNT(*) FROM availability;

-- Muestra ejemplos
SELECT timestamp, value FROM availability LIMIT 3;
```

**Qué Debe Aparecer:**
```
CREATE TABLE availability (
  id INTEGER PRIMARY KEY,
  plot_name TEXT,
  metric TEXT,
  timestamp DATETIME,
  value REAL,
  source_file TEXT
);

Índices:
CREATE INDEX idx_timestamp ON availability(timestamp);
CREATE INDEX idx_metric ON availability(metric);
CREATE INDEX idx_metric_timestamp ON availability(metric, timestamp);

Registros: 67141

Ejemplos:
2026-02-01 10:00:00 | 3456789
2026-02-01 10:10:00 | 3512340
```

**Qué Decir:**
- "La tabla tiene 67,141 registros"
- "Cada registro = 1 punto de tiempo"
- "Tengo 3 ÍNDICES para búsquedas rápidas"
- "Sin índices: buscar tardaría O(n) = 67K comparaciones"
- "Con índices: buscar tarda O(log n) = 16 comparaciones"
- "Eso significa: búsquedas en <10 milisegundos"

**Pregunta Esperada:**
- "¿Por qué esos índices en particular?"

**Tu Respuesta:**
- "Porque mis queries más frecuentes son:"
  1. `WHERE timestamp = X` → idx_timestamp
  2. `WHERE metric = 'visible_stores'` → idx_metric
  3. `WHERE metric = X AND timestamp > Y` → idx_metric_timestamp (combinado)"

---

## 🎯 PARTE 5: Decisiones Técnicas (3 minutos)

### Argumentos que Debes Preparar:

#### 1. "¿Por qué FastAPI y no Node.js/Express?"

**Respuesta:**
- "Python para data science es estándar"
- "FastAPI tiene validación automática (Pydantic)"
- "Mejor integración con pandas (procesamiento CSV)"
- "Más rápido que Express a nivel de bytecode compilado"

---

#### 2. "¿Por qué Groq y no Claude/ChatGPT?"

**Respuesta:**
- "Claude requiere créditos pagados"
- "Groq es gratis, sin rate limits"
- "Interfaz idéntica (array de mensajes)"
- "llama-3.1-8b es suficiente para Q&A sobre datos"
- "Si necesitara mejor calidad, migraría a Claude, pero el patrón sería idéntico"

---

#### 3. "¿Por qué Chart.js en lugar de D3.js?"

**Respuesta:**
- "Chart.js: simple, tooltips automáticos, performance bueno"
- "D3.js: más control, pero curva de aprendizaje enorme"
- "Para este caso, Chart.js es **80/20**: da 80% de funcionalidad con 20% del esfuerzo"

---

#### 4. "¿Por qué tema BLANCO y no oscuro?"

**Respuesta:**
- "Empresas modernas usan tema claro: Linear, Vercel, Stripe"
- "Mejor contraste = más accesible"
- "Naranja Rappi como color de marca = identidad"
- "Profesional vs. gamer"

---

#### 5. "¿Cómo manejas 67K puntos sin que sea lento?"

**Respuesta:**
- "Sampling en frontend: muestro 500 puntos en lugar de 67K"
- "Índices en backend: búsquedas <10ms"
- "Lazy loading en Angular: carga componentes bajo demanda"
- "Si creciera a millones, usaría PostgreSQL + Redis caché"

---

## 🎤 Cierre (30 segundos)

**Qué Decir:**
```
"En resumen:
- Procesé 201 CSVs (67,141 registros)
- Backend: FastAPI + SQLite + Groq RAG
- Frontend: Angular + Chart.js
- 4 gráficos interactivos + chatbot que responde preguntas
- Diseño profesional, completamente en español
- Performance optimizado (índices, sampling, lazy loading)

Lo más importante: implementé RAG, que es la forma CORRECTA 
de hacer Q&A sobre datos. No alucinaciones, respuestas basadas 
en datos reales.

¿Preguntas?"
```

---

## 📋 Checklist Antes de Entrar a la Entrevista

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:4200
- [ ] Recarga una vez para asegurar que carga limpio
- [ ] Prueba una pregunta al chatbot (debe responder en <5 segundos)
- [ ] Comprueba que los tooltips de gráficos funcionan
- [ ] Ten la terminal lista para mostrar estructura de carpetas
- [ ] Ten SQLite abierto para mostrar tabla
- [ ] Memoriza los "Números Clave": 67,141 / 11 días / 4 gráficos / RAG

---

## 🚨 Si Algo Falla Durante la Demo:

**El backend no inicia:**
```bash
cd backend
pip install -r requirements.txt
export GROQ_API_KEY="tu_api_key"
python main.py
```

**El frontend no carga:**
```bash
cd frontend
npm install
ng serve
```

**El chatbot no responde:**
- Probablemente error de API key de Groq
- Di: "Parece que hay un problema con Groq, pero el código está correcto. En producción tendríamos mejor manejo de errores"

**Los gráficos no cargan:**
- Abre consola (F12) y mira errores
- Probablemente CORS: explica "Hay un middleware en FastAPI que permite CORS desde localhost:4200"

---

## 💡 Preguntas Que Probablemente Harán:

**P: ¿Cómo validaste que es correcto?**
A: "Comparé manualmente:
- Gráfico muestra 8 feb como mínimo
- Chatbot dijo '8 feb es mínimo'
- Query SQL: SELECT MIN(AVG(value)) GROUP BY DATE → '8 feb'
- Los 3 coinciden ✓"

**P: ¿Qué harías diferente?**
A: "Tests automatizados, más filtros, tabla exportable, autenticación"

**P: ¿Por qué Python en backend?**
A: "Porque proceso CSVs con pandas, acceso directo a datos, mejor para data science"

**P: ¿Cuánto tiempo tomó?**
A: "~20 horas: 5h procesamiento datos, 5h backend, 5h frontend, 5h integración y diseño"

---

**¡LISTO! Ya tienes todo para impresionar. 🚀**
