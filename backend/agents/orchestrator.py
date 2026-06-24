from agents.technical_agent import analyze_technical
from agents.sentiment_agent import analyze_sentiment
from agents.fundamental_agent import analyze_fundamentals
from agents.risk_agent import analyze_risk
from agents.market_context_agent import analyze_market_context
from agents.recommendation_agent import generate_recommendation
from agents.llm_agent import generate_llm_summary
from rag.retriever import search_documents


def run_agents(ticker, indicators, fundamentals, news, economic_data, analyst_ratings):
    technical = analyze_technical(indicators)
    sentiment = analyze_sentiment(news, ticker)
    fundamental = analyze_fundamentals(fundamentals)
    risk = analyze_risk(indicators)
    market_context = analyze_market_context(economic_data, analyst_ratings)

    final = generate_recommendation(
        technical=technical,
        sentiment=sentiment,
        fundamentals=fundamental,
        risk=risk,
        market_context=market_context
    )

    rag_results = search_documents(
        query=f"Important news, SEC filings, risks and market context about {ticker}",
        ticker=ticker,
        n_results=5
    )

    llm_summary = generate_llm_summary(
        ticker=ticker,
        technical=technical,
        sentiment=sentiment,
        fundamentals=fundamental,
        risk=risk,
        market_context=market_context,
        rag_context=rag_results,
        final=final
    )

    return {
        "ticker": ticker,
        "technical": technical,
        "sentiment": sentiment,
        "fundamentals": fundamental,
        "risk": risk,
        "market_context": market_context,
        "rag_context": rag_results,
        "final_recommendation": final["recommendation"],
        "ai_score": final["score"],
        "reasons": final["reasons"],
        "llm_summary": llm_summary
    }