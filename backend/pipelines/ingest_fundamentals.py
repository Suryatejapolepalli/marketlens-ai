from pathlib import Path

import pandas as pd
from google.cloud import bigquery

PROJECT_ID = "marketlens-ai-499816"
DATASET = "marketlens_ai"
TABLE = "fundamentals"

INPUT_FILE = Path("data/processed/fundamentals.csv")


def load_fundamentals():
    df = pd.read_csv(INPUT_FILE)

    client = bigquery.Client(project=PROJECT_ID)
    table_id = f"{PROJECT_ID}.{DATASET}.{TABLE}"

    job_config = bigquery.LoadJobConfig(
        write_disposition="WRITE_TRUNCATE",
        autodetect=True,
    )

    job = client.load_table_from_dataframe(df, table_id, job_config=job_config)
    job.result()

    print(f"Loaded {len(df)} rows into {table_id}")


if __name__ == "__main__":
    load_fundamentals()
