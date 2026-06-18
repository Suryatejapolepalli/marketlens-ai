import os
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("FINNHUB_API_KEY")


TICKERS = [
    "AAPL", "MSFT", "NVDA", "AMD", "TSLA",
    "PLTR", "SOFI", "RIVN", "COIN", "HOOD",
    "SNOW", "DDOG", "NET", "CRWD", "AI",
    "META", "GOOGL", "AMZN", "NFLX", "INTC"
]

all_news = []

for ticker in TICKERS:
    print(f"Fetching news for {ticker}")

    url = (
        f"https://finnhub.io/api/v1/company-news"
        f"?symbol={ticker}"
        f"&from=2025-01-01"
        f"&to=2026-12-31"
        f"&token={API_KEY}"
    )

    response = requests.get(url)

    if response.status_code != 200:
        print(f"Failed: {ticker}")
        continue

    news = response.json()

    for item in news:
        all_news.append({
            "ticker": ticker,
            "headline": item.get("headline"),
            "summary": item.get("summary"),
            "source": item.get("source"),
            "url": item.get("url"),
            "datetime": item.get("datetime")
        })

df = pd.DataFrame(all_news)

df.to_csv(
    "data/processed/news_articles.csv",
    index=False
)

print("Saved news_articles.csv")