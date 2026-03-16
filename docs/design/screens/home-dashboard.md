# Home Dashboard Screen Specs

**Version:** 1.0
**Last updated:** 2026-03-16
**Screen IDs:** HOM-001 through HOM-021
**PRD sections:** 16.1, 16.2
**Design system:** `01-design-system.md`

---

## Overview

The home dashboard is the app's primary surface. It is organized as a tabbed view with four views: Daily (home), Trends, Labs, and Cycle. Each tab is swipeable or tappable. The Daily view is the default landing screen.

**Tab bar:** Fixed at the top of the content area, below the app bar. Four tabs: Daily | Trends | Labs | Cycle. The Cycle tab is only visible if cycle tracking is enabled. Tab indicator uses `brand.primary`.

**Shared app bar:** "IgniteHealthNow" brand mark (left), notification bell (right, with badge count for unread alerts), profile avatar (right). CycleDayBadge (Component 1.12) in the app bar center when cycle tracking is active.

**FAB:** FloatingActionButton (Component 1.13) for food photo capture, anchored bottom-right, persistent across all dashboard tabs.

---

## HOM-001: Daily Dashboard (Home)

**Screen ID:** HOM-001
**Priority:** P0
**Phase:** 1
**Parent:** NAV-001 (bottom nav Home tab)

The Daily view is what the user sees every time they open the app. It answers: "What have I done today, how am I doing, and what should I pay attention to?"

### Layout

| Zone | Content | Height |
|------|---------|--------|
| App bar | Brand, notifications, profile, CycleDayBadge | 56dp |
| Tab bar | Daily (active) / Trends / Labs / Cycle | 48dp |
| Check-in status | Morning/Evening check-in cards | ~120dp |
| Symptom snapshot | Current metrics with trend arrows | ~200dp |
| Pattern alerts | Active alerts from intelligence layer | Variable |
| Micro-insight | Daily insight card | ~100dp |
| Weather note | Correlation note if relevant | ~48dp |

Content is scrollable. All zones stack vertically.

### Zone: Check-in Status

Two side-by-side cards spanning full width.

**Morning card:**
- States: Not started (outline, "Morning Check-in" CTA) | In progress (partial fill, "Continue" CTA) | Complete (filled `semantic.optimal` tint, summary metrics)
- Complete state shows: Energy {n}/10, Brain fog {n}/10, Mood emoji, time completed
- Tapping complete card opens JRM-011 in read mode

**Evening card:**
- Same states as morning.
- Complete state shows: Energy {n}/10, Bloating {n}/10, Mood {n}/10, time completed
- Before 4pm: card shows "Available this evening" in `color.textTertiary`
- After 4pm, not started: primary CTA "Evening Check-in" with `brand.accent` highlight

### Zone: Symptom Snapshot

A compact grid of the user's top tracked metrics, each as a small metric card.

**Metric cards** (2 columns, 3-4 rows):
Each card contains:
- Metric name (`type.caption`, 12sp)
- Current value (`type.valueDisplay`, 24sp bold)
- SparklineTrend (Component 1.8) showing 7-day trend
- Trend arrow: up arrow in `semantic.outOfRange` (worsening), right arrow in `color.textSecondary` (stable), down arrow in `semantic.optimal` (improving)

**Default metrics shown** (user-configurable in settings):
| Metric | Source | Trend Direction Logic |
|--------|--------|----------------------|
| Energy | Morning + Evening average | Higher = better (down arrow = worsening) |
| Brain fog | Morning entry | Lower = better (up arrow = worsening) |
| Bloating | Evening entry | Lower = better (up arrow = worsening) |
| Mood | Evening entry | Higher = better |
| Sleep quality | Morning entry | Higher = better |
| Pain/stiffness | Morning entry | Lower = better |

Trend arrows compare today's value to the 7-day rolling average. Delta >= 2 points triggers the colored arrow; smaller deltas show the stable (right) arrow.

**Interaction:** Tapping any metric card navigates to HOM-007 (Symptom Trend Chart) pre-filtered to that metric.

### Zone: Pattern Alerts

Displays active intelligence alerts. Phase 2 feature, but the zone is reserved in Phase 1 layout.

**Phase 1 (placeholder):** Hidden. No alerts available until intelligence layer ships.

