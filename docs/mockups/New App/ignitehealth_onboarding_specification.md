# IgniteHealth Onboarding Specification
## Complete Design & Technical Requirements

**Version:** 1.0  
**Last Updated:** January 26, 2026  
**Purpose:** Emotional investment, expectation setting, and baseline data collection

---

## EXECUTIVE SUMMARY

### Onboarding Objectives
1. **Create emotional investment** - Users acknowledge their pain and commit to finding answers
2. **Set realistic expectations** - Clear timeline (weeks, not days) and time commitment (2-3 min/day)
3. **Collect baseline data** - Symptom profile, goals, healthcare satisfaction, knowledge level
4. **Establish commitment** - Users consciously commit to consistent tracking
5. **Transition to action** - Seamless handoff to first daily check-in

### Key Principles
- **Mobile-first design** - Optimized for single-hand phone use
- **Minimal friction** - One question per screen, tap to answer
- **Emotional resonance** - Mirror back their struggles to create connection
- **Honest positioning** - No false promises, realistic timelines
- **Progressive commitment** - Build investment gradually across 11 screens

### Success Metrics
- **Completion rate:** >75% of users complete full onboarding
- **Time to complete:** 90-120 seconds average
- **Day 1 retention:** >85% complete first morning check-in
- **Day 7 retention:** >60% still actively tracking

---

## SCREEN-BY-SCREEN SPECIFICATIONS

### SCREEN 1: Welcome

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│          [App Logo]             │
│                                 │
│      Welcome to                 │
│      IgniteHealth               │
│                                 │
│  Most people with thyroid       │
│  issues spend years feeling     │
│  unheard.                       │
│                                 │
│  We're here to help you         │
│  find answers.                  │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Get Started          │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_welcome`
- **Component Type:** Static informational screen
- **Analytics Event:** `onboarding_started`
- **Navigation:** 
  - Primary CTA → Screen 2 (Symptoms)
  - No back button (entry point)
  - No skip option

#### Copy Requirements
- **Title:** "Welcome to IgniteHealth" (H1, centered)
- **Body:** "Most people with thyroid issues spend years feeling unheard. We're here to help you find answers." (Body text, centered)
- **CTA Button:** "Get Started" (Primary button)

#### UX Notes
- First impression - warm, empathetic tone
- No medical jargon
- Simple, uncluttered design
- Auto-advance after 3 seconds OR user tap (whichever comes first)

---

### SCREEN 2: Symptom Selection

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  What symptoms are you          │
│  struggling with?               │
│                                 │
│  (Select all that apply)        │
│                                 │
│  ☐ Persistent fatigue           │
│  ☐ Brain fog                    │
│  ☐ Hair loss/thinning           │
│  ☐ Weight gain                  │
│  ☐ Digestive issues             │
│  ☐ Anxiety/depression           │
│  ☐ Sleep problems               │
│  ☐ Cold intolerance             │
│  ☐ Joint/muscle pain            │
│  ☐ Other _______________        │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Continue            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_symptoms`
- **Component Type:** Multi-select checkbox list
- **Data Model:**
```javascript
{
  symptoms: {
    fatigue: boolean,
    brain_fog: boolean,
    hair_loss: boolean,
    weight_gain: boolean,
    digestive_issues: boolean,
    anxiety_depression: boolean,
    sleep_problems: boolean,
    cold_intolerance: boolean,
    joint_pain: boolean,
    other: string | null
  }
}
```
- **Validation:** Minimum 1 selection required to continue
- **Analytics Event:** `symptoms_selected` with array of selected symptoms
- **Navigation:** 
  - Continue button → Screen 3 (Duration)
  - Back button → Screen 1 (Welcome)

#### UI/UX Requirements
- **Checkbox styling:** Large touch targets (minimum 44x44px per Apple HIG)
- **Selected state:** Checkmark visible, background color change
- **Unselected state:** Empty checkbox, white background
- **"Other" field:** Text input appears when checkbox selected (max 100 characters)
- **Continue button state:**
  - Disabled (grayed out) if no selections
  - Enabled (primary color) when ≥1 selected
