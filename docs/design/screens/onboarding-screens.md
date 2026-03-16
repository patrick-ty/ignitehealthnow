# Onboarding Screen Specifications

**Version:** 1.0
**Date:** March 16, 2026
**Screens:** ONB-001 through ONB-013
**Inherits:** `01-design-system.md` (all tokens, components, accessibility standards)
**Flow reference:** `flows/onboarding.md`

Each screen specification follows a consistent template. All screens in this file share these global properties:
- **Bottom tab bar:** Hidden (onboarding is a full-screen flow)
- **Camera FAB:** Hidden
- **System chrome:** Status bar visible, home indicator visible
- **Orientation:** Portrait only
- **Safe areas:** Content respects top and bottom safe area insets

---

## ONB-001: Splash / Brand Screen

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-001 |
| **Name** | Splash / Brand Screen |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | App launch (first time) |
| **Entry points** | App first launch; app launch after cleared onboarding data |
| **Exit points** | ONB-002 (auto-advance after 2s or on tap) |

### Layout (top to bottom)

1. **Full-screen background:** `neutral.background` (#F8F7F5)
2. **App logo:** Centered horizontally and vertically in the upper 60% of the screen. Size: 120x120dp. The logo is the IgniteHealthNow brand mark.
3. **App name:** "IgniteHealthNow" centered below logo. Typography: `type.h1` (28sp Bold). Color: `brand.primaryDark`.
4. **Tagline:** "Your personal health intelligence." Typography: `type.body` (16sp Regular). Color: `neutral.textSecondary`. 16dp below app name.
5. **Bottom safe area padding:** `space.xxl` (32dp)

### Data Fields

None. This is a static screen.

### Conditional Logic

- If the user has a saved onboarding draft (resume scenario), skip ONB-001 entirely and route to the last completed screen.
- If the user has completed onboarding previously, skip the entire onboarding flow and route to the Dashboard.

### States

| State | Behavior |
|-------|----------|
| **Default** | Logo and text visible. Auto-advance timer starts. |
| **Loading** | If the app is checking for existing account/session, show a subtle loading indicator below the tagline (small circular progress, `brand.primary` color). |
| **Error** | If account check fails (network), proceed to ONB-002 anyway. Account status will be checked at ONB-003. |

### Accessibility

- Screen announced: "IgniteHealthNow. Your personal health intelligence. Loading."
- Auto-advance respects accessibility: if VoiceOver/TalkBack is active, auto-advance is disabled. The user taps to proceed.
- Logo image: `Semantics(label: "IgniteHealthNow logo", excludeFromSemantics: false)`.
- Minimum contrast: tagline text on background meets AA (5.2:1).

---

## ONB-002: Welcome & Value Proposition

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-002 |
| **Name** | Welcome & Value Proposition |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-001 |
| **Entry points** | ONB-001 (auto-advance or tap) |
| **Exit points** | ONB-003 (tap "Get Started") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` (32dp) + safe area
2. **Illustration area:** Upper 40% of screen. Abstract, warm illustration conveying "someone being heard" — not clinical, not diagnostic. Placeholder: teal/amber gradient abstract shape. Size: full width, 240dp height.
3. **Headline:** Persona-sensitive (see flow doc). Default: "Your body is trying to tell you something." Typography: `type.h1` (28sp Bold). Color: `neutral.textPrimary`. Left-aligned with `space.lg` (16dp) horizontal padding.
4. **Subtext:** Persona-sensitive. Default: "IgniteHealthNow helps you hear it — with data your doctor can't ignore." Typography: `type.body` (16sp Regular). Color: `neutral.textSecondary`. 12dp below headline.
5. **Spacer:** Flexible (pushes CTA to bottom)
6. **Primary CTA:** "Get Started" — full-width button. Component: Material 3 `FilledButton`. Background: `brand.primary`. Text: white, `type.label` (14sp Medium). Height: 56dp. Horizontal padding: `space.lg`. Corner radius: `radius.md` (12dp).
7. **Bottom padding:** `space.xxl` (32dp) + safe area

### Data Fields

None.

### Conditional Logic

None at this screen. Persona-sensitive headline/subtext is determined by persona inference signals (see flow doc section 5).

### States

| State | Behavior |
|-------|----------|
| **Default** | Illustration, text, and CTA visible. |
| **Animated entry** | Illustration fades in (300ms), then headline slides up (200ms), then subtext slides up (200ms), then CTA fades in (200ms). Staggered by 100ms each. |
| **Reduced motion** | All elements appear instantly. No animation. |

### Accessibility

- Screen title announced: "Welcome to IgniteHealthNow."
- Illustration: decorative, `excludeFromSemantics: true`.
- CTA button: `Semantics(label: "Get Started. Begin setting up your account.", button: true)`.
- Focus order: headline -> subtext -> CTA.
- In large-text mode: headline scales to 34sp, subtext to 20sp. Illustration height reduces to 180dp to accommodate text growth.

---

## ONB-003: Account Creation

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-003 |
| **Name** | Account Creation |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-002 |
| **Entry points** | ONB-002 ("Get Started") |
| **Exit points** | ONB-004 (account created); Sign-in flow (existing account) |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** Top-left, `Icons.arrow_back`, `icon.md`. Navigates to ONB-002.
3. **Headline:** "Create your account" — `type.h1`, `neutral.textPrimary`, left-aligned.
4. **Privacy assurance:** "Your health data is encrypted and never shared without your permission." — `type.caption`, `neutral.textSecondary`. 8dp below headline.
5. **OAuth buttons section:** `space.xl` (24dp) below privacy text.
   - "Continue with Google" — outlined button, full width, 56dp height, Google logo icon left-aligned, `radius.md`.
   - "Continue with Apple" — filled black button, full width, 56dp height, Apple logo icon, `radius.md`. 12dp below Google button.
6. **Divider row:** `space.lg` above and below. Horizontal line with centered "or" text in `type.caption`, `neutral.textTertiary`.
7. **Email form:**
   - Email field: `TextFormField`, label "Email address", keyboard type: email, autocomplete enabled. Border: `neutral.border`, focused: `brand.primary`. Height: 56dp. `radius.sm` (8dp).
   - Password field: `TextFormField`, label "Password", obscured, suffix icon: show/hide toggle. 12dp below email. Same styling.
   - Confirm password field: Same as password. 12dp below.
   - Password requirements hint: "At least 8 characters" — `type.caption`, `neutral.textTertiary`. 4dp below confirm field.
8. **Primary CTA:** "Create Account" — full-width `FilledButton`, `brand.primary`, disabled state until form is valid. `space.xl` below form.
9. **Sign-in link:** "Already have an account? Sign in" — `type.label`, `brand.primary`, center-aligned. `space.lg` below CTA.
10. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `email` | String (email) | Valid email format, not already registered | Yes (if email path) |
| `password` | String | Min 8 characters | Yes (if email path) |
| `confirm_password` | String | Must match password | Yes (if email path) |
| `auth_method` | Enum: email, google, apple | — | Auto-captured |

### Conditional Logic

- If Google/Apple OAuth is tapped, skip the email form entirely. OAuth flow handles account creation.
- If email is already registered, show inline error below email field: "This email is already registered. Sign in instead?" with tappable "Sign in" link.
- Password strength: show color-coded bar below password field (red < 8 chars, amber 8-11 chars, green 12+ chars).

### States

| State | Behavior |
|-------|----------|
| **Empty** | Form fields empty, CTA disabled (`neutral.disabled` background). |
| **Partial** | Some fields filled, CTA remains disabled. Inline validation shown on blur. |
| **Valid** | All fields valid, CTA enabled (`brand.primary` background). |
| **Loading** | CTA shows loading spinner, form fields disabled. "Creating your account..." |
| **Error — network** | Banner at top: "We're having trouble connecting. Check your internet and try again." Form data preserved. |
| **Error — email exists** | Inline error below email field. |
| **Error — OAuth** | Banner: "We couldn't connect to {provider}. Try again or use email instead." |

### Accessibility

- Form fields: each has `Semantics(label:, hint:, textField: true)`.
- Password show/hide toggle: `Semantics(label: "Show password" / "Hide password", toggled: true/false)`.
- CTA disabled state announced: "Create Account, disabled. Complete all fields to continue."
- Error messages announced via `Semantics(liveRegion: true)`.
- OAuth buttons: "Continue with Google, button" / "Continue with Apple, button".
- Focus order: back button -> headline -> Google -> Apple -> email -> password -> confirm -> create -> sign-in link.
- In large-text mode: form fields maintain 56dp minimum height. Labels scale, fields reflow as needed.

---

## ONB-004: Anonymized Display Name Setup

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-004 |
| **Name** | Anonymized Display Name Setup |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-003 |
| **Entry points** | ONB-003 (account created) |
| **Exit points** | ONB-005 ("Continue") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** Top-left -> ONB-003
3. **Progress indicator:** Step 1 of ~8 (approximate, since some steps are conditional). Thin horizontal bar, `brand.primary` fill, 4dp height, full width. Shows ~10% progress.
4. **Headline:** "What should we call you?" — `type.h1`, `neutral.textPrimary`.
5. **Subtext:** "Pick a name for your journal. This is just for you — use your name, a nickname, or anything you like." — `type.body`, `neutral.textSecondary`. 12dp below.
6. **Text field:** Single line, label "Display name", max 20 characters, character counter shown. Pre-populated with first name from OAuth if available, or empty. Border styling same as ONB-003. `space.xl` below subtext.
7. **Gloria persona prompt (conditional):** If large-text mode is active or accessibility features are on, show: "Would you like larger text throughout the app?" with a toggle. And: "Will someone be helping you with check-ins?" with a toggle for caregiver-assisted mode. `space.lg` below text field. Styled as a subtle card with `neutral.surfaceAlt` background.
8. **Spacer:** Flexible
9. **Primary CTA:** "Continue" — full-width `FilledButton`, enabled when display name is 2+ characters. `brand.primary`.
10. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `display_name` | String | 2-20 characters, no special characters except hyphens and spaces | Yes |
| `large_text_enabled` | Boolean | — | No (conditional display) |
| `caregiver_mode_enabled` | Boolean | — | No (conditional display) |

### Conditional Logic

- Gloria persona prompt appears only if: (a) system text scale > 1.3, (b) device accessibility features are on, or (c) interaction pace from ONB-001 to ONB-003 was notably slow (> 20 seconds average per screen).
- If large-text mode is toggled on, the entire screen reflows immediately to demonstrate the change.

### States

| State | Behavior |
|-------|----------|
| **Empty** | Text field empty (or pre-populated from OAuth). CTA disabled if < 2 chars. |
| **Valid** | 2+ characters entered. CTA enabled. |
| **Error** | If special characters entered: inline error "Letters, numbers, hyphens, and spaces only." |

### Accessibility

- Text field: `Semantics(label: "Display name", hint: "2 to 20 characters")`.
- Character counter: announced at 5-character intervals.
- Large-text toggle: `Semantics(label: "Enable larger text throughout the app", toggled:)`.
- Caregiver mode toggle: `Semantics(label: "Enable caregiver-assisted check-in mode", toggled:)`.
- Focus order: back -> headline -> text field -> (Gloria prompts if visible) -> CTA.

---

## ONB-005: Primary Health Concerns

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-005 |
| **Name** | Primary Health Concerns |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-004 |
| **Entry points** | ONB-004 ("Continue") |
| **Exit points** | ONB-006 ("Continue" or "Skip for now") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** Top-left -> ONB-004
3. **Progress indicator:** ~20% filled
4. **Headline:** "What's been going on?" — `type.h1`, `neutral.textPrimary`.
5. **Subtext:** "Select everything that applies. This helps us personalize your experience." — `type.body`, `neutral.textSecondary`. 8dp below.
6. **SymptomChipGrid:** Full component from design system (1.2). Shows core symptoms (9 chips) in 2-3 rows. "Show more" expands to reveal extended symptoms (10 additional chips). Persona-sensitive ordering (see flow doc).
   - Horizontal padding: `space.lg`. Chip gap: `space.sm` (8dp).
   - Chips use `FilterChip` with outlined style (unselected) and filled style with checkmark (selected).
7. **"Other" text field:** Appears when "Other" chip is selected. 100 char max. `space.md` below chip grid.
8. **Selection counter:** "{n} selected" — `type.caption`, `neutral.textSecondary`. Right-aligned below chip grid.
9. **Spacer:** Flexible
10. **Primary CTA:** "Continue" — full-width `FilledButton`. Enabled when >= 1 chip selected. `brand.primary`.
11. **Skip link:** "Skip for now" — `type.label`, `neutral.textSecondary`, center-aligned. `space.md` below CTA.
12. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `health_concerns` | List<String> | Min 1 selection (if not skipping) | No (skippable) |
| `health_concerns_other` | String | Max 100 chars | No |

### Conditional Logic

- Chip ordering adapts based on persona inference signals (see flow doc section 5).
- "Show more" expansion is animated (slide-down, 250ms) per `ConditionalSection` component behavior.

### States

| State | Behavior |
|-------|----------|
| **Empty** | All chips unselected. CTA disabled. Skip link visible. |
| **Selecting** | Chips toggle on tap with scale animation (150ms) and haptic (light impact). Counter updates. |
| **Valid** | >= 1 chip selected. CTA enabled. |
| **Expanded** | "Show more" tapped — additional chips slide in. "Show more" becomes "Show less." |

### Accessibility

- Each chip: `Semantics(label: "{concern name}", selected: bool)`. Follows `SymptomChipGrid` spec (design system 1.2).
- Selection count announced on change: "{n} health concerns selected."
- "Show more" button: `Semantics(label: "Show more health concerns. {count} more available.")`.
- Skip link: `Semantics(label: "Skip for now. You can add health concerns later in Settings.")`.
- In large-text mode: chips stack to single column if needed, per design system spec.
- **Gloria consideration:** Chip text uses `type.label` (14sp standard, 18sp large-text). Touch targets are 40dp height minimum per chip, 48dp in large-text mode.
- **Julie consideration:** Chip ordering puts appearance-related concerns (hair, skin, bloating, breakouts) first.

---

## ONB-006: Diagnosis Entry (Initial)

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-006 |
| **Name** | Diagnosis Entry (Initial) |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-005 |
| **Entry points** | ONB-005 ("Continue" or "Skip") |
| **Exit points** | ONB-007 ("Continue", "Skip for now", or "No diagnoses") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> ONB-005
3. **Progress indicator:** ~30%
4. **Headline:** "Do you have any diagnoses?" — `type.h1`.
5. **Subtext:** "Select any conditions you've been diagnosed with. It's okay if you don't have a diagnosis — many people start tracking before they have one." — `type.body`, `neutral.textSecondary`.
6. **Quick-tap diagnosis chips:** Pre-populated common diagnoses (see flow doc step 6). Displayed as large, tappable cards rather than small chips — each 64dp height, full width, with the diagnosis name and a checkbox.
   - Hypothyroidism
   - Hashimoto's thyroiditis
   - Hyperthyroidism / Graves'
   - Insulin resistance / prediabetes
   - Type 2 diabetes
   - PCOS
   - Anemia / iron deficiency
   - Vitamin D deficiency
7. **"I don't have a diagnosis (yet)" option:** Styled differently — outlined card, `neutral.surfaceAlt` background. Mutually exclusive with the diagnosis cards above (selecting this deselects all diagnoses).
8. **"I'm not sure" option:** Same styling as above. Also mutually exclusive with diagnoses.
9. **Diagnosis detail expansion:** When a diagnosis is tapped, it expands (ConditionalSection, 250ms) to show:
   - "When were you diagnosed?" — QuickSelectRow: < 6 months, 6mo-1yr, 1-3 years, 3-5 years, 5+ years, Not sure
   - "Currently being treated?" — QuickTapSelector: Yes, No, Not sure
10. **Spacer:** Flexible
11. **Primary CTA:** "Continue" — enabled when at least one option is selected (including "no diagnosis" or "not sure").
12. **Skip link:** "Skip for now"
13. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `diagnoses` | List<DiagnosisEntry> | — | No (skippable) |
| `diagnosis_entry.name` | String | From predefined list or custom | Per entry |
| `diagnosis_entry.duration` | Enum | One of 6 options | No |
| `diagnosis_entry.currently_treated` | Enum | Yes / No / Not sure | No |
| `no_diagnosis` | Boolean | Mutually exclusive with diagnoses | — |
| `not_sure` | Boolean | Mutually exclusive with diagnoses | — |

### Conditional Logic

- Selecting "I don't have a diagnosis" or "I'm not sure" deselects all diagnosis cards and collapses any expanded detail sections.
- Selecting any diagnosis card deselects "no diagnosis" and "not sure."
- Expanded diagnosis details maintain state when collapsed and re-expanded.

### States

| State | Behavior |
|-------|----------|
| **Empty** | No selections. CTA disabled. |
| **Selected** | One or more diagnoses selected, detail sections expandable. CTA enabled. |
| **No diagnosis** | "No diagnosis" or "Not sure" selected. CTA enabled. |
| **Loading** | N/A (all client-side). |

### Accessibility

- Each diagnosis card: `Semantics(label: "{diagnosis name}", selected: bool, button: true)`.
- Expanded detail: announced as "Additional details for {diagnosis}."
- QuickSelectRow for duration: follows `QuickSelectRow` spec (design system 1.17).
- QuickTapSelector for treatment: follows `QuickTapSelector` spec (design system 1.3).
- **Gloria consideration:** Diagnosis cards are 64dp height minimum with `type.body` text. Touch targets generous.
- **Julie consideration:** "I don't have a diagnosis (yet)" is visually prominent and de-stigmatized.

---

## ONB-007: Current Medications Setup

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-007 |
| **Name** | Current Medications Setup |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-006 |
| **Entry points** | ONB-006 ("Continue" or "Skip") |
| **Exit points** | ONB-008 ("Continue", "Skip for now", or "No medications") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> ONB-006
3. **Progress indicator:** ~40%
4. **Headline:** "What medications are you taking?" — `type.h1`.
5. **Subtext:** "We'll use this to track timing patterns that affect how you feel." — `type.body`, `neutral.textSecondary`.
6. **Quick-add common medications:** Row of tappable cards for common thyroid medications:
   - Levothyroxine (Synthroid)
   - Liothyronine (Cytomel)
   - NP Thyroid / Armour
   - Methimazole
   Each card: 56dp height, medication name + brief description ("T4 replacement"), outlined style. Tapping adds it to the medication list below and opens the detail form.
7. **Medication list:** Each added medication appears as a `MedicationCard` (design system 1.5) showing:
   - Medication name
   - Dosage field: numeric input + unit selector (mcg, mg, IU)
   - Frequency: QuickTapSelector (Once daily, Twice daily, Weekly, As needed)
   - Typical timing: QuickTapSelector (Morning, Afternoon, Evening, Bedtime)
   - With food: QuickTapSelector (Empty stomach, With food, Doesn't matter)
   - Remove button (trash icon, top-right of card)
8. **"Add another medication" button:** Outlined button, `brand.primary` text, full width. Opens a search field for medication name autocomplete.
9. **Search field (when "Add another" is tapped):** Search input with autocomplete dropdown from medication database.
10. **Spacer:** Flexible
11. **Primary CTA:** "Continue"
12. **Skip link:** "I'm not on any medications" / "Skip for now"
13. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `medications` | List<MedicationEntry> | — | No (skippable) |
| `medication.name` | String | From database or custom entry | Per entry |
| `medication.dosage` | String | Numeric + unit | No |
| `medication.frequency` | Enum | Once daily / Twice / Weekly / As needed | No |
| `medication.timing` | Enum | Morning / Afternoon / Evening / Bedtime | No |
| `medication.with_food` | Enum | Empty stomach / With food / Doesn't matter | No |

### Conditional Logic

- If user entered thyroid diagnoses in ONB-006, the quick-add thyroid medications row is prominent.
- If user entered "no diagnosis" or "not sure," the quick-add row is still shown but with explanatory text: "Even without a diagnosis, you may be taking some of these."

### States

| State | Behavior |
|-------|----------|
| **Empty** | Quick-add row visible, no medications in list. CTA enabled (can proceed with no meds). |
| **Adding** | Search field open, autocomplete dropdown showing results. |
| **Populated** | One or more medication cards in list. Each is expandable/collapsible. |
| **Error — search** | "No results found. Type the full name to add a custom medication." |

### Accessibility

- MedicationCard follows design system 1.5 accessibility spec.
- Search field: `Semantics(label: "Search for a medication", textField: true)`.
- Autocomplete results: each announced as "{medication name}. Tap to add."
- Remove button: `Semantics(label: "Remove {medication name}")`.
- **Gloria consideration:** Medication entry is critical for this persona. The interface is deliberately generous with space and labels. Each field label is always visible (not floating/collapsing).
- **Julie consideration:** "I'm not on any medications" is a normal, non-stigmatized option.

---

## ONB-008: Current Supplements Setup

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-008 |
| **Name** | Current Supplements Setup |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-007 |
| **Entry points** | ONB-007 ("Continue" or "Skip") |
| **Exit points** | ONB-009 (if cycle tracking applicable) or ONB-010; "Skip for now" |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> ONB-007
3. **Progress indicator:** ~50%
4. **Headline:** "Any supplements?" — `type.h1`.
5. **Subtext:** "Some supplements interact with thyroid medication. We'll help you track timing." — `type.body`, `neutral.textSecondary`.
6. **Common supplements grid:** `SymptomChipGrid`-style multi-select chips for common supplements:
   - Vitamin D, Iron / Ferritin, Selenium, Zinc, B12 / B-complex, Magnesium, Vitamin C, Omega-3, Probiotics, DIM, Ashwagandha, CoQ10, Biotin
   - Chips arranged in a wrap grid. `space.sm` gap.
7. **Detail expansion for selected supplements:** When a supplement chip is selected, a `ConditionalSection` slides in below the grid showing:
   - Dosage (optional): free text field, e.g., "2000 IU" — `FreeTextField` variant, 50 char max
   - Timing: QuickTapSelector (Morning, Afternoon, Evening, With meals)
   - These detail fields are per-supplement and appear in a scrollable list below the chip grid.
8. **"Add custom supplement" link:** Text link below chip grid. Opens a free text field.
9. **Spacer:** Flexible
10. **Primary CTA:** "Continue"
11. **Skip link:** "I don't take supplements" / "Skip for now"
12. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `supplements` | List<SupplementEntry> | — | No (skippable) |
| `supplement.name` | String | From predefined or custom | Per entry |
| `supplement.dosage` | String | Free text, max 50 chars | No |
| `supplement.timing` | Enum | Morning / Afternoon / Evening / With meals | No |

### Conditional Logic

- Supplement detail sections only appear for selected chips.
- If many supplements are selected (> 5), the detail section becomes a scrollable list to avoid pushing the CTA off-screen.

### States

| State | Behavior |
|-------|----------|
| **Empty** | No chips selected. CTA enabled (can skip). |
| **Selecting** | Chips toggle with standard chip animation. Detail sections expand. |
| **Many selected** | Detail section scrollable within a constrained height (max 40% of screen). |

### Accessibility

- Follows `SymptomChipGrid` accessibility (design system 1.2).
- Detail fields per supplement: `Semantics(label: "{supplement name} dosage" / "{supplement name} timing")`.
- **Gloria consideration:** In large-text mode, chips stack to single column. Detail fields are generously sized.
- **Julie consideration:** Supplement list is non-judgmental. No implied "you should be taking these."

---

## ONB-009: Cycle Tracking Opt-In

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-009 |
| **Name** | Cycle Tracking Opt-In |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-008 |
| **Entry points** | ONB-008 (when cycle tracking is applicable) |
| **Exit points** | ONB-010 (opted in with dates, opted out, or "doesn't apply") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> ONB-008
3. **Progress indicator:** ~60%
4. **Headline:** "Your cycle affects your thyroid more than you might think." — `type.h1`.
5. **Educational bullets:** Three brief points explaining the cycle-thyroid connection. Each bullet: teal circle icon (`brand.primary`) + text in `type.body`. Vertical gap: `space.md`.
   - "Estrogen levels directly influence how much thyroid hormone is available to your cells"
   - "Symptoms that worsen before your period may be driven by estrogen dominance, not just PMS"
   - "Tracking your cycle alongside your symptoms reveals patterns invisible otherwise"
6. **Options section:** `space.xl` below bullets. Three tappable cards, each 64dp height:
   - **"Yes, track my cycle"** — `brand.primary` left border accent, filled checkbox when selected. Selecting this reveals the date/length inputs below.
   - **"Not right now"** — neutral styling. Selectable.
   - **"This doesn't apply to me"** — neutral styling. Selectable.
7. **Cycle details (conditional):** Visible only when "Yes" is selected. `ConditionalSection`, 250ms slide-in.
   - "When did your last period start?" — Date picker. Default: today. Styled as a tappable row showing the selected date.
   - "How long is your typical cycle?" — Number stepper, range 20-45, default 28. Include "Irregular / not sure" toggle that hides the stepper.
8. **Spacer:** Flexible
9. **Primary CTA:** "Continue" — enabled when any option is selected.
10. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `cycle_tracking_enabled` | Boolean | — | Yes (one of 3 options) |
| `last_period_date` | Date | Not in the future | If opted in |
| `typical_cycle_length` | Int | 20-45 | If opted in and not irregular |
| `cycle_irregular` | Boolean | — | No |

### Conditional Logic

- This entire screen is skipped if no cycle-relevant signals were detected (see flow doc step 9).
- Selecting "Yes" expands the date/length section.
- Selecting "Not right now" or "Doesn't apply" collapses any expanded section.

### States

| State | Behavior |
|-------|----------|
| **Default** | Three options visible, none selected, CTA disabled. |
| **Opted in** | "Yes" selected, date/length section visible, CTA enabled. |
| **Opted out** | "Not right now" or "Doesn't apply" selected, CTA enabled. |

### Accessibility

- Educational bullets: each is a separate `Semantics` node with full text.
- Option cards: `Semantics(label: "{option text}", selected: bool, button: true)`.
- Date picker: `Semantics(label: "Last period start date. Currently {date}. Tap to change.")`.
- Cycle length stepper: `Semantics(label: "Typical cycle length. {value} days. Use plus and minus to adjust.")`.
- **Julie consideration:** Framing is body-literacy focused, not clinical. "Understanding your cycle is like having a cheat code for how you feel" (adjusted for Julie persona signal).
- **Gloria consideration:** If cycle tracking doesn't apply (post-menopausal), this screen is skipped entirely. If shown, "This doesn't apply to me" is prominent.

---

## ONB-010: Notification Preferences

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-010 |
| **Name** | Notification Preferences |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | ONB-009 or ONB-008 |
| **Entry points** | ONB-009 or ONB-008 (if cycle screen was skipped) |
| **Exit points** | ONB-011 ("Continue" or "Skip for now") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> previous screen
3. **Progress indicator:** ~70%
4. **Headline:** "When should we check in?" — `type.h1`.
5. **Subtext:** "Set your ideal times. You can adjust these anytime." — `type.body`, `neutral.textSecondary`.
6. **Notification settings list:** Card-style list with toggle and time picker per row.
   - **Morning check-in reminder:** Toggle (default: on) + time picker (default: 7:30 AM, 9:00 AM for Julie persona). Row height: 72dp.
   - **Evening check-in reminder:** Toggle (default: on) + time picker (default: 8:30 PM, 10:00 PM for Julie persona). Row height: 72dp.
   - **Medication reminders:** Toggle (default: on if medications were entered in ONB-007, off otherwise). No time picker (uses medication timing from ONB-007).
   - **Pattern alerts:** Toggle (default: on). Description: "When we find something meaningful in your data."
   - **Positive reinforcement:** Toggle (default: on). Description: "Streaks, milestones, and encouragement."
7. **Location section:** `space.xl` below notification settings. Card with:
   - Headline: "Weather tracking" — `type.h3`.
   - Subtext: "Weather affects how thyroid patients feel. Share your location so we can track this automatically."
   - Zip code field: 5-digit numeric input. OR "Use my location" button (requests location permission).
   - "Skip" text link.
8. **Spacer:** Flexible
9. **Primary CTA:** "Continue"
10. **Skip link:** "Use defaults" (applies all default values and continues)
11. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `morning_reminder_enabled` | Boolean | — | No (default: true) |
| `morning_reminder_time` | Time | Valid time | No (default: 7:30 AM) |
| `evening_reminder_enabled` | Boolean | — | No (default: true) |
| `evening_reminder_time` | Time | Valid time | No (default: 8:30 PM) |
| `medication_reminders_enabled` | Boolean | — | No |
| `pattern_alerts_enabled` | Boolean | — | No (default: true) |
| `positive_reinforcement_enabled` | Boolean | — | No (default: true) |
| `zip_code` | String | 5 digits | No |
| `location_coordinates` | LatLng | Valid coordinates | No |

### Conditional Logic

- Medication reminders toggle only appears if medications were entered in ONB-007.
- Time pickers use the platform's native time picker (Material on Android, Cupertino on iOS).
- "Use my location" triggers the platform location permission dialog. If denied, show: "No problem. Enter your zip code instead, or skip this."

### States

| State | Behavior |
|-------|----------|
| **Default** | All defaults applied. CTA enabled. User can adjust or proceed. |
| **Adjusting** | Time pickers open inline or as bottom sheet. Toggles animate. |
| **Location granted** | "Use my location" button replaced with "Location saved" checkmark + city name if resolvable. |
| **Location denied** | Zip code field becomes primary input. "Use my location" dimmed with "Permission denied" note. |

### Accessibility

- Each toggle: `Semantics(label: "{notification type}", toggled: bool)`.
- Time pickers: `Semantics(label: "{notification type} time. Currently {time}. Tap to change.")`.
- Zip code field: `Semantics(label: "Zip code for weather tracking", textField: true)`.
- **Gloria consideration:** Notification descriptions are clear and jargon-free. Large touch targets on toggles.
- **Julie consideration:** Defaults shifted later in the day (9 AM / 10 PM).

---

## ONB-011: Book Connection (Chapter Linking)

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-011 |
| **Name** | Book Connection (Chapter Linking) |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | ONB-010 |
| **Entry points** | ONB-010 ("Continue" or "Skip") |
| **Exit points** | ONB-012 ("Continue") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> ONB-010
3. **Progress indicator:** ~80%
4. **Book cover image:** Small book cover thumbnail, centered, 120dp height. If no asset available, use a placeholder icon (`Icons.menu_book`, `icon.xl`, `brand.accent`).
5. **Headline:** "Have you read The Hypothyroidism Cheat Code?" — `type.h1`.
6. **Options:** Four tappable cards, stacked vertically, `space.md` gap. Each card: 56dp height, full width, outlined style with left icon and right radio indicator.
   - "Yes, I've read it" — Book icon, `brand.primary` accent on select
   - "I'm reading it now" — Open book icon
   - "No, but I'm interested" — Sparkle/interest icon
   - "No thanks" — Neutral
7. **Contextual text (conditional):** Appears below the selected option.
   - "Read it": "Great! We'll link insights to specific chapters as you track."
   - "Reading": "Perfect! We'll suggest relevant chapters as patterns emerge."
   - "Interested": Brief description + "Learn more" link (external). "The book explains the metabolic framework this app is built on."
   - "No thanks": "No problem. You'll still get all the intelligence and pattern detection."
8. **Spacer:** Flexible
9. **Primary CTA:** "Continue" — enabled when any option is selected.
10. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `book_connection` | Enum: read, reading, interested, not_interested | One selection | Yes (one of 4) |

### Conditional Logic

- Contextual text changes based on selection.
- "Learn more" link for the "interested" option opens an external browser or in-app webview.

### States

| State | Behavior |
|-------|----------|
| **Default** | Four options visible, none selected, CTA disabled. |
| **Selected** | One option selected (radio-style, single select), contextual text visible, CTA enabled. |

### Accessibility

- Each option card: `Semantics(label: "{option text}", selected: bool, button: true)`.
- Contextual text: announced when it appears (`liveRegion: true`).
- Book cover: `Semantics(label: "The Hypothyroidism Cheat Code book cover")` or `excludeFromSemantics: true` if placeholder.
- Focus order: back -> headline -> option 1 -> option 2 -> option 3 -> option 4 -> contextual text -> CTA.

---

## ONB-012: Privacy & Data Consent

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-012 |
| **Name** | Privacy & Data Consent |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-011 |
| **Entry points** | ONB-011 ("Continue") |
| **Exit points** | ONB-013 ("I Agree") |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **Back button:** -> ONB-011
3. **Progress indicator:** ~90%
4. **Shield icon:** `Icons.shield_outlined`, `icon.xl` (48dp), `brand.primary` color. Centered.
5. **Headline:** "Your data, your control." — `type.h1`, centered.
6. **Privacy points list:** Five bullet points, each with a checkmark icon (`Icons.check_circle_outline`, `brand.primary`, `icon.sm`) and text in `type.body`. Vertical gap: `space.md`.
   - "Your health data is encrypted at rest and in transit"
   - "We never sell your data or share it with advertisers"
   - "You control who sees your data — including your doctor"
   - "You can export or delete your data at any time"
   - "Anonymous research participation is optional and always separate"
7. **Consent toggles section:** `space.xl` below privacy points. Card with `neutral.surfaceAlt` background, `radius.md`.
   - **Required toggle:** "I agree to the Terms of Service and Privacy Policy" — toggle/checkbox, default off. "Terms of Service" and "Privacy Policy" are tappable links (underlined, `brand.primary`).
   - **Optional toggle:** "I consent to anonymized data being used for thyroid health research" — toggle/checkbox, default off. `space.md` below required toggle. Description text: "Optional. Your data would be stripped of all identifying information."
8. **Spacer:** Flexible
9. **Primary CTA:** "I Agree" — full-width `FilledButton`. **Disabled until the required Terms toggle is checked.** `brand.primary` when enabled.
10. **Bottom padding:** `space.xxl` + safe area

### Data Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `terms_accepted` | Boolean | Must be true to proceed | Yes |
| `terms_accepted_at` | DateTime | Auto-captured | Auto |
| `research_opted_in` | Boolean | — | No (default: false) |

### Conditional Logic

- CTA is disabled (grayed out) until the Terms toggle is checked.
- Research toggle is independent — user can agree to Terms without opting into research.
- Tapping "Terms of Service" or "Privacy Policy" links opens the document in an in-app webview or external browser.

### States

| State | Behavior |
|-------|----------|
| **Default** | Both toggles off. CTA disabled. |
| **Terms accepted** | Required toggle on. CTA enabled. Research toggle still off (that's fine). |
| **Both accepted** | Both toggles on. CTA enabled. |
| **Viewing terms** | In-app webview or external browser opens. User returns to this screen. Toggle state preserved. |

### Accessibility

- Privacy points: each bullet is a separate `Semantics` node.
- Required toggle: `Semantics(label: "Required. I agree to the Terms of Service and Privacy Policy.", toggled: bool)`.
- Optional toggle: `Semantics(label: "Optional. I consent to anonymized data being used for thyroid health research.", toggled: bool)`.
- CTA disabled state: `Semantics(label: "I Agree, disabled. Accept the Terms of Service to continue.")`.
- Links: `Semantics(label: "Terms of Service, link" / "Privacy Policy, link")`.
- **Gloria consideration:** Toggle targets are generous (56dp row height). Link text is underlined and high contrast.
- **Julie consideration:** Privacy messaging is straightforward and reassuring, not legalese-heavy.

---

## ONB-013: Onboarding Complete / First Check-in Prompt

| Property | Value |
|----------|-------|
| **Screen ID** | ONB-013 |
| **Name** | Onboarding Complete / First Check-in Prompt |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | ONB-012 |
| **Entry points** | ONB-012 ("I Agree") |
| **Exit points** | JRM-001 (Morning Check-in) or JRE-001 (Evening Check-in) |

### Layout (top to bottom)

1. **Top padding:** `space.xxl` + safe area
2. **No back button.** Onboarding is complete.
3. **Celebration icon:** Animated checkmark or abstract celebration illustration, centered, 120dp. Uses `brand.accent` color. Animation: scale from 0 to 1.0 with spring curve (300ms). Static checkmark in reduced-motion mode.
4. **Mirror text (personalized):** Dynamic text block generated from ONB-005 and ONB-006 data. Typography: `type.h2` for the first line, `type.body` for the rest. Color: `neutral.textPrimary`. Left-aligned, `space.lg` horizontal padding.

   *If health concerns were entered:*
   > "{Display name}, you told us you're dealing with {top 2-3 concerns formatted as comma-separated list}. {If diagnosis: "You've been managing {diagnosis} for {duration}."} You're not imagining it, and you're not alone. Let's start building the record that proves what you're experiencing is real."

   *If health concerns were skipped:*
   > "{Display name}, you're here because something doesn't feel right. That instinct matters. Let's start tracking and let the data tell the story."

5. **What to expect section:** `space.xl` below mirror text. Four brief lines, each with a small icon and text:
   - Clock icon: "Your first check-in takes about 2 minutes"
   - Calendar icon: "After a week, patterns start to emerge"
   - Chart icon: "After a month, you'll have data your doctor has never seen"
   - Shield icon: "Everything stays private unless you choose to share"
6. **Spacer:** Flexible
7. **Primary CTA:** Time-based routing.
   - Before 2 PM: "Start Your Morning Check-in" — full-width `FilledButton`, `brand.accent` background, white text.
   - 2 PM or later: "Start Your Evening Check-in" — same styling.
   CTA size: 56dp height, prominent placement.
8. **Bottom padding:** `space.xxl` + safe area

### Data Fields

None entered on this screen. This screen reads data from the onboarding profile to generate the mirror text.

### Conditional Logic

- Mirror text content is dynamically generated based on:
  - `health_concerns` from ONB-005 (top 2-3 selected)
  - `diagnoses` from ONB-006 (name and duration)
  - `display_name` from ONB-004
- CTA text and destination depend on current time of day:
  - Before 14:00 local time -> JRM-001
  - 14:00 or later -> JRE-001
- If health concerns are empty AND diagnoses are empty, use the generic mirror text.

### States

| State | Behavior |
|-------|----------|
| **Default** | Mirror text, what-to-expect, and CTA visible. Celebration animation plays once. |
| **Reduced motion** | Static checkmark, no animation. All content visible immediately. |

### Accessibility

- Celebration icon: `excludeFromSemantics: true` (decorative).
- Mirror text: `Semantics(liveRegion: true)` — announced in full when screen loads.
- What-to-expect items: each is a separate `Semantics` node with icon label + text.
- CTA: `Semantics(label: "Start your {morning/evening} check-in. This takes about 2 minutes.")`.
- **Gloria consideration:** Mirror text uses warm, validating language. Large-text mode ensures readability. No time pressure — the CTA is always visible without scrolling.
- **Julie consideration:** Mirror text avoids clinical framing. "You're not imagining it" is the key emotional beat. The tone is empowering, not pathologizing.

---

*End of Onboarding Screen Specifications v1.0*
