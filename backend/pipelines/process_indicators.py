from pathlib import Path
import pandas as pd

INPUT_FILE = Path("data/processed/market_prices.csv")
OUTPUT_FILE = Path("data/processed/technical_indicators.csv")

df = pd.read_csv(INPUT_FILE)

df["date"] = pd.to_datetime(df["date"])
df = df.sort_values(["ticker", "date"]).reset_index(drop=True)

g = df.groupby("ticker")

df["daily_return"] = g["close"].pct_change()
df["sma_20"] = g["close"].transform(lambda x: x.rolling(20).mean())
df["sma_50"] = g["close"].transform(lambda x: x.rolling(50).mean())
df["volatility_20"] = g["daily_return"].transform(lambda x: x.rolling(20).std())
df["avg_volume_20"] = g["volume"].transform(lambda x: x.rolling(20).mean())
df["volume_ratio"] = df["volume"] / df["avg_volume_20"]


def rsi(close, period=14):
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


def macd(close, fast=12, slow=26):
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    return ema_fast - ema_slow


df["rsi"] = g["close"].transform(rsi)
df["macd"] = g["close"].transform(macd)

df["trend_signal"] = "Neutral"
df.loc[df["close"] > df["sma_20"], "trend_signal"] = "Bullish"
df.loc[df["close"] < df["sma_20"], "trend_signal"] = "Bearish"

df.to_csv(OUTPUT_FILE, index=False)

print(f"Saved technical indicators to {OUTPUT_FILE}")
print(df.columns.tolist())
print(df.tail())