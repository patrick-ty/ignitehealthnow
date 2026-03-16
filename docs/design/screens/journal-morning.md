# Journal Morning Check-in -- Screen Specifications

**Version:** 1.0
**Date:** March 16, 2026
**Flow:** `docs/design/flows/morning-checkin.md`
**Design system:** `docs/design/01-design-system.md`
**Screen IDs:** JRM-001 through JRM-013

---

## JRM-001: Morning Greeting / Check-in Entry

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-001 |
| **Name** | Morning Greeting / Check-in Entry |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | HOM-001 (Dashboard CTA) |

### Entry Points
- Tap "Morning Check-in" CTA on HOM-001
- Tap morning reminder notification (MOD-006)
- Resume from partial entry (app returns to last incomplete card)

### Exit Points
- Forward: JRM-002 (Sleep Card) or JRM-012 (Same-as-Yesterday)
- Abandon: MOD-011 (Save/Discard Dialog) --> HOM-001

### Layout (top to bottom)

1. **App bar:** Back arrow (left), "Morning Check-in" title (center), close X (right). CycleDayBadge in trailing position if cycle tracking enabled.
2. **Greeting block:** `type.h1` greeting "Good morning, {displayName}". Below: `type.body` date string "March 16 -- Wednesday". Below (if cycle tracking): CycleDayBadge inline -- "Day 22 -- Luteal phase" with phase color.
3. **ProgressStepper:** Horizontal step indicator. Steps: Sleep, Body, Meds, Context, Photo, Save. Current step: 0 (none started). Tappable completed steps for back-navigation.
4. **Same-as-Yesterday button (conditional):** Appears only when user has 14+ days of data. Outlined button, full width: "Same as yesterday?" with a summary preview line beneath: "Sleep 7h, quality 6, energy 5, no fog, meds on time."
5. **Begin button:** Primary filled button, full width: "Start Check-in". Navigates to JRM-002.
6. **Vertical spacing:** `space.xxl` between greeting and stepper, `space.xl` between stepper and buttons.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| (No data entry on this screen) | -- | -- | -- | -- |

### Conditional Logic
- CycleDayBadge visible only if `user.cycleTrackingEnabled == true`
- Same-as-Yesterday button visible only if `user.journalEntryCount >= 14`
- If resuming partial entry, greeting changes to "Welcome back" and ProgressStepper shows completed sections filled

### States
- **Default:** Greeting + stepper + begin button
- **14+ days:** Default + Same-as-Yesterday button above begin button
- **Resume:** "Welcome back" greeting, stepper shows partial progress, begin button reads "Continue"
- **Already completed today:** Greeting changes to "Edit your morning entry". Button reads "Review & Edit". Summary of saved values shown.

### Accessibility
- Screen title set as `Semantics(header: true, label: "Morning check-in")`.
- Greeting text: `type.h1`, announced first in focus order.
- CycleDayBadge: tappable, announces "Cycle day {n}, {phase} phase. Tap to view cycle details."
- ProgressStepper announces step count: "Step 0 of 6, not started."
- Same-as-Yesterday button: announces full summary text for screen reader users.

### Time Estimate
~3 seconds

---

## JRM-002: Card -- How You Slept (Section A)

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-002 |
| **Name** | Card: How You Slept |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | JRM-001 |

### Entry Points
- Forward from JRM-001 (Begin or Continue)
- Back-navigation from JRM-004 (Body State)
- Tap "Sleep" step in ProgressStepper

### Exit Points
- Forward: JRM-004 (Body State) -- or JRM-003 (Sleep Disruption) if quality < 5
- Back: JRM-001 (Greeting)

### Layout (top to bottom)

