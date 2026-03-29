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
