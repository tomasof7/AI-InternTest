# Rappi Store Availability Dashboard

An intelligent data platform that visualizes Rappi store availability trends and answers analytical questions in natural language using a RAG-powered AI assistant.

**Stack:** Angular 18 · FastAPI · SQLite · Groq (llama-3.1-8b) · Chart.js

---

## Problem Statement

Operations teams need to monitor store availability patterns across time to detect anomalies, demand spikes, and low-activity windows — without writing SQL queries or waiting on data analysts.

This platform solves that by combining:
- **Visual analytics** — interactive charts from 67,141 historical data points
- **Conversational AI** — natural language queries answered with real database context (RAG), not hallucinations

---

## Features

| Feature | Description |
|---|---|
| Time series chart | Full availability series, sampled for smooth rendering |
| Daily average chart | Bar chart aggregated by day |
| Hourly pattern chart | 24-hour cycle average across all days |
| Min/Max/Avg chart | Daily variance visualization |
| RAG Chatbot | Groq LLM grounded in live SQLite queries |
| Analytics page | Day-by-day table + hour-by-hour heatmap + auto-insights |
| Architecture page | System diagram, RAG flow, API endpoint reference |

---

## Architecture

```
Browser (Angular 18)
  ├── /dashboard    → KPIs + 4 Chart.js charts
  ├── /insights     → RAG chatbot (ChatGPT-style UI)
  ├── /analytics    → Day/hour breakdown tables
  ├── /architecture → System diagrams
  └── /about        → Project context

        │  HTTP REST
        ▼

FastAPI (Python)
  ├── GET  /api/data   → 67,141 time-series points + KPIs
  ├── POST /api/chat   → RAG pipeline → Groq LLM
  └── GET  /api/health → DB health check

        │  sqlite3
        ▼

SQLite (data/availability.db)
  └── table: availability
        columns: id, plot_name, metric, timestamp, value, source_file
        indexes: timestamp, metric, (metric, timestamp)
        rows: 67,141
```

### RAG Flow (Chatbot)

```
User question
    │
    ▼
1. Keyword analysis     → detects "hora", "día", "pico", "mínimo"…
    │
    ▼
2. SQLite query         → GROUP BY hour/date, ORDER BY value, etc.
    │
    ▼
3. Context building     → real data injected into system prompt
    │
    ▼
4. Groq LLM             → llama-3.1-8b-instant generates answer
    │
    ▼
Response grounded in real data — no hallucinations
```

---

## Tech Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Frontend | Angular | 18 | SPA with routing, standalone components |
| Frontend | TypeScript | 5.9 | Type-safe component logic |
| Frontend | Chart.js | 4.5 | Interactive data visualization |
| Backend | FastAPI | 0.104+ | REST API, async, auto-docs |
| Backend | Python | 3.10+ | Data processing, RAG orchestration |
| Backend | Groq SDK | 0.4+ | LLM integration |
| Database | SQLite | built-in | 67K records, indexed queries |
| Data | Pandas | 2.0+ | CSV pipeline (wide → long format) |
| Data | Pydantic | 2.x | API model validation |

---

## Project Structure

```
AI-InternTest/
│
├── backend/
│   ├── main.py              # FastAPI app — 3 endpoints
│   ├── chatbot.py           # RAG logic — SQLite search + Groq LLM
│   ├── data_processor.py    # CSV parser (wide → long, timestamp normalization)
│   ├── init_db.py           # Loads processed CSV into SQLite
│   ├── models.py            # Pydantic request/response models
│   └── requirements.txt
│
├── data/
│   ├── availability.db      # SQLite — 67,141 records (included for demo)
│   └── raw/                 # Source CSVs — gitignored (201 files)
│
├── scripts/
│   └── process_data.py      # One-time ETL pipeline (wide CSVs → processed CSV)
│
├── frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── dashboard/   # KPIs + 4 charts
│       │   ├── insights/    # RAG chatbot UI
│       │   ├── analytics/   # Day/hour breakdown
│       │   ├── architecture/ # System diagrams
│       │   └── about/       # Project context
│       ├── components/
│       │   ├── layout/      # Sidebar + navbar shell
│       │   ├── sidebar/     # Navigation
│       │   └── navbar/      # Top bar + breadcrumb
│       └── services/
│           ├── data.service.ts  # GET /api/data
│           └── chat.service.ts  # POST /api/chat
│
├── .env.example             # Environment variable template
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/tomasof7/AI-InternTest.git
cd AI-InternTest
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and add your Groq API key
```

