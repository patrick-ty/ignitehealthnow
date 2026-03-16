# IgniteHealthNow Design System Foundation

**Version:** 1.0
**Last updated:** 2026-03-16
**Platform:** Flutter (mobile-first, phone only for MVP)
**Minimum width:** 375dp | **Target width:** 414dp

This document defines the component library, design tokens, accessibility standards, and layout patterns that all screen specifications reference. Every screen spec in `docs/design/screens/` and every flow spec in `docs/design/flows/` inherits from this foundation.

---

## 1. Component Library

All components are Flutter widgets. Each entry specifies its purpose, where it appears, key properties, and accessibility requirements. Developers should implement these as a shared widget library under `lib/widgets/` with consistent naming.

---

### 1.1 SliderCard

**Description:** A labeled 0-10 horizontal slider inside a card container. The most frequently used input component in daily check-ins. Displays the current numeric value prominently and supports pre-filling from the previous entry.

**Typical usage:** Energy level, pain level, brain fog severity, mood rating, temperature perception, and any other scaled symptom in morning/evening check-ins.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `label` | `String` | Symptom name displayed above the slider |
| `value` | `double` | Current value (0.0-10.0) |
| `previousValue` | `double?` | Last recorded value, shown as a ghost marker |
| `onChanged` | `ValueChanged<double>` | Callback on value change |
| `showDelta` | `bool` | Whether to display change from previous value |
| `snapToInt` | `bool` | Snap to whole numbers (default: true) |
| `lowLabel` | `String` | Label at left end (e.g., "None") |
| `highLabel` | `String` | Label at right end (e.g., "Severe") |
| `semanticDescription` | `String` | Screen reader context for this specific slider |

**Accessibility:**
- Minimum slider track height: 12dp (larger than Flutter default) for easier thumb targeting.
- Thumb size: 28dp diameter minimum (32dp in large-text mode).
- Announce value on change: "{label}: {value} out of 10".
- Support keyboard increment via `Slider.adaptive`.
- Ghost marker for previous value must have a text alternative, not color alone.
- In large-text mode, the numeric value display scales to 24sp.

---

### 1.2 SymptomChipGrid

**Description:** A multi-select grid of FilterChip widgets representing individual symptoms. Chips reorder over time so the user's most frequently selected symptoms appear first, reducing scan time. Supports a "Show more" expansion for the full list.

**Typical usage:** Symptom selection in morning and evening check-ins. Also used for selecting relevant symptoms when logging a lab result or flagging a concern.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `symptoms` | `List<Symptom>` | Available symptoms, pre-sorted by frequency |
| `selected` | `Set<String>` | Currently selected symptom IDs |
| `onSelectionChanged` | `ValueChanged<Set<String>>` | Callback |
| `maxVisibleRows` | `int` | Rows shown before "Show more" (default: 2) |
| `allowCustom` | `bool` | Whether user can add a custom symptom chip |

**Accessibility:**
- Each chip announces: "{symptom name}, {selected/not selected}, chip {n} of {total}".
- Minimum chip height: 40dp. Minimum chip width: adapts to text, with 12dp horizontal padding.
- In large-text mode, chips stack single-column if needed rather than truncating text.
- Selection change confirmed with haptic feedback (light impact).
- Color is not the sole indicator of selection state: selected chips use a filled style with a checkmark icon; unselected chips use an outlined style.

---

### 1.3 QuickTapSelector

**Description:** A single-select horizontal row of 3-5 labeled buttons for rapid categorical input. Designed for "None / Mild / Moderate / Severe" patterns and similar scales. Only one option can be active at a time. Tapping the active option deselects it.

**Typical usage:** Headache severity, joint stiffness, digestive discomfort, bloating, flow heaviness, hair loss severity.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `label` | `String` | Category name displayed above the row |
| `options` | `List<String>` | Option labels |
| `selectedIndex` | `int?` | Currently selected index (null = none selected) |
| `onSelected` | `ValueChanged<int?>` | Callback |
| `colorScale` | `bool` | Whether to apply graduated color intensity (default: false) |

**Accessibility:**
- Implemented as a segmented button or toggle button group with proper `Semantics` grouping.
- Announce: "{label}: {option name} selected" on tap.
- Each button minimum 48x48dp touch target.
- If `colorScale` is true, each option also has a text label -- color never carries meaning alone.
- Support traversal via left/right arrow keys when focused.

---

### 1.4 ConditionalSection

**Description:** A section that shows or hides based on a trigger condition (e.g., selecting a symptom chip, choosing a severity level above a threshold, or a cycle-day context). Uses a slide-down animation to reveal content smoothly.

**Typical usage:** Showing hair-specific questions only when "Hair loss" chip is selected. Showing clot details only when menstrual flow is logged. Showing medication interaction warnings when a med is marked as taken.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `visible` | `bool` | Whether the section is currently shown |
| `child` | `Widget` | The content to show/hide |
| `animationDuration` | `Duration` | Expand/collapse duration (default: 250ms) |
| `maintainState` | `bool` | Keep child state when hidden (default: true) |

**Accessibility:**
- When revealed, announce: "Additional questions available for {context}".
- Content inside is focusable only when visible.
- Respect reduced motion: if reduced motion is on, show/hide instantly (no animation).
- Hidden content must be excluded from the accessibility tree (`ExcludeSemantics` when not visible).