- **Scroll behavior:** List scrollable if content exceeds viewport
- **Accessibility:** All checkboxes have proper labels for screen readers

#### Copy Requirements
- **Title:** "What symptoms are you struggling with?" (H2)
- **Subtitle:** "(Select all that apply)" (Small text, muted color)
- **Checkbox labels:** See visual design above
- **CTA Button:** "Continue"

#### Business Logic
- Store selections in user profile
- Use selections to personalize:
  - Screen 7 mirror statement
  - Future daily check-in questions
  - Correlation analysis priorities

---

### SCREEN 3: Duration

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  How long have you been         │
│  dealing with these             │
│  symptoms?                      │
│                                 │
│                                 │
│  ○ Less than 6 months           │
│                                 │
│  ○ 6 months - 1 year            │
│                                 │
│  ○ 1-3 years                    │
│                                 │
│  ○ 3-5 years                    │
│                                 │
│  ○ More than 5 years            │
│                                 │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Continue            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_duration`
- **Component Type:** Single-select radio button list
- **Data Model:**
```javascript
{
  symptom_duration: "less_than_6mo" | "6mo_to_1yr" | "1_to_3yrs" | "3_to_5yrs" | "more_than_5yrs"
}
```
- **Validation:** 1 selection required to continue
- **Analytics Event:** `duration_selected` with selected value
- **Navigation:** 
  - Auto-advance 0.5 seconds after selection (OR Continue button tap)
  - Back button → Screen 2 (Symptoms)

#### UI/UX Requirements
- **Radio button styling:** Large touch targets (minimum 44x44px)
- **Selected state:** Filled circle, background highlight
- **Unselected state:** Empty circle
- **Auto-advance:** Optional - can implement Continue button instead
- **Tap behavior:** Selecting option auto-enables Continue button

#### Copy Requirements
- **Title:** "How long have you been dealing with these symptoms?" (H2)
- **Radio options:** See visual design above
- **CTA Button:** "Continue"

#### Business Logic
- Store duration in user profile
- Use duration for:
  - Empathy messaging (longer duration = more validation)
  - Expected timeline adjustments (longer suffering = need more patience)
  - Segmentation for analytics

---

### SCREEN 4: Healthcare Satisfaction

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  How satisfied are you with     │
│  your current healthcare        │
│  support?                       │
│                                 │
│                                 │
│  ○ Very satisfied -             │
│    just want to track           │
│                                 │
│  ○ Somewhat satisfied -         │
│    looking for more             │
│                                 │
│  ○ Frustrated -                 │
│    not getting answers          │
│                                 │
│  ○ Very frustrated -            │
│    feel ignored/unheard         │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Continue            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_healthcare_satisfaction`
- **Component Type:** Single-select radio button list
- **Data Model:**
```javascript
{
  healthcare_satisfaction: "very_satisfied" | "somewhat_satisfied" | "frustrated" | "very_frustrated"
}
```
- **Validation:** 1 selection required to continue
- **Analytics Event:** `healthcare_satisfaction_selected` with selected value
- **Navigation:** 
  - Auto-advance 0.5 seconds after selection
  - Back button → Screen 3 (Duration)

#### UI/UX Requirements
- Same as Screen 3 (Duration)

#### Copy Requirements
- **Title:** "How satisfied are you with your current healthcare support?" (H2)
- **Radio options:** See visual design above

#### Business Logic
- Store satisfaction level in user profile
- Use for:
  - Messaging tone (more validation for frustrated users)
  - Feature prioritization (doctor report generation for frustrated users)
  - Segmentation and correlation analysis

---

