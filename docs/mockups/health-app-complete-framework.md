## Implementation Guidelines for Developers

### Core Principles

1. **Minimal User Burden:** Symptom clustering should never make the app feel longer or more complex
2. **Progressive Intelligence:** Start with basic tracking, gradually introduce pattern insights as data accumulates
3. **Contextual Questions:** Only show relationship questions when multiple symptoms are actually reported
4. **Background Analysis:** Most pattern detection happens behind the scenes without requiring user input
5. **Value First:** Show users the benefits of pattern recognition through actionable insights

### Technical Architecture

1. **Symptom Database**
   - Create a unified symptom database across all sections
   - Tag each symptom with metadata: type, severity, time, duration, location
   - Link related symptoms through relationship tables

2. **Pattern Detection Engine**
   - Implement statistical correlation with adjustable time windows
   - Create confidence scoring for potential relationships
   - Build threshold detection for symptom triggers
   - Develop symptom cluster storage with user-provided names

3. **Intervention Tracking**
   - Link interventions to specific symptom clusters
   - Track effectiveness ratings for each intervention
   - Compare effectiveness across intervention types

4. **User Experience Flow**
   - Main questions remain exactly as specified in section frameworks
   - Relationship questions appear only when multiple symptoms are selected
   - Weekly review appears once per week, takes <30 seconds
   - Insight cards appear on home screen, not during data entry

### Implementation Timeline

1. **Phase 1: Basic Tracking**
   - Implement all questions from each section
   - Create simple symptom database
   - Begin collecting relationship data when multiple symptoms reported

2. **Phase 2: Pattern Recognition**
   - Implement background statistical analysis
   - Begin showing simple correlation insights
   - Add weekly pattern confirmation

3. **Phase 3: Advanced Clustering**
   - Implement named symptom clusters
   - Add impact assessment for clusters
   - Develop intervention effectiveness tracking per cluster

4. **Phase 4: Clinical Integration**
   - Create healthcare provider reports organized by symptom clusters
   - Develop clinical decision support features
   - Add medical terminology and classifications

### User Data Flow Example

1. User reports headache (Body Signals) and fatigue (Vital Rhythms)
2. App asks: "Do your headache and fatigue seem related?" User says "Yes"
3. App records these as potentially related symptoms
4. Next time user reports same combination, app confirms the pattern
5. After 3+ occurrences, app suggests naming the pattern
6. User names it "Afternoon crash"
7. App begins tracking "Afternoon crash" as a named entity
8. Backend analysis identifies that "Afternoon crash" often follows poor sleep and high stress
9. User receives insight: "Your 'Afternoon crash' pattern typically occurs after nights with <6 hours sleep and stress levels >7"
10. App tracks which interventions help with "Afternoon crash" specifically

### Development Priorities

1. **First Priority: Core Tracking**
   - Implement all questions from the seven sections
   - Focus on clean, fast user experience
   - Ensure conditional logic works properly

2. **Second Priority: Basic Clustering**
   - Implement relationship questions for multiple symptoms
   - Create simple temporal correlation
   - Begin identifying potential patterns

3. **Third Priority: Pattern Insights**
   - Develop insight generation and presentation
   - Implement intervention tracking per pattern
   - Create basic reporting

4. **Fourth Priority: Clinical Features**
   - Develop healthcare provider reports
   - Implement medical coding and classification
   - Create advanced pattern analysis

## Conclusion

This integrated framework combines comprehensive health tracking with intelligent symptom clustering while maintaining a simple, engaging user experience. By implementing symptom relationship detection through conditional follow-up questions and background analysis, the app can identify meaningful health patterns without adding significant user burden.

The key to success is the balance between explicit user confirmation of relationships and intelligent background analysis. Most pattern detection happens automatically, with users only being asked to confirm or name patterns that have statistical significance.

This approach creates a powerful diagnostic tool that becomes increasingly valuable over time as more data is collected and more patterns are identified. The resulting insights will help users understand their health patterns and provide healthcare providers with structured, meaningful data for clinical decision-making.# Health Intelligence Tracking App: Complete Framework with Symptom Clustering

