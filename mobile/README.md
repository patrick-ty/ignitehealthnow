# Ignite Health Mobile App

Flutter mobile application for iOS and Android.

## Prerequisites

- Flutter SDK (latest stable)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Setup

1. Install Flutter dependencies:
```bash
flutter pub get
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Run on device/simulator:
```bash
# iOS
flutter run -d ios

# Android
flutter run -d android
```

## Testing

```bash
flutter test
```

## Building for Production

```bash
# iOS
flutter build ios

# Android
flutter build apk
```