### SCREEN 5: Goals

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  What would success look        │
│  like for you?                  │
│                                 │
│  (Select your top 3)            │
│                                 │
│  ☐ Feel energetic again         │
│  ☐ Think clearly                │
│  ☐ Lose weight                  │
│  ☐ Reduce/stop medications      │
│  ☐ Sleep well                   │
│  ☐ Feel like myself             │
│  ☐ Get real answers             │
│  ☐ Partner with my doctor       │
│    better                       │
│  ☐ Understand what's            │
│    actually wrong               │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Continue            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_goals`
- **Component Type:** Multi-select checkbox list (max 3 selections)
- **Data Model:**
```javascript
{
  goals: {
    feel_energetic: boolean,
    think_clearly: boolean,
    lose_weight: boolean,
    reduce_meds: boolean,
    sleep_well: boolean,
    feel_like_myself: boolean,
    get_answers: boolean,
    partner_with_doctor: boolean,
    understand_whats_wrong: boolean
  }
}
```
- **Validation:** Minimum 1, maximum 3 selections
- **Analytics Event:** `goals_selected` with array of selected goals
- **Navigation:** 
  - Continue button → Screen 6 (Confidence)
  - Back button → Screen 4 (Healthcare Satisfaction)

#### UI/UX Requirements
- **Selection limit:** After 3 selections, unselected checkboxes become disabled
- **Visual feedback:** Show count (e.g., "2 of 3 selected") below title
- **Deselection:** Allow deselecting to choose different goals
- **Continue button state:**
  - Disabled if 0 selections
  - Enabled if 1-3 selections

#### Copy Requirements
- **Title:** "What would success look like for you?" (H2)
- **Subtitle:** "(Select your top 3)" (Small text, muted color)
- **Checkbox labels:** See visual design above

#### Business Logic
- Store goals in user profile
- Use goals for:
  - Personalized messaging in Screen 7
  - Progress tracking metrics
  - Feature prioritization
  - Success celebration triggers

---

### SCREEN 6: Confidence Level

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  How confident do you feel      │
│  about managing your            │
│  health?                        │
│                                 │
│                                 │
│  ○ Very confident -             │
│    I know what to do            │
│                                 │
│  ○ Somewhat confident -         │
│    I'm learning                 │
│                                 │
│  ○ Not confident -              │
│    overwhelmed/confused         │
│                                 │
│  ○ Lost - I have no idea        │
│    where to start               │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Continue            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_confidence`
- **Component Type:** Single-select radio button list
- **Data Model:**
```javascript
{
  confidence_level: "very_confident" | "somewhat_confident" | "not_confident" | "lost"
}
```
- **Validation:** 1 selection required to continue
- **Analytics Event:** `confidence_selected` with selected value
- **Navigation:** 
  - Auto-advance 0.5 seconds after selection
  - Back button → Screen 5 (Goals)

#### Copy Requirements
- **Title:** "How confident do you feel about managing your health?" (H2)
- **Radio options:** See visual design above

#### Business Logic
- Store confidence level in user profile
- Use for:
  - Education level (provide more guidance for low confidence)
  - Onboarding path (accelerated for very confident users)
  - Support intensity (more hand-holding for lost users)

---

### SCREEN 7: The Mirror (Emotional Connection)

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  Here's what we heard:          │
│                                 │
│  You've been struggling with    │
│  {symptom_list} for             │
│  {duration_text}.               │
│                                 │
│  You're {satisfaction_text}     │
│  with your healthcare and       │
│  {confidence_text}.             │
│                                 │
│  You want to {goals_list}.      │
│                                 │
│  ─────────────────────────      │
│                                 │
│  You're not alone.              │
│  We can help.                   │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Show Me How          │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_mirror`
- **Component Type:** Dynamic text generation screen
- **Data Sources:** All previous onboarding responses
- **Analytics Event:** `mirror_viewed`
- **Navigation:** 
  - Continue button → Screen 8 (How We Help)
  - Back button → Screen 6 (Confidence)

#### Dynamic Text Generation Logic

**Symptom List:**
```javascript
// If 1-2 symptoms selected:
"[symptom1] and [symptom2]"

// If 3+ symptoms selected:
"[symptom1], [symptom2], and [symptom3]"
// (show max 3, even if more selected)
```

**Duration Text:**
```javascript
duration_map = {
  "less_than_6mo": "less than 6 months",
  "6mo_to_1yr": "6 months to a year",
  "1_to_3yrs": "1-3 years",
  "3_to_5yrs": "3-5 years",
  "more_than_5yrs": "over 5 years"
}
```

**Satisfaction Text:**
```javascript
satisfaction_map = {
  "very_satisfied": "generally satisfied",
  "somewhat_satisfied": "looking for more from",
  "frustrated": "frustrated with",
  "very_frustrated": "very frustrated with"
}
```

**Confidence Text:**
```javascript
confidence_map = {
  "very_confident": "feel confident managing it",
  "somewhat_confident": "are still learning",
  "not_confident": "feel overwhelmed",
  "lost": "don't know where to start"
}
```

**Goals List:**
```javascript
// Show top 2 goals selected:
"[goal1] and [goal2]"

