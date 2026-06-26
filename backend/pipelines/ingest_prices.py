from pathlib import Path

import pandas as pd
from google.cloud import bigquery

PROJECT_ID = "marketlens-ai-499816"
DATASET = "marketlens_ai"
TABLE = "market_prices"

INPUT_FILE = Path("data/processed/market_prices.csv")


def load_market_prices():
    df = pd.read_csv(INPUT_FILE, parse_dates=["date"])

    client = bigquery.Client(project=PROJECT_ID)
    table_id = f"{PROJECT_ID}.{DATASET}.{TABLE}"

    job_config = bigquery.LoadJobConfig(
        write_disposition="WRITE_TRUNCATE",
        schema=[
            bigquery.SchemaField("ticker", "STRING"),
            bigquery.SchemaField("date", "TIMESTAMP"),
            bigquery.SchemaField("open", "FLOAT"),
            bigquery.SchemaField("high", "FLOAT"),
            bigquery.SchemaField("low", "FLOAT"),
            bigquery.SchemaField("close", "FLOAT"),
            bigquery.SchemaField("adjusted_close", "FLOAT"),
            bigquery.SchemaField("volume", "INTEGER"),
        ],
    )

    job = client.load_table_from_dataframe(df, table_id, job_config=job_config)
    job.result()

    print(f"Loaded {len(df)} rows into {table_id}")


if __name__ == "__main__":
    load_market_prices()
