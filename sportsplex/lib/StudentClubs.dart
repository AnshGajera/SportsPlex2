import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StudentClubs extends StatefulWidget {
  final String userId;
  const StudentClubs({Key? key, required this.userId}) : super(key: key);

  @override
  State<StudentClubs> createState() => _StudentClubsState();
}

class _StudentClubsState extends State<StudentClubs> {
  List<dynamic> clubs = [];
  bool isLoading = true;

  Future<void> fetchClubs() async {
    final response = await http.get(
      Uri.parse('http://10.63.134.100:5000/api/clubs'),
    );
    if (response.statusCode == 200) {
      setState(() {
        clubs = jsonDecode(response.body);
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
    fetchClubs();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Clubs')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: clubs.length,
              itemBuilder: (context, index) {
                final club = clubs[index];
                return Card(
                  margin: EdgeInsets.all(8),
                  child: ListTile(
                    title: Text(club['name'] ?? 'Club'),
                    subtitle: Text(
                      'Department: ${club['department'] ?? 'N/A'}',
                    ),
                  ),
                );
              },
            ),
    );
  }
}