This document provides a comprehensive framework for building the Health Intelligence Tracking App, including both the core question framework and integrated symptom clustering capabilities. This single resource contains everything developers need to implement the complete system.

## App Structure Overview

The app consists of seven core tracking sections, photo documentation for consumption tracking, and an intelligent symptom clustering system that works across all sections without adding user burden.

## Core Tracking Sections

1. **Vital Rhythms** (Sleep & Energy)
2. **Body Signals** (Physical Symptoms)
3. **Fuel & Flow** (Nutrition & Digestion)
4. **Movement Matrix** (Exercise, Activity & Recovery)
5. **Mood & Mindset** (Mental & Emotional Wellbeing)
6. **Medicine Management** (Medications & Treatments)
7. **Menstrual Mapping** (Hormonal Patterns)

## User Experience Guidelines

To ensure a positive, engaging user experience:

1. **Check-in Length**: Morning check-in should take <2 minutes, evening check-in <3 minutes
2. **Adaptive Questions**: Only show questions relevant to the user's situation
3. **Progressive Disclosure**: Start with core questions, reveal follow-ups only when needed
4. **Visual Inputs**: Use sliders, buttons, and visual selectors whenever possible
5. **Value-First Approach**: Show insights before asking for more data

## Photo Documentation System

### Quick-Capture Photo Documentation

| Interaction | Capture Method | Purpose |
|-------------|---------------|---------|
| Food/Beverage Consumption | Photo + timestamp | Visual documentation of all intake with exact timing |
| Quick Categorization | Tap selection after photo | Proper classification of consumption type |
| Contextual Questions | Minimal follow-up based on category | Capture subjective experience and context |

### Consumption Photo Documentation Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Photo Documentation | Photo capture interface with timestamp | Visual record of all consumption | Store metadata for pattern analysis |
| [After photo] What category does this belong to? | Quick selection: Meal, Snack, Caffeinated drink, Alcoholic drink, Water/non-caffeinated beverage | Categorization for analysis | UI: Large tap targets for quick selection |
| [If meal] How full did you feel after eating? | Scale selection: 1 (Still hungry), 2 (Satisfied but could eat more), 3 (Comfortably full), 4 (Very full), 5 (Uncomfortably full) | Satiety level tracking | Store this data to correlate with subsequent symptoms |
| [If caffeinated] Did you feel any immediate effects? | Multi-select: Energy boost, Jitters/anxiety, Improved focus, Digestive effects, Headache, No noticeable effects | Immediate caffeine response | **Clustering**: Tag these as potential symptoms for later correlation |
| [If alcoholic] Did you feel any immediate effects? | Multi-select: Relaxation, Mood change, Sleepiness, Increased energy, Digestive discomfort, No noticeable effects | Immediate alcohol response | **Clustering**: Tag any negative effects as symptoms |
| [If alcoholic] Did you consume this with food? | Yes/No | Food co-consumption | Factor for symptom modulation analysis |
| [If alcoholic] How hydrated were you while drinking? | Selection: Alternated with water, Had some water, No additional water | Hydration with alcohol | Factor for symptom modulation analysis |

## 1. Vital Rhythms (Sleep & Energy)

### Morning Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How many hours did you sleep last night? | Numeric entry (hours and minutes) | Track sleep duration for correlation with energy, mood, and cognitive function | **Clustering**: Flag if <6 hours for potential symptom trigger |
| Rate your overall sleep quality | Scale 0-10 (0=terrible, 10=excellent) | Assess subjective sleep quality for correlation with various health factors | **Clustering**: Flag if <5 for potential symptom trigger |
| How many times did you wake during the night? | Numeric entry (0, 1, 2, 3, 4+) | Measure sleep continuity for deeper sleep quality analysis | Factor in sleep disruption patterns |
| What time did you go to bed last night? | Time selection | Track sleep timing patterns for circadian rhythm analysis | Important for timing correlations |
| What time did you wake up today? | Time selection | Track wake timing for circadian rhythm analysis | Important for timing correlations |
| How refreshed do you feel this morning? | Scale 0-10 (0=exhausted, 10=fully refreshed) | Assess sleep restorative quality | **Clustering**: If <5, add to potential symptom list |
| Rate your energy level right now | Scale 0-10 (0=no energy, 10=highly energetic) | Baseline morning energy metric | **Clustering**: If <4, tag as potential symptom |
| Select your predominant morning mood | Multi-select: Calm, Content, Anxious, Irritable, Sad, Motivated, Foggy, Energetic | Track mood-sleep relationship | **Clustering**: Any negative moods tagged as potential symptoms |

