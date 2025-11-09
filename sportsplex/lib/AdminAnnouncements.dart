import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AdminAnnouncements extends StatefulWidget {
  const AdminAnnouncements({Key? key}) : super(key: key);

  @override
  State<AdminAnnouncements> createState() => _AdminAnnouncementsState();
}

class _AdminAnnouncementsState extends State<AdminAnnouncements> {
  List<dynamic> announcements = [];
  bool isLoading = true;

  Future<void> fetchAnnouncements() async {
    final response = await http.get(
      Uri.parse('http://10.63.134.100:5000/api/announcements'),
    );
    if (response.statusCode == 200) {
      setState(() {
        announcements = jsonDecode(response.body);
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
    fetchAnnouncements();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Announcements')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Latest Announcements',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Expanded(
              child: isLoading
                  ? Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: announcements.length,
                      itemBuilder: (context, index) {
                        final announcement = announcements[index];
                        return Card(
                          margin: EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            leading: Icon(
                              Icons.announcement,
                              color: Colors.purple,
                            ),
                            title: Text(
                              announcement['title'] ?? 'Announcement $index',
                            ),
                            subtitle: Text(
                              announcement['description'] ??
                                  'Details of announcement $index',
                            ),
                            trailing: Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              // Navigate to announcement details
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
