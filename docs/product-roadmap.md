# IgniteHealthNow — Product Roadmap

> Living document. Companion to the [PRD](prd/ignitehealth-prd.md) and [architecture](architecture.md).
> Last updated: 2026-06-27.

## Founding principle

IgniteHealthNow is an **instrument** that helps patients and their caregivers understand
their situation and **advocate for themselves** with their healthcare providers — so that
people actually recover and get healthy, not stay perpetually dependent on care. It is
**not** a diagnostic/expert system and does **not** place blame on providers. Every feature
is judged against this.

**Status legend:** ✅ shipped · 🚧 in progress · 🔜 next · 🗓️ later · 💡 idea

**Product surfaces:**
- **Consumer app** — patient/caregiver-facing (dashboard, chat, journals). *Shipped/in progress.*
- **Admin console** — internal-facing (content review/approval/posting, ops). *Planned.* May share APIs with the consumer app.
- **Provider portal** — clinician-facing, patient-granted access. *Later.*

A shared **book-knowledge service** (the RAG KB) feeds multiple surfaces: it powers the consumer chat *and* the admin marketing-content generator.

---

## Now — shipped / in progress

| Status | Item | Notes |
|--------|------|-------|
| ✅ | **Auth + encrypted profile** (Epic-00) | Supabase auth (ES256/JWKS), GCP KMS envelope encryption for PII. Working end-to-end. |
| ✅ | **RAG knowledge base** | Book content → Vertex embeddings → Cloud SQL pgvector (`rag.kb_chunks`, ~519 chunks). Live. |
| ✅ | **Health-advocate chat (v1)** | RAG retrieval + Claude, guardrailed (non-diagnostic, defers to provider, plain language, never names its source book). Validated live in dev. |
| 🚧 | **Chat polish** | Markdown rendering, readable layout. |

---

## Next

| Status | Item | Notes |
|--------|------|-------|
| 🔜 | **Evidence-base citations** | *(featured — see below)* Surface the real peer-reviewed journals/studies that back the chat's claims, so patients can bring evidence to their provider. |
| 🔜 | **Chat → Vertex for production** | Flip `CHAT_PROVIDER` from `anthropic` (dev) to `vertex` once the GCP billing account matures and Claude quota is granted — keeps PHI under the single Google Cloud BAA. |
| 🔜 | **Journaling system (v1)** | Symptom check-ins as orchestrators embedding independent journals; sleep & activity as their own entities. 11 journal types total. |
| 🔜 | **Admin console (v1)** | *(featured — see below)* Internal admin surface, separate from the consumer dashboard, may share APIs. First job: review/approve/publish marketing content. |
| 🔜 | **Book-driven marketing content engine** | *(featured — see below)* Generate book-grounded social content from FAQ-style topics → approval queue → publish. Reuse existing marketing cloud functions from another GCP project. |
| 🔜 | **Deploy consumer app to GCP + CI/CD** | Deploy the Next.js web (and FastAPI) to GCP; GitHub Actions → Cloud Run pipeline (`ignitehealthnow-2025`). Pulled forward from "Later". |

> Ordering within **Next** is provisional — priorities to be set with the team.

---

## Later

| Status | Item | Notes |
|--------|------|-------|
| 🗓️ | **Full journal suite** | All 11 types incl. dedicated bowel-movement journal (Bristol scale, blood/photo tracking), medication, sleep, activity. |
| 🗓️ | **AI completion agent** | Gentle, non-nagging reminders to fill in missing journal fields. |
| 🗓️ | **Health Advocate Agent (v2)** | Knows the user's own data, interprets patterns over time, preps the user for specific doctor visits ("connect-the-dots" insights). |
| 🗓️ | **Provider portal** | Role-based web access; providers see only patients who granted access; patient-controlled sharing. Data model planned now (`access_grant`), built later. |
| 🗓️ | **Auth migration Supabase → GCP** | Move to Firebase/Identity Platform + Cloud SQL; build provider-agnostically to keep the switch cheap. |
| 💡 | **Anonymized group study** | De-identified, opt-in collective data so cohorts can be studied to improve care. |

---

## Featured: Evidence-base citations

**Goal:** when the chat makes a claim, let the patient see the actual published research
behind it — real journals/studies they (or their provider) can verify. This is the
evidence half of patient advocacy.

**What we have:** the book's bibliography is already ingested (`source_type="reference"`,
~13 chunks in the KB).

**Hard problems to solve (why this is its own design effort, not a toggle):**
1. **No fabricated citations.** LLMs invent realistic-looking but fake references — unacceptable
   in a medical context. Only ever surface a citation that *literally exists* in retrieved KB
   chunks; pull reference text programmatically, never let the model generate it.
2. **Claim ↔ citation linking.** The bibliography is a flat list; the book's claim→study links
   (footnotes/superscripts) are likely lost in chunking, and a symptom question won't
   semantically retrieve a bibliography entry. Needs links preserved at ingestion + a dedicated
   reference-retrieval path.
3. **Presentation.** Distinct from the unpublished source book — these are independent,
   published references and *can* be shown (unlike the book itself, which is never named).

**Next step:** quick brainstorm → spec, starting with an audit of what those ~13 reference
chunks actually contain (needs the Cloud SQL proxy).

---

## Featured: Admin console & book-driven marketing content

**Goal:** an internal **admin console** (separate from the consumer dashboard) that runs a
**book-grounded social-content pipeline** — generate short-form social posts that answer common
patient questions, route them into an approval queue, and publish to social channels once
approved. Content marketing that doubles as patient education.

**How it works (sketch — details TBD):**
1. **Topics in.** FAQ-style patient questions drive generation, e.g.
   *"Why am I feeling so tired…?"*, *"Are my T3 levels too low?"*, *"How much T4 should I have vs. T3?"*, *"What is Free T3?"*
2. **Generate.** Use the same **book RAG/KB** that powers the consumer chat to draft posts grounded
   in the book's knowledge — so the consumer chat and the marketing generator are two consumers of
   one book-knowledge service (likely a shared content/generation API).
3. **Approve.** Generated items land in the **admin console** as a review queue: edit → approve → reject.
4. **Publish.** Approved items get scheduled / posted to social channels.

**Reuse:** marketing/content engines are **already deployed as Cloud Functions on another GCP
project** — the plan is to **reuse/port** these rather than rebuild. (Integration path TBD — needs a
look at how those functions are structured.)

**Guardrails:** public content follows the **same non-diagnostic rules** as the chat (educational,
never diagnostic, no medication dosing) and, like the chat, **never names or quotes the unpublished
source book**.

**Open questions (for later discussion):** which social channels; scheduling/cadence; who approves
and how many approval stages; analytics/performance tracking; exact reuse path for the existing
Cloud Functions; whether the admin console is a new app or a role-gated area of the web app.

---

## Notes / constraints

- **HIPAA:** keep PHI under a BAA. Production LLM calls go through Vertex (single Google Cloud
  BAA). Anthropic-direct is a dev-only stopgap and would need its own BAA before real PHI.
- **Source book is unpublished** — the chat uses its knowledge but never names or cites it to users.
- **Shared logic:** keep conditional/validation logic portable between Flutter and the Next.js
  web client (declarative field config, not hardcoded widgets).
