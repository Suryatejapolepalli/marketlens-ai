import os, json, re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


def extract_json(text):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON found in AI response")
    return json.loads(match.group())


def analyze_sentiment(news: list, ticker: str = "this stock"):
    if not news:
        return {
            "signal": "Neutral",
            "score": 50,
            "reasons": ["No news data available"]
        }

    if not client:
        return {
            "signal": "Neutral",
            "score": 50,
            "reasons": ["OPENAI_API_KEY not configured"]
        }

    news_text = "\n".join([
        f"- {item.get('title', '')}: {item.get('summary', '')}"
        for item in news[:8]
    ])

    prompt = f"""
Analyze stock news sentiment for ticker: {ticker}.

Only include news that has a clear direct impact on {ticker}.
Consider:
- company-specific news
- earnings / product / partnership news
- political issues
- geopolitical tensions
- tariffs, sanctions, trade restrictions
- government regulations
- wars or peace deals
- supply chain impact
- interest rate / Fed policy impact

Ignore unrelated companies, ETFs, or broad sector news unless there is a clear causal link to {ticker}.

Example:
DeepSeek news can affect NVDA because it may reduce GPU demand.
US-China chip restrictions can affect NVDA/AMD because they limit AI chip sales.
Tariffs can affect AAPL because Apple depends on global supply chains.

Return ONLY valid JSON:
{{
  "signal": "Positive/Neutral/Negative",
  "score": 0-100,
  "reasons": [
    "Direct reason 1",
    "Direct reason 2",
    "Direct reason 3"
  ]
}}

News:
{news_text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Return only valid JSON. No markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content
        return extract_json(content)

    except Exception as e:
        return {
            "signal": "Neutral",
            "score": 50,
            "reasons": [f"AI sentiment failed: {str(e)}"]
        }