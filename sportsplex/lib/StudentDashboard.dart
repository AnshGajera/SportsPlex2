import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'app_config.dart';
import 'dart:convert';

class StudentDashboard extends StatefulWidget {
  final String token;
  const StudentDashboard({Key? key, required this.token}) : super(key: key);

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  Map<String, dynamic>? userData;
  bool isLoading = true;

  Future<void> fetchUserData() async {
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/api/profile'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      setState(() {
        userData = jsonDecode(response.body);
        isLoading = false;
      });
    } else {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    fetchUserData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Student Dashboard')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : userData == null
          ? Center(child: Text('Failed to load user data'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome, ${userData!['firstName']}',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text('Email: ${userData!['email']}'),
                  Text('College: ${userData!['college']}'),
                  Text('Department: ${userData!['department']}'),
                  // Add more fields as needed
                ],
              ),
            ),
    );
  }
}
