# IgniteHealthNow — Journal System Design Spec

**Date:** 2026-03-23 (revised 2026-03-27)
**Status:** Review
**Scope:** Complete journal system architecture — 11 journal types, check-in orchestrators, data model, API, Flutter app
**Priority tier:** P0 + P1 fields first (P2 deferred, architecture supports easy addition)
**Platform:** Flutter mobile (iOS + Android)
**Backend:** FastAPI + Supabase Postgres
**Source docs:** `docs/prd/ignitehealth-prd.md`, `docs/design/flows/`, `docs/design/screens/`, `docs/design/01-design-system.md`

---

## 1. Architecture Overview

### 1.1 Core Concept: Check-ins Are Orchestrators

Morning and evening check-ins are **not monolithic forms**. They are lightweight orchestrators that compose cards from independent journal types into a single wizard flow. Each journal type is its own data entity with its own schema, API endpoints, field config, and standalone edit view.

The user sees one seamless check-in flow. Under the hood, each card saves to its respective journal's table independently. The user can also access any journal directly from the Journal tab without going through a check-in.

### 1.2 Journal Types (11 total)

| # | Journal Type | Capture Pattern | Embedded In | Own Standalone View |
|---|---|---|---|---|
| 1 | **Sleep Journal** | Daily (bedtime + morning) | Morning Check-in | Yes |
| 2 | **Morning Subjective State** | Daily (morning) | Morning Check-in | No (only via check-in) |
| 3 | **Medication Confirmation** | Daily (morning) | Morning Check-in | Yes (via Medication Management) |
| 4 | **Activity Journal** | After activity / evening | Evening Check-in | Yes |
| 5 | **Evening Subjective State** | Daily (evening) | Evening Check-in | No (only via check-in) |
| 6 | **Food Journal** | Multiple per day, ad-hoc | — | Yes |
| 7 | **Bowel Movement Journal** | As it happens, multiple per day | — | Yes |
| 8 | **Health Selfies** | Daily (morning) | Morning Check-in (prompt only) | Yes |
| 9 | **Quick Symptom** | Anytime | — | Yes |
| 10 | **Lab Results** | Event-driven | — | Yes |
| 11 | **Medication Change** | Event-driven | — | Yes |

Diagnosis management is a settings/profile feature, not a journal type.

### 1.3 Check-in Orchestrator Composition

**Morning Check-in orchestrates:**
1. Sleep Journal (embedded card)
2. Morning Subjective State (energy, fog, mood, pain, cold intolerance)
3. Medication Confirmation (embedded card)
4. Health Selfie prompt (links to standalone capture)
5. Context notes
6. Summary + Save

**Evening Check-in orchestrates:**
1. Energy & Cognitive Review (evening subjective state)
2. Bloating & Body Composition (evening subjective state)
3. Physical Symptoms (evening subjective state)
4. Mood & Stress (evening subjective state)
5. Activity Journal (embedded card)
6. Sleep Preparation (P1)
7. PMS Quick-Log (conditional, cycle tracking)
8. Summary + Save

---

## 2. Design Decisions

### 2.1 Card-by-Card Wizard

Each check-in is a single scrollable view with cards stacked vertically. Only the **current card** is expanded. The progress stepper is sticky at the top. "Next" collapses the current card to a compact summary and expands the next. Tapping a completed step in the stepper re-expands that card for editing.

Each card = one section = one API save. Natural save boundaries for partial completion.

### 2.2 Light Theme

Light color scheme, no dark theme for MVP.

