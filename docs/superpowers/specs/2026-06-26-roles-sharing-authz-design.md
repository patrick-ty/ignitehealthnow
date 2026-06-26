# Roles, Patient-Controlled Sharing & Reports — Authorization Design

**Date:** 2026-06-26
**Status:** Approved design, pending user review of this doc
**Scope:** Primarily a **data model + authorization-enforcement pattern to adopt now** so foundation work doesn't contradict it. The provider-portal UI, caregiver flows, and report builder are **Phase 4** (PRD §11). Maps to PRD §9 (Reports), §11 (Provider Portal), and memory `project_provider_portal`, `project_founding_principle`.
**Related:** `2026-06-26-auth-provider-contract.md` (authN), `project_auth_migration_plan`.

## 1. Purpose

Define how the platform decides **who may access which of a patient's data or views** — supporting three relationships (patient, caregiver, provider), patient-controlled sharing, and shareable reports. This is **authorization (authZ)**, distinct from the authentication layer already built.

**Founding-principle alignment:** patients own their data and control all sharing; the system is an instrument that hands a *legible, bounded* artifact to a human (caregiver/provider), never an authority. Sharing is collaborative, revocable, and audited.

## 2. Core Model & Principles

- **Relational roles.** Everyone is a `user`. Being a **patient** = owning health data. **caregiver / provider** = a *relationship* a patient grants over their data. One account can be both (e.g., a patient who also caregives for a parent). A provider may additionally be a **verified** account (clinician credentialing).
- **The `access_grant` table is the single source of authorization truth.** Access decisions are made from this table in the database — **NOT** from JWT role claims. The JWT only identifies the user (`user_id` stays opaque; the auth provider contract is unchanged).
- **Patient-controlled.** The patient initiates, scopes, time-limits, and revokes every grant. Grantees cannot self-grant.
- **Enforced at the API** (the data boundary), uniformly for raw data *and* designated views/pages. Thin clients render based on grants; the API enforces.
- **Caregiver = proxy.** A caregiver can read AND write on the patient's behalf (assisted entry). Every write is attributed to the actual author.
- **Provider = read-only.** Providers view shared data, keep private notes, and cannot modify patient data.

## 3. Data Model (foundation — adopt now)

### 3.1 `access_grant` (the permissions table)
```sql
create table access_grant (
    id               uuid primary key default gen_random_uuid(),
    patient_user_id  uuid not null,              -- the data owner ("for that patient")
    grantee_user_id  uuid,                        -- the account granted access; NULL for tokenized links
    role             text not null check (role in ('caregiver','provider')),
    target_type      text not null check (target_type in ('data_scope','view')),
    target           text not null,               -- data category (journals|labs|photos|insights) OR a view/report id
    permission       text not null check (permission in ('read','read_write')),
    status           text not null check (status in ('pending','active','revoked')) default 'pending',
    expires_at       timestamptz,                 -- time-limited sharing (NULL = no expiry)
    token_hash       text,                        -- for shareable links (hash of the link token)
    verification     jsonb,                       -- link verification config (email-OTP | passphrase)
    invited_email    text,                        -- invite target before account link
    created_at       timestamptz not null default now(),
    accepted_at      timestamptz,
    revoked_at       timestamptz
);
```
- **caregiver** grant: `role=caregiver, permission=read_write`, `target_type=data_scope` (typically broad).
- **provider** grant: `role=provider, permission=read`, scoped by data category and/or specific report `view`.
- **report link**: `target_type=view`, `grantee_user_id=NULL`, `token_hash` + `verification` set, `expires_at` set.

### 3.2 Cross-cutting rules on every health-data table (journals, labs, photos, …)
Adopt these as each data table is built:
- `owner_user_id` (the patient) **and** `entered_by_user_id` (who actually created/edited it — patient or caregiver). Enables caregiver-proxy audit and integrity.
- **Access rule = "owner OR an active, unexpired grant covering this target."** Never hardcode "owner only" — that would silently block sharing. (Applies to the RAG `user_note` retrieval, the profile service, and all future journal queries.)

