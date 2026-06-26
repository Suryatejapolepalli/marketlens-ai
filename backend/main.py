from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import bigquery
import pandas as pd
import numpy as np
import json
from agents.orchestrator import run_agents
from rag.retriever import search_documents

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ID = "marketlens-ai-499816"
DATASET = "marketlens_ai"

client = bigquery.Client(project=PROJECT_ID)


def clean_df(df):
    return json.loads(
        df.to_json(orient="records", date_format="iso")
    )


@app.get("/")
def home():
    print("ROOT HIT")
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
    ORDER BY filing_date DESC
    LIMIT 20
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)


@app.get("/economic_data")
def get_economic_data():
    query = f"""
    SELECT indicator_code, indicator_name, value, date
    FROM `{PROJECT_ID}.{DATASET}.economic_data`
    QUALIFY ROW_NUMBER() OVER (PARTITION BY indicator_name ORDER BY date DESC) = 1
    ORDER BY indicator_name
    """
    df = client.query(query).to_dataframe()
    return clean_df(df)

from pydantic import BaseModel
from datetime import datetime
import uuid

class RegisterUser(BaseModel):
    name: str
    email: str
    password: str

class LoginUser(BaseModel):
    email: str
    password: str

class WatchlistItem(BaseModel):
    user_id: str
    ticker: str

class FriendItem(BaseModel):
    user_id: str
    friend_id: str

class CommentItem(BaseModel):
    user_id: str
    ticker: str
    comment: str


@app.post("/users/register")
def register_user(user: RegisterUser):
    existing_query = f"""
    SELECT user_id
    FROM `{PROJECT_ID}.{DATASET}.users`
    WHERE email=@email
    LIMIT 1
    """
    existing_job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("email", "STRING", user.email),
    ])
    if list(client.query(existing_query, job_config=existing_job_config).result()):
        return {"success": False, "message": "Email already registered"}

    user_id = str(uuid.uuid4())

    query = f"""
    INSERT INTO `{PROJECT_ID}.{DATASET}.users`
    VALUES (@user_id, @name, @email, @password, @created_at)
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        bigquery.ScalarQueryParameter("name", "STRING", user.name),
        bigquery.ScalarQueryParameter("email", "STRING", user.email),
        bigquery.ScalarQueryParameter("password", "STRING", user.password),
        bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.utcnow()),
    ])

    client.query(query, job_config=job_config).result()
    return {"success": True, "user_id": user_id}


@app.post("/users/login")
def login_user(user: LoginUser):
    query = f"""
    SELECT user_id, name, email
    FROM `{PROJECT_ID}.{DATASET}.users`
    WHERE email=@email AND password=@password
    LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("email", "STRING", user.email),
        bigquery.ScalarQueryParameter("password", "STRING", user.password),
    ])

    rows = list(client.query(query, job_config=job_config).result())

    if not rows:
        return {"success": False, "message": "Invalid login"}

    r = rows[0]
    return {"success": True, "user_id": r.user_id, "name": r.name, "email": r.email}


@app.get("/users/search")
def search_users(q: str):
    query = f"""
    SELECT user_id, name, email
    FROM `{PROJECT_ID}.{DATASET}.users`
    WHERE LOWER(name) LIKE LOWER(@q)
       OR LOWER(email) LIKE LOWER(@q)
    LIMIT 20
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("q", "STRING", f"%{q}%")
    ])

    rows = client.query(query, job_config=job_config).result()
    return [dict(row) for row in rows]


@app.post("/watchlist/add")
def add_watchlist(item: WatchlistItem):
    query = f"""
    INSERT INTO `{PROJECT_ID}.{DATASET}.watchlists`
    VALUES (@user_id, @ticker, @created_at)
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("user_id", "STRING", item.user_id),
        bigquery.ScalarQueryParameter("ticker", "STRING", item.ticker.upper()),
        bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.utcnow()),
    ])

    client.query(query, job_config=job_config).result()
    return {"message": "Added to watchlist"}


@app.get("/watchlist/{user_id}")
def get_watchlist(user_id: str):
    query = f"""
    SELECT ticker, created_at
    FROM `{PROJECT_ID}.{DATASET}.watchlists`
    WHERE user_id=@user_id
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id)
    ])

    rows = client.query(query, job_config=job_config).result()
    return [dict(row) for row in rows]


@app.post("/friends/add")
def add_friend(item: FriendItem):
    query = f"""
    INSERT INTO `{PROJECT_ID}.{DATASET}.friends`
    VALUES
    (@user_id, @friend_id, @created_at),
    (@friend_id, @user_id, @created_at)
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("user_id", "STRING", item.user_id),
        bigquery.ScalarQueryParameter("friend_id", "STRING", item.friend_id),
        bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.utcnow()),
    ])

    client.query(query, job_config=job_config).result()
    return {"message": "Friend added"}