**Phase 2+:**
- Up to 3 active alerts shown, each as an AlertBanner (Component 1.10) or compact InsightCard (Component 1.9).
- Alert types: Four Legs flags (INT-002), vicious cycle alerts (INT-007 through INT-011), bloating correlation daily insight (INT-012), medication change monitoring (INT-026).
- Sorted by severity: `urgent` first, then `noteworthy`, then `informational`.
- "View all" link navigates to INT-001 (Intelligence Feed).
- Each alert is tappable to its detail screen (INT-028).

### Zone: Micro-Insight of the Day (HOM-005)

**Screen ID:** HOM-005
**Priority:** P1
**Phase:** 2

A single InsightCard (Component 1.9) surfacing the most relevant daily insight from the Pattern Analysis Agent.

**Content:** One insight per day, selected by the intelligence layer based on recency and relevance. Categories: pattern detection, positive reinforcement (INT-027), lifestyle correlation (INT-023), weather correlation note.

**Example insights:**
- "Your brain fog has been below 3/10 for 5 consecutive days — the lowest sustained stretch since you started tracking."
- "Afternoon crashes have decreased since you started timing meals at regular intervals."
- "Today's barometric pressure dropped significantly. Your joint pain tends to spike on days like this."

**Interaction:** Tap to expand detail (HOM-006 — bottom sheet with full explanation, data chart, and optional book chapter link).

**Empty state:** If no insight is available (insufficient data or no noteworthy patterns), this zone is hidden. Not replaced with a placeholder.

### Zone: Weather Correlation Note

A subtle single-line note at the bottom of the scroll area. Only shown when a weather-symptom correlation has been established for this user (Phase 2+).

- Format: "{weather icon} {temperature}. {correlation note if relevant}."
- Example: "42 F, cloudy. Your joint pain tends to spike on cold days like this."
- If no correlation established: shows only weather info, no correlation note.
- Tappable: navigates to a weather-symptom detail view (future, not in current screen inventory).

### Cycle Day Context

When cycle tracking is active:
- CycleDayBadge in app bar: "Day {n} - {Phase}"
- If in PMS window: subtle banner below tab bar in `cycle.lutealBg`: "PMS window (Day {n} of cycle). Track PMS symptoms in tonight's check-in."
- If period active: banner in `cycle.menstrualBg`: "Period Day {n}."

### States

**HOM-019: Dashboard Empty State — First Day**
- Screen ID: HOM-019
- No check-in data yet. No trends. No alerts.
- Layout:
  - Morning check-in CTA card (prominent, `brand.accent` border): "Start your first morning check-in"
  - Brief explanation: "Your dashboard comes alive as you journal. After a few days, you'll see trends and patterns here."
  - 3 preview cards showing what the dashboard will look like with data (use illustration/placeholder charts, muted at 30% opacity)
  - FAB for food photo still active

**Loading state (NAV-008):**
- Skeleton shimmer for metric cards and check-in status
- Tab bar renders immediately

**Error state (NAV-006):**
- If offline: "You're offline. Showing your most recent data." with cached values displayed.
- If server error: NAV-007 error state with retry button.

### Accessibility

- Check-in status cards announce: "Morning check-in: {complete/not started}. {summary if complete}."
- Metric cards announce: "{metric name}: {value} out of 10. Trend: {improving/stable/worsening} over 7 days."
- Alert banners use live regions
- Tab navigation via swipe or tap; announced on switch

---

## HOM-002: Trends View (7d/30d/90d/custom)

**Screen ID:** HOM-002
**Priority:** P0
**Phase:** 1
**Parent:** HOM-001 tab

The Trends view provides longitudinal visualization of symptom data. It answers: "How am I doing over time? Is anything getting better or worse?"

### Layout

| Zone | Content |
|------|---------|
| Tab bar | Daily / Trends (active) / Labs / Cycle |
| Time range selector | 7d / 30d / 90d / Custom pill toggles |
| Primary chart | Symptom severity line chart (HOM-007) |
| Secondary charts | Energy pattern frequency (HOM-008), Brain fog trend (HOM-009) |
| Correlation chart | Sleep vs. Energy scatter (HOM-011) or Bloating timeline (HOM-018) |
| Date picker | HOM-021 (if Custom selected) |

### Time Range Selector

- Horizontal pill row at top of content: 7d | 30d | 90d | Custom
- Default: 30d for users with 30+ days of data, otherwise 7d
- "Custom" opens HOM-021 date range picker (bottom sheet with start/end date selection)
- Selected pill uses `brand.primary` fill; others use outline style

### HOM-007: Symptom Trend Chart (Interactive)

