def analyze_technical(indicators: list):
    if not indicators:
        return {
            "signal": "Neutral",
            "score": 50,
            "reasons": ["No technical data available"]
        }

    latest = indicators[-1]
    score = 50
    reasons = []

    rsi = latest.get("rsi")
    trend = latest.get("trend_signal")
    macd = latest.get("macd")

    if rsi and rsi < 30:
        score += 15
        reasons.append("RSI indicates oversold condition")
    elif rsi and rsi > 70:
        score -= 15
        reasons.append("RSI indicates overbought condition")

    if trend == "Bullish":
        score += 20
        reasons.append("Price trend is bullish")
    elif trend == "Bearish":
        score -= 20
        reasons.append("Price trend is bearish")

    if macd and macd > 0:
        score += 10
        reasons.append("MACD momentum is positive")
    elif macd and macd < 0:
        score -= 10
        reasons.append("MACD momentum is negative")

    score = max(0, min(100, score))

    signal = "Bullish" if score >= 65 else "Bearish" if score <= 40 else "Neutral"

    return {
        "signal": signal,
        "score": score,
        "reasons": reasons
    }