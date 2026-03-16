# Evening Check-in Screen Specs

**Version:** 1.0
**Last updated:** 2026-03-16
**Screen IDs:** JRE-001 through JRE-019
**PRD sections:** 4.3, 3A.2, 7.2, 15.2-15.3, 4.5
**Flow doc:** `flows/evening-checkin.md`
**Design system:** `01-design-system.md`

---

## Shared Patterns

All evening check-in screens share these characteristics:

- **Layout:** Single-column scrollable content within a card container. Cards use `padding.cardInternal` (16dp) with `radius.card` (12dp) corners.
- **Progress:** ProgressStepper (Component 1.11) pinned to top of screen. Steps: Energy, Bloating/Body, Symptoms, Mood, Lifestyle, Sleep, (PMS if active), Summary.
- **Navigation:** Back arrow returns to previous card. Android back button triggers save-or-discard (MOD-011). Swipe-left-to-advance is disabled (prevents accidental skips).
- **Cycle badge:** CycleDayBadge (Component 1.12) in app bar when cycle tracking is active.
- **Skip:** Every card has a "Skip" text button at bottom-right that advances to the next card without recording data for that section.
- **Auto-save:** Field values are persisted to local draft on each change. No data loss on app background.
- **Typography:** Section titles use `type.sectionHeader` (18sp semibold). Field labels use `type.fieldLabel` (14sp medium). Values use `type.valueDisplay` (24sp bold for slider current values).

---

## JRE-001: Evening Check-in Entry

**Screen ID:** JRE-001
**Priority:** P0
**Phase:** 1
**Parent:** HOM-001 CTA, MOD-007 notification, NAV-001 journal tab

### Layout

| Zone | Content |
|------|---------|
| App bar | "Evening Check-in" title, close (X) button, CycleDayBadge (if active) |
| Greeting area | Personalized greeting, date, weather note |
| Morning reference | Compact summary of this morning's key metrics |
| CTA area | "Begin Check-in" primary button, "Same as Yesterday" secondary button (if 14+ days) |

### Content

**Greeting:** "Good evening, {displayName}" in `type.heading2` (24sp). Below: "{Day of week}, {Month Day}" in `type.body` (16sp). Weather auto-note in `type.caption` (12sp, `color.textSecondary`): "{temperature}, {condition}".

**Morning reference card** (if morning check-in exists today):
- Compact horizontal row: "This morning: Energy {n}/10 | Brain fog {n}/10 | Mood: {label}"
- Uses `color.surface` background, `radius.card` corners, `padding.cardInternal`
- If no morning entry: this section is hidden entirely

**Same-as-Yesterday (JRE-018 trigger):**
- Only visible after 14+ days of data
- Shows as a outlined secondary button below the primary CTA
- Label: "Similar to yesterday? Quick confirm"

### States

| State | Behavior |
|-------|----------|
| First visit (Day 1) | Welcome message: "Let's check in on how today went. This takes about 60 seconds." No SAY button. |
| Days 2-7 | Standard greeting. No SAY button. Brief helper text on first 3 visits. |
| Days 8-13 | Standard greeting. No SAY button. Helper text removed. |
| Day 14+ | Standard greeting. SAY button visible. |
| Morning not done | Morning reference section hidden. |
| Already completed today | Redirect to JRE-017 in edit mode with notice: "You already checked in tonight. Here's what you recorded." |

### Transitions

- "Begin Check-in" -> JRE-002 (slide left)
- "Similar to yesterday" -> JRE-018 (slide up as bottom sheet)
- Close (X) -> MOD-011 if draft exists, else HOM-001

### Accessibility

- Greeting is the first focusable element
- CycleDayBadge announces phase and day
- Morning reference is read as a single grouped element

---

## JRE-002: Card: Energy & Cognitive Review (Section A)

**Screen ID:** JRE-002
**Priority:** P0/P1/P2 mixed
**Phase:** 1
**Parent:** JRE-001

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Step 1 of N highlighted |
| Section header | SectionHeader: "Energy & Cognitive Review" |
| P0 fields | Energy pattern (QuickSelectRow), Overall energy (SliderCard) |
| P1 fields | Brain fog trajectory (QuickTapSelector), Concentration (SliderCard) |
| P2 field | Processing speed (QuickTapSelector) |
| Insight slot | InsightCard (JRE-019) if available — Phase 2 |
| Actions | "Next" primary button, "Skip section" text button |

