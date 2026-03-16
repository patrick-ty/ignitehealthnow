# IgniteHealthNow — Master Screen Inventory

**Version:** 1.0
**Date:** March 16, 2026
**Source:** ignitehealth-prd.md v1.0
**Total Screens:** 142

---

## Screen ID Convention

| Prefix | Functional Area |
|--------|----------------|
| ONB-xxx | Onboarding |
| NAV-xxx | Navigation / Global |
| HOM-xxx | Home / Dashboard |
| JRM-xxx | Journal Morning Check-in |
| JRE-xxx | Journal Evening Check-in |
| PHF-xxx | Photo Food Journal |
| VHP-xxx | Visual Health Photos |
| LAB-xxx | Lab Tracking |
| MED-xxx | Medication / Supplement Management |
| DXN-xxx | Diagnosis Management |
| CYC-xxx | Cycle Tracking |
| INT-xxx | Intelligence / Alerts |
| RPT-xxx | Reports |
| CHT-xxx | Chat Agent |
| PRV-xxx | Provider Portal (web) |
| STG-xxx | Settings / Profile |
| MOD-xxx | Modals / Overlays (cross-cutting) |

---

## Master Screen Table

### Onboarding (ONB)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| ONB-001 | Splash / Brand Screen | Onboarding | App launch | 1 | P0 | `onboarding.md` |
| ONB-002 | Welcome & Value Proposition | Onboarding | ONB-001 | 1 | P0 | `onboarding.md` |
| ONB-003 | Account Creation | Onboarding | ONB-002 | 1 | P0 | `onboarding.md` |
| ONB-004 | Anonymized Display Name Setup | Onboarding | ONB-003 | 1 | P0 | `onboarding.md` |
| ONB-005 | Primary Health Concerns | Onboarding | ONB-004 | 1 | P0 | `onboarding.md` |
| ONB-006 | Diagnosis Entry (Initial) | Onboarding | ONB-005 | 1 | P0 | `onboarding.md` |
| ONB-007 | Current Medications Setup | Onboarding | ONB-006 | 1 | P0 | `onboarding.md` |
| ONB-008 | Current Supplements Setup | Onboarding | ONB-007 | 1 | P0 | `onboarding.md` |
| ONB-009 | Cycle Tracking Opt-In | Onboarding | ONB-008 | 1 | P0 | `onboarding.md` |
| ONB-010 | Notification Preferences | Onboarding | ONB-009 | 1 | P1 | `onboarding.md` |
| ONB-011 | Book Connection (Chapter Linking) | Onboarding | ONB-010 | 1 | P1 | `onboarding.md` |
| ONB-012 | Privacy & Data Consent | Onboarding | ONB-011 | 1 | P0 | `onboarding.md` |
| ONB-013 | Onboarding Complete / First Check-in Prompt | Onboarding | ONB-012 | 1 | P0 | `onboarding.md` |

### Navigation / Global (NAV)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| NAV-001 | Bottom Navigation Bar | Navigation | Global | 1 | P0 | `navigation.md` |
| NAV-002 | Floating Action Button (FAB) Menu | Navigation | Global overlay | 1 | P0 | `navigation.md` |
| NAV-003 | Global Search | Navigation | NAV-001 | 2 | P1 | `navigation.md` |
| NAV-004 | Notification Center | Navigation | NAV-001 | 2 | P1 | `navigation.md` |
| NAV-005 | Empty State — No Data Yet | Navigation | Any screen | 1 | P0 | `navigation.md` |
| NAV-006 | Error State — Network Failure | Navigation | Any screen | 1 | P0 | `navigation.md` |
| NAV-007 | Error State — Server Error | Navigation | Any screen | 1 | P0 | `navigation.md` |
| NAV-008 | Loading / Skeleton State | Navigation | Any screen | 1 | P0 | `navigation.md` |

