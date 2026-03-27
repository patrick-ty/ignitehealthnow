# Ignite Health — Agent Instructions (MANDATORY)

This repository uses a **spec-first development model**.

If you are an AI coding agent (Claude Code, Codex, Warp, etc.), you MUST follow these rules.

---

## 1. Source of Truth (Non-Negotiable)

The canonical source of truth is the **spec folder**:

- `spec/ignite-health-spec-v1.md`
- `spec/architecture/**`
- `spec/epics/**`

If there is any conflict between:

- Code
- GitHub Issues
- Chat conversations
- Assumptions

👉 **The spec files always win.**

GitHub Issues are **execution slices**, not full requirements.

---

## 2. Required Execution Process

For **any GitHub Issue**:

1. Open the issue
2. Identify referenced spec files
3. Read the full epic README
4. Read the specific use case (`uc-*.md`)
5. Implement **only** what is explicitly defined
6. Add/update tests that map to acceptance criteria
7. Stop

Do NOT:

- Implement adjacent stories
- “Improve” UX without spec changes
- Guess missing behavior

---

## 3. Handling Ambiguity (CRITICAL)

If anything is unclear, missing, or contradictory:

❌ Do NOT guess  
❌ Do NOT invent requirements

✅ Instead:

1. Stop implementation
2. Propose a spec change (diff or markdown update)
3. Wait for confirmation before proceeding

---

## 4. Scope Control

You are **not allowed** to:

- Refactor unrelated code
- Add new endpoints not in the issue
- Add new tables, fields, or events without spec updates
- Rename things for “cleanliness”

Stick to the smallest valid implementation.

## 4.A Scope Guardrails (Repo Hygiene + Velocity)

Default rule: **work in ONE scope per issue** unless scope is explicitly expanded.

### Scopes

- **API scope**: `api/**`, API tests, API docs that directly describe API behavior.
- **Web scope**: `web/**`, web tests, web docs that directly describe web behavior.
- **Spec/Docs scope**: `spec/**`, `docs/**`, `AGENT_INSTRUCTIONS.md`.

### Default behavior (non-negotiable)

- Pick a **primary scope** at the start of the issue and only modify files in that scope.
- If you discover the fix requires changes outside the chosen scope:
  - ✅ You MAY read other scopes to diagnose.
  - ❌ You MUST NOT edit other scopes.
  - ✅ You MUST stop and produce a **Baton Note** (see below).

### Explicit scope expansion (escape hatch)

Cross-scope work is allowed **only** when explicitly authorized, using one of:

- **Scope: API+Web (paired fix)**
- **Scope: Spec+API**
- **Scope: Spec+Web**
- **Scope: Spec+API+Web** (rare)

When scope is expanded:

- Commits MUST remain thematically separated by scope.
- The working tree MUST be clean between scope commits.

### Baton Note (Required Handoff Format)

When cross-scope work is required but not authorized, output exactly:

**Baton Note**

- What I changed (files + why):
- What still fails (symptom + where observed):
- Next patch (minimal file list + exact intended change):
- How to verify (commands / endpoint / UI steps):

Failure to stop and produce a Baton Note is a process violation.

---

## 5. Architecture Constraints (Hard Rules)

You must respect:

- Supabase Auth as the identity provider
- JWT validation via Supabase JWKS
- FastAPI for backend
- Flutter for mobile
- Next.js for web
- Thin clients; logic lives in the API
- RLS enforced in the database

Do not introduce alternative auth systems or frameworks.

---

## 6. Testing Rules

- Tests must directly map to acceptance criteria
- Prefer unit + integration tests
- Do not add snapshot tests unless specified
- Failing tests = incomplete implementation

---

## 7. Stopping Condition

When the issue’s acceptance criteria are satisfied:

- Stop
- Summarize what was done
- Reference:
  - Issue number
  - Spec file(s)
  - Tests added

Do NOT continue to the next issue automatically.

---

## 8. If You Are Unsure

Stop and ask.

Silence or assumptions are considered failures.

---

## 9. Development Journal (Required Practice)

This project maintains a running development journal to preserve
architectural intent and decision history.

Rules:

- All non-trivial implementation work MUST add an entry to `docs/devjournal-XXX.md`
- Journals are sequentially numbered (do not overwrite existing entries)
- Entries should include:
  - What was implemented
  - Why this approach was chosen
  - Alternatives considered (if any)
  - Gotchas, bugs, or constraints encountered
  - Follow-up TODOs or known limitations

This journal exists to prevent future ambiguity and rework.
If you are unsure whether something is "non-trivial", assume it is.

### Dev Journal Size & Scope Rules

- Dev journals document a single coherent decision set (one conceptual change set), not a time period.
- Start a new devjournal when:
  - the problem domain/theme changes (auth -> profile -> journaling -> web UI, etc.)
  - you introduce a new architectural invariant or security posture change
  - you would add a new top-level markdown section (##) for a different decision area
- Soft cap: ~800 words (aim 400–800).
- Hard rule: if a new top-level section introduces a new decision area, start a new devjournal file instead.
- Journals must follow this required structure:

  # Dev Journal XXX — <Concise Title>

  ## Context

  ## Decision(s)

  ## Rationale

  ## Alternatives Considered

  ## Constraints / Gotchas

  ## Follow-ups / TODOs

- Journals are explanatory, not exhaustive (not a changelog, not commit messages expanded).

## 10. Repository Hygiene Rules (Required)

- Keep PRs/commits small and thematically grouped; avoid mixing spec + code + web scaffolding in one commit unless the issue demands it.
- At the end of each issue/PR, ensure `git status` is clean (no unrelated untracked files).
- If new files are generated by tooling (e.g., web scaffolding), either:
  1. commit them as a dedicated “chore/scaffold” commit with a clear message, OR
  2. remove them before finishing the issue, OR
  3. explicitly list them in the issue/PR as intentional.
- Do not leave behind scratch files (e.g., `api/test_auth.py`) unless referenced by specs/tests.
- Use a “3-bucket staging practice”:
  - Stage and commit SPEC changes separately from CODE changes.
  - Stage and commit TEST changes either with code or as a separate commit, but don’t mix with unrelated docs.
  - If multiple domains must change, do multiple commits.

Suggested commands:

- `git status`
- `git diff`
- `git add -p`
- `git commit`
- `git restore --staged <file>`

---

## 11. Identity & Privacy Guardrails (Non-Negotiable)

These rules exist to protect user privacy and prevent accidental
reintroduction of PII leakage.

- Handles must **NEVER** be derived from `first_name`, `last_name`, or any decrypted PII.
- `display_name` must **NEVER** default to decrypted profile fields.
- Handle generation must use **repository-managed wordlists only**:
  - `handle_allowlist.txt`
  - `handle_denylist.txt`
  - `handle_reserved.txt`
- Encryption boundaries are **intentional** and must not be expanded
  without an explicit spec update.
- If identity, profile, or PII-handling behavior is unclear:
  - Stop
  - Update the spec
  - Wait for confirmation before changing code

---

## 12. End-of-Issue Checklist (MANDATORY)

Before closing any issue, switching epics, or starting new work:

- [ ] Specs reviewed and either updated or explicitly unchanged
- [ ] Dev journal written if work was non-trivial
- [ ] Tests pass locally
- [ ] `git status` is clean
- [ ] No untracked files remain
- [ ] Commits are scoped and correctly named

Failure to complete this checklist is considered **incomplete work**.