### Evening Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How did your energy fluctuate today? | Pattern selection: Steady, Morning peak/afternoon dip, Multiple crashes, Steady decline, Second wind in evening | Identify energy pattern types | **Clustering**: "Multiple crashes" pattern gets tagged for correlation |
| When was your energy highest today? | Time selection | Track optimal energy timing | Time correlation for symptom patterns |
| When was your energy lowest today? | Time selection | Identify energy dips for correlation | **Clustering**: Tag low energy periods as potential symptoms |
| Rate your fatigue level right now | Scale 0-10 (0=not fatigued, 10=extremely fatigued) | Evening fatigue assessment | **Clustering**: If >6, tag as potential symptom |
| Rate your sleep environment quality for tonight | Scale 0-10 (0=poor, 10=excellent) | Track sleep environment impact | Sleep quality factor |
| How effective was your pre-sleep routine tonight? | Scale 0-10 (0=ineffective, 10=very effective) | Assess pre-sleep routine impact | Sleep quality factor |
| Did you use any screens within an hour of bedtime? | Yes/No | Track blue light exposure | Sleep quality factor |
| Did you consume caffeine today? | No/Yes - with time of last consumption | Track caffeine impact on sleep | **Clustering**: Flag as potential trigger if followed by symptoms |
| Did you consume alcohol today? | No/Yes - with number of drinks and time of last consumption | Track alcohol impact on sleep | **Clustering**: Flag as potential trigger if followed by symptoms |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose | Implementation Notes |
|---------|-------------------|---------------|---------|---------------------|
| Sleep quality <5 | What factors disrupted your sleep? | Multi-select: Noise, Temperature, Pain/discomfort, Anxiety/thoughts, Bathroom visits, Partner/pet, Caffeine/alcohol, Other | Identify sleep disruptors | **Clustering**: Tag "Pain/discomfort" for symptom tracking |
| Wake state <5 | What symptoms are you experiencing this morning? | Multi-select: Grogginess, Headache, Body stiffness, Mental fog, Fatigue despite sleep, Anxiety | Identify poor sleep outcomes | **Clustering**: Add all selected items to morning symptom cluster |
| Sleep duration <6 hours | What prevented you from getting more sleep? | Multi-select: Work/obligations, Chose to stay up, Couldn't fall asleep, Woke up and couldn't return to sleep, Disturbances | Identify sleep barriers | **Clustering**: "Couldn't fall asleep" may indicate anxiety symptom |

## 2. Body Signals (Physical Symptoms)

### Morning Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Are you experiencing any pain this morning? | Yes/No | Pain presence baseline | Gateway question |
| [If yes] Rate your pain level | Scale 0-10 (0=none, 10=severe) | Pain intensity metric | **Clustering**: Severity is key for cluster significance |
| [If yes] Select the location(s) of your pain | Dropdown multi-select: Head, Neck, Shoulders, Upper back, Lower back, Chest, Abdomen, Pelvis, Hips, Arms, Elbows, Wrists, Hands, Legs, Knees, Ankles, Feet, Joints (general), Muscles (general), Other (with text field) | Pain location tracking | **Clustering**: Multiple locations may indicate different symptom clusters |
| [If yes] How would you describe this pain? | Multi-select: Sharp, Dull, Throbbing, Burning, Stabbing, Aching, Cramping, Tender | Pain quality analysis | Quality helps differentiate symptom types |
| [If yes] When did this pain begin? | Time selection: Just now, Overnight, Yesterday, Several days ago, Chronic | Pain onset tracking | **Clustering**: Critical for establishing temporal relationships |
| Rate your overall physical comfort right now | Scale 0-10 (0=very uncomfortable, 10=very comfortable) | General physical wellbeing | Baseline metric |
| Are you experiencing any of these symptoms? | Multi-select from common symptoms: Headache, Dizziness, Nausea, Fatigue, Shortness of breath, Digestive discomfort, Joint/muscle pain, Congestion, Sore throat, Skin issues | Symptom baseline tracking | **Clustering**: If multiple symptoms selected, add follow-up: "Do these symptoms seem related to each other?" Yes/No/Unsure |
| How is your overall physical energy level? | Scale 0-10 (0=depleted, 10=energetic) | Physical energy baseline | **Clustering**: If consistently low with other symptoms, may form fatigue cluster |