1. **SectionHeader:** "How You Slept" with moon icon (`icon.lg`). Completion indicator: "{n} of {total} fields".
2. **SliderCard -- Sleep Quality:** Label "Sleep quality", lowLabel "Terrible", highLabel "Great", range 0-10, snapToInt true. Ghost marker for yesterday's value. Current value displayed in `type.numeric`.
3. **SliderCard -- Waking Refreshed:** Label "How refreshed do you feel?", lowLabel "Exhausted", highLabel "Fully rested", range 0-10. Ghost marker for yesterday's value.
4. **SliderCard -- Sleep Duration (P1):** Label "Hours slept". Numeric input field with stepper (5.0-12.0 in 0.5 increments). Auto-calculated from device sleep data if available, with manual override. `type.numericSmall` display.
5. **QuickTapSelector -- Night Wakings (P1):** Label "Night wakings". Options: 0, 1, 2, 3, 4+. Single-select.
6. **Numeric input -- Basal Body Temperature (P2):** Label "Waking basal temp (optional)". Numeric field, range 95.0-100.0 degF. Helper text: "Take before getting out of bed for best accuracy." Keyboard: decimal numeric.
7. **ConditionalSection -- Sleep Disruption (JRM-003):** Slides open if sleep quality < 5.
8. **Bottom navigation:** "Next" button (right-aligned) to advance to Body State card.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Sleep quality | SliderCard | Yes (P0) | User baseline or 5 | 0-10 integer |
| Waking refreshed | SliderCard | Yes (P0) | User baseline or 5 | 0-10 integer |
| Sleep duration | Numeric stepper | No (P1) | Auto from device or null | 0.0-24.0, step 0.5 |
| Night wakings | QuickTapSelector | No (P1) | null | Single select: 0-4+ |
| Basal body temperature | Numeric input | No (P2) | null | 95.0-100.0 degF |

### Conditional Logic
- Sleep duration, night wakings: hidden in Week 1. Shown Week 2+.
- BBT: hidden until Month 2+. Shown earlier if user manually enables in STG-011.
- Sleep quality < 5: ConditionalSection for JRM-003 opens with 250ms slide animation.
- Smart defaults: after 7 days, sliders initialize at user's rolling average. Ghost markers show yesterday's value.

### States
- **Week 1:** 2 sliders only (quality + refreshed)
- **Week 2-3:** 2 sliders + duration + night wakings
- **Month 2+:** All 5 fields
- **Smart defaults active:** Sliders pre-positioned at baseline, ghost markers visible
- **Conditional open:** Sleep disruption section expanded below

### Accessibility
- SectionHeader announced: "How you slept, {n} of {total} fields complete."
- Each SliderCard: "{label}: {value} out of 10. Yesterday was {previousValue}." Adjustable via swipe or keyboard.
- Night wakings QuickTapSelector: "Night wakings: {selected option} selected."
- BBT numeric input: "Waking basal temperature in Fahrenheit. Optional."
- ConditionalSection slide-open announced: "Additional questions available for sleep disruption."

### Time Estimate
~10 seconds (P0) | ~15 seconds (P0+P1) | ~25 seconds (full depth)

---

## JRM-003: Conditional -- Sleep Disruption Reasons

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-003 |
| **Name** | Conditional: Sleep Disruption Reasons |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | JRM-002 (sleep quality < 5) |

### Entry Points
- Auto-reveal when sleep quality slider moves below 5 on JRM-002

### Exit Points
- Auto-collapse when sleep quality moves to 5+
- Contained within JRM-002; user proceeds to JRM-004 via next button

### Layout (top to bottom)

1. **Prompt text:** `type.bodyMedium` "What disrupted your sleep?" with `neutral.textSecondary` color.
2. **SymptomChipGrid:** Multi-select. Chips: Pain, Temperature dysregulation, Racing thoughts, Bathroom, Night sweats, Unknown. Reordered by user frequency after 7 days.
3. **Vertical padding:** `space.md` above and below the chip grid.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Sleep disruption reasons | SymptomChipGrid | No (optional even when shown) | Empty set | Multi-select, 0-6 options |

### Conditional Logic
- Visible only when sleep quality < 5 on JRM-002.
- Chips reorder after 7 days based on user's most frequent selections.
- If user selects "Unknown" alongside other specific reasons, "Unknown" is automatically deselected (mutually exclusive with specifics).

### States
- **Hidden:** Default when quality >= 5
- **Visible, no selection:** Chips shown, none selected
- **Visible, selections made:** Selected chips filled with checkmark

### Accessibility
- Announced on reveal: "Additional questions available for sleep disruption."
- SymptomChipGrid: each chip announces "{reason}, {selected/not selected}, chip {n} of 6."
- Content excluded from accessibility tree when hidden.

### Time Estimate
~5 seconds

---

## JRM-004: Card -- Body State (Section B)

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-004 |
| **Name** | Card: Body State |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | JRM-002 |

### Entry Points
- Forward from JRM-002 (next button)
- Back-navigation from JRM-008 (Medication Card)
- Tap "Body" step in ProgressStepper

