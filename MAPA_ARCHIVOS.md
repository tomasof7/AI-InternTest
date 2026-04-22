# 🗺️ Mapa Completo: Dónde Está Cada Cosa

> **Ubicación de archivos, funciones, endpoints y cómo se conectan**

---

## 📂 Estructura Completa del Proyecto

```
AI-InternTest/
│
├── 📁 backend/
│   ├── main.py                  ← 🟢 SERVIDOR (FastAPI)
│   ├── chatbot.py               ← 🧠 INTELIGENCIA (RAG)
│   ├── data_processor.py        ← 🔄 TRANSFORMACIÓN (CSV)
│   ├── models.py                ← 📋 TIPOS DE DATOS
│   ├── consolidator.py          ← 🔗 CONSOLIDAR CSVs
│   ├── init_db.py               ← 🗄️ CREAR BD
│   ├── .env                     ← 🔑 API KEYS (SECRETO)
│   ├── requirements.txt         ← 📦 DEPENDENCIAS
│   ├── availability.db          ← 💾 BASE DE DATOS SQLite
│   └── data/
│       └── raw/
│           └── archivo_1/       ← 📄 201 CSVs (input)
│
├── 📁 frontend/
│   ├── src/
│   │   ├── app.ts               ← 🏠 RAÍZ (navbar, footer, layout)
│   │   ├── app.config.ts        ← ⚙️ CONFIGURACIÓN Angular
│   │   ├── main.ts              ← 🚀 ENTRY POINT
│   │   └── components/
│   │       ├── dashboard/
│   │       │   └── dashboard.component.ts     ← 📊 GRÁFICOS + KPIs
│   │       └── chatbot/
│   │           └── chatbot.component.ts       ← 💬 CHAT
│   │   └── services/
│   │       ├── data.service.ts                ← 🔌 GET /api/data
│   │       └── chat.service.ts                ← 🔌 POST /api/chat
│   ├── angular.json             ← 🔧 CONFIG Angular CLI
│   ├── package.json             ← 📦 DEPENDENCIAS npm
│   └── public/
│       └── index.html           ← 🌐 HTML PRINCIPAL
│
├── GUIA_ENTREVISTA.md           ← 📚 DOCUMENTACIÓN CONCEPTUAL
├── DEMO_EJECUTIVA.md            ← 🎬 CÓMO DEMOSTRAR
└── MAPA_ARCHIVOS.md             ← 🗺️ ESTE ARCHIVO
```

---

## 🟢 BACKEND: main.py (Servidor FastAPI)

**Ubicación:** `/backend/main.py`

**¿Qué hace?**
- Crea servidor FastAPI que escucha en `http://localhost:8000`
- Define 2 endpoints (rutas) principales
- Configura CORS (permite solicitudes desde frontend)
- Carga base de datos al iniciar

**Endpoints Expuestos:**

### 1. **GET /api/health**
```python
@app.get("/api/health")
def health():
    return {"status": "ok"}
```
- **Propósito:** Verificar que servidor está activo
- **Request:** Ninguno
- **Response:** `{"status": "ok"}`
- **Usado por:** Frontend para saber si backend está listo

---

### 2. **GET /api/data**
```python
@app.get("/api/data")
def get_data(from_date: str = None, to_date: str = None):
    # Query a SQLite
    # SELECT timestamp, value FROM availability
    # Calcula: max, min, avg, count
    return DataResponse(...)
```

- **Propósito:** Retornar datos para dashboard
- **Request Parameters:**
  - `from_date` (opcional): "2026-02-01"
  - `to_date` (opcional): "2026-02-11"
- **Response:**
  ```json
  {
    "metric": "synthetic_monitoring_visible_stores",
    "data": [
      {"timestamp": "2026-02-01T10:00:00-05:00", "value": 3456789},
      {"timestamp": "2026-02-01T10:10:00-05:00", "value": 3512340},
      ... (67,141 total)
    ],
    "count": 67141,
    "min_value": 0,
    "max_value": 6198472,
    "avg_value": 3208767
  }
  ```
- **Usado por:** `DataService.getData()` en el frontend

---

### 3. **POST /api/chat**
```python
@app.post("/api/chat")
def chat(request: ChatRequest):
    chatbot = ChatbotRAG()
    answer = chatbot.answer(request.question)
    return ChatResponse(answer=answer, ...)
```

