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
      Uri.parse('http://10.63.134.100:5000/api/matches'),
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
      appBar: AppBar(title: Text('Matches')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: matches.length,
              itemBuilder: (context, index) {
                final match = matches[index];
                return Card(
                  margin: EdgeInsets.all(8),
                  child: ListTile(
                    title: Text(match['title'] ?? 'Match'),
                    subtitle: Text('Date: ${match['date'] ?? 'N/A'}'),
                  ),
                );
              },
            ),
    );
  }
}
