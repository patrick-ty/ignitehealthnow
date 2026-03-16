# IgniteHealth App: Journal Analysis & Correlation Strategy

## Executive Summary

After analyzing your journal question framework, I've identified significant opportunities to enhance correlation capabilities and diagnostic potential. Your current structure captures key health domains but needs strategic modifications to maximize pattern recognition and health insights.

## Current Journal Categories Analysis

### 1. Vital Rhythms and Energy
**Current Questions:** 11 core questions covering sleep quality, timing, energy patterns
**Strengths:** Good temporal data collection, subjective quality metrics
**Correlation Gaps:** Missing sleep architecture details, caffeine/alcohol timing integration

### 2. Body Signals (Physical Symptoms)
**Current Questions:** 16 questions covering pain, symptoms, triggers
**Strengths:** Comprehensive symptom tracking, pain characterization
**Correlation Gaps:** Insufficient symptom relationship mapping, limited temporal correlation

### 3. Fuel & Flow (Nutrition)
**Current Questions:** Photo-based food logging, drink tracking, bowel movements
**Strengths:** Visual documentation reduces recall bias
**Correlation Gaps:** Missing meal timing correlations, inadequate digestive symptom tracking

### 4. Movement Matrix
**Current Questions:** Basic activity tracking
**Strengths:** Simple tracking approach
**Correlation Gaps:** Missing recovery metrics, exercise-symptom relationships

### 5. Mood & Mindset
**Current Questions:** Limited mood tracking
**Strengths:** Basic emotional state capture
**Correlation Gaps:** Missing stress-symptom correlations, cognitive function tracking

### 6. Medicine Management
**Current Questions:** Basic medication tracking
**Strengths:** Adherence monitoring
**Correlation Gaps:** Missing effectiveness tracking, side effect correlation

### 7. Menstrual Mapping
**Current Questions:** Cycle tracking
**Strengths:** Hormone-related pattern capture
**Correlation Gaps:** Limited cross-system correlation with other symptoms

### Conditional Follow-up Questions Analysis

**Trigger: Sleep Quality <5**
- **Current Question:** "What factors disrupted your sleep?"
- **Options:** Noise, temperature, pain/discomfort, anxiety/thoughts, bathroom, partner, pet
- **Issues:** Missing key disruptors (light, caffeine, stress)
- **Enhanced Options:** Add "bright lights", "late caffeine", "stress/worry", "uncomfortable mattress/pillow", "too hot/cold", "external noise", "pain/discomfort", "bathroom needs", "partner/pet disturbance", "racing thoughts", "other"
- **Database Field:** `sleep_disruption_factors` (array of enums)

**Trigger: Refreshed Rating <5**  
- **Current Question:** "What symptoms are you experiencing this morning?"
- **Options:** Grogginess, headache, body stiffness, mental fog, fatigue despite sleep, anxiety
- **Issues:** Good coverage of morning symptoms
- **Enhanced Version:** Add intensity ratings for each symptom
- **Database Fields:** `morning_symptoms` (array), `morning_symptom_intensities` (array of integers 1-5)

**Trigger: Sleep Duration <6 hours**
- **Current Question:** "What prevented you from getting more sleep?"
- **Options:** Work/obligations, started thinking about things, chose to stay up, couldn't fall asleep, woke up and couldn't return to sleep, disturbances
- **Issues:** Good behavioral and physiological factors
- **Enhanced Version:** Keep as-is, well structured
- **Database Field:** `sleep_prevention_factors` (array of enums)

## Correlation Enhancement Recommendations

### High-Priority Correlations to Enable

**1. Sleep Quality → Next-Day Energy Patterns**
- **Required Data:** Sleep quality, duration, continuity → Morning energy, energy pattern, fatigue
- **Correlation Window:** 8-16 hour lag
- **Database Schema:** Link `sleep_quality_rating` with `morning_energy_rating` and `daily_energy_pattern`