- **Propósito:** Procesar pregunta del usuario y retornar respuesta
- **Request Body:**
  ```json
  {
    "question": "¿Cuál es el patrón de disponibilidad?"
  }
  ```
- **Response:**
  ```json
  {
    "answer": "El patrón de disponibilidad muestra un ciclo diurno con picos entre las 20:00 y 23:00 horas...",
    "sources": ["availability_data"],
    "confidence": 0.92
  }
  ```
- **Usado por:** `ChatService.sendMessage()` en el frontend

---

**Middleware CORS:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Frontend
    allow_methods=["*"],
    allow_headers=["*"],
)
```
- **Por qué:** Angular en localhost:4200 necesita hablar con FastAPI en localhost:8000
- **En producción:** Cambiarías a dominios específicos

---

## 🧠 BACKEND: chatbot.py (RAG - La Inteligencia)

**Ubicación:** `/backend/chatbot.py`

**¿Qué hace?**
- Implementa Retrieval-Augmented Generation (RAG)
- Busca datos en SQLite
- Construye prompt con contexto
- Llama Groq LLM para generar respuesta

**Clases y Métodos:**

### Clase: `ChatbotRAG`

```python
class ChatbotRAG:
    def __init__(self):
        self.client = Groq()  # LLM client
        self.db = sqlite3.connect('availability.db')
```

---

#### Método 1: `_fetch_data_summary()`
```python
def _fetch_data_summary(self):
    # Retorna estadísticas generales
    # SELECT COUNT(*), AVG(value), MAX(value), MIN(value) FROM availability
    
    return {
        "total_records": 67141,
        "date_range": "2026-02-01 to 2026-02-11",
        "min_value": 0,
        "max_value": 6198472,
        "avg_value": 3208767
    }
```

**Propósito:** Contexto general para el LLM

---

#### Método 2: `_fetch_relevant_data(question)`
```python
def _fetch_relevant_data(self, question):
    # Analiza pregunta para encontrar palabras clave
    # Busca datos relevantes en BD
    
    # Si pregunta contiene "hora" o "horario":
    #   SELECT HOUR(timestamp), AVG(value) GROUP BY HOUR
    
    # Si pregunta contiene "día":
    #   SELECT DATE(timestamp), AVG(value) GROUP BY DATE
    
    # Si pregunta contiene "máximo" o "pico":
    #   SELECT MAX(value) FROM availability
    
    return aggregated_data
```

**Propósito:** Extraer datos específicos relevantes a la pregunta

---

#### Método 3: `answer(question)`
```python
def answer(self, question):
    # STEP 1: Obtener contexto
    summary = self._fetch_data_summary()
    relevant = self._fetch_relevant_data(question)
    
    # STEP 2: Construir prompt
    context = f"""
    Datos históricos de disponibilidad de tiendas Rappi:
    - Total registros: {summary['total_records']}
    - Rango: {summary['date_range']}
    - Mínimo: {summary['min_value']}
    - Máximo: {summary['max_value']}
    - Promedio: {summary['avg_value']}
    
    Datos relevantes:
    {relevant}
    """
    
    prompt = f"""Eres un asistente de disponibilidad de Rappi.
    
    {context}
    
    Pregunta del usuario: {question}
    
    Responde basándote en los datos proporcionados."""
    
    # STEP 3: Llamar LLM
    response = self.client.messages.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )
    
    return response.content
```

**Propósito:** Orquestar todo el proceso RAG

---

## 🔄 BACKEND: data_processor.py (Transformación de Datos)

**Ubicación:** `/backend/data_processor.py`

**¿Qué hace?**
- Lee CSVs de formato wide
- Convierte a formato long
- Parsea timestamps complicados
- Valida datos

**Funciones:**

### Función 1: `parse_timestamp(timestamp_str)`
```python
def parse_timestamp(timestamp_str):
    # INPUT: "Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"
    # REGEX: Extrae fecha, hora, timezone
    # OUTPUT: "2026-02-06T10:59:40-05:00"
    
    pattern = r'\w+ (\w+ \d+ \d+ \d+:\d+:\d+) GMT([+-]\d{2})(\d{2})'
    match = re.search(pattern, timestamp_str)
    
    if match:
        date_str = match.group(1)  # "Feb 06 2026 10:59:40"
        tz_sign = match.group(2)   # "-05"
        tz_min = match.group(3)    # "00"
        
        # Parsea y convierte a ISO 8601
        return f"2026-02-06T10:59:40{tz_sign}:{tz_min}"