// Goal text mapping:
goal_text_map = {
  "feel_energetic": "feel energetic again",
  "think_clearly": "think clearly",
  "lose_weight": "lose weight",
  "reduce_meds": "reduce or stop medications",
  "sleep_well": "sleep well",
  "feel_like_myself": "feel like yourself again",
  "get_answers": "get real answers",
  "partner_with_doctor": "partner better with your doctor",
  "understand_whats_wrong": "understand what's actually wrong"
}
```

#### UI/UX Requirements
- **Text animation:** Fade in sections sequentially (0.3s delay between sections)
- **Emphasis:** User's own words should feel highlighted/emphasized
- **Emotional tone:** Warm, validating, empathetic
- **Reading time:** Allow 5-8 seconds before CTA appears

#### Copy Requirements
- **Static text:** "Here's what we heard:", "You're not alone.", "We can help."
- **Dynamic text:** Generated from user inputs as specified above
- **CTA Button:** "Show Me How"

#### Business Logic
- This is the **emotional peak** of onboarding
- Users should feel "seen" and understood
- Creates commitment to continue

---

### SCREEN 8: How We'll Help

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  Here's how IgniteHealth        │
│  works:                         │
│                                 │
│  ✓ Track daily: How you feel,  │
│    what you eat, sleep,         │
│    symptoms                     │
│                                 │
│  ✓ Find patterns: What makes   │
│    you feel better or worse    │
│                                 │
│  ✓ Get insights: Clear data on │
│    what affects YOUR body      │
│                                 │
│  ✓ Partner with doctor:        │
│    Reports & questions to      │
│    bring to visits             │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Continue            │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_how_it_works`
- **Component Type:** Static informational screen
- **Analytics Event:** `how_it_works_viewed`
- **Navigation:** 
  - Continue button → Screen 9 (Time Investment)
  - Back button → Screen 7 (Mirror)

#### UI/UX Requirements
- **Icons:** Checkmark icons (✓) before each bullet point
- **Visual hierarchy:** Clear distinction between headline and body text
- **Readability:** Allow 5-7 seconds reading time before advancing

#### Copy Requirements
- **Title:** "Here's how IgniteHealth works:" (H2)
- **Bullet points:** See visual design above (4 key features)
- **CTA Button:** "Continue"

---

### SCREEN 9: Time Investment

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  The Reality:                   │
│                                 │
│  Finding answers takes          │
│  consistency.                   │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Daily time:                    │
│  2-3 minutes/day                │
│                                 │
│  Timeline:                      │
│  • Week 1: Patterns start       │
│    emerging                     │
│  • Week 2-3: First real         │
│    insights                     │
│  • Month 2: Clear               │
│    correlations                 │
│                                 │
│  ─────────────────────────      │
│                                 │
│  After {duration_text} of       │
│  struggling, 2 months is        │
│  worth it.                      │
│                                 │
│  ┌───────────────────────────┐  │
│  │       I'm Ready           │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_time_commitment`
- **Component Type:** Static informational screen with dynamic text
- **Data Sources:** `symptom_duration` from Screen 3
- **Analytics Event:** `time_commitment_viewed`
- **Navigation:** 
  - Continue button → Screen 10 (Commitment)
  - Back button → Screen 8 (How We Help)

#### Dynamic Text Logic
```javascript
// Insert user's duration from Screen 3:
duration_text_map = {
  "less_than_6mo": "6 months",
  "6mo_to_1yr": "a year",
  "1_to_3yrs": "years",
  "3_to_5yrs": "years",
  "more_than_5yrs": "5+ years"
}
```

