# IgniteHealth: Complete Morning Check-in Framework

## Overview: Multi-Dimensional Health Assessment
**Total Time: 2-3 minutes | 16 core questions across 4 primary domains**

This morning check-in captures baseline health metrics that serve as both outcome indicators AND trigger variables for comprehensive correlation analysis across all health domains.

---

## CHAPTER 1: VITAL RHYTHMS (Sleep & Energy)
*Questions 1-8 | ~75 seconds*

### Q1: Sleep Duration Assessment
**Question:** "How many hours did you sleep last night?"
**Answer Format:** Numeric entry with 15-minute increments (e.g., 6.25, 6.5, 6.75, 7.0)
**UI Element:** Time input with scroll wheels

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Influenced by alcohol timing, caffeine after 2pm, exercise within 3hrs of bedtime, stress levels >7, pain preventing sleep, hormonal fluctuations
- **AS TRIGGER:** Affects pain sensitivity (+40% when <6hrs), sugar cravings (2x more), exercise performance (-25%), emotional regulation, immune function
- **Key Insight:** "Your headaches occur 73% more often after nights with <6.5 hours sleep"

### Q2: Sleep Quality Assessment  
**Question:** "Rate your overall sleep quality - considering how deeply you slept and how restful it felt"
**Answer Format:** Scale 0-10 (0=terrible, 10=excellent)
**UI Element:** Interactive scale with emoji indicators

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Alcohol disrupting REM sleep, late meals causing digestive work, anxiety preventing deep sleep, medications affecting sleep architecture
- **AS TRIGGER:** Quality matters more than duration for cognitive performance, emotional regulation, physical recovery, memory consolidation
- **Key Insight:** "Poor sleep quality nights are followed by 3x higher irritability ratings, regardless of sleep duration"

### Q3: Sleep Continuity Check
**Question:** "How many times did you wake up during the night?"
**Answer Format:** Quick select: 0, 1, 2, 3, 4+ times
**UI Element:** Large tap buttons with icons

**CONDITIONAL FOLLOW-UP** (if >1): "What caused most wake-ups?"
- Bathroom needs, Pain/discomfort, Too hot/cold, Racing thoughts, Noise, Unknown

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Alcohol metabolism, caffeine half-life, pain interrupting sleep, anxiety/worry, hormonal changes, medications
- **AS TRIGGER:** Fragmented sleep cycles affect morning grogginess, daytime fatigue patterns, cognitive function, mood stability
- **Key Insight:** "When you wake up 3+ times, your afternoon energy crash is 65% more severe"

### Q4: Sleep Timing Assessment
**Question:** "What time did you go to bed last night?"
**Answer Format:** Time selection with "Was this typical?" (Earlier/Normal/Later)
**UI Element:** Time picker with context indicator

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Late exercise keeping energized, stress causing bedtime procrastination, screen time, pain levels, digestive discomfort
- **AS TRIGGER:** Consistent bedtime = better sleep quality (+40%), circadian rhythm stability, next-day energy timing
- **Key Insight:** "Your sleep quality averages 8.2/10 with consistent bedtimes vs. 5.8/10 with variable bedtimes"

### Q5: Wake Time & Method
**Question:** "What time did you wake up today?"
**Answer Format:** Time selection + "Did you wake naturally or with an alarm?"
**UI Element:** Time picker with wake method buttons

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep quality/duration, alcohol early wake-ups, pain, anxiety, medication effects
- **AS TRIGGER:** Consistent wake time improves sleep quality by 35%, affects energy timing, meal timing, exercise performance
- **Key Insight:** "Days you wake naturally, your energy stays 40% more stable throughout the day"

### Q6: Morning Restoration State
**Question:** "How refreshed do you feel this morning?"
**Answer Format:** Scale 0-10 (0=exhausted, 10=fully refreshed)
**UI Element:** Interactive scale with energy indicators

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep duration/quality/continuity, alcohol disrupting restoration, stress hormones, exercise timing, medications, pain, hormonal changes
- **AS TRIGGER:** Predicts all-day energy patterns, cognitive performance, exercise capacity, mood regulation, decision making, pain sensitivity
- **Key Insight:** "Your refreshed rating predicts your entire day better than sleep hours - <5 refreshed = afternoon crash guaranteed"