```

**Propósito:** Convertir timestamps de formato verbose a ISO 8601

---

### Función 2: `process_single_csv(filepath)`
```python
def process_single_csv(filepath):
    # Lee CSV
    df = pd.read_csv(filepath)
    
    # CSV tiene estructura WIDE:
    # Index   | 2026-02-01 10:00 | 2026-02-01 10:10 | ...
    # Store1  | 1                | 0                | ...
    # Store2  | 0                | 1                | ...
    
    # TRANSPONE a LONG:
    # timestamp            | metric              | value
    # 2026-02-01T10:00:00 | synthetic_monitoring| 1
    # 2026-02-01T10:00:00 | synthetic_monitoring| 0
    # 2026-02-01T10:10:00 | synthetic_monitoring| 0
    # 2026-02-01T10:10:00 | synthetic_monitoring| 1
    
    melted = df.melt(id_vars=['metric_column'], ...)
    melted['timestamp'] = melted['timestamp'].apply(parse_timestamp)
    
    return melted
```

**Propósito:** Transformar formato wide → long

---

### Función 3: `validate_dataframe(df)`
```python
def validate_dataframe(df):
    # Verifica:
    # - Sin nulls
    # - Timestamps en orden cronológico
    # - Valores son números válidos
    # - Sin duplicados
    
    assert df.isnull().sum().sum() == 0, "Hay nulls"
    assert df['timestamp'].is_monotonic_increasing, "No está ordenado"
    
    return True
```

**Propósito:** Asegurar calidad de datos

---

## 🗄️ BACKEND: models.py (Tipos de Datos)

**Ubicación:** `/backend/models.py`

**¿Qué contiene?**
Definiciones Pydantic para validación automática de datos

```python
class DataPoint(BaseModel):
    timestamp: str       # "2026-02-01T10:00:00-05:00"
    value: float        # 3456789

class DataResponse(BaseModel):
    metric: str         # "synthetic_monitoring_visible_stores"
    data: List[DataPoint]
    count: int          # 67141
    min_value: float    # 0
    max_value: float    # 6198472
    avg_value: float    # 3208767

class ChatRequest(BaseModel):
    question: str       # "¿Cuál es el patrón?"

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float
```

**Propósito:** FastAPI usa estos para validar requests/responses

---

## 💾 BACKEND: availability.db (Base de Datos SQLite)

**Ubicación:** `/backend/availability.db`

**¿Qué contiene?**

### Tabla: `availability`
```sql
CREATE TABLE availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plot_name TEXT NOT NULL,           -- "NOW"
    metric TEXT NOT NULL,              -- "synthetic_monitoring_visible_stores"
    timestamp DATETIME NOT NULL,       -- "2026-02-01 10:00:00"
    value REAL NOT NULL,               -- 3456789
    source_file TEXT                   -- "archivo_1/file_001.csv"
);
```

**Índices para búsquedas rápidas:**
```sql
CREATE INDEX idx_timestamp ON availability(timestamp);
CREATE INDEX idx_metric ON availability(metric);
CREATE INDEX idx_metric_timestamp ON availability(metric, timestamp);
```

**Datos:**
- **67,141 registros totales**
- **Rango:** 01-11 Febrero 2026
- **Granularidad:** 10 segundos entre registros
- **Valores:** 0 a 6,198,472

---

## 🏠 FRONTEND: app.ts (Componente Raíz)

**Ubicación:** `/frontend/src/app/app.ts`

**¿Qué hace?**
- Componente raíz que contiene navbar, main content, footer
- Define layout general de la aplicación
- Importa Dashboard y Chatbot components

**Estructura:**

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ChatbotComponent],
  template: `
    <header class="navbar">
      <!-- Logo "Rappi Availability" (naranja) -->
      <!-- Subtítulo "Plataforma de Inteligencia en Tiempo Real" -->
    </header>
    
    <main class="main-content">
      <section class="dashboard-container">
        <app-dashboard></app-dashboard>  <!-- Gráficos + KPIs -->
      </section>
      
      <section class="chatbot-section">
        <h2>Asistente de Inteligencia Artificial</h2>
        <app-chatbot></app-chatbot>  <!-- Chat -->
      </section>
    </main>
    
    <footer class="app-footer">
      <!-- 🚀 Powered by FastAPI + Groq AI | Angular 18 -->
    </footer>
  `,
  styles: [/* Tema blanco, naranja Rappi, responsive */]
})
export class App {}
```