Get a free API key at [console.groq.com/keys](https://console.groq.com/keys) — no credit card required.

### 3. Start the backend

```bash
cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### 4. Start the frontend

```bash
cd frontend
npm install
npx ng serve
# → http://localhost:4200
```

> The SQLite database (`data/availability.db`) is included in the repository so no data pipeline run is needed to start the app.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLM access. Free at [console.groq.com](https://console.groq.com) |
| `ENV` | No | `development` or `production` (default: `development`) |
| `DEBUG` | No | Enable debug logging (default: `true`) |

The backend reads `.env` from the project root using `python-dotenv`. If `GROQ_API_KEY` is missing, the server raises an explicit error at startup:

```
ValueError: ❌ GROQ_API_KEY not configured in .env
   Get one free at: https://console.groq.com
```

---

## How It Works

### Data Pipeline (one-time, already done)

```
201 CSV files (Wide format)
    │  scripts/process_data.py
    ▼
data/processed/availability_processed.csv   (67,141 rows)
    │  backend/init_db.py
    ▼
data/availability.db   (SQLite, 3 indexes, <10ms queries)
```

Each CSV contained ~10 minutes of measurements at 10-second granularity in wide format (columns = timestamps, rows = metric). The pipeline:
1. Parses verbose timestamps: `"Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"` → ISO 8601
2. Transposes wide → long format
3. Deduplicates overlapping time windows across files
4. Normalizes to UTC and loads into SQLite

### API

```
GET  /api/data
     → Returns all 67,141 DataPoints + KPIs (min, max, avg, count)
     → Optional: ?from_date=2026-02-05&to_date=2026-02-06

POST /api/chat
     Body: { "question": "¿A qué hora hay mayor disponibilidad?" }
     → Runs RAG pipeline → returns grounded LLM response
```

### Frontend routing

Routes are lazy-loaded. The layout shell (sidebar + navbar) wraps all pages via Angular's nested routing.

---

## AI Usage

The chatbot uses **Retrieval-Augmented Generation (RAG)** rather than a direct LLM call:

**Why RAG?**
- LLMs have no knowledge of this specific dataset
- Direct prompting would produce hallucinated numbers
- RAG grounds every answer in real SQL query results

**Implementation (`backend/chatbot.py`):**

```python
def answer(self, question: str) -> str:
    # 1. Query SQLite for relevant aggregates
    summary = self._fetch_data_summary()       # global stats
    context = self._fetch_relevant_data(question)  # keyword-matched queries

    # 2. Inject real data into system prompt
    system_prompt = f"You have access to: {summary}\n{context}\n..."

    # 3. Call Groq LLM with grounded context
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": system_prompt}, ...]
    )
```

The LLM is instructed to only answer based on provided data and say "I don't have data for that" when out of scope.

---

## Technical Decisions

**FastAPI over Flask/Express** — async support, automatic OpenAPI docs, Pydantic validation with zero boilerplate.

**Groq over OpenAI/Anthropic** — free tier with no credit card, ~300ms response time (10x faster than GPT-4), sufficient capability for structured data Q&A.

**SQLite over PostgreSQL** — self-contained, zero infrastructure setup, sub-10ms queries on 67K rows with proper indexing. A production version would use Postgres.

**Angular over React** — strong typing with TypeScript, built-in dependency injection, OnPush change detection for performance, routing without extra libraries.

**Chart.js over D3** — declarative API suitable for standard chart types; D3 is overkill for this use case and adds complexity without benefit.

**Sampling for time series** — rendering all 67,141 points would freeze the browser. The frontend samples every Nth point to display ~500 points while preserving the visual pattern.

---

## Future Improvements

- [ ] Date range filter on dashboard
- [ ] WebSocket for real-time data streaming
- [ ] Persistent chat history (localStorage or DB)
- [ ] Export charts as PNG/CSV
- [ ] Authentication (JWT)
- [ ] Docker Compose for one-command startup
- [ ] Replace SQLite with PostgreSQL for production
- [ ] Unit tests (pytest for backend, Jasmine for frontend)
- [ ] CI/CD pipeline (GitHub Actions)

---

## API Reference

Full interactive docs available at `http://localhost:8000/docs` when the backend is running.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + record count |
| `GET` | `/api/data` | Time-series data + KPIs |
| `POST` | `/api/chat` | RAG chatbot endpoint |

---

## Data

- **Source:** 201 CSV files exported from Splunk/SignalFx synthetic monitoring
- **Metric:** `synthetic_monitoring_visible_stores` — number of Rappi stores visible at each measurement
- **Period:** February 1–11, 2026
- **Granularity:** 10 seconds
- **Range:** 0 to 6,198,472 stores
- **Total records:** 67,141

The raw CSVs and intermediate processed CSV are excluded from the repository (see `.gitignore`). The pre-built SQLite database is included so the app runs immediately after cloning.
