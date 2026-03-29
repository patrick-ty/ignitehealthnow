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
      _isLoading = false;
      if (authState.isAuthenticated) {
        // Signed in immediately (no email confirmation required)
        context.go('/home');
      } else if (authState.error?.contains('confirm') ?? false) {
        // Email confirmation required — redirect to login with message
        if (mounted) context.go('/login');
        // Show snackbar after navigation
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Account created! Check your email, then sign in.'),
                backgroundColor: AppColors.primary,
                duration: Duration(seconds: 5),
              ),
            );
          }
        });
      } else {
        setState(() {
          _error = authState.error ?? 'Registration failed';
        });
      }
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
