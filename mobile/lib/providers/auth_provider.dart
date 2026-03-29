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