### Field Specifications

**Energy pattern today** (P0)
- Component: QuickSelectRow (1.17), single-select
- Options: Steady | Morning crash | Afternoon crash | Multiple crashes | Steady decline | Low all day
- Default: None selected (Week 1). User's most frequent pattern pre-selected after Day 7.
- Scrollable row if options exceed screen width.

**Overall energy** (P0)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Depleted", highLabel = "Full energy"
- `previousValue`: Morning energy rating (ghost marker). If no morning entry, yesterday's evening energy.
- `showDelta: true` — displays "(Morning: {n}, change: {+/-delta})" below the slider when morning value exists.

**Brain fog trajectory** (P1)
- Component: QuickTapSelector (1.3)
- Options: Better | Same | Worse
- Visibility: Only shown if this morning's brain fog > 0. If morning check-in missing, hidden.
- Label includes morning context: "Brain fog was {n}/10 this morning"

**Concentration** (P1)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Can't focus", highLabel = "Sharp"
- `previousValue`: Yesterday's concentration score

**Processing speed** (P2)
- Component: QuickTapSelector (1.3)
- Options: Normal | Slow | Very slow
- Visibility: Collapsed under "More" after Week 3 if never selected. Accessible via SectionHeader expand.

### Adaptive Behavior

- Week 1: All 5 fields visible. Helper text under energy pattern: "Select the pattern that best describes your energy today."
- Week 2+: Helper text removed. Smart defaults active.
- Week 3+: If user has never changed processing speed from default, it collapses under "More cognitive details" expander.

### Transitions

- "Next" -> JRE-003 (slide left)
- "Skip section" -> JRE-003 (no data recorded for this card)
- Back arrow -> JRE-001

---

## JRE-003: Card: Bloating & Body Composition (Section B)

**Screen ID:** JRE-003
**Priority:** P0/P1 mixed
**Phase:** 1
**Parent:** JRE-002

This is the most complex card in the evening flow. It contains 6 direct fields plus 3 conditional branches that can trigger 3 additional screens (JRE-004, JRE-005, JRE-006).

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Step 2 of N highlighted |
| Section header | SectionHeader: "Bloating & Body" |
| Bloating group | Bloating slider, Bloating timing, Bloating location |
| Body group | Body feeling, Clothes fit, Water retention |
| Conditional zone A | JRE-004 + JRE-005 (bloating > 5) — inline ConditionalSection |
| Conditional zone B | JRE-006 (body feeling = heavier/swollen) — inline ConditionalSection |
| Actions | "Next" primary button, "Skip section" text button |

### Field Specifications

**Bloating today** (P0)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Flat/comfortable", highLabel = "Severely distended"
- `previousValue`: Yesterday's bloating score (ghost marker)
- `showDelta: true`
- **Trigger:** Value > 5 reveals Conditional Zone A (JRE-004, JRE-005). Value <= 5 hides it.

**Bloating timing** (P0)
- Component: QuickSelectRow (1.17), single-select
- Options: None | Morning | After meals | Afternoon | Evening | All day
- If bloating slider = 0, this field auto-selects "None" and is visually muted.

**Bloating location** (P1)
- Component: QuickTapSelector (1.3)
- Options: Upper abdomen | Lower abdomen | Full abdomen | Not sure
- Visibility: Shown at P1 depth. Collapsed under bloating group at P0.

**Body feeling today** (P0)
- Component: QuickSelectRow (1.17), single-select
- Options: Lighter than usual | About my baseline | Heavier/puffier than usual | Significantly swollen
- **Trigger:** "Heavier/puffier than usual" OR "Significantly swollen" reveals Conditional Zone B (JRE-006).

**Clothes fit** (P1)
- Component: QuickTapSelector (1.3)
- Options: Normal | Tighter than usual | Had to change outfit | Noticeably looser

**Water retention** (P1)
- Component: WaterRetentionSelector (1.19)
- Levels: None | Mild (fingers/ankles) | Moderate (face/hands/feet) | Severe (full body puffiness)

