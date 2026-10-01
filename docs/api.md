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

## Prompt-backed AI workflows

The versioned prompt catalog lives under `apps/api/app/prompts/`; the active version is `3.0.0`. Prompt outputs are schema-validated before use. Configure `OPENAI_API_KEY` (or a compatible endpoint via `OPENAI_BASE_URL`) to enable model-backed routes. Without it, prompt-backed calls fail closed with HTTP 503. All model-backed routes return or persist the prompt version for provenance. See [AI prompt catalog and database mapping](ai-prompt-catalog.md).

`GET /api/ai/prompts` returns the active manifest/version and the eight prompt IDs.

Admin-only routes require `X-Admin-Key: $ADMIN_API_KEY` outside development/test:

- `POST /api/experiences/{id}/ai-tag` — run EXPERIENCE_TAGGER, persist tags, hands-on, indoor, primary intent, weather sensitivity, and prompt version.
- `POST /api/ai/intent-similarity` — run INTENT_SIMILARITY for two experience IDs and upsert the canonical pair into `intent_similarities`.
- `POST /api/itineraries/{id}/feedback/label` — label a submitted review and persist the feedback/training rubric fields.
- `POST /api/itineraries/{id}/weather-advisory` — assess caller-provided weather/AQI observations against scheduled outdoor stops and write expiring `WEATHER_ALERT` events. Measurements are not independently verified; the route does not infer flooding.

Traveler and provider workflows:

- `POST /api/chat/message` — run CONVERSATION_PARSER and return `structured_constraints`; this does not create an itinerary or assert availability. When complete, the client maps constraints to `POST /api/itineraries/plan` (Vietnamese intent keys are accepted and normalized by the planner).
- `POST /api/itineraries/{id}/replan-advice` with `{ "event_id": "..." }` — solver-filters feasible replacement slots, then runs REPLAN_ADVISOR and XAI_EXPLANATION. Advice is read-only and requires user confirmation.
- `POST /api/itineraries/{id}/replan-advice/accept` — accept one returned proposal. Send `event_id`, `affected_stop_id`, candidate experience/slot IDs, proposal code, and the `base_version` from advice. Stale plans return 409.
- `POST /api/providers/{provider_id}/slot-assistant/preview` — send `X-Provider-Access-Key`, a short message, and exact selected `slot_ids`. Runs PROVIDER_ASSISTANT and returns a five-minute signed confirmation token; it does not mutate availability. `PAUSE_DAY` is accepted only when the selection covers every not-yet-cancelled slot for that provider today.
- `POST /api/providers/{provider_id}/slot-assistant/confirm` — send the preview token and provider key to apply the scoped change. The provider's access key is provisioned out of band in `providers.portal_access_key`. Cancellation changes slots and emits `SLOT_CANCELLED` events for re-planning.

Provider confirmation uses `APP_SIGNING_SECRET`; production must set both `APP_SIGNING_SECRET` and `ADMIN_API_KEY`. Never expose the model key, signing secret, admin key, provider access key, or confirmation tokens in browser logs or public responses.

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

Current error codes also include `LLM_NOT_CONFIGURED`, `LLM_PROVIDER_ERROR`, `INVALID_MODEL_OUTPUT`, `ADMIN_UNAUTHORIZED`, `PROVIDER_UNAUTHORIZED`, `REPLAN_NOT_AVAILABLE`, `STALE_ITINERARY_VERSION`, `SLOT_VERSION_CHANGED`, and `INVALID_CONFIRMATION_TOKEN`.
