import json
from google.cloud import bigquery
from rag.retriever import add_documents

PROJECT_ID = "marketlens-ai-499816"
DATASET = "marketlens_ai"

client = bigquery.Client(project=PROJECT_ID)


def fetch_news():
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.news_articles`
    WHERE ticker IS NOT NULL
      AND datetime >= UNIX_SECONDS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 365 DAY))
    LIMIT 3000
    """
    rows = client.query(query).result()

    docs = []
    for i, row in enumerate(rows):
        data = dict(row)

        ticker = data.get("ticker", "")
        headline = data.get("headline", "")
        summary = data.get("summary", "")
        source = data.get("source", "")
        url = data.get("url", "")
        dt = data.get("datetime", "")

        text = f"""
Ticker: {ticker}
Type: News
Headline: {headline}
Summary: {summary}
Source: {source}
URL: {url}
DateTime: {dt}
""".strip()

        docs.append({
            "id": f"news_{ticker}_{i}",
            "text": text,
            "metadata": {
                "ticker": ticker,
                "source": "news"
            }
        })

    return docs


def fetch_filings():
    query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET}.sec_filings`
    WHERE ticker IS NOT NULL
      AND filing_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
    LIMIT 1000
    """
    rows = client.query(query).result()

    docs = []
    for i, row in enumerate(rows):
        data = dict(row)

        ticker = data.get("ticker", "")
        company_name = data.get("company_name", "")
        filing_type = data.get("filing_type", "")
        filing_date = data.get("filing_date", "")
        report_date = data.get("report_date", "")
        accession_number = data.get("accession_number", "")
        primary_document = data.get("primary_document", "")

        text = f"""
Ticker: {ticker}
Type: SEC Filing
Company: {company_name}
Filing Type: {filing_type}
Filing Date: {filing_date}
Report Date: {report_date}
Accession Number: {accession_number}
Primary Document: {primary_document}
""".strip()

        docs.append({
            "id": f"filing_{ticker}_{i}",
            "text": text,
            "metadata": {
                "ticker": ticker,
                "source": "sec_filing"
            }
        })

    return docs


if __name__ == "__main__":
    news_docs = fetch_news()
    filing_docs = fetch_filings()

    all_docs = news_docs + filing_docs
    add_documents(all_docs)

    print(f"Inserted {len(all_docs)} documents into ChromaDB.")