def analyze_fundamentals(fundamentals: dict):
    if not fundamentals:
        return {
            "signal": "Neutral",
            "score": 50,
            "reasons": ["No fundamentals data available"]
        }

    score = 50
    reasons = []

    pe_ratio = fundamentals.get("pe_ratio")
    market_cap = fundamentals.get("market_cap")
    revenue_growth = fundamentals.get("revenue_growth")

    if pe_ratio is not None:
        if pe_ratio < 25:
            score += 10
            reasons.append("P/E ratio looks reasonable")
        else:
            score -= 5
            reasons.append("P/E ratio is relatively high")

    if market_cap is not None and market_cap > 10_000_000_000:
        score += 10
        reasons.append("Company has strong market capitalization")

    if revenue_growth is not None:
        if revenue_growth > 0:
            score += 15
            reasons.append("Revenue growth is positive")
        else:
            score -= 10
            reasons.append("Revenue growth is weak or negative")

    score = max(0, min(100, score))

    signal = "Strong" if score >= 65 else "Weak" if score <= 40 else "Neutral"

    return {
        "signal": signal,
        "score": score,
        "reasons": reasons
    }