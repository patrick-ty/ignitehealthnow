# IgniteHealthNow — Product Requirements Document

**Version:** 1.0
**Date:** March 12, 2026
**Status:** Draft
**Companion to:** *The Hypothyroidism Cheat Code*

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [User Personas](#2-user-personas)
3. [Product Principles](#3-product-principles)
3A. [Capture Architecture & Friction Reduction](#3a-capture-architecture--friction-reduction)
4. [Capture Layer — Daily Journal](#4-capture-layer--daily-journal)
5. [Capture Layer — Photo Food Journal](#5-capture-layer--photo-food-journal)
6. [Capture Layer — Lab Results](#6-capture-layer--lab-results)
7. [Capture Layer — Menstrual & Estrogen Dominance Tracking](#7-capture-layer--menstrual--estrogen-dominance-tracking)
8. [Intelligence Layer — Pattern Detection & Agentic Workflows](#8-intelligence-layer--pattern-detection--agentic-workflows)
9. [Doctor Visit Preparation & Reports](#9-doctor-visit-preparation--reports)
10. [Chat Agent — Patient Advocacy Companion](#10-chat-agent--patient-advocacy-companion)
11. [Provider Portal](#11-provider-portal)
12. [Research & Analytics Layer](#12-research--analytics-layer)
13. [Data Model](#13-data-model)
14. [Technical Architecture](#14-technical-architecture)
15. [UX Flow — Daily Journal Entry](#15-ux-flow--daily-journal-entry)
16. [Dashboards & Visualization](#16-dashboards--visualization)
17. [Revenue Model & Ecosystem Integration](#17-revenue-model--ecosystem-integration)
18. [Implementation Phases](#18-implementation-phases)
19. [Appendix: Prior Art Reference](#19-appendix-prior-art-reference)

---

## 1. Vision & Mission

### Vision
IgniteHealthNow is the personal health intelligence system that reveals what standard medicine misses. It transforms daily journaling into a metabolic detective's toolkit — connecting symptoms, labs, lifestyle, and hormonal patterns into a unified picture of cellular hypothyroidism that gives patients the data to advocate for themselves.

### Mission
Help people with hypothyroidism — especially those experiencing "normal labs, terrible symptoms" — build a personal dataset that reveals patterns their doctors cannot see in a 15-minute appointment. Every feature serves one question: **"What is actually driving how I feel today, and what's changing over time?"**

### Why This Product Exists
Standard thyroid care fails a massive population:
- TSH is treated as the sole marker of thyroid function, missing cellular-level dysfunction
- Symptoms are dismissed when labs fall within "normal" ranges — but conventional "normal" is merely a statistical distribution of where most people's labs happen to land, regardless of how those people actually feel. Functional optimal ranges are fundamentally different: they represent the ranges where, on aggregate, most people feel well — as observed and refined over years of clinical practice by functional medicine doctors. IgniteHealthNow uses functional optimal ranges as the primary standard, not population-averaged "normal"
- The interconnected metabolic systems that destabilize thyroid function (insulin resistance, iron dysregulation, homocysteine elevation, liver dysfunction) are never evaluated together
- Hormonal patterns that directly suppress thyroid function are ignored entirely. In women, estrogen dominance raises TBG and reduces free hormone availability — and this is almost never evaluated alongside thyroid labs. In men, excess estrogen drives testosterone deficiency, creating its own cascade of fatigue, brain fog, and metabolic dysfunction that overlaps with and worsens hypothyroid symptoms. Both sexes can have hormonal imbalances that destabilize thyroid function, yet conventional care rarely connects the two
- Patients lack the longitudinal data to prove what they're experiencing is real, patterned, and clinically significant

But beyond the medical system's failures, there is a human memory problem: **people forget.** They forget what they ate, how they felt, and what they looked like. They can't tell their doctor with certainty whether Tuesday's exhaustion was worse than last month's, or whether the brain fog started before or after they ran out of selenium. Without a personal record, cause and effect is invisible — did that dietary change help? Did the new supplement timing matter? Was last week actually better, or does it just feel that way?

This matters for two reasons. First, a patient who does not understand the rhythms of their own body cannot advocate accurately for their needs. They walk into appointments without evidence, describe symptoms from unreliable memory, and end up putting their health decisions entirely in the hands of providers who have 15 minutes and a TSH result. Second — and more fundamentally — the goal is not just better doctor visits. It is to help patients learn how to *hear* the rhythms of their body. When a person can look at their data and see that their brain fog spikes two days after eating gluten, or that their energy crashes every luteal phase, or that their hair shedding worsened exactly when they stopped selenium — they start to understand cause and effect in their own body. They feel empowered when their body tells them something, because they've learned to listen. They make better choices — about food, supplements, stress, sleep, medication timing — not because a doctor told them to, but because they can see the impact for themselves. IgniteHealthNow exists to create that clarity. For some, it will mean healing. For others, it will mean better management of a chronic condition. For all, it means taking their health out of the dark and into their own hands — with visual proof, hard data, and the confidence to say: "Here is what is happening in my body, here is the pattern, and here is what I need."

IgniteHealthNow is the companion to *The Hypothyroidism Cheat Code*, extending the book's framework into a living, evolving personal health record that empowers patients with undeniable data.

---

## 2. User Personas

### Primary: "The Dismissed Patient" — Sarah
**Demographics:** Woman, 28-55, diagnosed hypothyroid (or suspects it), on levothyroxine or similar
**Situation:** TSH is "normal" but she feels terrible. The full picture of what she's living with: exhaustion that sleep doesn't fix — she wakes up feeling like she never went to bed. Brain fog so thick she can't find words mid-sentence. Hair falling out in clumps in the shower. Weight gain despite eating clean and exercising — or weight she simply cannot lose no matter what she tries. Bloating that makes her look pregnant by evening. Hands and feet so cold they ache, even indoors. Joint pain and stiffness that makes her feel decades older than she is. Muscle aches that come and go without explanation. Constipation. Dry, cracking skin. Brittle nails. A face that looks puffy and swollen. Depression and anxiety that appeared out of nowhere. And through all of this, her doctor looks at her TSH and says she's fine. She's read the book and understands the cellular hypothyroidism framework but needs a way to prove what she's experiencing is real.
**Goals:**
- Build a data record that shows her symptoms are real, patterned, and connected — not "all in her head"
- Understand which of the Four Legs is destabilizing her thyroid function
- Bring a doctor-ready report that speaks in clinical language
- Stop feeling gaslit by her own healthcare team
- See cause and effect in her own body — what makes it better, what makes it worse

**Key needs:** Fast daily journaling, lab tracking with functional optimal ranges, doctor visit reports, pattern recognition that connects the dots she senses but can't prove

### Secondary: "The Self-Advocate" — Maria
**Demographics:** Woman, 30-50, Hashimoto's diagnosis, highly engaged in her own care
**Situation:** She's already tracking some things in spreadsheets or other apps but nothing connects the metabolic relationships. She knows her symptoms are real — the crushing fatigue, the weight that won't budge, the joint pain that flares unpredictably, the brain fog that costs her productivity, the sleep that never refreshes, the cold hands even in summer. She understands estrogen dominance is worsening her thyroid function but has no way to show her doctor the cycle-phase correlation. She's noticed her bloating and joint pain worsen in her luteal phase but can't prove it. She's read the book cover to cover and wants the full intelligence layer.
**Goals:**
- Map her menstrual cycle against thyroid symptom severity
- Track the estrogen dominance → TBG → free hormone suppression pathway
- Identify which vicious cycles are active in her body
- Optimize her supplement and medication timing based on data
- Prove the cycle-phase patterns she suspects but can't demonstrate

**Key needs:** Estrogen dominance tracking, cycle-phase symptom overlay, vicious cycle alerts, conversion efficiency trending, medication timing correlation

### Tertiary: "The Newly Suspicious" — Jen
**Demographics:** Woman, 25-45, undiagnosed, experiencing mystery symptoms
**Situation:** She doesn't have a diagnosis but something is clearly wrong. It started with fatigue — not normal tiredness, but a bone-deep exhaustion that doesn't respond to rest. Then the brain fog, the cold hands and feet, the hair shedding. She's gaining weight without changing anything. Her joints ache. She's bloated constantly. Her sleep is broken or unrefreshing. Her skin is dry. She's anxious and can't explain why. Her doctor ran basic bloodwork and said everything looks fine. She found the book and it described her life — every symptom, every frustration, every dismissed complaint. She needs to build a case for getting proper testing.
**Goals:**
- Document her symptom patterns to bring to a doctor
- Understand which labs to request and why
- Learn whether her symptoms fit the hypothyroid/Hashimoto's pattern
- Get taken seriously when she asks for help
- Start understanding her own body before she even has a diagnosis

**Key needs:** Symptom journaling, educational micro-content, "labs to request" guidance, doctor visit preparation

### "The Effortless Wreck" — Julie
**Demographics:** Woman, 18-25, college student or recently graduated, no diagnosis, no awareness that anything is metabolically wrong
**Situation:** Julie is 21 and doing everything a 21-year-old is supposed to do — classes, social life, staying out late, drinking on weekends, keeping up appearances. She looks like she has it together. She is trying to manage it all and look effortless doing it. Nobody sees what's underneath.

In her mind, everyone else makes it look so easy. Everyone else looks like they have their shit together — the girls in her classes, on her feed, at the bar. She compares herself constantly to standards that are unfair and unrealistic, but they feel like the baseline she's failing to meet. The pressure to keep up and look good while doing it is relentless, and it shapes every decision she makes — what she eats, how she exercises, how she presents herself, what she hides.

She is stressed constantly — school, social pressure, money, figuring out what she's doing with her life — but she would never frame it that way because everyone around her is stressed too. It's just the baseline. She sleeps 5-6 hours most nights, sometimes less. She runs on coffee and adrenaline. She drinks 3-4 nights a week because that's what her social life looks like. She's not thinking about nutrition — she eats what's convenient, skips meals when she's busy, and when she does think about food, it's about staying thin, not about what her body actually needs. She might restrict during the week and binge on the weekend. She might live on energy drinks and salads with no protein. She doesn't think of any of this as a problem because everyone she knows lives the same way.

But she is not getting nearly enough nutrition — and girls her age especially need more, not less, to support healthy menstruation, hormone development, bone density, and the metabolic foundation they'll rely on for the rest of their lives. She doesn't know this. Nobody has told her. The culture around her rewards thinness and restriction, not nourishment.

Her body is keeping score. Her hair is thinning and she doesn't understand why — she blames heat styling, tries new products, but the shedding continues. Her skin is breaking out in ways it didn't in high school, and no skincare routine fixes it because the problem isn't her skin — it's what's happening underneath it. These are the things that stress her out the most: how she looks. The bloating that makes her avoid certain outfits. The puffiness in her face. The breakouts she can't control. She doesn't connect any of it to what she's eating, how she's sleeping, or what her body is missing. She just sees a version of herself that doesn't match the effortless image she's trying to project.

Her periods are irregular or heavier than they used to be, but she figures that's just stress. She's bloated more often than not and it's getting worse. Brain fog is creeping in — she can't concentrate the way she used to, loses her train of thought mid-sentence, re-reads paragraphs three times. She has anxiety she didn't have in high school. She chalks all of it up to being busy, being young, being normal. She continues on her way of life because she doesn't know there's a reason to stop.

And as this continues, it's not just her body that's changing — it's her. Her self-confidence is taking a hit she can't explain. The rumination is out of control — thoughts that loop and loop, replaying conversations, mistakes, perceived failures. Her memory has become selective in the worst way: it brings up the bad and buries the good. She can recall every awkward moment, every perceived slight, every time she felt like she wasn't enough — but she can't remember the last time she felt genuinely good about herself.

She just wants to feel in control. But she feels more and more out of control — of her body, her emotions, her thoughts, her life. Without knowing it, she has started people-pleasing as a survival strategy — saying yes to everything, reshaping herself to stay accepted and liked, abandoning her own opinions and preferences to avoid conflict or rejection. She is losing the essence of who she is and she doesn't realize it. The girl who had strong opinions in high school, who was funny and sharp and sure of herself — she's fading, replaced by someone who scans every room for what's expected of her.

She is increasingly irritable — snapping at her roommate, her parents, her friends — and then hating herself for it. She's more judgmental than she used to be, critical of others in ways that are really projections of how critical she is of herself. She's less patient. Less kind. Less present. And none of this feels like her, but she doesn't know how to get back to who she was, because she can't pinpoint when she lost herself.

She doesn't understand that imbalance is brewing under the surface — and that the personality changes, the rumination, the loss of self, the irritability are not character flaws. They are symptoms.

What she doesn't know: she is systematically depleting every system that her thyroid depends on. The chronic sleep deprivation raises cortisol, which promotes insulin resistance. The alcohol stresses her liver — the organ responsible for clearing estrogen and converting T4 to T3. The nutritional gaps (she's almost certainly deficient in iron, B12, selenium, zinc, and vitamin D) mean her body lacks the raw materials for thyroid hormone production, hormone balance, and healthy menstruation. The caloric restriction and skipped meals signal metabolic scarcity, slowing her thyroid function as a survival response. The stress she normalizes is dysregulating her HPA axis. The hair thinning and breakouts aren't cosmetic problems — they're visible signs of iron depletion, hormonal imbalance, and nutrient deficiency that are going unaddressed. She may not have a thyroid problem *yet* — but she is building one, brick by brick, and by the time symptoms become undeniable in her late 20s or 30s, the foundation will have been eroding for a decade.

She is the patient who could intervene early — if anyone showed her what her habits are actually doing to her body. Not with a lecture, not with shame, not by telling her she's doing it wrong — but by letting her own data show her what's happening. The hair thinning has a reason. The breakouts have a reason. The bloating has a reason. The brain fog has a reason. They're all connected, and they're all preventable — if she can see it.

**Goals:**
- Honestly? She doesn't have health goals yet — she'd download the app because a friend recommended it or because she saw it on social media and was curious
- Find out why her hair is thinning and her skin is breaking out — the things she actually cares about right now
- Discover that the fatigue, brain fog, bloating, irregular periods, breakouts, anxiety, irritability, and rumination she's been normalizing might actually be connected — and might actually be preventable
- See the real impact of her sleep, alcohol, and eating patterns on how she feels and looks day-to-day — not in a preachy way, but in a "huh, I actually do feel worse and look worse after these specific patterns" way
- Learn that nutrition isn't about being thin — it's about giving her body what it needs to function, and that undereating is harming her more than she knows
- Understand that the personality changes — the irritability, the people-pleasing, the loss of confidence, the rumination — are not who she is becoming. They are symptoms of something that can be addressed.
- Feel like herself again
- Learn what labs to ask for before she's spent a decade being told she's fine
- Start building body literacy at an age when it can change the trajectory of her health for decades

**Key needs:** An interface that doesn't feel clinical or like a "sick person's app" — something she'd actually use alongside her other wellness/lifestyle apps. Non-judgmental pattern surfacing that shows cause and effect without lecturing — especially connecting the things she cares about (skin, hair, how she looks, how she feels about herself) to the habits she doesn't realize are causing them. Mood and rumination tracking that gently reveals the connection between what she's eating (or not eating), how she's sleeping, and the anxiety/irritability/self-criticism spiral. Social-media-friendly insights she might actually share. Educational content that meets her where she is — not assuming she knows what a thyroid is, but not condescending either. Ultra-low friction because she will abandon anything that takes effort. Bloating and body image tracking that validates her frustration without reinforcing the restriction mindset. Content that names what's happening to her personality — the rumination, the people-pleasing, the loss of self — as physiological, not personal failure.

### "The Invisible Burnout" — Dana
**Demographics:** Woman, 38-52, stay-at-home parent, midlife, no formal diagnosis (or underdiagnosed)
**Situation:** Dana doesn't have a high-powered career, but she is never not working. She runs the household — the meals, the schedules, the emotional labor, the logistics of everyone else's life. She is the person who holds it all together, and no one notices because it looks like "not working." She is exhausted in a way that feels permanent, not situational. She does what she needs to do for her family every day, but there is nothing left for herself.

She is gaining weight — everywhere, but especially a stubborn ring of fat around her midsection that wasn't there five years ago and doesn't respond to anything she tries. She feels like she's eating as clean as possible. She's tried cutting calories, cutting carbs, eating less — and the weight doesn't move. Worse, eating less is now causing its own damage: she's irritable, her energy is even lower, her cravings are worse, and the restriction itself has become a source of emotional and physical stress. She doesn't know it, but she's prediabetic. Her doctor never told her — maybe the fasting glucose was borderline and got filed away, or maybe it was never tested. The midsection fat, the fatigue after meals, the sugar cravings she can't shake — these are textbook insulin resistance signals, and no one has connected them for her.

She is tired most days. Not sleepy-tired — depleted-tired. The kind of tired that sleep doesn't fix. She is sensitized to everything — a minor scheduling conflict, a kid's attitude, a mess in the kitchen — things that shouldn't rattle her send her into a disproportionate stress response. She knows her reactions are too big for the moment, but she can't stop them.

Underneath it all is past trauma. It's not always at the surface — she's not in active crisis — but it runs in her subconscious like background noise that never fully quiets. It shapes how her nervous system responds to stress, and her body has been marinating in that cortisol for years. She has bouts of anxiety that come without warning and episodes of depression that she pushes through because the family still needs dinner. She doesn't connect any of this to her thyroid, her hormones, or her metabolic health — it's just "how she is now."

What she doesn't know: chronic stress and unresolved trauma drive cortisol dysregulation, which directly suppresses thyroid function, promotes insulin resistance (the midsection fat, the prediabetes her doctor hasn't flagged), disrupts estrogen-progesterone balance, and depletes the nutrients (iron, B12, magnesium, zinc) that thyroid hormone conversion depends on. And the caloric restriction she's turned to in desperation is making it worse — undereating signals famine to an already stressed body, which responds by slowing metabolism further, raising cortisol, and holding onto fat as a survival mechanism. Her body isn't broken — it's responding predictably to a system that has been running on stress and deprivation for too long. The Four Legs of the Table are likely all wobbling, and no one has ever connected those dots for her.

**Goals:**
- Understand *why* she feels this way — not just accept it as aging or "being a mom"
- See whether her daily stress patterns, sleep, and food choices are connected to how terrible she feels
- Get evidence that something is actually wrong, not just "stress" that she should manage better
- Find out if the midsection weight, the fatigue, the anxiety, and the emotional reactivity are related — or if she's just falling apart in five separate ways
- Learn that eating less is not the answer — and see the data that proves restricting food is making her worse, not better
- Discover that she may have insulin resistance or prediabetes that no one has tested for, and understand what labs to request
- Feel empowered to ask for help without feeling like she's being dramatic

**Key needs:** Low-friction daily journaling that fits into a caregiver's chaotic schedule, stress-symptom correlation, educational content that connects chronic stress to metabolic and thyroid dysfunction, gentle onboarding that doesn't add another obligation to her day, pattern detection that reveals the stress → cortisol → thyroid suppression → weight gain → fatigue cycle, bloating/weight correlation engine that shows her the relationship between what she eats (and doesn't eat) and how her body responds, "labs to request" guidance that flags insulin resistance markers she's likely never had tested

### "The Misattributed Senior" — Gloria
**Demographics:** Woman, 65-85, Hashimoto's/hypothyroid — often diagnosed late or inadequately managed for decades
**Situation:** Gloria is 80. She has a list of diagnoses that reads like a medical textbook — high blood pressure, peripheral artery disease, joint pain severe enough to make walking difficult, calcium loss, Raynaud's (hands and feet that go white and numb in the cold), spinal and neck pain, food sensitivities that seemed to appear out of nowhere, and severe insomnia that no sleep medication fully fixes. She has pulsatile tinnitus — a rhythmic whooshing in her ears that her doctors can't explain. Brain fog that she fears is early dementia. She is sensitized by the smallest things — a loud noise, a change in plans, a family disagreement — and her thoughts ruminate in loops she can't break.

She almost died from a hypertensive crisis — a blood pressure spike so severe it was life-threatening. That event terrified her and her family, but even in the aftermath, the medical response was to manage the blood pressure. No one asked *why* an 80-year-old woman's blood pressure became suddenly uncontrollable. No one connected it to the undertreated autoimmune thyroid condition that had been quietly destabilizing her cardiovascular system for years.

Every one of her symptoms has been treated in isolation. Blood pressure medication — multiple, adjusted repeatedly. A PAD diagnosis with vascular referrals. Calcium supplements. A sleep study. A referral to an ENT for the tinnitus. Pain management for the joints and spine. No one has ever stepped back and asked: what if a single underlying condition is driving all of this?

What Gloria's doctors have missed — or never looked for — is that Hashimoto's thyroiditis can present as a cardiovascular, neurological, and musculoskeletal condition in older patients. Hypothyroidism raises blood pressure, impairs circulation (PAD), accelerates calcium loss, triggers Raynaud's through vascular dysregulation, worsens joint and spinal degeneration through chronic inflammation, disrupts sleep architecture, and creates the neurological sensitization and rumination that looks like anxiety or cognitive decline. The pulsatile tinnitus — often dismissed — can be connected to the vascular and blood pressure changes driven by thyroid dysfunction. The food sensitivities point to gut permeability exacerbated by years of undertreated autoimmune inflammation.

Gloria represents a population that is systematically failed: older patients whose hypothyroid symptoms are attributed to aging, and whose Hashimoto's autoimmune activity is never addressed because their TSH is "managed." They accumulate diagnoses and specialists and medications, but no one connects the dots.

**Goals:**
- Understand that her constellation of symptoms may be connected — not ten separate problems, but one root system failing
- Build a record that a doctor (or her adult children advocating for her) can use to make the case for comprehensive thyroid and autoimmune evaluation
- Track which symptoms improve when thyroid treatment is optimized — proving the connection her doctors have never made
- Stop accepting "it's just your age" as an explanation for feeling this terrible
- Find out if medication changes or dietary adjustments actually help — with data, not guesswork

**Key needs:** Extremely simple interface (large text, minimal steps, caregiver-assisted entry option), symptom-to-diagnosis connection education, medication interaction awareness (she's likely on 5+ medications), doctor visit reports that frame the thyroid-cardiovascular-neurological connection for conventional doctors who think in silos, longitudinal trending that reveals which of her many symptoms respond to thyroid optimization

### Provider Persona: "The Open-Minded Clinician" — Dr. Patel
**Demographics:** Integrative/functional medicine practitioner, or conventional doctor willing to look deeper
**Situation:** Has patients who bring in data from apps but it's usually fragmented, irrelevant, or alarmist. Would value structured, clinically-framed patient data that maps to actionable testing and treatment decisions.
**Goals:**
- See patient symptom trends mapped to lab values over time
- Quickly identify which metabolic systems need investigation
- Review cycle-phase symptom patterns for female patients
- Get specific, evidence-based data rather than vague symptom complaints

**Key needs:** Provider portal with patient-shared data, clinical-grade reports, functional optimal ranges alongside conventional reference ranges for clinical context

---

## 3. Product Principles

### 3.1 Empowering, Never Pathologizing
This is not a sick person's diary. It is a detective's notebook. The language, design, and tone should make users feel capable and informed, not anxious or broken. Every piece of data collection is framed as intelligence gathering.

### 3.2 Connected, Never Isolated
No symptom exists in a vacuum. The product's core differentiator is that it understands the metabolic relationships between systems — the Four Legs of the Table, the estrogen-thyroid axis, the vicious cycles. Tracking symptoms without connecting them is what every other app already does. IgniteHealthNow connects them.

### 3.3 Fast-Feeling, Depth-Available
The daily journal should feel effortless on a normal day (2-3 minutes via smart defaults, slider scales, quick-tap symptom chips). On a bad day, a lab day, or a period tracking day, the user can go deeper without the interface fighting them. The depth is always available but never forced.

### 3.4 Clinically Credible, Never Diagnostic
The app does not diagnose or prescribe. Language is always educational and collaborative: "This pattern is sometimes associated with..." not "You have..." Lab flags use functional optimal ranges — the ranges where most people feel well, per functional medicine — alongside conventional reference ranges, always with context explaining why statistical "normal" and clinical optimal are not the same thing. The goal is to arm patients with data that clinicians cannot dismiss.

### 3.5 Functional Optimal, Never Population Normal
Conventional "normal" ranges are statistical distributions of where most people's lab values fall — they tell you nothing about where people actually *feel well*. Functional optimal ranges are different: they are derived from aggregate clinical observation by functional medicine practitioners and represent the ranges where most patients feel well or better. This is the standard IgniteHealthNow uses. Every lab value in the system is measured against functional optimal ranges from the book's framework first, with the conventional reference range shown alongside for clinical context only. The app makes the distinction explicit: "Your ferritin is 28 — within the conventional range (12-150), but below the functional optimal range (50-100) where most people feel their best." Over time, the system also learns each user's individual baseline for symptoms, energy, sleep, and other self-reported metrics — flagging deviations from *their* pattern. But for labs and biomarkers, the functional optimal ranges represent established clinical knowledge, not individual guesswork.

### 3.6 Privacy as a First Principle
Health data is the most sensitive data a person has. Anonymized profiles, encrypted fields, patient-controlled sharing, on-device processing where possible. Users own their data completely. The research layer operates only on anonymized, consented data.

### 3.7 Book-Integrated Learning
When a user logs a pattern, the app offers brief educational micro-content explaining what might be happening — linked to the relevant concept from the book. The app deepens the book's value; the book drives readers to the app. They are a unified system.

### 3.8 Rhythm-Aware, Never Monolithic
Not all data capture is daily check-in. The app recognizes four fundamentally different capture rhythms — daily routine, moment-based, event-driven, and periodic — each with its own UX pattern, friction budget, and trigger. Treating a diagnosis entry the same as a sleep rating destroys both experiences. Each rhythm gets the interface it deserves.

---

## 3A. Capture Architecture & Friction Reduction

The volume of data IgniteHealthNow captures is ambitious by design — the intelligence layer's power is directly proportional to the richness of the input. But richness cannot come at the cost of adherence. A journaling app that people abandon after two weeks generates zero insights, no matter how sophisticated the correlation engine.

This section defines the capture architecture: how every data point enters the system, when the user encounters it, and what the friction budget is for each interaction.

### 3A.1 The Four Capture Rhythms

Every data point in IgniteHealthNow belongs to exactly one of four capture rhythms. Each rhythm has a different trigger, frequency, friction tolerance, and UX pattern.

| Rhythm | Trigger | Frequency | Friction Budget | UX Pattern |
|--------|---------|-----------|----------------|------------|
| **Daily Routine** | Time of day (morning/evening) | 2x daily | Ultra-low (~90 sec each) | Slider rails, quick-taps, smart defaults, muscle memory |
| **Moment-Based** | A real-world event (eating, taking supplements) | 2-8x daily | Near-zero per event (~5-10 sec) | One-tap capture, ambient logging, camera-first |
| **Event-Driven** | Infrequent life event (new diagnosis, Rx change, lab results) | A few times per year | High (5-15 min acceptable) | Form-based, guided entry, take-your-time wizard |
| **Periodic** | Calendar cadence (cycle tracking, body photos, weekly review) | Weekly/monthly | Medium (1-3 min) | Prompted at the right cadence, skippable without guilt |

**The critical design rule:** Daily Routine and Moment-Based capture must be defended at all costs. These are the interactions users do 300+ times per year. If they feel heavy, the app dies. Event-Driven and Periodic capture can afford more friction because they happen rarely and users expect them to take time.

### 3A.2 Data Point Mapping

Every data point in the PRD is assigned to a rhythm and a priority tier.

#### Daily Routine — Morning Check-in
| Data Point | Priority | Justification |
|-----------|----------|---------------|
| Sleep quality (0-10) | **P0 — Core** | Highest-correlation predictor of daily symptom severity; non-negotiable |
| Energy level (0-10) | **P0 — Core** | Baseline metric the entire intelligence layer anchors to |
| Brain fog severity (0-10) | **P0 — Core** | Primary cognitive symptom; strong T3/iron/blood sugar correlation |
| Waking refreshed (0-10) | **P0 — Core** | Distinguishes sleep duration from sleep quality — hallmark cellular hypo marker |
| Predominant mood (single-select) | **P0 — Core** | Mood-thyroid axis; one tap, high signal |
| Thyroid medication taken (yes/not yet/skipped) | **P0 — Core** | Adherence tracking; one tap |
| Sleep duration (auto-calculated or manual) | **P1 — High Value** | Valuable context but less actionable than quality rating |
| Night wakings (quick-tap 0-4+) | **P1 — High Value** | Sleep fragmentation indicator; one tap |
| Pain/stiffness (none/mild/moderate/severe) | **P1 — High Value** | Gateway question that unlocks conditional logic |
| Cold intolerance (quick-tap) | **P1 — High Value** | Classic hypothyroid marker; one tap |
| Medication timing (timestamp) | **P1 — High Value** | Absorption correlation; auto-capturable |
| Taken with (multi-select) | **P1 — High Value** | Interference tracking; critical for absorption analysis |
| Waking basal body temperature | **P2 — Depth** | Excellent metabolic indicator but requires a BBT thermometer and adds friction; always optional, never blocking |
| Hunger/appetite (0-10) | **P2 — Depth** | Metabolic context; skippable for most users most days |
| Hydration (0-10) | **P2 — Depth** | Baseline factor; low unique insight unless dehydration is a pattern |
| Other supplements checklist | **P2 — Depth** | High value once personalized list is set up; initial setup friction is the cost |
| Pain locations (body map) | **P2 — Depth** | Conditional — only surfaces when pain is present |
| Notes (free text) | **P2 — Depth** | Context capture; always optional |

**Morning check-in friction target:** P0 items only = ~45 seconds. P0 + P1 = ~90 seconds. Full depth (P0 + P1 + P2) = ~2.5 minutes.

#### Daily Routine — Evening Check-in
| Data Point | Priority | Justification |
|-----------|----------|---------------|
| Energy pattern today (quick-select) | **P0 — Core** | Pattern typing (afternoon crash = insulin resistance signal); one tap |
| Overall energy (0-10) | **P0 — Core** | Day summary; anchors to morning baseline |
| Bloating severity (0-10) | **P0 — Core** | Top patient concern; primary metric for bloating correlation engine; daily capture is essential for food/stress/cycle correlation |
| Bloating timing (quick-select) | **P0 — Core** | When bloating occurs is as important as severity — post-meal vs. all-day tells a different story |
| Body feeling today (quick-select) | **P0 — Core** | Subjective body perception without requiring a scale; tracks the daily lived experience of weight/composition changes |
| Symptom chips (multi-select) | **P0 — Core** | Cluster capture; personalized ordering makes this fast |
| Overall mood (0-10) | **P0 — Core** | Daily trending |
| Brain fog trajectory (better/same/worse) | **P1 — High Value** | Conditional on AM brain fog; one tap |
| Concentration (0-10) | **P1 — High Value** | Cognitive tracking |
| Anxiety level (0-10) | **P1 — High Value** | Thyroid-anxiety correlation |
| Stress level (0-10) | **P1 — High Value** | Trigger identification |
| Clothes fit (quick-tap) | **P1 — High Value** | Practical proxy for body composition; emotionally salient data point |
| Water retention (quick-tap) | **P1 — High Value** | Distinguishes fluid retention from fat gain — critical for thyroid patients |
| Symptom severity per chip (0-10 each) | **P1 — High Value** | Severity trending; skippable bulk action |
| Sleep readiness (0-10) | **P1 — High Value** | Predictive for next morning |
| Bloating location (quick-tap) | **P1 — High Value** | Upper vs. lower abdomen distinguishes gastric from intestinal causes |
| Bloating food trigger (conditional) | **P1 — High Value** | Conditional on bloating > 5; direct food → bloating correlation |
| Bloating stress trigger (conditional) | **P1 — High Value** | Conditional on bloating > 5; stress → gut → bloating pathway |
| Body distress impact (conditional) | **P1 — High Value** | Conditional on feeling heavier/swollen; tracks the emotional weight of weight changes |
| Meal composition highlights (multi-select) | **P2 — Depth** | Dietary pattern capture; redundant if photo journal is active |
| Meal timing (quick-select) | **P2 — Depth** | Blood sugar correlation |
| Exercise (type + duration) | **P2 — Depth** | Functional marker |
| Fiber intake (quick-tap) | **P2 — Depth** | Estrogen clearance; niche for most users |
| Xenoestrogen exposure (multi-select) | **P3 — Advanced** | Environmental awareness; hide by default, surface for engaged users |
| Liver support supplements (multi-select) | **P3 — Advanced** | Estrogen metabolism; niche |
| Caffeine after 2pm (yes/no) | **P2 — Depth** | Sleep correlation |
| Screen time before bed (quick-tap) | **P2 — Depth** | Sleep hygiene |
| Processing speed (quick-tap) | **P2 — Depth** | Hypothyroid cognitive marker |
| Irritability (quick-tap) | **P2 — Depth** | Hormonal/thyroid indicator |
| Motivation (0-10) | **P2 — Depth** | Depression/apathy signal |

**Evening check-in friction target:** P0 items only = ~60 seconds (bloating/body adds ~15 sec). P0 + P1 = ~2 minutes. Full depth (all tiers) = ~3.5 minutes.

#### Moment-Based Capture
| Data Point | Rhythm Trigger | Friction Budget | UX |
|-----------|---------------|----------------|-----|
| Food photo | Eating | ~5 sec | FAB → camera → auto-timestamp → done. Tagging is optional post-capture. |
| Supplement photo | Taking supplements | ~5 sec | Same as food. Batch-capturable. |
| Beverage logging | Drinking | ~5 sec | Quick-tap (water, coffee, tea, alcohol) or photo |
| Medication dose confirmation | Taking medication | ~3 sec | Push notification → tap to confirm |
| Acute symptom note | Symptom flare | ~15 sec | Quick-capture from any screen: what + severity + timestamp |

**Design rule:** Moment-based capture must never require navigating to a specific screen. The FAB and notification-based confirmation handle this.

#### Event-Driven Capture
| Data Point | Trigger | Expected Frequency | Friction OK? |
|-----------|---------|-------------------|-------------|
| Lab result entry | After lab work | 2-6x per year | Yes — 5-15 min is acceptable |
| New diagnosis | After provider visit | Rare (1-3 lifetime) | Yes — guided wizard, take your time |
| New prescription | After provider visit | A few times per year | Yes — form-based, complete entry |
| Medication dosage change | After provider visit | A few times per year | Yes — change event with before/after |
| Medication discontinued | Provider decision | Rare | Yes — capture reason, watch for effects |

**Design rule:** Event-driven capture surfaces through prompts ("Did anything change at your appointment?") or manual entry from a dedicated section — never injected into the daily check-in flow.

#### Periodic Capture
| Data Point | Cadence | Friction Budget | UX |
|-----------|---------|----------------|-----|
| Visual health photos (face, body) | Daily (prompted at morning check-in) | ~30-60 sec for full set | Guided camera with silhouette overlay. Face front is primary; others are progressive. |
| Menstrual cycle day / flow | Daily during period; cycle phase ongoing | ~5 sec | Calendar tap + flow level quick-select |
| Cycle symptom overlay | Daily during luteal/menstrual phase | ~15 sec | Symptom chips already captured in daily check-in; overlay is intelligence-layer rendering |
| Eyebrow close-up photo | Weekly | ~10 sec | Weekly prompt, not daily |
| Weight | Weekly or as desired | ~5 sec | Manual or smart scale integration |
| Measurements (waist, etc.) | Monthly | ~2 min | Monthly prompt |

### 3A.3 Friction Reduction Strategies

**Strategy 1: Progressive Disclosure by Engagement Level**
Users don't see the full data model on Day 1. The app reveals depth as the user demonstrates engagement:
- **Week 1:** P0 core fields only. Morning and evening check-in take ~45 seconds each.
- **Week 2-3:** P1 fields progressively introduced with brief explanations of why they matter: "Adding sleep fragmentation tracking — this helps us detect if your fatigue is from poor sleep quality rather than just duration."
- **Month 2+:** P2 depth fields available. P3 advanced fields surface only for users who enable specific tracking goals (e.g., "I want to track estrogen dominance factors").
- **Never forced:** Users can always access full depth manually. The system just doesn't demand it upfront.

**Strategy 2: "Same as Yesterday" Rapid Entry**
After 14 days of baseline data, the app offers a rapid entry mode:
- Morning: "Yesterday you slept 7 hours, quality 6, energy 5, no fog, mild stiffness, took meds on time. Same today?" → One tap to confirm, then only edit the differences.
- Evening: Similar pattern-based pre-fill.
- Estimated time for "mostly the same" days: ~15-20 seconds per check-in.

**Strategy 3: Ambient and Passive Capture**
Wherever possible, capture data without asking:
- Sleep timing from device sensors (with permission)
- Medication timing from notification confirmation taps
- Photo timestamps from camera metadata
- Location-based context (home/work/gym) for activity inference
- Smart scale / wearable integration for weight, heart rate, HRV
- **Daily weather data** — auto-captured from a weather API based on the user's zip code (see Section 4.6)

**Strategy 4: Batch and Bundle**
Group related data points so they feel like one action, not many:
- Morning vitals = one "card" with 4 sliders (sleep quality, refreshed, energy, brain fog)
- Symptom chips = one multi-select interaction, not individual symptom entry
- Medication taken + timing + what with = one expandable "medication card"

**Strategy 5: Skip Without Guilt**
Every section, every field, every photo prompt is skippable. The app never shames or nags. Instead:
- Missing data is handled gracefully by the intelligence layer (wider confidence intervals, explicit "insufficient data" notes)
- The app communicates value, not obligation: "7-day streak! Your pattern detection is getting more accurate." Not: "You missed your check-in yesterday."

### 3A.4 Data Point Validation Framework

Each data point in the system earns its place by satisfying at least one of these criteria:

| Criterion | Question | Threshold |
|-----------|----------|-----------|
| **Correlation Power** | Does this data point participate in a named correlation or vicious cycle detection? | Must map to at least one intelligence-layer correlation |
| **Clinical Utility** | Would a provider find this useful in a doctor visit report? | Must appear in at least one report section |
| **User Insight** | Does this help the user understand their own patterns, even without the intelligence layer? | Self-evidently useful for self-tracking |
| **Temporal Anchoring** | Does this serve as a timeline anchor for before/after analysis? | Required for medication changes, diagnoses, lab results |
| **Baseline Establishment** | Does the intelligence layer need this to establish the user's personal optimal baseline? | Required for smart defaults and anomaly detection |

**If a data point cannot satisfy at least one criterion, it should be removed or demoted to P3 (advanced/hidden by default).**

This framework should be applied during implementation to validate every field before it ships. It's also the tool for evaluating future data capture requests — any new field must pass this test.

---

## 4. Capture Layer — Daily Journal

### 4.1 Design Philosophy
The daily journal is the heartbeat of the app. It must be completable in 2-3 minutes on a typical day through aggressive use of:
- **Slider scales** (0-10) for severity/quality metrics
- **Quick-tap symptom chips** that remember the user's most common selections
- **Smart defaults** that pre-populate based on the user's baseline and recent patterns
- **Conditional logic** that only surfaces follow-up questions when triggered
- **Free text optional** — always available, never required

The journal uses a **morning/evening structure** adapted from the prior work's "chapter" model, but reorganized around the hypothyroidism-specific capture needs defined in the book's framework.

### 4.2 Morning Check-in (~90 seconds typical)

#### Section A: How You Woke Up
| Input | Format | Purpose |
|-------|--------|---------|
| Sleep duration | Auto-calculated from bed/wake time, or manual entry | Correlates with fatigue severity, brain fog, pain sensitivity |
| Sleep quality | 0-10 slider | Distinguishes poor sleep as outcome (what disrupted it) vs. trigger (what it causes) |
| Night wakings | Quick-tap: 0, 1, 2, 3, 4+ | Sleep fragmentation is a key hypothyroid indicator |
| Waking refreshed | 0-10 slider | The critical outcome metric — sleep duration without restoration is a hallmark of cellular hypothyroidism |
| Waking basal body temperature | Numeric entry (optional but prompted) | Core metabolic indicator; low BBT is one of the most reliable indicators of cellular hypothyroidism |

**Conditional:** If sleep quality < 5 → "What disrupted your sleep?" multi-select: Pain, Temperature dysregulation, Racing thoughts, Bathroom, Night sweats, Unknown

#### Section B: Body State
| Input | Format | Purpose |
|-------|--------|---------|
| Energy level | 0-10 slider | Morning energy baseline; predicts daily trajectory |
| Brain fog severity | 0-10 slider (0 = clear, 10 = severe) | Cognitive symptom tracking; correlates with T3 availability, iron, blood sugar |
| Pain/stiffness presence | Quick-tap: None, Mild, Moderate, Severe | Gateway question |
| Pain locations | Multi-select body map (if pain present) | Joint/muscle pain patterns in hypothyroidism |
| Cold intolerance | Quick-tap: Normal, Slightly cold, Cold, Very cold | Classic hypothyroid marker, tracks with BBT |
| Predominant mood | Single-select carousel: Calm, Anxious, Irritable, Sad, Motivated, Overwhelmed, Foggy, Neutral | Mood-thyroid connection |

**Conditional:** If energy < 4 → prompt for "exercise tolerance yesterday" rating
**Conditional:** If brain fog > 6 → "Word retrieval difficulty?" Yes/No

#### Section C: Medication & Supplements
| Input | Format | Purpose |
|-------|--------|---------|
| Thyroid medication taken | Quick-tap: Yes / Not yet / Skipped | Adherence tracking |
| Medication timing | Time stamp (auto or manual) | Timing correlation with symptom shifts |
| Taken with | Multi-select: Empty stomach, Coffee, Food, Calcium, Iron, Other supplements | Critical — absorption interference tracking |
| Other supplements taken | Checklist from user's personalized list | Supplement-symptom correlation |

#### Section D: Quick Context
| Input | Format | Purpose |
|-------|--------|---------|
| Hunger/appetite | 0-10 slider | Metabolic indicator; extreme hunger can signal blood sugar dysregulation |
| Hydration state | 0-10 slider | Baseline factor |
| Notes | Optional free text (200 char) | Contextual capture: "started new supplement yesterday," "stressful week at work" |

### 4.3 Evening Check-in (~90 seconds typical)

#### Section A: Energy & Cognitive Review
| Input | Format | Purpose |
|-------|--------|---------|
| Energy pattern today | Quick-select: Steady, Morning crash, Afternoon crash, Multiple crashes, Steady decline, Low all day | Energy pattern typing; "afternoon crash" often maps to blood sugar/insulin resistance |
| Overall energy rating | 0-10 slider | Day summary metric |
| Brain fog (if present in AM) | Better / Same / Worse | Trajectory tracking |
| Concentration | 0-10 slider | Cognitive tracking |
| Processing speed | Quick-tap: Normal, Slow, Very slow | Hypothyroid-specific cognitive marker |

#### Section B: Bloating & Body Composition
Bloating and weight gain are among the most distressing daily experiences for hypothyroid/Hashimoto's patients. They are also among the most correlation-rich — directly tied to food choices, meal timing, stress, sleep, hormonal phase, and gut function. This section is elevated to its own dedicated block because the intelligence layer depends on consistent, daily capture to build the lifestyle ↔ body composition correlations that reveal cause and effect.

| Input | Format | Purpose |
|-------|--------|---------|
| Bloating today | 0-10 slider (0 = flat/comfortable, 10 = severely distended) | Daily bloating severity; the primary metric for bloating correlation engine |
| Bloating timing | Quick-select: None, Morning, After meals, Afternoon, Evening, All day | When bloating occurs reveals triggers — post-meal suggests food sensitivity, evening suggests cumulative, morning suggests overnight gut motility |
| Bloating location | Quick-tap: Upper abdomen, Lower abdomen, Full abdomen, Not sure | Upper vs. lower can distinguish gastric from intestinal causes |
| Body feeling today | Quick-select: Lighter than usual, About my baseline, Heavier/puffier than usual, Significantly swollen | Subjective daily body perception — tracks the emotional and physical experience without requiring a scale |
| Clothes fit | Quick-tap: Normal, Tighter than usual, Had to change outfit, Noticeably looser | Practical proxy for body composition changes — often more emotionally salient than a number |
| Water retention | Quick-tap: None, Mild (fingers/ankles), Moderate (face/hands/feet), Severe (full body puffiness) | Distinguishes fat gain from fluid retention — critical for thyroid patients where myxedema and water retention mimic weight gain |

**Conditional:** If bloating > 5 → "What did you eat in the last 4 hours?" Quick-select chips: Gluten, Dairy, Cruciferous vegetables, High-FODMAP foods, Processed food, Sugar/sweets, Large meal, Carbonated drinks, Nothing unusual + free text option. This creates the direct food → bloating correlation dataset.
**Conditional:** If bloating > 5 → "Stress level in the last few hours?" 0-10 slider. This captures the stress → gut → bloating pathway.
**Conditional:** If body feeling = "Heavier/puffier" or "Significantly swollen" → "How is this affecting your mood right now?" Quick-select: Not bothered, Mildly frustrating, Really bothering me, Affecting my plans/confidence. This tracks the emotional weight of weight — the distress cycle where body changes cause stress which worsens the condition.

#### Section C: Physical Symptoms
| Input | Format | Purpose |
|-------|--------|---------|
| Symptom chips | Multi-select from personalized + default set: Hair shedding, Skin changes, Nail changes, Joint pain, Muscle pain, Heart palpitations, Constipation, Acid reflux, Nausea, Bladder urgency, Headache, Swelling/puffiness, Cold extremities, Exercise intolerance, Dizziness, Yeast/candida signs, SIBO signs | Symptom cluster capture |
| New/unusual symptoms | Free text (optional) | Novel symptom detection |
| Symptom severity (for selected) | 0-10 slider per symptom (skippable) | Severity trending |

**Conditional:** If "Heart palpitations" selected → "Resting heart rate?" numeric entry
**Conditional:** If "Hair shedding" selected → Quick-select: Normal shedding, Noticeable increase, Significant clumps, Bald patches
**Conditional:** If "Yeast/candida signs" selected → Multi-select: Vaginal yeast infection, Oral thrush (white patches in mouth), Cracked/red corners of mouth (angular cheilitis), White-coated tongue, Mucus in stool, Skin rash/fungal patches, Nail fungus, Persistent itching
**Conditional:** If "SIBO signs" selected → Multi-select: Excessive bloating/distension after eating, Excessive gas (belching or flatulence), Abdominal pain/cramping after meals, Diarrhea, Constipation (methane-dominant SIBO), Alternating diarrhea and constipation, Feeling full quickly/early satiety, Nausea after eating, Floating or greasy stools (fat malabsorption)

#### Section D: Mood & Stress
| Input | Format | Purpose |
|-------|--------|---------|
| Overall mood | 0-10 slider + optional single-word label | Mood trending |
| Anxiety level | 0-10 slider | Anxiety-thyroid correlation |
| Stress level | 0-10 slider | Stress as a trigger/outcome |
| Irritability | Quick-tap: None, Mild, Moderate, Severe | Specific to hormonal/thyroid dysfunction |
| Motivation | 0-10 slider | Depression/apathy indicator |

**Conditional:** If anxiety > 7 → "Physical anxiety symptoms?" multi-select: Racing heart, Tension, Digestive upset, Difficulty breathing, Insomnia

#### Section E: Lifestyle Inputs
| Input | Format | Purpose |
|-------|--------|---------|
| Meal composition highlights | Multi-select chips: High protein, Selenium-rich, Cruciferous vegetables, Gluten, Dairy, Processed food, Sugar/sweets, Alcohol | Thyroid-relevant dietary tracking |
| Meal timing | Quick-select: Regular intervals, Skipped meals, Late eating, Fasting | Meal timing → blood sugar → thyroid connection |
| Exercise | Quick-select: None, Light, Moderate, Intense + duration | Exercise tolerance is a key functional marker |
| Stress events | Optional free text | Flare trigger documentation |
| Fiber intake | Quick-tap: Low, Moderate, High | Estrogen clearance factor |
| Xenoestrogen exposure | Optional multi-select: Plastics used, Conventional products, Non-organic produce | Environmental estrogen load awareness |
| Liver support supplements | Multi-select: DIM, Calcium-d-glucarate, Sulforaphane, None | Estrogen metabolism support tracking |

#### Section F: Sleep Preparation
| Input | Format | Purpose |
|-------|--------|---------|
| Sleep readiness | 0-10 slider | Predictive for next-morning state |
| Caffeine after 2pm | Yes/No + time | Sleep disruption factor |
| Screen time before bed | Quick-tap: None, <30 min, 30-60 min, >1 hour | Sleep hygiene factor |

### 4.4 Visual Health Documentation (Morning)

Users are prompted to capture daily photos as part of the morning check-in. These photos create a visual timeline that tracks physical changes over time — changes that are often too gradual to notice day-to-day but become unmistakable when viewed over weeks and months.

#### Photo Capture Prompts
| Photo | Guidance | Thyroid-Relevant Changes Tracked |
|-------|----------|----------------------------------|
| Face (front) | Neutral expression, consistent lighting | Facial puffiness/myxedema, skin pallor or yellowing, periorbital edema (eye puffiness), acne changes, overall complexion |
| Face (profile) | Side view | Neck swelling (goiter), jawline puffiness, submental edema |
| Eyebrows (close-up) | Optional but prompted weekly | Outer third thinning — one of the most specific visible signs of hypothyroidism |
| Hair (top of head) | Part hair, photograph scalp | Hair thinning patterns, density changes, texture changes (coarse, brittle, dry) |
| Hands/nails | Spread fingers, photograph nails | Nail ridging, brittleness, slow growth, pallor of nail beds (iron indicator) |
| Body (front, clothed) | Consistent clothing or reference garment | Body composition changes, weight distribution shifts, visible swelling/water retention |
| Targeted concern | User-selected area they want to track | Skin patches, rashes, specific swelling, any area of concern |

#### UX Design
- **Quick-capture flow:** Guided prompts with silhouette overlay for consistent framing
- **Minimum viable set:** Face (front) is the primary daily photo. All others are optional but the app progressively encourages adding them.
- **Consistency reminders:** "For best comparison, use similar lighting and position each day"
- **Privacy-first:** Photos stored encrypted on-device by default. Optional encrypted cloud backup. Never shared with providers unless the patient explicitly includes them in a report.
- **Skip option:** Always skippable — the daily journal is never blocked by photo capture

#### AI Visual Analysis Agent (North Star Feature — Not Day One)
The Visual Analysis Agent is a roadmap feature, not a launch requirement. However, the photo capture system is designed from day one to collect the data this agent will eventually need. Every photo captured today is an investment in the AI's future capability.

**Day One: Data Capture Foundation**
Photo capture must be implemented with future AI analysis in mind:
- **Consistent framing metadata:** Store device orientation, lighting conditions (ambient light sensor reading if available), distance estimate, and silhouette alignment score so the AI can later normalize comparisons
- **Structured photo types:** Every photo tagged with its type (face_front, face_profile, eyebrows, hair, nails, body, targeted) — this becomes the training/tuning dataset's label structure
- **Temporal indexing:** Photos linked to exact date, time, cycle day, and the same day's journal entry (symptom severity, lab proximity, medication changes) — this is the ground truth for correlating visible changes with clinical data
- **Resolution and format standards:** Minimum resolution requirements and consistent format so the eventual model receives clean input
- **User self-assessment tags (optional):** After photo capture, optional quick-tap: "Looks typical for me / More puffy than usual / Less puffy than usual / Not sure" — this creates labeled training data from user perception that can validate or calibrate future AI detection
- **Baseline flagging:** First 7 days of photos explicitly marked as baseline set for future comparison

**Future: What the Agent Will Do**
When implemented, the Visual Analysis Agent will:
- Compare recent photos against baseline and historical timeline
- Detect gradual changes in facial puffiness, hair density, skin tone, eyebrow thickness, nail condition, body composition
- Generate change alerts with side-by-side comparison images
- Correlate visible changes with symptom trends, lab values, and medication changes
- Flag concerning patterns for provider discussion (never diagnoses)
- Track positive changes as reinforcement (e.g., "Facial puffiness reduced since medication adjustment")

**How it will communicate:**
- **Never diagnoses:** "Your photos over the past 6 weeks show a noticeable change in facial puffiness — this is sometimes associated with fluid retention patterns in thyroid conditions. This may be worth discussing with your provider."
- **Change detection, not diagnosis:** "Your eyebrow photos show progressive thinning of the outer third over the past 3 months. Outer eyebrow thinning is a well-documented visible marker associated with thyroid function. Consider sharing this photo timeline with your provider."
- **Positive changes too:** "Your facial puffiness has visibly reduced over the past 4 weeks — this coincides with your medication dosage adjustment on [date]."
- **Comparison views:** Side-by-side photo comparison (Week 1 vs. Week 12) generated for doctor visit reports

**Boundaries (applies whenever the agent ships):**
- All visual analysis is flagged as observational, never clinical
- The agent raises concerns but frames them as "patterns worth discussing with your provider"
- Photo analysis is supplementary to journal and lab data, never standalone
- Users can opt out of AI analysis while still capturing photos for personal reference

**Implementation path:** The approach to training/tuning the visual analysis model (fine-tuned vision model, multimodal LLM with few-shot learning, or dedicated medical image analysis pipeline) will be determined as the photo dataset grows and the state of available models evolves. The critical requirement is that day-one data capture is rich enough to support any of these approaches.

### 4.5 Adaptive Personalization
After 7 days of use, the journal adapts:
- **Symptom chips reorder** to show the user's most frequently logged symptoms first
- **Smart defaults** pre-fill based on the user's baseline (e.g., if energy is typically 5-6, the slider starts at 5)
- **Skipped sections collapse** — if a user never logs xenoestrogen exposure, that field becomes hidden (accessible via "More" button)
- **Conditional triggers refine** — the system learns which follow-ups are relevant to this specific user
- **Quick-log mode** — after 14 days, offer a "same as yesterday with changes" rapid entry option

### 4.6 Weather Data (Passive — Zero User Friction)

Weather affects how people with hypothyroidism feel — and many patients know this intuitively but have no data to confirm it. Cold weather worsens cold intolerance and joint stiffness. Barometric pressure drops trigger headaches, joint pain, and flares. Humidity changes affect inflammation. Seasonal light changes impact mood, energy, and vitamin D production. For patients who are already sensitized — whose nervous systems are running on high alert — even weather shifts can be a meaningful trigger.

The app captures weather data passively. The user enters nothing.

**How it works:**
- On onboarding, the user provides their zip code (or the app uses device location with permission)
- Each day, the app pulls weather data from a weather API (e.g., OpenWeatherMap, WeatherAPI) and attaches it to that day's journal entry as metadata
- The user never sees a weather input field. It just runs in the background.

**Data captured daily (auto-attached to each journal entry):**
| Data Point | Source | Correlation Value |
|-----------|--------|------------------|
| High/low temperature | Weather API | Cold intolerance correlation; cold days → joint pain, fatigue, Raynaud's flares |
| Barometric pressure | Weather API | Pressure drops correlate with joint pain, headaches, flares in inflammatory/autoimmune conditions |
| Humidity | Weather API | Humidity changes affect inflammation markers and respiratory symptoms |
| Weather condition (sunny, cloudy, rain, snow, storm) | Weather API | Seasonal affective patterns; storm fronts and pressure changes |
| Daylight hours | Calculated from location + date | Seasonal light exposure → mood, energy, vitamin D synthesis; winter months often correlate with hypothyroid symptom worsening |
| UV index | Weather API | Vitamin D production proxy |
| Pollen/air quality index | Air quality API (if available) | Allergy-inflammation-autoimmune flare connection |

**Intelligence layer integration:**
- The pattern analysis agent includes weather as a background correlation variable. If a user's joint pain consistently spikes on days with barometric pressure drops, or their fatigue worsens during cold snaps, or their mood crashes correlate with low-light days — the app can surface this: "Your joint pain scores are 2.4 points higher on days when barometric pressure drops more than 10mb. This is a pattern seen in inflammatory and autoimmune conditions."
- Weather is never the primary insight — it's a contextual factor that adds explanatory power to existing correlations. "Your fatigue was worse this week — but this week also had 3 days below 40°F and two pressure drops. Weather may be a contributing factor alongside your other patterns."
- Seasonal trending: "Your energy and mood scores average 1.8 points lower in November-February compared to May-August. This seasonal pattern is common in hypothyroidism and may be worth discussing with your provider — vitamin D levels, light therapy, and medication timing adjustments can help."

**Privacy note:** Weather data is derived from zip code or general location, not GPS tracking. The app does not need or store precise location data for this feature.

---

## 5. Capture Layer — Photo Food Journal

### 5.1 Integration Philosophy
The photo food journal is integrated as a companion to the daily check-in, not a replacement for it. The daily journal captures thyroid-relevant dietary categories (protein, selenium, cruciferous, gluten, dairy). The photo journal provides the visual record, portion documentation, and optional nutritional detail.

### 5.2 Core Photo Capture
- **Floating action button (FAB)** — persistent camera icon for one-tap meal capture
- **Timestamp auto-recorded** — enables meal timing correlation
- **Quick category tag** after capture: Meal, Snack, Supplement, Beverage, Medication
- **Thyroid-relevant tagging** (optional): User can tag photos with the same chips from the daily journal (High protein, Selenium-rich, Cruciferous, etc.)

### 5.3 AI Recognition (Progressive Enhancement)
Drawing from the prior work's three-tier system, adapted for thyroid relevance:

**Tier 1 — High Confidence (85%+):** Packaged items with visible labels, simple whole foods. Auto-populated nutrition data with USDA/Open Food Facts database match. User confirms with one tap.

**Tier 2 — Smart Confirmation (60-85%):** Common foods requiring refinement. 1-2 strategic questions for accuracy. Chain restaurant items with official menu data. Focus on thyroid-relevant nutrients: selenium content, iodine, protein, cruciferous vegetable identification.

**Tier 3 — Estimation Mode (<60%):** Restaurant meals, complex dishes. Honest calorie/macro ranges with confidence indicators. Thyroid-relevant flagging: "This appears to contain cruciferous vegetables — were they cooked or raw?" (raw cruciferous is relevant for goitrogen content).

### 5.4 Thyroid-Specific Food Intelligence
Beyond standard nutrition tracking, the photo journal flags:
- **Goitrogen-containing foods** (raw cruciferous, soy) with educational context — not alarmist, but informative
- **Selenium-rich foods** (Brazil nuts, seafood, eggs) — positive reinforcement
- **Gluten and dairy presence** — for users tracking elimination protocols
- **Meal timing relative to thyroid medication** — "This meal was photographed 25 minutes after your levothyroxine dose. Recommended gap is 30-60 minutes."
- **Iron/calcium-rich foods near medication** — "This meal contains high calcium. If taken near thyroid medication, absorption may be reduced."

### 5.5 Database Integration Strategy
Retained from prior work with phased approach:
- **Phase 1:** USDA FoodData Central (300K+ items, free) + Open Food Facts (2.8M+ items for barcode scanning)
- **Phase 2:** Nutritionix API (764K+ items including restaurant chains) when user base justifies cost
- Focus: accuracy for thyroid-relevant nutrients (selenium, iodine, iron, zinc) over general calorie precision

---

## 6. Capture Layer — Lab Results

### 6.1 Lab Entry Interface
Users enter lab results manually (MVP) with future integration potential for lab portal APIs.

#### Thyroid Panel
| Marker | Conventional Reference Range | Functional Optimal Range (per book) | Auto-Calculated |
|--------|---------------------------|-----------------------------------|-----------------|
| TSH | 0.45 - 4.5 mIU/L | 0.5 - 2.0 mIU/L | — |
| Free T4 | 0.82 - 1.77 ng/dL | 1.0 - 1.5 ng/dL | — |
| Free T3 | 2.0 - 4.4 pg/mL | 3.0 - 4.0 pg/mL | — |
| Reverse T3 | 9.2 - 24.1 ng/dL | 9.2 - 15.0 ng/dL | — |
| TPO Antibodies | 0 - 34 IU/mL | < 9 IU/mL | — |
| Thyroglobulin Antibodies | 0 - 0.9 IU/mL | < 0.9 IU/mL | — |
| FT3:rT3 Ratio | — | > 20 (optimal) | (FT3 pg/mL x 100) / rT3 ng/dL |
| FT4:FT3 Conversion | — | Context-dependent | Trended over time |

#### Metabolic Panel (Four Legs)
| Marker | Conventional Reference Range | Functional Optimal Range | Leg |
|--------|---------------------------|------------------------|-----|
| Fasting Insulin | 2.6 - 24.9 uIU/mL | 2.0 - 8.0 uIU/mL | Insulin Resistance |
| HbA1c | 4.0 - 5.6% | 4.5 - 5.3% | Insulin Resistance |
| Triglycerides | < 150 mg/dL | < 100 mg/dL | Insulin Resistance |
| HDL | > 40 mg/dL | > 60 mg/dL | Insulin Resistance |
| TG:HDL Ratio | — | < 1.5 (optimal) | Insulin Resistance (auto-calculated) |
| Ferritin | 12 - 150 ng/mL (F) | 50 - 100 ng/mL (optimal) | Iron Dysregulation |
| Serum Iron | 37 - 145 mcg/dL | 85 - 130 mcg/dL | Iron Dysregulation |
| TIBC | 250 - 370 mcg/dL | Context-dependent | Iron Dysregulation |
| Iron Saturation | 15 - 55% | 25 - 45% | Iron Dysregulation |
| Homocysteine | 0 - 14.5 umol/L | 5.0 - 8.0 umol/L | Homocysteine |
| Vitamin B12 | 211 - 946 pg/mL | 500 - 800 pg/mL | Homocysteine |
| Folate | > 3.0 ng/mL | > 15 ng/mL | Homocysteine |
| Liver Enzymes (ALT) | 7 - 56 U/L | 10 - 26 U/L | Liver Dysfunction |
| Liver Enzymes (AST) | 10 - 40 U/L | 10 - 26 U/L | Liver Dysfunction |
| GGT | 0 - 45 U/L | 0 - 30 U/L | Liver Dysfunction |
| Vitamin D | 30 - 100 ng/mL | 50 - 80 ng/mL | Cross-cutting |

#### Hormonal Panel
| Marker | Conventional Reference Range | Functional Optimal Range | Connection |
|--------|---------------------------|------------------------|------------|
| Estradiol (E2) | Phase-dependent | Phase-dependent | Estrogen dominance |
| Progesterone (Day 19-21) | 1.8 - 24 ng/mL | > 10 ng/mL (luteal) | E2:P4 ratio |
| SHBG | 18 - 144 nmol/L | Context-dependent | Thyroid/estrogen connection |
| Testosterone (Total) | 15 - 70 ng/dL (F) | Context-dependent | — |
| Testosterone (Free) | 0.3 - 1.9 ng/dL (F) | Context-dependent | — |
| DHEA-S | Age-dependent | Age-dependent | Adrenal connection |
| Prolactin | 4.8 - 23.3 ng/mL | < 15 ng/mL | Thyroid connection |
| Pg/E2 Ratio (Progesterone-to-Estradiol) | — | 200–400 (functional optimal) | Auto-calculated: (Progesterone in pg/mL) ÷ (Estradiol in pg/mL). Since progesterone is typically reported in ng/mL, multiply by 1000 to convert to pg/mL before dividing. |

#### Pg/E2 Ratio — Estrogen Dominance Calculation

This is the primary lab-based metric for detecting estrogen dominance. The ratio must be calculated from **mid-luteal phase** blood draw (Day 19-21 of cycle) when both hormones are at their functional peak. The ratio is only clinically meaningful when E2 is within the luteal reference range (43-180 pg/mL).

**Formula:** Progesterone (pg/mL) ÷ Estradiol (pg/mL)
*(Since progesterone is typically reported in ng/mL, multiply by 1000 first: e.g., 15 ng/mL = 15,000 pg/mL. If E2 is 80 pg/mL → ratio = 15,000 ÷ 80 = 187.5)*

**Interpretation Tiers:**
| Ratio | Interpretation | Clinical Significance |
|-------|---------------|----------------------|
| **Below 100** | **Estrogen dominant** | Progesterone is not adequately counterbalancing estradiol. This is where symptoms manifest and where the estrogen → TBG → thyroid suppression loop is most active. The intelligence layer flags this as a confirmed estrogen dominance pattern. |
| **100–200** | **Suboptimal / thin edge** | Technically within the broad acceptable range, but many functional practitioners consider this insufficient. A woman here may be symptomatic — breast tenderness, PMS amplification, worsening hypothyroid symptoms in the luteal phase. The app flags this as "borderline — worth monitoring." |
| **200–400** | **Functional optimal** | This is where most functional and integrative medicine practitioners consider the hormonal balance robust. Progesterone is clearly dominant, supporting immune regulation, uterine lining stability, thyroid function (progesterone opposes estrogen's TBG-raising effect), and the anti-inflammatory properties relevant to Hashimoto's management. This reflects what healthy ovulating women naturally produce. |
| **Above 500** | **Progesterone dominant** | Usually from progesterone supplementation. Can down-regulate estrogen receptors and create symptoms that paradoxically mimic estrogen deficiency (hot flashes, vaginal dryness, mood changes). The app flags this and asks about supplementation. |

**Honest caveat (displayed in educational content):** The 200+ functional optimal target is a clinical consensus among functional and integrative practitioners, not a threshold established by a definitive randomized controlled trial. But it is grounded in physiology — healthy luteal progesterone naturally runs 200-400× estradiol — and it is the number that clinical experience has converged on. IgniteHealthNow presents it as the functional optimal standard alongside the broader 100-500 conventional range, consistent with how the book frames all lab interpretation.

**Intelligence layer integration:**
- When both E2 and progesterone labs are entered from a luteal-phase draw, the Pg/E2 ratio is auto-calculated and displayed with tier interpretation
- A ratio below 100 triggers the Estrogen Dominance → Thyroid Suppression pathway alerts (Section 8.4) and connects to the user's PMS severity trends and cycle-phase symptom mapping
- A ratio of 100-200 surfaces a "borderline" educational note and prompts the user to track PMS symptoms closely for pattern confirmation
- Trending across multiple lab draws shows whether estrogen dominance is improving or worsening over time — critical for evaluating the impact of dietary changes, supplements (DIM, calcium-d-glucarate), or progesterone supplementation
- If the ratio is above 500 and the user is logging progesterone supplementation, the app notes the likely connection and suggests discussing dosage with their provider

### 6.2 Lab Intelligence Features
- **Dual-range display:** Every lab value shows both the conventional reference range and the functional optimal range from the book, with a visual indicator of where the user's value falls in each. The functional optimal range is presented as the primary target — these are the ranges where most people feel well, as established by functional medicine practitioners. The conventional range is shown for clinical context only, with an explanation that conventional ranges are statistical distributions of lab values, not indicators of where people actually thrive.
- **Color coding:** Green (within functional optimal), Yellow (within conventional range but outside functional optimal — this is the danger zone where patients are told they're "fine" but aren't), Red (outside even the conventional range)
- **Four Legs mapping:** Each lab result is tagged to its relevant Leg, so the user can see at a glance which metabolic pillar(s) need attention
- **Auto-calculated ratios:** FT3:rT3, TG:HDL, E2:P4 — calculated automatically when component values are available, trended over time
- **Conversion efficiency trending:** FT4:FT3 ratio graphed over time to visualize whether the user is converting T4 to active T3 effectively
- **Educational context:** Each lab result includes a "Why this matters" expandable explanation tied to the book's framework
- **Suggested next labs:** Based on current results and identified gaps, suggest which labs to request next (e.g., "You have TSH and FT4 but no FT3 or rT3 — consider requesting these for a complete conversion picture")
- **DUTCH test mention:** When estrogen dominance is suspected, mention the DUTCH test as the comprehensive option, or at minimum recommend serum E2 + progesterone timed to luteal phase

### 6.3 Diagnosis Capture

When a user receives a diagnosis from a provider, they need a structured way to record it. Diagnoses are critical context for the intelligence layer — a Hashimoto's diagnosis changes how the app interprets TPO antibody trends, an insulin resistance diagnosis validates the Leg 1 detection, and an estrogen dominance or PCOS diagnosis shifts the pattern detection emphasis.

#### Diagnosis Entry
| Field | Format | Purpose |
|-------|--------|---------|
| Diagnosis name | Text entry with auto-suggest from common conditions | Structured recording |
| Diagnosing provider | Text entry (optional) | Attribution and timeline |
| Date of diagnosis | Date picker | Timeline tracking |
| Diagnosis category | Auto-tagged: Thyroid, Autoimmune, Metabolic, Hormonal, Nutritional deficiency, Other | Four Legs mapping and pattern context |
| Supporting labs | Link to existing lab entries (optional) | Connects diagnosis to the data that drove it |
| Prescribed treatment | Link to medication/supplement entries | Connects diagnosis → treatment → outcomes |
| Notes | Free text | Provider comments, severity, subtype details |
| Status | Active, Resolved, Under review, Suspected (self) | Distinguishes confirmed vs. suspected |

**Common diagnoses the app should auto-suggest:**
- Hypothyroidism (primary, secondary, subclinical)
- Hashimoto's thyroiditis
- Graves' disease
- Insulin resistance / Metabolic syndrome / Type 2 diabetes / Pre-diabetes
- Iron deficiency / Iron deficiency anemia
- PCOS (Polycystic Ovary Syndrome)
- Estrogen dominance
- Vitamin D deficiency
- B12 deficiency
- MTHFR mutation
- Adrenal insufficiency
- Fibromyalgia
- Celiac disease / Gluten sensitivity
- NAFLD (Non-alcoholic fatty liver disease)
- Candida overgrowth / Chronic yeast infections
- SIBO (Small Intestinal Bacterial Overgrowth)
- Endometriosis
- Fibroids

**Intelligence integration:**
- A new diagnosis triggers the relevant agentic workflows to re-evaluate historical data through the lens of the diagnosis
- "You were diagnosed with Hashimoto's on [date]. Looking back at your symptom journal, your TPO antibody trend and symptom flare pattern are consistent with this — here's what the book recommends tracking going forward."
- Diagnoses appear on the doctor visit report timeline
- Diagnosis status changes (e.g., "insulin resistance → resolved") are tracked as clinical milestones

### 6.4 Prescription & Medication Change Capture

Beyond the daily medication adherence tracking in the morning check-in (Section 4.2C), the app needs a structured way to capture when medications are prescribed, changed, or discontinued. These are pivotal events in a patient's timeline that the intelligence layer must correlate with symptom changes.

#### New Prescription Entry
| Field | Format | Purpose |
|-------|--------|---------|
| Medication name | Text entry with auto-suggest (common thyroid/metabolic medications) | Structured recording |
| Prescribing provider | Text entry (optional) | Attribution |
| Date prescribed | Date picker | Timeline event |
| Dosage | Numeric + unit (e.g., 75 mcg, 500 mg) | Dosage tracking |
| Frequency | Quick-select: Once daily, Twice daily, As needed, Other | Regimen structure |
| Timing instructions | Multi-select: Morning, Evening, With food, Empty stomach, Away from calcium/iron | Absorption and interaction tracking |
| Reason / linked diagnosis | Link to diagnosis entry (optional) | Connects prescription to the condition it treats |
| Notes | Free text | Provider instructions, special considerations |

#### Medication Change Events
| Event Type | Captured Data | Intelligence Use |
|------------|--------------|-----------------|
| **New prescription** | Full entry above | Marks timeline; pattern detection watches for symptom shifts in the 2-6 weeks following |
| **Dosage change** | Old dose → New dose, date, reason | Critical correlation point — "Your energy improved by 1.8 points in the 4 weeks after your levothyroxine increase from 50mcg to 75mcg" |
| **Medication switch** | Old med → New med, date, reason | Tracks transition effects and compares before/after symptom profiles |
| **Discontinued** | Medication, date, reason (side effects, resolved, provider decision) | Watches for symptom recurrence after discontinuation |
| **Supplement added/removed** | Supplement, date, reason | Correlates with symptom and lab changes |

**Common medications the app should auto-suggest:**
- *Thyroid:* Levothyroxine (Synthroid, Tirosint), Liothyronine (Cytomel), Natural desiccated thyroid (Armour, NP Thyroid, WP Thyroid)
- *Metabolic:* Metformin, Berberine
- *Hormonal:* Progesterone (oral, topical), Birth control (type), DHEA, Testosterone
- *Supplements:* Selenium, Zinc, Iron (type), Vitamin D3, B12 (methylcobalamin, cyanocobalamin), Folate (methylfolate), Magnesium (type), DIM, Calcium-d-glucarate, Sulforaphane, Omega-3, CoQ10, NAC

**Intelligence integration:**
- Medication changes are first-class timeline events — the Pattern Analysis Agent uses them as anchor points: "Since starting [medication] on [date], your [symptom] has [improved/worsened] by [X]%"
- The doctor visit report includes a complete medication timeline showing all changes with correlated symptom trends
- The chat agent can reference medication history: "You switched from Synthroid to Armour on [date]. Your FT3 levels improved from [X] to [Y] over the following 8 weeks."
- Dosage changes trigger a 6-week monitoring window where the app pays closer attention to symptom shifts and surfaces comparisons to the pre-change baseline

---

## 7. Capture Layer — Menstrual & Estrogen Dominance Tracking

### 7.0 Why This Section Is Critical
Sex hormones and thyroid function are zipped together — you cannot understand one without tracking the other. Estrogen dominance raises thyroid-binding globulin (TBG), which binds free thyroid hormone and reduces cellular availability. Progesterone supports thyroid function and opposes estrogen's suppressive effects. When this balance is disrupted — by stress, liver dysfunction, nutritional depletion, insulin resistance, or environmental estrogen exposure — the thyroid takes the hit, and the thyroid dysfunction further disrupts the hormonal balance. It is a bidirectional relationship: hormones affect thyroid, thyroid affects hormones. The intelligence layer cannot detect these patterns without detailed, consistent cycle data.

This section captures the full menstrual picture — not as a standalone "period tracker" but as a core data stream that feeds directly into vicious cycle detection, estrogen dominance pathway analysis, and the bloating/weight correlation engine.

#### Friction Design for Cycle Tracking
Cycle data is captured in three tiers to keep daily friction minimal while still collecting everything the intelligence layer needs:

| Tier | When | Time | What |
|------|------|------|------|
| **Daily quick-log** (during active period only) | Added to morning check-in, 3-7 days/month | ~15 sec | Flow heaviness + clot size + cramp severity — 3 quick-taps |
| **PMS quick-log** (during PMS window only) | Added to evening check-in, 7-14 days/month | ~20 sec | Multi-select PMS symptom chips + one severity slider — same pattern as regular symptom chips |
| **End-of-cycle review** (once per cycle) | Prompted when period ends | ~2-3 min | Detailed retrospective: worst day, cramp details, cycle comparison. This is where the depth lives — the user has time and context to reflect on the cycle as a whole. |

### 7.1 Period Onset & Active Flow Tracking

#### Period Start Confirmation
| Input | Format | Purpose |
|-------|--------|---------|
| Period started today | **One-tap confirmation** — prominent button: "My period started today" | Anchors the entire cycle; triggers phase recalculation; must be frictionless |
| Period start date | Auto-set to today on tap, or date picker for backdating | Allows correction if the user didn't log on Day 1 |
| Cycle length (auto-calculated) | Days since last period start | Trending cycle regularity/irregularity — irregular cycles are a key thyroid dysfunction indicator |
| Expected period date | Auto-predicted from recent cycle history | Enables proactive PMS tracking and alerts |

**Design rule:** Period start confirmation must be the single easiest interaction in the app. One tap. No forms. No follow-up questions blocking the confirmation. All detail questions come *after* the start is logged, and can be answered later.

#### Daily Flow Quick-Log (during active period — ~15 seconds)
These three fields are added to the morning check-in only during active period days. Three quick-taps, done.

| Input | Format | Purpose |
|-------|--------|---------|
| Flow heaviness | Quick-select: Spotting, Light, Moderate, Heavy, Flooding | Estrogen dominance indicator; heavy/flooding flow suggests excess estrogen or inadequate progesterone. Single field — no need for separate pad frequency, as heaviness captures the same signal. |
| Clots | Quick-select: None, Small (dime or less), Large (quarter+) | Simplified from 4 fields to 1. Size is the only dimension that drives iron depletion and estrogen dominance correlations. |
| Cramps | Quick-select: None, Mild, Moderate, Severe, Debilitating | Severity is the daily correlation driver. One tap. |

**Period ended confirmation:** One-tap "Period ended" button appears after Day 3. Anchors period duration.

**Clot significance flag:** When "Large (quarter+)" is logged, the app surfaces an educational notification: "Clots this size exceed what is considered physiologically typical. This often indicates excess estrogen relative to progesterone — which is directly connected to thyroid function. Worth mentioning to your provider."

**Clot + iron depletion correlation:** The intelligence layer connects heavy flow + large clots to the Iron Dysregulation Leg (Section 8.1). "Your flow has been heavy with large clots for the past 3 cycles. Heavy menstrual bleeding is the most common cause of iron depletion, and low iron directly impairs the enzymes your body needs to produce thyroid hormone. Have you had your ferritin checked recently?"

**Cramp intelligence:** When cramps are logged as "Severe" or "Debilitating" for 2+ cycles, trigger an educational alert: "Severe or worsening menstrual cramps can be a sign of endometriosis, fibroids, or adenomyosis — conditions that are common in women with Hashimoto's. If cramps are interfering with daily life, this is worth a dedicated conversation with your provider."

### 7.2 PMS Symptom Tracking

PMS is not one thing — it's a cluster of symptoms driven by the hormonal shifts in the 7-14 days before menstruation. For hypothyroid/Hashimoto's patients, PMS symptoms are often amplified because the estrogen-progesterone imbalance that drives PMS also directly suppresses thyroid function. Tracking PMS enables the intelligence layer to detect the estrogen dominance → thyroid suppression pathway in real time.

#### PMS Detection & Tracking Window
- **Auto-detection:** When the user is within 14 days of their predicted period start, PMS symptom chips are added to the evening check-in
- **User-initiated:** "I think my PMS is starting" one-tap button available anytime — this also improves the prediction model
- **PMS onset day tracking:** The app records when PMS symptoms first appear relative to expected period, trending this across cycles. PMS starting earlier than usual can indicate worsening estrogen dominance.

#### PMS Daily Quick-Log (~20 seconds, during PMS window only)
PMS symptoms are captured as **multi-select symptom chips** — the same UX pattern as the regular evening symptom chips. The user taps the ones that are present today. No sliders, no individual ratings. One interaction.

**PMS symptom chips:**
Breast tenderness, Mood crash, Anxiety spike, Irritability/rage, Depression, Crying spells, Bloating, Water retention, Headache/migraine, Food cravings, Insomnia, Acne breakout, Extra fatigue, Back pain, Digestive changes, Brain fog (worse than usual)

**One composite slider:** "How bad is your PMS today overall?" (0-10). This single slider, combined with which chips are selected, gives the intelligence layer everything it needs for daily correlation without asking for 17 individual ratings.

**PMS severity score:** The app auto-calculates a composite PMS severity score each cycle from daily chip selections + overall severity, enabling cross-cycle trending: "Your PMS severity this cycle was higher than your last 3 cycles — this may indicate worsening estrogen dominance."

**PMS duration tracking:** How many days before the period do symptoms start? Trends across cycles. Lengthening PMS windows are a warning sign: "Your PMS window has extended from 5 days to 10 days over the past 4 cycles. A longer PMS window can indicate increasing estrogen dominance."

### 7.2.1 End-of-Cycle Review (~2-3 minutes, once per cycle)

When the user confirms their period has ended, the app prompts an optional end-of-cycle review. This is where the detailed data lives — captured once per cycle with time to reflect, not shoehorned into daily check-ins.

| Input | Format | Purpose |
|-------|--------|---------|
| Overall cycle rating | 0-10 slider (0 = terrible, 10 = easy cycle) | Cross-cycle trending in one number |
| Worst day | Auto-suggested from daily logs, user confirms or adjusts | Anchors the peak severity day for correlation |
| Flow color (overall) | Quick-select: Mostly bright red, Mostly dark red, Mostly brown, Mixed | Hormonal context — brown/sluggish suggests low progesterone; watery suggests low estrogen |
| Cramp detail | Quick-select: Pre-period, Day 1-2 only, Throughout, After period | Timing reveals different drivers — pre-period suggests prostaglandin issues, post-period can indicate endometriosis |
| Cramp impact | Quick-select: No impact, Had to modify plans, Missed work/school, Bed-bound | Functional impact is the metric providers take most seriously |
| Cramp relief | Quick-select: Not needed, OTC meds helped, OTC meds didn't help, Prescription needed, Nothing helped | Treatment response trending — unresponsive cramps are clinically significant |
| Top PMS symptoms this cycle | Auto-populated from daily chips (most frequently selected); user confirms | Validates daily data; builds per-cycle PMS profile |
| Compared to last cycle | Quick-select: Much better, Somewhat better, About the same, Somewhat worse, Much worse | Subjective cycle-over-cycle comparison |
| Notes | Free text (optional) | "First cycle on new supplement," "Was traveling," "Extremely stressed this month" |

**Intelligence integration for end-of-cycle review:**
- Each symptom chip in the PMS quick-log carries its thyroid/hormonal connection for the intelligence layer (breast tenderness → estrogen dominance marker, anxiety spike → progesterone insufficiency, food cravings → insulin resistance Leg, insomnia → progesterone drop, etc.) — the user doesn't need to know this mapping, the system uses it automatically
- The end-of-cycle review generates a cycle summary card showing: cycle length, period duration, flow severity trend, PMS severity score, cramp impact, and comparison to previous cycles
- After 3+ cycles, the intelligence layer can identify cycle-over-cycle trends and surface alerts about worsening patterns

### 7.3 Ovulation Tracking
| Input | Format | Purpose |
|-------|--------|---------|
| Mittelschmerz (ovulation pain) | Yes/No + side (left/right) | Ovulation confirmation |
| Cervical mucus changes | Quick-select: Dry, Sticky, Creamy, Egg white, Watery | Ovulation window estimation |
| Basal temperature shift | Captured via morning BBT entry | Confirms ovulation, tracks luteal phase adequacy |
| Positive OPK | Yes/No (optional) | Additional ovulation data point |

**Anovulatory cycle detection:** If no ovulation markers are detected in a cycle, the intelligence layer flags it: "This cycle may have been anovulatory (no ovulation detected). Anovulatory cycles are common in hypothyroidism and Hashimoto's — without ovulation, progesterone is not produced in the luteal phase, which worsens estrogen dominance. If this pattern repeats, it's worth discussing with your provider."

### 7.4 Estrogen Dominance Symptom Cluster
The app tracks these as a unified cluster, recognizing that estrogen dominance can present differently:
| Symptom | Format | Notes |
|---------|--------|-------|
| Breast tenderness | 0-10 slider | Cyclic vs. constant pattern |
| Fibrocystic breast changes | Yes/No | User-reported |
| Weight gain (hips/thighs) | Trend tracking | Body composition changes |
| Water retention | Quick-tap: None, Mild, Moderate, Severe | Cyclic pattern tracking |
| Mood swings (premenstrual) | Severity slider | Luteal phase specific |
| Cyclic migraines | Yes/No + timing | Menstrual migraine pattern |
| Bloating | 0-10 slider | Cyclic pattern tracking |
| Premenstrual insomnia | Yes/No | Luteal phase sleep disruption |
| Luteal phase anxiety | 0-10 slider | Worsening in luteal phase is a key marker |
| Premenstrual irritability/rage | Severity slider | Distinct from general irritability |
| Low libido | 0-10 slider | Hormonal indicator |
| Fibroids (user-reported) | Yes/No (profile setting) | Context factor |
| Endometriosis (user-reported) | Yes/No (profile setting) | Context factor |

### 7.5 Pattern Recognition Logic
The app recognizes that estrogen dominance has **multiple presentations**:
- **Presentation A:** Heavy prolonged periods with large clots, breast tenderness, weight gain
- **Presentation B:** Irregular light periods, breast tenderness, worsening hypothyroid symptoms premenstrually
- **Presentation C:** Alternating between heavy and light, mood crashes, cyclic migraines

The key tracking insight is **change from the user's baseline** and **pattern inconsistency over time**, not any single presentation. The pattern detection engine (Section 8) uses this data for cycle-phase symptom mapping.

### 7.6 Spotting & Irregularity Tracking
| Input | Format | Purpose |
|-------|--------|---------|
| Spotting between periods | Yes/No | Pattern irregularity tracking |
| Spotting timing | Quick-select: Mid-cycle, Random, Post-intercourse, Continuous light | Different timings suggest different causes |
| Missed period | One-tap confirmation when period is 7+ days late | Cycle irregularity is a primary hypothyroid symptom |
| Cycle length variation | Auto-calculated and trended | Cycles varying by more than 7 days cycle-to-cycle suggest hormonal instability |

---

## 8. Intelligence Layer — Pattern Detection & Agentic Workflows

This is the product's core differentiator. While other apps track symptoms in isolation, IgniteHealthNow connects them through the metabolic framework from the book.

### 8.1 The Four Legs of the Table — Destabilization Detection

Each "Leg" represents a metabolic system that, when dysfunctional, destabilizes thyroid function. The intelligence layer monitors symptom clusters and lab values to flag when a Leg appears compromised.

#### Leg 1: Insulin Resistance Detection
**Lab markers:** Fasting insulin > 8, HbA1c > 5.3, TG:HDL ratio > 1.5
**Symptom markers:** Afternoon energy crashes, sugar/carb cravings, weight gain (especially abdominal), difficulty losing weight despite effort, brain fog worse after meals, fatigue worse after eating
**Pattern trigger:** When 3+ symptom markers co-occur over 7+ days, OR lab markers are in functional concern range, flag insulin resistance as a potential destabilizer.
**Educational content:** Explain the insulin resistance → inflammation → deiodinase suppression pathway — how insulin resistance reduces the conversion of T4 to active T3 at the cellular level.

#### Leg 2: Iron Dysregulation Detection
**Lab markers:** Ferritin < 50 (or > 150 with inflammation markers), iron saturation < 25% or > 45%
**Symptom markers:** Fatigue disproportionate to sleep quality, hair shedding (diffuse, not patchy), restless legs, shortness of breath on exertion, exercise intolerance, dizziness, cold extremities, palpitations
**Pattern trigger:** When fatigue + hair shedding + exercise intolerance co-occur, OR ferritin is within the conventional reference range but below functional optimal (12-50), flag iron dysregulation.
**Educational content:** Explain that iron is a cofactor for thyroid peroxidase (TPO) — the enzyme that makes thyroid hormone — and for deiodinase enzymes that convert T4 to T3. Ferritin within the conventional range can still mean insufficient iron for optimal thyroid function — this is a prime example of why conventional ranges fail patients. A ferritin of 28 is "normal" by lab standards, but functional medicine practitioners consistently observe that patients don't feel well until ferritin reaches 50+.

#### Leg 3: Homocysteine Elevation Detection
**Lab markers:** Homocysteine > 8, B12 < 500, folate < 15
**Symptom markers:** Brain fog, poor concentration, fatigue, depression, anxiety, numbness/tingling, memory issues
**Pattern trigger:** When cognitive symptoms dominate (brain fog + concentration + memory) with or without elevated homocysteine labs.
**Educational content:** Explain the methylation connection — elevated homocysteine indicates impaired methylation, which affects neurotransmitter production, detoxification, and thyroid hormone metabolism. B12 and folate are critical cofactors.

#### Leg 4: Liver Dysfunction Detection
**Lab markers:** ALT > 26, AST > 26, GGT > 30, poor lipid ratios
**Symptom markers:** Difficulty tolerating supplements/medications, chemical sensitivity, skin issues (acne, rashes), digestive symptoms (bloating, nausea, fat intolerance), estrogen dominance symptoms, recurrent yeast/candida signs
**Pattern trigger:** When liver labs are elevated OR the user shows both digestive symptoms and estrogen dominance symptoms, flag liver dysfunction as the bridge (see Section 8.4).
**Educational content:** Explain the liver as the metabolic clearing house — it conjugates and clears estrogen, converts T4 to T3, and metabolizes medications. When the liver is compromised, everything downstream suffers.

#### Candida/Yeast Overgrowth Pattern Detection
**Symptom markers:** Recurrent yeast/candida signs chip selections — vaginal yeast infections, oral thrush, angular cheilitis (cracked mouth corners), white-coated tongue, mucus in stool, fungal skin rashes, nail fungus, persistent itching
**Pattern trigger:** When yeast/candida signs are logged 3+ times in 30 days, OR multiple presentation types co-occur (e.g., oral thrush + vaginal yeast + mucus in stool), flag candida overgrowth as a pattern.
**Thyroid connection:** Hypothyroidism slows gut motility and reduces stomach acid production, creating conditions where candida thrives. Hashimoto's immune dysregulation — where the immune system is simultaneously overactive (attacking the thyroid) and underperforming (failing to keep opportunistic organisms in check) — allows candida to overgrow. Candida overgrowth in turn damages the gut lining (intestinal permeability / "leaky gut"), increasing systemic inflammation and worsening autoimmune activity. It's another bidirectional cycle.
**Educational content:** "You've logged yeast/candida signs [X] times this month. Recurrent candida is common in hypothyroidism and Hashimoto's — low thyroid function slows the gut and weakens immune surveillance, creating conditions where yeast overgrows. In turn, candida damages the gut lining, increasing inflammation that worsens autoimmune thyroid activity. This is worth discussing with your provider — addressing gut health and candida can have a meaningful impact on thyroid function."
**Cross-correlations tracked:**
- Candida signs + sugar/processed food intake (from food journal and evening dietary chips) — sugar feeds candida
- Candida signs + antibiotic use (from medication tracking) — antibiotics disrupt gut flora and promote yeast overgrowth
- Candida signs + stress levels — cortisol suppresses immune function, enabling candida
- Candida signs + liver dysfunction markers — compromised liver can't adequately support immune function
- Candida signs + bloating severity — gut candida directly causes bloating, gas, and digestive distress

#### SIBO Pattern Detection
**Symptom markers:** Recurrent SIBO signs chip selections — excessive bloating/distension after eating, excessive gas, abdominal pain after meals, diarrhea, constipation (methane-dominant), alternating diarrhea and constipation, early satiety, nausea after eating, floating/greasy stools (fat malabsorption)
**Pattern trigger:** When SIBO signs are logged 3+ times in 14 days, OR when post-meal bloating is consistently severe (bloating > 6 with timing = "After meals" from the bloating correlation engine), flag SIBO as a possible pattern.
**Thyroid connection:** Hypothyroidism slows gut motility through reduced metabolic rate — the migrating motor complex (MMC), which sweeps bacteria out of the small intestine between meals, becomes sluggish. When the MMC underperforms, bacteria from the colon migrate upward into the small intestine where they don't belong. These bacteria ferment food prematurely, producing hydrogen or methane gas that causes the bloating, distension, and pain. SIBO also damages the small intestinal lining, causing malabsorption of the nutrients the thyroid depends on — iron, B12, fat-soluble vitamins (D, A, E, K), selenium, and zinc. It's a vicious cycle: low thyroid → slow gut → SIBO → nutrient depletion → worse thyroid function.
**Educational content:** "You've been logging digestive symptoms consistent with SIBO — especially bloating and distension after meals. SIBO is common in hypothyroidism because low thyroid function slows gut motility, allowing bacteria to overgrow in the small intestine. These bacteria ferment your food before you can absorb the nutrients, which can worsen the very nutrient deficiencies that impair thyroid function. A hydrogen/methane breath test can confirm SIBO — this is worth discussing with your provider."
**Cross-correlations tracked:**
- SIBO signs + post-meal bloating severity and timing — the hallmark of SIBO is bloating that worsens *after eating*, often within 30-90 minutes
- SIBO signs + food types — high-FODMAP foods, fiber, and fermentable carbs often worsen SIBO symptoms; the app can identify which foods trigger the worst post-meal reactions
- SIBO signs + constipation patterns — persistent constipation that doesn't respond to fiber may indicate methane-dominant SIBO (methane slows gut transit)
- SIBO signs + nutrient deficiency labs — low B12, low iron, low vitamin D alongside SIBO symptoms strengthens the pattern (SIBO causes malabsorption)
- SIBO signs + candida signs — frequent co-occurrence; both driven by slow gut motility and immune dysfunction; both damage the gut lining
- SIBO signs + meal timing — symptoms often worsen with frequent eating (more fermentation substrate) and improve with fasting or meal spacing

**SIBO vs. Candida differentiation:** When both chips are being selected frequently, the app notes: "You're logging both SIBO and candida signs. These conditions frequently co-occur in Hashimoto's patients because they share the same root driver — slow gut motility and immune dysregulation. They require different testing and treatment, so it's important to evaluate for both. SIBO is typically tested with a breath test; candida through stool analysis or clinical evaluation."

### 8.2 Vicious Cycle Alert System

When a user's pattern matches a known feedback loop from the book's framework, surface an educational alert. These are not alarms — they are "here's what might be happening" explanations.

**Example vicious cycles:**

**Cycle A: Insulin Resistance → Thyroid Suppression Loop**
Trigger: Worsening fatigue + rising fasting insulin + increased brain fog + weight gain
Alert: "Your pattern over the past [X] weeks shows increasing fatigue, brain fog, and weight gain alongside elevated fasting insulin. In the book's framework, insulin resistance drives chronic inflammation, which suppresses the deiodinase enzymes that convert T4 to active T3. Less T3 means slower metabolism, which worsens insulin resistance — creating a cycle. Chapter [X] covers strategies for breaking this loop."

**Cycle B: Estrogen Dominance → Free Hormone Suppression**
Trigger: Worsening hypothyroid symptoms premenstrually + breast tenderness + E2:P4 ratio climbing
Alert: "Your worst symptom days are clustering in the luteal phase, and your estrogen dominance markers are trending up. Excess estrogen increases thyroid-binding globulin (TBG), which binds more circulating thyroid hormone, reducing the free T4 and T3 available to your cells — effectively worsening cellular hypothyroidism even when total hormone levels look adequate on labs."

**Cycle C: Liver-Estrogen-Thyroid Triangle**
Trigger: Liver markers elevated + estrogen dominance symptoms + worsening thyroid symptoms
Alert: "Your liver markers and estrogen dominance symptoms may be connected. The liver is responsible for conjugating and clearing estrogen. When liver function is compromised, estrogen clearance slows, dominance worsens, TBG rises, and free thyroid hormone drops. This connects two of the Four Legs — liver dysfunction and estrogen dominance — in a single pathway."

**Cycle D: Iron Depletion → Thyroid Production Failure**
Trigger: Falling ferritin trend + increasing fatigue + hair shedding + heavy menstrual flow
Alert: "Heavy periods deplete iron, and low iron impairs thyroid hormone production (iron is needed by TPO enzyme) — which can worsen fatigue and hair loss. Meanwhile, thyroid dysfunction can cause heavy periods, depleting iron further. Your pattern suggests this cycle may be active."

**Cycle E: Estrogen-Inflammation-Autoimmune Loop**
Trigger: Estrogen dominance symptoms + rising TPO antibodies + Hashimoto's flare pattern
Alert: "Estrogen dominance symptoms are correlating with rising TPO antibodies. Poor estrogen metabolism — particularly when the body favors the 4-OH and 16a-OH pathways over the protective 2-OH pathway — drives inflammation that worsens autoimmune activity, which worsens thyroid function, which further impairs liver metabolism of estrogen."

### 8.3 Bloating & Weight Correlation Engine

Bloating and weight gain are not just symptoms — they are among the most emotionally distressing daily experiences for hypothyroid/Hashimoto's patients. How someone feels in their body and how their body looks can be a major stress point that itself worsens the underlying condition. The intelligence layer treats bloating and weight as first-class correlation targets, building connections across every lifestyle input the user captures.

#### Correlation Axes
The engine cross-references bloating severity and body composition against:

| Correlation Axis | Data Source | What It Reveals |
|-----------------|------------|-----------------|
| **Food → Bloating** | Food photo journal tags + bloating conditional chips + bloating timing | Which specific foods or food categories consistently precede bloating. "Your bloating severity averages 7.2 on days you eat gluten vs. 3.1 on gluten-free days." |
| **Meal Timing → Bloating** | Meal timing capture + bloating timing | Whether skipped meals, late eating, or fasting patterns correlate with bloating. "Your bloating is 40% worse on days you skip breakfast." |
| **Stress → Bloating** | Stress level (0-10) + anxiety level + bloating severity | The gut-brain axis — stress directly impairs gut motility and increases intestinal permeability. "On days your stress exceeds 7, your evening bloating averages 6.8 vs. 3.4 on lower-stress days." |
| **Sleep → Bloating/Weight** | Sleep quality + refreshed rating + bloating + body feeling | Poor sleep drives cortisol, which drives insulin, which drives abdominal fat storage and fluid retention. "After nights with sleep quality below 4, your next-day bloating is 2.1 points higher on average." |
| **Exercise → Bloating/Weight** | Exercise type + duration + bloating + body feeling | Both the benefit of movement and the risk of overexercise (which raises cortisol in hypothyroid patients). "Light exercise days correlate with your lowest bloating scores. Intense exercise days show higher bloating the following day." |
| **Cycle Phase → Bloating** | Cycle day + phase + bloating severity + water retention | Hormonal bloating patterns — luteal phase fluid retention, estrogen-driven gut motility changes. "Your bloating averages 5.8 in the luteal phase vs. 2.9 in the follicular phase." |
| **Medication Changes → Weight** | Medication change events + weight trend + body feeling trend | Before/after analysis of body composition when medications change. "In the 6 weeks since your levothyroxine increase, your 'heavier than usual' body feeling reports dropped from 80% to 30% of days." |
| **Cumulative Lifestyle → Weight Trend** | All inputs aggregated weekly | Weekly digest connecting dietary patterns, stress averages, exercise frequency, and sleep quality to weight and body composition trends. "Weeks where you average 7+ hours sleep, exercise 3+ times, and keep stress below 5 are correlated with your most comfortable body feeling scores." |

#### Correlation Outputs
- **Daily insight cards:** "Your bloating today was a 7. Looking at the last 30 days, your highest bloating days share these patterns: [gluten intake, stress > 6, poor sleep the night before]."
- **Weekly digest:** "This week your bloating averaged 5.2 (down from 6.8 last week). Changes this week: you eliminated dairy and added evening walks."
- **Trigger identification:** After 30+ days of data, surface the user's top 3 bloating/weight triggers: "Based on your patterns, your strongest bloating correlations are: (1) Gluten intake, (2) Stress above 6, (3) Skipped meals."
- **Positive reinforcement:** "On days you eat high-protein meals and walk for 20+ minutes, your bloating averages 2.3 — your lowest pattern."
- **Cause and effect timeline:** Visual timeline showing food/stress/exercise inputs on top and bloating/body feeling on bottom, so the user can *see* the relationship between what they do and how their body responds.

#### The Distress Cycle
The engine also tracks the emotional impact of body changes, because the distress itself is a clinical factor:

Bloating/weight gain → emotional distress → elevated cortisol → worsened insulin resistance → more abdominal fat storage → more bloating → more distress

When the app detects this pattern (rising bloating + rising body distress scores + rising stress), it surfaces an educational alert: "Your body distress is understandable — but the stress it causes can make the cycle worse. Cortisol from emotional stress promotes abdominal fat storage and impairs gut function, which increases bloating. This isn't about willpower — it's a physiological loop. Here are strategies from Chapter [X] for interrupting it."

### 8.4 Estrogen Dominance → Thyroid Suppression Pathway

This is a first-class intelligence feature, not buried in general pattern detection.

**Cycle-Phase Symptom Mapping:**
Overlay hypothyroid symptom severity against menstrual cycle phase to reveal:
- **Luteal phase clustering** → suggests progesterone insufficiency / estrogen dominance as the amplifier
- **Distributed throughout cycle** → suggests thyroid dysfunction is the primary driver
- **Mixed pattern** → both drivers may be active

**The mapping logic recognizes** that light irregular cycles with breast tenderness and worsening brain fog premenstrually = potentially the same underlying driver as flooding periods with large clots and luteal phase depression. Different presentations, same metabolic root.

**Liver Function as the Bridge:**
When a user shows both liver-related markers (elevated enzymes, poor lipid ratios, supplement intolerance) AND estrogen dominance symptoms, surface the liver connection: the liver conjugates and clears estrogen → compromised liver → estrogen clearance slows → dominance worsens → TBG rises → free thyroid hormone drops.

**Progesterone-Thyroid Relationship:**
When progesterone labs are available, flag low progesterone relative to estradiol and explain: progesterone supports thyroid function, opposes estrogen's TBG-raising effect, and has anti-inflammatory properties relevant to Hashimoto's management.

### 8.5 Additional Intelligence Features

**Medication Timing Correlation:**
Track whether symptoms shift based on:
- When thyroid medication is taken
- What it's taken with (coffee, calcium, iron, food)
- Time gap before food/supplements
Surface: "Your fatigue ratings are 1.5 points better on days when you take levothyroxine 60+ minutes before coffee vs. 30 minutes."

**Conversion Efficiency Tracking:**
When labs are available, calculate and trend:
- FT4:FT3 ratio over time (poor conversion = T4 pooling, T3 deficient)
- FT3:rT3 ratio using formula: (FT3 pg/mL x 100) / rT3 ng/dL. Values < 20 suggest conversion issues or excessive reverse T3 production.

**Lifestyle-Symptom Correlation:**
Surface connections the user might not notice:
- "Your energy is 2 points higher on days you eat 80g+ protein"
- "Brain fog severity increases by 40% in the 3 days after gluten consumption"
- "Your sleep quality drops an average of 1.8 points on days with alcohol"

**Flare Pattern Recognition:**
Identify what precedes symptom worsening:
- Stress events → 2-3 day lag → symptom spike
- Dietary changes → specific food → symptom onset window
- Missed supplements → symptom worsening timeline
- Menstrual cycle phase → predictable symptom windows

**Xenoestrogen Exposure Scoring:**
Based on lifestyle inputs, generate a simple awareness score:
- Frequency of plastic use, conventional personal care products, non-organic produce
- Not a precise measurement but a behavior awareness tool
- Educational content about modifiable environmental contributors to estrogen load

### 8.6 Agentic Workflow Architecture

The intelligence layer is powered by agentic workflows — autonomous AI processes that analyze user data and generate insights without manual triggers.

#### Agent Types

**Pattern Analysis Agent (runs nightly)**
- Analyzes the day's journal entries against historical data
- Identifies emerging symptom clusters
- Detects correlations between lifestyle inputs and symptom changes
- Updates the user's Four Legs risk assessment
- Generates micro-insights for the next morning's dashboard

**Vicious Cycle Detection Agent (runs weekly)**
- Evaluates multi-week trends across all data domains
- Matches patterns against the book's vicious cycle frameworks
- Generates cycle alerts with confidence scores
- Requires minimum data threshold before firing (prevents false positives during onboarding)

**Lab Interpretation Agent (triggered on lab entry)**
- Evaluates new lab values against functional ranges
- Calculates derived ratios
- Maps results to the Four Legs framework
- Generates "suggested next labs" recommendations
- Produces educational content tied to the user's specific results

**Visual Analysis Agent (ROADMAP — not day one; runs weekly on photo timeline)**
- North star feature; photo capture and metadata collection begin at launch to build the dataset this agent requires
- When shipped: Compares recent photos against baseline and historical timeline
- Detects gradual changes in facial puffiness, hair density, skin tone, eyebrow thickness, nail condition, body composition
- Generates change alerts with side-by-side comparison images
- Correlates visible changes with symptom trends, lab values, and medication changes
- Flags concerning patterns for provider discussion (never diagnoses)
- Tracks positive changes as reinforcement (e.g., "Facial puffiness reduced since medication adjustment")
- Requires minimum 14-day photo history before generating first analysis
- See Section 4.4 for full data capture requirements that enable this agent

**Report Generation Agent (triggered on demand or scheduled)**
- Compiles symptom trends, lab values, medication timeline, and visual documentation into doctor visit report
- Formats with clinical language and standard + functional ranges
- Generates specific questions for the user to ask their provider
- Cycle-maps symptoms for female patients
- Includes photo comparison timelines when patient opts in

**Notification Agent (event-driven)**
- Medication timing reminders based on user patterns
- Symptom journaling prompts at optimal times
- Insight delivery when patterns reach statistical significance
- Flare prediction warnings when precursor patterns are detected

**Research Analytics Agent (runs on anonymized data pool)**
- Cohort analysis across anonymized user base
- Trend detection for population-level patterns
- Generates aggregate insights (e.g., "42% of users with your FT3:rT3 ratio also report brain fog")
- Feeds the provider portal dashboards

---

## 9. Doctor Visit Preparation & Reports

### 9.1 One-Page Summary Report
Generated on demand, designed to be brought to appointments (printed or shared digitally):

**Report Structure:**
1. **Patient Summary Header** — Display name (anonymized), tracking duration, primary concerns
2. **Symptom Trend Dashboard** — Top 5 symptoms by frequency/severity, trended over the reporting period, with sparkline graphs
3. **Lab Values with Dual Ranges** — Most recent results with both standard and functional ranges displayed, color-coded, Four Legs mapping visible
4. **Auto-Calculated Ratios** — FT3:rT3, TG:HDL, E2:P4 with trending arrows
5. **Medication & Supplement Timeline** — Current regimen, adherence data, timing details, absorption interference flags
6. **Cycle-Mapped Symptom Summary** (female patients) — Shows exactly when in the cycle hypothyroid symptoms worsen, with pattern classification (luteal-dominant vs. cycle-distributed)
7. **Visual Health Timeline** (patient opt-in) — Side-by-side photo comparisons showing visible changes over the reporting period: facial puffiness trends, hair density changes, eyebrow thinning, skin/nail condition. Provides the provider with visual evidence that complements the subjective symptom data — "This is what the patient looked like 3 months ago vs. today."
8. **Four Legs Assessment** — Visual indicator of which metabolic pillars show concern, based on available data
9. **Suggested Discussion Points** — Collaboratively framed questions: "Based on my tracked patterns, I'd like to discuss..." (not confrontational)
10. **Suggested Labs** — If gaps exist in testing, list recommended labs with brief rationale

### 9.2 Language and Framing
- Clinical but collaborative: "My tracked data shows..." not "My app says I have..."
- Standard + functional ranges always presented together
- Framed as "information for discussion" not "demands for treatment"
- Educational context available as expandable footnotes for providers who want to understand the functional range rationale

### 9.3 Report Formats
- **PDF export** for printing or emailing
- **Shareable link** (encrypted, time-limited) for provider portal integration
- **In-app view** for quick reference during appointments

---

## 10. Chat Agent — Patient Advocacy Companion

### 10.1 Purpose
The chat agent is a conversational AI that helps patients advocate for themselves — not by diagnosing or prescribing, but by helping them understand their data, prepare for appointments, and ask informed questions.

### 10.2 Capabilities
- **Data interpretation:** "What does my FT3:rT3 ratio of 15 mean?" → Educational explanation grounded in the book's framework and the user's specific lab context
- **Appointment preparation:** "I'm seeing my endocrinologist next week — what should I ask about?" → Generates personalized questions based on the user's tracked patterns and lab gaps
- **Pattern explanation:** "Why am I feeling worse this week?" → Analyzes recent journal data against historical patterns, identifies potential contributors
- **Educational Q&A:** "What's the connection between my liver enzymes and my thyroid?" → Explains the Four Legs framework with the user's specific data as context
- **Lab request guidance:** "What labs should I ask for?" → Based on what's been tested and what hasn't, suggests a prioritized lab request list with rationale
- **Medication timing guidance:** "When should I take my levothyroxine relative to my supplements?" → Evidence-based timing guidance personalized to their supplement stack

### 10.3 Boundaries (Hard Rules)
- **Never diagnoses:** "Based on your data, this pattern is sometimes associated with..." not "You have..."
- **Never prescribes:** Discusses what labs to request, never recommends medications or dosage changes
- **Never overrides providers:** "This is worth discussing with your provider" is the standard closing for clinical questions
- **Always cites framework:** Responses reference the book's concepts, not general medical advice
- **Transparent about limitations:** "I can help you understand patterns in your data, but I'm not a substitute for medical evaluation"

### 10.4 Data Access
The chat agent has read access to:
- Full journal history
- All lab results and calculated ratios
- Pattern detection outputs and alerts
- Medication/supplement records
- Visual health photo timeline and AI analysis results
- Cycle tracking data

It uses this data to ground its responses in the user's specific situation, making its guidance personalized rather than generic.

### 10.5 Technical Interface
- LLM backend (specific provider to be determined)
- RAG (Retrieval-Augmented Generation) architecture pulling from:
  - User's personal health data (encrypted, session-scoped)
  - Book content knowledge base (chapter concepts, frameworks, educational content)
  - Lab reference ranges and interpretation guides
- Conversation history retained within sessions, summarized across sessions
- User can flag conversations as "appointment prep" to auto-include relevant points in the next doctor visit report

---

## 11. Provider Portal

### 11.1 Purpose
A web-based dashboard where healthcare providers can view patient-shared data. Patients maintain full control over what is shared and can revoke access at any time.

### 11.2 Patient-Controlled Sharing
- **Explicit opt-in:** Patient initiates sharing by generating a provider link or invite code
- **Granular permissions:** Patient can share all data, specific date ranges, specific data types (labs only, symptoms only, full journal)
- **Revocable:** Patient can revoke provider access instantly
- **Time-limited option:** Sharing can be set to expire after a specific date (e.g., "share through my appointment on March 20th")
- **Audit trail:** Patient can see exactly when their provider accessed their data and what was viewed

### 11.3 Provider Dashboard
- **Patient summary view:** Same report structure as the doctor visit report (Section 9) but interactive
- **Trend visualization:** Interactive charts for symptom severity, lab values, medication adherence over time
- **Four Legs overview:** Visual assessment of which metabolic pillars show concern for this patient
- **Cycle-symptom overlay:** For female patients, interactive cycle-phase symptom mapping
- **Lab history:** Complete lab timeline with dual-range display (standard + functional)
- **Compare views:** Side-by-side comparison of different time periods

### 11.4 Provider Features
- **Notes capability:** Provider can add notes visible only to themselves (not shared back to patient)
- **Lab ordering suggestions:** Based on the patient's data gaps, the portal highlights which labs might provide additional clinical insight
- **Multi-patient view:** Providers with multiple IgniteHealthNow patients can see an overview dashboard
- **Export:** Ability to export patient reports as PDF or structured data for EHR integration (future)

---

## 12. Research & Analytics Layer

### 12.1 Purpose
Enable anonymized, aggregated data analysis that advances understanding of hypothyroidism patterns at a population level — while maintaining absolute individual privacy.

### 12.2 Anonymization Protocol
- All research data is fully anonymized — no display names, no dates of birth, no location data
- Data is aggregated into cohorts (minimum cohort size: 50 users) before analysis
- Individual records are never accessible through the research layer
- Differential privacy techniques applied to prevent re-identification
- Users explicitly consent to anonymized data contribution (opt-in, not opt-out)

### 12.3 Research Capabilities
**Population-Level Pattern Detection:**
- "What percentage of users with FT3:rT3 ratio < 20 report brain fog?" → Cohort analysis
- "Is there a correlation between ferritin levels and hair shedding severity across the user base?" → Population correlation
- "Do users who track cycle-phase symptom worsening also show higher TPO antibodies?" → Cross-domain analysis

**Trend Analysis:**
- Seasonal patterns in symptom severity across the user base
- Medication timing patterns and their population-level correlation with symptom improvement
- Dietary pattern correlations with lab value trends

**Aggregate Insights for Users:**
- "42% of users with your FT3:rT3 ratio also report brain fog"
- "Users with similar ferritin levels who added iron supplementation saw an average 30% reduction in fatigue over 90 days"
- Always presented as population statistics, never as personalized medical advice

### 12.4 Research Dashboards
- **Admin dashboards** for the IgniteHealthNow team to monitor population trends, identify research opportunities, and generate cohort reports
- **Anonymized data export** capability for approved research partnerships
- **Agentic research workflows** that autonomously identify statistically significant patterns and flag them for human review

---

## 13. Data Model

### 13.1 Core Entities

```
User
├── Profile (anonymized display name, encrypted PII)
├── Health Profile (allergies, blood type, relevant history)
├── Diagnoses (1:many)
│   ├── Diagnosis Name
│   ├── Category (thyroid, autoimmune, metabolic, hormonal, nutritional, other)
│   ├── Diagnosing Provider (optional)
│   ├── Date of Diagnosis
│   ├── Status (active, resolved, under_review, suspected_self)
│   ├── Linked Lab Results (0:many)
│   ├── Linked Prescriptions (0:many)
│   └── Notes
├── Medications & Supplements (1:many)
│   ├── Name
│   ├── Type (prescription, otc, supplement)
│   ├── Dosage + Unit
│   ├── Frequency
│   ├── Timing Instructions
│   ├── Prescribing Provider (optional)
│   ├── Linked Diagnosis (optional)
│   ├── Status (active, discontinued, paused)
│   └── Change History (1:many)
│       ├── Event Type (started, dosage_change, switched, discontinued)
│       ├── Date
│       ├── Old Value → New Value
│       ├── Reason
│       └── Monitoring Window End Date (auto-set: date + 6 weeks)
├── Cycle Settings (tracking enabled, typical cycle length, current status)
│
├── Journal Entries (1:many)
│   ├── Morning Check-in
│   │   ├── Sleep Data (duration, quality, wakings, BBT, refreshed rating)
│   │   ├── Body State (energy, brain fog, pain, cold intolerance, mood)
│   │   ├── Medication Log (taken, timing, interactions)
│   │   └── Visual Health Photos (0:many)
│   │       ├── Photo (encrypted, on-device primary, optional cloud backup)
│   │       ├── Photo Type (face_front, face_profile, eyebrows, hair, nails, body, targeted)
│   │       ├── Timestamp
│   │       ├── Capture Metadata (device orientation, ambient light, distance estimate, silhouette alignment score)
│   │       ├── User Self-Assessment Tag (optional: typical_for_me, more_puffy, less_puffy, unsure, etc.)
│   │       ├── Is Baseline (boolean, first 7 days flagged true)
│   │       ├── Linked Journal Entry ID (same-day symptom/lab context)
│   │       ├── Linked Cycle Day (if tracking)
│   │       └── AI Analysis Results (future: change detections, comparisons, flags)
│   │   └── Context (hunger, hydration, notes)
│   ├── Evening Check-in
│   │   ├── Energy Review (pattern, rating, brain fog trajectory, concentration)
│   │   ├── Symptom Log (chips selected, severity ratings)
│   │   ├── Mood & Stress (mood, anxiety, stress, irritability, motivation)
│   │   ├── Lifestyle Inputs (diet, exercise, stress events, xenoestrogen)
│   │   └── Sleep Prep (readiness, caffeine, screen time)
│   └── Food Journal Entries (0:many per day)
│       ├── Photo (encrypted, on-device primary)
│       ├── Timestamp
│       ├── Category (meal, snack, supplement, beverage, medication)
│       ├── Thyroid Tags (protein, selenium, cruciferous, gluten, dairy, etc.)
│       ├── AI Recognition Result (tier, confidence, nutrition data)
│       └── Medication Timing Flag (if near thyroid medication)
│
├── Lab Results (1:many)
│   ├── Test Date
│   ├── Marker Values (with units)
│   ├── Auto-Calculated Ratios
│   ├── Functional Range Flags
│   ├── Four Legs Mapping
│   └── Provider/Lab Source (optional)
│
├── Cycle Entries (1:many, daily when tracking)
│   ├── Cycle Day (auto-calculated)
│   ├── Flow Data (status, heaviness, clots)
│   ├── Ovulation Signs (mittelschmerz, CM, temp shift, OPK)
│   ├── Estrogen Dominance Symptoms (cluster tracking)
│   └── PMS Window Symptoms
│
├── Pattern Detections (1:many, system-generated)
│   ├── Pattern Type (four_legs, vicious_cycle, estrogen_pathway, medication, lifestyle, flare)
│   ├── Confidence Score
│   ├── Supporting Data Points (references to journal/lab entries)
│   ├── Educational Content Reference (book chapter)
│   ├── Status (new, viewed, acknowledged, dismissed)
│   └── Timestamp
│
├── Provider Shares (0:many)
│   ├── Provider ID
│   ├── Permissions (data types, date range)
│   ├── Expiration
│   ├── Access Log
│   └── Status (active, revoked, expired)
│
├── Reports (1:many, generated)
│   ├── Report Type (doctor_visit, lab_summary, cycle_summary)
│   ├── Generated Date
│   ├── Content (structured data + rendered output)
│   └── Share Status
│
└── Chat Sessions (0:many)
    ├── Session ID
    ├── Messages (with role: user/assistant)
    ├── Data References (which user data was accessed)
    ├── Appointment Prep Flag
    └── Summary (for cross-session context)
```

### 13.2 Relational vs. Document Storage Recommendation

**Supabase (PostgreSQL) — Primary Data Store:**
- User profiles and health profiles
- Journal entries (structured, relational, needs querying for pattern detection)
- Lab results (highly structured, needs aggregation queries)
- Cycle tracking data (relational, needs time-series queries)
- Pattern detections (relational, references other records)
- Provider shares and access logs (relational with audit requirements)
- Reports (structured metadata, generated content)
- Research analytics views (aggregated, anonymized)

**Why PostgreSQL for core data:** The pattern detection engine needs to run complex queries across multiple data domains simultaneously — "find all days where energy < 4 AND brain fog > 6 AND cycle day is 21-28 AND ferritin was last measured below 50." This is inherently relational work. Supabase's Row Level Security (RLS) also provides a natural HIPAA-informed access control layer.

**Firebase — Real-Time & Auxiliary Services:**
- **Firestore:** Chat agent conversation history (document model fits conversation structure), real-time notification state, user session data
- **Firebase Auth:** Authentication (integrate with Supabase via JWT), social login if needed
- **Firebase Cloud Messaging:** Push notifications (medication reminders, insight alerts, flare warnings)
- **Firebase Storage:** Photo storage (encrypted, with Supabase metadata reference)

**Why this split:** Supabase handles the health intelligence workload where relational queries are critical. Firebase handles the real-time, event-driven, and binary storage workloads where its strengths lie. This avoids forcing either system into a role it's not optimized for.

---

## 14. Technical Architecture

### 14.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Flutter App  │    │  Next.js Web │    │  Provider Portal │   │
│  │  (iOS/Android)│    │  (Patient)   │    │  (Next.js)       │   │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘   │
│         │                   │                      │             │
└─────────┼───────────────────┼──────────────────────┼─────────────┘
          │                   │                      │
          ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     UNIFIED API LAYER                            │
│              (Google Cloud Functions / Cloud Run)                 │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Journal    │  │  Labs      │  │  Reports   │  │  Auth    │  │
│  │  Service    │  │  Service   │  │  Service   │  │  Service │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Chat      │  │  Provider  │  │  Research  │  │  Photo   │  │
│  │  Service   │  │  Service   │  │  Service   │  │  Service │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Supabase    │  │  Firebase    │  │  Google Cloud     │
│  (PostgreSQL)│  │  (Firestore, │  │  (Pub/Sub,        │
│              │  │   Auth, FCM, │  │   Cloud Functions, │
│  Core health │  │   Storage)   │  │   Secret Manager,  │
│  data, labs, │  │              │  │   Cloud Tasks,     │
│  patterns,   │  │  Chat, auth, │  │   AI Platform)     │
│  research    │  │  photos,     │  │                    │
│              │  │  real-time   │  │  Agentic workflows,│
│              │  │              │  │  scheduling,       │
│              │  │              │  │  LLM integration   │
└──────────────┘  └──────────────┘  └──────────────────┘
```

### 14.2 Platform Recommendation: Flutter

**Recommendation:** Flutter for mobile, confirming the existing project direction.

**Rationale:**
- **Existing work:** Flutter project already started with HIPAA-informed architecture (anonymized profiles, encrypted fields)
- **Performance:** Flutter's compiled-to-native approach provides better performance for the real-time data visualization and charting this app requires
- **UI consistency:** Custom health tracking UI (sliders, body maps, cycle charts) renders identically on iOS and Android — important for a health app where visual consistency matters for clinical credibility
- **Single codebase potential:** Flutter Web is maturing and could eventually serve the patient-facing web app, reducing the need for a separate Next.js patient app (though Next.js is the right choice for the provider portal where SEO and server-side rendering matter)
- **Dart's type system:** Strong typing helps prevent data integrity issues in a health data application

**Next.js for web:** Used for:
- Provider portal (SSR for initial load performance, SEO for discoverability)
- Patient web app (for users who prefer browser-based access)
- Marketing/landing pages
- Admin/research dashboards

### 14.3 Unified API Design

**Approach:** RESTful API deployed as Google Cloud Functions (or Cloud Run for services that need persistent connections like chat).

**Key principles:**
- **Stateless functions** for journal CRUD, lab entry, report generation
- **Cloud Run** for the chat agent (needs WebSocket or SSE for streaming responses)
- **Pub/Sub** for async event processing (pattern detection triggers, notification dispatch, research data pipeline)
- **Cloud Tasks** for scheduled agentic workflows (nightly pattern analysis, weekly vicious cycle detection)

**API structure:**
```
/api/v1/
├── /auth          — Authentication endpoints
├── /journal       — Daily check-in CRUD
│   ├── /morning   — Morning check-in
│   ├── /evening   — Evening check-in
│   └── /food      — Photo food journal entries
├── /labs          — Lab result CRUD, ratio calculations
├── /cycle         — Menstrual/cycle tracking
├── /patterns      — Pattern detection results (read), manual trigger
├── /reports       — Report generation and retrieval
├── /chat          — Chat agent sessions (Cloud Run)
├── /provider      — Provider portal endpoints
│   ├── /share     — Patient sharing management
│   └── /dashboard — Provider data access
├── /research      — Anonymized research endpoints (admin)
├── /profile       — User profile management
├── /medications   — Medication/supplement list management
└── /notifications — Notification preferences and history
```

### 14.4 Agentic Workflow Infrastructure

```
┌──────────────────────────────────────────────────┐
│              EVENT SOURCES                         │
│                                                    │
│  Journal saved → Pub/Sub → Pattern Analysis Agent  │
│  Lab entered   → Pub/Sub → Lab Interpretation Agent│
│  Cron (nightly)→ Cloud Tasks → Nightly Agent       │
│  Cron (weekly) → Cloud Tasks → Cycle Analysis Agent│
│  User request  → Cloud Run → Report Agent          │
│  Chat message  → Cloud Run → Chat Agent            │
│  Cron (daily)  → Cloud Tasks → Research Agent       │
└──────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│              AGENT EXECUTION                      │
│                                                    │
│  Each agent:                                       │
│  1. Reads relevant data from Supabase              │
│  2. Applies analysis logic (rules + LLM where      │
│     appropriate)                                   │
│  3. Writes results back to Supabase                │
│     (pattern_detections, insights, reports)         │
│  4. Publishes events for downstream consumers      │
│     (notifications, dashboard updates)             │
└──────────────────────────────────────────────────┘
```

### 14.5 HIPAA-Informed Architecture

**Encryption:**
- Data at rest: AES-256 encryption in Supabase and Firebase
- Data in transit: TLS 1.3 for all API communication
- Field-level encryption for PII (real names, email, phone) in Supabase
- Photo encryption in Firebase Storage

**Access Control:**
- Supabase Row Level Security (RLS) policies ensuring users can only access their own data
- Provider access mediated through sharing tokens with scoped permissions
- Research layer accesses only anonymized views, never raw user tables
- API authentication via Firebase Auth with JWT validation

**Audit Trail:**
- All data access logged (who accessed what, when)
- Provider portal access separately auditable
- Data export/sharing events logged
- Audit logs stored in separate, append-only storage

**Data Residency:**
- Google Cloud region selection for data residency compliance
- No cross-border data transfer without user consent
- On-device processing preference for sensitive operations (BBT analysis, initial pattern matching)

**Future BAA Path:**
- Architecture designed so that signing BAAs with Google Cloud, Supabase, and Firebase is a configuration change, not a re-architecture
- Supabase offers HIPAA BAA on their Pro plan
- Google Cloud offers BAA for covered services
- Firebase HIPAA compliance available through Google Cloud's BAA

---

## 15. UX Flow — Daily Journal Entry

### 15.1 Morning Flow (Visual Wireframe Concept)

```
┌─────────────────────────────┐
│  Good morning, Sarah        │
│  ☀️ March 12 · Day 22       │  ← Cycle day shown if tracking
│                             │
│  ─── How You Slept ───      │
│                             │
│  Hours slept    [  7.5  ]   │  ← Auto-calc or manual
│  Quality        ●●●●●●○○○○ │  ← Slider, 6/10
│  Wakings        [0][1][2+]  │  ← Quick tap
│  Refreshed      ●●●●○○○○○○ │  ← Slider, 4/10
│  Basal temp     [ 97.4 °F ] │  ← Optional numeric
│                             │
│  ─── Body State ───         │
│                             │
│  Energy         ●●●●●○○○○○ │  ← Slider, 5/10
│  Brain fog      ●●●●●●●○○○ │  ← Slider, 7/10
│                             │
│  ⚡ "Your brain fog has been │
│  elevated for 4 days — this │
│  sometimes correlates with  │
│  your luteal phase pattern" │  ← Contextual micro-insight
│                             │
│  Pain?  [None][Mild][Mod][⬆]│
│  Cold?  [OK][Chilly][Cold]  │
│  Mood   😐 😟 😤 😢 💪 😶  │  ← Emoji tap
│                             │
│  ─── Meds & Supps ───       │
│                             │
│  ☑ Levothyroxine 75mcg      │
│     ⏰ 6:30 AM              │
│     With: [Empty stomach ✓] │
│  ☑ Vitamin D                │
│  ☑ Selenium                 │
│  ☐ Iron (skipped)           │
│                             │
│  Notes: ________________    │
│                             │
│  [  Save Morning Check-in  ]│
│                             │
│  ⏱ ~90 seconds              │
└─────────────────────────────┘
```

### 15.2 Evening Flow (Visual Wireframe Concept)

```
┌─────────────────────────────┐
│  Evening Check-in           │
│  🌙 March 12 · Day 22       │
│                             │
│  ─── Energy Today ───       │
│                             │
│  Pattern: [Steady][AM peak] │
│           [PM crash ✓][Low] │
│  Rating   ●●●●○○○○○○       │  ← 4/10
│                             │
│  ─── Symptoms ───           │
│                             │
│  [Hair shedding✓][Joint pain│
│   ✓][Constipation✓][Brain   │
│   fog✓][Cold hands✓]        │  ← Quick-tap chips
│  [+ More symptoms]          │
│                             │
│  ─── Mood & Stress ───      │
│                             │
│  Mood       ●●●●●○○○○○     │
│  Anxiety    ●●●●●●○○○○     │
│  Stress     ●●●●●●●○○○     │
│  Irritable  [None][Mild ✓]  │
│                             │
│  ─── Today's Inputs ───     │
│                             │
│  Diet: [Protein✓][Dairy]    │
│        [Cruciferous✓]       │
│  Meals: [Regular ✓][Skipped]│
│  Exercise: [None✓][Light]   │
│  Alcohol: [No ✓]            │
│                             │
│  ─── Sleep Prep ───         │
│                             │
│  Ready for sleep ●●●●●●○○○ │
│  Caffeine after 2pm [No ✓]  │
│                             │
│  [  Save Evening Check-in  ]│
│                             │
│  ⏱ ~90 seconds              │
└─────────────────────────────┘
```

### 15.3 Adaptive Behavior Over Time
- **Week 1:** All sections visible, guided onboarding explains each input
- **Week 2:** Symptom chips reorder to user's most common selections; smart defaults appear
- **Week 3+:** "Same as yesterday" quick-log option; rarely-used fields auto-collapse
- **After first labs entered:** Lab-informed insights start appearing inline
- **After first cycle tracked:** Cycle-phase context appears in morning header

---

## 16. Dashboards & Visualization

### 16.1 Patient Dashboard (Home Screen)

**Daily View:**
- Today's check-in status (morning done / evening pending)
- Current symptom snapshot with trend arrows (↑ worsening, → stable, ↓ improving)
- Active pattern alerts (Four Legs flags, vicious cycle alerts)
- Cycle day and phase (if tracking)
- Micro-insight of the day (from Pattern Analysis Agent)

**Trends View:**
- Symptom severity over time (selectable: 7d, 30d, 90d, custom)
- Energy pattern frequency chart (what percentage of days are "steady" vs. "crash")
- Brain fog trend line
- BBT trend line with cycle overlay (if tracking)
- Sleep quality vs. next-day energy correlation scatter plot

**Labs View:**
- Timeline of all lab results with dual-range bars
- FT3:rT3 ratio trend line
- TG:HDL ratio trend line
- E2:P4 ratio trend line (if available)
- Four Legs status dashboard (green/yellow/red per leg based on most recent data)

**Cycle View (if tracking):**
- Calendar view with color-coded symptom severity per day
- Cycle-phase overlay on symptom charts
- Cycle length trending (is it getting longer, shorter, more irregular?)
- Estrogen dominance symptom cluster heat map across cycle phases

### 16.2 Chart Types
- **Sparklines** — compact inline trends for the dashboard
- **Line charts** — symptom severity, lab values, BBT over time
- **Bar charts** — energy pattern distribution, symptom frequency
- **Heat maps** — cycle-phase symptom mapping
- **Scatter plots** — correlation visualization (sleep quality vs. energy, etc.)
- **Radar/spider charts** — Four Legs assessment overview
- **Dual-range bar charts** — lab values showing position within standard vs. functional ranges

---

## 17. Revenue Model & Ecosystem Integration

### 17.1 Book-App Flywheel
- The book drives readers to the app (CTA in relevant chapters, QR code)
- The app deepens engagement beyond the book purchase
- In-app educational content references specific book chapters (drives re-reads and recommendations)
- User success stories (anonymized, consented) become testimonials for both book and app

### 17.2 Freemium Model

**Free Tier:**
- Daily journaling (morning + evening check-in)
- Basic symptom tracking and trending
- Lab entry with conventional reference range display
- Medication/supplement tracking
- Photo food journal (capture + basic categorization)

**Premium Tier ($9.99 - $14.99/month):**
- Full intelligence layer (Four Legs detection, vicious cycle alerts, pattern analysis)
- Functional optimal range display alongside conventional reference ranges, with longitudinal trending to track where individual users feel best within functional ranges
- Auto-calculated ratios (FT3:rT3, TG:HDL, E2:P4)
- Doctor visit report generation
- Cycle-phase symptom mapping
- Estrogen dominance pathway detection
- Chat agent access
- Medication timing correlation insights
- Lifestyle-symptom correlation engine
- Flare pattern recognition

**Provider Plan ($29.99/month per provider):**
- Provider portal access
- Multi-patient dashboard
- Clinical reporting tools
- Priority support

### 17.3 Community Features (Future)
- Anonymized aggregate insights: "42% of users with your FT3:rT3 ratio also report brain fog"
- Community challenges and accountability groups (anonymous)
- Expert Q&A events linked to the book's author

### 17.4 Research Partnerships (Future)
- Anonymized, consented data available for research partnerships
- Population health insights for academic institutions
- Potential revenue from de-identified dataset licensing (with rigorous anonymization and consent)

---

## 18. Implementation Phases

The full vision ships as a unified product, but implementation is sequenced for a solo/small team to build incrementally while each phase delivers standalone value.

### Phase 1: Foundation (Months 1-3)
**Goal:** Core journal + lab tracking that's immediately useful as a book companion

**Build:**
- Flutter mobile app: Morning + evening check-in with full question set
- **Visual health photo capture** with full metadata collection (photo types, capture metadata, user self-assessment tags, baseline flagging, journal/cycle linkage) — designed to build the dataset for future AI Visual Analysis Agent
- Supabase database with core data model
- Firebase Auth integration
- Lab entry with dual-range display (standard + functional)
- Auto-calculated ratios (FT3:rT3, TG:HDL, E2:P4)
- Basic medication/supplement tracking with timing
- Basic dashboard with symptom trends and lab timeline
- Manual side-by-side photo comparison tool (user-driven, no AI — select two dates and compare)
- Onboarding flow linking to book concepts
- Unified API (Cloud Functions) for journal and lab CRUD

**Value delivered:** Users can journal daily, capture visual health photos, and enter labs with functional range context. Photo data begins accumulating from day one for future AI analysis. This alone is more useful than any existing thyroid app.

### Phase 2: Intelligence (Months 4-6)
**Goal:** The pattern detection engine that makes this product unique

**Build:**
- Four Legs detection logic (rule-based, per Section 8.1)
- Vicious cycle alert system (per Section 8.2)
- Menstrual cycle tracking + estrogen dominance symptom cluster
- Cycle-phase symptom mapping overlay
- Medication timing correlation
- Lifestyle-symptom correlation engine
- Nightly Pattern Analysis Agent (Cloud Tasks + Pub/Sub)
- Weekly Cycle Analysis Agent
- Educational micro-content tied to book chapters
- Push notifications (Firebase Cloud Messaging) for insights and reminders

**Value delivered:** Users start seeing the connections between their symptoms, cycles, and metabolic patterns. The app becomes a true detective's toolkit.

### Phase 3: Reports & Communication (Months 7-9)
**Goal:** Clinical-grade outputs that change the doctor-patient dynamic

**Build:**
- Doctor visit report generation (PDF + shareable link)
- Report Generation Agent
- Photo food journal with AI recognition (Tier 1 + 2)
- Next.js web app (patient-facing)
- Chat agent (MVP — educational Q&A + data interpretation)
- Flare pattern recognition
- Xenoestrogen exposure awareness scoring
- Enhanced dashboards with full chart suite

**Value delivered:** Users can bring undeniable data to their appointments. The chat agent helps them prepare and understand their patterns.

### Phase 4: Provider & Research (Months 10-12)
**Goal:** Expand from patient tool to platform

**Build:**
- Provider portal (Next.js)
- Patient-controlled sharing system
- Provider dashboard with interactive visualization
- Research analytics layer (anonymized)
- Research Analytics Agent
- Population-level aggregate insights
- Admin dashboards
- Photo food journal Tier 3 (restaurant estimation)
- Community features (anonymized insights)

**Value delivered:** IgniteHealthNow becomes a platform connecting patients, providers, and research.

### Phase 5: Visual Intelligence & Scale (Months 13+)
**Goal:** Activate the AI Visual Analysis Agent and scale the platform

**Build:**
- **AI Visual Analysis Agent** — leveraging the photo dataset accumulated since Phase 1. Approach (fine-tuned vision model, multimodal LLM, or dedicated pipeline) determined based on dataset size and available model capabilities at this point
- Automated photo comparison and change detection alerts
- Visual health timeline integration into doctor visit reports (AI-generated, not just manual)
- Wearable integration (Apple Watch, Fitbit — heart rate, BBT, sleep data)
- Lab portal API integration (auto-import lab results)
- Advanced ML pattern detection (trained on anonymized user base)
- EHR integration for provider portal
- iOS/Android native optimizations
- HIPAA formal certification (BAA execution)

**Value delivered:** The photo timeline users have been building since day one becomes actively intelligent — the app can now see what the user might miss and surface visual evidence of change for provider discussions.

---

## 19. Appendix: Prior Art Reference

### What to Leverage from Prior Work (`docs/mockups/`)
The following UX patterns from the prior general wellness app framework are worth preserving:

- **Conditional follow-up question logic** — show depth only when triggered (from `health-app-complete-framework.md`)
- **Symptom clustering concept** — named patterns like "Afternoon crash" that users can track over time
- **Photo capture FAB positioning** — persistent camera button for one-tap food photos
- **Morning/evening check-in chapter structure** — section-based flow with progress indicators
- **Confidence indicator system** — for photo food journal AI recognition tiers
- **Notes field per section** — "Add any other details" with 200 char limit, optional
- **Bristol Stool Scale visualization** — for digestive tracking (relevant to thyroid GI symptoms)
- **Smart notification timing** — learn user's patterns and remind at optimal times

### What to Replace
- General wellness framing → hypothyroidism-specific framework
- 7 generic health domains → Four Legs of the Table + estrogen dominance as organizing intelligence
- Generic correlation engine → book-derived metabolic relationship logic
- Gamification/achievements → educational micro-content tied to book chapters
- General food tracking → thyroid-relevant dietary tracking (selenium, cruciferous, goitrogens, medication interactions)

---

*End of PRD v1.0*