### Home / Dashboard (HOM)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| HOM-001 | Daily Dashboard (Home) | Dashboard | NAV-001 tab | 1 | P0 | `dashboard.md` |
| HOM-002 | Trends View (7d/30d/90d/custom) | Dashboard | HOM-001 tab | 1 | P0 | `dashboard.md` |
| HOM-003 | Labs Dashboard View | Dashboard | HOM-001 tab | 1 | P0 | `dashboard.md` |
| HOM-004 | Cycle Dashboard View | Dashboard | HOM-001 tab | 2 | P0 | `dashboard.md` |
| HOM-005 | Micro-Insight Card (Daily) | Dashboard | HOM-001 inline | 2 | P1 | `dashboard.md` |
| HOM-006 | Micro-Insight Detail Expand | Dashboard | HOM-005 | 2 | P1 | `dashboard.md` |
| HOM-007 | Symptom Trend Chart (Interactive) | Dashboard | HOM-002 | 1 | P0 | `dashboard.md` |
| HOM-008 | Energy Pattern Frequency Chart | Dashboard | HOM-002 | 1 | P1 | `dashboard.md` |
| HOM-009 | Brain Fog Trend Line | Dashboard | HOM-002 | 1 | P1 | `dashboard.md` |
| HOM-010 | BBT Trend with Cycle Overlay | Dashboard | HOM-002 | 2 | P1 | `dashboard.md` |
| HOM-011 | Sleep Quality vs Energy Scatter Plot | Dashboard | HOM-002 | 2 | P2 | `dashboard.md` |
| HOM-012 | Four Legs Status Dashboard | Dashboard | HOM-003 | 2 | P0 | `dashboard.md` |
| HOM-013 | Lab Timeline (Dual-Range Bars) | Dashboard | HOM-003 | 1 | P0 | `dashboard.md` |
| HOM-014 | Ratio Trend Lines (FT3:rT3, TG:HDL, E2:P4) | Dashboard | HOM-003 | 1 | P0 | `dashboard.md` |
| HOM-015 | Cycle Calendar Heatmap | Dashboard | HOM-004 | 2 | P0 | `dashboard.md` |
| HOM-016 | Cycle Length Trending Chart | Dashboard | HOM-004 | 2 | P1 | `dashboard.md` |
| HOM-017 | Estrogen Dominance Symptom Cluster Heatmap | Dashboard | HOM-004 | 2 | P1 | `dashboard.md` |
| HOM-018 | Bloating Correlation Timeline | Dashboard | HOM-002 | 2 | P1 | `dashboard.md` |
| HOM-019 | Dashboard Empty State — First Day | Dashboard | HOM-001 | 1 | P0 | `dashboard.md` |
| HOM-020 | Dashboard Empty State — Awaiting Labs | Dashboard | HOM-003 | 1 | P0 | `dashboard.md` |
| HOM-021 | Date Range Picker (Custom Trends) | Dashboard | HOM-002 | 1 | P1 | `dashboard.md` |

### Journal Morning Check-in (JRM)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| JRM-001 | Morning Greeting / Check-in Entry | Morning Journal | HOM-001 CTA | 1 | P0 | `journal-morning.md` |
| JRM-002 | Card: How You Slept (Section A) | Morning Journal | JRM-001 | 1 | P0 | `journal-morning.md` |
| JRM-003 | Conditional: Sleep Disruption Reasons | Morning Journal | JRM-002 (quality < 5) | 1 | P0 | `journal-morning.md` |
| JRM-004 | Card: Body State (Section B) | Morning Journal | JRM-002 | 1 | P0 | `journal-morning.md` |
| JRM-005 | Conditional: Pain Location Body Map | Morning Journal | JRM-004 (pain present) | 1 | P1 | `journal-morning.md` |
| JRM-006 | Conditional: Exercise Tolerance Yesterday | Morning Journal | JRM-004 (energy < 4) | 1 | P2 | `journal-morning.md` |
| JRM-007 | Conditional: Word Retrieval Difficulty | Morning Journal | JRM-004 (brain fog > 6) | 1 | P1 | `journal-morning.md` |
| JRM-008 | Card: Medication & Supplements (Section C) | Morning Journal | JRM-004 | 1 | P0 | `journal-morning.md` |
| JRM-009 | Card: Quick Context (Section D) | Morning Journal | JRM-008 | 1 | P1 | `journal-morning.md` |
| JRM-010 | Card: Visual Health Photo Prompt | Morning Journal | JRM-009 | 1 | P1 | `journal-morning.md` |
| JRM-011 | Morning Check-in Summary / Save | Morning Journal | JRM-010 | 1 | P0 | `journal-morning.md` |
| JRM-012 | Same-as-Yesterday Quick Confirm | Morning Journal | JRM-001 (14+ days) | 1 | P1 | `journal-morning.md` |
| JRM-013 | Morning Contextual Micro-Insight | Morning Journal | JRM-004 inline | 2 | P1 | `journal-morning.md` |

