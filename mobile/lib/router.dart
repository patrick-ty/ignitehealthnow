import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