---

### 1.5 MedicationCard

**Description:** An expandable card displaying a single medication. Collapsed state shows medication name and taken/not-taken status. Expanded state shows timing, dosage, interaction warnings, and notes. Supports swipe-to-mark-taken for speed.

**Typical usage:** Medication tracking section of morning and evening check-ins. Also appears in the Medications management screen.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `medication` | `Medication` | Medication model object |
| `taken` | `bool?` | Taken status (null = not yet recorded) |
| `onTakenChanged` | `ValueChanged<bool>` | Callback |
| `expanded` | `bool` | Whether detail section is visible |
| `interactions` | `List<Interaction>?` | Active interaction warnings |
| `onTap` | `VoidCallback` | Toggle expanded state |

**Accessibility:**
- Collapsed card announces: "{medication name}, {taken/not taken/not recorded}".
- Expand/collapse announced: "Details expanded" / "Details collapsed".
- Interaction warnings use `Semantics(liveRegion: true)` so they are announced immediately.
- Swipe gesture has a visible button alternative (checkmark icon button).
- Minimum card height when collapsed: 56dp.

---

### 1.6 PhotoCaptureGuide

**Description:** A camera overlay widget that guides the user to photograph a meal or supplement. Shows a translucent silhouette/frame indicating where to position the plate. Includes a guidance text label that updates based on camera state (framing, lighting, stability). Provides a skip option.

**Typical usage:** Photo food journal entry during or after meals. Supplement photo capture.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `guideType` | `PhotoGuideType` | Enum: meal, supplement, label, freeform |
| `guidanceText` | `String` | Current instruction text |
| `onCapture` | `VoidCallback` | Shutter callback |
| `onSkip` | `VoidCallback` | Skip callback |
| `showFlashToggle` | `bool` | Whether to show flash control |

**Accessibility:**
- Guidance text is a live region, updating screen reader users on framing status.
- Shutter button: 64dp diameter, centered at bottom, labeled "Take photo".
- Skip button: clearly labeled "Skip photo", positioned top-right, minimum 48x48dp.
- If camera permission is denied, show a clear explanation and a button to open settings.
- Silhouette overlay must not interfere with VoiceOver/TalkBack interaction zones.

---

### 1.7 DualRangeBar

**Description:** A horizontal bar visualization showing a lab value positioned against two reference ranges: the conventional range (wider, shown in a lighter shade) and the functional/optimal range (narrower, shown in a darker shade). The user's value is marked with a pin. Color-coded zones indicate below-optimal, optimal, and above-optimal.

**Typical usage:** Lab result display on the Labs screen, in doctor visit reports, and on dashboard lab summary cards.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `value` | `double` | The user's lab result |
| `unit` | `String` | Unit label (e.g., "ng/dL", "uIU/mL") |
| `conventionalRange` | `Range` | Low-high of conventional reference range |
| `functionalRange` | `Range` | Low-high of functional/optimal range |
| `label` | `String` | Lab name |
| `interpretation` | `String?` | Text summary (e.g., "Below functional optimal") |

**Accessibility:**
- Full text alternative: "{label}: {value} {unit}. Conventional range: {low}-{high}. Functional optimal range: {low}-{high}. Status: {interpretation}."
- Do not rely on color alone: the interpretation text always accompanies the bar.
- Bar minimum height: 24dp. Pin marker: 16dp diameter.
- In large-text mode, the interpretation text appears below the bar rather than inline.
- Color-blind safe: use blue for optimal zone, amber for caution, desaturated red-orange for out-of-range (see Color Palette section for exact values).

---

### 1.8 SparklineTrend

**Description:** A minimal inline line chart (sparkline) showing the recent trend of a single metric. No axis labels, no grid lines -- just the line and optionally the current value. Designed to fit inside cards and list items.

**Typical usage:** Dashboard metric cards (energy trend, TSH trend, weight trend). Lab history list items. Symptom summary rows.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `dataPoints` | `List<double>` | Values to plot |
| `currentValue` | `double?` | Most recent value to display as text |
| `trendDirection` | `TrendDirection` | Enum: up, down, stable |
| `color` | `Color` | Line color |
| `height` | `double` | Chart height (default: 40dp) |
| `width` | `double` | Chart width (default: 120dp) |

**Accessibility:**
- Text alternative: "{metric} trend over last {n} entries: {trendDirection}. Current value: {currentValue}."
- The sparkline itself is marked `excludeFromSemantics: true`; the text alternative carries all meaning.
- Trend direction is conveyed by text and an optional arrow icon, not just line slope.

---

### 1.9 InsightCard

**Description:** A prominent card surfacing a pattern, correlation, or intelligence finding. Contains a title, a summary sentence, supporting data reference, and a link to the relevant book chapter or educational content. Visually distinct from standard data cards (uses the insight accent color and a lightbulb or signal icon).

**Typical usage:** Dashboard insight feed. Post-check-in insight surface. Pattern alert detail screens.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `title` | `String` | Insight headline |
| `summary` | `String` | 1-2 sentence explanation |
| `category` | `InsightCategory` | Enum: pattern, fourLegs, viciousCycle, correlation, educational |
| `severity` | `InsightSeverity` | Enum: informational, noteworthy, actionRequired |
| `bookChapterRef` | `String?` | Chapter reference for book link |
| `onTap` | `VoidCallback` | Navigate to detail |
| `onDismiss` | `VoidCallback?` | Dismiss/acknowledge callback |

