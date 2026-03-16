# Health Intelligence Tracking App: Complete Question Framework

This document outlines the comprehensive question framework for the Health Intelligence Tracking app, designed to collect data-rich information that enables powerful correlation analysis across seven health domains. Each section is structured to identify potential cause-effect relationships that help users understand how their habits and behaviors affect their wellbeing.

## Quick-Capture Photo Documentation

The app uses photo documentation as the primary method for tracking consumption of food, beverages, and supplements. This provides objective data that can be correlated with various health outcomes.

| Interaction | Capture Method | Purpose |
|-------------|---------------|---------|
| Food/Beverage Consumption | Photo + timestamp | Visual documentation of all intake with exact timing |
| Quick Categorization | Tap selection after photo | Proper classification of consumption type |
| Contextual Questions | Minimal follow-up based on category | Capture subjective experience and context |

### Consumption Photo Documentation

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Photo Documentation | Photo capture interface with timestamp | Visual record of all consumption |
| [After photo] What category does this belong to? | Quick selection: Meal, Snack, Caffeinated drink, Alcoholic drink, Water/non-caffeinated beverage | Categorization for analysis |
| [If meal] How full did you feel after eating? | Scale selection: 1 (Still hungry), 2 (Satisfied but could eat more), 3 (Comfortably full), 4 (Very full), 5 (Uncomfortably full) | Satiety level tracking |
| [If caffeinated] Did you feel any immediate effects? | Multi-select: Energy boost, Jitters/anxiety, Improved focus, Digestive effects, Headache, No noticeable effects | Immediate caffeine response |
| [If alcoholic] Did you feel any immediate effects? | Multi-select: Relaxation, Mood change, Sleepiness, Increased energy, Digestive discomfort, No noticeable effects | Immediate alcohol response |
| [If alcoholic] Did you consume this with food? | Yes/No | Food co-consumption |
| [If alcoholic] How hydrated were you while drinking? | Selection: Alternated with water, Had some water, No additional water | Hydration with alcohol |

## 1. Vital Rhythms (Sleep & Energy)

### Morning Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How many hours did you sleep last night? | Numeric entry (hours and minutes) | Track sleep duration for correlation with energy, mood, and cognitive function |
| Rate your overall sleep quality | Scale 0-10 (0=terrible, 10=excellent) | Assess subjective sleep quality for correlation with various health factors |
| How many times did you wake during the night? | Numeric entry (0, 1, 2, 3, 4+) | Measure sleep continuity for deeper sleep quality analysis |
| **Did you struggle going back to sleep?** | **Yes/No** | **Assess sleep maintenance difficulty** |
| What time did you go to bed last night? | Time selection | Track sleep timing patterns for circadian rhythm analysis |
| What time did you wake up today? | Time selection | Track wake timing for circadian rhythm analysis |
| How refreshed do you feel this morning? | Scale 0-10 (0=exhausted, 10=fully refreshed) | Assess sleep restorative quality |
| Rate your energy level right now | Scale 0-10 (0=no energy, 10=highly energetic) | Baseline morning energy metric |
| Select your predominant morning mood | Multi-select: Calm, Content, Anxious, Irritable, Sad, Motivated, Foggy, Energetic | Track mood-sleep relationship |

