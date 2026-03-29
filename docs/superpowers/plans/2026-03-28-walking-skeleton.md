# Walking Skeleton Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Flutter app that authenticates with Supabase, communicates with the FastAPI backend, shows a navigation shell, and displays a placeholder dashboard — proving the entire stack works end-to-end.

**Architecture:** Flutter mobile app using Riverpod for state management, connecting to the existing FastAPI backend at `api.ignitehealthnow.com` (localhost:8000 for dev). Supabase handles auth; the API handles all business logic. The app is a thin client that renders UI and delegates everything else to the API. An architecture.md documents the full system.

**Tech Stack:** Flutter 3.x, Riverpod (flutter_riverpod + riverpod_annotation), supabase_flutter, dio (HTTP client), go_router (navigation), hive_flutter (local storage), freezed (immutable models)

---

## Chunk 1: Architecture Doc + Project Scaffold

### Task 1: Write Architecture Document

**Files:**
- Create: `docs/architecture.md`

- [ ] **Step 1: Write architecture.md**

```markdown
# IgniteHealthNow — System Architecture

## Overview

IgniteHealthNow is a multi-platform health journaling system for hypothyroid patients. The system consists of:

1. **Unified REST API** — FastAPI (Python 3.14), deployed on GCP Cloud Run at `api.ignitehealthnow.com`
2. **Flutter Mobile App** — iOS + Android, primary user interface
3. **Next.js Web App** — Patient web access + Provider portal with role-based access
4. **Supabase** — PostgreSQL database with RLS, authentication provider
5. **GCP Services** — Cloud KMS (encryption), Cloud Storage (photos/assets), Cloud Run (API hosting)

## Principles

- **One API, all clients** — Flutter and Next.js both consume the same REST API. No BFF pattern.
- **Thin clients** — All business logic lives in the API. Clients render UI, handle local state, and delegate to the API.
- **Spec-first** — Specs in `spec/` and `docs/` are the source of truth. Code implements specs, not the reverse.
- **Journal types are independent** — Each journal type has its own table, API endpoints, and field config. Check-ins are orchestrators that compose journals.
- **Patient-controlled data** — Patients own their data. Providers only see data patients explicitly grant access to.

## Data Flow

```
Flutter App / Next.js Web
    │
    ├── Auth ──────────► Supabase Auth (JWT tokens)
    │
    └── All other calls ► FastAPI REST API (api.ignitehealthnow.com)
                             │
                             ├── Validates JWT (RS256/JWKS from Supabase)
                             ├── Business logic + validation
                             ├── PII encryption via GCP KMS
                             └── Supabase Postgres (RLS enforced)
                                  │
                                  ├── pii schema (encrypted profile data)
                                  └── public schema (journal data, RLS per user)