#### UI/UX Requirements
- **Honest tone:** Don't oversell - be realistic about time needed
- **Emphasis:** Bold the "2-3 minutes/day" and timeline milestones
- **Personalization:** Dynamic duration text creates connection

#### Copy Requirements
- **Title:** "The Reality:" (H2, bold)
- **Subtitle:** "Finding answers takes consistency." (Body text)
- **Body:** See visual design above
- **CTA Button:** "I'm Ready"

---

### SCREEN 10: The Commitment

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  One more thing:                │
│                                 │
│  This only works if you         │
│  track consistently.            │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Can you commit to:             │
│                                 │
│  ☑ 2-3 min each morning         │
│  ☑ Quick evening notes          │
│  ☑ 2 weeks minimum              │
│                                 │
│  ─────────────────────────      │
│                                 │
│  If yes, you'll finally get     │
│  the answers you've been        │
│  searching for.                 │
│                                 │
│  If no, this probably isn't     │
│  the right time.                │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │    Yes, I Commit          │  │
│  └───────────────────────────┘  │
│                                 │
│  Maybe later                    │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_commitment`
- **Component Type:** Decision screen with two CTAs
- **Data Model:**
```javascript
{
  user_committed: boolean,
  commitment_timestamp: datetime
}
```
- **Analytics Events:** 
  - `commitment_accepted` (if "Yes, I Commit")
  - `commitment_declined` (if "Maybe later")
- **Navigation:** 
  - Primary CTA ("Yes, I Commit") → Screen 11 (First Action)
  - Secondary link ("Maybe later") → Exit flow, return to login/home
  - Back button → Screen 9 (Time Investment)

#### UI/UX Requirements
- **Checkboxes:** Static checkmarks (not interactive), for visual emphasis only
- **Primary CTA:** Large, prominent button
- **Secondary CTA:** Text link, smaller, less prominent
- **Exit behavior:** "Maybe later" dismisses onboarding, shows welcome screen with "Ready to start?" option

#### Copy Requirements
- **Title:** "One more thing:" (H2)
- **Subtitle:** "This only works if you track consistently." (Body text)
- **Commitment checklist:** See visual design above
- **Outcome statements:** "If yes..." and "If no..." text
- **Primary CTA:** "Yes, I Commit"
- **Secondary CTA:** "Maybe later"

#### Business Logic
- This is a **filter** - users who commit have higher retention
- Users who decline can return later (don't lose them permanently)
- Commitment timestamp used for:
  - Calculating "days since commitment" for retention analysis
  - Triggering encouragement notifications if they fall off

---

### SCREEN 11: First Action

#### Visual Design
```
┌─────────────────────────────────┐
│                                 │
│  Perfect! Let's start.          │
│                                 │
│  Your first check-in captures   │
│  your baseline.                 │
│                                 │
│  This takes 2 minutes.          │
│                                 │
│  Tomorrow, we'll track changes  │
│  and start finding patterns.    │
│                                 │
│  Ready?                         │
│                                 │
│                                 │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Start Day 1          │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Technical Requirements
- **Screen ID:** `onboarding_first_action`
- **Component Type:** Transition screen
- **Analytics Event:** `onboarding_completed`
- **Navigation:** 
  - Continue button → Morning Check-in Flow (separate feature)
  - No back button (commitment made)

#### UI/UX Requirements
- **Encouraging tone:** Positive, supportive
- **Clear next step:** Explicit about what happens next
- **Time expectation:** "This takes 2 minutes" manages expectations
- **Immediate action:** Launch into first check-in immediately

#### Copy Requirements
- **Title:** "Perfect! Let's start." (H2, celebratory tone)
- **Body:** See visual design above
- **CTA Button:** "Start Day 1"

#### Business Logic
- Mark onboarding as complete in user profile
- Set `onboarding_completed_at` timestamp
- Transition to main app flow (morning check-in)
- Begin Day 1 tracking

---

## DATA MODEL