### Q7: Current Energy Level
**Question:** "Rate your energy level right now"
**Answer Format:** Scale 0-10 (0=no energy, 10=highly energetic)
**UI Element:** Interactive energy meter

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep debt, blood sugar levels, dehydration, depression/anxiety, medication effects, pain, inflammation, hormonal fluctuations
- **AS TRIGGER:** Exercise motivation, food choices, stress resilience, cognitive function, social engagement, appetite regulation
- **Key Insight:** "Morning energy <4 predicts sugar cravings within 2 hours 85% of the time"

### Q8: Dominant Morning Mood
**Question:** "What's your predominant mood this morning?"
**Answer Format:** Single-select from: Calm, Content, Anxious, Irritable, Sad, Motivated, Overwhelmed, Neutral, Hopeful, Energetic, Focused, Restless, Grateful, Worried
**UI Element:** Mood carousel with icons

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep quality, blood sugar crashes, pain, previous day stress carryover, medications, hormonal fluctuations
- **AS TRIGGER:** Decision-making quality, social interactions, exercise motivation, food choices, stress resilience, work performance
- **Key Insight:** "Anxious mornings correlate with 60% higher stress eating and 40% lower exercise completion"

---

## CHAPTER 2: BODY SIGNALS (Physical Symptoms & Pain)
*Questions 9-12 | ~45 seconds*

### Q9: Morning Pain Assessment
**Question:** "Are you experiencing any pain this morning?"
**Answer Format:** Quick select: No pain, Mild (1-3), Moderate (4-6), Severe (7-10)
**UI Element:** Pain scale with color coding

**CONDITIONAL FOLLOW-UP** (if pain present): "Where is your pain located?"
- Head, Neck, Shoulders, Back, Joints, Abdomen, Other

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep quality, stress hormones, inflammation from food, weather changes, exercise recovery, hormonal fluctuations, medication timing
- **AS TRIGGER:** Mood regulation, exercise capacity, sleep quality, food choices, cognitive function, social engagement
- **Key Insight:** "Morning pain >5 reduces sleep quality by 30% the following night, creating a pain-insomnia cycle"

### Q10: Physical Comfort Level
**Question:** "Rate your overall physical comfort right now"
**Answer Format:** Scale 0-10 (0=very uncomfortable, 10=very comfortable)
**UI Element:** Comfort scale with body indicators

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep position/quality, dehydration, inflammation, stress tension, hormonal changes, weather sensitivity
- **AS TRIGGER:** Mood state, motivation levels, exercise willingness, concentration ability, daily performance
- **Key Insight:** "Physical comfort <6 correlates with 50% higher afternoon fatigue and increased emotional eating"

### Q11: Symptom Presence Check
**Question:** "Are you experiencing any of these symptoms?"
**Answer Format:** Multi-select: Headache, Dizziness, Nausea, Congestion, Digestive discomfort, Muscle tension, Skin issues, None
**UI Element:** Symptom grid with quick-tap icons

**CONDITIONAL CLUSTERING** (if multiple selected): "Do these symptoms seem related?"

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Food triggers, sleep deprivation, stress, dehydration, medication side effects, hormonal changes, environmental factors
- **AS TRIGGER:** Daily activity capacity, mood, cognitive function, appetite, exercise tolerance
- **Key Insight:** "Headache + nausea cluster appears 80% of time after <6 hours sleep + dehydration"

### Q12: Energy-Body Connection
**Question:** "How is your physical energy level this morning?"
**Answer Format:** Scale 0-10 (0=physically depleted, 10=physically energetic)
**UI Element:** Physical energy gauge distinct from mental energy

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep restoration, nutrition, hydration, pain levels, inflammation, medication effects, overtraining
- **AS TRIGGER:** Exercise performance, daily activity completion, posture, movement patterns
- **Key Insight:** "Physical energy <5 increases likelihood of skipping planned exercise by 85%"

---

## CHAPTER 3: MOOD & MINDSET (Mental/Emotional State)
*Questions 13-15 | ~30 seconds*