### Exit Points
- Forward: JRM-008 (Medication Card)
- Conditionals: JRM-005 (pain map), JRM-006 (exercise tolerance), JRM-007 (word retrieval)
- Inline: JRM-013 (micro-insight), Period Quick-Log

### Layout (top to bottom)

1. **SectionHeader:** "Body State" with body icon. Completion indicator.
2. **SliderCard -- Energy Level:** Label "Energy level", lowLabel "None", highLabel "Full", range 0-10.
3. **SliderCard -- Brain Fog:** Label "Brain fog", lowLabel "Clear", highLabel "Severe", range 0-10.
4. **QuickSelectRow -- Predominant Mood:** Label "Predominant mood". Single-select carousel: Calm, Anxious, Irritable, Sad, Motivated, Overwhelmed, Foggy, Neutral. Horizontal scroll on small screens. Icons + text labels.
5. **QuickTapSelector -- Pain/Stiffness (P1):** Label "Pain or stiffness". Options: None, Mild, Moderate, Severe. colorScale: true.
6. **QuickTapSelector -- Cold Intolerance (P1):** Label "Cold intolerance". Options: Normal, Slightly cold, Cold, Very cold.
7. **ConditionalSection -- Pain Body Map (JRM-005):** Slides open if pain != None.
8. **ConditionalSection -- Exercise Tolerance (JRM-006):** Slides open if energy < 4.
9. **ConditionalSection -- Word Retrieval (JRM-007):** Slides open if brain fog > 6.
10. **Period Quick-Log sub-section (conditional):** Visible only during active period days. Preceded by a thin divider and sub-header "Period -- Day {n}".
11. **InsightCard -- Contextual Micro-Insight (JRM-013):** Phase 2. Appears inline if intelligence layer has a pattern to surface.
12. **Bottom navigation:** "Next" button to advance to Medication card.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Energy level | SliderCard | Yes (P0) | User baseline or 5 | 0-10 integer |
| Brain fog severity | SliderCard | Yes (P0) | User baseline or 5 | 0-10 integer |
| Predominant mood | QuickSelectRow | Yes (P0) | null (must select one) | Single select from 8 options |
| Pain/stiffness | QuickTapSelector | No (P1) | null | Single select: None/Mild/Moderate/Severe |
| Cold intolerance | QuickTapSelector | No (P1) | null | Single select: Normal/Slightly cold/Cold/Very cold |
| Flow heaviness | QuickTapSelector | No (period only) | null | Single select: Spotting/Light/Moderate/Heavy/Flooding |
| Clots | QuickTapSelector | No (period only) | null | Single select: None/Small/Large |
| Cramps | QuickTapSelector | No (period only) | null | Single select: None/Mild/Moderate/Severe/Debilitating |

### Conditional Logic
- Pain/stiffness, cold intolerance: hidden Week 1, shown Week 2+.
- Pain != None --> reveals JRM-005 (body map, P1).
- Energy < 4 --> reveals JRM-006 (exercise tolerance, P2, Month 2+).
- Brain fog > 6 --> reveals JRM-007 (word retrieval, P1, Week 2+).
- Active period --> period quick-log sub-section visible.
- Period Day >= 4 --> "Period ended" button appears in period sub-section.
- Clots = "Large (quarter+)" --> post-save educational notification queued.
- Cramps = "Severe" or "Debilitating" tracked for multi-cycle cramp intelligence.

### States
- **Week 1:** 3 fields (energy, fog, mood)
- **Week 2-3:** 5 fields + conditionals for pain/fog
- **Month 2+:** 5 fields + all conditionals including exercise tolerance
- **Active period:** + 3 period fields + period ended button (Day 4+)
- **Insight available (Phase 2):** InsightCard shown inline

### Accessibility
- SectionHeader: "Body state, {n} of {total} fields complete."
- Energy slider: "Energy level: {value} out of 10."
- Brain fog slider: "Brain fog: {value} out of 10. 0 is clear, 10 is severe."
- Mood carousel: "Predominant mood. {selected or 'none selected'}. Swipe to see more options."
- Pain QuickTapSelector: graduated color description in text, not color alone.
- Period sub-section announced: "Period tracking, day {n}."
- ConditionalSections announced on reveal per component spec.

### Time Estimate
~12 seconds (P0 Week 1) | ~20 seconds (P0+P1) | ~30 seconds (with conditionals) | +15 seconds if period quick-log active