**Accessibility:**
- Announced as: "{severity level} insight: {title}. {summary}."
- Action-required insights use `Semantics(liveRegion: true)` when first appearing.
- Dismiss button labeled "Dismiss insight: {title}".
- Book chapter link labeled "Learn more: Chapter {n}".
- Icon is decorative; do not duplicate icon meaning in the screen reader label.

---

### 1.10 AlertBanner

**Description:** A full-width banner that appears at the top of a screen or section to communicate urgent or important information. Used for vicious cycle alerts, clot significance warnings, medication interaction alerts, and system messages.

**Typical usage:** Top of the daily check-in when a vicious cycle is detected. Top of the menstrual tracking section when clot significance threshold is met. Top of the medication section when an interaction is flagged.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `message` | `String` | Alert text |
| `severity` | `AlertSeverity` | Enum: info, warning, urgent |
| `actionLabel` | `String?` | Optional action button text |
| `onAction` | `VoidCallback?` | Action callback |
| `onDismiss` | `VoidCallback?` | Dismiss callback (null = not dismissible) |
| `icon` | `IconData` | Leading icon |

**Accessibility:**
- Uses `Semantics(liveRegion: true)` to announce immediately when it appears.
- Severity conveyed through text prefix: "Information:", "Warning:", or "Urgent:".
- Dismiss button labeled "Dismiss {severity} alert".
- Minimum banner height: 56dp.
- Does not auto-dismiss -- user must interact or it persists.

---

### 1.11 ProgressStepper

**Description:** A horizontal step indicator showing which sections of a check-in flow are complete, current, and remaining. Each step is a small circle or pill connected by a line. The current section is highlighted.

**Typical usage:** Top of morning and evening check-in flows, showing progress across sections (e.g., Vitals > Symptoms > Meds > Food > Notes).

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `steps` | `List<StepInfo>` | Step labels and completion states |
| `currentStep` | `int` | Index of the active step |
| `onStepTapped` | `ValueChanged<int>?` | Optional navigation to completed steps |

**Accessibility:**
- Announces: "Step {current} of {total}: {step label}. {completed/in progress/not started}."
- Completed steps are tappable to navigate back; announced as "{step label}, completed, tap to review."
- Future steps are not tappable and announced as "{step label}, not started."
- Step indicators use filled/outlined/empty states, not color alone.

---

### 1.12 CycleDayBadge

**Description:** A small persistent badge displayed in the app header or check-in screen showing the user's current cycle day and phase. Uses phase-specific colors (see Design Tokens). Tappable to navigate to the menstrual tracking section.

**Typical usage:** Persistent display in the app bar during check-in flows and on the dashboard. Hidden when cycle tracking is disabled or for users who have opted out.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `cycleDay` | `int` | Current cycle day number |
| `phase` | `CyclePhase` | Enum: menstrual, follicular, ovulatory, luteal |
| `onTap` | `VoidCallback` | Navigate to cycle detail |

**Accessibility:**
- Announces: "Cycle day {day}, {phase} phase. Tap to view cycle details."
- Phase color is paired with a text label -- never color alone.
- Minimum badge touch target: 48x48dp (even though the visual badge is smaller).

---

### 1.13 FAB (Floating Action Button)

**Description:** A floating action button anchored to the bottom-right of the screen for quick photo capture. Uses the Material FAB pattern. Shows a camera icon.

**Typical usage:** Dashboard screen and food journal screen for rapid meal photo capture.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `onPressed` | `VoidCallback` | Launch photo capture |
| `icon` | `IconData` | Default: camera icon |
| `heroTag` | `String` | Unique tag to avoid hero animation conflicts |

**Accessibility:**
- Label: "Take meal photo".
- Minimum size: 56x56dp (Material default).
- In large-text mode, an extended FAB variant with visible text label may be used.
- Does not overlap other interactive elements. Ensure 16dp clearance from other touch targets.

---

### 1.14 TimelineCard

**Description:** A card used in list views that represents a single event on a timeline. Shows a date/time, event type icon, title, and optional detail text. Connected to adjacent cards by a vertical timeline line.

**Typical usage:** Medication change history, lab result history, symptom history, and the unified health timeline view.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `dateTime` | `DateTime` | Event timestamp |
| `title` | `String` | Event title |
| `subtitle` | `String?` | Secondary text |
| `eventType` | `TimelineEventType` | Enum: lab, medication, symptom, photo, insight |
| `onTap` | `VoidCallback?` | Navigate to detail |

**Accessibility:**
- Announces: "{event type}: {title}, {formatted date}. {subtitle if present}."
- Timeline connector line is decorative and excluded from semantics.
- Minimum card height: 64dp.

---

### 1.15 SectionHeader

**Description:** A collapsible section header with a title, optional subtitle showing completion status, and an expand/collapse chevron. Includes an optional progress indicator (e.g., "3 of 5 fields complete").

