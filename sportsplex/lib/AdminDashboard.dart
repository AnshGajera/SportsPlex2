import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:math';
import 'dart:convert';

class AdminDashboard extends StatefulWidget {
  final String token;
  const AdminDashboard({Key? key, required this.token}) : super(key: key);

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int totalEquipment = 0;
  int pendingRequests = 0;
  int activeAllocations = 0;
  int totalUsers = 0;
  bool isLoading = true;

  Future<void> fetchAdminAnalytics() async {
    // Replace with your actual API endpoints
    final equipmentRes = await http.get(
      Uri.parse('http://192.168.43.154:5000/api/equipment'),
    );
    final requestsRes = await http.get(
      Uri.parse(
        'http://192.168.43.154:5000/api/equipment/requests?status=pending',
      ),
    );
    final allocationsRes = await http.get(
      Uri.parse(
        'http://192.168.43.154:5000/api/equipment/allocations?status=allocated',
      ),
    );
    final usersRes = await http.get(
      Uri.parse('http://192.168.43.154:5000/api/users'),
    );
    setState(() {
      totalEquipment = equipmentRes.statusCode == 200
          ? (jsonDecode(equipmentRes.body) as List).length
          : 0;
      pendingRequests = requestsRes.statusCode == 200
          ? (jsonDecode(requestsRes.body) as List).length
          : 0;
      activeAllocations = allocationsRes.statusCode == 200
          ? (jsonDecode(allocationsRes.body) as List).length
          : 0;
      totalUsers = usersRes.statusCode == 200
          ? (jsonDecode(usersRes.body) as List).length
          : 0;
      isLoading = false;
    });
  }

  @override
  void initState() {
    super.initState();
    fetchAdminAnalytics();
  }

  Widget buildAnalyticsCard(
    String label,
    int count,
    IconData icon,
    Color color,
    double width,
    double height,
  ) {
    return Flexible(
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        color: Color(0xFFF7F6FA),
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 20, horizontal: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: width * 0.18),
              SizedBox(height: 8),
              Text(
                '$count',
                style: TextStyle(
                  fontSize: width * 0.13,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(fontSize: width * 0.09, color: Colors.black54),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildQuickAction(
    String label,
    IconData icon,
    Color color,
    String route,
  ) {
    return IntrinsicWidth(
      child: IntrinsicHeight(
        child: GestureDetector(
          onTap: () {
            Navigator.pushNamed(
              context,
              route,
              arguments: {'token': widget.token},
            );
          },
          child: Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            color: color.withOpacity(0.1),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, color: color, size: 32),
                  SizedBox(height: 8),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 16,
                      color: color,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isWide = size.width > 600;
    double cardWidth = isWide ? size.width / 5.2 : size.width / 2.3;
    double cardHeight = isWide ? size.height * 0.18 : size.height * 0.15;
    return Scaffold(
      appBar: AppBar(
        title: Text('Admin Dashboard'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () {
                Navigator.pushNamed(
                  context,
                  '/admin-profile',
                  arguments: {'token': widget.token},
                );
              },
              child: CircleAvatar(
                radius: min(20, size.width * 0.03),
                backgroundColor: Colors.deepOrange[100],
                child: Icon(
                  Icons.admin_panel_settings,
                  color: Colors.deepOrange,
                  size: min(24, size.width * 0.03),
                ),
              ),
            ),
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Admin Control Panel',
                    style: TextStyle(
                      fontSize: min(28, size.width * 0.045),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Manage system operations and oversee all activities',
                    style: TextStyle(
                      fontSize: min(16, size.width * 0.025),
                      color: Colors.grey[700],
                    ),
                  ),
                  SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      buildAnalyticsCard(
                        'Total Equipment',
                        totalEquipment,
                        Icons.inventory,
                        Colors.blue,
                        cardWidth,
                        cardHeight,
                      ),
                      buildAnalyticsCard(
                        'Pending Requests',
                        pendingRequests,
                        Icons.assignment_late,
                        Colors.orange,
                        cardWidth,
                        cardHeight,
                      ),
                      buildAnalyticsCard(
                        'Active Allocations',
                        activeAllocations,
                        Icons.assignment_turned_in,
                        Colors.green,
                        cardWidth,
                        cardHeight,
                      ),
                      buildAnalyticsCard(
                        'Total Users',
                        totalUsers,
                        Icons.people,
                        Colors.purple,
                        cardWidth,
                        cardHeight,
                      ),
                    ],
                  ),
                  SizedBox(height: 32),
                  Text(
                    'Administrative Actions',
                    style: TextStyle(
                      fontSize: min(20, size.width * 0.032),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: size.width < 600 ? 2 : 3,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    children: [
                      buildQuickAction(
                        'Equipment',
                        Icons.inventory,
                        Colors.blue,
                        '/admin-equipment',
                      ),
                      buildQuickAction(
                        'Users',
                        Icons.people,
                        Colors.purple,
                        '/admin-user-management',
                      ),
                      buildQuickAction(
                        'Announcements',
                        Icons.notifications,
                        Colors.orange,
                        '/admin-announcements',
                      ),
                      buildQuickAction(
                        'Events',
                        Icons.event,
                        Colors.green,
                        '/admin-events',
                      ),
                      buildQuickAction(
                        'Matches',
                        Icons.emoji_events,
                        Colors.deepOrange,
                        '/admin-matches',
                      ),
                      buildQuickAction(
                        'Analytics',
                        Icons.bar_chart,
                        Colors.indigo,
                        '/admin-analytics',
                      ),
                      buildQuickAction(
                        'Clubs',
                        Icons.group,
                        Colors.teal,
                        '/admin-clubs',
                      ),
                    ],
                  ),
                  // ...add more admin widgets below as needed...
                ],
              ),
            ),
    );
  }
}
