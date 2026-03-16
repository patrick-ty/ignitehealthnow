# Onboarding Flow

**Flow ID:** FLOW-ONB-001
**Version:** 1.0
**Date:** March 16, 2026
**Screens:** ONB-001 through ONB-013
**Inherits:** `01-design-system.md`
**Reference:** Prior onboarding mockup (`ignitehealth_onboarding_specification.md`) for emotional investment patterns

---

## 1. Flow Overview

### 1.1 Objectives

1. **Create emotional investment** — the user feels seen, validated, and committed to tracking
2. **Collect baseline health profile** — diagnoses, medications, supplements, cycle status
3. **Set up practical infrastructure** — notification preferences, weather data, book connection
4. **Set realistic expectations** — time commitment, what insights require, honest timeline
5. **Route to first check-in** — seamless handoff to morning or evening entry

### 1.2 Design Principles

- **Persona-sensitive pacing:** The flow adjusts its tone and complexity based on age and engagement signals. Julie (21) sees a lighter, less clinical tone with contemporary language. Gloria (80) sees larger text, simpler choices, and a caregiver-mode prompt. Sarah/Maria see the full hypothyroidism-focused experience. The underlying data collected is identical; only the presentation layer varies.
- **Progressive commitment:** Emotional investment screens come before data collection. The user decides this app understands them before they invest time entering health details.
- **Skip without guilt:** Every data-collection screen (ONB-005 through ONB-011) has a "Skip for now" option. Skipped data can be entered later from Settings. The flow never blocks on optional data.
- **Fast path available:** Users who select "Very confident" in their health knowledge or who indicate they've read the book can skip educational framing screens.

### 1.3 Success Metrics

| Metric | Target |
|--------|--------|
| Completion rate (ONB-001 to ONB-013) | > 75% |
| Time to complete | 2-4 minutes (varies by depth of medication/supplement entry) |
| Day 1 retention (first check-in completed) | > 85% |
| Day 7 retention (still actively tracking) | > 60% |
| Medication setup completion | > 60% (many users may not have medications yet) |

---

## 2. Flow Diagram

```mermaid
flowchart TD
    START([App Launch — First Time]) --> ONB001[ONB-001: Splash / Brand Screen]
    ONB001 -->|auto-advance 2s or tap| ONB002[ONB-002: Welcome & Value Proposition]
    ONB002 -->|"Get Started"| ONB003[ONB-003: Account Creation]
    ONB003 -->|account created| ONB004[ONB-004: Display Name Setup]
    ONB004 -->|name set| ONB005[ONB-005: Primary Health Concerns]

    ONB005 -->|concerns selected| ONB006[ONB-006: Diagnosis Entry]
    ONB005 -->|"Skip for now"| ONB006

    ONB006 -->|diagnoses entered| ONB007[ONB-007: Current Medications Setup]
    ONB006 -->|"Skip for now" / "No diagnoses"| ONB007

    ONB007 -->|medications entered| ONB008[ONB-008: Current Supplements Setup]
    ONB007 -->|"Skip for now" / "No medications"| ONB008

    ONB008 -->|supplements entered| CYCLECHECK{Cycle tracking<br/>applicable?}
    ONB008 -->|"Skip for now"| CYCLECHECK

    CYCLECHECK -->|user selected menstrual<br/>concerns OR female-indicating<br/>health profile| ONB009[ONB-009: Cycle Tracking Opt-In]
    CYCLECHECK -->|no cycle-relevant indicators| ONB010[ONB-010: Notification Preferences]

    ONB009 -->|opted in or out| ONB010

    ONB010 -->|preferences set| ONB011[ONB-011: Book Connection]
    ONB010 -->|"Skip for now"| ONB011

    ONB011 -->|connected or skipped| ONB012[ONB-012: Privacy & Data Consent]

    ONB012 -->|consent given| ONB013[ONB-013: Onboarding Complete]

    ONB013 -->|time-based routing| TIMECHECK{What time<br/>of day?}

    TIMECHECK -->|before 2 PM| JRM001([JRM-001: Morning Check-in])
    TIMECHECK -->|2 PM or later| JRE001([JRE-001: Evening Check-in])

    %% Abandon & resume path
    ONB003 -.->|exits app| RESUME[(Resume from last<br/>completed screen<br/>within 7 days)]
    ONB005 -.->|exits app| RESUME
    ONB006 -.->|exits app| RESUME
    ONB007 -.->|exits app| RESUME
    ONB008 -.->|exits app| RESUME
    ONB009 -.->|exits app| RESUME
    ONB010 -.->|exits app| RESUME

    style ONB001 fill:#E8F5F1,stroke:#2E7D6F
    style ONB002 fill:#E8F5F1,stroke:#2E7D6F
    style ONB012 fill:#FFF3D6,stroke:#E9A820
    style ONB013 fill:#E8F5F1,stroke:#2E7D6F
    style JRM001 fill:#F4A261,stroke:#C75B39,color:#1C1B1A
    style JRE001 fill:#F4A261,stroke:#C75B39,color:#1C1B1A
```

