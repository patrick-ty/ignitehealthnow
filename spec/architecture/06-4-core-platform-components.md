# 4. Core Platform Components

Clients:
- Flutter (iOS/Android)
- Next.js Web Portal

Backend:
- FastAPI on Cloud Run
- Pub/Sub-driven async workers

Data:
- Supabase Auth for identity (passkeys preferred)
- Supabase Postgres for journaling data
- Google Cloud Storage for PHI assets (photos, labs)

