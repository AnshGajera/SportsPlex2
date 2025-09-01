import 'package:flutter/material.dart';
import 'LoginScreen.dart';
import 'RegisterScreen.dart';
import 'StudentDashboard.dart';
import 'StudentHeadDashboard.dart';
import 'AdminDashboard.dart';
import 'StudentEquipment.dart';
import 'StudentClubs.dart';
import 'StudentMatches.dart';
import 'AdminAnnouncements.dart';
import 'AdminEquipment.dart';
import 'StudentProfile.dart';

void main() {
  runApp(SportsPlexApp());
}

class SportsPlexApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SportsPlex',
      theme: ThemeData(primarySwatch: Colors.blue),
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
        '/studentDashboard': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return StudentDashboard(token: args?['token'] ?? '');
        },
        '/studentHeadDashboard': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return StudentHeadDashboard(token: args?['token'] ?? '');
        },
        '/adminDashboard': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return AdminDashboard(token: args?['token'] ?? '');
        },
        '/requestEquipment': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return StudentEquipment(userId: args?['userId'] ?? '');
        },
        '/joinClubs': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return StudentClubs(userId: args?['userId'] ?? '');
        },
        '/liveScores': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return StudentMatches(userId: args?['userId'] ?? '');
        },
        '/announcements': (context) => AdminAnnouncements(),
        '/admin-equipment': (context) {
          final args =
              ModalRoute.of(context)!.settings.arguments
                  as Map<String, dynamic>?;
          return AdminEquipment(token: args?['token']);
        },
        '/student-profile': (context) => StudentProfile(),
      },
    );
  }
}
