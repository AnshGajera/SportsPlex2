import 'package:flutter/material.dart';
import 'LoginScreen.dart';
import 'RegisterScreen.dart';
import 'StudentDashboard.dart';
import 'StudentHeadDashboard.dart';
import 'AdminDashboard.dart';

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
        // Add other routes as needed
      },
    );
  }
}