### Conditional Zone A: Bloating Triggers (JRE-004, JRE-005)

Revealed inline via ConditionalSection (1.4) animation when bloating > 5.

**JRE-004: Bloating Food Triggers** (P1)
- Divider line with label: "What might be contributing?"
- Component: SymptomChipGrid (1.2), multi-select
- Chips: Gluten | Dairy | Cruciferous vegetables | High-FODMAP foods | Processed food | Sugar/sweets | Large meal | Carbonated drinks | Nothing unusual
- `allowCustom: true` — user can type a custom food trigger
- FreeTextField (1.16): "Anything else?" (optional, 200 char max)

**JRE-005: Bloating Stress Trigger** (P1)
- Label: "Stress level in the last few hours?"
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Calm", highLabel = "Very stressed"
- Appears below JRE-004 food triggers in the same conditional block.

### Conditional Zone B: Body Distress (JRE-006)

Revealed inline via ConditionalSection (1.4) when body feeling = "Heavier/puffier" or "Significantly swollen".

**JRE-006: Body Distress Impact** (P1)
- Label: "How is this affecting your mood right now?"
- Component: QuickTapSelector (1.3)
- Options: Not bothered | Mildly frustrating | Really bothering me | Affecting my plans/confidence
- If "Affecting my plans/confidence" selected:
  - Inline supportive message in `color.textSecondary`, `type.caption` (12sp):
  - "Your feelings are valid. Body changes in hypothyroidism are real and measurable — this data helps you understand and explain what's happening."
  - This message uses a subtle `semantic.optimalBg` background tint to feel warm, not clinical.

### Interaction Sequence (Worst Case)

When both conditional zones fire (bloating = 8 AND body feeling = "Significantly swollen"):
1. User fills bloating slider (triggers Zone A reveal with 250ms animation)
2. User fills bloating timing and location
3. User scrolls down to food trigger chips (JRE-004) and selects
4. Stress trigger slider (JRE-005) visible below food chips
5. User fills body feeling (triggers Zone B reveal)
6. User scrolls to body distress impact (JRE-006) and selects
7. User fills clothes fit and water retention
8. Taps "Next"

The card auto-scrolls to bring newly revealed conditional sections into view.

### States

| State | Behavior |
|-------|----------|
| Bloating = 0 | Timing auto-selects "None" (muted). Location hidden. No conditionals. Minimal card. |
| Bloating 1-5 | Timing and location active. No bloating conditionals. Body feeling conditionals still possible. |
| Bloating 6-10 | Full card with food trigger and stress trigger conditionals. |
| Body = Lighter/Baseline | No body distress conditional. |
| Body = Heavier/Swollen | Body distress conditional visible. |
| Both triggers active | Both conditional zones visible. Card is at maximum length. Progress stepper shows sub-steps. |

### Accessibility

- Conditional sections announce "Additional questions available" when revealed
- Slider value changes announce the numeric value
- Supportive message in JRE-006 is a live region, read once on appearance
- All chip selections confirmed with haptic feedback

---

## JRE-007: Card: Physical Symptoms (Section C)

**Screen ID:** JRE-007
**Priority:** P0 (chips), P1 (conditionals, severity)
**Phase:** 1
**Parent:** JRE-003

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Step 3 of N highlighted |
| Section header | SectionHeader: "Physical Symptoms" |
| Chip grid | SymptomChipGrid with personalized ordering |
| Conditional sections | JRE-008 through JRE-011 (inline, per chip selection) |
| Severity block | JRE-013 (below chips if P1 enabled) |
| Free text | "Anything new or unusual?" FreeTextField |
| Actions | "Next" primary button, "Skip section" text button |

### Field Specifications

**Symptom chips** (P0)
- Component: SymptomChipGrid (1.2), multi-select
- Default chip set: Hair shedding, Skin changes, Nail changes, Joint pain, Muscle pain, Heart palpitations, Constipation, Acid reflux, Nausea, Bladder urgency, Headache, Swelling/puffiness, Cold extremities, Exercise intolerance, Dizziness, Yeast/candida signs, SIBO signs
- `maxVisibleRows: 2` — shows top ~8-10 chips by default. "Show more" expands to full list.
- After 7 days: chips reorder so user's most frequently selected appear in the visible rows.
- `allowCustom: true` — user can add a custom symptom.