---

## 3. Step-by-Step Detail

### Step 1: Splash / Brand Screen (ONB-001)

**Purpose:** Brand impression and loading. Establishes visual identity.

- App logo centered, brand colors
- Auto-advances to ONB-002 after 2 seconds, or on tap
- No back button (entry point)
- If the user has a saved onboarding draft (returning within 7 days), skip splash and resume from the last completed screen

**Analytics:** `onboarding_started`

---

### Step 2: Welcome & Value Proposition (ONB-002)

**Purpose:** Emotional hook. The user should feel "this app understands me" within 5 seconds.

**Persona-sensitive content:**

| Persona Signal | Headline | Subtext |
|---------------|----------|---------|
| Default (unknown) | "Your body is trying to tell you something." | "IgniteHealthNow helps you hear it — with data your doctor can't ignore." |
| Young adult indicators (age < 30 if collected, or inferred from interaction speed) | "What if the way you feel isn't just stress?" | "Track what's really going on. See the patterns. Get answers." |
| Older adult indicators (age > 60 if collected, large-text mode already on, or slow interaction pace) | "You deserve better than 'it's just your age.'" | "Build the record that connects what you're feeling to what's really happening." |

At this stage, the app does not yet know the user's age. The default copy works for all personas. Persona-specific messaging becomes more targeted from ONB-005 onward as data is collected.

**Emotional design note:** This screen inherits the "Mirror" concept from the prior mockup — the idea that the app should reflect the user's experience back to them. At this early stage, the reflection is generic but resonant. The full personalized Mirror moment happens at ONB-013 after data has been collected.

**Navigation:**
- Primary CTA: "Get Started" -> ONB-003
- No skip, no back

**Analytics:** `welcome_viewed`, with `time_on_screen`

---

### Step 3: Account Creation (ONB-003)

**Purpose:** Create the user's account. Minimal friction.

**Options:**
1. **Email + password** — standard form
2. **Sign in with Google** (OAuth)
3. **Sign in with Apple** (OAuth, required for iOS App Store)

**Privacy note shown:** "Your health data is encrypted and never shared without your explicit permission."

**Form fields (email path):**
- Email address (validated)
- Password (minimum 8 characters, strength indicator)
- Confirm password

**Post-creation:** Account is created. User is signed in. Onboarding data from this point forward is saved to their profile.

**Navigation:**
- Primary CTA: "Create Account" / OAuth button -> ONB-004
- Secondary: "Already have an account? Sign in" -> sign-in flow (separate)
- Back -> ONB-002

**Analytics:** `account_created` with `method` (email/google/apple)

---

### Step 4: Anonymized Display Name Setup (ONB-004)

**Purpose:** Create a display name for the user that appears in the app UI. This is not their real name — it can be a nickname, initials, or anything they choose.

**Why this matters:** HIPAA-informed design. The display name is what appears on screen and in any potential research data. It should not be identifiable.

**Input:** Single text field, 2-20 characters. Pre-populated suggestion: first name from OAuth if available, or "Friend" as placeholder.

**Guidance text:** "Pick a name for your journal. This is just for you — use your name, a nickname, or anything you like."

**Navigation:**
- Primary CTA: "Continue" -> ONB-005
- Back -> ONB-003