```

## Authentication Flow

1. User signs up/in via Supabase Auth (email/password, future: passkeys)
2. Supabase issues a JWT (RS256 signed)
3. Client stores the JWT and sends it as `Authorization: Bearer <token>` on all API calls
4. FastAPI middleware validates JWT via Supabase JWKS endpoint
5. User ID extracted from JWT `sub` claim, used for RLS enforcement
6. Profile bootstrapped on first API call (idempotent)

## Flutter App Architecture

```
mobile/lib/
├── app.dart                     # MaterialApp, GoRouter, ProviderScope
├── config/
│   ├── env.dart                 # Environment config (Supabase URL, API URL)
│   └── constants.dart           # App-wide constants
├── models/                      # Freezed data classes
├── providers/                   # Riverpod providers (state + async)
├── services/                    # API client, auth, local storage
├── screens/                     # Screen widgets (one per route)
├── widgets/                     # Reusable UI components
└── theme/                       # ThemeData, colors, typography
```

**State Management:** Riverpod
- `AsyncNotifierProvider` for API-backed state (profile, journal data)
- `StateNotifierProvider` for local UI state (form values, navigation)
- Providers are the single source of truth; widgets rebuild reactively

**Navigation:** GoRouter with shell route for bottom nav
- Auth guard redirects to login if no session
- Profile gate redirects to profile setup if incomplete

**HTTP Client:** Dio with interceptor for JWT injection
- Base URL from env config
- Auth interceptor reads token from Supabase session
- Error interceptor maps API errors to typed exceptions

**Local Storage:** Hive for offline drafts and cached data
- Journal drafts saved per-card as user progresses
- Synced to API when connectivity available

## API Architecture (Existing)

- FastAPI 0.115.0, Python 3.14, Poetry
- Supabase client SDK for DB access
- JWT validation via python-jose (RS256/JWKS + HS256 dev fallback)
- PII encryption via GCP KMS envelope encryption
- RLS policies enforce per-user data isolation

**Existing endpoints:**
- `GET /health` — public health check
- `GET /me` — current user identity (authenticated)
- `GET /profile` — get/bootstrap profile (authenticated)
- `PATCH /profile` — update profile (authenticated)
- `PUT /profile/properties/{key}` — set property (authenticated)
- `DELETE /profile/properties/{key}` — delete property (authenticated)

**To be added:** Journal endpoints per the design spec.

## Database

- **pii schema** — encrypted user profile data (first_name, last_name, mobile, zipcode)
- **public schema** — journal data (per-journal-type tables), check-in orchestrator status
- **RLS** — all tables enforce `auth.uid() = user_id`

## Environments

| Environment | API | Database | Auth |
|---|---|---|---|
| Local dev | localhost:8000 | Supabase cloud (dev project) | Supabase Auth |
| Staging | api-staging.ignitehealthnow.com | Supabase cloud (staging) | Supabase Auth |
| Production | api.ignitehealthnow.com | Supabase cloud (prod) | Supabase Auth |

## Security

- JWT validation on every authenticated request
- PII encrypted at rest via GCP KMS (envelope encryption)
- RLS enforces per-user data isolation at database level
- No PII in logs (structured logging with user_id context var)
- CORS restricted to known origins
- HIPAA-aware posture (see spec/architecture/07-5-security-hipaa-ready-posture.md)
```

- [ ] **Step 2: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: add system architecture overview"
```

---

### Task 2: Scaffold Flutter Project

**Files:**
- Create: `mobile/` (Flutter project via `flutter create`)
- Modify: `mobile/pubspec.yaml` (add dependencies)
- Create: `mobile/analysis_options.yaml`

- [ ] **Step 1: Create Flutter project**

```bash
cd /Volumes/Data/projects/ignitehealthnow
# Remove existing placeholder
rm -rf mobile/README.md mobile/.env mobile/.env.example
# Create Flutter project in mobile/
flutter create --org com.ignitehealthnow --project-name ignite_health mobile
```

- [ ] **Step 2: Verify project created**

```bash
cd mobile && flutter doctor && flutter pub get
```

Expected: No errors, dependencies resolved.

- [ ] **Step 3: Add dependencies to pubspec.yaml**

Replace the `dependencies` and `dev_dependencies` sections in `mobile/pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  # State management
  flutter_riverpod: ^2.6.1
  riverpod_annotation: ^2.6.1
  # Navigation
  go_router: ^14.8.1
  # Networking
  dio: ^5.7.0
  # Auth
  supabase_flutter: ^2.8.4
  # Local storage
  hive_flutter: ^1.1.0
  # Immutable models
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  # Utilities
  flutter_dotenv: ^5.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
  build_runner: ^2.4.14
  freezed: ^2.5.7
  json_serializable: ^6.9.0
  riverpod_generator: ^2.6.3
  mockito: ^5.4.5
  build_verify: ^3.1.0

flutter:
  uses-material-design: true
  assets:
    - .env
```

- [ ] **Step 4: Install dependencies**

```bash
cd /Volumes/Data/projects/ignitehealthnow/mobile
flutter pub get
```

Expected: All dependencies resolved successfully.

- [ ] **Step 5: Create .env file**

Create `mobile/.env`:

```
SUPABASE_URL=https://ijfleqptkeeepymlewha.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZmxlcXB0a2VlZXB5bWxld2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjU4NDQsImV4cCI6MjA3ODQwMTg0NH0.aJIcDKrE7BqV5d0uCP45_1aXoq95ricTKBfsvZGjZrA
API_URL=http://localhost:8000
```

Ensure `mobile/.env` is in `.gitignore` (already covered by root `.gitignore`).

Create `mobile/.env.example` (committed to git as documentation):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_URL=http://localhost:8000
```