**New/unusual symptoms** (P2)
- Component: FreeTextField (1.16)
- Hint: "Anything new or unusual?"
- `isOptional: true`, `maxLength: 200`

### Conditional Sections (Inline)

Each conditional section uses ConditionalSection (1.4) and appears directly below the chip grid when its trigger chip is selected.

**JRE-008: Palpitations - Resting HR Entry** (P1)
- Trigger: "Heart palpitations" chip selected
- Label: "Resting heart rate?"
- Numeric text field with bpm suffix. Keyboard type: numeric.
- Validation: 30-220 bpm range. Out-of-range shows warning.
- "Skip" link to proceed without entering HR.

**JRE-009: Hair Shedding Severity** (P1)
- Trigger: "Hair shedding" chip selected
- Component: QuickTapSelector (1.3)
- Options: Normal shedding | Noticeable increase | Significant clumps | Bald patches

**JRE-010: Candida Signs Detail** (P1)
- Trigger: "Yeast/candida signs" chip selected
- Component: SymptomChipGrid (1.2), multi-select
- Chips: Vaginal yeast infection | Oral thrush (white patches in mouth) | Cracked/red corners of mouth (angular cheilitis) | White-coated tongue | Mucus in stool | Skin rash/fungal patches | Nail fungus | Persistent itching

**JRE-011: SIBO Signs Detail** (P1)
- Trigger: "SIBO signs" chip selected
- Component: SymptomChipGrid (1.2), multi-select
- Chips: Excessive bloating/distension after eating | Excessive gas (belching or flatulence) | Abdominal pain/cramping after meals | Diarrhea | Constipation (methane-dominant SIBO) | Alternating diarrhea and constipation | Feeling full quickly/early satiety | Nausea after eating | Floating or greasy stools (fat malabsorption)

**Conditional ordering:** When multiple conditionals fire, they appear in the order listed above (palpitations, hair, yeast, SIBO). Each is separated by a subtle divider.

### JRE-013: Symptom Severity Sliders (P1)

- Trigger: P1 depth enabled AND at least one symptom chip selected
- For each selected chip, a compact SliderCard (1.1) appears:
  - Range: 0-10, `snapToInt: true`
  - Labels: lowLabel = "Mild", highLabel = "Severe"
  - `previousValue`: Yesterday's severity for that symptom (ghost marker)
- Header: "Rate severity (optional)" with "Skip all" text button
- Compact layout: reduced vertical spacing between sliders (`spacing.xs` = 4dp between items)
- Maximum of 6 severity sliders visible at once. If more than 6 symptoms selected, the first 6 most-frequent are shown with "Rate {n} more" expander.

### Accessibility

- Chip grid announces total count and selected count
- Conditional sections announce on reveal
- Severity sliders are grouped semantically: "Severity ratings for {n} symptoms"

---

## JRE-012: Conditional: Anxiety Physical Symptoms

**Screen ID:** JRE-012
**Priority:** P1
**Phase:** 1
**Parent:** JRE-014 (Mood & Stress card)

This is an inline conditional within the Mood & Stress card, not a separate screen. It appears when the anxiety slider exceeds 7.

### Content

- Trigger: Anxiety slider value > 7 in JRE-014
- Component: ConditionalSection (1.4) wrapping a SymptomChipGrid (1.2)
- Label: "Physical anxiety symptoms?"
- Chips: Racing heart | Tension | Digestive upset | Difficulty breathing | Insomnia
- Multi-select. No severity ratings.

### Accessibility

- Announced as "Additional questions available for anxiety" when revealed
- Chips follow standard SymptomChipGrid accessibility

---

## JRE-014: Card: Mood & Stress (Section D)

**Screen ID:** JRE-014
**Priority:** P0 (mood), P1 (anxiety, stress), P2 (irritability, motivation)
**Phase:** 1
**Parent:** JRE-007

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Step 4 of N highlighted |
| Section header | SectionHeader: "Mood & Stress" |
| P0 field | Overall mood (SliderCard + emotion label row) |
| P1 fields | Anxiety (SliderCard), Stress (SliderCard) |
| P2 fields | Irritability (QuickTapSelector), Motivation (SliderCard) |
| Conditional | JRE-012 (anxiety > 7) — inline |
| Actions | "Next" primary button, "Skip section" text button |