**Primary palette:**
- Background: warm white (#f8f7f4)
- Cards: white (#ffffff) with subtle shadow
- Primary action: forest green (#3a7d5c)
- Caution/warning: amber (#d4a017)
- Negative/severe: warm red (#c75b39)
- Text primary: near-black (#2c2c2e)
- Text secondary: gray (#8e8e93)
- Cycle badge: soft purple (#7c5cbf on #f0ebff)
- Agent/companion: purple (#7c5cbf on #f5f0ff)

### 2.3 Slider: "Not Set" → 1-10 Scale

All rating sliders use a **"Not Set" → 1-10** scale:

- **Leftmost position = "Not Set"** — gray thumb, no fill bar, value display shows "Not Set". Saves as `null` in the database.
- **Positions 1-10** = actual ratings. Colored thumb, fill bar extends. Color gradient: red (1-3) → amber (4-5) → green (6-10). Saves as integer.
- **Ghost marker** — hollow circle on the track showing yesterday's value. Visual reference only, does not influence thumb position.
- **Scale labels:** `— 1 2 3 4 5 6 7 8 9 10` with range labels (e.g., "Terrible" / "Great") below.

**Rationale:** Users are less inclined to change pre-filled values. `null` (not set) is clearly distinguishable from any actual rating. The "Same as Yesterday" feature is the explicit opt-in for carrying forward values.

**Exception:** Medication data (name, dose) is pre-filled from the user's configured medication list. The "taken/not yet/skipped" status is NOT pre-filled.

**BREAKING CHANGE from source docs:** Source design docs reference 0-10 ranges and "smart defaults" that pre-fill sliders at baseline averages. This spec redefines sliders as null + 1-10. The value 0 does not exist in the system. "Not Set" (null) replaces what was previously 0. Source docs should be updated to reflect this.

**Resetting to "Not Set":** User can drag the slider all the way left past 1 to return to the "Not Set" position. The thumb snaps to the gray "Not Set" state and the value clears to null.

### 2.4 Declarative Field Configuration

Field definitions, visibility conditions, validation rules, and priority tiers are expressed as a declarative config layer — not hardcoded into widget trees.

1. **P2 additions are config changes** — not new widgets
2. **API validates against the same config** — server-side validation uses same definitions
3. **Web client reuse** — same field definitions drive React forms later

The config describes each field's: key, type (slider/quick-tap/chips/text/numeric), journal type, priority tier (P0/P1/P2), visibility conditions, validation rules, and display properties.

### 2.5 Navigation

**Bottom nav (4 tabs + FAB):**
- **Home** — data dashboard + one smart CTA
- **Journal** — all journal types + timeline
- **[FAB center]** — quick capture (food photo, BM, selfie, symptom)
- **Analytics** — trends, charts, intelligence layer
- **Labs** — lab entry + history + dual-range display

**Settings** — accessed via avatar menu in top-right header (profile, medications, diagnoses, cycle settings, notifications, journal depth, display, privacy, export, about).

### 2.6 Home Screen: Data Dashboard First

Home is a **data dashboard**, not a to-do list. The user opens the app and sees how they're doing.

**Hierarchy:**
1. Greeting + compact completion bar
2. Smart CTA — one card, the most relevant next action (morning check-in at 7am, evening check-in at 8pm, nothing if all done)
3. Data dashboard — the bulk of the screen: energy/fog trend line, sleep/body/bloating averages, digestive health (Bristol avg, BM frequency, bloating correlation), medication adherence, top symptom frequency bars, intelligence insights
4. Agent nudge (if applicable)

The full list of journal capture types lives on the **Journal tab**. Home is for data + one smart action.

---

## 3. Morning Check-in Flow

**Screen IDs:** JRM-001 through JRM-013
**Friction targets:** P0 only = ~45 sec | P0+P1 = ~90 sec
**Entry points:** Dashboard smart CTA, morning push notification, Journal tab

### 3.1 Card Sequence (P0+P1)

| Step | Card | Journal Type | Section Key | Fields |
|------|------|---|---|---|
| 1 | Greeting | — | — | Personalized greeting, cycle badge, same-as-yesterday option, "Start Check-in". No data entry |
| 2 | Sleep | Sleep Journal | `sleep` | Sleep quality (1-10), waking refreshed (1-10), hours slept, night wakings (0-4+). Conditional: quality < 5 → disruption chips |
| 3 | Body State | Morning Subjective | `morning_state` | Energy (1-10), brain fog (1-10), predominant mood (single-select), pain/stiffness (4-level), cold intolerance (4-level). Conditionals: fog > 6 → word retrieval, pain != None → body map, active period → period quick-log |
| 4 | Meds | Medication Confirmation | `medication` | Thyroid med: taken/not yet/skipped. If taken: timing + taken-with chips. Conditional: absorption warning |
| 5 | Context | Morning Subjective | `context` | Free text notes (200 char). Hidden Week 1 |
| 6 | Photos | Health Selfies (prompt) | — | Up to 5 selfie slots. Links to standalone capture. Baseline indicator first 7 days |
| 7 | Summary | — | — | Read-only review. Edit links. Duration. Streak. Save |

### 3.2 Conditional Sections (P0+P1)

| Trigger | Threshold | Content |
|---------|-----------|---------|
| Sleep quality | < 5 | Sleep disruption multi-select: Pain, Temperature, Racing thoughts, Bathroom, Night sweats, Unknown |
| Brain fog | > 6 | Word retrieval Yes/No + optional description (200 char). Week 2+ |
| Pain/stiffness | != None | Pain body map: 11 tappable regions (Head/Neck, Shoulders, Upper back, Lower back, Arms/Hands/Wrists, Chest, Abdomen, Hips, Knees, Legs, Feet/Ankles) + "Full body" shortcut (selects all; tapping a specific region while Full body is active deselects Full body and keeps only that region). Week 2+ |
| Active period | Cycle on + in period | Flow heaviness, clots, cramps (3 quick-taps). "Period ended" after Day 3 |
| Thyroid med taken | = Yes | Timing + taken-with chips expand |
| Taken-with | Includes calcium/iron/coffee/food | Absorption warning AlertBanner |

### 3.3 Same-as-Yesterday (JRM-012)

Available after 14+ days. Shows yesterday's values. Each row tappable to edit. "Confirm — same today" copies all. This is the only path where ratings are pre-filled (explicit opt-in).

Edge cases: partial yesterday → only completed fields shown. Medication changed → must re-confirm. Period ended → period fields removed.

---

## 4. Evening Check-in Flow

**Screen IDs:** JRE-001 through JRE-019
**Friction targets:** P0 only = ~60 sec | P0+P1 = ~2 min
**Entry points:** Dashboard smart CTA, evening push notification, Journal tab

### 4.1 Card Sequence (P0+P1)

| Step | Card | Journal Type | Section Key | Fields |
|------|------|---|---|---|
| 1 | Greeting | — | — | Greeting, morning reference, same-as-yesterday option |
| 2 | Energy & Cognitive | Evening Subjective | `evening_energy` | Energy pattern (6 options), overall energy (1-10) with morning delta, brain fog trajectory, concentration (1-10) |
| 3 | Bloating & Body | Evening Subjective | `evening_bloating` | Bloating (1-10), timing, body feeling, clothes fit, water retention. Conditionals: bloating > 5 → food triggers + stress. Body heavier/swollen → distress impact |
| 4 | Physical Symptoms | Evening Subjective | `evening_symptoms` | Multi-select chips (17 options, reorder by frequency). Per-chip severity sliders (P1). Conditionals: palpitations → HR, hair shedding → severity, yeast → detail, SIBO → detail |
| 5 | Mood & Stress | Evening Subjective | `evening_mood` | Mood (1-10 + emotion label), anxiety (1-10), stress (1-10). Conditional: anxiety > 7 → physical symptoms |
| 6 | Activity | Activity Journal | `activity` | Activity type, duration, intensity, how it felt, post-exercise symptoms |
| 7 | Sleep Prep | Evening Subjective | `evening_sleep_prep` | Sleep readiness (1-10). P1 field. Hidden for P0-only users |
| 8 | PMS Quick-Log | Evening Subjective | `pms` | PMS chips (16 options) + severity (1-10). Only during PMS window. Data persisted in `journal_subjective` with `checkin_type='evening'`, `section_key='pms'`. Full cycle tracking tables are a separate spec |
| 9 | Summary | — | — | All sections reviewed, morning-to-evening deltas, anomaly flags, save. Same-as-yesterday via JRE-018 |

**Deferred from P0+P1:** Lifestyle Inputs (JRE-015) — all fields P2/P3.

**Note on Activity card:** Source docs include exercise as a P2 field inside Lifestyle Inputs (JRE-015). This spec intentionally elevates Activity to its own P0+P1 card and independent journal type because post-exercise symptoms (crash, pain flare, exercise intolerance) are critical hypothyroid markers that feed the intelligence layer. This is an intentional departure from source docs.

---

## 5. Standalone Journal Specs

### 5.1 Sleep Journal

**Capture pattern:** Bedtime entry (evening, optional) + wake-up entry (morning, via check-in or standalone)

**Fields:**
- Sleep quality (1-10 slider, "Not Set" default)
- Waking refreshed (1-10 slider)
- Hours slept (numeric stepper, 0.5 increments)
- Night wakings (0-4+ quick-tap; "4+" saves as integer 4, meaning "4 or more")
- Basal body temperature (P2, numeric, Month 2+)
- Conditional: quality < 5 → disruption reasons chips

**Standalone access:** Journal tab → Sleep. Shows today's entry (editable) + sleep history/trends.

**Embedded in:** Morning Check-in, Step 2.

### 5.2 Activity Journal

**Capture pattern:** After activity, or in evening check-in. Multiple entries per day.

**Fields:**
- Activity type: Walk, Run, Dance, Yoga, Weight lifting, Swimming, Cycling, Stretching, Other (single-select with custom option)
- Duration: minutes (numeric, 5-minute increments)
- Intensity: Light / Moderate / Vigorous (quick-tap)
- How it felt: Energizing / Normal / Exhausting / Made symptoms worse (quick-tap)
- Post-exercise symptoms: multi-select chips — Crash, Pain flare, Dizziness, Palpitations, Brain fog increase, Nausea, None
- Notes (optional, 200 char)

**Standalone access:** Journal tab → Activity. Shows today's entries + activity history.

**Embedded in:** Evening Check-in, Step 6.

### 5.3 Bowel Movement Journal

**Capture pattern:** As it happens, multiple entries per day. Quick-capture via FAB.

**Bristol Stool Scale:**
- Horizontal thumbnail strip (7 types), tap to select
- Dynamic detail card below: type name, clinical description with thyroid connection, health tag
- Type 1 highlighted by default as a visual starting point (shows users how the interaction works), but the entry is NOT saved until the user explicitly taps a type. If the user saves without changing the selection, Type 1 is recorded as their intentional choice. This differs from rating sliders because the Bristol scale is a visual identification task (the user is matching what they see), not a subjective rating where anchoring bias applies.
- Instruction: "Which of these looks closest to yours?"

**Stool Color Scale:**
- Same pattern: horizontal strip of square color swatches, light → dark
- 8 colors: Pale/Clay, Yellow, Light/Tan, Medium Brown, Dark Brown, Green, Red, Black/Tarry
- Medium Brown selected by default
- Dynamic detail card with clinical meaning
- Warning tags for concerning colors (black, red, pale)

**Additional fields:**
- Time (defaults to now)
- Urgency: Normal / Urgent / Emergency
- Effort: Easy / Moderate strain / Difficult
- Completeness: Complete / Incomplete
- Odor level: Normal / Stronger than usual / Very foul
- Blood in stool: None / On paper only / On surface / Mixed in
  - If blood present → expands: Color (Bright red / Dark red / Black tarry) + Amount (Trace / Small / Significant) + medical alert
- Other characteristics: multi-select chips (Mucus, Floating, Greasy/oily, Undigested food)
- Photo capture (optional, private, encrypted)
- Notes (optional, 200 char)

**Timeline view:** Per-entry cards with Bristol type, color, characteristics. Weekly Bristol distribution chart. Pattern insights (AM vs PM, constipation frequency).

### 5.4 Food Journal

**Capture pattern:** Multiple per day, ad-hoc. Quick-capture via FAB.

**Fields:**
- Photo capture (camera)
- Meal type: Breakfast / Lunch / Dinner / Snack (quick-tap)
- Thyroid tags: multi-select chips (High protein, Selenium-rich, Cruciferous, Gluten, Dairy, Processed, Sugar/sweets, Alcohol, Gluten-free, Organic)
- AI recognition result (Phase 3, future)
- Notes (optional)
- Medication timing warning (if near med time)

### 5.5 Health Selfies

**Capture pattern:** Daily (morning), up to 5 photos + custom.

**Photo types (tags):**

| Slot | Tag | Purpose |
|------|-----|---------|
| 1 | FACE_FRONT | Facial puffiness, skin condition |
| 2 | TONGUE | Tongue coating, thyroid/gut indicator |
| 3 | SIDE_PROFILE | Jaw/neck swelling |
| 4 | HAIR_SCALP | Hair thinning, shedding patterns |
| 5 | HANDS_NAILS | Nail brittleness, hand swelling |
| + | CUSTOM | User-defined with label |

Camera opens with silhouette guide per tag. Baseline indicator first 7 days.

**Future:** Timeline comparison, AI visual analysis, change alerts.

### 5.6 Quick Symptom

**Capture pattern:** Anytime, from any screen via FAB.

**Fields:**
- Symptom: single-select from chip grid (same set as evening check-in, reordered by frequency)
- Severity: 1-10 slider
- Time (defaults to now)
- Notes (optional)

### 5.7 Lab Results

Event-driven. Multi-panel entry wizard: date/source → thyroid panel → metabolic panel → hormonal panel → liver/lipid panel → autoimmune markers → review with dual-range display → auto-calculated ratios. Detailed spec in source docs.

### 5.8 Medication Change

Event-driven. Log dose change, new medication, or discontinuation. Triggers 6-week monitoring window. Detailed spec in source docs.

---

## 6. Completion Agent

### 6.1 Concept

AI agent that gently reminds users about missing journal data. Not a nag — contextual, warm, aware of what's captured across all journal types.

### 6.2 Data Contract (API → Agent)

```json
{
  "user_id": "abc123",
  "date": "2026-03-27",
  "display_name": "Sarah",
  "engagement_week": 3,
  "streak": 12,
  "morning_checkin": {
    "status": "partial",
    "completed": ["sleep", "morning_state", "medication"],
    "missing": ["photos", "morning_context"],
    "skipped": []
  },
  "evening_checkin": {
    "status": "not_started",
    "completed": [],
    "missing": ["evening_energy", "evening_bloating", "evening_symptoms", "evening_mood", "activity", "evening_sleep_prep"],
    "skipped": []
  },
  "standalone_journals": {
    "food": { "count": 2, "entries": ["breakfast 8:30am", "lunch 12:45pm"] },
    "bowel_movement": { "count": 1, "entries": ["Type 3 at 7:45am"] },
    "selfies": { "captured": ["FACE_FRONT", "TONGUE"], "missing": ["SIDE_PROFILE", "HAIR_SCALP", "HANDS_NAILS"] },
    "quick_symptom": { "count": 1, "entries": ["headache 11:30am"] },
    "activity": { "count": 0, "note": "counts ad-hoc entries only; check-in-embedded activity reflected in evening_checkin" }
  },
  "completion_pct": 45,
  "recent_patterns": {
    "avg_completion": 0.78,
    "commonly_skipped": ["selfies", "morning_context"],
    "days_since_full_day": 2
  }
}
```

### 6.3 Agent Behavior Rules

1. **Frequency cap:** Max 3 nudges/day. Never more than 1/hour.
2. **Smart prioritization:** Nudge for analytically valuable missing data first (energy, mood, bloating > context notes).
3. **Tone:** Warm, brief, never guilt-inducing. Frame in terms of what the user gains.
4. **Respect skips:** Explicitly skipped sections → don't nudge again that day.
5. **Engagement-aware:** Week 1 → fewer nudges. Month 2+ → targeted nudges only when patterns break.

---

## 7. API Design

### 7.1 Per-Journal Endpoints

Each journal type gets its own resource:

```
# Sleep Journal
POST   /journals/sleep                     → Create sleep entry
GET    /journals/sleep?date={date}         → Get sleep entry for date
PUT    /journals/sleep/{id}                → Update sleep entry
DELETE /journals/sleep/{id}                → Delete

# Activity Journal
POST   /journals/activity                  → Create activity entry
GET    /journals/activity?date={date}      → Get activity entries for date
PUT    /journals/activity/{id}             → Update
DELETE /journals/activity/{id}             → Delete

# Bowel Movement Journal
POST   /journals/bowel-movement            → Create BM entry
GET    /journals/bowel-movement?date={date} → Get BM entries for date
PUT    /journals/bowel-movement/{id}       → Update
DELETE /journals/bowel-movement/{id}       → Delete

# Food Journal
POST   /journals/food                      → Create food entry (multipart for photo)
GET    /journals/food?date={date}          → Get food entries for date
PUT    /journals/food/{id}                 → Update
DELETE /journals/food/{id}                 → Delete

# Health Selfies
POST   /journals/selfies                   → Upload selfie (multipart, includes tag)
GET    /journals/selfies?date={date}       → Get selfies for date
DELETE /journals/selfies/{id}              → Delete

# Quick Symptom (immutable — create or delete, no updates)
POST   /journals/symptoms                  → Create symptom entry
GET    /journals/symptoms?date={date}      → Get symptoms for date
DELETE /journals/symptoms/{id}             → Delete

# Subjective State (morning/evening check-in sections)
PUT    /journals/subjective/{type}/sections/{key}  → Save one section (type = morning|evening)
GET    /journals/subjective/{type}?date={date}     → Get all sections for a check-in

# Medication Confirmation (daily)
PUT    /journals/medication-confirmation?date={date} → Save med confirmation
GET    /journals/medication-confirmation?date={date} → Get

# Check-in orchestrator
POST   /checkins/{type}                    → Start check-in (morning|evening), returns checkin_id
GET    /checkins/{type}?date={date}        → Get check-in status + all composed journal data
PUT    /checkins/{type}/{id}/complete       → Mark check-in complete

# Completion status (for agent)
GET    /completion?date={date}             → Daily completion payload across all journals

# Field config
GET    /field-config?journal={type}        → Field definitions for a journal type
GET    /field-config/checkin/{type}        → Composed field config for a check-in orchestrator
```

### 7.2 Validation

- **Client-side:** Declarative field config drives visibility, requirements, validation. Instant feedback.
- **Server-side:** Same field config validates submissions. Rejects conditional fields when trigger wasn't met. Returns 422 with field errors.
- **Cross-journal:** Medication confirmation validates against user's configured medication list. Sleep disruptions only accepted when quality < 5.

---

## 8. Database Schema

### 8.1 Per-Journal Tables

```sql
-- Sleep Journal
CREATE TABLE public.journal_sleep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  waking_refreshed INT CHECK (waking_refreshed BETWEEN 1 AND 10),
  hours_slept DECIMAL(3,1) CHECK (hours_slept BETWEEN 0.0 AND 24.0),
  night_wakings INT CHECK (night_wakings BETWEEN 0 AND 4),
  disruption_reasons TEXT[],
  basal_temp DECIMAL(4,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_anchor)
);

-- Activity Journal (multiple per day)
CREATE TABLE public.journal_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INT,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'vigorous')),
  how_felt TEXT CHECK (how_felt IN ('energizing', 'normal', 'exhausting', 'made_symptoms_worse')),
  post_exercise_symptoms TEXT[],
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bowel Movement Journal (multiple per day)
CREATE TABLE public.journal_bowel_movement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bristol_type INT CHECK (bristol_type BETWEEN 1 AND 7),
  stool_color TEXT,
  urgency TEXT CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  effort TEXT CHECK (effort IN ('easy', 'moderate_strain', 'difficult')),
  completeness TEXT CHECK (completeness IN ('complete', 'incomplete')),
  odor TEXT CHECK (odor IN ('normal', 'stronger', 'very_foul')),
  blood_presence TEXT CHECK (blood_presence IN ('none', 'paper_only', 'on_surface', 'mixed_in')),
  blood_color TEXT,
  blood_amount TEXT,
  other_characteristics TEXT[],
  photo_storage_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food Journal (multiple per day)
CREATE TABLE public.journal_food (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  photo_storage_url TEXT,
  thyroid_tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Health Selfies
CREATE TABLE public.journal_selfies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  tag TEXT NOT NULL,
  custom_label TEXT,
  storage_url TEXT,
  capture_order INT NOT NULL DEFAULT 1 CHECK (capture_order BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Note: selfies are immutable (create/delete only, no updates). No updated_at needed.

-- Quick Symptom (multiple per day)
CREATE TABLE public.journal_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  symptom TEXT NOT NULL,
  severity INT CHECK (severity BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Note: symptom entries are immutable (create/delete only). No updated_at needed.

-- Subjective State (morning/evening check-in sections)
CREATE TABLE public.journal_subjective (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('morning', 'evening')),
  section_key TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'partial', 'complete', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_anchor, checkin_type, section_key)
);

-- Medication Confirmation (daily)
CREATE TABLE public.journal_medication_confirmation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date_anchor DATE NOT NULL,
  medication_id UUID,
  status TEXT NOT NULL CHECK (status IN ('taken', 'not_yet', 'skipped')),
  taken_at TIMESTAMPTZ,
  taken_with TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_anchor, medication_id)
);

-- Check-in orchestrator status
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening')),
  date_anchor DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'partial', 'complete')),
  engagement_week INT NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type, date_anchor)
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sleep_updated BEFORE UPDATE ON public.journal_sleep FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_activity_updated BEFORE UPDATE ON public.journal_activity FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bm_updated BEFORE UPDATE ON public.journal_bowel_movement FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_food_updated BEFORE UPDATE ON public.journal_food FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subjective_updated BEFORE UPDATE ON public.journal_subjective FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_medconfirm_updated BEFORE UPDATE ON public.journal_medication_confirmation FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_checkins_updated BEFORE UPDATE ON public.checkins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 8.2 RLS Policies

All journal tables get the same pattern:

```sql
ALTER TABLE public.journal_sleep ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)

CREATE POLICY user_own_data ON public.journal_sleep
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- (repeat for all tables)
```

### 8.3 Indexes

```sql
CREATE INDEX idx_sleep_user_date ON public.journal_sleep(user_id, date_anchor);
CREATE INDEX idx_activity_user_date ON public.journal_activity(user_id, date_anchor);
CREATE INDEX idx_bm_user_date ON public.journal_bowel_movement(user_id, date_anchor);
CREATE INDEX idx_food_user_date ON public.journal_food(user_id, date_anchor);
CREATE INDEX idx_selfies_user_date ON public.journal_selfies(user_id, date_anchor);
CREATE INDEX idx_symptoms_user_date ON public.journal_symptoms(user_id, date_anchor);
CREATE INDEX idx_subjective_user_date ON public.journal_subjective(user_id, date_anchor, checkin_type);
CREATE INDEX idx_medconfirm_user_date ON public.journal_medication_confirmation(user_id, date_anchor);
CREATE INDEX idx_checkins_user_date ON public.checkins(user_id, date_anchor);
```

### 8.4 Why public schema (not pii)

Journal symptom data is health data but not personally identifiable information. PII (name, email, phone) stays in the `pii` schema with KMS encryption. Journal entries are linked to user_id (UUID) and protected by RLS. Supabase TDE covers encryption at rest.

---

## 9. Flutter App Architecture

### 9.1 Project Structure

```
mobile/lib/
├── app.dart                        # MaterialApp, theme, routing
├── config/
│   ├── field_config.dart           # Declarative field definitions
│   └── journal_types.dart          # Journal type registry
├── models/
│   ├── sleep_entry.dart
│   ├── activity_entry.dart
│   ├── bowel_movement_entry.dart
│   ├── food_entry.dart
│   ├── selfie_entry.dart
│   ├── symptom_entry.dart
│   ├── subjective_section.dart
│   ├── medication_confirmation.dart
│   ├── checkin.dart
│   └── field_definition.dart
├── services/
│   ├── api_client.dart             # HTTP client for FastAPI
│   ├── auth_service.dart           # Supabase auth
│   ├── sleep_service.dart
│   ├── activity_service.dart
│   ├── bowel_movement_service.dart
│   ├── food_service.dart
│   ├── selfie_service.dart
│   ├── symptom_service.dart
│   ├── subjective_service.dart
│   ├── medication_service.dart
│   ├── checkin_service.dart
│   ├── completion_service.dart
│   ├── photo_service.dart          # Photo capture + upload
│   └── local_storage.dart          # Offline draft persistence
├── screens/
│   ├── home/
│   │   └── home_dashboard.dart
│   ├── checkin/
│   │   ├── morning_checkin.dart    # Wizard orchestrator
│   │   ├── evening_checkin.dart    # Wizard orchestrator
│   │   └── cards/                  # Cards composed into check-ins
│   │       ├── sleep_card.dart
│   │       ├── body_state_card.dart
│   │       ├── medication_card.dart
│   │       ├── photo_prompt_card.dart
│   │       ├── context_card.dart
│   │       ├── energy_cognitive_card.dart
│   │       ├── bloating_body_card.dart
│   │       ├── symptoms_card.dart
│   │       ├── mood_stress_card.dart
│   │       ├── activity_card.dart
│   │       ├── sleep_prep_card.dart
│   │       ├── pms_card.dart
│   │       ├── greeting_card.dart
│   │       └── summary_card.dart
│   ├── journals/                   # Standalone journal views
│   │   ├── journal_tab.dart        # Journal tab with all types
│   │   ├── sleep_journal.dart
│   │   ├── activity_journal.dart
│   │   ├── bowel_movement_journal.dart
│   │   ├── food_journal.dart
│   │   ├── selfie_journal.dart
│   │   ├── symptom_journal.dart
│   │   └── journal_timeline.dart
│   ├── analytics/
│   │   └── analytics_screen.dart
│   └── labs/
│       └── labs_screen.dart
├── widgets/
│   ├── slider_card.dart            # "Not Set" → 1-10 with ghost marker
│   ├── quick_tap_selector.dart
│   ├── symptom_chip_grid.dart
│   ├── progress_stepper.dart
│   ├── section_header.dart
│   ├── conditional_section.dart
│   ├── medication_card_widget.dart
│   ├── photo_slot.dart
│   ├── bristol_scale_strip.dart
│   ├── color_scale_strip.dart
│   ├── insight_card.dart
│   ├── alert_banner.dart
│   ├── ghost_marker.dart
│   ├── completion_ring.dart
│   ├── trend_chart.dart
│   └── agent_nudge.dart
└── theme/
    └── app_theme.dart              # Light theme
```

### 9.2 Orchestrator Pattern

Check-in screens are orchestrators that:
1. Read field config to determine which cards to show (priority tier + engagement week)
2. Compose cards from multiple journal types (sleep, subjective, medication, activity)
3. Manage scroll position and card expand/collapse
4. Auto-save each card to its respective journal's local storage on "Next"
5. Sync to API per-journal when online
6. Evaluate conditional triggers in real-time
7. Build summary from all journal data

Cards are **dumb renderers** — they receive field definitions, render widgets, emit responses. They don't know about other cards or the overall flow.

### 9.3 Offline Support

- All data saves to local storage immediately per card
- API sync when connectivity available, per-journal independently
- Full flow works offline
- Photos save locally, upload to GCS when online
- Conflict resolution: last-write-wins per journal entry

### 9.4 Edge Cases

- **Draft expiration:** Incomplete check-ins expire after 4 hours
- **Late check-in:** Morning check-in after 2 PM → gentle note, date_anchor set to morning
- **Duplicate check-in:** Already completed → opens in edit mode
- **Missing morning:** Evening flow works independently, hides morning references
- **Weather auto-attachment:** Deferred from P0+P1

---

## 10. Progressive Disclosure (P2 Extension Path)

Adding P2 fields:
1. Add field definition to config (key, type, section, priority: P2, conditions)
2. API validates automatically (shared config)
3. No schema migration for JSONB sections; typed tables may need ALTER TABLE
4. Same Flutter widgets (SliderCard, QuickTapSelector, etc.)
5. Engagement week controls visibility (P2 hidden until Month 2+)

**P2 fields to add:**
- Sleep: Basal body temperature (already in schema)
- Morning: Exercise tolerance yesterday
- Context: Hunger/appetite slider, hydration slider
- Evening lifestyle: Meal composition, meal timing, exercise detail, stress events, fiber
- Evening sleep prep: Caffeine after 2pm, screen time
- Evening estrogen (P3): Xenoestrogen exposure, liver support supplements

---

## 11. Out of Scope

- Onboarding flow (ONB screens)
- Dashboard analytics detail views
- Intelligence layer / pattern detection (Phase 2)
- Doctor visit reports (Phase 3)
- Chat agent (Phase 3)
- Provider portal (Phase 4)
- Photo AI analysis (future)
- Web client journal UI (future, reuses field config + API)
- Push notification infrastructure
- Wearable data import (future sleep integration)
- Lab Results entry wizard (own spec, own schema)
- Medication Change logging (own spec, own schema — distinct from daily medication confirmation which IS in this spec)

---

## 12. Open Decisions (Resolved)

**Offline conflict resolution:** Last-write-wins applies per journal entry row. For `journal_subjective` with JSONB `responses`, a PUT overwrites the entire JSONB blob for that section_key. The client always sends the full section payload, not partial field updates.

**Same-as-Yesterday for evening:** Copies from yesterday's evening check-in only. Does not reference today's morning data (morning energy is shown as a reference in the greeting, but not pre-filled into evening fields).

**Slider reset to "Not Set":** User drags the thumb all the way left past 1. The thumb snaps to the gray "Not Set" state at the leftmost position.

---

## 13. Success Criteria

1. Morning check-in (P0+P1) completable in under 90 seconds
2. Evening check-in (P0+P1) completable in under 2 minutes
3. Bowel movement capture in under 30 seconds
4. Activity capture in under 20 seconds
5. Conditional sections appear/disappear instantly
6. Partial check-ins preserved — quit and resume
7. Each journal type independently editable from Journal tab
8. Embedded journals (sleep, activity) editable both via check-in and standalone
9. Same-as-yesterday works after 14+ days
10. Photos capture with tags, store locally, sync to cloud
11. Data persists through app kills and offline periods
12. API validates against shared field config
13. Adding a P2 field requires only config + optional schema change
14. Completion agent receives accurate status across all 11 journal types
15. Home dashboard shows meaningful trend data from day 2 onward
