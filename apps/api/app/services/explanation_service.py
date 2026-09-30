class ExplanationService:
    friendly_reasons = {
        "INTENT_MATCH": "Phù hợp với mục đích chuyến đi bạn đã chọn.",
        "WITHIN_BUDGET": "Chi phí ước tính nằm trong ngân sách.",
        "SLOT_AVAILABLE": "Có khung giờ demo phù hợp với lịch trình.",
        "CAPACITY_UNKNOWN": "Sức chứa chưa được xác nhận; cần liên hệ nhà cung cấp.",
        "MOCK_ROUTING": "Thời gian di chuyển là ước tính mô phỏng, không phải dữ liệu giao thông thực.",
        "SIMULATED_DATA": "Địa điểm, giá và khung giờ trong bản demo là dữ liệu mô phỏng.",
        "LOCKED_ACTIVITY": "Hoạt động bạn khóa đã được giữ lại.",
    }

    def explain(self, reason_codes: list[str], preserved: list[str], lost: list[str]) -> dict:
        return {
            "preserved_intents": preserved,
            "lost_intents": lost,
            "reason_codes": reason_codes,
            "evidence_refs": [],
            "uncertainty": [self.friendly_reasons[code] for code in reason_codes if code in {"CAPACITY_UNKNOWN", "MOCK_ROUTING", "SIMULATED_DATA"}],
        }
