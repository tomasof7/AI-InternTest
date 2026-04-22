"""
Inicializa SQLite con datos procesados
Carga: data/processed/availability_processed.csv → SQLite
Crea índices para queries rápidas
"""

import sqlite3
import pandas as pd
from pathlib import Path

DB_PATH = "data/availability.db"
CSV_PATH = "data/processed/availability_processed.csv"


def init_database():
    """Crea y carga la base de datos SQLite"""

    print("=" * 60)
    print("🗄️  INICIALIZANDO DATABASE SQLITE")
    print("=" * 60)

    # Leer datos procesados
    print(f"\n📖 Leyendo: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"   Filas: {len(df):,}")

    # Convertir timestamp a datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Conectar a BD (se crea si no existe)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("\n🗑️  Limpiando tabla anterior (si existe)...")
    cursor.execute("DROP TABLE IF EXISTS availability")

    # Crear tabla
    print("📝 Creando tabla...")
    cursor.execute("""
        CREATE TABLE availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plot_name TEXT NOT NULL,
            metric TEXT NOT NULL,
            timestamp DATETIME NOT NULL,
            value REAL NOT NULL,
            source_file TEXT
        )
    """)

    # Insertar datos
    print("💾 Insertando datos...")
    df.to_sql("availability", conn, if_exists="append", index=False)

    # Crear índices para queries rápidas
    print("📌 Creando índices...")
    cursor.execute("CREATE INDEX idx_timestamp ON availability(timestamp)")
    cursor.execute("CREATE INDEX idx_metric ON availability(metric)")
    cursor.execute("CREATE INDEX idx_metric_timestamp ON availability(metric, timestamp)")

    # Commit y estadísticas
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM availability")
    row_count = cursor.fetchone()[0]

    cursor.execute("SELECT MIN(timestamp), MAX(timestamp) FROM availability")
    min_ts, max_ts = cursor.fetchone()

    cursor.execute("SELECT MIN(value), MAX(value) FROM availability")
    min_val, max_val = cursor.fetchone()

    print("\n" + "=" * 60)
    print("✅ DATABASE CREADA EXITOSAMENTE")
    print("=" * 60)
    print(f"  Archivo: {DB_PATH}")
    print(f"  Filas: {row_count:,}")
    print(f"  Rango temporal: {min_ts} → {max_ts}")
    print(f"  Valores: {min_val:,.0f} → {max_val:,.0f}")
    print(f"  Índices: timestamp, metric, metric_timestamp")

    conn.close()
    print()


if __name__ == "__main__":
    init_database()