- [ ] **Step 6: Create analysis_options.yaml**

Create `mobile/analysis_options.yaml`:

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  errors:
    invalid_annotation_target: ignore
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
    avoid_print: true
```

- [ ] **Step 7: Commit**

```bash
git add mobile/
git commit -m "feat: scaffold Flutter project with Riverpod, Supabase, Dio dependencies"
```

---

### Task 3: Environment Config + App Theme

**Files:**
- Create: `mobile/lib/config/env.dart`
- Create: `mobile/lib/config/constants.dart`
- Create: `mobile/lib/theme/app_theme.dart`
- Create: `mobile/lib/theme/app_colors.dart`

- [ ] **Step 1: Create env config**

Create `mobile/lib/config/env.dart`:

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get apiUrl => dotenv.env['API_URL'] ?? 'http://localhost:8000';
}
```

- [ ] **Step 2: Create constants**

Create `mobile/lib/config/constants.dart`:

```dart
class AppConstants {
  static const String appName = 'IgniteHealth';
  static const Duration apiTimeout = Duration(seconds: 30);
  static const int maxNotesLength = 200;
  static const int minEngagementDaysForSameAsYesterday = 14;
}
```

- [ ] **Step 3: Create app colors**

Create `mobile/lib/theme/app_colors.dart`:

```dart
import 'package:flutter/material.dart';

class AppColors {
  // Background
  static const Color background = Color(0xFFF8F7F4);
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFF0EEEB);

  // Primary
  static const Color primary = Color(0xFF3A7D5C);
  static const Color primaryLight = Color(0xFFE8F5EE);
  static const Color primaryDark = Color(0xFF2D6A4F);

  // Semantic
  static const Color caution = Color(0xFFD4A017);
  static const Color cautionLight = Color(0xFFFEF6E8);
  static const Color negative = Color(0xFFC75B39);
  static const Color negativeLight = Color(0xFFFCE8E8);

  // Text
  static const Color textPrimary = Color(0xFF2C2C2E);
  static const Color textSecondary = Color(0xFF8E8E93);
  static const Color textTertiary = Color(0xFFAEAEB2);

  // Borders
  static const Color border = Color(0xFFE0E0E4);
  static const Color borderLight = Color(0xFFF0EEEB);

  // Cycle
  static const Color cyclePurple = Color(0xFF7C5CBF);
  static const Color cyclePurpleLight = Color(0xFFF0EBFF);

  // Agent
  static const Color agentPurple = Color(0xFF7C5CBF);
  static const Color agentPurpleLight = Color(0xFFF5F0FF);

  // Slider gradient stops
  static Color sliderColor(int value) {
    if (value <= 3) return negative;
    if (value <= 5) return caution;
    if (value <= 7) return const Color(0xFF5A9A74);
    return primary;
  }
}
```

- [ ] **Step 4: Create app theme**

