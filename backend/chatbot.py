"""
Chatbot RAG (Retrieval-Augmented Generation)
Busca datos en SQLite + usa Groq para responder preguntas
Groq: Alternativa gratuita, muy rápida
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
from groq import Groq

# Cargar .env desde la raíz del proyecto
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Obtener API key
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "❌ GROQ_API_KEY no está configurada en .env\n"
        f"   Buscó en: {env_path}\n"
        "   Obtén una gratis en: https://console.groq.com"
    )

client = Groq(api_key=api_key)


class ChatbotRAG:
    """Chatbot semántico con grounding en datos reales"""

    def __init__(self, db_path: str):
        self.db_path = db_path

    def _fetch_data_summary(self) -> str:
        """Obtiene resumen estadístico de los datos para context"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Estadísticas globales
        cursor.execute("""
            SELECT
                COUNT(*) as total_records,
                MIN(timestamp) as start_date,
                MAX(timestamp) as end_date,
                MIN(value) as min_stores,
                MAX(value) as max_stores,
                AVG(value) as avg_stores,
                ROUND(AVG(value), 0) as rounded_avg
            FROM availability
        """)
        stats = cursor.fetchone()

        # Caídas detectadas (cambios grandes)
        cursor.execute("""
            WITH ranked AS (
                SELECT
                    timestamp,
                    value,
                    LAG(value) OVER (ORDER BY timestamp) as prev_value,
                    ABS(value - LAG(value) OVER (ORDER BY timestamp)) as change
                FROM availability
                ORDER BY timestamp
            )
            SELECT
                timestamp,
                prev_value,
                value,
                change
            FROM ranked
            WHERE change > 100000
            ORDER BY change DESC
            LIMIT 3
        """)
        anomalies = cursor.fetchall()

        # Patrones horarios
        cursor.execute("""
            SELECT
                strftime('%H', timestamp) as hour,
                COUNT(*) as measurements,
                ROUND(AVG(value), 0) as avg_value
            FROM availability
            GROUP BY hour
            ORDER BY hour
        """)
        hourly = cursor.fetchall()

        conn.close()

        # Formatear contexto
        summary = f"""
📊 DATASET: Disponibilidad de Tiendas Rappi (Feb 01-11, 2026)

ESTADÍSTICAS GENERALES:
- Total registros: {stats[0]:,}
- Período: {stats[1]} a {stats[2]}
- Tiendas mín: {stats[3]:,.0f} (horario bajo)
- Tiendas máx: {stats[4]:,.0f} (pico)
- Tiendas promedio: {stats[6]:,.0f}

TOP CAÍDAS DETECTADAS (cambios > 100k tiendas):
"""
        if anomalies:
            for ts, prev, curr, change in anomalies:
                summary += f"\n  • {ts}: {prev:,.0f} → {curr:,.0f} (cambio: {change:,.0f})"
        else:
            summary += "\n  (Sin caídas mayores)"

        summary += "\n\nPATRÓN HORARIO (promedio de tiendas por hora del día):\n"
        for hour, count, avg in hourly[:8]:  # Primeras 8 horas como ejemplo
            summary += f"  • {hour}:00 - {avg:,.0f} tiendas\n"

        return summary

    def _fetch_relevant_data(self, question: str, limit: int = 5) -> str:
        """Busca datos específicos relevantes a la pregunta"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Keywords en la pregunta
        question_lower = question.lower()

        context = ""

        # Si pregunta por máximo
        if any(w in question_lower for w in ["máximo", "máxima", "pico", "más alto", "highest", "maximum"]):
            cursor.execute("""
                SELECT timestamp, value FROM availability
                ORDER BY value DESC LIMIT 1
            """)
            row = cursor.fetchone()
            if row:
                context += f"\n📈 PICO HISTÓRICO: {row[0]} con {row[1]:,.0f} tiendas\n"

        # Si pregunta por mínimo
        if any(w in question_lower for w in ["mínimo", "mínima", "bajo", "más bajo", "lowest", "minimum", "caída"]):
            cursor.execute("""
                SELECT timestamp, value FROM availability
                WHERE value > 0
                ORDER BY value ASC LIMIT 1
            """)
            row = cursor.fetchone()
            if row:
                context += f"\n📉 PUNTO MÁS BAJO: {row[0]} con {row[1]:,.0f} tiendas\n"

        # Si pregunta por promedio
        if any(w in question_lower for w in ["promedio", "average", "típico", "normal"]):
            cursor.execute("""
                SELECT ROUND(AVG(value), 0) FROM availability
            """)
            avg = cursor.fetchone()[0]
            context += f"\n📊 PROMEDIO: {avg:,.0f} tiendas\n"

        # Si pregunta por un día específico
        for month_day in ["febrero", "feb", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"]:
            if month_day in question_lower:
                cursor.execute("""
                    SELECT
                        AVG(value) as avg_val,
                        MIN(value) as min_val,
                        MAX(value) as max_val
                    FROM availability
                    WHERE strftime('%m-%d', timestamp) LIKE ?
                """, (f"%{month_day}%",))
                row = cursor.fetchone()
                if row:
                    context += f"\n📅 Para {month_day}: prom={row[0]:,.0f}, min={row[1]:,.0f}, max={row[2]:,.0f}\n"

        conn.close()

        return context if context else "\n(Datos generales disponibles - ver resumen arriba)\n"

    def answer(self, question: str) -> str:
        """
        Responde una pregunta usando RAG:
        1. Busca datos relevantes en SQLite
        2. Construye prompt con contexto real
        3. Groq LLM sintetiza la respuesta
        """

        # Obtener contexto
        data_summary = self._fetch_data_summary()
        relevant_data = self._fetch_relevant_data(question)

        # Construir prompt para Claude
        system_prompt = f"""Eres un asistente analítico para Rappi que responde preguntas sobre disponibilidad de tiendas.

Tienes acceso a estos datos:
{data_summary}

{relevant_data}

INSTRUCCIONES:
- Responde SIEMPRE en ESPAÑOL
- Basa tus respuestas en los datos mostrados arriba
- Sé específico con números y fechas
- Si no tienes datos para una pregunta, dilo explícitamente
- Sé conciso (máximo 3 párrafos)
- Proporciona insights útiles para la operación de Rappi
"""

        user_message = f"Pregunta: {question}"

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                max_tokens=500,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )

            answer = response.choices[0].message.content
            return answer

        except Exception as e:
            return f"❌ Error del chatbot: {str(e)}\n\nIntenta de nuevo o revisa que GROQ_API_KEY esté configurada."


if __name__ == "__main__":
    # Test simple
    from pathlib import Path

    db = Path(__file__).parent.parent / "data" / "availability.db"

    if not db.exists():
        print("❌ Base de datos no encontrada. Ejecuta: python backend/init_db.py")
        exit(1)

    print("🤖 Inicializando chatbot...")
    bot = ChatbotRAG(str(db))

    print("\n" + "=" * 60)
    print("💬 CHATBOT TEST")
    print("=" * 60)

    test_questions = [
        "¿Cuál fue el número máximo de tiendas disponibles?",
        "¿Hubo caídas importantes en la disponibilidad?",
        "¿Cuál es el promedio de tiendas?",
    ]

    for q in test_questions:
        print(f"\nQ: {q}")
        answer = bot.answer(q)
        print(f"A: {answer}\n")
        print("-" * 60)