### Journal Evening Check-in (JRE)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| JRE-001 | Evening Check-in Entry | Evening Journal | HOM-001 CTA | 1 | P0 | `journal-evening.md` |
| JRE-002 | Card: Energy & Cognitive Review (Section A) | Evening Journal | JRE-001 | 1 | P0 | `journal-evening.md` |
| JRE-003 | Card: Bloating & Body Composition (Section B) | Evening Journal | JRE-002 | 1 | P0 | `journal-evening.md` |
| JRE-004 | Conditional: Bloating Food Triggers | Evening Journal | JRE-003 (bloating > 5) | 1 | P0 | `journal-evening.md` |
| JRE-005 | Conditional: Bloating Stress Trigger | Evening Journal | JRE-003 (bloating > 5) | 1 | P1 | `journal-evening.md` |
| JRE-006 | Conditional: Body Distress Impact | Evening Journal | JRE-003 (heavier/swollen) | 1 | P1 | `journal-evening.md` |
| JRE-007 | Card: Physical Symptoms (Section C) | Evening Journal | JRE-003 | 1 | P0 | `journal-evening.md` |
| JRE-008 | Conditional: Palpitations — Resting HR Entry | Evening Journal | JRE-007 (palpitations) | 1 | P1 | `journal-evening.md` |
| JRE-009 | Conditional: Hair Shedding Severity | Evening Journal | JRE-007 (hair shedding) | 1 | P1 | `journal-evening.md` |
| JRE-010 | Conditional: Candida Signs Detail | Evening Journal | JRE-007 (yeast/candida) | 1 | P1 | `journal-evening.md` |
| JRE-011 | Conditional: SIBO Signs Detail | Evening Journal | JRE-007 (SIBO signs) | 1 | P1 | `journal-evening.md` |
| JRE-012 | Conditional: Anxiety Physical Symptoms | Evening Journal | JRE-014 (anxiety > 7) | 1 | P1 | `journal-evening.md` |
| JRE-013 | Symptom Severity Sliders (Per Chip) | Evening Journal | JRE-007 expand | 1 | P1 | `journal-evening.md` |
| JRE-014 | Card: Mood & Stress (Section D) | Evening Journal | JRE-007 | 1 | P0 | `journal-evening.md` |
| JRE-015 | Card: Lifestyle Inputs (Section E) | Evening Journal | JRE-014 | 1 | P1 | `journal-evening.md` |
| JRE-016 | Card: Sleep Preparation (Section F) | Evening Journal | JRE-015 | 1 | P1 | `journal-evening.md` |
| JRE-017 | Evening Check-in Summary / Save | Evening Journal | JRE-016 | 1 | P0 | `journal-evening.md` |
| JRE-018 | Same-as-Yesterday Quick Confirm | Evening Journal | JRE-001 (14+ days) | 1 | P1 | `journal-evening.md` |
| JRE-019 | Evening Contextual Micro-Insight | Evening Journal | JRE-003 inline | 2 | P1 | `journal-evening.md` |

### Photo Food Journal (PHF)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| PHF-001 | Food Photo Capture (Camera) | Food Journal | FAB / NAV-002 | 1 | P0 | `photo-food-journal.md` |
| PHF-002 | Photo Review & Category Select | Food Journal | PHF-001 | 1 | P0 | `photo-food-journal.md` |
| PHF-003 | Thyroid Tag Multi-Select | Food Journal | PHF-002 | 1 | P0 | `photo-food-journal.md` |
| PHF-004 | AI Recognition Result (Confidence Tiers) | Food Journal | PHF-002 | 3 | P0 | `photo-food-journal.md` |
| PHF-005 | Medication Timing Warning | Food Journal | PHF-002 (near med time) | 1 | P1 | `photo-food-journal.md` |
| PHF-006 | Food Journal Timeline (Daily) | Food Journal | NAV-001 tab | 1 | P0 | `photo-food-journal.md` |
| PHF-007 | Food Entry Detail View | Food Journal | PHF-006 tap | 1 | P0 | `photo-food-journal.md` |
| PHF-008 | Food Journal Empty State | Food Journal | PHF-006 | 1 | P0 | `photo-food-journal.md` |

### Visual Health Photos (VHP)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| VHP-001 | Photo Capture — Face Front (Silhouette Guide) | Visual Health | JRM-010 | 1 | P0 | `visual-health.md` |
| VHP-002 | Photo Capture — Face Profile | Visual Health | VHP-001 | 1 | P1 | `visual-health.md` |
| VHP-003 | Photo Capture — Eyebrows (Weekly Prompt) | Visual Health | VHP-002 | 1 | P2 | `visual-health.md` |
| VHP-004 | Photo Capture — Hair/Scalp | Visual Health | VHP-002 | 1 | P1 | `visual-health.md` |
| VHP-005 | Photo Capture — Hands/Nails | Visual Health | VHP-004 | 1 | P2 | `visual-health.md` |
| VHP-006 | Photo Capture — Body Composition | Visual Health | VHP-004 | 1 | P2 | `visual-health.md` |
| VHP-007 | Photo Capture — Targeted Area (Skin Rash, Swelling, etc.) | Visual Health | VHP-006 | 1 | P2 | `visual-health.md` |
| VHP-008 | Self-Assessment Tag Per Photo | Visual Health | Each VHP capture | 1 | P1 | `visual-health.md` |
| VHP-009 | Visual Health Photo Timeline | Visual Health | STG or Dashboard | 1 | P0 | `visual-health.md` |
| VHP-010 | Manual Side-by-Side Comparison Tool | Visual Health | VHP-009 | 1 | P0 | `visual-health.md` |
| VHP-011 | AI Visual Analysis Results (Change Alerts) | Visual Health | VHP-009 | 5 | P0 | `visual-health.md` |
| VHP-012 | Baseline Period Indicator (First 7 Days) | Visual Health | VHP-001 overlay | 1 | P1 | `visual-health.md` |

