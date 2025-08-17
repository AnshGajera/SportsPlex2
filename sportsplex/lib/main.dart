import 'package:flutter/material.dart';
import 'LoginScreen.dart';
import 'RegisterScreen.dart';

void main() {
  runApp(SportsPlexApp());
}

class SportsPlexApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SportsPlex',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
      },
    );
  }
}