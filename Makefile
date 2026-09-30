.PHONY: up down logs migrate seed test web-install web-build

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f api web

migrate:
	cd apps/api && alembic upgrade head

seed:
	cd apps/api && python -m scripts.seed_db

test:
	cd apps/api && pytest

web-install:
	cd apps/web && npm install

web-build:
	cd apps/web && npm run build