**Screen ID:** HOM-007
**Priority:** P0
**Phase:** 1

**Chart type:** Multi-line chart (Component 16.2: Line charts)
**Data:** Up to 5 selectable symptom metrics plotted simultaneously on a 0-10 Y axis. X axis = dates within selected range.

**Default lines:** Energy, Brain fog, Bloating, Mood, Sleep quality. User can toggle lines on/off via chip selectors below the chart.

**Interaction:**
- Tap on a data point to see exact value and date in a tooltip
- Long-press to see all metric values for that date in a detail popover
- Horizontal scroll if the time range exceeds screen width (90d+ on phone)
- Pinch to zoom on X axis

**Visual:**
- Each line uses a distinct color from the palette (not just hue variation)
- Line thickness: 2dp. Data point dots: 6dp diameter.
- Missing data days shown as gaps in the line (dotted connection between known points)
- Y axis: 0-10 with gridlines at 2, 4, 6, 8
- Current day highlighted with a vertical dashed line

**Cycle overlay** (Phase 2, if cycle tracking active):
- Background color bands behind the chart showing cycle phases: `cycle.menstrualBg`, `cycle.follicularBg`, `cycle.ovulatoryBg`, `cycle.lutealBg`
- Phase labels at top of bands in `type.caption`

**Empty state:** If < 3 data points in the selected range: "Keep journaling to see your trends. {n} more days of data needed for this view."

### HOM-008: Energy Pattern Frequency Chart

**Screen ID:** HOM-008
**Priority:** P1
**Phase:** 1

**Chart type:** Horizontal bar chart or donut chart.
**Data:** Distribution of energy pattern selections (from JRE-002) within the selected time range.

**Bars/segments:**
- Steady (green tint)
- Morning crash
- Afternoon crash (highlighted if > 30% of days — insulin resistance signal)
- Multiple crashes
- Steady decline
- Low all day

**Content:** Percentage labels on each bar. Total days in range shown as subtitle.

**Insight callout:** If "Afternoon crash" > 30%: InsightCard (1.9) below the chart: "Afternoon crashes account for {n}% of your days. This pattern is commonly associated with blood sugar instability."

**Empty state:** "Start logging your energy pattern in evening check-ins to see this chart."

### HOM-009: Brain Fog Trend Line

**Screen ID:** HOM-009
**Priority:** P1
**Phase:** 1

**Chart type:** Single-line chart with area fill.
**Data:** Morning brain fog severity (0-10) over the selected time range.

**Visual:**
- Line in a distinct color (suggestion: muted blue-gray)
- Area fill below the line at 15% opacity
- Rolling 7-day average shown as a dashed overlay line
- Threshold line at severity 6 (dashed, `semantic.caution`) to flag sustained high fog

**Interaction:** Same as HOM-007 (tap for tooltip, long-press for daily detail).

**Empty state:** "Brain fog data appears after morning check-ins."

### HOM-010: BBT Trend with Cycle Overlay

**Screen ID:** HOM-010
**Priority:** P1
**Phase:** 2

**Chart type:** Line chart with cycle-phase background bands.
**Data:** Waking basal body temperature (from morning check-in, optional field) plotted daily.

**Visual:**
- Temperature line with data point dots
- Y axis: typical BBT range (96.0-99.0 F) with gridlines at 0.5 degree intervals
- Cycle phase color bands behind the chart
- Ovulation shift highlighted: if a clear 0.3+ degree sustained rise is detected, annotate with "Possible ovulation shift" marker

**Empty state:** "Log your waking temperature in morning check-ins to see your BBT trend. A basal body thermometer gives the best results."

### HOM-011: Sleep Quality vs Energy Scatter Plot

**Screen ID:** HOM-011
**Priority:** P2
**Phase:** 2

**Chart type:** Scatter plot (Component 16.2).
**Data:** Each point = one day. X axis = sleep quality (0-10). Y axis = next-day energy (0-10).

**Visual:**
- Points colored by recency (recent = `brand.primary`, older = faded)
- Trend line (linear regression) overlaid to show correlation strength
- Correlation coefficient displayed: "r = {value}" with plain-language interpretation: "Strong positive correlation" / "Moderate" / "Weak" / "No clear correlation"

**Interaction:** Tap a point to see the date and both values.

**Empty state:** "After 14+ days of data, you'll see how your sleep quality relates to next-day energy."

### HOM-018: Bloating Correlation Timeline