Create `mobile/lib/theme/app_theme.dart`:

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.cyclePurple,
        surface: AppColors.cardBackground,
        error: AppColors.negative,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: -0.2,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.06),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        hintStyle: const TextStyle(color: AppColors.textTertiary, fontSize: 14),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w300, color: AppColors.textPrimary),
        headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary, letterSpacing: -0.3),
        titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        titleMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        bodyLarge: TextStyle(fontSize: 16, color: AppColors.textPrimary),
        bodyMedium: TextStyle(fontSize: 14, color: AppColors.textPrimary),
        bodySmall: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textTertiary, letterSpacing: 0.8),
      ),
    );
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/config/ mobile/lib/theme/
git commit -m "feat: add env config, app colors, and light theme"
```

---

### Task 4: API Client (Dio + Auth Interceptor)

**Files:**
- Create: `mobile/lib/services/api_client.dart`
- Create: `mobile/lib/services/api_exceptions.dart`
- Create: `mobile/lib/providers/api_provider.dart`

- [ ] **Step 1: Create API exceptions**

Create `mobile/lib/services/api_exceptions.dart`:

```dart
class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Map<String, dynamic>? errors;

  const ApiException({
    required this.statusCode,
    required this.message,
    this.errors,
  });

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 422;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class NetworkException implements Exception {
  final String message;
  const NetworkException(this.message);

  @override
  String toString() => 'NetworkException: $message';
}
```

- [ ] **Step 2: Create API client**

Create `mobile/lib/services/api_client.dart`:

```dart
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';
import '../config/constants.dart';
import 'api_exceptions.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: Env.apiUrl,
      connectTimeout: AppConstants.apiTimeout,
      receiveTimeout: AppConstants.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(_AuthInterceptor());
    _dio.interceptors.add(_ErrorInterceptor());
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.get<T>(path, queryParameters: queryParameters);

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
  }) =>
      _dio.post<T>(path, data: data);

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
  }) =>
      _dio.put<T>(path, data: data);

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
  }) =>
      _dio.patch<T>(path, data: data);

  Future<Response<T>> delete<T>(String path) => _dio.delete<T>(path);
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      options.headers['Authorization'] = 'Bearer ${session.accessToken}';
    }
    handler.next(options);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException error, ErrorInterceptorHandler handler) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      handler.reject(DioException(
        requestOptions: error.requestOptions,
        error: const NetworkException('Unable to connect to server'),
      ));
      return;
    }

    final response = error.response;
    if (response != null) {
      handler.reject(DioException(
        requestOptions: error.requestOptions,
        error: ApiException(
          statusCode: response.statusCode ?? 500,
          message: response.data?['detail'] ?? 'Unknown error',
          errors: response.data is Map ? response.data : null,
        ),
      ));
      return;
    }

    handler.next(error);
  }
}
```

- [ ] **Step 3: Create API provider**

Create `mobile/lib/providers/api_provider.dart`:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/api_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});
```

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/services/api_client.dart mobile/lib/services/api_exceptions.dart mobile/lib/providers/api_provider.dart
git commit -m "feat: add Dio API client with auth interceptor and error handling"
```

---

### Task 5: Auth Service + Provider

**Files:**
- Create: `mobile/lib/services/auth_service.dart`
- Create: `mobile/lib/providers/auth_provider.dart`
- Create: `mobile/lib/models/auth_state.dart`

- [ ] **Step 1: Create auth state model**

Create `mobile/lib/models/auth_state.dart`:

```dart
import 'package:supabase_flutter/supabase_flutter.dart' show Session;

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final String? userId;
  final Session? session;
  final String? error;

  const AuthState({
    this.status = AuthStatus.unknown,
    this.userId,
    this.session,
    this.error,
  });

  const AuthState.unknown() : this(status: AuthStatus.unknown);
  const AuthState.authenticated(Session session)
      : this(
          status: AuthStatus.authenticated,
          userId: session.user.id,
          session: session,
        );
  const AuthState.unauthenticated([String? error])
      : this(status: AuthStatus.unauthenticated, error: error);

  bool get isAuthenticated => status == AuthStatus.authenticated;
}
```

- [ ] **Step 2: Create auth service**

Create `mobile/lib/services/auth_service.dart`:

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _client;

  AuthService(this._client);

  Session? get currentSession => _client.auth.currentSession;
  String? get currentUserId => currentSession?.user.id;

  Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signUp(
      email: email,
      password: password,
    );
  }

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }
}
```

- [ ] **Step 3: Create auth provider**

Create `mobile/lib/providers/auth_provider.dart`:

```dart
import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;

import '../models/auth_state.dart';
import '../services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(Supabase.instance.client);
});

final authStateProvider =
    StateNotifierProvider<AuthStateNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthStateNotifier(authService);
});

class AuthStateNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  StreamSubscription? _subscription;

  AuthStateNotifier(this._authService) : super(const AuthState.unknown()) {
    _init();
  }

  void _init() {
    // Check current session
    final session = _authService.currentSession;
    if (session != null) {
      state = AuthState.authenticated(session);
    } else {
      state = const AuthState.unauthenticated();
    }

    // Listen for auth changes
    _subscription =
        Supabase.instance.client.auth.onAuthStateChange.listen((event) {
      final session = event.session;
      if (session != null) {
        state = AuthState.authenticated(session);
      } else {
        state = const AuthState.unauthenticated();
      }
    });
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response =
          await _authService.signIn(email: email, password: password);
      if (response.session != null) {
        state = AuthState.authenticated(response.session!);
      } else {
        state = const AuthState.unauthenticated('Sign in failed');
      }
    } catch (e) {
      state = AuthState.unauthenticated(e.toString());
    }
  }

  Future<void> signUp({
    required String email,
    required String password,
  }) async {
    try {
      final response =
          await _authService.signUp(email: email, password: password);
      if (response.session != null) {
        state = AuthState.authenticated(response.session!);
      } else {
        // Email confirmation may be required
        state = const AuthState.unauthenticated(
            'Check your email to confirm your account');
      }
    } catch (e) {
      state = AuthState.unauthenticated(e.toString());
    }
  }

  Future<void> signOut() async {
    await _authService.signOut();
    state = const AuthState.unauthenticated();
  }

  Future<void> resetPassword(String email) async {
    await _authService.resetPassword(email);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/models/auth_state.dart mobile/lib/services/auth_service.dart mobile/lib/providers/auth_provider.dart
git commit -m "feat: add auth service and Riverpod auth state management"
```

---

### Task 6: Profile Service + Provider

**Files:**
- Create: `mobile/lib/models/profile.dart`
- Create: `mobile/lib/services/profile_service.dart`
- Create: `mobile/lib/providers/profile_provider.dart`

- [ ] **Step 1: Create profile model**

Create `mobile/lib/models/profile.dart`:

```dart
class Profile {
  final String userId;
  final String? firstName;
  final String? lastName;
  final String? mobile;
  final String? zipcode;
  final int? birthYear;
  final String? displayName;
  final String? avatarUrl;
  final String? handle;
  final String? email;
  final bool isComplete;

  const Profile({
    required this.userId,
    this.firstName,
    this.lastName,
    this.mobile,
    this.zipcode,
    this.birthYear,
    this.displayName,
    this.avatarUrl,
    this.handle,
    this.email,
    this.isComplete = false,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      userId: json['user_id'] as String,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      mobile: json['mobile'] as String?,
      zipcode: json['zipcode'] as String?,
      birthYear: json['birth_year'] as int?,
      displayName: json['display_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      handle: json['handle'] as String?,
      email: json['email'] as String?,
      isComplete: json['is_complete'] as bool? ?? false,
    );
  }
}
```

- [ ] **Step 2: Create profile service**

Create `mobile/lib/services/profile_service.dart`:

```dart
import '../models/profile.dart';
import 'api_client.dart';

class ProfileService {
  final ApiClient _api;

  ProfileService(this._api);

  Future<Profile> getProfile() async {
    final response = await _api.get('/profile');
    return Profile.fromJson(response.data);
  }

  Future<Profile> updateProfile(Map<String, dynamic> fields) async {
    final response = await _api.patch('/profile', data: fields);
    return Profile.fromJson(response.data);
  }
}
```

- [ ] **Step 3: Create profile provider**

Create `mobile/lib/providers/profile_provider.dart`:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/profile.dart';
import '../services/profile_service.dart';
import 'api_provider.dart';

final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService(ref.watch(apiClientProvider));
});

final profileProvider =
    AsyncNotifierProvider<ProfileNotifier, Profile?>(ProfileNotifier.new);

class ProfileNotifier extends AsyncNotifier<Profile?> {
  @override
  Future<Profile?> build() async {
    return null; // Loaded explicitly after auth
  }

