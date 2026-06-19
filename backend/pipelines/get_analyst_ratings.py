import yfinance as yf
import pandas as pd
from pathlib import Path

TICKERS = [
    "AAPL", "MSFT", "NVDA", "AMD", "TSLA",
    "PLTR", "SOFI", "RIVN", "COIN", "HOOD",
    "SNOW", "DDOG", "NET", "CRWD", "AI",
    "META", "GOOGL", "AMZN", "NFLX", "INTC"
]
rows = []

for ticker in TICKERS:
    try:
        info = yf.Ticker(ticker).info

        rows.append({
            "ticker": ticker,
            "recommendation": info.get("recommendationKey"),
            "target_mean_price": info.get("targetMeanPrice"),
            "target_high_price": info.get("targetHighPrice"),
            "target_low_price": info.get("targetLowPrice"),
            "number_of_analysts": info.get("numberOfAnalystOpinions")
        })

        print(f"Fetched {ticker}")

    except Exception as e:
        print(f"Failed {ticker}: {e}")

df = pd.DataFrame(rows)

Path("data/processed").mkdir(parents=True, exist_ok=True)

df.to_csv("data/processed/analyst_ratings.csv", index=False)

print(df.shape)