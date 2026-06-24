def analyze_risk(indicators: list):
    if not indicators:
        return {
            "signal": "Medium Risk",
            "score": 50,
            "reasons": ["No risk data available"]
        }

    latest = indicators[-1]
    score = 50
    reasons = []

    volatility = latest.get("volatility_20")
    volume_ratio = latest.get("volume_ratio")

    if volatility is not None:
        if volatility < 0.02:
            score += 15
            reasons.append("Volatility is low")
        elif volatility > 0.05:
            score -= 15
            reasons.append("Volatility is high")

    if volume_ratio is not None:
        if volume_ratio > 1.2:
            reasons.append("Trading volume is above average")
        elif volume_ratio < 0.8:
            reasons.append("Trading volume is below average")

    score = max(0, min(100, score))

    signal = "Low Risk" if score >= 65 else "High Risk" if score <= 40 else "Medium Risk"

    return {
        "signal": signal,
        "score": score,
        "reasons": reasons
    }