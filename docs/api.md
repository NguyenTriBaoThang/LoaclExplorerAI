# API MVP

Base URL: `http://localhost:8000`. Swagger UI: `/docs`. Datetime nhận ISO 8601 có timezone offset và tiền VND nhận integer.

## Health

`GET /health` → `{ "status": "ok" }`.

## Catalog

- `GET /api/pois` — danh sách POI.
- `GET /api/pois/{id}` — một POI.
- `GET /api/experiences` — danh sách có query filters: `intent`, `start_at`, `end_at`, `group_size`, `max_price`.
- `GET /api/experiences/{id}` — hoạt động, POI và slot.
- `GET /api/experiences/{id}/slots?start_at=...&end_at=...` — slot theo thời gian.

Catalog trả `verification_status` và `data_mode`. Dữ liệu seed là `simulated`; `available_reported: null` không có nghĩa là hết chỗ.

## Planner

`POST /api/itineraries/plan`

```json
{
  "start_at": "2026-10-01T09:00:00+07:00",
  "end_at": "2026-10-01T16:00:00+07:00",
  "group_size": 4,
  "budget_vnd": 2000000,
  "transport_mode": "driving",
  "intent_weights": {"handicraft": 1.0, "food": 0.8, "culture": 0.5},
  "locked_experience_ids": []
}
```

Response gồm `request_id`, `itinerary_id`, `data_mode`, `data_as_of`, `feasibility_status`, tổng chi phí, stops, route legs và explanation. `feasibility_status` có thể là `feasible` hoặc `tentative`; no-plan trả HTTP 422 với code `NO_FEASIBLE_PLAN`. Route leg luôn ghi `provider: mock`, `is_realtime: false`.

`GET /api/itineraries/{id}` tải lại kế hoạch đã lưu.

## Chat skeleton

`POST /api/chat/message` nhận `{ "message": "..." }` và trả `status: not_configured`. Form Planner không gọi endpoint này.

## Lỗi

```json
{
  "error": {
    "code": "NO_FEASIBLE_PLAN",
    "message": "No itinerary satisfies time, capacity, and budget constraints",
    "details": [],
    "request_id": "..."
  }
}
```

Các code hiện dùng gồm `NO_FEASIBLE_PLAN`, `NOT_FOUND`, `VALIDATION_ERROR` và `HTTP_ERROR`.