### Lab Tracking (LAB)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| LAB-001 | Lab Entry Start (Date & Source) | Lab Tracking | Event-driven entry | 1 | P0 | `lab-tracking.md` |
| LAB-002 | Thyroid Panel Entry | Lab Tracking | LAB-001 | 1 | P0 | `lab-tracking.md` |
| LAB-003 | Metabolic Panel Entry (Iron, B12, D, Glucose, Insulin) | Lab Tracking | LAB-001 | 1 | P0 | `lab-tracking.md` |
| LAB-004 | Hormonal Panel Entry (E2, Progesterone, Testosterone, DHEA) | Lab Tracking | LAB-001 | 1 | P0 | `lab-tracking.md` |
| LAB-005 | Liver & Lipid Panel Entry | Lab Tracking | LAB-001 | 1 | P0 | `lab-tracking.md` |
| LAB-006 | Autoimmune Markers Entry (TPO Ab, TG Ab) | Lab Tracking | LAB-001 | 1 | P0 | `lab-tracking.md` |
| LAB-007 | Lab Result Review — Dual-Range Display | Lab Tracking | LAB-002..006 save | 1 | P0 | `lab-tracking.md` |
| LAB-008 | Auto-Calculated Ratios Display (FT3:rT3, TG:HDL, E2:P4, FT4:FT3) | Lab Tracking | LAB-007 | 1 | P0 | `lab-tracking.md` |
| LAB-009 | Four Legs Mapping for Lab Results | Lab Tracking | LAB-007 | 2 | P0 | `lab-tracking.md` |
| LAB-010 | Lab History List | Lab Tracking | HOM-003 / Settings | 1 | P0 | `lab-tracking.md` |
| LAB-011 | Lab Interpretation Agent Results | Lab Tracking | LAB-007 (post-save) | 2 | P0 | `lab-tracking.md` |
| LAB-012 | Suggested Next Labs | Lab Tracking | LAB-011 | 2 | P1 | `lab-tracking.md` |
| LAB-013 | Lab Entry Empty State | Lab Tracking | LAB-010 | 1 | P0 | `lab-tracking.md` |

### Medication / Supplement Management (MED)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| MED-001 | Medication & Supplement List | Med Management | STG or Nav | 1 | P0 | `medications.md` |
| MED-002 | Add Medication (Form Wizard) | Med Management | MED-001 | 1 | P0 | `medications.md` |
| MED-003 | Add Supplement (Form Wizard) | Med Management | MED-001 | 1 | P0 | `medications.md` |
| MED-004 | Medication Detail / Edit | Med Management | MED-001 tap | 1 | P0 | `medications.md` |
| MED-005 | Dosage Change Event Entry | Med Management | MED-004 | 1 | P0 | `medications.md` |
| MED-006 | Medication Discontinued Entry | Med Management | MED-004 | 1 | P1 | `medications.md` |
| MED-007 | Medication Change History Timeline | Med Management | MED-004 | 1 | P1 | `medications.md` |
| MED-008 | Monitoring Window Indicator (6-Week Post-Change) | Med Management | MED-001 inline | 2 | P1 | `medications.md` |
| MED-009 | Medication Timing Correlation Results | Med Management | INT-xxx or MED-004 | 2 | P1 | `medications.md` |
| MED-010 | Absorption Interference Warning | Med Management | JRM-008 inline | 1 | P1 | `medications.md` |

### Diagnosis Management (DXN)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| DXN-001 | Diagnosis List | Diagnosis Mgmt | STG or Profile | 1 | P0 | `diagnoses.md` |
| DXN-002 | Add Diagnosis (Guided Wizard) | Diagnosis Mgmt | DXN-001 | 1 | P0 | `diagnoses.md` |
| DXN-003 | Diagnosis Detail / Edit | Diagnosis Mgmt | DXN-001 tap | 1 | P0 | `diagnoses.md` |
| DXN-004 | Link Labs to Diagnosis | Diagnosis Mgmt | DXN-003 | 1 | P1 | `diagnoses.md` |
| DXN-005 | Link Medications to Diagnosis | Diagnosis Mgmt | DXN-003 | 1 | P1 | `diagnoses.md` |

