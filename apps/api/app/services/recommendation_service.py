from app.models.entities import Experience
from app.core.enums import normalize_intent_tag


class RecommendationService:
    """Transparent tag and constraint scoring; no trained AI model is used."""

    def score(self, experience: Experience, weights: dict[str, float], group_size: int, budget_vnd: int) -> tuple[float, list[str]]:
        tags = {normalize_intent_tag(tag) for tag in (experience.intent_tags or [])}
        relevant = {tag: max(0.0, weight) for tag, weight in weights.items() if weight > 0}
        normalized_relevant: dict[str, float] = {}
        for tag, weight in relevant.items():
            normalized = normalize_intent_tag(tag)
            normalized_relevant[normalized] = normalized_relevant.get(normalized, 0.0) + weight
        intent_score = sum(weight for tag, weight in normalized_relevant.items() if tag in tags)
        total_weight = sum(normalized_relevant.values()) or 1.0
        reasons: list[str] = []
        if any(tag in tags for tag in normalized_relevant):
            reasons.append("INTENT_MATCH")
        estimated_cost = experience.price_vnd * group_size if experience.price_basis == "per_person" else experience.price_vnd
        if estimated_cost <= budget_vnd:
            reasons.append("WITHIN_BUDGET")
        return intent_score / total_weight, reasons
