# Design Documentation Index

This directory contains the complete design specification for IgniteHealthNow, derived from the PRD at `docs/prd/ignitehealth-prd.md`. Each document translates PRD requirements into screen-level specs, user flows, and interaction patterns ready for Flutter implementation.

The PRD is always the source of truth for product requirements. These design docs are the source of truth for how those requirements become screens.

---

## Foundation

| Doc | Status | Description |
|-----|--------|-------------|
| [00-index.md](00-index.md) | Exists | This file. Master index for all design documentation. |
| [design-system.md](design-system.md) | Planned | Color palette, typography, spacing, component library, iconography, and interaction patterns for the Flutter app. Derived from PRD tone/principles and prior mockup visual language. |
| [screen-inventory.md](screen-inventory.md) | Planned | Complete list of every screen in the app with screen IDs, navigation relationships, and implementation phase assignment. |
| [mockup-reference.md](mockup-reference.md) | Exists | Bridge document mapping prior mockups (`docs/mockups/`) to the PRD. Identifies what carries forward, what changed, and why. |

---

## User Flows

Each flow doc describes a complete user journey: entry points, screen sequence, decision points, conditional logic, error states, and exit points.

| Doc | Status | PRD Section | Description |
|-----|--------|-------------|-------------|
| [flows/01-onboarding.md](flows/01-onboarding.md) | Planned | Personas, S3.7 | First-run experience: emotional investment, baseline data collection, commitment, transition to first check-in. Persona-adaptive paths. |
| [flows/02-morning-checkin.md](flows/02-morning-checkin.md) | Planned | S4.2, S3A | Morning journal flow: How You Woke Up, Body State, Medication & Supplements, Quick Context. P0/P1/P2 progressive disclosure. |
| [flows/03-evening-checkin.md](flows/03-evening-checkin.md) | Planned | S4.3, S3A | Evening journal flow: Energy & Cognitive Review, Bloating & Body Composition, Physical Symptoms, Mood & Stress, Lifestyle Inputs. |
| [flows/04-photo-food-journal.md](flows/04-photo-food-journal.md) | Planned | S5 | Photo capture flow: FAB trigger, AI recognition tiers, refinement questions, confidence display, meal timeline. |
| [flows/05-lab-entry.md](flows/05-lab-entry.md) | Planned | S6 | Lab result entry: guided wizard, dual-range display (functional optimal vs. conventional), auto-calculated ratios. |
| [flows/06-cycle-tracking.md](flows/06-cycle-tracking.md) | Planned | S7 | Menstrual cycle and estrogen dominance tracking: daily cycle input, phase detection, symptom overlay, TBG pathway display. |
| [flows/07-doctor-visit-report.md](flows/07-doctor-visit-report.md) | Planned | S9 | Report generation flow: date range selection, section selection, preview, export/share. |
| [flows/08-chat-agent.md](flows/08-chat-agent.md) | Planned | S10 | Chat agent interaction: educational Q&A, data interpretation, doctor visit prep, never-diagnostic guardrails. |
| [flows/09-insights-and-alerts.md](flows/09-insights-and-alerts.md) | Planned | S8 | How pattern detection results surface: Four Legs alerts, vicious cycle notifications, correlation insights, weekly summaries. |
| [flows/10-provider-portal.md](flows/10-provider-portal.md) | Planned | S11 | Provider-facing flows: patient invite, shared data view, clinical report review. Web-only (Next.js). |

---

## Screen Specs

Each screen spec defines a single screen or tight screen group: layout, components, data bindings, states, transitions, accessibility requirements, and implementation notes.