---

## JRM-005: Conditional -- Pain Location Body Map

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-005 |
| **Name** | Conditional: Pain Location Body Map |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | JRM-004 (pain present) |

### Entry Points
- Auto-reveal when pain/stiffness = Mild, Moderate, or Severe on JRM-004

### Exit Points
- Contained within JRM-004. Collapses when pain set to None.

### Layout (top to bottom)

1. **Prompt text:** `type.bodyMedium` "Where do you feel pain or stiffness?"
2. **Body map illustration:** Front-facing body outline, 240dp tall. Tappable regions highlighted on touch. Regions: Head/Neck, Shoulders, Upper back, Lower back, Arms/Hands/Wrists, Chest, Abdomen, Hips, Knees, Legs, Feet/Ankles.
3. **Selected regions list:** Below the body map, selected regions shown as chips for easy deselection.
4. **"Full body" option:** Single chip below the map: "Everywhere / full body" -- selects all regions.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Pain locations | Tappable body map + chip list | No | Empty set | Multi-select from 11 regions |

### Conditional Logic
- Hidden in Week 1 even if pain is present (pain presence captured via QuickTapSelector, but body map deferred to reduce first-week friction).
- Shown from Week 2+ when pain != None.
- "Full body" chip auto-selects all; tapping a specific region while "Full body" is active deselects full body and keeps only that region.

### States
- **Hidden:** pain = None or Week 1
- **Visible, no selection:** Body outline shown, no regions highlighted
- **Visible, regions selected:** Selected regions have filled highlight + chips below

### Accessibility
- Body map announced: "Pain location body map. Tap regions where you feel pain. {n} regions selected."
- Each region is an independent touch target with semantic label: "{region name}, {selected/not selected}."
- Region minimum touch area: 48x48dp. Regions that are visually smaller have expanded hit boxes.
- Selected regions chip list provides alternative non-visual selection method.

### Time Estimate
~8 seconds

---

## JRM-006: Conditional -- Exercise Tolerance Yesterday

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-006 |
| **Name** | Conditional: Exercise Tolerance Yesterday |
| **Phase** | 1 |
| **Priority** | P2 |
| **Parent** | JRM-004 (energy < 4) |

### Entry Points
- Auto-reveal when energy slider < 4 on JRM-004 AND user is in Month 2+ engagement phase

### Exit Points
- Contained within JRM-004

### Layout (top to bottom)

1. **Prompt text:** `type.bodyMedium` "How did exercise feel yesterday?"
2. **QuickTapSelector:** Options: Didn't exercise, Normal tolerance, Reduced tolerance, Exercise intolerant, Made symptoms worse. Single-select.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Exercise tolerance | QuickTapSelector | No | null | Single select from 5 options |

### Conditional Logic
- Only shown when energy < 4 AND engagement phase >= Month 2.
- Hidden in Week 1-3 regardless of energy level.

### States
- **Hidden:** energy >= 4, or engagement phase < Month 2
- **Visible, no selection:** All options unselected
- **Visible, selected:** One option highlighted

### Accessibility
- QuickTapSelector follows standard component accessibility: "Exercise tolerance yesterday: {option} selected."
- Each option: minimum 48x48dp touch target.

### Time Estimate
~5 seconds

---

## JRM-007: Conditional -- Word Retrieval Difficulty

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-007 |
| **Name** | Conditional: Word Retrieval Difficulty |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | JRM-004 (brain fog > 6) |

### Entry Points
- Auto-reveal when brain fog slider > 6 on JRM-004 AND user is in Week 2+ engagement phase

### Exit Points
- Contained within JRM-004

### Layout (top to bottom)

1. **Prompt text:** `type.bodyMedium` "Are you having trouble finding words?"
2. **QuickTapSelector:** Options: Yes, No. Single-select.
3. **ConditionalSection (if Yes):** FreeTextField -- "Describe it if you'd like" (200 char, optional). Slides open on "Yes" selection.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Word retrieval difficulty | QuickTapSelector | No | null | Single select: Yes/No |
| Description | FreeTextField | No | empty | Max 200 characters |

### Conditional Logic
- Visible only when brain fog > 6 AND Week 2+.
- "Yes" selection reveals the optional FreeTextField.
- "No" selection hides FreeTextField (maintains state if user toggles).