### Evening Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How did your pain/discomfort change throughout the day? | Pattern selection: Improved, Worsened, Fluctuated, Stayed the same, Disappeared | Pain pattern tracking | **Clustering**: Temporal pattern helps identify triggers |
| Did you develop any new symptoms today? | Multi-select from symptom list + None | New symptom tracking | **Clustering**: If new symptoms relate to morning symptoms, add to cluster |
| [If new symptoms] When did these symptoms first appear? | Time selection | Symptom onset timing | **Clustering**: Critical for temporal correlation with activities |
| How did your symptom intensity change today? | Pattern selection: Improved, Worsened, Fluctuated, Stayed the same | Symptom progression | Track pattern over time |
| Did you feel unusually hot or cold today? | Scale: Much colder than normal - Much hotter than normal | Temperature regulation | **Clustering**: Temperature dysregulation often connects to other symptoms |
| Rate your overall physical comfort right now | Scale 0-10 (0=very uncomfortable, 10=very comfortable) | Evening physical state | Compare to morning baseline |
| Any unusual physical sensations today? | Multi-select: Tingling, Numbness, Weakness, Tremors, Palpitations, Vision changes, Hearing changes, Balance issues, None | Neurological/cardiac tracking | **Clustering**: These often form important symptom clusters with other issues |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose | Implementation Notes |
|---------|-------------------|---------------|---------|---------------------|
| New symptom selected | When did this symptom first appear? | Time selection | Symptom onset timing | Correlate with other tracked factors at that time |
| Symptom intensity >7 | What makes this symptom better or worse? | Multi-select: Movement, Position change, Rest, Heat/cold, Food/drink, Medications, Stress, Time of day | Identify modulators | Critical for understanding symptom patterns |
| Pain location is consistent with previous entry | What have you tried to relieve this pain? | Multi-select: Rest, Heat, Cold, OTC medication, Prescription medication, Massage, Stretching, Position change, Nothing yet | Track interventions | **Clustering**: Treatment effectiveness becomes part of cluster profile |
| Headache reported | What type of headache? | Multi-select: Tension, Migraine, Sinus, Cluster, Unknown | Headache classification | **Clustering**: Different types may belong to different symptom clusters |
| Digestive symptoms reported | Where is your digestive discomfort? | Dropdown selection: Upper abdomen (center), Upper abdomen (right), Upper abdomen (left), Middle abdomen (center), Middle abdomen (right), Middle abdomen (left), Lower abdomen (center), Lower abdomen (right), Lower abdomen (left), General/diffuse, Other (with text field) | Locate digestive issues | **Clustering**: Location helps differentiate digestive symptom clusters |
| Multiple symptoms selected | Do these symptoms seem to be related to each other? | Yes/No/Unsure | Begin symptom clustering | **Clustering**: Key question for user-confirmed symptom relationships |
| Multiple related symptoms confirmed | Did one symptom appear before the others? | Selection of symptoms in order | Establish symptom sequence | **Clustering**: Important for understanding symptom progression |
| Recurring symptom cluster identified | We've noticed these symptoms often occur together. Would you like to name this pattern? | Text entry for cluster name | Name symptom clusters | Makes symptoms more memorable and trackable for users |

## 3. Fuel & Flow (Nutrition & Digestion)