### Cycle Tracking (CYC)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| CYC-001 | Cycle Tracking Setup / Opt-In | Cycle Tracking | ONB-009 or STG | 2 | P0 | `cycle-tracking.md` |
| CYC-002 | Period Start Log | Cycle Tracking | Daily prompt / CYC-005 | 2 | P0 | `cycle-tracking.md` |
| CYC-003 | Daily Flow Log (Heaviness, Clots) | Cycle Tracking | CYC-002 / Daily prompt | 2 | P0 | `cycle-tracking.md` |
| CYC-004 | PMS Symptom Window Capture | Cycle Tracking | Daily prompt (luteal) | 2 | P0 | `cycle-tracking.md` |
| CYC-005 | Period End / Cycle Complete | Cycle Tracking | CYC-003 (flow stops) | 2 | P0 | `cycle-tracking.md` |
| CYC-006 | Ovulation Signs Log (Mittelschmerz, CM, Temp Shift, OPK) | Cycle Tracking | Daily prompt (mid-cycle) | 2 | P1 | `cycle-tracking.md` |
| CYC-007 | Estrogen Dominance Symptom Cluster Tracker | Cycle Tracking | CYC-004 / Daily | 2 | P0 | `cycle-tracking.md` |
| CYC-008 | End-of-Cycle Review Summary | Cycle Tracking | CYC-005 | 2 | P1 | `cycle-tracking.md` |
| CYC-009 | Cycle-Phase Symptom Map (Overlay View) | Cycle Tracking | HOM-004 | 2 | P0 | `cycle-tracking.md` |
| CYC-010 | Cycle History List | Cycle Tracking | HOM-004 or STG | 2 | P1 | `cycle-tracking.md` |

### Intelligence / Alerts (INT)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| INT-001 | Intelligence Feed (All Alerts) | Intelligence | NAV-001 tab or HOM | 2 | P0 | `intelligence.md` |
| INT-002 | Four Legs Assessment Overview (Radar Chart) | Intelligence | INT-001 / HOM-012 | 2 | P0 | `intelligence.md` |
| INT-003 | Four Legs — Insulin Resistance Detail | Intelligence | INT-002 tap | 2 | P0 | `intelligence.md` |
| INT-004 | Four Legs — Iron Dysregulation Detail | Intelligence | INT-002 tap | 2 | P0 | `intelligence.md` |
| INT-005 | Four Legs — Homocysteine Elevation Detail | Intelligence | INT-002 tap | 2 | P0 | `intelligence.md` |
| INT-006 | Four Legs — Liver Dysfunction Detail | Intelligence | INT-002 tap | 2 | P0 | `intelligence.md` |
| INT-007 | Vicious Cycle Alert — Insulin-Thyroid Loop | Intelligence | INT-001 | 2 | P0 | `intelligence.md` |
| INT-008 | Vicious Cycle Alert — Estrogen-Free Hormone Suppression | Intelligence | INT-001 | 2 | P0 | `intelligence.md` |
| INT-009 | Vicious Cycle Alert — Liver-Estrogen-Thyroid Triangle | Intelligence | INT-001 | 2 | P0 | `intelligence.md` |
| INT-010 | Vicious Cycle Alert — Iron Depletion Loop | Intelligence | INT-001 | 2 | P0 | `intelligence.md` |
| INT-011 | Vicious Cycle Alert — Estrogen-Inflammation-Autoimmune | Intelligence | INT-001 | 2 | P0 | `intelligence.md` |
| INT-012 | Bloating Correlation Engine — Daily Insight Card | Intelligence | HOM-001 / INT-001 | 2 | P1 | `intelligence.md` |
| INT-013 | Bloating Correlation Engine — Weekly Digest | Intelligence | INT-001 | 2 | P1 | `intelligence.md` |
| INT-014 | Bloating Correlation Engine — Top 3 Triggers | Intelligence | INT-001 (30+ days) | 2 | P1 | `intelligence.md` |
| INT-015 | Bloating Correlation Engine — Cause & Effect Timeline | Intelligence | INT-012 expand | 2 | P2 | `intelligence.md` |
| INT-016 | Distress Cycle Alert (Body Distress Loop) | Intelligence | INT-001 | 2 | P1 | `intelligence.md` |
| INT-017 | Estrogen Dominance Pathway Detail | Intelligence | INT-001 | 2 | P0 | `intelligence.md` |
| INT-018 | Cycle-Phase Symptom Classification (Luteal vs Distributed) | Intelligence | INT-017 | 2 | P0 | `intelligence.md` |
| INT-019 | Liver-Estrogen Bridge Explanation | Intelligence | INT-017 | 2 | P1 | `intelligence.md` |
| INT-020 | Progesterone-Thyroid Relationship Alert | Intelligence | INT-017 (labs available) | 2 | P1 | `intelligence.md` |
| INT-021 | Medication Timing Correlation Results | Intelligence | INT-001 | 2 | P1 | `intelligence.md` |
| INT-022 | Conversion Efficiency Tracking (FT4:FT3, FT3:rT3) | Intelligence | INT-001 / LAB view | 2 | P0 | `intelligence.md` |
| INT-023 | Lifestyle-Symptom Correlation Cards | Intelligence | INT-001 | 2 | P1 | `intelligence.md` |
| INT-024 | Flare Pattern Recognition Alert | Intelligence | INT-001 | 3 | P0 | `intelligence.md` |
| INT-025 | Xenoestrogen Exposure Awareness Score | Intelligence | INT-001 | 3 | P2 | `intelligence.md` |
| INT-026 | Medication Change Monitoring Window Alert | Intelligence | INT-001 (post-change) | 2 | P1 | `intelligence.md` |
| INT-027 | Positive Reinforcement Insight Card | Intelligence | HOM-001 / INT-001 | 2 | P1 | `intelligence.md` |
| INT-028 | Alert Detail View (Generic Template) | Intelligence | INT-007..011 tap | 2 | P0 | `intelligence.md` |
| INT-029 | Book Chapter Link from Alert | Intelligence | INT-028 CTA | 2 | P1 | `intelligence.md` |

