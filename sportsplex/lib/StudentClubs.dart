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
      Uri.parse('http://192.168.43.154:5000/api/clubs'),
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
      appBar: AppBar(title: Text('My Clubs')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Clubs',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Expanded(
              child: isLoading
                  ? Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: clubs.length,
                      itemBuilder: (context, index) {
                        final club = clubs[index];
                        return Card(
                          margin: EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            leading: Icon(
                              Icons.sports_soccer,
                              color: Colors.blue,
                            ),
                            title: Text(club['name'] ?? 'Club Name $index'),
                            subtitle: Text(
                              'Department: ${club['department'] ?? 'N/A'}',
                            ),
                            trailing: Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              // Navigate to club details
                            },
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
