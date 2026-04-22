# 🎯 Rappi Store Availability Dashboard

Una plataforma web inteligente que visualiza la disponibilidad de tiendas Rappi con IA conversacional.

## ✨ Características

- 📊 **4 Gráficos Interactivos** — Series de tiempo, promedio diario, patrón horario, min/max/promedio
- 💬 **Chatbot con IA** — Responde preguntas sobre datos usando RAG (Retrieval-Augmented Generation)
- 📈 **67,141 Registros** — 11 días de datos históricos con granularidad de 10 segundos
- 🎨 **Diseño Profesional** — Tema blanco moderno, completamente en español
- ⚡ **Performance Optimizado** — SQLite con índices, Chart.js con sampling

---

## 🏗️ Arquitectura

```
Frontend (Angular 18)           Backend (FastAPI)          Base de Datos
├─ Dashboard                    ├─ /api/data    ←────────→ SQLite
├─ Chatbot                      └─ /api/chat    ←────────→ (67,141 registros)
└─ Services                        └─ chatbot.py (RAG)
                                      └─ Groq LLM
```

---

## 📋 Requisitos Previos

- **Node.js** 18+ (para Angular)
- **Python** 3.10+ (para FastAPI)
- **npm** (gestor de dependencias Node)
- **pip** (gestor de dependencias Python)
- **Git** (control de versiones)

---

## 🚀 Instalación Rápida

### 1️⃣ Clona el Repositorio

```bash
git clone https://github.com/tu_usuario/AI-InternTest.git
cd AI-InternTest
```

### 2️⃣ Configura Backend

```bash
cd backend

# Copia plantilla de .env
cp .env.example .env

# Edita .env y agrega tu API key de Groq
# GROQ_API_KEY=tu_clave_aqui
nano .env  # o usa tu editor favorito
```

**¿Dónde obtener Groq API Key?**
1. Ve a https://console.groq.com/keys
2. Crea una cuenta gratis (email + contraseña)
3. Copia tu API key
4. Pégala en .env

```bash
# Instala dependencias
pip install -r requirements.txt

# Inicia servidor (escucha en http://localhost:8000)
python main.py
```

### 3️⃣ Configura Frontend

```bash
cd ../frontend

# Instala dependencias
npm install

# Inicia servidor de desarrollo (abre en http://localhost:4200)
ng serve
```

**Si `ng` no se reconoce:**
```bash
npm install -g @angular/cli
```

---

## 🎮 Cómo Usar

### Dashboard

1. **KPI Cards** (arriba)
   - Muestra: máximo, mínimo, promedio, total de registros
   - Datos calculados automáticamente del backend

2. **4 Gráficos** (interactivos con hover)
   - **Serie de tiempo**: Todos los 67,141 datos (muestreados)
   - **Promedio diario**: Datos agregados por día
   - **Patrón horario**: Promedio por hora (0-23)
   - **Min/Max/Promedio**: Variación diaria

### Chatbot

Haz preguntas sobre los datos:

```
"¿Cuál es el patrón de disponibilidad?"
"¿A qué hora hay mayor disponibilidad?"
"¿Hay diferencia entre semana y fin de semana?"
"¿Cuál fue el día con menor disponibilidad?"
```

El chatbot usa **RAG**:
1. Busca datos relevantes en la BD
2. Construye contexto con datos reales
3. Groq LLM genera respuesta basada en el contexto

---

## 📂 Estructura del Proyecto

```
AI-InternTest/
│
├── 📁 backend/
│   ├── main.py                ← FastAPI servidor
│   ├── chatbot.py             ← RAG (búsqueda + LLM)
│   ├── data_processor.py      ← Transformación CSV
│   ├── models.py              ← Tipos Pydantic
│   ├── .env.example           ← Plantilla (copiar a .env)
│   ├── .env                   ← API KEYS (no subir)
│   ├── requirements.txt       ← Dependencias Python
│   └── availability.db        ← SQLite (67,141 registros)
│
├── 📁 frontend/
│   ├── src/
│   │   ├── app.ts             ← Componente raíz
│   │   ├── components/
│   │   │   ├── dashboard/     ← Gráficos + KPIs
│   │   │   └── chatbot/       ← Chat interface
│   │   └── services/
│   │       ├── data.service.ts     ← GET /api/data
│   │       └── chat.service.ts     ← POST /api/chat
│   ├── package.json           ← Dependencias npm
│   └── angular.json           ← Config Angular
│
├── .gitignore                 ← Qué no subir a Git
├── README.md                  ← Este archivo
├── GUIA_ENTREVISTA.md         ← Estudio para entrevista
├── DEMO_EJECUTIVA.md          ← Cómo demostrar
└── MAPA_ARCHIVOS.md           ← Ubicación de cada cosa
```

---

## 🔐 Variables de Entorno

### Backend (.env)

```env
# Groq API Key (obtén en https://console.groq.com/keys)
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Base de datos
DATABASE_URL=sqlite:///availability.db

# Configuración
ENV=development
DEBUG=true
```

**⚠️ IMPORTANTE:**
- Nunca hagas `git add .env`
- El archivo `.env` está en `.gitignore` (no se sube)
- Usa `.env.example` como plantilla
- Cada persona clona el proyecto y crea su propio `.env` local

---

## 🛠️ Comandos Útiles

### Backend

```bash
cd backend

# Iniciar servidor
python main.py

# Instalar nuevas dependencias
pip install nueva_libreria

# Actualizar requirements.txt
pip freeze > requirements.txt

# Ver documentación automática
# Abre http://localhost:8000/docs en navegador
```