### States
- **Hidden:** brain fog <= 6 or Week 1
- **Visible, no answer:** Yes/No shown, neither selected
- **Yes selected:** FreeTextField expanded below
- **No selected:** FreeTextField hidden

### Accessibility
- QuickTapSelector: "Word retrieval difficulty: {Yes/No/not answered}."
- FreeTextField: "Describe your word retrieval difficulty. Optional. {n} of 200 characters."

### Time Estimate
~3 seconds (No) | ~10 seconds (Yes + description)

---

## JRM-008: Card -- Medication & Supplements (Section C)

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-008 |
| **Name** | Card: Medication & Supplements |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | JRM-004 |

### Entry Points
- Forward from JRM-004 (next button)
- Back-navigation from JRM-009
- Tap "Meds" step in ProgressStepper

### Exit Points
- Forward: JRM-009 (Quick Context) or JRM-010 (Photo) if context card hidden
- Back: JRM-004

### Layout (top to bottom)

1. **SectionHeader:** "Meds & Supplements" with pill icon. Completion indicator.
2. **MedicationCard -- Primary thyroid medication:** Collapsed shows med name + dose (e.g., "Levothyroxine 75mcg") and status (taken/not yet/skipped). Quick-tap row: Yes / Not yet / Skipped. Expand on "Yes" reveals:
   - Timestamp field (auto-set to now, editable via time picker)
   - "Taken with" multi-select chips: Empty stomach, Coffee, Food, Calcium, Iron, Other supplements
3. **AlertBanner (MED-010, conditional):** Absorption interference warning. Appears if "Taken with" includes Coffee, Food, Calcium, or Iron. Severity: warning. Message varies by substance (e.g., "Calcium can reduce thyroid medication absorption by up to 60%. Wait 4 hours between calcium and your thyroid medication.")
4. **Supplement checklist (P2):** List of user's configured supplements, each with checkbox. "All taken" bulk action at top. Collapsed behind "Show supplements" if not used frequently.
5. **Bottom navigation:** "Next" button.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Thyroid med taken | QuickTapSelector (on MedicationCard) | Yes (P0) | null | Single select: Yes/Not yet/Skipped |
| Medication timing | Time picker | No (P1, auto on "Yes") | Current time | Valid time HH:MM |
| Taken with | SymptomChipGrid (multi-select) | No (P1) | Empty set | Multi-select from 6 options |
| Supplements taken | Checkbox list | No (P2) | Unchecked | Multi-select from user's list |

### Conditional Logic
- Timing + taken-with fields: shown only when med taken = "Yes".
- AlertBanner: shown when taken-with includes Coffee, Food, Calcium, or Iron. Not shown for "Empty stomach" or "Other supplements."
- Supplement checklist: hidden in Week 1. Collapsed by default in Week 2-3 (tap to expand). Auto-expanded in Month 2+ if user regularly logs supplements.
- If user has no thyroid medication configured (Jen persona, undiagnosed), this card shows supplements only with a note: "Add your medications in Settings when ready."
- MedicationCard swipe-to-mark-taken gesture for returning users.

### States
- **Not recorded:** Med card shows "Not yet recorded" in `neutral.textTertiary`
- **Taken = Yes:** Card expanded with timing + taken-with
- **Taken = Not yet:** Card collapsed, "Not yet" shown in amber
- **Taken = Skipped:** Card collapsed, "Skipped" shown in muted text
- **Interference warning:** AlertBanner visible above supplement section
- **No thyroid medication configured:** Simplified supplement-only view

### Accessibility
- MedicationCard collapsed: "{medication name} {dose}, {status}."
- MedicationCard expanded: "Details expanded. Taken at {time}. Taken with: {list}."
- AlertBanner: announced immediately via `liveRegion: true`. "Warning: {interference message}."
- Supplement checkboxes: "{supplement name}, {checked/unchecked}."
- Swipe gesture has visible button alternative (checkmark icon).

### Time Estimate
~8 seconds (P0, med status only) | ~15 seconds (P0+P1, timing + taken-with + supplements)

---

## JRM-009: Card -- Quick Context (Section D)

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-009 |
| **Name** | Card: Quick Context |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | JRM-008 |

### Entry Points
- Forward from JRM-008
- Tap "Context" step in ProgressStepper

### Exit Points
- Forward: JRM-010 (Photo Prompt)
- Back: JRM-008

### Layout (top to bottom)

