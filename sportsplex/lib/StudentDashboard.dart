import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
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
  int activeRequests = 0;
  int joinedClubs = 0;
  int liveMatches = 0;
  int announcements = 0;

  Future<void> fetchUserData() async {
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/api/profile'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      userData = jsonDecode(response.body);
      await fetchStats();
      setState(() {
        isLoading = false;
      });
    } else {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchStats() async {
    // Active Requests
    final reqRes = await http.get(
      Uri.parse('${AppConfig.baseUrl}/api/equipment/requests/my'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
    );
    if (reqRes.statusCode == 200) {
      final reqList = jsonDecode(reqRes.body) as List;
      activeRequests = reqList.where((r) => r['status'] == 'pending').length;
    }

    // Joined Clubs
    final clubsRes = await http.get(
      Uri.parse('${AppConfig.baseUrl}/api/clubs'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
    );
    if (clubsRes.statusCode == 200 && userData != null) {
      final clubsList = jsonDecode(clubsRes.body) as List;
      final userId = userData!['_id'];
      joinedClubs = clubsList
          .where(
            (club) => (club['members'] as List).any((m) => m['user'] == userId),
          )
          .length;
    }

    // Live Matches
    final matchesRes = await http.get(
      Uri.parse('${AppConfig.baseUrl}/api/matches?status=ongoing'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
    );
    if (matchesRes.statusCode == 200) {
      final matchesData = jsonDecode(matchesRes.body);
      liveMatches = (matchesData['matches'] as List).length;
    }

    // Announcements
    final annRes = await http.get(
      Uri.parse('${AppConfig.baseUrl}/api/events?category=announcement'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
    );
    if (annRes.statusCode == 200) {
      final annData = jsonDecode(annRes.body);
      announcements = (annData['events'] as List).length;
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
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: PopupMenuButton<String>(
              offset: const Offset(0, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              onSelected: (value) {
                switch (value) {
                  case 'Profile':
                    Navigator.pushNamed(
                      context,
                      '/user-profile',
                      arguments: {'userId': userData?['_id'] ?? ''},
                    );
                    break;
                  case 'Request Equipment':
                    Navigator.pushNamed(
                      context,
                      '/requestEquipment',
                      arguments: {
                        'userId': userData?['_id'] ?? '',
                        'token': widget.token,
                      },
                    );
                    break;
                  case 'Join Clubs':
                    Navigator.pushNamed(
                      context,
                      '/joinClubs',
                      arguments: {'userId': userData?['_id'] ?? ''},
                    );
                    break;
                  case 'Live Scores':
                    Navigator.pushNamed(
                      context,
                      '/liveScores',
                      arguments: {'userId': userData?['_id'] ?? ''},
                    );
                    break;
                  case 'Announcements':
                    Navigator.pushNamed(context, '/announcements');
                    break;
                  case 'Request Student Head':
                    Navigator.pushNamed(
                      context,
                      '/requestStudentHead',
                      arguments: {'userId': userData?['_id'] ?? ''},
                    );
                    break;
                  case 'Logout':
                    // Clear token and navigate to login
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/login',
                      (route) => false,
                    );
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(value: 'Profile', child: Text('Profile')),
                const PopupMenuItem(
                  value: 'Request Equipment',
                  child: Text('Request Equipment'),
                ),
                const PopupMenuItem(
                  value: 'Join Clubs',
                  child: Text('Join Clubs'),
                ),
                const PopupMenuItem(
                  value: 'Live Scores',
                  child: Text('Live Scores'),
                ),
                const PopupMenuItem(
                  value: 'Announcements',
                  child: Text('Announcements'),
                ),
                const PopupMenuItem(
                  value: 'Request Student Head',
                  child: Text('Request Student Head'),
                ),
                const PopupMenuItem(value: 'Logout', child: Text('Logout')),
              ],
              child: CircleAvatar(
                radius: 20,
                backgroundColor: Colors.blue[100],
                child: userData != null && userData!['firstName'] != null
                    ? Text(
                        userData!['firstName'][0],
                        style: const TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      )
                    : const Icon(Icons.person, color: Colors.blue, size: 24),
              ),
            ),
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : userData == null
          ? const Center(child: Text('Failed to load user data'))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome, ${userData!['firstName']} ${userData!['lastName']}',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Manage your sports activities and stay updated',
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 24),

                  // Stats Cards
                  Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      _buildStatCard(
                        Icon(FontAwesomeIcons.fileAlt, color: Colors.blue),
                        'Active Requests',
                        activeRequests,
                        Colors.blue,
                      ),
                      _buildStatCard(
                        Icon(Icons.people, color: Colors.green),
                        'Joined Clubs',
                        joinedClubs,
                        Colors.green,
                      ),
                      _buildStatCard(
                        Icon(Icons.emoji_events, color: Colors.orange),
                        'Live Matches',
                        liveMatches,
                        Colors.orange,
                      ),
                      _buildStatCard(
                        Icon(Icons.notifications, color: Colors.purple),
                        'Announcements',
                        announcements,
                        Colors.purple,
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  const Text(
                    'Quick Actions',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),

                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
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
                            arguments: {
                              'userId': userData?['_id'] ?? '',
                              'token': widget.token,
                            },
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
                  const SizedBox(height: 32),

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
                            // TODO: Navigate
                          },
                          Colors.blue[50]!,
                        ),
                        _buildSectionCard(
                          'Live Matches',
                          Icons.emoji_events,
                          'No live matches',
                          'View All Matches',
                          () {
                            // TODO: Navigate
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

  Widget _buildStatCard(
    Widget iconWidget,
    String label,
    int count,
    Color color,
  ) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        constraints: const BoxConstraints(minWidth: 80, maxWidth: 120),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            iconWidget,
            const SizedBox(height: 8),
            Text(
              '$count',
              style: TextStyle(
                color: color,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade700,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

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
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [Colors.white, color]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 22, color: Colors.black87),
              const SizedBox(height: 7),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(fontSize: 11, color: Colors.grey.shade800),
              ),
            ],
          ),
        ),
      ),
    );
  }

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
        padding: const EdgeInsets.all(24),
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
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
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
            const SizedBox(height: 24),
            Center(child: Icon(icon, size: 40, color: Colors.grey[600])),
            const SizedBox(height: 12),
            Center(child: Text(emptyText)),
            const SizedBox(height: 12),
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
}
