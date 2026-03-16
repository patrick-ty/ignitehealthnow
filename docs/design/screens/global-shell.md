# Global Shell — App Frame & Navigation

**Screen IDs:** NAV-001, NAV-002, NAV-003, NAV-004, MOD-003
**Version:** 1.0
**Date:** March 16, 2026
**Inherits:** `01-design-system.md` (all tokens, components, accessibility standards)

This document specifies the persistent app shell that wraps every screen in IgniteHealthNow. The shell consists of the bottom tab bar, the camera FAB, the top app bar, the notification tray, and the quick symptom capture overlay. All other screen specs exist inside this frame.

---

## 1. Bottom Tab Bar (NAV-001)

### 1.1 Structure

The bottom tab bar uses the Material 3 `NavigationBar` widget and is visible on all primary screens. It disappears only during full-screen flows (check-in entry, photo capture, onboarding).

**Tab configuration — 5 positions:**

| Position | Label | Icon (inactive) | Icon (active) | Destination | Notes |
|----------|-------|-----------------|---------------|-------------|-------|
| 1 | Home | `Icons.home_outlined` | `Icons.home` | HOM-001 (Daily Dashboard) | Default landing tab after onboarding |
| 2 | Journal | `Icons.edit_note_outlined` | `Icons.edit_note` | Journal hub (morning/evening history, JRM/JRE list) | Badge dot if check-in is pending |
| 3 | *(FAB zone)* | — | — | — | No tab here; this position is reserved for the camera FAB (see section 2). The NavigationBar renders 4 real destinations with a spacer in the center. |
| 4 | Labs | `Icons.science_outlined` | `Icons.science` | LAB-010 (Lab History List) | Badge dot if labs are due |
| 5 | More | `Icons.menu_outlined` | `Icons.menu` | STG-001 (Settings Hub) | Gateway to Settings, Reports, Provider Sharing, Diagnoses, About |

### 1.2 Visual Specifications

| Property | Value |
|----------|-------|
| Bar height | 80dp (icon + label + safe area) |
| Background | `neutral.surface` with 1dp top border in `neutral.border` |
| Active indicator | Filled pill behind active icon, tinted `brand.primary` at 12% opacity |
| Icon size | `icon.md` (24dp), scales to 28dp in large-text mode |
| Label typography | `type.caption` (12sp / 16sp in large-text mode) |
| Label visibility | Always visible; never icon-only |
| Badge dot | 8dp circle in `insight.actionRequired`, positioned top-right of icon |

### 1.3 Behavior

- **Tap active tab:** Scrolls the current screen to top. If already at top, no action.
- **Tab switch animation:** Material 3 cross-fade, 300ms (instant if reduced motion is on).
- **State preservation:** Each tab maintains its own navigation stack. Switching tabs does not reset scroll position or navigation depth within that tab.
- **Deep links:** Deep links into a tab push onto that tab's stack and activate the tab.
- **Keyboard shortcut (accessibility):** Tab key cycles through bottom tabs; Enter activates.

### 1.4 Accessibility

- Each tab: `Semantics(label: "{Tab name}, tab {n} of 5, {active/inactive}")`.
- Badge dot includes semantic: "has pending items" appended to the tab label.
- Touch targets: Each tab zone is at least 48dp wide and the full bar height.
- In large-text mode, label text scales but does not truncate. Layout adapts by allowing text to wrap to 2 lines if needed.

---

## 2. Floating Action Button — Camera FAB (NAV-002)

### 2.1 Purpose

The FAB provides instant access to photo capture (food or visual health) from any screen in the app. It implements the "Moment-Based Capture" rhythm from PRD Section 3A.2 — near-zero friction (~5 seconds), no navigation required.

### 2.2 Visual Specifications