### Field Specifications

**Overall mood** (P0)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Very low", highLabel = "Great"
- `previousValue`: Yesterday's mood (ghost marker)
- Below slider: optional single-word emotion label row (QuickSelectRow, single-select): Calm, Anxious, Irritable, Sad, Neutral, Motivated, Hopeful. Selection is optional — adds qualitative context.

**Anxiety level** (P1)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Calm", highLabel = "Extreme anxiety"
- `previousValue`: Yesterday's anxiety
- **Trigger:** Value > 7 reveals JRE-012 inline.

**Stress level** (P1)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Relaxed", highLabel = "Overwhelmed"
- `previousValue`: Yesterday's stress

**Irritability** (P2)
- Component: QuickTapSelector (1.3)
- Options: None | Mild | Moderate | Severe
- Visibility: Collapsed under "More" after Week 3 if rarely used.

**Motivation** (P2)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "No motivation", highLabel = "Highly driven"
- Visibility: Collapsed under "More" after Week 3 if rarely used.

### Transitions

- "Next" -> JRE-015 if P1+ depth enabled, else skip to PMS check or JRE-017
- "Skip section" -> same routing as "Next"

---

## JRE-015: Card: Lifestyle Inputs (Section E)

**Screen ID:** JRE-015
**Priority:** P2/P3
**Phase:** 1
**Parent:** JRE-014
**Visibility:** Only shown if user's depth preference includes P2. Hidden entirely for P0-only users. After Week 3, collapsed if user has never interacted with any field in this section.

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Step 5 of N highlighted |
| Section header | SectionHeader: "Today's Inputs" with completion counter |
| Diet group | Meal composition chips, Meal timing |
| Activity group | Exercise |
| Context group | Stress events |
| Estrogen group | Fiber, Xenoestrogen, Liver support (P3 — collapsed) |
| Actions | "Next" primary button, "Skip section" text button |

### Field Specifications

**Meal composition highlights** (P2)
- Component: SymptomChipGrid (1.2), multi-select
- Chips: High protein | Selenium-rich | Cruciferous vegetables | Gluten | Dairy | Processed food | Sugar/sweets | Alcohol
- Pre-populated from today's photo food journal tags if available. Shows "(from food photos)" label when pre-filled.

**Meal timing** (P2)
- Component: QuickSelectRow (1.17), single-select
- Options: Regular intervals | Skipped meals | Late eating | Fasting

**Exercise** (P2)
- Component: QuickSelectRow (1.17), single-select for type: None | Light | Moderate | Intense
- If anything other than "None" selected, duration picker appears: QuickSelectRow with options 15 | 30 | 45 | 60 | 90 min

**Stress events** (P2)
- Component: FreeTextField (1.16)
- Hint: "Any notable stress today?"
- `isOptional: true`, `maxLength: 200`

**Fiber intake** (P2)
- Component: QuickTapSelector (1.3)
- Options: Low | Moderate | High

**Xenoestrogen exposure** (P3)
- Component: SymptomChipGrid (1.2), multi-select
- Chips: Plastics used | Conventional products | Non-organic produce
- Visibility: Hidden by default. Visible under "Estrogen factors" SectionHeader expander. Only auto-shown for users who enable estrogen dominance tracking in settings (STG-011).

**Liver support supplements** (P3)
- Component: SymptomChipGrid (1.2), multi-select
- Chips: DIM | Calcium-d-glucarate | Sulforaphane | None
- Visibility: Same as xenoestrogen — hidden by default, under "Estrogen factors" expander.

### Transitions

- "Next" -> JRE-016 if P1+ depth, else -> PMS check or JRE-017
- "Skip section" -> same routing

---

## JRE-016: Card: Sleep Preparation (Section F)

**Screen ID:** JRE-016
**Priority:** P1/P2
**Phase:** 1
**Parent:** JRE-015
**Visibility:** Only shown if user's depth preference includes P1+. Collapsed after Week 3 if never used.

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Step 6 of N highlighted |
| Section header | SectionHeader: "Sleep Preparation" |
| P1 field | Sleep readiness (SliderCard) |
| P2 fields | Caffeine after 2pm (QuickTapSelector + time), Screen time (QuickTapSelector) |
| Actions | "Next" primary button, "Skip section" text button |