1. **SectionHeader:** "Quick Context" with clipboard icon. Completion indicator.
2. **SliderCard -- Hunger/Appetite (P2):** Label "Hunger/appetite", lowLabel "No appetite", highLabel "Ravenous", range 0-10.
3. **SliderCard -- Hydration (P2):** Label "Hydration", lowLabel "Dehydrated", highLabel "Well hydrated", range 0-10.
4. **FreeTextField -- Notes (P2):** Hint text "Anything notable this morning? (e.g., started new supplement, stressful week)". 200 char max. "(Optional)" label.
5. **Bottom navigation:** "Next" button.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| Hunger/appetite | SliderCard | No (P2) | User baseline or null | 0-10 integer |
| Hydration | SliderCard | No (P2) | User baseline or null | 0-10 integer |
| Notes | FreeTextField | No (P2) | empty | Max 200 characters |

### Conditional Logic
- Entire card hidden in Week 1.
- Shown from Week 2+ (all fields are P1/P2 but the card itself is P1).
- If user consistently skips hunger and hydration for 14+ days, those sliders auto-collapse behind a "More" button. Notes field always visible (when card is shown).
- Smart defaults: sliders at user baseline after 7 days of data.

### States
- **Hidden:** Week 1
- **Standard:** All 3 fields visible
- **Collapsed fields:** Hunger/hydration collapsed behind "More" if consistently skipped

### Accessibility
- SectionHeader: "Quick context, {n} of 3 fields."
- SliderCards follow standard component accessibility.
- FreeTextField: "Notes. Optional. {n} of 200 characters used."

### Time Estimate
~10 seconds (if filling sliders + note) | 0 seconds (skipped in Week 1 or scrolled past)

---

## JRM-010: Card -- Visual Health Photo Prompt

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-010 |
| **Name** | Card: Visual Health Photo Prompt |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | JRM-009 |

### Entry Points
- Forward from JRM-009 (or JRM-008 if context card hidden)
- Tap "Photo" step in ProgressStepper

### Exit Points
- Forward (take photo): VHP-001 (Face Front Capture) --> returns here on completion --> JRM-011
- Forward (skip): JRM-011 (Summary)
- Back: JRM-009 or JRM-008

### Layout (top to bottom)

1. **SectionHeader:** "Daily Photo" with camera icon.
2. **Prompt card:** Illustration of face silhouette outline (decorative). `type.h3` "Capture your morning photo". `type.body` "Same lighting and angle each day gives the best comparisons."
3. **Baseline indicator (VHP-012, conditional):** If within first 7 days of photos. AlertBanner (severity: info): "Building your baseline -- these first photos help us track changes over time."
4. **Primary button:** "Take photo" (full width, filled). Launches VHP-001.
5. **Secondary text link:** "Skip today" (centered below button).
6. **Photo count indicator:** If user has taken photos today already: "1 photo captured today" with thumbnail. Option to "Add more" or proceed.
7. **Bottom navigation:** "Next" button (to summary).

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| (No direct data entry -- photo capture handled by VHP flow) | -- | No | -- | -- |

### Conditional Logic
- Entire card hidden in Week 1. Shown from Week 2+.
- Baseline indicator shown only during first 7 days of photo data.
- After face front captured, app progressively suggests additional photo types (profile in Week 3, hair in Week 4, etc.).
- If camera permission denied, show explanation text and "Open Settings" button instead of "Take photo."

### States
- **Hidden:** Week 1
- **Standard prompt:** Photo prompt with take/skip options
- **Baseline period:** Standard + baseline indicator banner
- **Photo already taken:** Thumbnail preview + "Add more" option
- **Camera permission denied:** Explanation + settings button

### Accessibility
- Silhouette illustration: `excludeFromSemantics: true` (decorative).
- "Take photo" button: "Take morning health photo."
- "Skip today" link: "Skip photo today."
- Baseline banner: announced via `liveRegion` on first appearance.

### Time Estimate
~3 seconds (skip) | ~30-60 seconds (taking photos via VHP flow)

---

## JRM-011: Morning Check-in Summary / Save

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-011 |
| **Name** | Morning Check-in Summary / Save |
| **Phase** | 1 |
| **Priority** | P0 |
| **Parent** | JRM-010 |

### Entry Points
- Forward from JRM-010 (or last visible card)
- Forward from JRM-012 (Same-as-Yesterday confirm)

