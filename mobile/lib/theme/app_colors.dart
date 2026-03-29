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