### 3.3 `access_audit`
```sql
create table access_audit (
    id              uuid primary key default gen_random_uuid(),
    occurred_at     timestamptz not null default now(),
    patient_user_id uuid not null,     -- whose data
    actor_user_id   uuid,              -- who accessed (NULL for link viewers; capture token id)
    action          text not null,     -- 'view' | 'export' | 'write'
    target_type     text not null,
    target          text not null,
    details         jsonb not null default '{}'   -- metadata only, never PHI content
);
```
Patients can see who accessed their data; providers/caregivers have an accountable trail.

### 3.4 Account attribute
- `provider_verified boolean` (on the profile/user) — clinician credentialing gate; a patient may only grant `provider` role to a verified provider (policy decision, enforced at invite time).

## 4. Authorization Enforcement

A single API authorization primitive, called on every data/view request:

```
can_access(actor, patient_id, target_type, target, need: read|write) -> bool
  • actor is the patient themselves (actor == patient_id)                         -> allow
  • OR an active, unexpired access_grant exists:
        patient_user_id = patient_id
        grantee_user_id = actor   (or a validated link token)
        covers (target_type, target)         [exact, or category covers item]
        permission satisfies `need`          (read_write satisfies read)
        status = 'active' AND (expires_at IS NULL OR expires_at > now())
  • else                                                                          -> deny
  • on every allow for a non-owner: write an access_audit row
```
- Enforced **only at the API**; clients never decide access.
- The check is provider-agnostic (pure DB lookup), so it survives the Supabase→GCP move unchanged.

## 5. Sharing Mechanisms

### 5.1 In-platform grant (caregiver / provider with an account)
Patient invites by email → `access_grant` row created `status=pending`, `invited_email` set → grantee signs in/accepts → `grantee_user_id` bound, `status=active`. Patient can `revoke` anytime (`status=revoked`, `revoked_at`). Patient always initiates; grantees cannot request unsolicited (v1).

### 5.2 Shareable report link (off-platform recipient)
A grant with `target_type=view`, `grantee_user_id=NULL`, a high-entropy token (only its **hash** stored), `expires_at`, and **verification** before viewing: a one-time code emailed to the recipient *or* a passphrase the patient sets and shares out-of-band. Revocable; every view audited (token id, not a person). Never a raw-data link — links target a bounded report/view only.

## 6. Reports as Designated Views

A **report** is a first-class, bounded, clinically-framed projection of patient data (PRD §9): symptom trends, labs with dual ranges, ratios, med/supplement timeline, suggested discussion points, etc. Properties:
- **Snapshot or live:** a report can be a **point-in-time snapshot** (immutable — "the report I brought March 20") or a **live designated view**.
- **Formats:** in-app view, PDF export, tokenized shareable link (§5.2).
- **Bounded by design:** sharing a report exposes only that projection, not the raw data firehose — the safer, clinically-aligned default. Photos appear only if the patient explicitly includes them.
- **Targetable by a grant** (`target_type=view`).

## 7. Phasing

- **Foundation (adopt now):** the `access_grant` table; the `owner_user_id` + `entered_by_user_id` columns and the "owner-or-granted" access rule on data tables as they're built; the single `can_access` API primitive; `access_audit`. This ensures nothing built now contradicts sharing.
- **Phase 4 (PRD §11, later):** provider-portal UI + roster, caregiver invite/management flows, the report builder + PDF/link generation, provider private notes, verification/credentialing workflow.

## 8. Security & Compliance Notes
- Authorization is PHI-gating — defense in depth: API enforcement + audit + least-privilege DB role. (RLS is not the enforcement mechanism here; the relational grant logic lives in the API, consistent with the Cloud SQL data tier.)
- Shareable-link tokens: store only the hash; require verification; expire and allow revocation; rate-limit verification attempts.
- `access_audit` and all logs carry **metadata only, never PHI content** (consistent with the RAG audit rule).
- Provider verification gates who can receive the `provider` role.

## 9. Open Items / Deferred
- Per-date-range-of-data scoping (deferred; v1 is by category + report).
- Grantee-initiated access requests (deferred; v1 is patient-initiated only).
- Whether a verified-provider directory exists, or providers are invited purely by email.
- Snapshot storage format for reports (PDF blob vs. serialized data projection) — decide at report-builder time.
