from app.models.entities import Experience


class RecommendationService:
    """Transparent tag and constraint scoring; no trained AI model is used."""

    def score(self, experience: Experience, weights: dict[str, float], group_size: int, budget_vnd: int) -> tuple[float, list[str]]:
        tags = set(experience.intent_tags or [])
        relevant = {tag: max(0.0, weight) for tag, weight in weights.items() if weight > 0}
        intent_score = sum(weight for tag, weight in relevant.items() if tag in tags)
        total_weight = sum(relevant.values()) or 1.0
        reasons: list[str] = []
        if any(tag in tags for tag in relevant):
            reasons.append("INTENT_MATCH")
        estimated_cost = experience.price_vnd * group_size if experience.price_basis == "per_person" else experience.price_vnd
        if estimated_cost <= budget_vnd:
            reasons.append("WITHIN_BUDGET")
        return intent_score / total_weight, reasons
