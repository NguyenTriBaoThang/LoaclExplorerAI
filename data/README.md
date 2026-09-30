# Demo data

The API seed script creates fictional TP. Hồ Chí Minh demonstration POIs, one synthetic provider, 10 experiences and 30 days of example slots. Every seeded POI and experience is marked `simulated`; prices, capacity and schedules are not real offers, availability, or booking confirmations. Re-run seeding is safe: existing data is left intact.

Run from `apps/api` with `python -m scripts.seed_db` after applying the Alembic migration.
