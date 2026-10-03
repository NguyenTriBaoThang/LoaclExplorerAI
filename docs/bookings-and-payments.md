# Booking, capacity and payment boundary

## Implemented reservation flow

1. An authenticated traveler requests seats from an owned, persisted itinerary stop.
2. The API accepts only currently open slots whose source evidence for POI, experience, and slot is verified and unexpired. Demo, stale, unknown-capacity, or unauthenticated provider data cannot be booked.
3. PostgreSQL locks the slot row, expires overdue holds, counts active seats, checks capacity, snapshots the price basis and amount, and creates a 15-minute `pending_provider` hold. The provider's reported availability is not mutated by the application.
4. The authenticated provider sees a reservation request and explicitly accepts/rejects it. Acceptance rechecks the live slot evidence and total held seats. A paid reservation moves to `awaiting_payment`; a free one can become `confirmed` after provider acceptance.
5. The hold expires automatically when read or when another booking/provider action touches the slot. Expiry and state transitions are recorded in `booking_events`; important actions also write `audit_logs`.

These holds are real reservations inside this application's database, subject to authenticated provider confirmation. The application does not synchronize inventory with a venue's external POS, phone bookings, or third-party marketplace; providers must keep their reported capacity current there and in this portal.

Use PostgreSQL in production. `SELECT ... FOR UPDATE` serializes hold creation per slot on PostgreSQL; SQLite is for tests and does not provide equivalent row-lock guarantees.

## API

- `POST /api/bookings` — create a temporary seat hold. Body: `{ "itinerary_id": "…", "itinerary_stop_id": "…", "quantity": 2 }`.
- `GET /api/bookings?itinerary_id=…` — current traveler's reservations and history.
- `POST /api/bookings/{id}/cancel` — release an unpaid hold; a paid booking transitions to `cancellation_requested` and does not claim to have refunded money.
- `GET /api/bookings/{id}/history` — visible only to the traveler, owning provider, or admin.
- `GET /api/payments/status` — reports whether checkout/refunds are configured.
- `POST /api/bookings/{id}/checkout` — deliberately returns `PAYMENT_GATEWAY_NOT_CONFIGURED` until an actual provider adapter, credentials, signed webhook, and refund/cancellation policy are selected and implemented. It never marks a booking paid based on a browser response.
- `GET /api/provider/me/bookings` — authenticated provider's requests.
- `POST /api/provider/me/bookings/{id}/decision` — body action `accept` or `reject` with optional note.
- `POST /api/provider/me/bookings/{id}/cancellation-decision` — provider approves/rejects an unpaid cancellation; paid cancellation cannot be completed until an actual refund adapter returns verified success.

The provider portal receives reservation quantity, activity, timeslot, price and status only. It does not receive the traveler's name, phone, or email in this release.

## Payment/refund is intentionally not live yet

`payment_transactions` is a provider-reference ledger, not a simulator. The checkout route fails closed because the project has not named a payment gateway or supplied its credentials. Consequently this build must not be described as accepting real payments or issuing real refunds. Once a gateway is selected, implement server-created checkout sessions, signed/idempotent webhook verification, reconciliation, refund calls, and end-to-end tests before enabling checkout. Never trust a client-side “success” redirect as proof of payment.

Migration `0007_booking_payments` creates `bookings`, `payment_transactions` and append-only `booking_events`; Compose already runs `alembic upgrade head` at API startup.