### Q13: Mental Clarity Assessment
**Question:** "Rate your mental clarity this morning"
**Answer Format:** Scale 0-10 (0=very foggy, 10=very clear)
**UI Element:** Clarity scale with brain icons

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep quality, blood sugar stability, dehydration, stress hormones, medication effects, hormonal fluctuations
- **AS TRIGGER:** Decision-making quality, work performance, problem-solving ability, emotional regulation
- **Key Insight:** "Mental clarity <6 correlates with 70% more impulsive food choices and poor stress management"

### Q14: Stress Anticipation
**Question:** "How stressful do you expect today to be?"
**Answer Format:** Scale 0-10 (0=not at all, 10=extremely)
**UI Element:** Stress forecast dial

**CONDITIONAL FOLLOW-UP** (if >6): "What will contribute to today's stress?"
- Work/school, Relationships, Health concerns, Time pressure, Finances, Family

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Previous day stress carryover, sleep debt, upcoming schedule awareness, pain levels, energy state
- **AS TRIGGER:** Cortisol release, digestive function, food choices, exercise motivation, sleep quality preparation
- **Key Insight:** "Anticipated stress >7 increases cortisol by 40% and reduces sleep quality by 25%"

### Q15: Gratitude Practice
**Question:** "What's something you appreciate today?"
**Answer Format:** Quick text entry or selection from personal favorites
**UI Element:** Gratitude input with suggested prompts

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Morning mood state, sleep restoration quality, stress levels, recent positive events
- **AS TRIGGER:** Mood regulation throughout day, stress resilience, social interactions, overall wellbeing
- **Key Insight:** "Daily gratitude practice correlates with 35% better stress management and 20% improved sleep quality"

---

## CHAPTER 4: FUEL & CARE (Nutrition & Medication Baseline)
*Questions 16-18 | ~30 seconds*

### Q16: Hydration State
**Question:** "How hydrated do you feel right now?"
**Answer Format:** Scale 0-10 (0=very dehydrated, 10=optimally hydrated)
**UI Element:** Hydration gauge with water icons

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Previous day fluid intake, alcohol consumption, caffeine intake, sodium levels, sleep environment, medications
- **AS TRIGGER:** Cognitive function, energy levels, headache prevention, exercise performance, mood stability
- **Key Insight:** "Hydration <5 correlates with 60% higher headache risk and 30% lower cognitive performance"

### Q17: Medication Adherence
**Question:** "Did you take your morning medications/supplements?"
**Answer Format:** Quick select: All taken, Some taken, None taken, Not applicable
**UI Element:** Medication checklist with reminders

**CONDITIONAL FOLLOW-UP** (if some/none): "What prevented you from taking them?"
- Forgot, Ran out, Side effects, Away from home, Routine change

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Sleep quality affecting morning routine, stress disrupting habits, travel, pain affecting motivation
- **AS TRIGGER:** Symptom control, energy levels, mood stability, pain management, overall health outcomes
- **Key Insight:** "Missed morning medications correlate with 45% increase in afternoon symptom severity"

### Q18: Hunger & Appetite
**Question:** "Rate your hunger level this morning"
**Answer Format:** Scale 0-10 (0=not hungry, 10=extremely hungry)
**UI Element:** Hunger scale with appetite indicators

**MULTI-DIMENSIONAL CORRELATIONS:**
- **AS OUTCOME:** Previous day eating patterns, sleep quality, stress hormones, medications, blood sugar regulation, hormonal fluctuations
- **AS TRIGGER:** Food choices, portion sizes, eating timing, blood sugar stability, energy patterns
- **Key Insight:** "Extreme morning hunger (>8) often follows poor sleep and predicts overeating by 40%"

---

## CONDITIONAL SECTIONS (User Profile Dependent)

### MOVEMENT MATRIX ADDON (If Active User)
**Q19: Physical Readiness**
"How physically capable do you feel for movement today?" (0-10 scale)

**Q20: Recovery Status** 
"How recovered does your body feel from recent activities?" (0-10 scale)

### MENSTRUAL MAPPING ADDON (If Tracking Cycle)
**Q21: Cycle Status**
"Where are you in your menstrual cycle today?" (Quick phase selector)

**Q22: Cycle Symptoms**
"Any cycle-related symptoms this morning?" (Multi-select: Cramps, Mood changes, Energy changes, None)

---

## INTEGRATED NOTES SYSTEM