@app.get("/friends/{user_id}")
def get_friends(user_id: str):
    query = f"""
    SELECT u.user_id, u.name, u.email
    FROM `{PROJECT_ID}.{DATASET}.friends` f
    JOIN `{PROJECT_ID}.{DATASET}.users` u
    ON f.friend_id = u.user_id
    WHERE f.user_id=@user_id
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id)
    ])

    rows = client.query(query, job_config=job_config).result()
    return [dict(row) for row in rows]


@app.post("/comments/add")
def add_comment(item: CommentItem):
    comment_id = str(uuid.uuid4())

    query = f"""
    INSERT INTO `{PROJECT_ID}.{DATASET}.comments`
    VALUES (@comment_id, @user_id, @ticker, @comment, @created_at)
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("comment_id", "STRING", comment_id),
        bigquery.ScalarQueryParameter("user_id", "STRING", item.user_id),
        bigquery.ScalarQueryParameter("ticker", "STRING", item.ticker.upper()),
        bigquery.ScalarQueryParameter("comment", "STRING", item.comment),
        bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.utcnow()),
    ])

    client.query(query, job_config=job_config).result()
    return {"message": "Comment added"}


@app.get("/comments/{ticker}")
def get_comments(ticker: str):
    query = f"""
    SELECT c.comment_id, c.ticker, c.comment, c.created_at, u.name, u.email
    FROM `{PROJECT_ID}.{DATASET}.comments` c
    JOIN `{PROJECT_ID}.{DATASET}.users` u
    ON c.user_id = u.user_id
    WHERE c.ticker=@ticker
    ORDER BY c.created_at DESC
    LIMIT 50
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("ticker", "STRING", ticker.upper())
    ])

    rows = client.query(query, job_config=job_config).result()
    return [dict(row) for row in rows]


@app.get("/ai/score/{ticker}")
def ai_stock_score(ticker: str):
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.technical_indicators`
    WHERE ticker=@ticker
    ORDER BY date DESC
    LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("ticker", "STRING", ticker.upper())
    ])

    rows = list(client.query(query, job_config=job_config).result())

    if not rows:
        return {"error": "No technical data found"}

    r = rows[0]

    score = 50
    reasons = []

    if r.trend_signal == "Bullish":
        score += 20
        reasons.append("Bullish trend signal")
    elif r.trend_signal == "Bearish":
        score -= 20
        reasons.append("Bearish trend signal")

    if r.close > r.sma_20:
        score += 10
        reasons.append("Price above SMA 20")

    if r.close > r.sma_50:
        score += 10
        reasons.append("Price above SMA 50")

    if r.volume_ratio and r.volume_ratio > 1:
        score += 5
        reasons.append("Volume is stronger than average")

    if r.volatility_20 and r.volatility_20 > 0.04:
        score -= 10
        reasons.append("High volatility risk")

    score = max(0, min(100, score))

    if score >= 75:
        recommendation = "Bullish"
    elif score >= 55:
        recommendation = "Neutral / Hold"
    else:
        recommendation = "Risky / Bearish"

    return {
        "ticker": ticker.upper(),
        "score": score,
        "recommendation": recommendation,
        "trend_signal": r.trend_signal,
        "close": r.close,
        "sma_20": r.sma_20,
        "sma_50": r.sma_50,
        "volatility_20": r.volatility_20,
        "volume_ratio": r.volume_ratio,
        "reasons": reasons,
    }

@app.get("/ai/analyze/{ticker}")
def ai_analyze(ticker: str):
    indicators = get_technical_indicators(ticker)
    fundamentals_list = get_fundamentals(ticker)
    news = get_news(ticker)
    analyst_ratings = get_analyst_ratings(ticker)
    economic_data = get_economic_data()

    fundamentals = fundamentals_list[0] if fundamentals_list else {}

    return run_agents(
        ticker=ticker.upper(),
        indicators=indicators,
        fundamentals=fundamentals,
        news=news,
        economic_data=economic_data,
        analyst_ratings=analyst_ratings
    )
@app.get("/rag/search/{ticker}")
def rag_search(ticker: str):
    return search_documents(
        query=f"Latest important news, filings, risks, and market context about {ticker}",
        ticker=ticker,
        n_results=5
    )