**Analytics:** `display_name_set`

---

### Step 5: Primary Health Concerns (ONB-005)

**Purpose:** Emotional investment + baseline data. This is the first screen where the user tells the app about themselves. The selection directly personalizes the rest of onboarding and the ongoing app experience.

**This is the updated version of the prior mockup's "Symptom Selection" screen, reframed for the PRD's hypothyroidism focus.**

**Input:** Multi-select chip grid. Minimum 1 selection required, no maximum.

**Symptom/concern chips:**

*Core (always visible):*
- Persistent fatigue / exhaustion
- Brain fog / difficulty concentrating
- Hair loss or thinning
- Weight gain or inability to lose weight
- Bloating or digestive issues
- Anxiety or depression
- Sleep problems
- Cold intolerance (hands, feet, always cold)
- Joint or muscle pain

*Extended (shown via "Show more"):*
- Skin changes (dry, pale, yellowish)
- Heart palpitations
- Irregular or heavy periods
- Breakouts or acne
- Irritability or mood swings
- Memory problems
- Feeling puffy or swollen
- Constipation
- Low motivation or apathy

*Persona-sensitive ordering:*
- For younger users (Julie): Breakouts, hair thinning, bloating, anxiety, brain fog prioritized to the top
- For older users (Gloria): Joint pain, cold intolerance, palpitations, memory problems, sleep prioritized to the top
- Default: fatigue, brain fog, hair loss, weight gain (the "greatest hits" of hypothyroidism)

**"Other" option:** Free text field (100 char max) for symptoms not listed.

**Navigation:**
- Primary CTA: "Continue" (enabled when >= 1 selected) -> ONB-006
- Skip: "Skip for now" -> ONB-006
- Back -> ONB-004

**Analytics:** `health_concerns_selected` with `concerns_array`, `count`

**Business logic:** Selections are stored in the user's health profile and used to:
- Personalize symptom chip ordering in daily check-ins
- Prioritize which correlations the intelligence layer surfaces first
- Inform the Mirror moment at ONB-013
- Determine which educational micro-content is most relevant

---

### Step 6: Diagnosis Entry (ONB-006)

**Purpose:** Capture existing diagnoses. This is event-driven data (rare, high-friction-acceptable) but is collected here because it shapes the entire app experience.

**Input:** Guided selection with search.

**Pre-populated options (quick-tap):**
- Hypothyroidism
- Hashimoto's thyroiditis
- Hyperthyroidism / Graves' disease
- Insulin resistance / prediabetes
- Type 2 diabetes
- PCOS
- Anemia / iron deficiency
- Vitamin D deficiency
- "I don't have a diagnosis (yet)"
- "I'm not sure"

**For each diagnosis selected:**
- When diagnosed (approximate): dropdown with "Less than 6 months", "6 months - 1 year", "1-3 years", "3-5 years", "5+ years", "Not sure"
- Currently being treated? Yes / No / Not sure

**Navigation:**
- Primary CTA: "Continue" -> ONB-007
- Skip: "Skip for now" / "No diagnoses" -> ONB-007
- Back -> ONB-005

**Analytics:** `diagnoses_entered` with `diagnoses_array`, `count`, `has_thyroid_diagnosis`

---

### Step 7: Current Medications Setup (ONB-007)

**Purpose:** Set up medication tracking. Critical for the intelligence layer's medication timing correlation and absorption interference detection.

**Input:** Medication wizard (simplified version of MED-002).

**For each medication:**
1. Medication name (search + autocomplete from common thyroid medications database)
2. Dosage (numeric + unit selector: mcg, mg, IU, etc.)
3. Frequency (once daily, twice daily, weekly, as needed)
4. Typical timing (morning, afternoon, evening, bedtime)
5. Taken with food? (Yes / No / Empty stomach required)