### Reports (RPT)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| RPT-001 | Report Configuration (Date Range, Data Types) | Reports | Nav / STG | 3 | P0 | `reports.md` |
| RPT-002 | Report Preview — Full One-Page Summary | Reports | RPT-001 | 3 | P0 | `reports.md` |
| RPT-003 | Report Section: Patient Summary Header | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-004 | Report Section: Symptom Trend Dashboard | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-005 | Report Section: Lab Values Dual-Range | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-006 | Report Section: Auto-Calculated Ratios | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-007 | Report Section: Medication & Supplement Timeline | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-008 | Report Section: Cycle-Mapped Symptom Summary | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-009 | Report Section: Visual Health Timeline (Opt-In) | Reports | RPT-002 section | 3 | P1 | `reports.md` |
| RPT-010 | Report Section: Four Legs Assessment | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-011 | Report Section: Suggested Discussion Points | Reports | RPT-002 section | 3 | P0 | `reports.md` |
| RPT-012 | Report Section: Suggested Labs | Reports | RPT-002 section | 3 | P1 | `reports.md` |
| RPT-013 | Report Export (PDF / Shareable Link) | Reports | RPT-002 action | 3 | P0 | `reports.md` |
| RPT-014 | Report History List | Reports | Nav / STG | 3 | P1 | `reports.md` |
| RPT-015 | Report Share Confirmation | Reports | RPT-013 | 3 | P0 | `reports.md` |

### Chat Agent (CHT)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| CHT-001 | Chat Interface (Conversational) | Chat Agent | NAV-001 tab | 3 | P0 | `chat-agent.md` |
| CHT-002 | Chat Session History List | Chat Agent | CHT-001 | 3 | P0 | `chat-agent.md` |
| CHT-003 | Chat — Data Interpretation Mode | Chat Agent | CHT-001 context | 3 | P0 | `chat-agent.md` |
| CHT-004 | Chat — Appointment Prep Mode | Chat Agent | CHT-001 flag | 3 | P0 | `chat-agent.md` |
| CHT-005 | Chat — Lab Explanation Mode | Chat Agent | CHT-001 context | 3 | P0 | `chat-agent.md` |
| CHT-006 | Chat — Pattern Explanation Mode | Chat Agent | CHT-001 context | 3 | P0 | `chat-agent.md` |
| CHT-007 | Chat Data Access Indicator | Chat Agent | CHT-001 inline | 3 | P1 | `chat-agent.md` |
| CHT-008 | Chat Empty State — First Conversation | Chat Agent | CHT-001 | 3 | P0 | `chat-agent.md` |

