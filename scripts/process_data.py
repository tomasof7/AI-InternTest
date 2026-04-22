"""
Pipeline de procesamiento: wide CSV -> long format consolidado
Datos: synthetic_monitoring_visible_stores (Rappi)
Cada CSV = ~1 hora de mediciones cada 10 segundos
"""

import os
import re
import pandas as pd
from pathlib import Path

INPUT_FOLDER = "data/raw"
OUTPUT_FILE = "data/processed/availability_processed.csv"

BASE_METADATA_COLS = ["Plot name", "metric (sf_metric)", "Value Prefix", "Value Suffix"]

# Regex para timestamps: "Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)"
TIMESTAMP_RE = re.compile(
    r'\w+ (\w+ \d+ \d+ \d+:\d+:\d+) GMT([+-]\d{2})(\d{2})'
)


def parse_timestamp(col_name: str):
    """
    Parsea el formato verbose de SignalFx/Splunk.
    Ejemplo: 'Fri Feb 06 2026 10:59:40 GMT-0500 (hora estándar de Colombia)'
    Retorna: Timestamp UTC-naive para consistencia entre archivos
    """
    m = TIMESTAMP_RE.search(col_name)
    if not m:
        return None

    datetime_part, tz_h, tz_m = m.groups()
    # Construir string parseablecon dateutil: "Feb 06 2026 10:59:40-0500"
    ts_str = f"{datetime_part}{tz_h}{tz_m}"
    try:
        ts = pd.to_datetime(ts_str, format="%b %d %Y %H:%M:%S%z")
        return ts.tz_convert("UTC")  # Normalizar a UTC siempre
    except Exception:
        return None


def process_file(filepath: str):
    """
    Transforma 1 CSV de wide format a long format.

    Wide:  plot_name | metric | ts_1 | ts_2 | ts_3 ...
           NOW       | vis... | 18647| 18846| 18751

    Long:  plot_name | metric              | timestamp           | value
           NOW       | visible_stores      | 2026-02-01 11:59:40 | 18647
           NOW       | visible_stores      | 2026-02-01 12:00:10 | 18846
    """
    try:
        df = pd.read_csv(filepath)
        df.columns = [c.strip() for c in df.columns]

        # Validar columnas requeridas
        if "Plot name" not in df.columns or "metric (sf_metric)" not in df.columns:
            print(f"  ⚠️  Omitiendo {os.path.basename(filepath)}: sin columnas requeridas")
            return None

        if len(df) == 0:
            print(f"  ⚠️  Omitiendo {os.path.basename(filepath)}: archivo vacío")
            return None

        # Columnas de timestamps = todo lo que no es metadata
        metadata_in_file = [c for c in BASE_METADATA_COLS if c in df.columns]
        ts_cols = [c for c in df.columns if c not in metadata_in_file]

        if not ts_cols:
            print(f"  ⚠️  Omitiendo {os.path.basename(filepath)}: sin columnas de timestamp")
            return None

        # Parsear todos los timestamps de las columnas
        ts_map = {}
        for col in ts_cols:
            ts = parse_timestamp(col)
            if ts is not None:
                ts_map[col] = ts

        valid_ts_cols = list(ts_map.keys())

        if not valid_ts_cols:
            print(f"  ⚠️  Omitiendo {os.path.basename(filepath)}: timestamps no parseables")
            return None

        # Transformar wide -> long (solo columnas con timestamps válidos)
        row = df.iloc[0]
        records = []
        for col in valid_ts_cols:
            raw_val = row[col]
            if pd.isna(raw_val):
                continue
            try:
                value = float(raw_val)
            except (ValueError, TypeError):
                continue

            records.append({
                "plot_name": str(row.get("Plot name", "UNKNOWN")).strip(),
                "metric": str(row.get("metric (sf_metric)", "UNKNOWN")).strip(),
                "timestamp": ts_map[col],
                "value": value,
                "source_file": os.path.basename(filepath),
            })

        if not records:
            print(f"  ⚠️  Omitiendo {os.path.basename(filepath)}: sin datos válidos")
            return None

        result = pd.DataFrame(records).sort_values("timestamp").reset_index(drop=True)
        return result

    except Exception as e:
        print(f"  ❌ Error en {os.path.basename(filepath)}: {e}")
        return None


def main():
    print("=" * 60)
    print("🔄 PIPELINE: wide CSVs -> long format consolidado")
    print("=" * 60)

    if not os.path.exists(INPUT_FOLDER):
        raise FileNotFoundError(f"No existe la carpeta: {INPUT_FOLDER}")

    files = sorted([
        f for f in os.listdir(INPUT_FOLDER)
        if f.endswith(".csv")
    ])

    if not files:
        raise FileNotFoundError(f"No hay CSVs en {INPUT_FOLDER}")

    print(f"\n📁 Archivos encontrados: {len(files)}\n")

    all_data = []
    errors = 0

    for i, filename in enumerate(files, 1):
        filepath = os.path.join(INPUT_FOLDER, filename)
        print(f"[{i:>3}/{len(files)}] {filename[:60]}", end=" ... ")

        df = process_file(filepath)
        if df is not None:
            all_data.append(df)
            print(f"✅ {len(df)} registros")
        else:
            errors += 1

    if not all_data:
        raise ValueError(
            "No se procesó ningún archivo. Revisa los CSVs en data/raw/"
        )

    # Consolidar
    print("\n🔗 Consolidando todos los archivos...")
    final_df = pd.concat(all_data, ignore_index=True)
    final_df = final_df.sort_values("timestamp").reset_index(drop=True)

    # Eliminar duplicados exactos (mismo metric + timestamp)
    before = len(final_df)
    final_df = final_df.drop_duplicates(subset=["metric", "timestamp"])
    after = len(final_df)
    if before != after:
        print(f"  ℹ️  Duplicados eliminados: {before - after}")

    # Guardar
    os.makedirs("data/processed", exist_ok=True)
    final_df.to_csv(OUTPUT_FILE, index=False)

    # Resumen
    print("\n" + "=" * 60)
    print("✅ DATASET CONSOLIDADO CREADO")
    print("=" * 60)
    print(f"  Archivo de salida : {OUTPUT_FILE}")
    print(f"  Total filas       : {len(final_df):,}")
    print(f"  Archivos OK       : {len(all_data)}")
    print(f"  Archivos con error: {errors}")
    print(f"  Rango temporal    : {final_df['timestamp'].min()} → {final_df['timestamp'].max()}")
    print(f"  Métricas únicas   : {final_df['metric'].unique().tolist()}")
    print(f"  Valor mín / máx   : {final_df['value'].min():,.0f} / {final_df['value'].max():,.0f}")
    print(f"\n  Columnas: {final_df.columns.tolist()}")
    print("\n  Muestra (primeras 5 filas):")
    print(final_df.head(5).to_string(index=False))

    return final_df


if __name__ == "__main__":
    main()