**Common thyroid medications pre-loaded for quick selection:**
- Levothyroxine (Synthroid, Tirosint, generic)
- Liothyronine (Cytomel, generic)
- NP Thyroid / Armour Thyroid / desiccated thyroid
- Methimazole (for hyperthyroid/Graves')

**"Add another medication" button** after each entry.

**Guidance text:** "We'll use this to track whether your medications are working and to watch for timing patterns that affect absorption."

**Navigation:**
- Primary CTA: "Continue" -> ONB-008
- Skip: "Skip for now" / "I'm not on medications" -> ONB-008
- Back -> ONB-006

**Analytics:** `medications_entered` with `medication_count`, `has_thyroid_med`

---

### Step 8: Current Supplements Setup (ONB-008)

**Purpose:** Capture supplement regimen. Supplements are a major part of the hypothyroidism management toolkit and interact with medication absorption.

**Input:** Similar to medication wizard but lighter-weight.

**Common supplements pre-loaded (multi-select chips for speed):**
- Vitamin D
- Iron / ferritin
- Selenium
- Zinc
- B12 / B-complex
- Magnesium
- Vitamin C
- Omega-3 / fish oil
- Probiotics
- DIM
- Ashwagandha
- CoQ10
- Biotin

**For each selected supplement:**
- Dosage (optional — free text, e.g., "2000 IU")
- Timing (morning, afternoon, evening, with meals)

**Guidance text:** "Some supplements interact with thyroid medication absorption. We'll help you track timing and spot potential conflicts."

**Navigation:**
- Primary CTA: "Continue" -> ONB-009 (if cycle-relevant) or ONB-010
- Skip: "Skip for now" / "I don't take supplements" -> next screen
- Back -> ONB-007

**Analytics:** `supplements_entered` with `supplement_count`

---

### Step 9: Cycle Tracking Opt-In (ONB-009)

**Purpose:** Explain why menstrual cycle tracking matters for thyroid health and get the user's consent to enable it.

**Conditional display:** This screen is shown only if:
- The user selected menstrual/period-related health concerns in ONB-005, OR
- The user selected PCOS as a diagnosis in ONB-006, OR
- The user's health profile suggests cycle tracking is relevant (this is a soft check; the user can always enable cycle tracking later from Settings)

**Content structure:**

*Headline:* "Your cycle affects your thyroid more than you might think."

*Educational micro-content (3 brief bullets):*
- "Estrogen levels directly influence how much thyroid hormone is available to your cells"
- "Symptoms that worsen before your period may be driven by estrogen dominance, not just PMS"
- "Tracking your cycle alongside your symptoms reveals patterns that are invisible otherwise"

*Visual:* Simple diagram or icon showing cycle phases mapped to symptom severity (conceptual, not data-driven yet)

*Options:*
- "Yes, track my cycle" -> enables cycle tracking, asks for last period start date and typical cycle length
- "Not right now" -> skips cycle tracking (can enable later in Settings)
- "This doesn't apply to me" -> permanently hides cycle tracking prompts (reversible in Settings)

**If opted in:**
- Last period start date: date picker (default: today)
- Typical cycle length: number input with stepper (default: 28, range: 20-45)
- "Not sure / irregular" option

**Navigation:**
- Primary CTA: "Continue" -> ONB-010
- Back -> ONB-008

**Analytics:** `cycle_tracking_decision` with `opted_in` (boolean), `last_period_date`, `cycle_length`

---

### Step 10: Notification Preferences (ONB-010)

**Purpose:** Set up notification timing so reminders arrive when the user actually wants them.

**Content:**

*Headline:* "When should we check in?"

*Settings:*

| Notification Type | Default | User Input |
|-------------------|---------|------------|
| Morning check-in reminder | 7:30 AM | Time picker |
| Evening check-in reminder | 8:30 PM | Time picker |
| Medication reminders | Based on medication timing from ONB-007 | Toggle on/off per medication |
| Pattern alerts (when insights are ready) | On | Toggle |
| Positive reinforcement (streaks, milestones) | On | Toggle |

*Guidance text:* "You can adjust these anytime in Settings. We'll never spam you — only meaningful reminders."

**Location/weather setup (bundled here):**
- "To track weather patterns that might affect your symptoms, we need your zip code or location."
- Input: Zip code (5 digits) OR "Use my location" button (requests device location permission)
- "Skip" option -> weather data not collected (can enable later)

**Navigation:**
- Primary CTA: "Continue" -> ONB-011
- Skip: "Skip for now" (uses defaults) -> ONB-011
- Back -> ONB-009 or ONB-008

**Analytics:** `notifications_configured` with `morning_time`, `evening_time`, `location_provided`

---

### Step 11: Book Connection (ONB-011)

**Purpose:** Optional connection to *The Hypothyroidism Cheat Code*. Users who have the book get deeper educational content linked to specific chapters.

**Content:**

*Headline:* "Have you read The Hypothyroidism Cheat Code?"

*Options:*
- "Yes, I've read it" -> Enables book chapter references throughout the app. Educational micro-content links to specific chapters.
- "I'm reading it now" -> Same as above, plus suggested reading sequence synced to their tracking journey.
- "No, but I'm interested" -> Shows a brief description and link to purchase. Book references are shown with "Learn more in The Hypothyroidism Cheat Code" framing.
- "No, not interested" -> Book references are minimized (shown only when highly relevant to a detected pattern).

**Navigation:**
- Primary CTA: "Continue" -> ONB-012
- Back -> ONB-010

**Analytics:** `book_connection` with `status` (read/reading/interested/not_interested)

---

### Step 12: Privacy & Data Consent (ONB-012)

**Purpose:** Informed consent for data handling. Required before the app can store and process health data.

**Content:**

*Headline:* "Your data, your control."

*Key points (brief, scannable):*
- "Your health data is encrypted at rest and in transit"
- "We never sell your data or share it with advertisers"
- "You control who sees your data — including your doctor"
- "You can export or delete your data at any time"
- "Anonymous research participation is optional and always separate"

*Required consent toggles:*
- [x] "I agree to the Terms of Service and Privacy Policy" (links to full documents) — **required**
- [ ] "I consent to anonymized data being used for thyroid health research" — **optional**, default off

*Guidance text:* "We take privacy seriously because health data is the most personal data there is."

**Navigation:**
- Primary CTA: "I Agree" (enabled only when Terms toggle is checked) -> ONB-013
- Back -> ONB-011

**Analytics:** `consent_given` with `terms_accepted`, `research_opted_in`

---

### Step 13: Onboarding Complete / First Check-in Prompt (ONB-013)

**Purpose:** The transition screen. Celebrates completion, sets expectations for the first check-in, and routes the user into the app.

**This is the evolved version of the prior mockup's "Mirror" and "First Action" screens, combined and reframed for the PRD's hypothyroidism focus.**

**Content:**

*Personalized Mirror moment (dynamic text based on ONB-005 and ONB-006 data):*

If the user entered health concerns:
> "You told us you're dealing with {top 2-3 concerns}. {Duration text if diagnosis entered}. You're not imagining it, and you're not alone. Let's start building the record that proves what you're experiencing is real."

If the user skipped health concerns:
> "You're here because something doesn't feel right. That instinct matters. Let's start tracking and let the data tell the story."

*What to expect:*
- "Your first check-in takes about 2 minutes"
- "We'll ask about how you slept, how you feel, and what you've taken today"
- "After a week of tracking, patterns start to emerge"
- "After a month, you'll have data your doctor has never seen"

*CTA:*
- If before 2 PM: "Start Your Morning Check-in" -> JRM-001
- If 2 PM or later: "Start Your Evening Check-in" -> JRE-001

**No back button.** The user has completed onboarding. The commitment is made.

**Analytics:** `onboarding_completed` with `duration_seconds`, `screens_skipped`, `routed_to` (morning/evening)

---

## 4. Abandon & Resume Logic

| Scenario | Behavior |
|----------|----------|
| User exits app before ONB-003 (account creation) | No data saved. Restart from ONB-001. |
| User exits after ONB-003 (account created) | Progress saved to account. Resume from last completed screen on next app launch. |
| User returns within 7 days | Automatic resume with "Welcome back! Pick up where you left off." |
| User returns after 7 days | Saved progress cleared. Restart from ONB-004 (account still exists, skip creation). |
| User taps back through all screens to ONB-002 | This is allowed. No data is lost — previously entered data is preserved and shown when the user advances forward again. |

---

## 5. Persona Adaptation Details

### 5.1 Julie (Age 18-25, No Diagnosis)

**Tone adjustments:**
- Less clinical language. "Health concerns" instead of "diagnoses." "What's been going on?" instead of "What symptoms are you experiencing?"
- Skin, hair, and appearance-related concerns are elevated in the chip ordering
- Cycle tracking framed as body literacy: "Understanding your cycle is like having a cheat code for how you feel"
- Book connection de-emphasized (she likely hasn't read it)
- Notification timing defaults to later: 9:00 AM / 10:00 PM

**UX adjustments:**
- Faster auto-advance on single-select screens
- Briefer educational text (she'll skip long explanations)
- More visual, less text-heavy layout where possible

### 5.2 Gloria (Age 65+, Multiple Diagnoses)

**Tone adjustments:**
- Warmer, more respectful language. "Your health journey" instead of "your tracking."
- Acknowledgment of complexity: "You've been managing a lot. This app helps connect the dots."
- Provider-partnership framed prominently: "Build a report your doctor will actually read"
- Medication entry is more prominent (she likely takes 5+ medications)

**UX adjustments:**
- Large-text mode prompt: "Would you like larger text? You can change this anytime." (offered at ONB-004)
- Caregiver-assisted entry prompt: "Will someone be helping you with check-ins? We have a mode for that."
- Slower auto-advance (800ms instead of 500ms)
- More confirmation steps ("Is this correct?" summaries)
- Simpler chip descriptions (avoid medical jargon abbreviations)

### 5.3 Adaptation Trigger

The app does not explicitly ask for age during onboarding (to avoid friction). Instead, persona signals are inferred from:
- Large-text mode or accessibility settings already enabled at launch
- Interaction pace (time between taps)
- Number of diagnoses and medications entered (proxy for age/complexity)
- Symptom selections (skin/hair/bloating patterns skew younger; cardiovascular/joint/memory patterns skew older)
- OAuth account metadata (if available and consented)

These signals produce a soft persona classification stored in the profile. The classification is never shown to the user — it only influences tone, ordering, and pacing.

---

## 6. Error Handling

| Error | Behavior |
|-------|----------|
| Network failure during account creation | "We're having trouble connecting. Check your internet and try again." Retry button. Data entered so far is preserved in form. |
| OAuth provider error | "We couldn't connect to {provider}. Try again or use email instead." |
| Email already registered | "This email is already registered. Sign in instead?" with link to sign-in flow. |
| Network failure during onboarding (post-account) | Save all data locally. Show subtle banner: "You're offline. Your data is saved and will sync when you reconnect." Allow full onboarding completion offline. |
| Invalid zip code | Inline validation: "Please enter a valid 5-digit zip code." |

---

## 7. Data Model — Onboarding Profile

All data collected during onboarding is stored in the user's profile and is editable from Settings at any time.

```
onboarding_profile:
  display_name: String
  health_concerns: List<String>           # From ONB-005
  diagnoses: List<DiagnosisEntry>         # From ONB-006
    - name: String
    - duration: Enum
    - currently_treated: Enum
  medications: List<MedicationEntry>      # From ONB-007
    - name: String
    - dosage: String
    - frequency: Enum
    - timing: Enum
    - with_food: Enum
  supplements: List<SupplementEntry>      # From ONB-008
    - name: String
    - dosage: String?
    - timing: Enum
  cycle_tracking:                         # From ONB-009
    enabled: Boolean
    last_period_date: Date?
    typical_cycle_length: Int?
  notifications:                          # From ONB-010
    morning_reminder: Time
    evening_reminder: Time
    medication_reminders: Boolean
    pattern_alerts: Boolean
    positive_reinforcement: Boolean
  location:                               # From ONB-010
    zip_code: String?
    coordinates: LatLng?
  book_connection: Enum                   # From ONB-011
  consent:                                # From ONB-012
    terms_accepted: Boolean
    terms_accepted_at: DateTime
    research_opted_in: Boolean
  onboarding_metadata:
    started_at: DateTime
    completed_at: DateTime?
    screens_skipped: List<String>
    persona_signal: Enum                  # inferred, not user-declared
    version: "1.0"
```

---

*End of Onboarding Flow Specification v1.0*