### Provider Portal — Web (PRV)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| PRV-001 | Provider Login / Auth | Provider Portal | Web entry | 4 | P0 | `provider-portal.md` |
| PRV-002 | Multi-Patient Overview Dashboard | Provider Portal | PRV-001 | 4 | P0 | `provider-portal.md` |
| PRV-003 | Patient Summary View (Interactive Report) | Provider Portal | PRV-002 select | 4 | P0 | `provider-portal.md` |
| PRV-004 | Patient Trend Visualization (Interactive Charts) | Provider Portal | PRV-003 | 4 | P0 | `provider-portal.md` |
| PRV-005 | Four Legs Overview for Patient | Provider Portal | PRV-003 | 4 | P0 | `provider-portal.md` |
| PRV-006 | Cycle-Symptom Overlay (Interactive) | Provider Portal | PRV-003 | 4 | P1 | `provider-portal.md` |
| PRV-007 | Lab History — Dual Range (Interactive) | Provider Portal | PRV-003 | 4 | P0 | `provider-portal.md` |
| PRV-008 | Compare Views (Side-by-Side Time Periods) | Provider Portal | PRV-003 | 4 | P1 | `provider-portal.md` |
| PRV-009 | Provider Notes (Private to Provider) | Provider Portal | PRV-003 | 4 | P1 | `provider-portal.md` |
| PRV-010 | Lab Ordering Suggestions | Provider Portal | PRV-003 | 4 | P1 | `provider-portal.md` |
| PRV-011 | Patient Export (PDF / Structured Data) | Provider Portal | PRV-003 action | 4 | P1 | `provider-portal.md` |
| PRV-012 | Provider Profile / Settings | Provider Portal | PRV-002 | 4 | P1 | `provider-portal.md` |

**Patient-Side Provider Sharing Screens (mobile):**

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| PRV-013 | Provider Sharing Setup (Generate Link / Invite) | Provider Sharing | STG | 4 | P0 | `provider-portal.md` |
| PRV-014 | Granular Permission Selection | Provider Sharing | PRV-013 | 4 | P0 | `provider-portal.md` |
| PRV-015 | Active Shares List | Provider Sharing | STG | 4 | P0 | `provider-portal.md` |
| PRV-016 | Share Audit Trail (Access Log) | Provider Sharing | PRV-015 tap | 4 | P1 | `provider-portal.md` |
| PRV-017 | Revoke Access Confirmation | Provider Sharing | PRV-015 action | 4 | P0 | `provider-portal.md` |

### Settings / Profile (STG)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| STG-001 | Settings Hub | Settings | NAV-001 tab | 1 | P0 | `settings.md` |
| STG-002 | Profile & Health Profile | Settings | STG-001 | 1 | P0 | `settings.md` |
| STG-003 | Medications & Supplements (Link to MED-001) | Settings | STG-001 | 1 | P0 | `settings.md` |
| STG-004 | Diagnoses (Link to DXN-001) | Settings | STG-001 | 1 | P0 | `settings.md` |
| STG-005 | Cycle Tracking Settings | Settings | STG-001 | 2 | P0 | `settings.md` |
| STG-006 | Notification Preferences | Settings | STG-001 | 2 | P0 | `settings.md` |
| STG-007 | Privacy & Data Management | Settings | STG-001 | 1 | P0 | `settings.md` |
| STG-008 | Research Data Consent (Opt-In) | Settings | STG-007 | 4 | P1 | `settings.md` |
| STG-009 | Data Export | Settings | STG-007 | 1 | P1 | `settings.md` |
| STG-010 | Display Preferences (Text Size, Theme) | Settings | STG-001 | 1 | P2 | `settings.md` |
| STG-011 | Journal Depth Preferences (P0/P1/P2/P3 visibility) | Settings | STG-001 | 1 | P1 | `settings.md` |
| STG-012 | Provider Sharing Management (Link to PRV-013) | Settings | STG-001 | 4 | P0 | `settings.md` |
| STG-013 | About / Book Link | Settings | STG-001 | 1 | P2 | `settings.md` |
| STG-014 | Account Deletion | Settings | STG-007 | 1 | P1 | `settings.md` |
| STG-015 | Subscription / Premium Management | Settings | STG-001 | 1 | P1 | `settings.md` |

### Modals / Overlays (MOD)