### User Onboarding Profile
```javascript
{
  user_id: "UUID",
  onboarding_data: {
    // Screen 2: Symptoms
    symptoms: {
      fatigue: boolean,
      brain_fog: boolean,
      hair_loss: boolean,
      weight_gain: boolean,
      digestive_issues: boolean,
      anxiety_depression: boolean,
      sleep_problems: boolean,
      cold_intolerance: boolean,
      joint_pain: boolean,
      other: string | null
    },
    
    // Screen 3: Duration
    symptom_duration: "less_than_6mo" | "6mo_to_1yr" | "1_to_3yrs" | "3_to_5yrs" | "more_than_5yrs",
    
    // Screen 4: Healthcare Satisfaction
    healthcare_satisfaction: "very_satisfied" | "somewhat_satisfied" | "frustrated" | "very_frustrated",
    
    // Screen 5: Goals
    goals: {
      feel_energetic: boolean,
      think_clearly: boolean,
      lose_weight: boolean,
      reduce_meds: boolean,
      sleep_well: boolean,
      feel_like_myself: boolean,
      get_answers: boolean,
      partner_with_doctor: boolean,
      understand_whats_wrong: boolean
    },
    
    // Screen 6: Confidence
    confidence_level: "very_confident" | "somewhat_confident" | "not_confident" | "lost",
    
    // Screen 10: Commitment
    user_committed: boolean,
    commitment_timestamp: datetime | null,
    
    // Metadata
    onboarding_started_at: datetime,
    onboarding_completed_at: datetime | null,
    onboarding_version: "1.0"
  }
}
```

---

## ANALYTICS TRACKING

### Events to Track

| Event Name | Trigger | Data Captured |
|------------|---------|---------------|
| `onboarding_started` | User taps "Get Started" on Screen 1 | `timestamp`, `user_id` |
| `symptoms_selected` | User selects symptoms on Screen 2 | `symptoms_array`, `count` |
| `duration_selected` | User selects duration on Screen 3 | `duration_value` |
| `healthcare_satisfaction_selected` | User selects satisfaction on Screen 4 | `satisfaction_level` |
| `goals_selected` | User selects goals on Screen 5 | `goals_array`, `count` |
| `confidence_selected` | User selects confidence on Screen 6 | `confidence_level` |
| `mirror_viewed` | User reaches Screen 7 | `timestamp` |
| `how_it_works_viewed` | User reaches Screen 8 | `timestamp` |
| `time_commitment_viewed` | User reaches Screen 9 | `timestamp` |
| `commitment_accepted` | User taps "Yes, I Commit" | `timestamp` |
| `commitment_declined` | User taps "Maybe later" | `timestamp` |
| `onboarding_completed` | User completes onboarding | `timestamp`, `duration_seconds` |
| `onboarding_abandoned` | User exits before completion | `last_screen_id`, `timestamp` |

### Key Metrics to Calculate
- **Completion rate:** `onboarding_completed / onboarding_started`
- **Drop-off by screen:** Track where users abandon flow
- **Average time to complete:** `onboarding_completed_at - onboarding_started_at`
- **Commitment rate:** `commitment_accepted / time_commitment_viewed`

---

## TECHNICAL IMPLEMENTATION

### State Management
```javascript
// Redux/Context state structure
onboardingState = {
  currentScreen: number,          // 1-11
  canGoBack: boolean,              // Navigation control
  userData: {
    symptoms: {},
    symptom_duration: null,
    healthcare_satisfaction: null,
    goals: {},
    confidence_level: null,
    user_committed: null
  },
  uiState: {
    isLoading: boolean,
    continueButtonEnabled: boolean,
    errorMessage: string | null
  }
}
```

### Navigation Logic
```javascript
// Screen navigation function
function navigateOnboarding(direction) {
  if (direction === "forward") {
    // Validate current screen data
    if (!validateCurrentScreen()) {
      showError("Please complete this step");
      return;
    }
    
    // Save current screen data
    saveOnboardingData(currentScreen, userData);
    
    // Move to next screen
    currentScreen += 1;
    
    // Track analytics
    trackScreenView(currentScreen);
    
  } else if (direction === "back") {
    currentScreen -= 1;
  }
}
```

### Validation Functions
```javascript
// Screen 2: Symptoms validation
function validateSymptoms() {
  const selected = Object.values(symptoms).filter(v => v === true);
  return selected.length >= 1;
}

// Screen 5: Goals validation
function validateGoals() {
  const selected = Object.values(goals).filter(v => v === true);
  return selected.length >= 1 && selected.length <= 3;
}
```

