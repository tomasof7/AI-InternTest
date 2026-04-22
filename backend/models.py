"""
Modelos Pydantic para FastAPI
Define estructura de requests/responses
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DataPoint(BaseModel):
    """Un punto de datos: timestamp + valor de tiendas disponibles"""
    timestamp: datetime
    value: float


class DataResponse(BaseModel):
    """Respuesta de GET /api/data"""
    metric: str
    data: list[DataPoint]
    count: int
    min_value: float
    max_value: float
    avg_value: float


class ChatMessage(BaseModel):
    """Un mensaje en el chat"""
    role: str  # "user" o "assistant"
    content: str


class ChatRequest(BaseModel):
    """Request para POST /api/chat"""
    question: str


class ChatResponse(BaseModel):
    """Respuesta del chatbot"""
    answer: str
    sources: list[str]  # URLs o referencias a datos
    confidence: str  # "high", "medium", "low"
