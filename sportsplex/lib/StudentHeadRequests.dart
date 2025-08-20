import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StudentHeadRequests extends StatefulWidget {
  final String userId;
  const StudentHeadRequests({Key? key, required this.userId}) : super(key: key);

  @override
  State<StudentHeadRequests> createState() => _StudentHeadRequestsState();
}

class _StudentHeadRequestsState extends State<StudentHeadRequests> {
  List<dynamic> requests = [];
  bool isLoading = true;

  Future<void> fetchRequests() async {
    final response = await http.get(
      Uri.parse('http://10.63.134.100:5000/api/studentHeadRequests'),
    );
    if (response.statusCode == 200) {
      setState(() {
        requests = jsonDecode(response.body);
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
    fetchRequests();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Student Head Requests')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final req = requests[index];
                return Card(
                  margin: EdgeInsets.all(8),
                  child: ListTile(
                    title: Text(req['title'] ?? 'Request'),
                    subtitle: Text(req['description'] ?? ''),
                  ),
                );
              },
            ),
    );
  }
}
