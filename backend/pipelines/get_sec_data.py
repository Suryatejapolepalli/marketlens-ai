import os
import json
from pathlib import Path
from datetime import datetime

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

SEC_USER_AGENT = os.getenv(
    "SEC_USER_AGENT",
    "MarketLensAI suryapolepalle9@gmail.com"
)

TICKERS = [
    "AAPL", "MSFT", "NVDA", "AMD", "TSLA",
    "PLTR", "SOFI", "RIVN", "COIN", "HOOD",
    "SNOW", "DDOG", "NET", "CRWD", "AI",
    "META", "GOOGL", "AMZN", "NFLX", "INTC"
]

RAW_DIR = Path("data/raw/sec")
PROCESSED_DIR = Path("data/processed")

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def get_headers(host):
    return {
        "User-Agent": SEC_USER_AGENT,
        "Accept-Encoding": "gzip, deflate",
        "Host": host
    }


def get_ticker_cik_map():
    url = "https://www.sec.gov/files/company_tickers.json"

    response = requests.get(
        url,
        headers=get_headers("www.sec.gov"),
        timeout=30
    )
    response.raise_for_status()

    data = response.json()
    ticker_map = {}

    for _, company in data.items():
        ticker = company["ticker"].upper()
        ticker_map[ticker] = {
            "cik": str(company["cik_str"]).zfill(10),
            "company_name": company["title"]
        }

    return ticker_map


def get_sec_submissions(cik):
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"

    response = requests.get(
        url,
        headers=get_headers("data.sec.gov"),
        timeout=30
    )
    response.raise_for_status()

    return response.json()


def save_raw(ticker, data):
    today = datetime.now().strftime("%Y-%m-%d")
    file_path = RAW_DIR / f"{ticker}_{today}.json"

    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Saved raw SEC data: {file_path}")


def clean_sec_data(ticker, company_name, cik, data):
    recent = data.get("filings", {}).get("recent", {})

    rows = []

    forms = recent.get("form", [])
    filing_dates = recent.get("filingDate", [])
    report_dates = recent.get("reportDate", [])
    accession_numbers = recent.get("accessionNumber", [])
    primary_documents = recent.get("primaryDocument", [])

    for i in range(len(forms)):
        if forms[i] in ["10-K", "10-Q", "8-K"]:
            rows.append({
                "ticker": ticker,
                "company_name": company_name,
                "cik": cik,
                "filing_type": forms[i],
                "filing_date": filing_dates[i],
                "report_date": report_dates[i],
                "accession_number": accession_numbers[i],
                "primary_document": primary_documents[i]
            })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    ticker_map = get_ticker_cik_map()

    all_filings = []

    for ticker in TICKERS:
        print(f"Fetching SEC filings for {ticker}")

        if ticker not in ticker_map:
            print(f"CIK not found for {ticker}")
            continue

        cik = ticker_map[ticker]["cik"]
        company_name = ticker_map[ticker]["company_name"]

        raw_data = get_sec_submissions(cik)
        save_raw(ticker, raw_data)

        clean_df = clean_sec_data(ticker, company_name, cik, raw_data)

        if not clean_df.empty:
            all_filings.append(clean_df)

    final_df = pd.concat(all_filings, ignore_index=True)

    final_df = final_df.drop_duplicates(
        subset=["ticker", "accession_number"]
    )

    output_file = PROCESSED_DIR / "sec_filings.csv"
    final_df.to_csv(output_file, index=False)

    print(f"Saved SEC filings data: {output_file}")
    print(final_df.head())