### Exit Points
- Save: HOM-001 (Dashboard), optionally via post-save insight
- Edit: Jump to any card section
- Abandon: MOD-011 (Save/Discard)

### Layout (top to bottom)

1. **Screen title:** `type.h2` "Morning Summary"
2. **ProgressStepper:** All steps shown as complete (filled circles).
3. **Summary sections** (read-only compact cards, one per check-in section):
   - **Sleep:** "Quality {n}/10, Refreshed {n}/10" + duration + wakings if captured. Tap to edit.
   - **Body:** "Energy {n}/10, Brain fog {n}/10, Mood: {mood}" + pain/cold if captured. Tap to edit.
   - **Period (if active):** "Day {n}: {flow}, {clots}, {cramps}". Tap to edit.
   - **Meds:** "{med name}: {status}" + supplements count. Tap to edit.
   - **Context:** Hunger/hydration values + notes preview (truncated). Tap to edit.
   - **Photo:** "{n} photos taken" or "Skipped". Tap to edit.
4. **Incomplete indicator:** Any section with no data shows `neutral.textTertiary` "Not recorded" -- no color coding, no icons implying failure.
5. **Duration badge:** `type.caption` "This took ~{elapsed time}" (from first card to summary).
6. **Streak indicator (P2):** If applicable, small text: "Day {n} streak" with subtle sparkle icon.
7. **Primary button:** "Save Morning Check-in" (full width, filled, `brand.primary`).
8. **Spacing:** `space.lg` between summary cards, `space.xxl` before save button.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| (No new data entry -- summary of all prior cards) | -- | -- | -- | -- |

### Conditional Logic
- Summary cards only show sections the user actually saw (Week 1 users see fewer sections).
- Period section only visible during active period days.
- Streak indicator only shown if user has 3+ consecutive days.
- On save: weather data auto-attached, cycle day tagged, Pub/Sub event fired.

### States
- **Complete:** All visible sections have data, save button active
- **Partial:** Some sections incomplete, save button still active (partial saves allowed), incomplete sections noted subtly
- **Saving:** Button shows loading spinner, disabled to prevent double-tap
- **Saved:** Brief checkmark animation (or static checkmark if reduced motion), then transition to post-save insight or dashboard

### Accessibility
- Screen title: `Semantics(header: true, label: "Morning check-in summary")`.
- Each summary card: tappable, announced as "{section}: {summary text}. Tap to edit."
- Save button: "Save morning check-in."
- On successful save: "Morning check-in saved" announced via `liveRegion`.
- Streak text: purely informational, does not imply obligation.

### Time Estimate
~5 seconds (review + save)

---

## JRM-012: Same-as-Yesterday Quick Confirm

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-012 |
| **Name** | Same-as-Yesterday Quick Confirm |
| **Phase** | 1 |
| **Priority** | P1 |
| **Parent** | JRM-001 (14+ days) |

### Entry Points
- Tap "Same as yesterday?" on JRM-001

### Exit Points
- Confirm: JRM-011 (Summary/Save)
- Edit a section: Jump to that card (JRM-002/004/008/009) with yesterday's data pre-filled, then return to JRM-011
- Cancel: Back to JRM-001

### Layout (top to bottom)

