from pathlib import Path
from datetime import datetime

import pandas as pd
import yfinance as yf

RAW_DIR = Path("data/raw/prices")
PROCESSED_DIR = Path("data/processed")

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def get_price_data(ticker):
    df = yf.download(
        ticker,
        period="5y",
        interval="1d",
        auto_adjust=False,
        progress=False
    )

    if df.empty:
        raise Exception(f"No data found for {ticker}")

    df = df.reset_index()

    # Fix yfinance multi-index columns issue
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] for col in df.columns]

    df["ticker"] = ticker

    clean_df = df.rename(columns={
        "Date": "date",
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Adj Close": "adjusted_close",
        "Volume": "volume"
    })

    clean_df = clean_df[[
        "ticker",
        "date",
        "open",
        "high",
        "low",
        "close",
        "adjusted_close",
        "volume"
    ]]

    return clean_df


if __name__ == "__main__":
    tickers = [
    "AAPL", "MSFT", "NVDA", "AMD", "TSLA",
    "PLTR", "SOFI", "RIVN", "COIN", "HOOD",
    "SNOW", "DDOG", "NET", "CRWD", "AI",
    "META", "GOOGL", "AMZN", "NFLX", "INTC"]

    all_prices = []

    for ticker in tickers:
        print(f"Fetching price data for {ticker}")

        df = get_price_data(ticker)

        raw_file = RAW_DIR / f"{ticker}_{datetime.now().strftime('%Y-%m-%d')}.json"
        df.to_json(raw_file, orient="records", indent=2, date_format="iso")

        all_prices.append(df)

        print(f"Saved raw data: {raw_file}")

    final_df = pd.concat(all_prices, ignore_index=True)

    output_file = PROCESSED_DIR / "market_prices.csv"
    final_df.to_csv(output_file, index=False)

    print(f"Processed price data saved: {output_file}")