### Morning Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Rate your hunger level this morning | Scale 0-10 (0=not hungry, 10=extremely hungry) | Morning hunger baseline | Tracks digestive functioning |
| Rate your digestive comfort right now | Scale 0-10 (0=significant discomfort, 10=perfect comfort) | Morning digestive baseline | **Clustering**: If <5, tag as potential digestive symptom |
| How hydrated do you feel? | Scale 0-10 (0=very dehydrated, 10=optimally hydrated) | Morning hydration status | **Clustering**: If <4, tag as potential symptom trigger |
| What did you eat for breakfast? | Category multi-select: Fruits, Vegetables, Grains/bread, Protein (meat/plant), Dairy, Processed foods, Sweets, Coffee/tea, None | Breakfast composition | **Clustering**: Tag as potential triggers for later symptoms |
| [If ate breakfast] How full did you feel after eating? | Scale selection: 1 (Still hungry), 2 (Satisfied but could eat more), 3 (Comfortably full), 4 (Very full), 5 (Uncomfortably full) | Satiety level tracking | Eating pattern factor |
| [If applicable] Did you experience any digestive symptoms after eating? | Multi-select: Bloating, Gas, Acid reflux, Nausea, Abdominal pain, None | Post-meal symptoms | **Clustering**: Immediately tag as "Post-breakfast symptom cluster" if multiple selected |

### Evening Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Approximately how much water did you drink today? | Volume selection: <2 cups, 2-4 cups, 4-6 cups, 6-8 cups, >8 cups | Daily hydration tracking | Hydration factor |
| How many meals did you eat today? | Numeric selection (0-6+) | Meal frequency | Eating pattern factor |
| Select the times when you ate today | Time multi-select | Meal timing patterns | **Clustering**: Correlate meal times with symptom onset times |
| Which food groups did you consume today? | Category percentage slider: Vegetables, Fruits, Grains/starches, Proteins, Dairy/alternatives, Processed foods, Sweets | Dietary composition | **Clustering**: Potential symptom triggers |
| Did you experience any digestive discomfort today? | Multi-select: Acid reflux, Bloating, Gas, Abdominal pain, Nausea, Constipation, Diarrhea, None | Digestive symptom tracking | **Clustering**: If multiple selected, ask if related |
| [If yes to symptoms] When did these symptoms occur? | Selection: Before meals, During meals, 0-30 min after eating, 1-2 hours after eating, 2+ hours after, Random times | Symptom timing | **Clustering**: Critical for food-symptom correlations |
| How would you describe your hunger pattern today? | Pattern selection: Steady hunger at mealtimes, Constant hunger, Minimal hunger, Extreme hunger, Fluctuating | Hunger pattern tracking | Metabolic function indicator |

### Bowel Movement Tracking Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How many bowel movements have you had in the past 24 hours? | Numeric selection: 0, 1, 2, 3, 4+ | BM frequency tracking | Digestive function metric |
| [If >0] Select the consistency of your most recent bowel movement | Bristol Stool Scale visualization, types 1-7 | Stool consistency tracking | **Clustering**: Types 1-2 and 6-7 may indicate digestive issues |
| [If >0] How would you rate the ease of your recent bowel movement? | Scale 0-10 (0=difficult, 10=easy) | BM ease assessment | Digestive function metric |
| [If >0] Did you feel completely emptied after your bowel movement? | Yes/Somewhat/No | BM completeness | Digestive function metric |
| [If >0] Select the color that best matches your stool | Visual color selection: Brown shades, Black, Gray/clay, Green, Yellow, Red-streaked | Stool color tracking | **Clustering**: Abnormal colors may trigger red flag alerts |
| [If >0] Did you notice any of the following in your stool? | Multi-select: Undigested food, Mucus, Blood, Unusual color, Floating/difficult to flush, Greasy appearance, None of these | Stool abnormalities | **Clustering**: Important clinical indicators |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose | Implementation Notes |
|---------|-------------------|---------------|---------|---------------------|
| Digestive symptoms selected | What foods preceded this discomfort? | Free text with suggestions | Food-symptom correlation | **Clustering**: Critical for identifying food triggers |
| Hydration <5 | What factors limited your fluid intake today? | Multi-select: Forgot, Busy, Limited access, Not thirsty, Dislike water, Substituted other drinks | Hydration barriers | Behavioral factor |
| After large meals | How did you feel 1-2 hours after this meal? | Multi-select: Energized, Tired/sluggish, Bloated, Satisfied, Hungry again, Digestive discomfort | Post-meal effects | **Clustering**: "Tired/sluggish" may connect to fatigue clusters |
| Blood in stool reported | What color was the blood? | Bright red, Dark red, Black | GI bleeding location indicator | Medical red flag - trigger alert |
| Constipation or diarrhea reported | How long has this been occurring? | Selection: Just today, 2-3 days, 4-7 days, >1 week | Chronicity assessment | **Clustering**: Chronic issues form important clusters |
| Abnormal stool color (not brown) | Have you consumed anything that might affect stool color? | Multi-select: Beets, Iron supplements, Medications, Artificial colors, Leafy greens, None of these | Non-pathological causes | Rule out benign causes |
| Multiple digestive symptoms | Do these digestive issues seem related to each other? | Yes/No/Unsure | Establish digestive symptom clusters | **Clustering**: Create named digestive symptom clusters |