| Property | Value |
|----------|-------|
| Size | 56x56dp (standard), ExtendedFAB with text label in large-text mode |
| Shape | Circular (`radius.full`) |
| Background | `brand.accent` (#F4A261) |
| Icon | `Icons.camera_alt`, white, `icon.md` (24dp) |
| Elevation | `elevation.floating` (3dp) |
| Position | Centered horizontally, docked into the top edge of the bottom tab bar |
| Clearance | 16dp (`space.lg`) above tab bar surface; does not overlap tab touch targets |
| Extended label (large-text mode) | "Photo" |

### 2.3 Positioning Detail

The FAB occupies the center "notch" of the bottom tab bar. It sits visually elevated above the bar surface by 12dp, creating a prominent center element. The NavigationBar uses a center spacer of 72dp width to accommodate the FAB without overlapping adjacent tab touch targets.

```
┌──────────────────────────────────────┐
│                                      │
│           [Screen Content]           │
│                                      │
│                                      │
├────────┬───────[FAB]───────┬─────────┤
│  Home  │ Journal │    │ Labs │  More  │
│   o    │   o     │ cam│  o   │   o    │
└────────┴─────────┴────┴──────┴────────┘
```

### 2.4 Behavior

- **Single tap:** Opens the photo capture flow (PHF-001). The camera viewfinder appears as a full-screen modal (layout pattern 4.3 from design system).
- **Post-capture flow:** After taking a photo, the user lands on PHF-002 (Photo Review & Category Select) to tag the photo type. Tagging is optional — dismissing returns to the previous screen.
- **During check-in flows:** FAB remains visible. Tapping it opens photo capture as an overlay; returning from capture resumes the check-in exactly where the user left off.
- **During full-screen modals (another photo capture, onboarding):** FAB is hidden.

### 2.5 Animation

- **Appearance:** When the tab bar appears (e.g., returning from a full-screen flow), the FAB scales up from 0 to 1.0 with a 200ms spring curve, 50ms after the tab bar finishes its own transition.
- **Press feedback:** Scale to 0.92 on press, back to 1.0 on release (100ms).
- **Reduced motion:** No scale animation; instant state changes.

### 2.6 Accessibility

- Semantic label: "Take photo. Opens camera for food or health photo."
- In large-text mode: ExtendedFAB shows "Photo" text beside the camera icon.
- The FAB must not overlap any other touch target. Minimum 8dp (`touch.clearance`) from adjacent elements.
- VoiceOver/TalkBack focus order: FAB is focused after the last visible content item and before the bottom tab bar.

---

## 3. Top App Bar

### 3.1 Structure

The top app bar is dynamic — its content changes based on the current screen context. It uses the Material 3 `SliverAppBar` or `AppBar` pattern depending on whether the screen has a scrolling body.

### 3.2 Common Elements (Present on All Screens)

| Element | Position | Description |
|---------|----------|-------------|
| Screen title | Left-aligned or centered (per variant) | Dynamic text from current screen |
| Cycle day badge | Right of title (or in trailing actions area) | `CycleDayBadge` widget; only shown if cycle tracking is enabled |
| Notification bell | Trailing action icon | `Icons.notifications_outlined`; badge dot if unread notifications exist |

### 3.3 Variants by Screen

| Screen Context | Title | Leading Action | Trailing Actions | Behavior |
|---------------|-------|----------------|------------------|----------|
| **Dashboard (HOM-001)** | "Good morning, {name}" or "Good evening, {name}" (time-based) | None (root tab) | Cycle badge, notification bell | Collapses on scroll; title shrinks to single-line on collapse |
| **Journal hub** | "Journal" | None (root tab) | Cycle badge, notification bell | Static app bar |
| **Check-in flow (JRM/JRE)** | "Morning Check-in" / "Evening Check-in" | Back/close (X) | Cycle badge | ProgressStepper sits below the app bar; see section 5 |
| **Labs (LAB-010)** | "Labs" | None (root tab) | Notification bell | Static app bar |
| **Settings hub (STG-001)** | "Settings" | None (root tab) | None | Static app bar |
| **Detail screens (pushed)** | Screen-specific title | Back arrow | Context-specific | Standard push-navigation app bar |
| **Full-screen modal** | Screen-specific or none | Close (X) | Context-specific | No bottom tab bar visible |

### 3.4 Visual Specifications

| Property | Value |
|----------|-------|
| Height | Material 3 default (64dp standard, 56dp with small title) |
| Background | `neutral.background` (blends with screen) or `neutral.surface` for scrolled state |
| Title typography | `type.h2` for screen titles; `type.h3` for detail screen titles |
| Greeting typography | `type.h2` for the name, `type.body` for date/cycle info |
| Icon size | `icon.md` (24dp) |
| Elevation | 0dp at rest; `elevation.raised` (1dp) when content is scrolled beneath |

### 3.5 Cycle Day Badge in App Bar

When cycle tracking is enabled, the `CycleDayBadge` appears in the app bar's trailing area (to the left of the notification bell). It shows the current cycle day number and is tinted with the current phase color.

- Visible on: Dashboard, Journal hub, Check-in flows, Labs
- Hidden on: Settings, onboarding, any screen where cycle context is irrelevant
- Tap action: Navigates to CYC-009 (Cycle-Phase Symptom Map)

### 3.6 Notification Bell

- Icon: `Icons.notifications_outlined` (inactive) / `Icons.notifications` (has unread)
- Badge: 8dp circle in `insight.actionRequired` if unread notifications > 0
- Tap: Opens notification center (NAV-004) as a pushed screen or bottom sheet
- Semantic label: "Notifications. {count} unread." (or "No new notifications.")

### 3.7 Accessibility

- Title is marked as a heading: `Semantics(header: true)`.
- Leading action (back/close) labeled: "Go back" / "Close".
- In large-text mode, the app bar height grows to accommodate larger title text. Title does not truncate.

---

## 4. Notification Center (NAV-004)

### 4.1 Purpose

Centralized display of all app-generated notifications. Accessed via the notification bell in the app bar.

### 4.2 Notification Types

| Type | Icon | Source | Example | Priority |
|------|------|--------|---------|----------|
| **Pattern alert** | Lightbulb | Intelligence layer | "Your brain fog has been elevated for 5 consecutive days" | High |
| **Vicious cycle alert** | Warning triangle | Intelligence layer | "Possible insulin-thyroid feedback loop detected" | Urgent |
| **Medication reminder** | Pill | Scheduled timer | "Time to take Levothyroxine (6:30 AM)" | High |
| **Check-in prompt** | Clipboard | Scheduled timer | "Ready for your morning check-in?" | Medium |
| **Lab reminder** | Calendar | Event-driven | "It's been 3 months since your last thyroid panel" | Low |
| **Positive reinforcement** | Star | Intelligence layer | "7-day tracking streak! Patterns are getting clearer." | Low |
| **Flare prediction** | Alert circle | Intelligence layer (Phase 3) | "Conditions similar to your last flare detected" | Urgent |
| **Cycle prediction** | Calendar circle | Cycle engine | "Period expected in 2 days based on your pattern" | Medium |
| **Medication timing correlation** | Clock | Intelligence layer | "Your energy is 1.8 points higher on days you take levo before 6:30 AM" | Medium |
| **Book chapter link** | Book | Intelligence layer | "This pattern is explained in Chapter 7" | Low |

### 4.3 Layout

The notification center is a pushed screen (or a large bottom sheet, depending on implementation preference) with:

- Title: "Notifications"
- Filter chips at top: All / Alerts / Reminders / Insights
- List of notification cards, grouped by date (Today / Yesterday / This Week / Earlier)
- Each card shows: icon, title, summary, timestamp, read/unread state
- Swipe to dismiss (with undo option)
- "Mark all as read" action in app bar overflow menu

### 4.4 Push Notification Behavior

Push notifications (via Firebase Cloud Messaging) appear as system notifications when the app is in the background. Tapping a push notification:

| Notification Type | Deep Link Destination |
|-------------------|-----------------------|
| Medication reminder | MOD-002 (Dose Confirmation) or the check-in medication section |
| Check-in prompt | JRM-001 or JRE-001 (Morning or Evening Check-in Entry) |
| Pattern alert | INT-028 (Alert Detail View) |
| Vicious cycle alert | INT-007..011 (specific alert screen) |
| Flare prediction | MOD-005 (Flare Prediction Warning) |

### 4.5 Accessibility

- Notification list items: "{type}: {title}. {summary}. {timestamp}. {unread/read}."
- Swipe-to-dismiss has a visible delete button alternative.
- Urgent notifications use `Semantics(liveRegion: true)` when they first appear in the list.

---

## 5. Check-In Flow Navigation Pattern

### 5.1 Behavior

Check-in flows (morning and evening) are full-screen experiences that temporarily replace the normal tab-based navigation. This gives the check-in a focused, distraction-free feel while keeping the user oriented.

### 5.2 Entry

- **From Dashboard CTA:** Tapping "Start Morning Check-in" or "Start Evening Check-in" on HOM-001 pushes the check-in flow as a full-screen route.
- **From push notification:** Deep-links directly into JRM-001 or JRE-001.
- **From Journal tab:** Tapping "New Check-in" in the journal hub.

### 5.3 During Check-In

| Element | Visibility | Behavior |
|---------|------------|----------|
| Bottom tab bar | **Hidden** | The check-in is a focused flow; tabs would be distracting |
| Camera FAB | **Visible** | Remains accessible for moment-based food photos during check-in |
| Top app bar | **Modified** | Shows "Morning Check-in" / "Evening Check-in" title + close (X) button |
| ProgressStepper | **Visible** | Fixed below the app bar, showing section progress (e.g., Vitals > Symptoms > Meds > Notes) |
| Cycle day badge | **Visible** | Shown in the app bar if cycle tracking is enabled |

### 5.4 Exit

- **Close (X) button:** Prompts MOD-011 (Save/Discard confirmation dialog). Options: "Save draft" / "Discard" / "Cancel".
- **Save button:** Saves the check-in, shows save confirmation animation (design system section 5.4), then returns to the Dashboard with tabs visible.
- **System back gesture (Android) / Swipe back (iOS):** Same behavior as Close (X) — triggers save/discard prompt.

### 5.5 Interrupted Check-In

If the user switches away from the app mid-check-in:
- Data entered so far is auto-saved as a draft.
- Returning to the app within 2 hours resumes the check-in from where they left off.
- After 2 hours, the draft is saved but the check-in is no longer actively presented. The user can resume from the Journal tab ("Continue draft check-in" option).

---

## 6. Modal & Bottom Sheet Layering

### 6.1 Layering Hierarchy

From bottom to top:

1. **Screen content** (within tab navigation)
2. **Bottom tab bar + FAB** (persistent, except during check-in)
3. **Bottom sheet** (detail entry, educational content) — sits above tab bar
4. **Dialog** (confirmation, save/discard) — sits above everything
5. **Full-screen modal** (photo capture, onboarding) — replaces everything

### 6.2 Bottom Sheet Rules (Layout Pattern 4.2)

- Bottom sheets slide up from the bottom, with a drag handle.
- Maximum height: 85% of screen.
- Scrim: 50% black overlay on content behind the sheet.
- Interaction with content behind the sheet is blocked while the sheet is open.
- Dismissal: Swipe down past threshold, tap scrim, or tap a close/done button inside the sheet.
- The bottom tab bar is partially visible beneath the scrim (maintains spatial orientation).

### 6.3 Dialog Rules

- Centered on screen with scrim.
- Used for: save/discard confirmation (MOD-011), delete confirmation, permission requests.
- Always has at least two actions (e.g., "Discard" / "Cancel").
- Destructive actions are visually de-emphasized (not the primary button color).

---

## 7. Quick Symptom Capture (MOD-003)

### 7.1 Purpose

Implements the "Acute symptom note" from PRD Section 3A.2 Moment-Based Capture. This overlay is accessible from any screen in the app and allows the user to log an unexpected symptom flare in ~15 seconds without navigating away from their current context.

### 7.2 Trigger

- **Long-press the FAB** (camera button) to open a menu with two options: "Take Photo" and "Log Symptom."
- **Alternative trigger:** A persistent "+" quick-action button in the top app bar on the Dashboard screen (HOM-001 only) that opens the same overlay.
- **From notification:** A push notification during the day can include a "Log how you're feeling" action that opens this overlay.

### 7.3 Layout

The quick symptom capture appears as a bottom sheet (medium height, ~50% of screen).

```
┌──────────────────────────────────────┐
│         [Drag handle]                │
│                                      │
│  Quick Symptom Note                  │
│                                      │
│  What's happening?                   │
│  [SymptomChipGrid — compact,         │
│   showing user's top 8 symptoms]     │
│                                      │
│  Severity          ●●●●●●●○○○ 7/10  │
│  [SliderCard — single]               │
│                                      │
│  Note (optional): _______________    │
│  [FreeTextField — 100 char max]      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │          Save Note             │  │
│  └────────────────────────────────┘  │
│                                      │
│  Timestamp: auto-captured (now)      │
└──────────────────────────────────────┘
```

### 7.4 Data Captured

| Field | Component | Required |
|-------|-----------|----------|
| Symptom(s) | `SymptomChipGrid` (compact variant, top 8 chips + "Other") | Yes (min 1) |
| Severity | `SliderCard` (0-10) | Yes |
| Note | `FreeTextField` (100 char max) | No |
| Timestamp | Auto-captured | Auto |
| Context | Current screen ID (for analytics) | Auto |

### 7.5 Behavior

- **Auto-timestamp:** The note is stamped with the current date and time automatically.
- **Save:** Saves the acute symptom note as a standalone record, linked to the current day's data. It appears in the evening check-in as pre-populated context: "You logged a symptom note at 2:14 PM — joint pain, severity 7."
- **Post-save:** The bottom sheet dismisses. A brief toast (MOD-015) confirms: "Symptom note saved." The user returns to whatever screen they were on.
- **No disruption:** The underlying screen is not modified or navigated away from. The bottom sheet overlays and dismisses cleanly.

### 7.6 Integration with Check-In

Acute symptom notes captured during the day are surfaced during the evening check-in:
- As a pre-populated entry in the Symptom Chips section (already selected, with severity pre-filled)
- In a summary line: "You logged 2 symptom notes today" with expandable detail
- The user can modify severity in the evening check-in if the symptom has changed since the acute note

### 7.7 Accessibility

- Bottom sheet announced: "Quick symptom capture. Select symptoms, set severity, and optionally add a note."
- SymptomChipGrid follows standard chip accessibility (design system 1.2).
- Save button disabled until at least one symptom is selected.
- The overlay respects reduced motion settings.
- In large-text mode, the bottom sheet expands to accommodate larger content (up to 70% screen height).

---

## 8. Back Navigation Rules

### 8.1 Tab Root Screens

- Pressing system back on a tab root screen (Home, Journal, Labs, More) switches to the Home tab.
- Pressing system back on the Home tab when it's already active prompts an "Exit app?" confirmation (Android only; iOS uses swipe-to-home natively).

### 8.2 Pushed Screens

- Standard back navigation (system gesture or back arrow in app bar) pops the current screen and returns to the previous screen in the current tab's stack.
- If the pushed screen has unsaved changes, back triggers a save/discard prompt (MOD-011).

### 8.3 Bottom Sheets

- System back dismisses the bottom sheet (equivalent to swiping down).
- If the bottom sheet contains unsaved form data, dismissal triggers a confirmation prompt.

### 8.4 Full-Screen Modals

- System back triggers the close (X) behavior, which may include a save/discard prompt.
- Full-screen modals do not participate in tab navigation — they sit above the tab system.

---

## 9. State Indicator Patterns

### 9.1 Loading State (NAV-008)

- Skeleton shimmer placeholders matching the expected content layout.
- No spinner unless the load exceeds 2 seconds, at which point a centered `CircularProgressIndicator` with "Loading..." text appears.
- Skeleton shimmer uses `neutral.surfaceAlt` on `neutral.surface` background.

### 9.2 Empty State (NAV-005)

- Centered illustration (`icon.xl` size), title, subtitle, and optional CTA.
- Example: Dashboard empty state (HOM-019) shows "Welcome! Complete your first check-in to see your dashboard." with a "Start Check-in" button.

### 9.3 Error States (NAV-006, NAV-007)

- **Network failure (NAV-006):** Banner at top with retry button. Content below shows cached data if available, or empty state with "You're offline. Your data is saved locally and will sync when you reconnect."
- **Server error (NAV-007):** Full-screen error with retry button and "Contact support" link. Only shown when the error prevents all functionality.

---

*End of Global Shell Specification v1.0*
