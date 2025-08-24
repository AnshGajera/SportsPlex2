import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AdminUserManagement extends StatefulWidget {
  const AdminUserManagement({Key? key}) : super(key: key);

  @override
  State<AdminUserManagement> createState() => _AdminUserManagementState();
}

class _AdminUserManagementState extends State<AdminUserManagement> {
  List<dynamic> users = [];
  bool isLoading = true;

  Future<void> fetchUsers() async {
    final response = await http.get(
      Uri.parse('http://10.63.134.100:5000/api/profile/all'),
    );
    if (response.statusCode == 200) {
      setState(() {
        users = jsonDecode(response.body);
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
    fetchUsers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('User Management')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return Card(
                  margin: EdgeInsets.all(8),
                  child: ListTile(
                    title: Text(user['firstName'] ?? 'User'),
                    subtitle: Text('Email: ${user['email'] ?? 'N/A'}'),
                  ),
                );
              },
            ),
    );
  }
}
