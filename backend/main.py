from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from google.cloud import bigquery
import pandas as pd
import numpy as np
import json

app = FastAPI()

PROJECT_ID = "marketlens-ai-499816"
DATASET = "marketlens_ai"

client = bigquery.Client(project=PROJECT_ID)


def clean_df(df):
    return json.loads(
        df.to_json(orient="records", date_format="iso")
    )


@app.get("/")
def home():
    return {"status": "MarketLens API running"}


@app.get("/fundamentals/{ticker}")
def get_fundamentals(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.fundamentals`
    WHERE ticker = '{ticker.upper()}'
    LIMIT 10
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/news/{ticker}")
def get_news(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.news_articles`
    WHERE ticker = '{ticker.upper()}'
    LIMIT 10
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/market_prices/{ticker}")
def get_market_prices(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.market_prices`
    WHERE ticker = '{ticker.upper()}'
    LIMIT 100
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/analyst_ratings/{ticker}")
def get_analyst_ratings(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.analyst_ratings`
    WHERE ticker = '{ticker.upper()}'
    LIMIT 50
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/technical_indicators/{ticker}")
def get_technical_indicators(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.technical_indicators`
    WHERE ticker = '{ticker.upper()}'
    LIMIT 100
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/sec_filings/{ticker}")
def get_sec_filings(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.sec_filings`
    WHERE ticker = '{ticker.upper()}'
    LIMIT 20
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/economic_data")
def get_economic_data():
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.economic_data`
    LIMIT 100
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)