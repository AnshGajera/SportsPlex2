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
  Widget _buildSectionCard(
    String title,
    IconData icon,
    String emptyText,
    String buttonText,
    VoidCallback onPressed,
    Color color,
  ) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Container(
        padding: EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '0',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.black,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 24),
            Center(child: Icon(icon, size: 40, color: Colors.grey[600])),
            SizedBox(height: 12),
            Center(child: Text(emptyText)),
            SizedBox(height: 12),
            Center(
              child: ElevatedButton(
                onPressed: onPressed,
                child: Text(buttonText),
              ),
            ),
          ],
        ),
      ),
    );
  }

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
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome, ${userData!['firstName']} ${userData!['lastName']}',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Manage your sports activities and stay updated',
                    style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                  ),
                  SizedBox(height: 24),
                  // Stats Cards
                  Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      _buildStatCard(
                        Icons.assignment,
                        'Active Requests',
                        0,
                        Colors.blue,
                      ),
                      _buildStatCard(
                        Icons.group,
                        'Joined Clubs',
                        0,
                        Colors.green,
                      ),
                      _buildStatCard(
                        Icons.emoji_events,
                        'Live Matches',
                        0,
                        Colors.orange,
                      ),
                      _buildStatCard(
                        Icons.notifications,
                        'Announcements',
                        0,
                        Colors.purple,
                      ),
                    ],
                  ),
                  SizedBox(height: 32),
                  Text(
                    'Quick Actions',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.2,
                    children: [
                      _buildActionCard(
                        Icons.assignment,
                        'Request Equipment',
                        'Browse and request equipment',
                        Colors.blue[100]!,
                        () {
                          Navigator.pushNamed(
                            context,
                            '/requestEquipment',
                            arguments: {'userId': userData?['_id'] ?? ''},
                          );
                        },
                      ),
                      _buildActionCard(
                        Icons.group,
                        'Join Clubs',
                        'Explore and join sports clubs',
                        Colors.green[100]!,
                        () {
                          Navigator.pushNamed(
                            context,
                            '/joinClubs',
                            arguments: {'userId': userData?['_id'] ?? ''},
                          );
                        },
                      ),
                      _buildActionCard(
                        Icons.emoji_events,
                        'Live Scores',
                        'View ongoing match scores',
                        Colors.yellow[100]!,
                        () {
                          Navigator.pushNamed(
                            context,
                            '/liveScores',
                            arguments: {'userId': userData?['_id'] ?? ''},
                          );
                        },
                      ),
                      _buildActionCard(
                        Icons.notifications,
                        'Announcements',
                        'Stay updated with latest news',
                        Colors.purple[100]!,
                        () {
                          Navigator.pushNamed(context, '/announcements');
                        },
                      ),
                    ],
                  ),
                  SizedBox(height: 32),
                  // Recent Activities & Live Matches
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Wrap(
                      spacing: 16,
                      children: [
                        _buildSectionCard(
                          'Recent Activities',
                          Icons.assignment,
                          'No recent activities',
                          'Request Equipment',
                          () {
                            // TODO: Navigate to equipment page
                          },
                          Colors.blue[50]!,
                        ),
                        _buildSectionCard(
                          'Live Matches',
                          Icons.emoji_events,
                          'No live matches',
                          'View All Matches',
                          () {
                            // TODO: Navigate to matches page
                          },
                          Colors.orange[50]!,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(IconData icon, String label, int count, Color color) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        constraints: BoxConstraints(minWidth: 80, maxWidth: 120),
        padding: EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            SizedBox(height: 8),
            Text(
              '$count',
              style: TextStyle(
                color: color,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ...existing code...

  Widget _buildActionCard(
    IconData icon,
    String title,
    String description,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        child: Container(
          constraints: BoxConstraints(
            minWidth: 120,
            maxWidth: 180,
            minHeight: 90,
            maxHeight: 120, // further reduced
          ),
          padding: EdgeInsets.symmetric(
            horizontal: 10,
            vertical: 8,
          ), // more compact
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [Colors.white, color]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 22, color: Colors.black87),
              SizedBox(height: 7),
              Text(
                title,
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(fontSize: 11, color: Colors.grey[800]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