**2. Caffeine Timing → Sleep Quality**
- **Required Data:** Last caffeine consumption time → Sleep onset time, sleep quality
- **Correlation Window:** 6-12 hour impact
- **Database Schema:** Reference `substance_consumption` table filtered by `caffeine` type

**3. Sleep Consistency → Energy Stability**
- **Required Data:** Bedtime/wake time variance → Energy pattern consistency
- **Correlation Window:** Weekly patterns
- **Database Schema:** Calculate `sleep_schedule_variance` from bedtime/wake time standard deviation

**4. Sleep Disruption Factors → Morning Symptoms**
- **Required Data:** Sleep disruption types → Specific morning symptoms
- **Correlation Window:** Same night to next morning
- **Database Schema:** Link `sleep_disruption_factors` with `morning_symptoms`

### Missing Critical Data Points

**1. Sleep Onset Latency**
- **New Question:** "How long did it take you to fall asleep last night?"
- **Format:** "Less than 15 minutes", "15-30 minutes", "30-60 minutes", "More than 1 hour"
- **Database Field:** `sleep_onset_latency_category` (enum)

**2. Sleep Efficiency Context**
- **New Question:** "How much time did you spend in bed vs. actually sleeping?"
- **Format:** Calculated from bedtime, sleep onset, wake time
- **Database Field:** `sleep_efficiency_percentage` (calculated field)

**3. Pre-Sleep Routine Quality**
- **New Question:** "How would you rate your pre-sleep routine last night?"
- **Format:** 0-10 scale with specific routine elements tracked
- **Database Field:** `pre_sleep_routine_rating` (integer 0-10)

**4. Energy-Activity Correlation**
- **New Question:** "How did your energy level affect your planned activities today?"
- **Format:** "Completed all as planned", "Modified some activities", "Cancelled some activities", "Cancelled most activities"
- **Database Field:** `energy_activity_impact` (enum)

## Optimized Question Set for Vital Rhythms

### MORNING CHECK-IN (6 questions, ~90 seconds)

1. **Sleep Duration** (auto-calculated from bedtime/wake time)
2. **"How long did it take you to fall asleep?"** (sleep onset latency)  
3. **"How many times did you wake up, and about how long were you awake total?"** (continuity)
4. **"Rate your overall sleep quality"** (0-10, core metric)
5. **"How refreshed do you feel?"** (0-10, outcome measure)
6. **"Rate your energy level right now"** (0-10, baseline)

### EVENING CHECK-IN (5 questions, ~75 seconds)

1. **"When was your energy highest today?"** (time + level 0-10)
2. **"When was your energy lowest today?"** (time + level 0-10)  
3. **"How did your energy pattern affect your activities?"** (impact assessment)
4. **"Rate your current fatigue level"** (0-10)
5. **"How ready do you feel for quality sleep tonight?"** (0-10, sleep readiness)

### CONDITIONAL QUESTIONS (trigger-based)

- **If sleep quality <5:** Sleep disruption factors
- **If refreshed <5:** Morning symptom assessment  
- **If sleep onset >30 min:** Pre-sleep routine analysis
- **If energy severely impacted activities:** Energy barrier identification

## Database Schema for Vital Rhythms

### Core Tables

