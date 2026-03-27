# ignitehealthnow-app-v2

Ignite Health Now is a health and wellness journaling platform consisting of:
- Cross-platform mobile app
- Unified API backend
- Web portal

## Project structure (important)
This repository follows a **spec-first development model**.

### 📐 Product & Engineering Specs (source of truth)
All product requirements, user flows, and acceptance criteria live in:


spec/

See `spec/README.md` to get started.

## UI Identity Contract

All user-visible identity (display name, avatar) is sourced exclusively
from the Profile database via the API.

Email, auth metadata, and JWT claims must never be used for UI rendering.

Validation:
- cd api && poetry run pytest -q
- cd web && npm run lint