  Future<void> loadProfile() async {
    state = const AsyncLoading();
    try {
      final profileService = ref.read(profileServiceProvider);
      final profile = await profileService.getProfile();
      state = AsyncData(profile);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> updateProfile(Map<String, dynamic> fields) async {
    try {
      final profileService = ref.read(profileServiceProvider);
      final profile = await profileService.updateProfile(fields);
      state = AsyncData(profile);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  void clear() {
    state = const AsyncData(null);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/models/profile.dart mobile/lib/services/profile_service.dart mobile/lib/providers/profile_provider.dart
git commit -m "feat: add profile model, service, and Riverpod provider"
```

---

## Chunk 2: Screens + Navigation + App Entry

### Task 7: Auth Screens (Login + Register)

**Files:**
- Create: `mobile/lib/screens/auth/login_screen.dart`
- Create: `mobile/lib/screens/auth/register_screen.dart`

- [ ] **Step 1: Create login screen**

Create `mobile/lib/screens/auth/login_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/profile_provider.dart';
import '../../theme/app_colors.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    await ref.read(authStateProvider.notifier).signIn(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );

    final authState = ref.read(authStateProvider);
    if (authState.isAuthenticated) {
      await ref.read(profileProvider.notifier).loadProfile();
    }

    if (!authState.isAuthenticated && mounted) {
      setState(() {
        _isLoading = false;
        _error = authState.error ?? 'Sign in failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'IgniteHealth',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sign in to continue',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  if (_error != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.negativeLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _error!,
                        style: const TextStyle(
                            color: AppColors.negative, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    decoration: const InputDecoration(hintText: 'Email'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Email required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(hintText: 'Password'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Password required' : null,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _handleLogin,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Sign In'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => context.go('/register'),
                    child: const Text("Don't have an account? Sign up"),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Create register screen**

Create `mobile/lib/screens/auth/register_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../theme/app_colors.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _error;
  String? _success;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
      _success = null;
    });

    await ref.read(authStateProvider.notifier).signUp(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );

    final authState = ref.read(authStateProvider);
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (!authState.isAuthenticated) {
          if (authState.error?.contains('confirm') ?? false) {
            _success = authState.error;
          } else {
            _error = authState.error ?? 'Registration failed';
          }
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Create Account',
                    style: Theme.of(context).textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Start tracking your health journey',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  if (_error != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.negativeLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(_error!,
                          style: const TextStyle(
                              color: AppColors.negative, fontSize: 13),
                          textAlign: TextAlign.center),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (_success != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(_success!,
                          style: const TextStyle(
                              color: AppColors.primary, fontSize: 13),
                          textAlign: TextAlign.center),
                    ),
                    const SizedBox(height: 16),
                  ],
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    decoration: const InputDecoration(hintText: 'Email'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Email required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(hintText: 'Password'),
                    validator: (v) => v != null && v.length >= 8
                        ? null
                        : 'Password must be 8+ characters',
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _confirmController,
                    obscureText: true,
                    decoration:
                        const InputDecoration(hintText: 'Confirm password'),
                    validator: (v) => v == _passwordController.text
                        ? null
                        : 'Passwords must match',
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _handleRegister,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Create Account'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('Already have an account? Sign in'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/screens/auth/
git commit -m "feat: add login and register screens"
```

---

### Task 8: Navigation Shell + Placeholder Screens

**Files:**
- Create: `mobile/lib/screens/shell/app_shell.dart`
- Create: `mobile/lib/screens/home/home_screen.dart`
- Create: `mobile/lib/screens/journal/journal_screen.dart`
- Create: `mobile/lib/screens/analytics/analytics_screen.dart`
- Create: `mobile/lib/screens/labs/labs_screen.dart`
- Create: `mobile/lib/screens/profile/profile_setup_screen.dart`

- [ ] **Step 1: Create app shell with bottom nav**

Create `mobile/lib/screens/shell/app_shell.dart`:

```dart
import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';

class AppShell extends StatelessWidget {
  final int currentIndex;
  final Widget child;
  final void Function(int) onTabSelected;

  const AppShell({
    super.key,
    required this.currentIndex,
    required this.child,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: FAB menu for quick capture
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTabSelected,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textTertiary,
        selectedFontSize: 10,
        unselectedFontSize: 10,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.book_rounded), label: 'Journal'),
          BottomNavigationBarItem(icon: SizedBox(width: 24), label: ''), // FAB spacer
          BottomNavigationBarItem(icon: Icon(Icons.insights_rounded), label: 'Analytics'),
          BottomNavigationBarItem(icon: Icon(Icons.science_rounded), label: 'Labs'),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Create placeholder screens**

Create `mobile/lib/screens/home/home_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../providers/profile_provider.dart';
import '../../theme/app_colors.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(profileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'IgniteHealth',
          style: TextStyle(
              fontWeight: FontWeight.w800, color: AppColors.primary),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primaryLight,
              child: Text('S',
                  style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 13)),
            ),
            onSelected: (value) {
              if (value == 'signout') {
                ref.read(authStateProvider.notifier).signOut();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'signout',
                child: Text('Sign Out'),
              ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              profile.when(
                data: (p) => Text(
                  'Good morning, ${p?.displayName ?? 'there'}',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                loading: () => const Text('Loading...'),
                error: (_, __) => const Text('Hello'),
              ),
              const SizedBox(height: 4),
              Text(
                _formattedDate(),
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 24),
              // Placeholder for smart CTA
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primary, width: 1.5),
                ),
                child: const Row(
                  children: [
                    Text('🌅', style: TextStyle(fontSize: 24)),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Morning Check-in',
                              style: TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 14)),
                          Text('Coming soon',
                              style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text('Dashboard data will appear here.',
                  style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }

  String _formattedDate() {
    final now = DateTime.now();
    final weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    final months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return '${weekdays[now.weekday - 1]}, ${months[now.month - 1]} ${now.day}';
  }
}
```

Create `mobile/lib/screens/journal/journal_screen.dart`:

```dart
import 'package:flutter/material.dart';

class JournalScreen extends StatelessWidget {
  const JournalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Journal')),
      body: const Center(
        child: Text('Journal tab — coming soon'),
      ),
    );
  }
}
```

Create `mobile/lib/screens/analytics/analytics_screen.dart`:

```dart
import 'package:flutter/material.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: const Center(
        child: Text('Analytics — coming soon'),
      ),
    );
  }
}
```

Create `mobile/lib/screens/labs/labs_screen.dart`:

```dart
import 'package:flutter/material.dart';

class LabsScreen extends StatelessWidget {
  const LabsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Labs')),
      body: const Center(
        child: Text('Labs — coming soon'),
      ),
    );
  }
}
```

Create `mobile/lib/screens/profile/profile_setup_screen.dart`:

```dart
import 'package:flutter/material.dart';

class ProfileSetupScreen extends StatelessWidget {
  const ProfileSetupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Your Profile')),
      body: const Center(
        child: Text('Profile setup — coming soon'),
      ),
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/screens/
git commit -m "feat: add app shell with bottom nav and placeholder screens"
```

---

### Task 9: Router + App Entry Point

**Files:**
- Create: `mobile/lib/router.dart`
- Modify: `mobile/lib/main.dart`
- Modify: `mobile/lib/app.dart` (create new)

- [ ] **Step 1: Create router with auth guard**

Create `mobile/lib/router.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'models/auth_state.dart';
import 'providers/auth_provider.dart';
import 'providers/profile_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/journal/journal_screen.dart';
import 'screens/analytics/analytics_screen.dart';
import 'screens/labs/labs_screen.dart';
import 'screens/profile/profile_setup_screen.dart';
import 'screens/shell/app_shell.dart';

/// Listenable adapter that bridges Riverpod auth state to GoRouter's
/// refreshListenable. This avoids recreating the GoRouter on every
/// auth state change (which would lose navigation history).
class AuthNotifierListenable extends ChangeNotifier {
  AuthNotifierListenable(Ref ref) {
    ref.listen(authStateProvider, (_, __) => notifyListeners());
    ref.listen(profileProvider, (_, __) => notifyListeners());
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final authListenable = AuthNotifierListenable(ref);

  return GoRouter(
    initialLocation: '/home',
    refreshListenable: authListenable,
    redirect: (context, state) {
      // Read current values (not watch — we're inside redirect)
      final authState = ref.read(authStateProvider);
      final profile = ref.read(profileProvider);

      final isAuth = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      // Not authenticated -> login
      if (!isAuth && !isAuthRoute) return '/login';

      // Authenticated on auth route -> check profile then home
      if (isAuth && isAuthRoute) {
        final profileData = profile.valueOrNull;
        if (profileData != null && !profileData.isComplete) {
          return '/profile-setup';
        }
        return '/home';
      }

      // Authenticated, navigating to home — ensure profile is loaded
      if (isAuth && !isAuthRoute && profile.valueOrNull == null && !profile.isLoading) {
        // Trigger profile load (async, non-blocking)
        ref.read(profileProvider.notifier).loadProfile();
      }

      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/profile-setup',
        builder: (context, state) => const ProfileSetupScreen(),
      ),
      // Main app with shell
      ShellRoute(
        builder: (context, state, child) {
          final index = switch (state.matchedLocation) {
            '/home' => 0,
            '/journal' => 1,
            '/analytics' => 3,
            '/labs' => 4,
            _ => 0,
          };
          return AppShell(
            currentIndex: index,
            onTabSelected: (i) {
              final routes = ['/home', '/journal', '', '/analytics', '/labs'];
              if (i != 2 && routes[i].isNotEmpty) {
                context.go(routes[i]);
              }
            },
            child: child,
          );
        },
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: HomeScreen()),
          ),
          GoRoute(
            path: '/journal',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: JournalScreen()),
          ),
          GoRoute(
            path: '/analytics',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AnalyticsScreen()),
          ),
          GoRoute(
            path: '/labs',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: LabsScreen()),
          ),
        ],
      ),
    ],
  );
});
```

**Note:** The router is created once. `AuthNotifierListenable` bridges Riverpod state changes to GoRouter's `refreshListenable`, which triggers `redirect` without recreating the router. Profile is auto-loaded in the redirect when auth is valid but profile is null (handles returning users with existing sessions).

- [ ] **Step 2: Create app widget**

Create `mobile/lib/app.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router.dart';
import 'theme/app_theme.dart';