**Screen ID:** HOM-018
**Priority:** P1
**Phase:** 2

**Chart type:** Dual-axis timeline.
**Data:** Bloating severity (0-10, left Y axis) overlaid with food trigger tags (categorical, bottom annotations) and stress level (0-10, right Y axis).

**Visual:**
- Bloating severity as a bar chart (vertical bars per day)
- Stress level as a line overlay
- Food trigger chips shown as icons below the X axis on days they were tagged (gluten icon, dairy icon, etc.)
- Days where bloating > 7 highlighted with `semantic.caution` bar color

**Interaction:** Tap a bar to see full daily detail (bloating value, food triggers, stress level, body feeling).

**Empty state:** "Track bloating in evening check-ins to build your correlation timeline."

### HOM-021: Date Range Picker

**Screen ID:** HOM-021
**Priority:** P1
**Phase:** 1

**Presentation:** Bottom sheet modal.
**Content:**
- Two date selectors (start date, end date)
- Quick presets: Last 7 days, Last 30 days, Last 90 days, This cycle, Last cycle, Year to date
- "Apply" primary button
- Range validation: start must be before end, range must contain at least 3 days of data

---

## HOM-003: Labs Dashboard View

**Screen ID:** HOM-003
**Priority:** P0
**Phase:** 1
**Parent:** HOM-001 tab

The Labs view displays lab results, auto-calculated ratios, and the Four Legs assessment. It answers: "What do my labs actually mean, and what's changing?"

### Layout

| Zone | Content |
|------|---------|
| Tab bar | Daily / Trends / Labs (active) / Cycle |
| Last lab date | "Most recent labs: {date}" header |
| Lab timeline | HOM-013 — scrollable dual-range bar list |
| Ratio trends | HOM-014 — ratio trend lines |
| Four Legs status | HOM-012 — status dashboard (Phase 2) |
| Add labs CTA | "Enter new lab results" button -> LAB-001 |

### HOM-013: Lab Timeline (Dual-Range Bars)

**Screen ID:** HOM-013
**Priority:** P0
**Phase:** 1

**Content:** A vertical list of all lab values from the user's most recent lab entry. Each value displayed as a DualRangeBar (Component 1.7).

**Grouping:** Labs grouped by panel category with SectionHeader (Component 1.15):
- Thyroid Panel: TSH, Free T4, Free T3, Reverse T3, Total T4, Total T3
- Metabolic Panel: Fasting glucose, Fasting insulin, Hemoglobin A1C, Iron/ferritin, TIBC, B12, Vitamin D
- Hormonal Panel: Estradiol (E2), Progesterone, Testosterone, DHEA-S
- Liver & Lipid Panel: ALT, AST, GGT, Total cholesterol, LDL, HDL, Triglycerides
- Autoimmune Markers: TPO antibodies, Thyroglobulin antibodies

**Per-value display:**
- DualRangeBar showing value position against conventional range (lighter bar) and functional optimal range (darker bar)
- Interpretation text: "Within functional optimal" (green) / "Outside optimal, within conventional" (amber) / "Outside conventional range" (red-orange)
- SparklineTrend (1.8) showing this value's history across all lab entries (if 2+ entries exist)

**Interaction:**
- Tap any lab value to expand detail: full value, date, both ranges, historical values list, and trend chart
- Long-press for educational tooltip: "What is {lab name}? {one-sentence explanation}. Chapter {n}."

**Time navigation:** If multiple lab entries exist, a horizontal date pill selector at the top allows switching between lab dates.

### HOM-014: Ratio Trend Lines

**Screen ID:** HOM-014
**Priority:** P0
**Phase:** 1

**Chart type:** Multi-line chart showing auto-calculated ratios over time.

**Ratios displayed:**
| Ratio | Formula | Significance |
|-------|---------|-------------|
| FT3:rT3 | Free T3 / Reverse T3 | Conversion efficiency. Ratio > 20 optimal. |
| TG:HDL | Triglycerides / HDL | Insulin resistance proxy. Ratio < 2 optimal. |
| Pg/E2 | Progesterone / Estradiol | Estrogen dominance marker. Ratio > 200 optimal (luteal). |
| FT4:FT3 | Free T4 / Free T3 | Peripheral conversion efficiency. |

**Visual:**
- Each ratio as a separate mini-chart (stacked vertically)
- Horizontal reference line at the optimal threshold for each ratio
- Value zone coloring: optimal zone in `semantic.optimalBg`, caution in `semantic.cautionBg`
- Data points at each lab entry date (not daily — these are sparse data)