### Evening Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How did your energy fluctuate today? | Pattern selection: Steady, Morning peak/afternoon dip, Multiple crashes, Steady decline, Second wind in evening | Identify energy pattern types |
| When was your energy highest today? | Time selection | Track optimal energy timing |
| When was your energy lowest today? | Time selection | Identify energy dips for correlation |
| Rate your fatigue level right now | Scale 0-10 (0=not fatigued, 10=extremely fatigued) | Evening fatigue assessment |
| Rate your sleep environment quality for tonight | Scale 0-10 (0=poor, 10=excellent) | Track sleep environment impact |
| How effective was your pre-sleep routine tonight? | Scale 0-10 (0=ineffective, 10=very effective) | Assess pre-sleep routine impact |
| Did you use any screens within an hour of bedtime? | Yes/No | Track blue light exposure |
| Did you consume caffeine today? | No/Yes - with time of last consumption | Track caffeine impact on sleep |
| Did you consume alcohol today? | No/Yes - with number of drinks and time of last consumption | Track alcohol impact on sleep |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| Sleep quality <5 | What factors disrupted your sleep? | Multi-select: Noise, Temperature, Pain/discomfort, Anxiety/thoughts, Bathroom visits, Partner/pet, Caffeine/alcohol, Other | Identify sleep disruptors |
| Wake state <5 | What symptoms are you experiencing this morning? | Multi-select: Grogginess, Headache, Body stiffness, Mental fog, Fatigue despite sleep, Anxiety | Identify poor sleep outcomes |
| Sleep duration <6 hours | What prevented you from getting more sleep? | Multi-select: Work/obligations, Chose to stay up, Couldn't fall asleep, Woke up and couldn't return to sleep, Disturbances | Identify sleep barriers |
| Did you struggle going back to sleep? = Yes | How long did it typically take to fall back asleep? | Selection: <5 min, 5-15 min, 15-30 min, 30-60 min, >60 min | Assess severity of sleep maintenance issues |

## 2. Body Signals (Physical Symptoms)

### Morning Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Are you experiencing any pain this morning? | Yes/No | Pain presence baseline |
| [If yes] Rate your pain level | Scale 0-10 (0=none, 10=severe) | Pain intensity metric |
| [If yes] Select the location(s) of your pain | Dropdown multi-select: Head, Neck, Shoulders, Upper back, Lower back, Chest, Abdomen, Pelvis, Hips, Arms, Elbows, Wrists, Hands, Legs, Knees, Ankles, Feet, Joints (general), Muscles (general), Other (with text field) | Pain location tracking |
| [If yes] How would you describe this pain? | Multi-select: Sharp, Dull, Throbbing, Burning, Stabbing, Aching, Cramping, Tender | Pain quality analysis |
| [If yes] When did this pain begin? | Time selection: Just now, Overnight, Yesterday, Several days ago, Chronic | Pain onset tracking |
| Rate your overall physical comfort right now | Scale 0-10 (0=very uncomfortable, 10=very comfortable) | General physical wellbeing |
| Are you experiencing any of these symptoms? | Multi-select from common symptoms: Headache, Dizziness, Nausea, Fatigue, Shortness of breath, Digestive discomfort, Joint/muscle pain, Congestion, Sore throat, Skin issues | Symptom baseline tracking |
| How is your overall physical energy level? | Scale 0-10 (0=depleted, 10=energetic) | Physical energy baseline |

### Evening Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How did your pain/discomfort change throughout the day? | Pattern selection: Improved, Worsened, Fluctuated, Stayed the same, Disappeared | Pain pattern tracking |
| Did you develop any new symptoms today? | Multi-select from symptom list + None | New symptom tracking |
| [If new symptoms] When did these symptoms first appear? | Time selection | Symptom onset timing |
| How did your symptom intensity change today? | Pattern selection: Improved, Worsened, Fluctuated, Stayed the same | Symptom progression |
| Did you feel unusually hot or cold today? | Scale: Much colder than normal - Much hotter than normal | Temperature regulation |
| Rate your overall physical comfort right now | Scale 0-10 (0=very uncomfortable, 10=very comfortable) | Evening physical state |
| Any unusual physical sensations today? | Multi-select: Tingling, Numbness, Weakness, Tremors, Palpitations, Vision changes, Hearing changes, Balance issues, None | Neurological/cardiac tracking |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| New symptom selected | When did this symptom first appear? | Time selection | Symptom onset timing |
| Symptom intensity >7 | What makes this symptom better or worse? | Multi-select: Movement, Position change, Rest, Heat/cold, Food/drink, Medications, Stress, Time of day | Identify modulators |
| Pain location is consistent with previous entry | What have you tried to relieve this pain? | Multi-select: Rest, Heat, Cold, OTC medication, Prescription medication, Massage, Stretching, Position change, Nothing yet | Track interventions |
| Headache reported | What type of headache? | Multi-select: Tension, Migraine, Sinus, Cluster, Unknown | Headache classification |
| Digestive symptoms reported | Where is your digestive discomfort? | Dropdown selection: Upper abdomen (center), Upper abdomen (right), Upper abdomen (left), Middle abdomen (center), Middle abdomen (right), Middle abdomen (left), Lower abdomen (center), Lower abdomen (right), Lower abdomen (left), General/diffuse, Other (with text field) | Locate digestive issues |