## 4. Movement Matrix (Exercise, Activity & Recovery)

### Morning Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How physically capable do you feel this morning? | Scale 0-10 (0=incapable, 10=highly capable) | Physical readiness metric | **Clustering**: If <5, may connect to fatigue/pain clusters |
| Rate any muscle soreness or stiffness | Scale 0-10 (0=none, 10=severe) | Baseline soreness tracking | **Clustering**: If >6, tag as potential symptom |
| [If soreness >3] Select areas experiencing soreness | Dropdown multi-select: Neck, Shoulders, Arms, Chest, Back (upper), Back (lower), Abdomen, Glutes, Thighs (front), Thighs (back), Calves, Feet, Other (with text field) | Soreness location tracking | **Clustering**: Pattern of locations may indicate workout-related vs. other |
| How recovered does your body feel today? | Scale 0-10 (0=not recovered, 10=fully recovered) | Recovery status | **Clustering**: If <5, factor into fatigue clusters |
| Which body areas need recovery attention today? | Dropdown multi-select: Full body, Neck, Shoulders, Arms, Back, Core, Hips, Legs, Feet, Joints (general), Muscles (general), Mental/cognitive, None, Other (with text field) | Recovery focus areas | **Clustering**: Multiple areas may indicate systemic issues |

### Evening Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Did you exercise or do intentional physical activity today? | Yes/No | Activity completion | **Clustering**: Activity becomes potential trigger or relief |
| [If yes] What type of exercise did you complete? | Category selection | Exercise type tracking | Activity classification |
| [If yes] Duration of activity | Time selection: <15 min, 15-30 min, 30-45 min, 45-60 min, 60-90 min, >90 min | Exercise duration | **Clustering**: Duration factors into symptom triggers |
| [If yes] Rate the intensity of your workout | Scale 0-10 (0=very light, 10=maximum effort) | Exercise intensity | **Clustering**: Intensity important for post-exertional symptoms |
| [If yes] How did you feel during the workout? | Multi-select: Energized, Challenged but managing, Struggling, Pain/discomfort, Enjoying it, Mentally focused, Mentally distracted | Exercise experience | **Clustering**: "Pain/discomfort" tagged for correlation |
| [If yes] How do you feel after exercising? | Multi-select: Accomplished, Tired, Energized, Sore, Pain, Mental clarity, Mood boost | Post-exercise state | **Clustering**: Tag both positive and negative responses |
| Estimate your total active minutes today (beyond exercise) | Time selection | Daily movement metric | Activity level factor |
| Approximately how many steps or miles did you move today? | Numeric entry | Activity volume | Activity level factor |
| Did you use any recovery practices today? | Multi-select: Extra sleep/nap, Gentle movement/stretching, Hot/cold therapy, Self-massage/foam rolling, Complete rest, Relaxation techniques, None | Recovery practices | **Clustering**: Tag as potential symptom relief methods |
| [If recovery activities] How effective were these recovery methods? | Scale 0-10 (0=ineffective, 10=very effective) | Recovery effectiveness | **Clustering**: Effectiveness tracked per symptom cluster |
| Based on your current state, what's most important for tomorrow? | Selection: More activity, More recovery, Balanced approach | Recovery-activity planning | User self-assessment |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose | Implementation Notes |
|---------|-------------------|---------------|---------|---------------------|
| Post-exercise (1 hour after) | Rate your recovery 1 hour after exercise | Scale 0-10 (0=not recovered, 10=fully recovered) | Short-term recovery | **Clustering**: Poor recovery may indicate symptom cluster |
| Post-exercise (1 hour after) | Are you experiencing any post-exercise symptoms? | Multi-select: Excessive fatigue, Dizziness, Nausea, Muscle trembling, Pain (beyond normal soreness), Headache, None | Exercise tolerance | **Clustering**: Create "Post-exertional symptom cluster" if multiple selected |
| Planned but not completed exercise | What prevented your planned exercise? | Multi-select: Energy too low, Time constraints, Pain/injury, Motivation lacking, Unexpected events, Weather, Changed my mind | Exercise barriers | **Clustering**: "Energy too low" or "Pain" connect to symptom clusters |
| Muscle soreness reported | Is this soreness from a recent workout or new/concerning? | Selection: Expected from workout, Unexpected/concerning | Soreness classification | **Clustering**: "Unexpected" tagged as potential symptom |
| High-intensity workout completed | How long do you expect to need for full recovery? | Time selection: Already recovered, <24 hours, 24-48 hours, 48-72 hours, >72 hours | Recovery expectation | Recovery pattern factor |
| Injury or pain during exercise | Did this issue begin during exercise or was it pre-existing? | During exercise/Pre-existing | Injury onset | **Clustering**: Different classification based on answer |
| Post-exertional symptoms | Have you noticed a pattern of when these symptoms appear after exercise? | Selection: Immediately, 1-2 hours after, Several hours after, Next day, 2+ days later | Establish delay pattern | **Clustering**: Critical for exercise-symptom relationships |