1. **Screen title:** `type.h2` "Yesterday's Check-in"
2. **Subtitle:** `type.body` "Tap any section to change it, or confirm if today is the same."
3. **Summary cards** (tappable, each shows yesterday's data):
   - **Sleep:** "Quality {n}/10, Refreshed {n}/10, {duration}h, {wakings} waking(s)". Edit icon (right).
   - **Body:** "Energy {n}/10, Fog {n}/10, Mood: {mood}, Pain: {level}, Cold: {level}". Edit icon.
   - **Period (if applicable):** "Day {n}: {flow}, {clots}, {cramps}" or "No period data" if not on period yesterday.
   - **Meds:** "{med}: Taken at {time}, {taken with}. Supplements: {count} taken." Edit icon.
   - **Context (if data exists):** "Hunger {n}/10, Hydration {n}/10. Notes: {truncated}". Edit icon.
4. **Primary button:** "Confirm -- same today" (full width, filled).
5. **Text link:** "Full entry instead" -- navigates to JRM-002 with no pre-fill from yesterday.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| (Displays yesterday's data for confirmation -- no new input unless user edits) | -- | -- | Yesterday's values | Same as original fields |

### Conditional Logic
- Period section: shown only if user was on their period yesterday. If period ended since yesterday, section is removed and a note appears: "Your period data from yesterday won't carry over since your period has ended."
- If medication changed since yesterday (dose change, new med, discontinued), medication section shows an AlertBanner: "Your medication has changed -- please review." Section opens in edit mode.
- If yesterday's entry was partial, only completed fields are shown. Missing fields show "No data" and cannot be confirmed (must do full entry for those sections).

### States
- **All sections confirmed:** Primary button enabled
- **Section being edited:** User jumps to card, card shows pre-filled values from yesterday
- **Medication change detected:** Med section highlighted with warning, must be re-confirmed

### Accessibility
- Each summary card: "Yesterday's {section}: {values}. Tap to edit."
- Confirm button: "Confirm same as yesterday."
- "Full entry instead": "Start a new full entry."

### Time Estimate
~15-20 seconds (review + confirm or review + minor edits)

---

## JRM-013: Morning Contextual Micro-Insight

| Attribute | Value |
|-----------|-------|
| **Screen ID** | JRM-013 |
| **Name** | Morning Contextual Micro-Insight |
| **Phase** | 2 |
| **Priority** | P1 |
| **Parent** | JRM-004 (inline) |

### Entry Points
- Auto-generated by intelligence layer after body state values are entered on JRM-004
- Only appears when a relevant pattern is detected

### Exit Points
- Dismiss: collapses inline
- "Learn more": navigates to INT detail screen or MOD-012 (educational bottom sheet)
- Contained within JRM-004 flow; user proceeds normally

### Layout (top to bottom)

1. **InsightCard component:**
   - Icon: lightbulb (`icon.md`, `insight.informational` color)
   - Title: `type.h3` -- e.g., "Luteal Phase Pattern Detected"
   - Summary: `type.body` -- 1-2 sentences, e.g., "Your brain fog has been above 6 for 4 consecutive days. This pattern coincides with your luteal phase in 3 of the last 4 cycles."
   - Book reference (optional): `type.caption` -- "Learn more: Chapter 7"
   - "Learn more" text link (navigates to detail)
   - "Got it" dismiss button
2. **Padding:** `space.lg` above and below the InsightCard.

### Data Fields

| Field | Component | Required | Default | Validation |
|-------|-----------|----------|---------|------------|
| (No user input -- display only) | InsightCard | -- | -- | -- |

### Conditional Logic
- Only shown when intelligence layer returns a contextual insight for the current data.
- Maximum 1 insight per check-in (avoid overwhelming the user).
- Insight types that can appear here: luteal phase correlation, multi-day trend alert, medication timing pattern, sleep-symptom correlation.
- Dismissed insights are not shown again for the same pattern within 7 days.

### States
- **Hidden:** No insight available (most common)
- **Visible:** InsightCard shown inline
- **Dismissed:** Card collapses with 250ms animation

### Accessibility
- InsightCard announced via `liveRegion` on appearance: "Informational insight: {title}. {summary}."
- "Learn more" link: "Learn more about {title}."
- "Got it" button: "Dismiss insight."

### Time Estimate
~5 seconds (read + dismiss)

---

## Cross-Cutting Specifications

### Navigation Pattern

All cards share a consistent navigation structure:
- **ProgressStepper** persists at the top, showing current position
- **"Next" button** at bottom right of each card advances to the next section
- **Back gesture** (swipe right or back button) returns to previous card
- **ProgressStepper taps** allow jumping to any completed section
- All navigation preserves entered data (no data loss on back/forward)

### Auto-Save Behavior

- Each card's data is saved to local storage when the user navigates away from it (forward or back)
- If the app is killed mid-flow, the partial entry is recoverable
- Auto-save writes to local storage only; cloud sync happens on explicit "Save" tap
- A 5-minute inactivity timeout saves the partial entry as-is and marks it as `status: partial`

### Scroll Behavior

The check-in uses a single scrollable view. Cards are stacked vertically. The ProgressStepper at the top is sticky (stays visible during scroll). When advancing to the next card, the view auto-scrolls to bring the next card's header to the top of the viewport.

### Haptic Feedback

- SliderCard value change: light impact feedback on snap to integer
- QuickTapSelector selection: light impact
- SymptomChipGrid selection: light impact
- Save button tap: medium impact on success
- All haptics respect system haptic settings (disabled when system haptics are off)

---

*End of Journal Morning Screen Specifications v1.0*