### Auto-Advance Logic
```javascript
// For single-select screens (3, 4, 6)
function handleRadioSelection(value) {
  // Save selection
  updateUserData(currentScreenField, value);
  
  // Enable continue button
  setContinueButtonEnabled(true);
  
  // Auto-advance after 500ms delay
  setTimeout(() => {
    navigateOnboarding("forward");
  }, 500);
}
```

---

## DESIGN SPECIFICATIONS

### Color Palette
```css
/* Primary Colors */
--primary-blue: #4A90E2;
--primary-blue-hover: #357ABD;

/* Text Colors */
--text-primary: #2C3E50;
--text-secondary: #7F8C8D;
--text-disabled: #BDC3C7;

/* Background Colors */
--bg-white: #FFFFFF;
--bg-light-gray: #F8F9FA;

/* State Colors */
--success-green: #27AE60;
--error-red: #E74C3C;

/* Checkbox/Radio States */
--checkbox-selected: #4A90E2;
--checkbox-unselected: #ECF0F1;
```

### Typography
```css
/* Title (H1) */
font-family: 'SF Pro Display', -apple-system, sans-serif;
font-size: 28px;
font-weight: 700;
line-height: 1.2;

/* Subtitle (H2) */
font-family: 'SF Pro Text', -apple-system, sans-serif;
font-size: 20px;
font-weight: 600;
line-height: 1.3;

/* Body Text */
font-family: 'SF Pro Text', -apple-system, sans-serif;
font-size: 16px;
font-weight: 400;
line-height: 1.5;

/* Small Text */
font-family: 'SF Pro Text', -apple-system, sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 1.4;
color: var(--text-secondary);
```

### Spacing
```css
/* Container padding */
--container-padding: 20px;

/* Vertical spacing between elements */
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### Button Styles
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 18px;
  font-weight: 600;
  min-height: 56px;
  width: 100%;
}

.btn-primary:hover {
  background: var(--primary-blue-hover);
}

.btn-primary:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
}

/* Secondary Link */
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 400;
  text-decoration: underline;
  padding: 8px;
}
```

### Checkbox/Radio Styles
```css
/* Checkbox/Radio Touch Target */
.checkbox-wrapper,
.radio-wrapper {
  min-height: 44px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.checkbox-wrapper:hover,
.radio-wrapper:hover {
  background: var(--bg-light-gray);
}

/* Selected State */
.checkbox-wrapper.selected,
.radio-wrapper.selected {
  background: rgba(74, 144, 226, 0.1);
  border: 2px solid var(--checkbox-selected);
}
```

---

## ACCESSIBILITY REQUIREMENTS

### Screen Reader Support
- All form inputs must have proper `aria-label` attributes
- Radio buttons and checkboxes must be grouped with `role="radiogroup"` or `role="group"`
- Dynamic text in Screen 7 must be announced when it appears
- Continue buttons must announce their disabled/enabled state

### Keyboard Navigation
- Tab order must follow visual flow (top to bottom)
- Enter key must submit/continue from any focused input
- Escape key should navigate back (if back button exists)

### Visual Accessibility
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Touch targets: Minimum 44x44px per Apple Human Interface Guidelines
- Focus indicators: Visible focus ring on all interactive elements

### VoiceOver/TalkBack Testing
- Test all screens with iOS VoiceOver and Android TalkBack
- Ensure dynamic content changes are announced
- Verify form validation errors are read aloud

---

## EDGE CASES & ERROR HANDLING

### Network Failures
- **Symptom:** User loses connection during onboarding
- **Behavior:** Save progress locally, allow offline completion
- **Recovery:** Sync data when connection restored
- **User message:** "We've saved your progress. You can continue offline."

### Duplicate Onboarding Attempts
- **Symptom:** User tries to restart onboarding after completion
- **Behavior:** Redirect to main app, show "Already completed" message
- **Option:** Allow re-onboarding after 30 days (for profile updates)

