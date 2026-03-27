# Epic 00 — Use Case 04: Password Recovery (Forgot Password)

## Purpose
Allow users who cannot log in to securely regain access to their account without manual support.

This flow relies on Supabase Auth password recovery and must not expose account existence or sensitive state.

---

## Preconditions
- User is logged out
- User has an account registered with an email address

---

## Key Constraints
- Do not reveal whether an email exists in the system
- Password reset is handled by Supabase Auth
- Reset links must expire per Supabase defaults
- All UX copy must be neutral and non-confirming

---

## Story 00.9 — Request password reset

As a user, I want to request a password reset so I can regain access if I forget my password.

### Acceptance Criteria
- “Forgot password?” is available on login screen (web + mobile)
- User enters email address
- System always responds with a neutral success message:
  “If an account exists for this email, you’ll receive a reset link.”
- Supabase resetPasswordForEmail is invoked
- No indication is given whether the email exists

### Tests
Scenario: Request password reset with valid email
  Given I am on the login screen
  When I submit my email for password recovery
  Then I see a neutral confirmation message
  And no account existence is revealed

Scenario: Request password reset with unknown email
  Given I am on the login screen
  When I submit an unknown email
  Then I see the same neutral confirmation message

---

## Story 00.10 — Reset password via email link

As a user, I want to set a new password after clicking the reset link so I can regain access to my account.

### Acceptance Criteria
- Reset link opens a password reset screen (web or deep-linked mobile)
- User can enter and confirm a new password
- Password must meet Supabase policy requirements
- On successful reset:
  - User is authenticated
  - If profile is incomplete, redirect to profile completion
  - Otherwise, redirect to home screen

### Tests
Scenario: Successful password reset
  Given I open a valid reset link
  When I submit a new valid password
  Then I am logged in
  And redirected appropriately

---

## Story 00.11 — Expired or invalid reset link

As a user, I want clear guidance if my reset link is no longer valid.

### Acceptance Criteria
- Expired or invalid links show a clear error message
- User is offered the option to request a new reset email
- No sensitive account information is displayed

---

## Security Notes
- All reset handling is delegated to Supabase Auth
- No custom token generation or storage
- No logging of email addresses or reset tokens