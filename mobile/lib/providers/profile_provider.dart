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
