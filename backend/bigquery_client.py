from google.cloud import bigquery

client = bigquery.Client(project="marketlens-ai-499816")

query = """
SELECT *
FROM `marketlens-ai-499816.marketlens_ai.fundamentals`
LIMIT 5
"""

df = client.query(query).to_dataframe()
print(df.head())