### Universal Notes Implementation
Each chapter ends with a simple, consistent notes field that maintains the quick flow while capturing important contextual details.

### Notes UI Specification
**Placement:** Bottom of each chapter, after all structured questions
**Placeholder Text:** "Add any other details here that you think are important or you don't want to forget"
**Text Color:** Light gray (#8E8E93 for iOS compliance)
**UI Element:** Simple text input field, single line that expands when tapped
**Character Limit:** 200 characters to maintain brevity
**Optional:** Always optional - no pressure to complete

### CHAPTER 1: VITAL RHYTHMS - Notes
*After Q8 (Morning Mood)*
```
┌─────────────────────────────────────────────────────┐
│ Add any other details here that you think are       │
│ important or you don't want to forget               │
└─────────────────────────────────────────────────────┘
```

**Common User Examples:**
- "Neighbor's dog barking all night"
- "Excited about vacation tomorrow"
- "New pillow - slept much better"
- "Vivid work dreams"

### CHAPTER 2: BODY SIGNALS - Notes
*After Q12 (Physical Energy)*
```
┌─────────────────────────────────────────────────────┐
│ Add any other details here that you think are       │
│ important or you don't want to forget               │
└─────────────────────────────────────────────────────┘
```

**Common User Examples:**
- "Headache started after skipping dinner"
- "Sore from yesterday's workout"
- "Weather change making joints ache"
- "New supplement seems to help"

### CHAPTER 3: MOOD & MINDSET - Notes
*After Q15 (Gratitude)*
```
┌─────────────────────────────────────────────────────┐
│ Add any other details here that you think are       │
│ important or you don't want to forget               │
└─────────────────────────────────────────────────────┘
```

**Common User Examples:**
- "Stressed about presentation today"
- "Feeling really supported by family"
- "Mind racing about work deadlines"
- "Meditation really helped this morning"

### CHAPTER 4: FUEL & CARE - Notes
*After Q18 (Hunger Level)*
```
┌─────────────────────────────────────────────────────┐
│ Add any other details here that you think are       │
│ important or you don't want to forget               │
└─────────────────────────────────────────────────────┘
```

**Common User Examples:**
- "Forgot to take vitamins"
- "Craving sugar more than usual"
- "New medication timing working better"
- "Drinking more water since reminder"

---

## NOTES ANALYSIS & CORRELATION INTEGRATION

### Natural Language Processing for Notes
**Automatic Keyword Extraction:**
- **Trigger words:** "after," "since," "because," "from," "due to"
- **Emotion words:** "stressed," "excited," "worried," "grateful"
- **Symptom descriptors:** "worse," "better," "started," "stopped"
- **Timing indicators:** "yesterday," "last night," "this morning"

### Smart Categorization
**Auto-tagging of note content:**
- **Environmental factors:** weather, noise, temperature
- **Social factors:** relationships, work, family
- **Health events:** medication changes, illness, injury
- **Lifestyle factors:** travel, routine changes, special events

### Correlation Enhancement Through Notes
**Pattern Recognition Examples:**
- Notes mentioning "stressed about work" + poor sleep quality = work stress sleep correlation
- "Headache after skipping lunch" + low energy = meal timing energy correlation  
- "Sore from new workout" + good mood = exercise mood correlation
- "Forgot pills because rushed" + increased symptoms = routine disruption health correlation

### Clinical Value of Notes Data
**Healthcare Provider Insights:**
- **Contextual symptom information** beyond numerical ratings
- **Patient-identified triggers** and patterns
- **Lifestyle factor documentation** affecting health outcomes
- **Medication effectiveness** and side effect observations
- **Environmental sensitivity** patterns

### Notes-Driven Follow-up Questions
**Adaptive questioning based on note patterns:**
- If user frequently mentions work stress → add work stress tracking
- If notes often reference weather → add weather correlation tracking
- If medication effectiveness mentioned → add medication effectiveness rating scales
- If food reactions noted → add detailed food symptom tracking

---

## TECHNICAL IMPLEMENTATION FOR NOTES

### Database Schema Addition
```sql
morning_checkin_notes {
  id: UUID PRIMARY KEY
  morning_checkin_id: UUID FOREIGN KEY
  chapter_name: ENUM('vital_rhythms', 'body_signals', 'mood_mindset', 'fuel_care')
  note_text: TEXT(200)
  extracted_keywords: ARRAY
  auto_tags: ARRAY
  sentiment_score: DECIMAL
  created_at: TIMESTAMP
}

note_correlations {
  id: UUID PRIMARY KEY
  user_id: UUID FOREIGN KEY
  keyword: STRING
  associated_outcomes: ARRAY
  correlation_strength: DECIMAL
  frequency_count: INTEGER
  first_mentioned: DATE
  last_mentioned: DATE
}
```

### UI/UX Design for Notes
**Smart Interface Features:**
- **Collapsible sections** - Notes area only expands if user wants to add details
- **Voice-to-text option** - Quick note entry via speech
- **Auto-complete suggestions** - Based on user's previous notes
- **Character countdown** - Visual indicator of space remaining
- **Save drafts** - Auto-save as user types

**Visual Integration:**
- **Chapter completion indicator** - Shows notes are optional but available
- **Note icon** - Small notepad icon that expands the text area
- **Quick phrases** - Commonly used phrases as tap-to-add options
- **Previous note reference** - "You mentioned 'work stress' yesterday - still relevant?"

### Privacy & Security for Notes
**Data Protection:**
- **Encrypted storage** - All note content encrypted at rest
- **User control** - Option to exclude notes from provider reports
- **Anonymization** - Option to share insights without specific note content
- **Local processing** - Keyword extraction happens on device when possible

---

## COMPLETION FLOW & INSIGHTS

### Immediate Processing
- **Pattern Recognition:** App analyzes responses for potential correlations
- **Red Flag Detection:** High pain + low energy + poor sleep = wellness alert
- **Daily Predictions:** Based on morning state, predict energy patterns and provide guidance

### Instant Insights Examples
- **Sleep-Energy Connection:** "Your refreshed rating of 8/10 suggests stable energy today - great time for challenging tasks!"
- **Pain-Activity Guidance:** "With moderate pain levels, consider gentle movement rather than intense exercise"
- **Stress-Nutrition Alert:** "High anticipated stress + low hydration = increased craving risk. Set water reminders!"
- **Mood-Social Tip:** "Feeling overwhelmed? Research shows 10 minutes in nature can improve your mood by 25%"

### Data Integration Points
- **Cross-Reference with Evening:** Compare morning predictions to evening outcomes
- **Weekly Pattern Building:** Identify recurring morning patterns and their daily impacts
- **Intervention Tracking:** Monitor how morning interventions (hydration, medication, gratitude) affect daily outcomes
- **Personalized Baselines:** Establish individual normal ranges for all metrics

---

## TECHNICAL IMPLEMENTATION NOTES

### Database Schema Integration
```sql
morning_checkin {
  -- Vital Rhythms
  sleep_duration_hours: DECIMAL(3,2)
  sleep_quality_rating: INTEGER(0-10)
  wake_count: INTEGER
  bedtime: TIME
  wake_time: TIME
  refreshed_rating: INTEGER(0-10)
  morning_energy: INTEGER(0-10)
  dominant_mood: ENUM
  
  -- Body Signals
  pain_level: INTEGER(0-10)
  pain_locations: ARRAY
  physical_comfort: INTEGER(0-10)
  morning_symptoms: ARRAY
  physical_energy: INTEGER(0-10)
  
  -- Mood & Mindset
  mental_clarity: INTEGER(0-10)
  anticipated_stress: INTEGER(0-10)
  stress_sources: ARRAY
  gratitude_entry: TEXT
  
  -- Fuel & Care
  hydration_level: INTEGER(0-10)
  medication_adherence: ENUM
  hunger_level: INTEGER(0-10)
}
```

### UI/UX Optimization
- **Progress indication** between chapters
- **Smart skipping** of irrelevant questions based on user profile
- **Quick review** screen showing all responses before submission
- **Insight preview** cards appearing during completion
- **Adaptive timing** based on user completion patterns

### Correlation Engine Triggers
- **Immediate analysis** of response patterns
- **Threshold alerts** for concerning combinations
- **Pattern recognition** across time windows
- **Intervention suggestions** based on current state
- **Predictive modeling** for daily outcomes