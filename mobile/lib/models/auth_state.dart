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
  AuthState.authenticated(Session session)
      : this(
          status: AuthStatus.authenticated,
          userId: session.user.id,
          session: session,
        );
  const AuthState.unauthenticated([String? error])
      : this(status: AuthStatus.unauthenticated, error: error);

  bool get isAuthenticated => status == AuthStatus.authenticated;
}
