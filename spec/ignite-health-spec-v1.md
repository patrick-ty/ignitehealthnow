# Ignite Health — Product & Delivery Spec (v1)

## Purpose
This document is the canonical source of truth for Ignite Health product behavior,
architecture, and delivery. It is designed to be consumed by humans and coding agents.

## Product Vision
Ignite Health helps individuals with gray or undiagnosed health symptoms systematically
track subjective and objective health signals over time so patterns can be identified
and shared with healthcare providers.

## Core Principles
- Time-anchored data
- One entry per day per journal type
- Structured data first, free text second
- Privacy-first, HIPAA-ready posture
- No diagnostic or prescriptive claims

## Assumptions
- Users are authenticated before accessing journaling features
- Passkeys are the preferred authentication mechanism
- Single product tier at v1
- AI-assisted insights are optional and non-diagnostic

## Epic Map (v1)
1. Daily Health Journaling
2. Intake & Output Tracking
3. Activity & Movement Tracking
4. Photo-Based Health Tracking
5. Lab Results Ingestion & Analysis
6. Insights & Correlations (AI-assisted optional)
7. Community & Shared Experience
8. Privacy, Security & Trust

## Architecture
See:
- `spec/architecture/application-architecture.md`
- `spec/architecture/cloud-infrastructure.md`

## Data Principles
- All journal entries are time-anchored (`occurred_at`, `date_anchor`, timezone-aware)
- One entry per day per journal type (Morning, Evening)
- Drafts are stored in the same tables as submitted entries via status flags
- Draft cleanup runs daily and removes drafts older than 36 hours
- Personally identifiable information (PII) is isolated from health data

## Delivery Principles
- Spec-first development
- Every story includes acceptance criteria and test cases
- No implicit behavior
- No blocking UX for missed days