**Typical usage:** Section dividers in check-in flows. Settings screen section headers. Lab category headers (thyroid panel, iron panel, etc.).

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `title` | `String` | Section name |
| `subtitle` | `String?` | Completion status text |
| `expanded` | `bool` | Current state |
| `onToggle` | `VoidCallback` | Toggle expand/collapse |
| `completedCount` | `int?` | Fields completed in this section |
| `totalCount` | `int?` | Total fields in this section |

**Accessibility:**
- Announces: "{title}, {expanded/collapsed}. {subtitle if present}."
- Chevron icon is decorative; the expand/collapse action is on the entire header row.
- Minimum header height: 48dp.

---

### 1.16 FreeTextField

**Description:** An optional multi-line text input for notes, limited to 200 characters. Shows a character counter. Input is tagged by NLP on submission for later pattern analysis. Visually de-emphasized to signal "optional."

**Typical usage:** End of check-in sections for open-ended notes. Meal photo annotation. Lab result notes.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `hintText` | `String` | Placeholder text |
| `value` | `String` | Current text |
| `onChanged` | `ValueChanged<String>` | Callback |
| `maxLength` | `int` | Character limit (default: 200) |
| `isOptional` | `bool` | Show "Optional" label (default: true) |

**Accessibility:**
- Label includes "(Optional)" when applicable.
- Character counter announced on focus: "{current} of {max} characters used."
- Counter updates announced at 10-character intervals to avoid excessive announcements.
- Minimum text field height: 80dp (roughly 3 lines).

---

### 1.17 QuickSelectRow

**Description:** A horizontal scrolling row of pre-defined options for rapid selection. Similar to QuickTapSelector but allows horizontal scroll when options exceed screen width. Supports single or multi-select.

**Typical usage:** Flow heaviness (Spotting / Light / Medium / Heavy / Very Heavy), bloating timing (Morning / Afternoon / Evening / All Day), bowel quality (Bristol scale simplified).

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `label` | `String` | Row label |
| `options` | `List<QuickOption>` | Available options with labels and optional icons |
| `selected` | `Set<int>` | Selected indices |
| `multiSelect` | `bool` | Allow multiple selections (default: false) |
| `onSelectionChanged` | `ValueChanged<Set<int>>` | Callback |

**Accessibility:**
- Horizontal scroll is indicated: "Swipe left for more options" when overflowing.
- Each option: minimum 48x48dp touch target.
- Selection state announced on tap.
- In large-text mode, wraps to multiple rows instead of scrolling.

---

### 1.18 BodyFeelingSelector

**Description:** A visual quick-select widget for subjective body state. Presents 5 simple body-state options using both icons and text labels (e.g., "Energized", "Normal", "Sluggish", "Achy", "Exhausted"). Designed for fast one-tap input.

**Typical usage:** Morning check-in "How does your body feel?" prompt. Evening check-in overall body assessment.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `selectedState` | `BodyFeeling?` | Currently selected state |
| `onSelected` | `ValueChanged<BodyFeeling>` | Callback |
| `showLabels` | `bool` | Show text labels below icons (default: true, always true in large-text mode) |

**Accessibility:**
- Each option has both an icon and a text label -- the text label is the semantic label.
- Announced as: "Body feeling: {label}. {selected/not selected}."
- Icons are decorative when labels are shown.
- Minimum touch target per option: 56x56dp.
- Supports horizontal swipe navigation via accessibility focus order.

---

### 1.19 WaterRetentionSelector

**Description:** A quick-tap widget specifically for water retention/bloating severity with 4 levels: None, Mild, Moderate, Severe. Each level has a simple visual indicator (increasing fill) and a text label.

**Typical usage:** Morning and evening check-in water retention field. Can also appear in conditional sections triggered by related symptoms.

**Key properties:**
| Property | Type | Description |
|---|---|---|
| `selectedLevel` | `int?` | 0-3 severity level (null = not recorded) |
| `onSelected` | `ValueChanged<int?>` | Callback |

**Accessibility:**
- Follows QuickTapSelector accessibility patterns.
- Announced as: "Water retention: {level label}."
- Visual fill indicator is supplemented by text -- color and fill are not sole indicators.
- Minimum touch target per level: 48x48dp.

---

## 2. Design Tokens

All values below are defined as Dart constants in a central theme file (`lib/theme/`). Screen specs reference these token names, not raw values.

---

### 2.1 Color Palette

#### Brand Colors

| Token | Value | Usage |
|---|---|---|
| `brand.primary` | `#2E7D6F` | Primary actions, active states, app bar |
| `brand.primaryLight` | `#4DA89A` | Hover/focus states, secondary emphasis |
| `brand.primaryDark` | `#1B5E4F` | Text on light backgrounds, pressed states |
| `brand.accent` | `#F4A261` | Warm accent for highlights, FAB, CTAs |
| `brand.accentLight` | `#F7C59F` | Accent backgrounds, chip fills |

#### Semantic Colors -- Lab Ranges

| Token | Value | Usage |
|---|---|---|
| `semantic.optimal` | `#2E7D6F` | Value within functional optimal range |
| `semantic.caution` | `#E9A820` | Value outside optimal but within conventional |
| `semantic.outOfRange` | `#C75B39` | Value outside conventional range |
| `semantic.optimalBg` | `#E8F5F1` | Background for optimal zone on DualRangeBar |
| `semantic.cautionBg` | `#FFF3D6` | Background for caution zone |
| `semantic.outOfRangeBg` | `#FDEAE4` | Background for out-of-range zone |