## 3. Fuel & Flow (Nutrition & Digestion)

### Morning Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Rate your hunger level this morning | Scale 0-10 (0=not hungry, 10=extremely hungry) | Morning hunger baseline |
| Rate your digestive comfort right now | Scale 0-10 (0=significant discomfort, 10=perfect comfort) | Morning digestive baseline |
| How hydrated do you feel? | Scale 0-10 (0=very dehydrated, 10=optimally hydrated) | Morning hydration status |
| What did you eat for breakfast? | Category multi-select: Fruits, Vegetables, Grains/bread, Protein (meat/plant), Dairy, Processed foods, Sweets, Coffee/tea, None | Breakfast composition |
| [If ate breakfast] How full did you feel after eating? | Scale selection: 1 (Still hungry), 2 (Satisfied but could eat more), 3 (Comfortably full), 4 (Very full), 5 (Uncomfortably full) | Satiety level tracking |
| [If applicable] Did you experience any digestive symptoms after eating? | Multi-select: Bloating, Gas, Acid reflux, Nausea, Abdominal pain, None | Post-meal symptoms |

### Evening Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Approximately how much water did you drink today? | Volume selection: <2 cups, 2-4 cups, 4-6 cups, 6-8 cups, >8 cups | Daily hydration tracking |
| How many meals did you eat today? | Numeric selection (0-6+) | Meal frequency |
| Select the times when you ate today | Time multi-select | Meal timing patterns |
| Which food groups did you consume today? | Category percentage slider: Vegetables, Fruits, Grains/starches, Proteins, Dairy/alternatives, Processed foods, Sweets | Dietary composition |
| Did you experience any digestive discomfort today? | Multi-select: Acid reflux, Bloating, Gas, Abdominal pain, Nausea, Constipation, Diarrhea, None | Digestive symptom tracking |
| [If yes to symptoms] When did these symptoms occur? | Selection: Before meals, During meals, 0-30 min after eating, 1-2 hours after eating, 2+ hours after, Random times | Symptom timing |
| How would you describe your hunger pattern today? | Pattern selection: Steady hunger at mealtimes, Constant hunger, Minimal hunger, Extreme hunger, Fluctuating | Hunger pattern tracking |

### Bowel Movement Tracking Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How many bowel movements have you had in the past 24 hours? | Numeric selection: 0, 1, 2, 3, 4+ | BM frequency tracking |
| [If >0] Select the consistency of your most recent bowel movement | Bristol Stool Scale visualization, types 1-7 | Stool consistency tracking |
| [If >0] How would you rate the ease of your recent bowel movement? | Scale 0-10 (0=difficult, 10=easy) | BM ease assessment |
| [If >0] Did you feel completely emptied after your bowel movement? | Yes/Somewhat/No | BM completeness |
| [If >0] Select the color that best matches your stool | Visual color selection: Brown shades, Black, Gray/clay, Green, Yellow, Red-streaked | Stool color tracking |
| [If >0] Did you notice any of the following in your stool? | Multi-select: Undigested food, Mucus, Blood, Unusual color, Floating/difficult to flush, Greasy appearance, None of these | Stool abnormalities |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| Digestive symptoms selected | What foods preceded this discomfort? | Free text with suggestions | Food-symptom correlation |
| Hydration <5 | What factors limited your fluid intake today? | Multi-select: Forgot, Busy, Limited access, Not thirsty, Dislike water, Substituted other drinks | Hydration barriers |
| After large meals | How did you feel 1-2 hours after this meal? | Multi-select: Energized, Tired/sluggish, Bloated, Satisfied, Hungry again, Digestive discomfort | Post-meal effects |
| Blood in stool reported | What color was the blood? | Bright red, Dark red, Black | GI bleeding location indicator |
| Constipation or diarrhea reported | How long has this been occurring? | Selection: Just today, 2-3 days, 4-7 days, >1 week | Chronicity assessment |
| Abnormal stool color (not brown) | Have you consumed anything that might affect stool color? | Multi-select: Beets, Iron supplements, Medications, Artificial colors, Leafy greens, None of these | Non-pathological causes |