### Frontend

```bash
cd frontend

# Iniciar servidor de desarrollo
ng serve

# Build para producción
ng build

# Ejecutar tests
ng test

# Linter
ng lint
```

---

## 📊 Datos

- **Fuente**: 201 archivos CSV (formato ancho/wide)
- **Registros**: 67,141 puntos de datos
- **Período**: 01-11 Febrero 2026
- **Granularidad**: 10 segundos
- **Rango de valores**: 0 a 6,198,472 tiendas visibles

### Transformación de Datos

```
CSV Input (Wide Format)          →    Database (Long Format)
Timestamp | Store1 | Store2      →    timestamp | metric | value
Feb 01    | 1      | 0           →    Feb 01... | metric | 1
Feb 01    | 0      | 1           →    Feb 01... | metric | 0
```

Cada CSV es procesado por `data_processor.py`:
1. Parse timestamps (formato verbose → ISO 8601)
2. Transformación wide → long
3. Consolidación de 201 archivos
4. Validación de integridad
5. Inserción en SQLite

---

## 🧠 Cómo Funciona el Chatbot (RAG)

**RAG = Retrieval-Augmented Generation**

```
Usuario pregunta: "¿Cuál es el pico de horas?"
       ↓
1. RETRIEVAL (Búsqueda)
   Backend busca en SQLite:
   SELECT HOUR(timestamp), AVG(value) 
   GROUP BY HOUR ORDER BY AVG(value) DESC
   Encuentra: 20-23h con 5.3M promedio
   
       ↓
2. AUGMENTATION (Contexto)
   Construye prompt:
   "Tienes estos datos: hora 20 = 5.3M, hora 21 = 5.4M, etc.
    Pregunta: ¿Cuál es el pico de horas?"
   
       ↓
3. GENERATION (Respuesta)
   Groq LLM responde:
   "El pico ocurre entre 20-23h con promedio de 5.3M tiendas..."
```

**Ventajas:**
- ✅ Respuestas basadas en datos reales
- ✅ No alucina (no inventa datos)
- ✅ Contexto específico del negocio

---

## 🧪 Testing

### Verificar Backend Funciona

```bash
# Terminal 1
cd backend
python main.py

# Terminal 2
curl http://localhost:8000/api/health
# Respuesta: {"status":"ok"}

curl http://localhost:8000/api/data
# Respuesta: JSON con 67,141 registros + KPIs
```

### Verificar Frontend Funciona

```bash
# Terminal 1
cd backend
python main.py

# Terminal 2
cd frontend
ng serve

# Abre http://localhost:4200 en navegador
# Verifica:
# ✓ KPI cards muestren números
# ✓ 4 gráficos carguen
# ✓ Tooltips funcionen (pasar cursor)
# ✓ Chatbot responda preguntas
```

---

## 🚀 Deploy (Producción)

### Backend

```bash
# En un servidor (ej: Heroku, AWS, DigitalOcean)
pip install -r requirements.txt
export GROQ_API_KEY="tu_clave"
gunicorn main:app --workers 4
```

### Frontend

```bash
# Build
ng build --configuration production

# Sube carpeta 'dist/' a:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
# - tu servidor web
```

---

## 📚 Documentación Adicional

- **GUIA_ENTREVISTA.md** — Estudio completo para entrevista técnica
- **DEMO_EJECUTIVA.md** — Cómo demostrar el proyecto en 15 minutos
- **MAPA_ARCHIVOS.md** — Dónde está cada cosa (archivos, endpoints, funciones)

---

## ❓ Preguntas Frecuentes

**P: ¿Tengo que pagar por usar Groq?**
R: No, Groq es gratis. Tienes límite de requests pero suficiente para desarrollo.

**P: ¿Qué pasa si pierdo mi API key?**
R: Puedes regenerarla en https://console.groq.com/keys. Solo actualiza tu .env local.

**P: ¿Puedo cambiar el LLM a Claude/ChatGPT?**
R: Sí, requiere cambiar:
```python
# En chatbot.py
from anthropic import Anthropic  # o similar
client = Anthropic()  # en lugar de Groq()
```
El código sigue el mismo patrón.

**P: ¿Cuánto tarda en cargar?**
R: Primera carga: 2-3 segundos (carga 67K datos)
Luego: Instantáneo (caché del navegador)

**P: ¿Funciona en mobile?**
R: Sí, diseño completamente responsive. Prueba con DevTools (F12 → responsive).

---

## 🤝 Contribuir

¿Quieres mejorar? Algunas ideas:

- [ ] Agregar filtros por fecha en dashboard
- [ ] Exportar datos a CSV
- [ ] Gráficos adicionales (scatter, heatmap)
- [ ] Autenticación de usuarios
- [ ] Tests automatizados
- [ ] Modo oscuro
- [ ] Múltiples idiomas

---

## 📝 License

MIT License — Puedes usar, modificar y distribuir libremente.

---

## 👨‍💻 Autor

Desarrollado para Prueba Técnica Rappi

---

## 🎯 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Angular | 18 |
| Frontend | TypeScript | 5.9 |
| Frontend | Chart.js | 4.5 |
| Backend | FastAPI | 0.104+ |
| Backend | Python | 3.10+ |
| Backend | Groq LLM | llama-3.1-8b |
| DB | SQLite | Built-in |
| Data | Pandas | 2.0+ |

---

**Última actualización:** Abril 2026

**¿Preguntas o problemas?** Revisa GUIA_ENTREVISTA.md o DEMO_EJECUTIVA.md