**Estilos Clave:**
- `.navbar`: Fondo blanco, logo naranja
- `.main-content`: Fondo #f8fafc (gris muy claro)
- `.chatbot-container`: Centrado, max-width 900px
- Responsive: Layout vertical en mobile

---

## 📊 FRONTEND: dashboard.component.ts (Gráficos + KPIs)

**Ubicación:** `/frontend/src/app/components/dashboard/dashboard.component.ts`

**¿Qué hace?**
- Carga datos del backend vía DataService.getData()
- Muestra 4 KPI cards
- Dibuja 4 gráficos interactivos con Chart.js

**Componente:**

```typescript
export class DashboardComponent implements OnInit, OnDestroy {
  // Propiedades
  maxValue: number;
  minValue: number;
  avgValue: number;
  dataCount: number;
  chartData: any[] = [];  // 67,141 puntos
  private charts: { [key: string]: Chart } = {};
  
  // ...
}
```

**Métodos Principales:**

### Método 1: `loadData()`
```typescript
loadData() {
  // GET http://localhost:8000/api/data
  this.dataService.getData().subscribe({
    next: (response) => {
      this.maxValue = response.max_value;        // 6,198,472
      this.minValue = response.min_value;        // 0
      this.avgValue = response.avg_value;        // 3,208,767
      this.dataCount = response.count;           // 67,141
      this.chartData = response.data;            // Array de 67K puntos
      
      // Dibuja todos los gráficos
      setTimeout(() => {
        this.drawChart();       // Línea completa
        this.drawDailyChart();  // Barras diarias
        this.drawHourlyChart(); // Patrón horario
        this.drawRangeChart();  // Min/Max/Promedio
      }, 100);
    }
  });
}
```

---

### Método 2: `aggregateByDay()`
```typescript
aggregateByDay(): { date: string; avg: number; min: number; max: number }[] {
  // Agrupa 67,141 puntos en 11 días
  const dayMap = new Map<string, number[]>();
  
  this.chartData.forEach(d => {
    const date = new Date(d.timestamp).toLocaleDateString('es-CO');
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(d.value);
  });
  
  // Calcula avg, min, max por día
  const result = [];
  dayMap.forEach((values, date) => {
    result.push({
      date,
      avg: values.reduce((a,b) => a+b) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    });
  });
  
  return result;  // [11 días con estadísticas]
}
```

---

### Método 3: `aggregateByHour()`
```typescript
aggregateByHour(): { hour: number; avg: number }[] {
  // Agrupa 67,141 puntos en 24 horas
  const hourMap = new Map<number, number[]>();
  
  this.chartData.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    if (!hourMap.has(hour)) hourMap.set(hour, []);
    hourMap.get(hour)!.push(d.value);
  });
  
  const result = [];
  for (let h = 0; h < 24; h++) {
    const values = hourMap.get(h) || [];
    result.push({
      hour: h,
      avg: values.length > 0 ? values.reduce((a,b) => a+b) / values.length : 0
    });
  }
  
  return result;  // [24 horas con promedio]
}
```

---

### Métodos 4-7: `drawChart()`, `drawDailyChart()`, `drawHourlyChart()`, `drawRangeChart()`

Cada uno crea un Chart.js:

```typescript
drawChart() {
  this.destroyChart('timeseries');  // Destruye chart anterior si existe
  const canvas = document.getElementById('timeseriesChart');
  
  // Sampling: toma cada 50 puntos → 1,340 en lugar de 67K
  const step = Math.max(1, Math.floor(this.chartData.length / 500));
  const sampled = this.chartData.filter((_, i) => i % step === 0);
  
  this.charts['timeseries'] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: sampled.map(d => new Date(d.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Tiendas visibles',
        data: sampled.map(d => d.value),
        borderColor: '#FF441A',  // Naranja Rappi
        backgroundColor: 'rgba(255,68,26,0.06)',
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          // Tooltip aparece al hover
          callbacks: {
            label: ctx => ` ${this.fmt(ctx.parsed.y)} tiendas`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => v != null ? this.fmt(v as number) : ''
          }
        }
      }
    }
  });
}
```