## 5. Mood & Mindset (Mental & Emotional Wellbeing)

### Morning Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How would you describe your current mood? | Emotion selection: Happy, Calm, Anxious, Stressed, Sad, Irritated, Tired, Motivated, Other | Baseline mood | **Clustering**: Negative emotions may form mood cluster |
| How strongly are you feeling this mood? | Scale 0-10 (0=barely, 10=intensely) | Emotional intensity | **Clustering**: Intensity determines significance |
| Rate your mental clarity this morning | Scale 0-10 (0=very foggy, 10=very clear) | Cognitive baseline | **Clustering**: If <5, tag as cognitive symptom |
| What's something you appreciate today? | Quick text entry or selection from favorites | Morning gratitude practice | Well-being intervention |
| How stressful do you expect today to be? | Scale 0-10 (0=not at all, 10=extremely) | Stress anticipation | **Clustering**: High anticipated stress may trigger symptoms |
| [If stress >6] What factors will contribute to today's stress? | Multi-select: Work/school, Finances, Relationships, Health concerns, Time pressure, Family, Uncertainty | Stress sources | Stressor categorization |
| How motivated do you feel to tackle today's activities? | Scale 0-10 (0=no motivation for tasks, 10=highly motivated/eager) | Motivation/drive baseline | **Clustering**: Low motivation may connect to fatigue/mood clusters |
| How worried or anxious do you feel right now? | Scale 0-10 (0=not worried, 10=extremely worried) | Anxiety baseline | **Clustering**: If >6, tag as anxiety symptom |