#### Semantic Colors -- Cycle Phases

| Token | Value | Usage |
|---|---|---|
| `cycle.menstrual` | `#C75B39` | Menstrual phase (muted terracotta) |
| `cycle.follicular` | `#4DA89A` | Follicular phase (fresh teal) |
| `cycle.ovulatory` | `#E9A820` | Ovulatory phase (warm gold) |
| `cycle.luteal` | `#7B6BA0` | Luteal phase (soft purple) |
| `cycle.menstrualBg` | `#FDEAE4` | Phase background tint |
| `cycle.follicularBg` | `#E8F5F1` | Phase background tint |
| `cycle.ovulatoryBg` | `#FFF3D6` | Phase background tint |
| `cycle.lutealBg` | `#EDEAF3` | Phase background tint |

#### Insight & Alert Colors

| Token | Value | Usage |
|---|---|---|
| `insight.informational` | `#2E7D6F` | Informational insights |
| `insight.noteworthy` | `#E9A820` | Noteworthy findings |
| `insight.actionRequired` | `#C75B39` | Urgent/action-required alerts |
| `insight.infoBg` | `#E8F5F1` | Insight card background |
| `insight.noteworthyBg` | `#FFF3D6` | Insight card background |
| `insight.actionBg` | `#FDEAE4` | Insight card background |

#### Neutral & Surface Colors

| Token | Value | Usage |
|---|---|---|
| `neutral.background` | `#F8F7F5` | Screen background (warm off-white) |
| `neutral.surface` | `#FFFFFF` | Card surfaces |
| `neutral.surfaceAlt` | `#F1EFEC` | Alternate surface (e.g., input fields) |
| `neutral.border` | `#D9D5CF` | Card borders, dividers |
| `neutral.textPrimary` | `#1C1B1A` | Primary body text |
| `neutral.textSecondary` | `#6B6560` | Secondary/caption text |
| `neutral.textTertiary` | `#9E9892` | Hint text, disabled text |
| `neutral.disabled` | `#C8C3BC` | Disabled state fills |

#### Color-Blind Safety Notes

The palette avoids pure red/green adjacency. Lab range colors use teal (optimal), amber (caution), and terracotta (out-of-range), which remain distinguishable under protanopia and deuteranopia. All color-carrying UI elements include text labels or icons as secondary indicators. The cycle phase colors are chosen for hue separation across all common color-vision deficiency types.

---

### 2.2 Typography

Font family: system default (`Roboto` on Android, `SF Pro` on iOS via `CupertinoTextTheme` fallback). System fonts ensure maximum performance and familiarity.

#### Type Scale -- Standard Mode

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `type.h1` | 28sp | Bold (700) | 36sp | Screen titles |
| `type.h2` | 22sp | SemiBold (600) | 28sp | Section headers |
| `type.h3` | 18sp | SemiBold (600) | 24sp | Card titles, subsection headers |
| `type.body` | 16sp | Regular (400) | 24sp | Primary body text, input text |
| `type.bodyMedium` | 16sp | Medium (500) | 24sp | Emphasized body text |
| `type.label` | 14sp | Medium (500) | 20sp | Button labels, chip text, field labels |
| `type.caption` | 12sp | Regular (400) | 16sp | Timestamps, helper text, counters |
| `type.overline` | 11sp | Medium (500) | 16sp | Section overlines, category labels |
| `type.numeric` | 24sp | Bold (700) | 32sp | Slider values, metric displays |
| `type.numericSmall` | 18sp | SemiBold (600) | 24sp | Inline metric values |

#### Type Scale -- Large-Text Mode (Gloria Persona)

When large-text mode is enabled, the following overrides apply:

| Token | Standard | Large-Text | Notes |
|---|---|---|---|
| `type.h1` | 28sp | 34sp | |
| `type.h2` | 22sp | 28sp | |
| `type.h3` | 18sp | 22sp | |
| `type.body` | 16sp | 20sp | Minimum body text in large-text mode |
| `type.bodyMedium` | 16sp | 20sp | |
| `type.label` | 14sp | 18sp | |
| `type.caption` | 12sp | 16sp | No text below 16sp in large-text mode |
| `type.overline` | 11sp | 16sp | Bumped to 16sp floor |
| `type.numeric` | 24sp | 30sp | |
| `type.numericSmall` | 18sp | 22sp | |

Large-text mode is toggled in Settings and stored in local preferences. The app also respects the system-level `textScaleFactor`, but large-text mode applies independently as a guaranteed minimum floor.

---

### 2.3 Spacing

Base unit: **8dp**. All spacing values are multiples of this base.

| Token | Value | Usage |
|---|---|---|
| `space.xxs` | 2dp | Tight internal padding (icon-to-text in chips) |
| `space.xs` | 4dp | Minimal gaps, inline element spacing |
| `space.sm` | 8dp | Default internal padding, chip grid gap |
| `space.md` | 12dp | Card internal padding, between related elements |
| `space.lg` | 16dp | Between cards, section padding, screen horizontal margin |
| `space.xl` | 24dp | Between sections, before/after headers |
| `space.xxl` | 32dp | Screen top/bottom padding, major section breaks |
| `space.xxxl` | 48dp | Spacer above FAB, bottom sheet top padding |

