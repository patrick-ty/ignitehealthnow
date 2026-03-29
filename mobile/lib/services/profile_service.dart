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