### Partial Completion
- **Symptom:** User exits onboarding mid-flow
- **Behavior:** Save progress, allow resumption from last screen
- **Time limit:** Clear saved progress after 7 days of inactivity
- **User message:** "Welcome back! Pick up where you left off."

### Validation Errors
- **Symptom:** User attempts to continue without required selections
- **Behavior:** Show inline error message, disable continue button
- **Error messages:**
  - Screen 2: "Please select at least one symptom"
  - Screen 5: "Please select 1-3 goals"
  - Generic: "Please complete this step to continue"

---

## LOCALIZATION CONSIDERATIONS

### Language Support (Future)
- All text strings must be externalized for translation
- Dynamic text generation must support different grammar structures
- Date/time formats must adapt to locale

### Cultural Adaptations
- Healthcare satisfaction levels may need cultural adjustments
- Symptom terminology may vary by region
- Confidence framing may need localization

---

## PERFORMANCE REQUIREMENTS

### Load Time
- Each screen must render in <500ms on mid-range devices
- Images/icons must be optimized for mobile (WebP format preferred)
- No network calls required during onboarding (all client-side)

### Animation Performance
- Screen transitions must maintain 60fps
- Text fade-ins on Screen 7 must be smooth
- No janky scrolling on lists

### Data Storage
- Onboarding progress saved to local storage immediately on each screen
- Sync to server only when onboarding completes (or on exit for resumption)

---

## TESTING REQUIREMENTS

### Unit Tests
- Validation logic for each screen
- Navigation state transitions
- Dynamic text generation (Screen 7)
- Data model serialization/deserialization

### Integration Tests
- Complete onboarding flow (all screens)
- Abandon and resume flow
- Back button navigation
- Analytics event firing

### User Acceptance Testing
- Completion time <2 minutes for majority of users
- Emotional resonance verified (Screen 7 mirrors back accurately)
- Commitment rate >70% (Screen 10)
- Zero crashes during onboarding

---

## FUTURE ENHANCEMENTS

### Version 1.1 (Planned)
- Progress bar showing "3 of 11 screens completed"
- Skip option for very confident users (alternative fast path)
- Video introduction option for visual learners
- A/B test different Screen 7 messaging

### Version 2.0 (Roadmap)
- Voice-guided onboarding option
- Animated illustrations for each screen
- Personalized app theme based on goals
- Social proof ("10,000+ people found answers")

---

## APPENDIX: USER FLOWS

### Happy Path Flow
```
Screen 1 (Welcome)
  ↓ tap "Get Started"
Screen 2 (Symptoms)
  ↓ select symptoms, tap "Continue"
Screen 3 (Duration)
  ↓ select duration, auto-advance
Screen 4 (Healthcare Satisfaction)
  ↓ select satisfaction, auto-advance
Screen 5 (Goals)
  ↓ select 1-3 goals, tap "Continue"
Screen 6 (Confidence)
  ↓ select confidence, auto-advance
Screen 7 (Mirror)
  ↓ read mirrored summary, tap "Show Me How"
Screen 8 (How We Help)
  ↓ read features, tap "Continue"
Screen 9 (Time Investment)
  ↓ read timeline, tap "I'm Ready"
Screen 10 (Commitment)
  ↓ tap "Yes, I Commit"
Screen 11 (First Action)
  ↓ tap "Start Day 1"
→ Morning Check-in Flow
```

### Abandon & Resume Flow
```
Screen 1-10 (any screen)
  ↓ user exits app
  ↓ progress saved locally
  ↓ user returns within 7 days
→ Resume at last completed screen
```

### Commitment Declined Flow
```
Screen 10 (Commitment)
  ↓ tap "Maybe later"
→ Exit onboarding
→ Show welcome screen with "Ready to start?" option
→ Allow restart anytime
```

---

## SIGN-OFF

### Required Approvals
- [ ] Product Manager - User flow approved
- [ ] UX Designer - Visual design approved
- [ ] Engineering Lead - Technical feasibility confirmed
- [ ] Data Analyst - Analytics requirements clear
- [ ] QA Lead - Testing plan approved

### Version History
- **v1.0** - January 26, 2026 - Initial specification

---

**END OF SPECIFICATION**