Screen horizontal padding: `space.lg` (16dp) on both sides, giving 343dp content width on 375dp screens and 382dp on 414dp screens.

---

### 2.4 Touch Targets

| Token | Value | Usage |
|---|---|---|
| `touch.minimum` | 48x48dp | Minimum for all interactive elements (WCAG) |
| `touch.primary` | 56x56dp | Primary action buttons, FAB |
| `touch.slider` | 28dp thumb / 44dp hit area | Slider thumb and its touch zone |
| `touch.clearance` | 8dp | Minimum space between adjacent touch targets |

---

### 2.5 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius.sm` | 8dp | Chips, small badges, input fields |
| `radius.md` | 12dp | Standard cards, buttons |
| `radius.lg` | 16dp | Modal sheets, large cards |
| `radius.full` | 999dp | Circular elements (FAB, avatar, cycle badge) |

---

### 2.6 Elevation

Using Material 3 elevation system:

| Token | Elevation | Usage |
|---|---|---|
| `elevation.flat` | 0dp | Outlined cards (most check-in cards), inline elements |
| `elevation.raised` | 1dp | Dashboard cards, timeline cards |
| `elevation.floating` | 3dp | FAB, dropdown menus |
| `elevation.modal` | 6dp | Bottom sheets, dialogs |
| `elevation.overlay` | 8dp | Photo capture overlay, full-screen modals |

Most cards use `elevation.flat` with a 1dp border (`neutral.border`) rather than shadow, for a cleaner look and better performance.

---

### 2.7 Icon Sizes

| Token | Value | Usage |
|---|---|---|
| `icon.sm` | 16dp | Inline icons, chip icons, trailing indicators |
| `icon.md` | 24dp | Standard icons in buttons, list items, cards |
| `icon.lg` | 32dp | Section header icons, feature icons |
| `icon.xl` | 48dp | Empty states, onboarding illustrations |

In large-text mode, `icon.sm` scales to 20dp and `icon.md` scales to 28dp.

---

## 3. Accessibility Standards

IgniteHealthNow serves users aged 18-85. Accessibility is not an afterthought -- it directly impacts the core user base. These standards are mandatory, not aspirational.

---

### 3.1 Contrast Requirements

- **Minimum:** WCAG AA (4.5:1 for normal text, 3:1 for large text and UI components).
- **Target:** WCAG AAA (7:1) for primary body text on default backgrounds.
- All color token combinations are pre-validated. The following pairings are guaranteed AA-compliant:
  - `neutral.textPrimary` on `neutral.background`: 14.8:1
  - `neutral.textPrimary` on `neutral.surface`: 18.5:1
  - `neutral.textSecondary` on `neutral.surface`: 5.2:1
  - `brand.primaryDark` on `neutral.surface`: 7.1:1
  - White text on `brand.primary`: 4.8:1
- Semantic colors (optimal/caution/outOfRange) are validated against their respective background tokens.

---

### 3.2 Screen Reader Annotations

Every component in section 1 includes explicit screen reader requirements. In addition, these global patterns apply:

- **Screen titles:** Every screen sets `Semantics(header: true, label: screenTitle)` on its title.
- **Form fields:** All inputs have `Semantics(label:, hint:, textField: true)`.
- **Images:** All images have `Semantics(label:)` describing content. Decorative images use `excludeFromSemantics: true`.
- **Live regions:** Alerts, insight cards, and dynamic content updates use `Semantics(liveRegion: true)`.
- **Focus order:** Follows visual top-to-bottom, left-to-right reading order. Check-in flows set explicit `FocusTraversalOrder` to match card sequence.
- **Custom actions:** Swipe-to-mark-taken on MedicationCard is exposed via `Semantics(customSemanticsActions:)`.

---

### 3.3 Reduced Motion

- All animations check `MediaQuery.of(context).disableAnimations` (which reflects the system reduced-motion setting).
- When reduced motion is on:
  - ConditionalSection show/hide is instant.
  - Card transitions are instant.
  - Slider value changes skip the animated transition.
  - SparklineTrend draws without animation.
  - Save confirmations use a static checkmark instead of an animated one.
- No animation is required for comprehension -- all meaning is conveyed statically.

---

### 3.4 Large-Text Mode

Triggered by: user toggle in Settings, or by system `textScaleFactor` exceeding 1.3.

Effects:
- All typography tokens scale per the Large-Text table in section 2.2.
- No text falls below 16sp.
- Chips in SymptomChipGrid stack to single-column layout if needed.
- QuickSelectRow wraps to multiple rows instead of horizontal scrolling.
- FAB becomes an ExtendedFloatingActionButton with a visible text label.
- SliderCard thumb grows to 32dp.
- DualRangeBar interpretation text moves below the bar.
- All icons scale per section 2.7.
- Layout reflows gracefully; no content is clipped or hidden.

---

### 3.5 Caregiver-Assisted Entry Mode

A mode where a caregiver (family member, aide) helps the user complete check-ins. Enabled in Settings.

Behavior:
- Simplified check-in flow: only core fields, conditional sections hidden by default.
- Larger touch targets: `touch.primary` (56dp) becomes the minimum for all interactive elements.
- Confirmation dialogs before submission: "Is this correct?" with a summary of entered data.
- Voice input enabled by default for FreeTextField widgets.
- Check-in sections show a brief instruction text explaining what each field captures (hidden in standard mode to reduce clutter).
- Session timeout extended (no auto-save-and-close during entry).

