from pathlib import Path
import pandas as pd

INPUT_FILE = Path("data/processed/market_prices.csv")
OUTPUT_FILE = Path("data/processed/technical_indicators.csv")

df = pd.read_csv(INPUT_FILE)

df["date"] = pd.to_datetime(df["date"])
df = df.sort_values(["ticker", "date"])

def add_indicators(group):
    group = group.copy()

    group["daily_return"] = group["close"].pct_change()
    group["sma_20"] = group["close"].rolling(window=20).mean()
    group["sma_50"] = group["close"].rolling(window=50).mean()
    group["volatility_20"] = group["daily_return"].rolling(window=20).std()
    group["avg_volume_20"] = group["volume"].rolling(window=20).mean()
    group["volume_ratio"] = group["volume"] / group["avg_volume_20"]

    group["trend_signal"] = "Neutral"
    group.loc[group["close"] > group["sma_20"], "trend_signal"] = "Bullish"
    group.loc[group["close"] < group["sma_20"], "trend_signal"] = "Bearish"

    return group

result = df.groupby("ticker", group_keys=False).apply(add_indicators)

result.to_csv(OUTPUT_FILE, index=False)

print(f"Saved technical indicators to {OUTPUT_FILE}")
print(result.tail())
