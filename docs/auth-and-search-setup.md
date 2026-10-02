# Authentication, roles, and local E5 setup

## Accounts and permissions

The API stores password hashes, issues an HTTP-only session cookie, and assigns one of three roles: `traveler`, `provider`, or `admin`. Public registration always creates a traveler. An admin can create provider profiles/accounts, change roles, deactivate accounts, review POIs/experiences/evidence, inspect likely duplicate POIs, merge a confirmed duplicate, and review audit history.

In development, `scripts.seed_db` creates the configured demo admin and traveler only when their password variables are set and the account does not already exist. The local `.env` is ignored by Git; keep account passwords and all signing keys there, not in source control. Production requires a random `AUTH_SECRET` of at least 32 characters. Google sign-in also requires an OAuth client ID and secret from the application's Google Cloud project, with the callback URL registered exactly as `GOOGLE_REDIRECT_URI`.

## Google sign-in

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env`. The current local callback is `http://localhost:8000/api/auth/google/callback`; use the matching deployed HTTPS callback in production. The web app redirects to `/api/auth/google/start`; the API uses authorization-code flow with PKCE and only accepts Google profiles with a verified email.

## E5 semantic search

E5 inference is local-only. It does not download a model or send catalog/query text to an external inference endpoint. Place a compatible multilingual E5 model in `models/e5`, set `INSTALL_E5=true` before building the API image, and rebuild the API. Keep the model weights out of Git (the directory is ignored). `E5_MODEL_PATH` defaults to `/models/e5` in Docker and should point to the model directory when running the API directly. Until both the optional Python dependencies and local model files exist, the semantic endpoint returns an explicit `503`; keyword search remains available.

The traveler UI's distance radius is currently centered on the downtown HCMC reference point. Planner origin/destination choices are selected from catalog POIs; arbitrary address geocoding is not part of this implementation.