This mode is a UX layer -- it does not change the underlying data model. All data entered in caregiver mode is identical to standard mode.

---

### 3.6 Color-Blind Safe Palette

Requirements already addressed in the color palette design (section 2.1). Additional rules:

- Never use color as the sole differentiator between states. Always pair with: text labels, icons, patterns, or position.
- Lab range bars use hatching/texture in addition to color for the three zones (implemented as a subtle pattern overlay on DualRangeBar).
- Cycle phase badges always include the phase name text alongside the color.
- All charts provide a text summary alternative.

---

### 3.7 Haptic Feedback Patterns

Standardized haptic patterns provide non-visual confirmation:

| Action | Haptic Type | Flutter API |
|---|---|---|
| Chip selected/deselected | Light impact | `HapticFeedback.lightImpact()` |
| Slider value snapped | Selection click | `HapticFeedback.selectionClick()` |
| Check-in section completed | Medium impact | `HapticFeedback.mediumImpact()` |
| Check-in submitted/saved | Heavy impact (single) | `HapticFeedback.heavyImpact()` |
| Alert banner appeared | Heavy impact (double) | Two `heavyImpact()` calls, 100ms apart |
| Error/validation failure | Vibrate | `HapticFeedback.vibrate()` |

Haptics respect the system haptic feedback setting. If disabled at the OS level, no haptics fire.

---

## 4. Layout Patterns

---

### 4.1 Card-Based Check-In Flow

The core daily check-in uses a vertically scrolling list of cards, one card per input section. This is the most important layout pattern in the app.

**Structure:**
```
[ProgressStepper]                   -- fixed at top, below app bar
[CycleDayBadge]                     -- in app bar (if cycle tracking enabled)
[AlertBanner]                       -- if any alerts, top of scroll area
[SectionHeader: Vitals]
  [SliderCard: Energy]
  [SliderCard: Pain]
  [BodyFeelingSelector]
[SectionHeader: Symptoms]
  [SymptomChipGrid]
  [ConditionalSection: Hair details]
  [ConditionalSection: Digestive details]
[SectionHeader: Medications]
  [MedicationCard] x N
[SectionHeader: Notes]
  [FreeTextField]
[Save Button]                       -- full-width, prominent
[space.xxxl]                        -- bottom padding for FAB clearance
```

**Rules:**
- Cards have `space.lg` (16dp) vertical gap between them.
- Sections separated by `space.xl` (24dp).
- The save button is always visible without scrolling past it -- if content is long, it remains at the natural scroll bottom (no sticky footer in check-in).
- The ProgressStepper scrolls away with content (not fixed-position) to maximize vertical space.

---

### 4.2 Bottom Sheet Pattern

Used for detail entry that branches off the main flow. Appears as a modal bottom sheet with a drag handle.

**When to use:**
- Conditional detail entry (e.g., hair loss specifics when the hair loss chip is selected).
- Medication detail editing.
- Lab result entry.
- Any input that would disrupt the check-in card flow if inline.

**Structure:**
- Drag handle: centered, 32dp wide, 4dp tall, `radius.full`.
- Top padding: `space.xxxl` (48dp).
- Content area: scrollable if needed.
- Maximum height: 85% of screen height.
- Minimum height: wraps content.
- Background: `neutral.surface` with `radius.lg` top corners.
- Scrim: 50% black overlay on underlying content.

---

### 4.3 Full-Screen Modal -- Photo Capture

PhotoCaptureGuide occupies the full screen, overlaying the camera preview.

**Structure:**
- Camera preview fills the screen.
- Semi-transparent overlay with silhouette guide centered.
- Guidance text: top-center, white text on dark scrim, `type.body`.
- Skip button: top-right, white icon on semi-transparent circle.
- Shutter button: bottom-center, 64dp, white circle with subtle border.
- Flash toggle: bottom-left, 48dp.
- Gallery button (pick from library): bottom-right, 48dp.

---

### 4.4 Dashboard Grid Layout

The dashboard (home screen) uses a mixed grid/list layout.

**Structure:**
```
[App Bar with CycleDayBadge]
[AlertBanner]                       -- if any urgent alerts
[InsightCard]                       -- most recent/important insight (full width)
[2-column grid]
  [Metric card: Energy]   [Metric card: TSH]
  [Metric card: Temp]     [Metric card: Weight]
[Section: Recent Check-ins]         -- list of TimelineCards
[Section: Upcoming]                 -- next labs due, cycle predictions
[space.xxxl]                        -- FAB clearance
```

**Grid rules:**
- 2-column grid uses `space.lg` (16dp) gap.
- Each metric card is a square (or close to it) containing a SparklineTrend and current value.
- Full-width cards span both columns.
- Grid adapts: on 375dp screens, metric cards may stack to single column if content requires it.

---

### 4.5 List View -- History & Timeline

Used for viewing historical data: past check-ins, lab history, medication changes.

**Structure:**
- Grouped by date with sticky date headers.
- Each item is a TimelineCard.
- Vertical timeline connector line on the left side (decorative).
- Pull-to-refresh at top.
- Infinite scroll / "Load more" at bottom.
- Filter chips at top (type filter: All / Labs / Meds / Symptoms).