**Interaction:** Tap a ratio chart to expand into a full-screen detail view with explanation text and book chapter link.

**Empty state:** "Enter lab results to see your ratio trends. Ratios are auto-calculated when the required values are available."

### HOM-012: Four Legs Status Dashboard

**Screen ID:** HOM-012
**Priority:** P0
**Phase:** 2

**Chart type:** Radar/spider chart (Component 16.2) with 4 axes, one per Leg.

**The Four Legs:**
| Leg | Status Inputs | Color Logic |
|-----|--------------|-------------|
| Insulin Resistance | Fasting glucose, fasting insulin, TG:HDL ratio, energy pattern (afternoon crashes), HbA1C | Green (all optimal) / Yellow (1-2 markers borderline) / Red (markers out of range) |
| Iron Dysregulation | Ferritin, iron, TIBC, symptoms (hair loss, fatigue, cold extremities) | Same color logic |
| Homocysteine Elevation | Homocysteine, B12, folate, symptoms | Same color logic |
| Liver Dysfunction | ALT, AST, GGT, triglycerides, symptoms (skin, digestion, estrogen signs) | Same color logic |

**Visual:**
- Radar chart with 4 axes radiating from center
- Each axis colored green/yellow/red based on status
- Center label: "Four Legs Assessment"
- Below chart: 4 compact status rows, one per Leg, each showing: Leg name, status color dot, summary text ("2 of 3 markers optimal"), tap to expand

**Interaction:** Tapping a Leg navigates to its detail screen (INT-003 through INT-006).

**Data requirements:** At least one lab entry with relevant markers. Mixed state is valid (e.g., Insulin Resistance assessable from labs, Iron Dysregulation assessable from labs + symptoms, Homocysteine unknown if never tested).

**Empty state:** Each Leg that cannot be assessed shows as gray with text: "Needs: {list of missing labs}". Tapping navigates to LAB-012 (Suggested Next Labs).

### HOM-020: Dashboard Empty State — Awaiting Labs

**Screen ID:** HOM-020
**Priority:** P0
**Phase:** 1

Shown on the Labs tab when no lab results have been entered.

**Content:**
- Illustration: empty clipboard or lab tube icon (muted, 30% opacity)
- Heading: "No lab results yet"
- Body: "Enter your lab results to see how your values compare to both conventional and functional optimal ranges. The app auto-calculates key ratios your doctor may not be tracking."
- Primary CTA: "Enter Lab Results" -> LAB-001
- Secondary text: "Don't have recent labs? Chat with the app about which ones to request." (Phase 3 — links to CHT-005)
- Helpful list: "Key labs to request" with the most important thyroid, metabolic, and hormonal panels listed as a checklist

---

## HOM-004: Cycle Dashboard View

**Screen ID:** HOM-004
**Priority:** P0
**Phase:** 2
**Parent:** HOM-001 tab
**Condition:** Tab only visible when cycle tracking is enabled.

The Cycle view maps symptoms onto the menstrual cycle. It answers: "Are my symptoms worse at certain points in my cycle? Is estrogen dominance a factor?"

### Layout

| Zone | Content |
|------|---------|
| Tab bar | Daily / Trends / Labs / Cycle (active) |
| Cycle selector | Current cycle / Previous cycles dropdown |
| Calendar heatmap | HOM-015 |
| Symptom overlay | Symptom charts with phase bands |
| Cycle length trend | HOM-016 |
| Estrogen dominance heatmap | HOM-017 |
| PMS comparison | Cross-cycle PMS severity |

### HOM-015: Cycle Calendar Heatmap

**Screen ID:** HOM-015
**Priority:** P0
**Phase:** 2

**Chart type:** Calendar heatmap (one row per cycle, columns = cycle days).

