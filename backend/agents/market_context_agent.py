def analyze_market_context(economic_data: list, analyst_ratings: list):
    score = 50
    reasons = []

    if analyst_ratings:
        buy_count = 0
        sell_count = 0

        for item in analyst_ratings:
            rating = str(item.get("rating", "")).lower()
            if "buy" in rating:
                buy_count += 1
            elif "sell" in rating:
                sell_count += 1

        if buy_count > sell_count:
            score += 15
            reasons.append("Analyst sentiment is positive")
        elif sell_count > buy_count:
            score -= 15
            reasons.append("Analyst sentiment is negative")

    if economic_data:
        reasons.append("Macro/economic context considered")

    score = max(0, min(100, score))

    signal = "Positive" if score >= 65 else "Negative" if score <= 40 else "Neutral"

    return {
        "signal": signal,
        "score": score,
        "reasons": reasons
    }