---

### 4.6 Tab Navigation -- Bottom Tabs

The app uses 4-5 bottom tabs for primary navigation.

**Proposed tabs:**
1. **Home** (dashboard)
2. **Journal** (daily check-ins, history)
3. **Labs** (lab results, trends)
4. **Insights** (patterns, intelligence)
5. **More** (settings, profile, provider portal, reports)

**Rules:**
- Bottom navigation bar: Material 3 `NavigationBar`.
- Each tab has an icon and a text label (never icon-only).
- Active tab indicated by filled icon + tinted background pill + label.
- Tab bar height: 80dp (accommodating label below icon).
- In large-text mode, labels remain visible (they do not truncate).
- FAB floats above the tab bar with `space.lg` clearance.

---

## 5. Animation & Transitions

All animations serve functional purposes (spatial continuity, state feedback, attention guidance). None are decorative.

---

### 5.1 Check-In Card Transitions

- Cards entering the viewport during scroll use no animation (instant paint).
- Section expand/collapse: 250ms ease-in-out height animation.
- New conditional sections appearing: 200ms slide-down from 0 to full height.

### 5.2 Slider Interaction Feedback

- Thumb tracks finger with no artificial delay.
- Value label updates in real-time during drag.
- On release (snap to integer): 100ms spring animation to nearest integer position.
- Ghost marker (previous value) is static, no animation.

### 5.3 Chip Selection Animation

- On select: 150ms scale from 1.0 to 1.05, then back to 1.0. Fill color transition: 150ms.
- Checkmark icon fades in: 100ms.
- On deselect: reverse of the above.

### 5.4 Save Confirmation Animation

- On save: button transitions from "Save" to a checkmark icon with a brief (300ms) circular wipe.
- After 1 second, navigates away or resets.
- In reduced motion: button text changes to "Saved" with a static checkmark, no wipe animation.

### 5.5 Screen Transitions

- Tab switches: Material 3 default (cross-fade, 300ms).
- Push navigation (into detail screens): Material 3 default (slide from right, 300ms).
- Bottom sheet: Material 3 default (slide up with deceleration curve).
- Modal: fade + scale from 0.95 to 1.0, 200ms.

### 5.6 Reduced Motion Summary

When system reduced motion is enabled, ALL of the above are replaced with instant state changes (0ms duration). No exceptions.

---

## 6. Responsive Notes

---

### 6.1 Scope for MVP

- **Phone portrait only.** 375dp minimum width, 414dp target width.
- No tablet-optimized layouts.
- No landscape layouts.
- The provider portal (web) will have its own design system document.

### 6.2 Breakpoints (For Future Reference)

Not implemented for MVP, but documented for planning:

| Breakpoint | Width | Layout |
|---|---|---|
| Phone small | 320-374dp | Single column, reduced padding (12dp) |
| Phone standard | 375-413dp | Single column, standard padding (16dp) |
| Phone large | 414-599dp | Single column, standard padding (16dp) |
| Tablet (future) | 600-1023dp | TBD |
| Desktop (future) | 1024dp+ | TBD (provider portal) |

### 6.3 Content Reflow Rules

- All layouts are single-column for MVP.
- Text wraps, never truncates (except: FreeTextField content in list previews may truncate with "...").
- Images scale to fit container width maintaining aspect ratio.
- Horizontal scrolling is limited to QuickSelectRow (and only in standard text mode -- wraps in large-text mode).
- Bottom sheets and modals are full-width, edge-to-edge with horizontal padding.

### 6.4 Safe Areas

- Respect `MediaQuery.of(context).padding` for notch/dynamic island, home indicator, and status bar.
- Bottom tab bar sits above the home indicator safe area.
- FAB position accounts for bottom safe area.
- Check-in content area accounts for both top safe area and ProgressStepper height.

---

## Appendix: Token Implementation Notes

### File Organization

```
lib/
  theme/
    tokens/
      colors.dart          -- Color constants
      typography.dart       -- TextStyle definitions
      spacing.dart          -- Spacing constants
      elevation.dart        -- Elevation constants
      radius.dart           -- BorderRadius constants
      touch.dart            -- Touch target sizes
      icons.dart            -- Icon size constants
    ignite_theme.dart       -- ThemeData assembly
    large_text_theme.dart   -- Large-text mode overrides
  widgets/
    slider_card.dart
    symptom_chip_grid.dart
    quick_tap_selector.dart
    conditional_section.dart
    medication_card.dart
    photo_capture_guide.dart
    dual_range_bar.dart
    sparkline_trend.dart
    insight_card.dart
    alert_banner.dart
    progress_stepper.dart
    cycle_day_badge.dart
    timeline_card.dart
    section_header.dart
    free_text_field.dart
    quick_select_row.dart
    body_feeling_selector.dart
    water_retention_selector.dart
```

### Theme Switching

The app supports two theme configurations:
1. **Standard mode:** Default token values.
2. **Large-text mode:** Overridden token values per section 2.2.

Both derive from the same base `ThemeData` with targeted overrides. The mode is stored in `SharedPreferences` and toggled via Settings. The `MaterialApp` rebuilds with the appropriate theme on toggle.

Dark mode is not in scope for MVP.
