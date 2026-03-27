# Application Architecture

## Overview
Ignite Health is a cross-platform product with thin clients and centralized business logic.

## Clients
- Mobile: Flutter (iOS + Android)
- Web portal: Next.js

Clients should be thin:
- UI rendering + basic client validation
- No business logic beyond presentation
- All core rules enforced server-side

## Backend
- Unified REST API: Python / FastAPI
- Background workers: Python workers on Cloud Run
- Async jobs + fan-out: Pub/Sub

## Auth & Identity
- Supabase Auth (passkeys preferred)
- User identity (PII) separated from health data
- Service role used server-side for privileged operations

## Data
- Supabase Postgres as system of record
- RLS-enabled on all user data tables
- Derived/aggregated metrics computed asynchronously

## Files / PHI
- Google Cloud Storage for:
  - photos
  - lab report PDFs
  - generated exports/artifacts (future)
- Access via signed URLs or controlled proxy endpoints
- Metadata stored in Postgres (assets table)

## Observability (baseline)
- Cloud Run logs
- Structured logging (request_id, user_id, entry_id)
- Error reporting and basic metrics
