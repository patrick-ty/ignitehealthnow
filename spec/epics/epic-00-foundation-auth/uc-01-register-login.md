# UC 00.1 — Register, Login, Logout

## Purpose
Enable a new user to create an account and an existing user to log in/out on Mobile and Web using Supabase Auth.

## Preconditions
- Supabase project configured for the environment (dev/prod)
- Clients have Supabase URL + anon key via environment config

## Story 00.1 — Registration entry points
As a user, I want to register so I can start using the app.

### Acceptance Criteria
- Mobile and Web auth screens include: "Create account" and "Sign in"
- Registration supports email-based registration (magic link OR email+password; implementation choice must be documented)
- Successful registration results in an authenticated session
- After first auth, user is routed to Profile Setup (blocking gate)

### Tests (Gherkin)
Scenario: New user registers and is routed to Profile Setup
  Given I am on the auth screen
  When I register with a valid email
  Then I should have an authenticated session
  And I should be routed to Profile Setup

## Story 00.2 — Login
As a user, I want to log in so I can access my account.

### Acceptance Criteria
- Mobile and Web support sign-in
- Session persists across app restart/refresh
- User can log out and session is cleared

### Tests (Gherkin)
Scenario: Existing user logs in and sees Profile Setup if incomplete
  Given I have an existing account
  When I sign in successfully
  Then I should have an authenticated session
  And if my profile is incomplete I should be routed to Profile Setup

Scenario: User logs out
  Given I am authenticated
  When I log out
  Then my session is cleared
  And protected API calls fail with 401