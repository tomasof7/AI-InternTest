"""
FastAPI Backend para Dashboard + Chatbot de Rappi
Endpoints:
  - GET  /api/data              → serie temporal para dashboard
  - GET  /api/data?from=...&to=... → serie temporal filtrada
  - POST /api/chat              → chatbot con Claude RAG
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import sqlite3
from pathlib import Path
from models import DataResponse, DataPoint, ChatRequest, ChatResponse
from chatbot import ChatbotRAG

# ============================================================================
# SETUP
# ============================================================================

app = FastAPI(
    title="Rappi Availability Dashboard API",
    description="API para visualizar disponibilidad de tiendas + chatbot semántico",
    version="1.0.0"
)

# CORS: permitir requests desde cualquier origen (para local development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).parent.parent / "data" / "availability.db"
chatbot = ChatbotRAG(db_path=DB_PATH)


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Health check"""
    return {
        "status": "🟢 API Online",
        "service": "Rappi Availability Dashboard",
        "endpoints": [
            "GET  /api/data",
            "POST /api/chat",
            "GET  /docs (Swagger UI)"
        ]
    }


@app.get("/api/data", response_model=DataResponse)
def get_data(
    from_date: str = Query(None, description="ISO format: 2026-02-01"),
    to_date: str = Query(None, description="ISO format: 2026-02-11")
):
    """
    Retorna serie temporal de tiendas disponibles.

    Parámetros opcionales:
    - from_date: fecha inicio (ISO 8601)
    - to_date: fecha fin (ISO 8601)

    Ejemplo:
    GET /api/data?from_date=2026-02-05&to_date=2026-02-06
    """

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Query base
        query = "SELECT timestamp, value FROM availability WHERE 1=1"
        params = []

        # Filtros opcionales
        if from_date:
            query += " AND timestamp >= ?"
            params.append(f"{from_date} 00:00:00")

        if to_date:
            query += " AND timestamp <= ?"
            params.append(f"{to_date} 23:59:59")

        query += " ORDER BY timestamp"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            raise HTTPException(status_code=404, detail="No data found for given filters")

        # Construir respuesta
        data_points = [
            DataPoint(timestamp=datetime.fromisoformat(row['timestamp']), value=row['value'])
            for row in rows
        ]

        values = [dp.value for dp in data_points]

        return DataResponse(
            metric="synthetic_monitoring_visible_stores",
            data=data_points,
            count=len(data_points),
            min_value=min(values),
            max_value=max(values),
            avg_value=sum(values) / len(values)
        )

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Chatbot semántico con RAG.

    Ejemplos de preguntas:
    - "¿Cuál fue el número máximo de tiendas disponibles?"
    - "¿Hubo alguna caída importante?"
    - "¿Cuál es la tendencia de disponibilidad?"
    - "¿A qué hora hay más tiendas activas?"
    """

    try:
        answer = chatbot.answer(request.question)
        return ChatResponse(
            answer=answer,
            sources=["Datos de Feb 01-11, 2026"],
            confidence="high"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


@app.get("/api/health")
def health():
    """Verifica que la BD está accesible"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM availability")
        count = cursor.fetchone()[0]
        conn.close()

        return {
            "status": "✅ Healthy",
            "database": str(DB_PATH),
            "records": count
        }

    except Exception as e:
        return {
            "status": "❌ Unhealthy",
            "error": str(e)
        }


# ============================================================================
# RUN
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting Rappi Availability API...")
    print("📍 http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print()

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
