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
