"""
Data Processor: Transforma CSV wide → long format
Responsabilidades:
- Parsear timestamps en formato verbose
- Convertir de wide (columnas=timestamps) a long (filas=timestamps)
- Limpiar y validar datos
"""

import pandas as pd
import re
from pathlib import Path
from datetime import datetime
from typing import Tuple


def parse_timestamp(timestamp_str: str) -> pd.Timestamp:
    """
    Parsea timestamps en formato:
    'Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)'

    Retorna: pd.Timestamp en ISO 8601
    """
    # Extrae: "Fri Feb 06 2026 10:59:40 GMT-0500"
    # Ignora: "(hora estándar de Colombia)"
    match = re.match(r'(\w+ \w+ \d+ \d+ \d+:\d+:\d+) GMT([+-]\d{2})(\d{2})', timestamp_str)

    if not match:
        raise ValueError(f"No se pudo parsear timestamp: {timestamp_str}")

    datetime_str, tz_hours, tz_minutes = match.groups()
    # Construir string con timezone: "Fri Feb 06 2026 10:59:40-0500"
    full_str = f"{datetime_str}GMT{tz_hours}{tz_minutes}"

    # Parsear con pandas (entiende formato %a %b %d %Y %H:%M:%S%z)
    ts = pd.to_datetime(full_str, format='%a %b %d %Y %H:%M:%S%zGMT%z')

    return ts


def process_single_csv(filepath: Path) -> pd.DataFrame:
    """
    Lee un CSV y lo transforma a formato long.

    Input (wide format):
        Plot name | metric | timestamp1 | timestamp2 | ...
        NOW       | visible_stores | 2749152 | 2749716 | ...

    Output (long format):
        plot_name | metric | timestamp | value
        NOW | visible_stores | 2026-02-06T10:59:40-05:00 | 2749152
        NOW | visible_stores | 2026-02-06T10:59:50-05:00 | 2749716
        ...
    """
    print(f"📖 Leyendo: {filepath.name}")

    # Leer el CSV
    df = pd.read_csv(filepath, encoding='utf-8')

    # Metadatos (primeras 4 columnas)
    metadata_cols = ['Plot name', 'metric (sf_metric)', 'Value Prefix', 'Value Suffix']

    # Validar que existen las columnas de metadatos
    for col in metadata_cols:
        if col not in df.columns:
            raise ValueError(f"Falta columna requerida: {col}")

    # Extraer metadatos (asumimos 1 fila de datos)
    if len(df) == 0:
        raise ValueError(f"CSV vacío: {filepath}")

    row = df.iloc[0]
    plot_name = row['Plot name']
    metric = row['metric (sf_metric)']

    # Identificar columnas de timestamps (todo después de metadatos)
    timestamp_cols = [col for col in df.columns if col not in metadata_cols]

    print(f"   - Plot: {plot_name}")
    print(f"   - Métrica: {metric}")
    print(f"   - Timestamps: {len(timestamp_cols)} registros")

    # Transformar a formato long
    records = []
    for timestamp_str in timestamp_cols:
        value_str = row[timestamp_str]

        # Skip si el valor está vacío
        if pd.isna(value_str) or value_str == '':
            continue

        try:
            # Parsear timestamp
            timestamp = parse_timestamp(timestamp_str)

            # Convertir valor a float
            value = float(value_str)

            records.append({
                'plot_name': plot_name,
                'metric': metric,
                'timestamp': timestamp,
                'value': value
            })
        except Exception as e:
            print(f"   ⚠️  Error procesando {timestamp_str}: {e}")
            continue

    # Crear DataFrame
    df_long = pd.DataFrame(records)

    # Asegurar tipos de datos
    df_long['timestamp'] = pd.to_datetime(df_long['timestamp'])
    df_long['value'] = pd.to_numeric(df_long['value'], errors='coerce')

    # Ordenar por timestamp
    df_long = df_long.sort_values('timestamp').reset_index(drop=True)

    print(f"   ✅ Transformado: {len(df_long)} registros en formato long\n")

    return df_long


def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, str]:
    """
    Valida que el DataFrame está limpio.
    Retorna: (es_válido, mensaje)
    """
    issues = []

    # Verificar columnas
    required_cols = {'plot_name', 'metric', 'timestamp', 'value'}
    if not required_cols.issubset(df.columns):
        missing = required_cols - set(df.columns)
        issues.append(f"Faltan columnas: {missing}")

    # Verificar tipos
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        issues.append("La columna 'timestamp' no es datetime")

    if not pd.api.types.is_numeric_dtype(df['value']):
        issues.append("La columna 'value' no es numérica")

    # Verificar valores nulos
    nulls = df.isnull().sum()
    if nulls.sum() > 0:
        issues.append(f"Valores nulos encontrados:\n{nulls[nulls > 0]}")

    # Verificar que timestamp está ordenado
    if not df['timestamp'].is_monotonic_increasing:
        issues.append("Los timestamps no están en orden cronológico")

    if issues:
        return False, "\n".join(issues)

    return True, "✅ DataFrame válido"


def print_dataframe_summary(df: pd.DataFrame):
    """Imprime un resumen del DataFrame procesado"""
    print("📊 Resumen del DataFrame:")
    print(f"   - Filas: {len(df)}")
    print(f"   - Columnas: {list(df.columns)}")
    print(f"   - Rango temporal: {df['timestamp'].min()} a {df['timestamp'].max()}")
    print(f"   - Métrica: {df['metric'].unique()}")
    print(f"   - Valor mín/máx: {df['value'].min()} / {df['value'].max()}")
    print(f"\n   Primeras 3 filas:")
    print(df.head(3).to_string(index=False))
    print()


if __name__ == "__main__":
    # Test: procesar el CSV de muestra
    sample_file = Path(__file__).parent.parent / "data" / "raw" / "AVAILABILITY-data-sample.csv"

    if not sample_file.exists():
        print(f"❌ Archivo no encontrado: {sample_file}")
        exit(1)

    print("=" * 60)
    print("🔄 DATA PROCESSOR - Transformando CSV wide → long")
    print("=" * 60)
    print()

    # Procesar
    df = process_single_csv(sample_file)

    # Validar
    is_valid, message = validate_dataframe(df)
    print(f"Validación: {message}")
    print()

    # Resumen
    if is_valid:
        print_dataframe_summary(df)
        print("✅ Procesamiento exitoso")
    else:
        print(f"❌ Validación falló")
        exit(1)