### Field Specifications

**Sleep readiness** (P1)
- Component: SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Wide awake", highLabel = "Ready to sleep"
- `previousValue`: Yesterday's sleep readiness

**Caffeine after 2pm** (P2)
- Component: QuickTapSelector (1.3)
- Options: No | Yes
- If "Yes": time picker appears (hour:minute, constrained to 2pm-midnight)

**Screen time before bed** (P2)
- Component: QuickTapSelector (1.3)
- Options: None | <30 min | 30-60 min | >1 hour

### Transitions

- "Next" -> CYC-004 (PMS card) if in PMS window, else -> food check / JRE-017
- "Skip section" -> same routing

---

## JRE-017: Evening Check-in Summary / Save

**Screen ID:** JRE-017
**Priority:** P0
**Phase:** 1
**Parent:** JRE-016 (or last active card in the flow)

### Layout

| Zone | Content |
|------|---------|
| ProgressStepper | Final step highlighted |
| Header | "Evening Summary" title |
| Summary sections | Read-only compact display of all recorded values, grouped by card |
| Anomaly flags | Highlighted values that differ significantly from baseline |
| Delta section | Morning-to-evening changes |
| Food journal check | Inline prompt about food photos |
| Streak | Journaling streak indicator |
| Actions | "Save" primary button (full width), "Edit" per-section icon buttons |

### Content Details

**Summary sections:** Each card's data displayed as a compact key-value list. Only fields with recorded values are shown. Skipped sections show "Skipped" in `color.textTertiary`.

Format per section:
```
Energy & Cognitive
  Energy pattern: Afternoon crash
  Overall energy: 4/10 (morning: 5, -1)
  Brain fog: Worse
  Concentration: 5/10
```

**Anomaly flags:** Any value that deviates by >= 3 points from the user's 7-day rolling average gets a subtle highlight (left border in `semantic.caution` color) and a note: "Bloating 8/10 (your average is 4.2)".

**Morning-to-evening delta row:** Compact horizontal row showing changes:
- Energy: 5 -> 4 (down arrow, `semantic.caution`)
- Mood: 6 -> 5 (down arrow)
Only shown for metrics captured in both morning and evening.

**Food journal check:**
- If food photos exist today: "{n} meals captured" with thumbnail strip. "Add more" link -> PHF-001.
- If no food photos: "Capture today's meals?" with camera icon link -> PHF-001. "Skip" dismisses.

**Streak indicator:** "{n}-day streak" in `brand.accent` color with flame icon. Only positive framing (Section 3A.3 Strategy 5). If streak = 0 or 1, this section is hidden.

### Actions

- **"Save Evening Check-in"** — Full-width primary button in `brand.primary`. On tap: haptic confirmation, data committed, intelligence layer processing triggered.
- **Edit buttons** — Small icon button (pencil) next to each section header. Tapping navigates back to that specific card with all other data preserved.

### Post-Save

1. Haptic confirmation (light impact)
2. If streak milestone (7, 14, 30, 60, 90 days): MOD-015 toast appears
3. If JRE-019 insight available: transition to insight display (1 second auto-advance, or tap to proceed)
4. Route to HOM-001

### Accessibility

- Summary is read as a structured list, section by section
- Anomaly flags are announced as warnings
- Save button is the primary action and receives focus after content review

---

## JRE-018: Same-as-Yesterday Quick Confirm

**Screen ID:** JRE-018
**Priority:** P1
**Phase:** 1
**Parent:** JRE-001
**Condition:** Only available after 14+ days of baseline data.

### Layout

Presented as a bottom sheet over JRE-001.

| Zone | Content |
|------|---------|
| Header | "Yesterday's Evening Check-in" |
| Summary | Compact read-only display of yesterday's evening values |
| Diff controls | Each value has a tap-to-edit affordance |
| Actions | "Confirm - Same Today" primary button, "Edit differences" text button, "Start fresh" text button |

### Behavior

