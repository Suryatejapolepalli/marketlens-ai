def generate_recommendation(technical, sentiment, fundamentals, risk, market_context):
    technical_score = technical.get("score", 50)
    sentiment_score = sentiment.get("score", 50)
    fundamentals_score = fundamentals.get("score", 50)
    risk_score = risk.get("score", 50)
    market_context_score = market_context.get("score", 50)

    final_score = round(
        technical_score * 0.25 +
        sentiment_score * 0.15 +
        fundamentals_score * 0.30 +
        risk_score * 0.15 +
        market_context_score * 0.15
    )

    if final_score >= 70:
        recommendation = "Buy"
    elif final_score <= 40:
        recommendation = "Sell"
    else:
        recommendation = "Hold"

    reasons = []
    reasons += technical.get("reasons", [])
    reasons += sentiment.get("reasons", [])
    reasons += fundamentals.get("reasons", [])
    reasons += risk.get("reasons", [])
    reasons += market_context.get("reasons", [])

    return {
        "recommendation": recommendation,
        "score": final_score,
        "reasons": reasons[:6]
    }