| Screen ID | Screen Name | Functional Area | Parent/Flow | Phase | Priority | Spec File |
|-----------|-------------|-----------------|-------------|-------|----------|-----------|
| MOD-001 | Medication Reminder Push Notification | Modal | System push | 2 | P0 | `modals.md` |
| MOD-002 | Medication Dose Confirmation (From Notification) | Modal | MOD-001 tap | 1 | P0 | `modals.md` |
| MOD-003 | Acute Symptom Quick-Capture | Modal | Any screen (FAB) | 1 | P1 | `modals.md` |
| MOD-004 | Insight Alert Notification (Push) | Modal | System push | 2 | P0 | `modals.md` |
| MOD-005 | Flare Prediction Warning | Modal | System push | 3 | P0 | `modals.md` |
| MOD-006 | Journal Reminder (Morning) | Modal | System push | 1 | P1 | `modals.md` |
| MOD-007 | Journal Reminder (Evening) | Modal | System push | 1 | P1 | `modals.md` |
| MOD-008 | Weekly Photo Prompt (Eyebrow) | Modal | System push | 1 | P2 | `modals.md` |
| MOD-009 | Monthly Measurement Prompt | Modal | System push | 1 | P2 | `modals.md` |
| MOD-010 | Post-Appointment Check-In ("Did anything change?") | Modal | System prompt | 1 | P1 | `modals.md` |
| MOD-011 | Confirmation Dialog (Generic Save/Discard) | Modal | Journal / Forms | 1 | P0 | `modals.md` |
| MOD-012 | Educational Micro-Content Bottom Sheet | Modal | Alerts / Insights | 2 | P0 | `modals.md` |
| MOD-013 | Book Chapter Reference Sheet | Modal | INT / CHT | 2 | P1 | `modals.md` |
| MOD-014 | Data Insufficient Warning | Modal | Intelligence screens | 2 | P1 | `modals.md` |
| MOD-015 | Streak / Positive Feedback Toast | Modal | Journal save | 1 | P2 | `modals.md` |
| MOD-016 | Photo Guidance Overlay (Silhouette Alignment) | Modal | VHP-001..007 | 1 | P0 | `modals.md` |
| MOD-017 | Premium Upsell Prompt | Modal | Gated features | 1 | P1 | `modals.md` |

---

## Summary by Functional Area

| Functional Area | Prefix | Screen Count | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|-----------------|--------|-------------|---------|---------|---------|---------|---------|
| Onboarding | ONB | 13 | 13 | 0 | 0 | 0 | 0 |
| Navigation / Global | NAV | 8 | 8 | 0 | 0 | 0 | 0 |
| Home / Dashboard | HOM | 21 | 12 | 9 | 0 | 0 | 0 |
| Journal Morning | JRM | 13 | 12 | 1 | 0 | 0 | 0 |
| Journal Evening | JRE | 19 | 18 | 1 | 0 | 0 | 0 |
| Photo Food Journal | PHF | 8 | 7 | 0 | 1 | 0 | 0 |
| Visual Health Photos | VHP | 12 | 11 | 0 | 0 | 0 | 1 |
| Lab Tracking | LAB | 13 | 10 | 3 | 0 | 0 | 0 |
| Medication/Supplement Mgmt | MED | 10 | 8 | 2 | 0 | 0 | 0 |
| Diagnosis Management | DXN | 5 | 5 | 0 | 0 | 0 | 0 |
| Cycle Tracking | CYC | 10 | 0 | 10 | 0 | 0 | 0 |
| Intelligence / Alerts | INT | 29 | 0 | 27 | 2 | 0 | 0 |
| Reports | RPT | 15 | 0 | 0 | 15 | 0 | 0 |
| Chat Agent | CHT | 8 | 0 | 0 | 8 | 0 | 0 |
| Provider Portal | PRV | 17 | 0 | 0 | 0 | 17 | 0 |
| Settings / Profile | STG | 15 | 11 | 2 | 0 | 2 | 0 |
| Modals / Overlays | MOD | 17 | 10 | 5 | 1 | 0 | 0 |
| **TOTAL** | | **142** | **104** | **53** | **25** | **17** | **1** |

> Note: Some screens appear in multiple phases because they gain features across phases. Phase totals sum higher than 142 because dashboard and settings screens evolve across phases. The unique screen count is 142.

### Phase Distribution Summary

| Phase | Description | New Unique Screens | Cumulative |
|-------|-------------|-------------------|------------|
| Phase 1 | Foundation | 104 | 104 |
| Phase 2 | Intelligence | 27 | 131 |
| Phase 3 | Reports & Chat | 10 | 141 |
| Phase 4 | Provider | 0 (PRV web screens are net-new platform) | 141 + 17 web |
| Phase 5 | Visual Intelligence | 1 | 142 |

### Complexity Notes

- **Highest screen density:** Intelligence/Alerts (29 screens) — each vicious cycle, correlation engine, and pathway needs its own detail view.
- **Highest conditional complexity:** Evening Journal (19 screens) — six conditional branches triggered by symptom selection and severity thresholds.
- **Most cross-cutting:** Modals (17 screens) — used across every functional area.
- **Platform split:** Provider Portal (PRV-001 through PRV-012) is web-only via Next.js. PRV-013 through PRV-017 are mobile screens for patient-side sharing management.
- **Progressive disclosure screens:** JRM-012 and JRE-018 (Same-as-Yesterday) only appear after 14+ days of data. INT screens require minimum data thresholds before surfacing.

---

*End of Screen Inventory v1.0*
