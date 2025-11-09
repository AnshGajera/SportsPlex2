import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StudentMatches extends StatefulWidget {
  final String userId;
  const StudentMatches({Key? key, required this.userId}) : super(key: key);

  @override
  State<StudentMatches> createState() => _StudentMatchesState();
}

class _StudentMatchesState extends State<StudentMatches> {
  List<dynamic> matches = [];
  bool isLoading = true;

  Future<void> fetchMatches() async {
    final response = await http.get(
      Uri.parse('http://192.168.43.154:5000/api/matches'),
    );
    if (response.statusCode == 200) {
      setState(() {
        matches = jsonDecode(response.body);
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
    fetchMatches();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Live Matches')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Ongoing Matches',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Expanded(
              child: isLoading
                  ? Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: matches.length,
                      itemBuilder: (context, index) {
                        final match = matches[index];
                        return Card(
                          margin: EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            leading: Icon(
                              Icons.sports_cricket,
                              color: Colors.orange,
                            ),
                            title: Text(match['title'] ?? 'Match $index'),
                            subtitle: Text('Date: ${match['date'] ?? 'N/A'}'),
                            trailing: Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              // Navigate to match details
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