### Evening Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| How would you describe your overall mood today? | Emotion selection | Predominant mood | **Clustering**: Track if consistent with morning mood |
| How stable was your mood today? | Scale 0-10 (0=highly variable, 10=very stable) | Mood stability | **Clustering**: Instability may indicate pattern |
| Rate your overall stress level today | Scale 0-10 (0=no stress, 10=extreme stress) | Daily stress level | **Clustering**: If >7, tag as potential symptom trigger |
| [If stress >6] What contributed most to your stress today? | Multi-select from stress sources | Stress contributors | Stressor categorization |
| How would you rate your ability to focus today? | Scale 0-10 (0=couldn't focus, 10=excellent focus) | Focus quality | **Clustering**: If <5, tag as cognitive symptom |
| Rate your mental energy right now | Scale 0-10 (0=mentally exhausted, 10=mentally energetic) | Mental energy state | **Clustering**: If <4, tag as fatigue symptom |
| What went well today? | Quick text entry or selection from favorites | Evening gratitude practice | Well-being intervention |
| How would you rate your social connections today? | Scale 0-10 (0=isolated, 10=well-connected) | Social wellbeing | Social health factor |
| Did you practice any mental wellness activities today? | Multi-select: Meditation, Deep breathing, Journaling, Therapy/counseling, Nature time, Creative expression, Mindfulness, None | Mental wellness practices | **Clustering**: Tag as potential symptom relief methods |
| How worried or anxious do you feel right now? | Scale 0-10 (0=not worried, 10=extremely worried) | Evening anxiety level | **Clustering**: Compare to morning for pattern |
| [If worry >6] What are your primary concerns right now? | Category selection | Worry sources | Worry categorization |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose | Implementation Notes |
|---------|-------------------|---------------|---------|---------------------|
| Negative mood reported | What factors might be contributing to this mood? | Multi-select: Sleep, Nutrition, Physical discomfort, Work stress, Relationship issues, Health concerns, Financial worries, Hormonal, Weather, Lack of exercise | Mood contributors | **Clustering**: Connect moods to potential triggers |
| Focus <5 | What affected your ability to concentrate today? | Multi-select: Fatigue, Distractions, Stress, Physical discomfort, Lack of interest, Hunger, Overstimulation, Technology | Focus disruptors | **Clustering**: Connect cognitive issues to other factors |
| After high-stress events | How are you feeling now after the stressful situation? | Emotion selection | Stress recovery | Stress reaction pattern |
| After high-stress events | What coping strategies did you use? | Multi-select: Deep breathing, Physical activity, Talking with someone, Taking a break, Entertainment/distraction, Nature time, None | Coping methods | **Clustering**: Tag effective strategies per user |
| Anxiety >7 | How is this anxiety affecting you physically? | Multi-select: Tension, Racing heart, Digestive issues, Difficulty breathing, Sleep disruption, Headache, Fatigue | Anxiety manifestations | **Clustering**: Create physical-emotional symptom connections |
| Mental wellness activity completed | How effective was this practice? | Scale 0-10 (0=ineffective, 10=very effective) | Wellness practice efficacy | **Clustering**: Track effectiveness per symptom cluster |
| Multiple negative mood symptoms | Do these mood issues seem related to each other? | Yes/No/Unsure | Establish mood symptom clusters | **Clustering**: Create named mood clusters |
| Consistent mood symptoms | We've noticed this mood pattern before. Is this similar to previous episodes? | Yes, very similar/Somewhat similar/No, this feels different | Pattern recognition | **Clustering**: Connect current to historical patterns |

## 6. Medicine Management (Medications & Treatments)

### Morning Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Did you take your morning medications/supplements? | All/Some/None/Not applicable | Medication adherence | Adherence tracking |
| [If some/all] Select which morning medications/supplements you took | Personalized list with checkboxes | Specific adherence | **Clustering**: Individual medication tracking |
| [If some/none] What prevented you from taking your medications? | Multi-select: Forgot, Ran out, Side effect concerns, Away from home, Change in routine, Intentionally skipped, Other | Adherence barriers | Behavioral factors |
| Do you have any treatments scheduled for today? | Yes/No | Treatment planning | Treatment schedule |
| [If yes] What treatments are scheduled? | Selection from personalized list | Treatment tracking | Treatment monitoring |
| Have you noticed any medication effects (positive or negative) this morning? | Multi-select: Symptom improvement, Side effects, No noticeable effect | Medication effects | **Clustering**: Side effects tagged as medication-related symptoms |

### Evening Check-in Questions

| Question | Answer Format | Purpose | Implementation Notes |
|----------|---------------|---------|---------------------|
| Did you take your evening medications/supplements? | All/Some/None/Not applicable | Evening med adherence | Adherence tracking |
| [If some/all] Select which evening medications/supplements you took | Personalized list with checkboxes | Specific adherence | **Clustering**: Individual medication tracking |
| [If some/none] What prevented you from taking your medications? | Multi-select from barriers list | Adherence barriers | Behavioral factors |
| Di