| Doc | Status | Phase | Description |
|-----|--------|-------|-------------|
| [screens/ONB-onboarding.md](screens/ONB-onboarding.md) | Planned | 1 | Onboarding screens (ONB-01 through ONB-11): welcome, symptom selection, duration, healthcare satisfaction, goals, confidence, mirror, how we help, time commitment, commitment, first action. |
| [screens/MCK-morning-checkin.md](screens/MCK-morning-checkin.md) | Planned | 1 | Morning check-in screens: section cards, slider inputs, symptom selectors, medication card, notes, completion/insight. |
| [screens/ECK-evening-checkin.md](screens/ECK-evening-checkin.md) | Planned | 1 | Evening check-in screens: energy review, bloating/body section, symptom chips, mood/stress, lifestyle inputs, completion. |
| [screens/PFJ-photo-food-journal.md](screens/PFJ-photo-food-journal.md) | Planned | 1 | Photo journal screens: capture, AI recognition result, refinement, meal timeline, daily summary. |
| [screens/LAB-lab-tracking.md](screens/LAB-lab-tracking.md) | Planned | 1 | Lab screens: entry wizard, dual-range result display, ratio calculations, lab timeline. |
| [screens/CYC-cycle-tracking.md](screens/CYC-cycle-tracking.md) | Planned | 2 | Cycle tracking screens: calendar, daily input, phase indicator, symptom overlay, estrogen dominance dashboard. |
| [screens/DSH-dashboards.md](screens/DSH-dashboards.md) | Planned | 1-2 | Dashboard screens: home/today view, symptom trends, lab timeline, correlation insights, Four Legs status. |
| [screens/RPT-reports.md](screens/RPT-reports.md) | Planned | 3 | Doctor visit report screens: generation wizard, preview, PDF layout, share flow. |
| [screens/CHT-chat-agent.md](screens/CHT-chat-agent.md) | Planned | 3 | Chat agent screens: conversation UI, suggested questions, data cards inline, disclaimer display. |
| [screens/SET-settings.md](screens/SET-settings.md) | Planned | 1 | Settings screens: profile, medication/supplement list management, notification preferences, data export, privacy controls. |
| [screens/MED-medications.md](screens/MED-medications.md) | Planned | 1 | Medication management screens: medication list, add/edit medication, dosage history, absorption tracking. |
| [screens/PRV-provider-portal.md](screens/PRV-provider-portal.md) | Planned | 4 | Provider portal screens (web): patient list, shared data view, clinical report, interactive charts. |
| [screens/VPH-visual-health-photos.md](screens/VPH-visual-health-photos.md) | Planned | 1 | Visual health photo screens: guided capture (face, body, eyebrow), photo timeline, side-by-side comparison. |

---

## Quick Reference: Screen ID Prefixes

Every screen in the app uses a three-letter prefix for consistent identification across design docs, code, and analytics.

| Prefix | Domain |
|--------|--------|
| ONB | Onboarding |
| MCK | Morning Check-in |
| ECK | Evening Check-in |
| PFJ | Photo Food Journal |
| LAB | Lab Tracking |
| CYC | Cycle Tracking |
| DSH | Dashboards |
| RPT | Doctor Visit Reports |
| CHT | Chat Agent |
| SET | Settings & Profile |
| MED | Medication Management |
| PRV | Provider Portal |
| VPH | Visual Health Photos |

---

## Quick Reference: Implementation Phases

Design docs are tagged with the phase in which their screens first ship. See PRD Section 18 for full phase descriptions.

| Phase | Timeline | What Ships | Key Design Docs |
|-------|----------|-----------|----------------|
| **Phase 1: Foundation** | Months 1-3 | Morning/evening check-in, visual health photos, lab entry, basic dashboard, medication tracking, onboarding, photo food journal capture | ONB, MCK, ECK, PFJ, LAB, DSH (basic), SET, MED, VPH |
| **Phase 2: Intelligence** | Months 4-6 | Four Legs detection, vicious cycle alerts, cycle tracking, estrogen dominance, correlation insights, pattern notifications | CYC, DSH (full), flows/09-insights |
| **Phase 3: Reports & Communication** | Months 7-9 | Doctor visit reports, chat agent, enhanced dashboards, photo journal AI tiers 1+2 | RPT, CHT, PFJ (enhanced) |
| **Phase 4: Provider & Research** | Months 10-12 | Provider portal, patient-controlled sharing, research analytics | PRV |
| **Phase 5: Visual Intelligence** | Months 13+ | AI visual analysis, automated photo comparison, wearable integration | VPH (AI-enhanced) |