## 4. Movement Matrix (Exercise, Activity & Recovery)

### Morning Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How physically capable do you feel this morning? | Scale 0-10 (0=incapable, 10=highly capable) | Physical readiness metric |
| Rate any muscle soreness or stiffness | Scale 0-10 (0=none, 10=severe) | Baseline soreness tracking |
| [If soreness >3] Select areas experiencing soreness | Dropdown multi-select: Neck, Shoulders, Arms, Chest, Back (upper), Back (lower), Abdomen, Glutes, Thighs (front), Thighs (back), Calves, Feet, Other (with text field) | Soreness location tracking |
| How recovered does your body feel today? | Scale 0-10 (0=not recovered, 10=fully recovered) | Recovery status |
| Which body areas need recovery attention today? | Dropdown multi-select: Full body, Neck, Shoulders, Arms, Back, Core, Hips, Legs, Feet, Joints (general), Muscles (general), Mental/cognitive, None, Other (with text field) | Recovery focus areas |

### Evening Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Did you exercise or do intentional physical activity today? | Yes/No | Activity completion |
| [If yes] What type of exercise did you complete? | Category selection | Exercise type tracking |
| [If yes] Duration of activity | Time selection: <15 min, 15-30 min, 30-45 min, 45-60 min, 60-90 min, >90 min | Exercise duration |
| [If yes] Rate the intensity of your workout | Scale 0-10 (0=very light, 10=maximum effort) | Exercise intensity |
| [If yes] How did you feel during the workout? | Multi-select: Energized, Challenged but managing, Struggling, Pain/discomfort, Enjoying it, Mentally focused, Mentally distracted | Exercise experience |
| [If yes] How do you feel after exercising? | Multi-select: Accomplished, Tired, Energized, Sore, Pain, Mental clarity, Mood boost | Post-exercise state |
| Estimate your total active minutes today (beyond exercise) | Time selection | Daily movement metric |
| Approximately how many steps or miles did you move today? | Numeric entry | Activity volume |
| Did you use any recovery practices today? | Multi-select: Extra sleep/nap, Gentle movement/stretching, Hot/cold therapy, Self-massage/foam rolling, Complete rest, Relaxation techniques, None | Recovery practices |
| [If recovery activities] How effective were these recovery methods? | Scale 0-10 (0=ineffective, 10=very effective) | Recovery effectiveness |
| Based on your current state, what's most important for tomorrow? | Selection: More activity, More recovery, Balanced approach | Recovery-activity planning |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| Post-exercise (1 hour after) | Rate your recovery 1 hour after exercise | Scale 0-10 (0=not recovered, 10=fully recovered) | Short-term recovery |
| Post-exercise (1 hour after) | Are you experiencing any post-exercise symptoms? | Multi-select: Excessive fatigue, Dizziness, Nausea, Muscle trembling, Pain (beyond normal soreness), Headache, None | Exercise tolerance |
| Planned but not completed exercise | What prevented your planned exercise? | Multi-select: Energy too low, Time constraints, Pain/injury, Motivation lacking, Unexpected events, Weather, Changed my mind | Exercise barriers |
| Muscle soreness reported | Is this soreness from a recent workout or new/concerning? | Selection: Expected from workout, Unexpected/concerning | Soreness classification |
| High-intensity workout completed | How long do you expect to need for full recovery? | Time selection: Already recovered, <24 hours, 24-48 hours, 48-72 hours, >72 hours | Recovery expectation |
| Injury or pain during exercise | Did this issue begin during exercise or was it pre-existing? | During exercise/Pre-existing | Injury onset |

## 5. Mind Monitor (Mental & Emotional Wellbeing)

