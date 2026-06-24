import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


def generate_llm_summary(
    ticker: str,
    technical: dict,
    sentiment: dict,
    fundamentals: dict,
    risk: dict,
    market_context: dict,
    rag_context: dict,
    final: dict
):
    if not client:
        return "LLM summary unavailable: OPENAI_API_KEY not configured."

    prompt = f"""
You are an AI stock research assistant for everyday investors.

Analyze stock {ticker} using agent outputs and retrieved RAG context.

Technical Analysis:
{technical}

Sentiment Analysis:
{sentiment}

Fundamental Analysis:
{fundamentals}

Risk Analysis:
{risk}

Market Context:
{market_context}

Retrieved RAG Context:
{rag_context}

Final Recommendation:
{final}

Write a simple, non-technical stock summary for a normal user.

Rules:
- Avoid heavy finance jargon.
- If you mention a finance term like P/E ratio, immediately explain it in plain English.
- Keep it easy to understand for someone new to investing.
- Focus on what is happening, why it matters, and what it means for the stock.
- Mention important recent news or SEC context only if it is relevant.
- Be balanced: mention both positives and risks.

Return the summary in this exact structure:

Stock: {ticker}

Recommendation:
One line saying Buy / Hold / Sell and why in simple words.

What looks good:
- point 1
- point 2
- point 3

What to watch out for:
- point 1
- point 2
- point 3

Simple takeaway:
2-3 lines explaining whether this stock currently looks strong, risky, or worth waiting on.

Keep it under 170 words.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a stock research copilot."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"LLM summary generation failed: {str(e)}"