class IgniteHealthApp extends ConsumerWidget {
  const IgniteHealthApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'IgniteHealth',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

- [ ] **Step 3: Update main.dart**

Replace `mobile/lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'config/env.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: '.env');

  // Initialize Supabase
  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runApp(
    const ProviderScope(
      child: IgniteHealthApp(),
    ),
  );
}
```

- [ ] **Step 4: Run the app to verify**

```bash
cd /Volumes/Data/projects/ignitehealthnow/mobile
flutter run
```

Expected: App launches, shows login screen. Can navigate to register. After login, shows home screen with bottom nav (Home, Journal, FAB, Analytics, Labs).

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/main.dart mobile/lib/app.dart mobile/lib/router.dart
git commit -m "feat: add GoRouter with auth guard, profile gate, and bottom nav shell"
```

---

### Task 10: End-to-End Verification

- [ ] **Step 1: Start the API server**

```bash
cd /Volumes/Data/projects/ignitehealthnow/api
poetry run uvicorn app.main:app --reload --port 8000
```

Expected: API starts on localhost:8000.

- [ ] **Step 2: Run Flutter app**

```bash
cd /Volumes/Data/projects/ignitehealthnow/mobile
flutter run
```

- [ ] **Step 3: Verify the full stack**

Test checklist:
- [ ] Login screen renders with IgniteHealth branding
- [ ] Can navigate between login and register
- [ ] Register creates account via Supabase Auth
- [ ] Login authenticates and navigates to home
- [ ] Home screen shows personalized greeting from API profile
- [ ] Bottom nav works: Home, Journal, Analytics, Labs tabs
- [ ] FAB button is visible and centered
- [ ] Sign out via avatar menu returns to login screen
- [ ] API `/profile` endpoint receives the JWT and returns profile data
- [ ] Light theme applied (warm white background, green primary)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: walking skeleton complete — Flutter auth + API + navigation shell"
```

---

## Summary

After completing this plan, the walking skeleton delivers:

| Component | Status |
|---|---|
| Flutter project scaffold | Done |
| Riverpod state management | Done |
| Supabase auth (login/register) | Done |
| API client with JWT auth interceptor | Done |
| Profile loading from FastAPI | Done |
| GoRouter with auth guard + profile gate | Done |
| Bottom nav shell (Home, Journal, FAB, Analytics, Labs) | Done |
| Light theme from design spec | Done |
| Architecture.md | Done |
| Sign out | Done |

**Next plan:** Journal system implementation (Sleep Journal end-to-end first, then remaining 10 journal types).