### Morning Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How would you describe your current mood? | Emotion selection: Happy, Calm, Anxious, Stressed, Sad, Irritated, Tired, Motivated, Other | Baseline mood |
| How strongly are you feeling this mood? | Scale 0-10 (0=barely, 10=intensely) | Emotional intensity |
| Rate your mental clarity this morning | Scale 0-10 (0=very foggy, 10=very clear) | Cognitive baseline |
| What's something you appreciate today? | Quick text entry or selection from favorites | Morning gratitude practice |
| How stressful do you expect today to be? | Scale 0-10 (0=not at all, 10=extremely) | Stress anticipation |
| [If stress >6] What factors will contribute to today's stress? | Multi-select: Work/school, Finances, Relationships, Health concerns, Time pressure, Family, Uncertainty | Stress sources |
| How motivated do you feel to tackle today's activities? | Scale 0-10 (0=no motivation for tasks, 10=highly motivated/eager) | Motivation/drive baseline |
| How worried or anxious do you feel right now? | Scale 0-10 (0=not worried, 10=extremely worried) | Anxiety baseline |

### Evening Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| How would you describe your overall mood today? | Emotion selection | Predominant mood |
| How stable was your mood today? | Scale 0-10 (0=highly variable, 10=very stable) | Mood stability |
| Rate your overall stress level today | Scale 0-10 (0=no stress, 10=extreme stress) | Daily stress level |
| [If stress >6] What contributed most to your stress today? | Multi-select from stress sources | Stress contributors |
| How would you rate your ability to focus today? | Scale 0-10 (0=couldn't focus, 10=excellent focus) | Focus quality |
| Rate your mental energy right now | Scale 0-10 (0=mentally exhausted, 10=mentally energetic) | Mental energy state |
| What went well today? | Quick text entry or selection from favorites | Evening gratitude practice |
| How would you rate your social connections today? | Scale 0-10 (0=isolated, 10=well-connected) | Social wellbeing |
| Did you practice any mental wellness activities today? | Multi-select: Meditation, Deep breathing, Journaling, Therapy/counseling, Nature time, Creative expression, Mindfulness, None | Mental wellness practices |
| How worried or anxious do you feel right now? | Scale 0-10 (0=not worried, 10=extremely worried) | Evening anxiety level |
| [If worry >6] What are your primary concerns right now? | Category selection | Worry sources |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| Negative mood reported | What factors might be contributing to this mood? | Multi-select: Sleep, Nutrition, Physical discomfort, Work stress, Relationship issues, Health concerns, Financial worries, Hormonal, Weather, Lack of exercise | Mood contributors |
| Focus <5 | What affected your ability to concentrate today? | Multi-select: Fatigue, Distractions, Stress, Physical discomfort, Lack of interest, Hunger, Overstimulation, Technology | Focus disruptors |
| After high-stress events | How are you feeling now after the stressful situation? | Emotion selection | Stress recovery |
| After high-stress events | What coping strategies did you use? | Multi-select: Deep breathing, Physical activity, Talking with someone, Taking a break, Entertainment/distraction, Nature time, None | Coping methods |
| Anxiety >7 | How is this anxiety affecting you physically? | Multi-select: Tension, Racing heart, Digestive issues, Difficulty breathing, Sleep disruption, Headache, Fatigue | Anxiety manifestations |
| Mental wellness activity completed | How effective was this practice? | Scale 0-10 (0=ineffective, 10=very effective) | Wellness practice efficacy |

## 6. Care Compass (Medications & Treatments)

### Morning Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Did you take your morning medications/supplements? | All/Some/None/Not applicable | Medication adherence |
| [If some/all] Select which morning medications/supplements you took | Personalized list with checkboxes | Specific adherence |
| [If some/none] What prevented you from taking your medications? | Multi-select: Forgot, Ran out, Side effect concerns, Away from home, Change in routine, Intentionally skipped, Other | Adherence barriers |
| Do you have any treatments scheduled for today? | Yes/No | Treatment planning |
| [If yes] What treatments are scheduled? | Selection from personalized list | Treatment tracking |
| Have you noticed any medication effects (positive or negative) this morning? | Multi-select: Symptom improvement, Side effects, No noticeable effect | Medication effects |

### Evening Check-in Questions

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Did you take your evening medications/supplements? | All/Some/None/Not applicable | Evening med adherence |
| [If some/all] Select which evening medications/supplements you took | Personalized list with checkboxes | Specific adherence |
| [If some/none] What prevented you from taking your medications? | Multi-select from barriers list | Adherence barriers |
| Did you complete all scheduled treatments today? | All/Some/None | Treatment completion |
| Were any new medications or treatments prescribed today? | Yes/No | New prescription tracking |
| [If yes] What new treatments were prescribed? | Free text with type selection | New treatment details |
| Have you noticed any effects from your medications today? | Multi-select: Symptom improvement, Side effects (specify), No noticeable effect, Interaction with food, Timing-related effects, Unexpected effects | Medication effects |

### Conditional Follow-up Questions

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| New medication started | Have you experienced any new symptoms since starting this medication? | Multi-select symptom list | Side effect tracking |
| After treatment | How do you feel after today's treatment? | Multi-select: Pain relief, Symptom improvement, Pain increase, Symptom worsening, Relaxation, Energy increase, Fatigue, No change | Treatment effects |
| Side effects reported | Rate the intensity of these side effects | Scale 0-10 (0=mild, 10=severe) | Side effect severity |
| Missed dose reported | When do you plan to take the missed medication? | Time selection or Not planning to take | Missed dose plan |
| Effectiveness feedback | For [medication name], how would you rate its effectiveness? | Scale 0-10 (0=ineffective, 10=very effective) | Medication efficacy |
| Side effects reported | Are the benefits worth the side effects? | Scale 0-10 (0=not worth it, 10=definitely worth it) | Benefit-side effect ratio |

## 7. Menstrual Mapping (Hormonal Patterns)

### Daily Tracking (Adaptive Based on Phase)

| Question | Answer Format | Purpose | When Shown |
|----------|---------------|---------|------------|
| Menstrual Status | Quick selection: Active period, Between periods, Irregular cycles, Perimenopause, Menopause, Hormonal birth control | Primary status tracking | Always |
| Cycle Dates | Date fields: Last day of previous period, First day of current period | Cycle pattern tracking | Initial setup + updates |
| Flow Today | Quick selection: None, Spotting, Light, Moderate, Heavy, Very Heavy | Daily flow tracking | During active periods |
| Key Symptoms Today | Multi-select: None, Cramps, Breast tenderness, Bloating, Headache, Mood changes, Fatigue, Hot flashes, Night sweats, Spotting | High-impact symptom tracking | Always |
| Symptom Intensity | Scale 0-10 (shown only for selected symptoms) | Severity assessment | When symptoms selected |
| Notable Observations | Multi-select: Large clots, Unusual color, Significant pain, Period ended today, Positive ovulation test, Cervical changes, Midcycle pain | Event tracking | Context-dependent |

### Perimenopause/Menopause Focus (Based on Status)

| Question | Answer Format | Purpose |
|----------|---------------|---------|
| Hot Flash Frequency | Quick selection: None, 1-2 per day, 3-5 per day, 6+ per day | Key symptom tracking |
| Most Challenging Symptoms | Multi-select: Hot flashes, Night sweats, Sleep issues, Mood changes, Memory changes, Physical discomfort | Priority intervention areas |
| Management Methods | Multi-select: Medication, Supplements, Lifestyle changes, Heat/cold management, Stress reduction | Effectiveness tracking |

### High-Impact Follow-ups (Triggered by Specific Responses)

| Trigger | Follow-up Question | Answer Format | Purpose |
|---------|-------------------|---------------|---------|
| Significant pain (7+) | "What helps relieve this pain?" | Multi-select: Rest, Heat, Medication, Movement, Nothing helps | Intervention effectiveness |
| Hot flashes | "What seems to trigger them?" | Multi-select: Stress, Heat, Food/drink, Activity, Sleep disruption, Unknown | Pattern identification |
| Mood changes | "How are they affecting your daily life?" | Scale 0-10 (0=minimal impact, 10=significant impact) | Functional impact |