**Métodos Auxiliares:**
```typescript
fmt(n: number): string {
  // Formatea números grandes
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';  // 6.2M
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';          // 500K
  return n.toFixed(0);
}

destroyChart(id: string) {
  // Destruye Chart anterior para evitar conflictos
  if (this.charts[id]) {
    this.charts[id].destroy();
    delete this.charts[id];
  }
}
```

---

## 💬 FRONTEND: chatbot.component.ts (Chat)

**Ubicación:** `/frontend/src/app/components/chatbot/chatbot.component.ts`

**¿Qué hace?**
- Interfaz de chat
- Envía preguntas al backend via ChatService
- Muestra respuestas del chatbot
- Auto-scroll a último mensaje

**Componente:**

```typescript
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
  
  messages: Message[] = [];      // Array de mensajes
  userInput: string = '';        // Texto que escribe el usuario
  loading: boolean = false;      // Si está esperando respuesta
  error: string | null = null;   // Si hay error
}
```

**Método Principal: `sendMessage()`**

```typescript
sendMessage() {
  if (!this.userInput.trim()) return;
  
  // 1. Agrega mensaje del usuario
  const question = this.userInput.trim();
  this.messages.push({
    role: 'user',
    content: question
  });
  
  // 2. Limpia input
  this.userInput = '';
  this.loading = true;
  this.error = null;
  
  // 3. Fuerza detección de cambios (Angular)
  this.cdr.markForCheck();
  this.cdr.detectChanges();
  
  // 4. Envía al backend
  // POST http://localhost:8000/api/chat
  // Body: { "question": question }
  this.chatService.sendMessage(question).subscribe({
    next: (response) => {
      // 5. Agrega respuesta
      this.messages.push({
        role: 'assistant',
        content: response.answer
      });
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.error = err.message || 'Error';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
```

**Método: `ngAfterViewChecked()` (Auto-scroll)**

```typescript
ngAfterViewChecked() {
  // Se ejecuta después de cada cambio de vista
  this.scrollToBottom();
}

private scrollToBottom() {
  if (this.chatMessagesRef && this.chatMessagesRef.nativeElement) {
    const element = this.chatMessagesRef.nativeElement;
    element.scrollTop = element.scrollHeight;  // Salta al final
  }
}
```

**¿Por qué ngAfterViewChecked?**
- Se ejecuta después de que Angular renderiza
- Cada nuevo mensaje dispara este hook
- Automáticamente scroll al último mensaje

---

## 🔌 FRONTEND: Services (Conexión con Backend)

### Archivo 1: `data.service.ts`

**Ubicación:** `/frontend/src/app/services/data.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = 'http://localhost:8000/api';
  
  constructor(private http: HttpClient) {}
  
  getData(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();
    if (fromDate) params = params.set('from_date', fromDate);
    if (toDate) params = params.set('to_date', toDate);
    
    // GET http://localhost:8000/api/data
    return this.http.get<any>(`${this.apiUrl}/data`, { params })
      .pipe(tap(data => console.log('Data loaded:', data)));
  }
}
```

**¿Qué hace?**
- GET request a `/api/data`
- Parámetros opcionales: from_date, to_date
- Retorna Observable (RxJS) que el Dashboard se suscribe

---

### Archivo 2: `chat.service.ts`

**Ubicación:** `/frontend/src/app/services/chat.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8000/api';
  
  constructor(private http: HttpClient) {}
  
  sendMessage(question: string): Observable<any> {
    // POST http://localhost:8000/api/chat
    // Body: { "question": question }
    return this.http.post<any>(`${this.apiUrl}/chat`, { question });
  }
}
```

**¿Qué hace?**
- POST request a `/api/chat`
- Envía pregunta como JSON
- Retorna Observable que Chatbot se suscribe

---

## 📋 FRONTEND: app.config.ts (Configuración)

**Ubicación:** `/frontend/src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()  // ← Habilita HttpClient para servicios
  ]
};
```

**¿Por qué?**
- `provideHttpClient()` hace que DataService y ChatService funcionen
- Sin esto, no podrían hacer requests HTTP

---

## 🔗 Flujo Completo de Datos

### Cuando el Usuario Carga la Página:

```
1. index.html carga
   ↓
2. main.ts inicia Angular
   ↓
3. app.config.ts proporciona servicios
   ↓
4. app.ts se renderiza (navbar + layout)
   ↓
5. dashboard.component.ts se inicia (ngOnInit)
   ↓
6. loadData() llama DataService.getData()
   ↓
7. DataService.getData() hace GET http://localhost:8000/api/data
   ↓
8. FastAPI main.py recibe GET /api/data
   ↓
9. main.py ejecuta query SQL en availability.db
   ↓
10. SQLite retorna 67,141 registros + KPIs
   ↓
11. main.py retorna JSON Response
   ↓
12. DataService recibe response
   ↓
13. dashboard.component.ts recibe datos
   ↓
14. Asigna: maxValue, minValue, avgValue, dataCount
   ↓
15. Llama drawChart(), drawDailyChart(), etc.
   ↓
16. Chart.js crea 4 gráficos en canvas
   ↓
17. Chatbot component se renderiza vacío
```

---

### Cuando el Usuario Escribe una Pregunta:

```
1. Usuario escribe: "¿Cuál es el patrón?"
   ↓
2. Usuario presiona Enter o click "Enviar"
   ↓
3. chatbot.component.sendMessage() se ejecuta
   ↓
4. Agrega mensaje usuario al array
   ↓
5. Limpia input: userInput = ''
   ↓
6. Llama ChatService.sendMessage(question)
   ↓
7. ChatService hace POST http://localhost:8000/api/chat
   ↓
8. Body: { "question": "¿Cuál es el patrón?" }
   ↓
9. FastAPI main.py recibe POST /api/chat
   ↓
10. main.py crea ChatbotRAG()
   ↓
11. chatbot.answer(question) se ejecuta
   ↓
12. _fetch_relevant_data("patrón") busca en SQLite
   ↓
13. Encuentra: hora → promedio diario
   ↓
14. Construye contexto con datos reales
   ↓
15. Llama Groq API con prompt aumentado
   ↓
16. Groq retorna respuesta: "El patrón muestra..."
   ↓
17. main.py retorna JSON Response con answer
   ↓
18. ChatService recibe response
   ↓
19. chatbot.component recibe respuesta
   ↓
20. Agrega mensaje asistente al array
   ↓
21. ngAfterViewChecked() dispara scrollToBottom()
   ↓
22. Chat hace auto-scroll al último mensaje
```

---

## 📦 Archivos de Configuración

### `backend/requirements.txt`
```
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.0
groq==0.4.2
python-dotenv==1.0.0
```

### `backend/.env`
```
GROQ_API_KEY=gsk_XXXXXXXXXXXX  # Clave secreta
```

### `frontend/package.json`
```json
{
  "dependencies": {
    "@angular/core": "^21.2.0",
    "@angular/common": "^21.2.0",
    "rxjs": "~7.8.0",
    "chart.js": "^4.5.1"
  },
  "devDependencies": {
    "@angular/cli": "^21.2.7"
  }
}
```

---

## 🚀 Comandos Para Ejecutar

```bash
# Backend
cd backend
python main.py
# Escucha en http://localhost:8000

# Frontend  
cd frontend
npm install
ng serve
# Abre en http://localhost:4200
```

---

## ✅ Resumen Rápido

| Archivo | Qué Hace | Ubicación |
|---------|----------|-----------|
| `main.py` | Servidor FastAPI + 3 endpoints | `/backend/main.py` |
| `chatbot.py` | RAG (búsqueda + LLM) | `/backend/chatbot.py` |
| `data_processor.py` | Transforma CSVs | `/backend/data_processor.py` |
| `models.py` | Tipos de datos Pydantic | `/backend/models.py` |
| `availability.db` | BD SQLite con 67,141 registros | `/backend/availability.db` |
| `app.ts` | Raíz (navbar + layout) | `/frontend/src/app/app.ts` |
| `dashboard.component.ts` | 4 gráficos + KPIs | `/frontend/src/app/components/dashboard/` |
| `chatbot.component.ts` | Chat interface | `/frontend/src/app/components/chatbot/` |
| `data.service.ts` | GET /api/data | `/frontend/src/app/services/data.service.ts` |
| `chat.service.ts` | POST /api/chat | `/frontend/src/app/services/chat.service.ts` |

---

**¡Ahora tienes el MAPA COMPLETO! 🗺️**
