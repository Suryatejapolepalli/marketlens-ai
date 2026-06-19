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
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "eps": info.get("trailingEps"),
            "revenue": info.get("totalRevenue"),
            "profit_margin": info.get("profitMargins"),
            "debt_to_equity": info.get("debtToEquity")
        })

        print(f"Fetched {ticker}")

    except Exception as e:
        print(f"Failed {ticker}: {e}")

df = pd.DataFrame(rows)

Path("data/processed").mkdir(parents=True, exist_ok=True)

df.to_csv("data/processed/fundamentals.csv", index=False)

print(df.shape)