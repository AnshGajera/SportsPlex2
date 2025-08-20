import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  final String role;
  final String userName;
  const HomeScreen({Key? key, required this.role, required this.userName})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, $userName'),
        backgroundColor: Colors.indigo[700],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/img2.jpg', width: 80, height: 80),
            SizedBox(height: 16),
            Text(
              'SportsPlex Home',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Role: $role',
              style: TextStyle(fontSize: 18, color: Colors.grey[700]),
            ),
            SizedBox(height: 32),
            if (role == 'student') ...[
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/studentDashboard'),
                child: Text('Student Dashboard'),
              ),
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/studentMatches'),
                child: Text('Matches'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/studentClubs'),
                child: Text('Clubs'),
              ),
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/studentEquipment'),
                child: Text('Equipment'),
              ),
            ] else if (role == 'student_head') ...[
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/studentHeadDashboard'),
                child: Text('Student Head Dashboard'),
              ),
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/studentHeadRequests'),
                child: Text('Requests'),
              ),
            ] else if (role == 'admin') ...[
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/adminDashboard'),
                child: Text('Admin Dashboard'),
              ),
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/adminUserManagement'),
                child: Text('User Management'),
              ),
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/adminAnalytics'),
                child: Text('Analytics'),
              ),
              ElevatedButton(
                onPressed: () =>
                    Navigator.pushNamed(context, '/adminAnnouncements'),
                child: Text('Announcements'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