- Displays yesterday's recorded values in the same compact format as JRE-017 summary.
- Each field is tappable. Tapping a field enters inline edit mode (slider or selector appears in-place).
- "Confirm - Same Today" copies yesterday's values to today and saves immediately.
- "Edit differences" opens the full flow (JRE-002) with yesterday's values pre-filled as defaults.
- "Start fresh" opens the full flow with standard smart defaults (not yesterday's values).

**Estimated time:** ~15-20 seconds for "mostly the same" days.

### Accessibility

- Bottom sheet announced as modal dialog
- Yesterday's values read as a grouped list
- Tap-to-edit fields announce "tap to change" after the value

---

## JRE-019: Evening Contextual Micro-Insight

**Screen ID:** JRE-019
**Priority:** P1
**Phase:** 2
**Parent:** JRE-017 (post-save) or inline in JRE-002/JRE-003

### Behavior

The micro-insight can appear in two locations:

**Inline during check-in (Phase 2):**
- Appears within JRE-002 (energy section) or JRE-003 (bloating section) when the intelligence layer detects a notable pattern based on the values just entered.
- Component: InsightCard (1.9)
- Category: `pattern` or `correlation`
- Severity: `informational` or `noteworthy`
- Example: "Afternoon crashes 3 days running — this pattern often maps to blood sugar instability."
- Tappable to expand. Includes `bookChapterRef` when relevant.
- Dismissible. Does not block the flow.

**Post-save (Phase 2):**
- Appears as a brief overlay after JRE-017 save, before routing to dashboard.
- Full InsightCard with title, summary, and optional CTA ("Learn more" -> book chapter, or "View trend" -> HOM-002).
- Auto-advances to dashboard after 5 seconds. Tap anywhere to proceed immediately.
- If no insight is available, this step is skipped entirely.

### Example Insights

| Trigger | Insight |
|---------|---------|
| Bloating > 7 for 3+ consecutive days | "Your bloating has been elevated for 3 days. The bloating engine is building your trigger profile." |
| Energy pattern = "Afternoon crash" + bloating > 5 | "Today's afternoon crash coincided with elevated bloating. Blood sugar and gut function are connected in hypothyroidism." |
| Mood < 4 + body feeling = "Significantly swollen" | "Body changes and mood are connected. Tracking both helps identify the pattern." |
| PMS severity trending up over 3 cycles | "Your PMS severity has increased over the past 3 cycles. This may indicate changing estrogen dominance." |

### Accessibility

- InsightCard follows Component 1.9 accessibility spec
- Post-save auto-advance is paused if screen reader is active; user must tap to proceed

---

## PMS Quick-Log Integration (CYC-004)

**Screen ID:** CYC-004
**Priority:** P0 (when active)
**Phase:** 2
**Spec file:** `cycle-tracking.md` (full spec lives there)
**Evening flow integration:** Inserted between JRE-016 (Sleep Prep) and the food journal check, only when in PMS window.

### Evening Flow Behavior

- **Trigger:** Cycle tracking enabled AND within 14 days of predicted period start, OR user manually flagged PMS onset.
- **First appearance in cycle:** Brief intro banner: "Based on your cycle, you may be entering your PMS window." with "Not yet" dismiss option (suppresses for 2 days) and "Track PMS" confirm.
- **Subsequent days:** Card appears without intro, directly showing PMS chips and severity slider.

### Fields (within evening flow context)

**PMS symptom chips** — SymptomChipGrid (1.2), multi-select
- Chips: Breast tenderness | Mood crash | Anxiety spike | Irritability/rage | Depression | Crying spells | Bloating | Water retention | Headache/migraine | Food cravings | Insomnia | Acne breakout | Extra fatigue | Back pain | Digestive changes | Brain fog (worse than usual)
- These are distinct from the physical symptom chips in JRE-007. The PMS chips capture PMS-specific context for cycle correlation.

**Overall PMS severity** — SliderCard (1.1)
- Range: 0-10, `snapToInt: true`
- Labels: lowLabel = "Barely noticeable", highLabel = "Debilitating"
- `previousValue`: Yesterday's PMS severity (ghost marker)

### Transitions

- "Next" -> food journal check -> JRE-017
- "Skip" -> same routing (PMS data not recorded for today)
- "Not yet" (first appearance only) -> suppresses PMS card for 2 days

---

*End of Evening Check-in Screen Specs v1.0*