**Visual:**
- Each cell = one cycle day, colored by overall symptom severity (composite score from that day's check-in)
- Color scale: `semantic.optimalBg` (low severity) through `semantic.cautionBg` to `semantic.outOfRangeBg` (high severity)
- Phase bands overlaid: menstrual, follicular, ovulatory, luteal using cycle phase colors at 20% opacity
- Current day highlighted with a border ring
- Period days marked with a dot

**Multiple cycles:** If 2+ complete cycles exist, stack rows vertically (most recent on top). This reveals whether symptom patterns repeat at the same cycle points.

**Interaction:**
- Tap a cell to see that day's symptom summary in a tooltip
- Swipe between cycles

**Empty state:** "Complete one full cycle to see your calendar heatmap. Keep logging daily to build the picture."

### HOM-016: Cycle Length Trending Chart

**Screen ID:** HOM-016
**Priority:** P1
**Phase:** 2

**Chart type:** Bar chart with trend line.
**Data:** Cycle length (days) per completed cycle.

**Visual:**
- Vertical bars, one per completed cycle, labeled with cycle number or start date
- Horizontal reference line at 28 days (typical)
- Trend line overlaid to show if cycles are lengthening, shortening, or stable
- Color: bars within normal range (25-35 days) in `semantic.optimal`; shorter/longer in `semantic.caution`

**Insight:** If cycle length variability > 5 days across recent cycles: InsightCard below chart: "Your cycle length has been variable. Irregular cycles can be associated with thyroid dysfunction and hormonal imbalance."

**Empty state:** "After 2+ completed cycles, you'll see your cycle length trending here."

### HOM-017: Estrogen Dominance Symptom Cluster Heatmap

**Screen ID:** HOM-017
**Priority:** P1
**Phase:** 2

**Chart type:** Grid heatmap.
**Data:** Rows = estrogen dominance symptoms (breast tenderness, water retention, mood crash, bloating, etc.). Columns = cycle days. Cell color = severity.

**Visual:**
- Each row is a tracked estrogen dominance symptom
- Columns grouped into cycle phases with phase header labels
- Cell intensity maps to severity (0 = white/transparent, 10 = deep phase color)
- Luteal phase columns highlighted to show whether symptoms cluster pre-menstrually

**Intelligence integration:** If symptoms cluster heavily in luteal phase: InsightCard: "Your estrogen dominance symptoms concentrate in the luteal phase. This pattern suggests the estrogen-progesterone ratio may be suppressing thyroid function cyclically."

**Empty state:** "Track symptoms through 2+ complete cycles to see how estrogen dominance symptoms map to your cycle phases."

### PMS Severity Cross-Cycle Comparison

Not a separate screen ID. Rendered as a compact chart within HOM-004.

**Chart type:** Line chart.
**Data:** Daily PMS severity score (from CYC-004 evening check-in) plotted per cycle, overlaid to compare across cycles.

**Visual:**
- X axis: days before period start (normalized across cycles)
- Y axis: PMS severity 0-10
- Each cycle as a separate line, most recent cycle in `brand.primary`, older cycles faded
- Average line dashed

**Insight:** If PMS severity is trending upward across cycles: "Your PMS severity has increased over your last {n} cycles. Worsening PMS can indicate increasing estrogen dominance."

---

## Cross-Dashboard Features

### Navigation Between Views

- Swipe left/right between adjacent tabs
- Tab tap for direct navigation
- All tabs share the same app bar (notifications, profile, CycleDayBadge)
- FAB (food photo capture) visible on all tabs
- Bottom navigation bar (NAV-001) persistent below all dashboard content

### Intelligence Alert Integration

Active intelligence alerts (Phase 2+) can appear on any dashboard tab as contextual overlays:
- Daily: AlertBanner at top for urgent items, InsightCard in feed for informational
- Trends: InsightCard below relevant chart when a pattern is detected
- Labs: AlertBanner when a ratio crosses a threshold
- Cycle: InsightCard when cycle-phase patterns emerge

### Data Refresh

- Pull-to-refresh gesture on any tab triggers sync
- Auto-refresh on tab switch if data is > 5 minutes stale
- Optimistic UI: show cached data immediately, update when sync completes
- Refresh indicator: standard Material pull-to-refresh spinner

### Universal Empty States

Each sub-chart/component has its own contextual empty state (documented per component above). The general pattern for all empty states:
1. Muted illustration or placeholder visualization
2. Clear explanation of what data is needed
3. CTA to the action that generates the data (e.g., "Start evening check-in", "Enter lab results")
4. No guilt, no pressure: "When you're ready" tone

### Accessibility

- All charts have comprehensive text alternatives (see Component specs in design system)
- Chart colors are supplemented with patterns or labels for color-blind users
- Trend arrows always include text direction, not just icon
- Radar chart (Four Legs) provides a text-list alternative for screen readers
- Tab switching announced: "Switched to {tab name} view"
- Interactive charts support explore-by-touch for screen reader users (data points announced on touch)

---

*End of Home Dashboard Screen Specs v1.0*