```sql
-- Primary sleep/energy tracking
vital_rhythms_daily {
  id: UUID PRIMARY KEY
  user_id: UUID FOREIGN KEY
  date: DATE
  
  -- Sleep Data
  bedtime: TIME
  wake_time: TIME
  sleep_duration_minutes: INTEGER (calculated)
  sleep_onset_latency: ENUM ('under_15min', '15_30min', '30_60min', 'over_60min')
  night_wakings_count: INTEGER
  total_wake_duration_minutes: INTEGER
  sleep_quality_rating: INTEGER (0-10)
  morning_refreshed_rating: INTEGER (0-10)
  
  -- Energy Data  
  morning_energy_rating: INTEGER (0-10)
  energy_peak_time: TIME
  energy_peak_level: INTEGER (0-10)
  energy_low_time: TIME
  energy_low_level: INTEGER (0-10)
  evening_fatigue_rating: INTEGER (0-10)
  daily_energy_pattern: ENUM ('steady', 'morning_high_afternoon_crash', 'multiple_dips', 'gradual_decline', 'increasing')
  energy_activity_impact: ENUM ('no_impact', 'minor_modifications', 'some_cancelled', 'major_limitations')
  
  -- Sleep Environment
  sleep_environment_rating: INTEGER (0-10)
  pre_sleep_screen_minutes: INTEGER
  sleep_readiness_rating: INTEGER (0-10)
  
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- Sleep disruption tracking (many-to-many)
sleep_disruptions {
  id: UUID PRIMARY KEY
  vital_rhythms_daily_id: UUID FOREIGN KEY
  disruption_type: ENUM ('noise', 'temperature', 'pain', 'anxiety_thoughts', 'bathroom', 'partner_pet', 'light', 'uncomfortable_bedding', 'stress_worry')
  intensity: INTEGER (1-5)
}

-- Morning symptoms (many-to-many)
morning_symptoms {
  id: UUID PRIMARY KEY  
  vital_rhythms_daily_id: UUID FOREIGN KEY
  symptom_type: ENUM ('grogginess', 'headache', 'body_stiffness', 'mental_fog', 'fatigue', 'anxiety', 'irritability')
  intensity: INTEGER (1-5)
}
```

### Calculated Fields and Correlations

```sql
-- Sleep efficiency calculation
sleep_efficiency_percentage = (sleep_duration_minutes / time_in_bed_minutes) * 100

-- Sleep debt tracking (rolling 7-day average vs. optimal)
sleep_debt_minutes = (optimal_sleep_minutes * 7) - SUM(sleep_duration_minutes, 7_days)

-- Energy stability index (lower variance = more stable)
energy_stability_index = 1 / STDDEV(energy_ratings_throughout_day)

-- Circadian rhythm consistency 
bedtime_variance = STDDEV(bedtime, 7_days)
wake_time_variance = STDDEV(wake_time, 7_days)
```

## Action Items for Vital Rhythms Optimization

### Immediate Changes (Week 1-2)
1. **Reduce question redundancy** - Combine or differentiate sleep quality vs. refreshed feeling
2. **Add sleep onset latency** - Critical missing correlation factor
3. **Enhance timing precision** - Ensure bedtime/wake time accuracy for circadian analysis
4. **Standardize all scales to 0-10** - Currently inconsistent

### Medium-term Enhancements (Month 1)
1. **Implement conditional logic** - Show follow-up questions only when triggered
2. **Add energy-activity impact tracking** - Connect energy levels to functional outcomes
3. **Create sleep efficiency calculations** - Automatic derivation from time data
4. **Build correlation dashboard** - Show sleep quality → next day energy patterns

### Long-term Integration (Month 2-3)
1. **Cross-reference with Fuel & Flow** - Caffeine/alcohol timing correlations
2. **Integrate with Body Signals** - Sleep quality → pain/symptom correlations  
3. **Connect to Movement Matrix** - Exercise timing → sleep quality correlations
4. **Build predictive insights** - "Based on your sleep pattern, you're likely to experience..."

## Success Metrics for Vital Rhythms

### User Engagement
- **Morning check-in completion rate >85%** (target: under 90 seconds)
- **Evening check-in completion rate >80%** (target: under 75 seconds)  
- **Conditional question relevance >90%** (only show when truly applicable)

### Correlation Discovery
- **Sleep quality → energy correlation detection within 7-10 days** of consistent tracking
- **Sleep timing → energy pattern correlation within 14 days**
- **Disruption factor → morning symptom correlation within 5-7 occurrences**

### Clinical Value
- **Sleep efficiency accuracy within 10%** of clinical sleep studies
- **Circadian rhythm pattern recognition** matching validated sleep assessments
- **Predictive accuracy >75%** for next-day energy levels based on sleep data

---

**Current Capacity Usage: ~65%** - We have space to dive deeper into specific correlation algorithms or move to the next journal section analysis.