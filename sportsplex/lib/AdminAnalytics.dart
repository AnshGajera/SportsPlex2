import 'package:flutter/material.dart';

class AdminAnalytics extends StatelessWidget {
  const AdminAnalytics({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Analytics')),
      body: Center(
        child: Text(
          'Analytics Dashboard (To be implemented)',
          style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
