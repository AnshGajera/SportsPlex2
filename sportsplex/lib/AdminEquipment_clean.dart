import 'package:flutter/material.dart';
import 'package.flutter/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'app_config.dart';

class AdminEquipment extends StatefulWidget {
  final String? token;

  const AdminEquipment({Key? key, this.token}) : super(key: key);

  @override
  _AdminEquipmentState createState() => _AdminEquipmentState();
}

class _AdminEquipmentState extends State<AdminEquipment> {
  String activeTab = 'browse';
  String searchTerm = '';
  String selectedCategory = 'All Categories';

  List<Map<String, dynamic>> requests = [];
  List<Map<String, dynamic>> allocations = [];
  List<Map<String, dynamic>> equipmentList = [];

  List<Map<String, dynamic>> analyticsData = [
    {
      'icon': Icons.inventory,
      'count': 0,
      'label': 'Total Equipment',
      'color': Color(0xFF3B82F6),
    },
    {
      'icon': Icons.access_time,
      'count': 0,
      'label': 'Pending Requests',
      'color': Color(0xFFF59E0B),
    },
    {
      'icon': Icons.group,
      'count': 0,
      'label': 'Active Allocations',
      'color': Color(0xFF10B981),
    },
    {
      'icon': Icons.warning,
      'count': 0,
      'label': 'Overdue Returns',
      'color': Color(0xFFEF4444),
    },
  ];

  final List<String> categories = [
    'All Categories',
    'Basketball',
    'Football',
    'Cricket',
    'Tennis',
    'Volleyball',
    'Swimming',
    'Athletics',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    // Fetch all data concurrently for better performance
    _fetchAllData();
  }
  
  Future<void> _fetchAllData() async {
    // Await all futures to complete before updating UI to avoid race conditions
    await Future.wait([
      fetchEquipment(),
      fetchRequests(),
      fetchAllocations(),
    ]);
    // Fetch analytics after other data is available if needed, or rely on its own endpoint
    await fetchAnalytics();
  }

  // API Base URL
  String get baseUrl => '${AppConfig.baseUrl}/api';

  // Get authentication headers
  Map<String, String> get authHeaders => {
        'Content-Type': 'application/json',
        if (widget.token != null) 'Authorization': 'Bearer ${widget.token}',
      };

  // Helper function to build image URL
  String buildImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return '';
    }
    // If it already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // If it starts with /, remove it to avoid double slashes
    final cleanPath =
        imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '${AppConfig.baseUrl}/$cleanPath';
  }

  // Fetch functions
  Future<void> fetchEquipment() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/equipment'),
        headers: authHeaders,
      );
      if (response.statusCode == 200 && mounted) {
        setState(() {
          equipmentList = List<Map<String, dynamic>>.from(
            json.decode(response.body),
          );
        });
      }
    } catch (error) {
      print('Error fetching equipment: $error');
    }
  }

  Future<void> fetchRequests() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/equipment/requests'),
        headers: authHeaders,
      );
      if (response.statusCode == 200 && mounted) {
        setState(() {
          requests = List<Map<String, dynamic>>.from(
            json.decode(response.body),
          );
        });
      }
    } catch (error) {
      print('Error fetching requests: $error');
    }
  }

  Future<void> fetchAllocations() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/equipment/allocations'),
        headers: authHeaders,
      );
      if (response.statusCode == 200 && mounted) {
        setState(() {
          allocations = List<Map<String, dynamic>>.from(
            json.decode(response.body),
          );
        });
      }
    } catch (error) {
      print('Error fetching allocations: $error');
    }
  }

  Future<void> fetchAnalytics() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/equipment/requests/analytics'),
        headers: authHeaders,
      );
      if (response.statusCode == 200 && mounted) {
        final data = json.decode(response.body);
        setState(() {
          analyticsData = [
            {
              'icon': Icons.inventory,
              // **FIXED**: Rely on the analytics API for total count to avoid race conditions.
              'count': data['totalEquipment'] ?? equipmentList.length,
              'label': 'Total Equipment',
              'color': Color(0xFF3B82F6),
            },
            {
              'icon': Icons.access_time,
              'count': data['pendingRequests'] ?? 0,
              'label': 'Pending Requests',
              'color': Color(0xFFF59E0B),
            },
            {
              'icon': Icons.group,
              'count': data['activeAllocations'] ?? 0,
              'label': 'Active Allocations',
              'color': Color(0xFF10B981),
            },
            {
              'icon': Icons.warning,
              'count': data['overdueReturns'] ?? 0,
              'label': 'Overdue Returns',
              'color': Color(0xFFEF4444),
            },
          ];
        });
      }
    } catch (error) {
      print('Error fetching analytics: $error');
    }
  }

  // Equipment management functions
  Future<void> handleAddEquipment(Map<String, dynamic> equipmentData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/equipment'),
      headers: authHeaders,
      body: json.encode(equipmentData),
    );

    if (response.statusCode == 201 && mounted) {
      await _fetchAllData(); // Refresh all data
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Equipment added successfully!')),
      );
    } else {
       throw Exception('Failed to add equipment. Status code: ${response.statusCode}');
    }
  }

  Future<void> handleEditEquipment(
    String equipmentId,
    Map<String, dynamic> equipmentData,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/equipment/$equipmentId'),
      headers: authHeaders,
      body: json.encode(equipmentData),
    );

    if (response.statusCode == 200 && mounted) {
      await _fetchAllData(); // Refresh all data
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Equipment updated successfully!')),
      );
    } else {
      throw Exception('Failed to update equipment. Status code: ${response.statusCode}');
    }
  }

  Future<void> handleDeleteEquipment(String equipmentId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/equipment/$equipmentId'),
        headers: authHeaders,
      );

      if (response.statusCode == 200 && mounted) {
        await _fetchAllData(); // Refresh all data
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment deleted successfully!')),
        );
      }
    } catch (error) {
      print('Error deleting equipment: $error');
      if(mounted){
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error deleting equipment: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Equipment Management',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section with Add Button
            Container(
              padding: EdgeInsets.all(20),
              color: Colors.white,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxWidth > 600) {
                    // Wide layout
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Admin Dashboard',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Manage equipment inventory and requests',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            _showAddEquipmentDialog();
                          },
                          icon: Icon(Icons.add, size: 20),
                          label: Text('Add Equipment'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF3B82F6),
                            foregroundColor: Colors.white,
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                          ),
                        ),
                      ],
                    );
                  } else {
                    // Narrow layout
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Admin Dashboard',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Manage equipment inventory and requests',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                        SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              _showAddEquipmentDialog();
                            },
                            icon: Icon(Icons.add, size: 20),
                            label: Text('Add Equipment'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF3B82F6),
                              foregroundColor: Colors.white,
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    );
                  }
                },
              ),
            ),

            // Analytics Cards
            Container(
              padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxWidth > 800) {
                    // Desktop layout - 4 cards in a row
                    return Row(
                      children: analyticsData.map((stat) {
                        return Expanded(
                          child: Container(
                            margin: EdgeInsets.only(right: 12),
                            child: _buildAnalyticsCard(stat),
                          ),
                        );
                      }).toList(),
                    );
                  } else {
                    // Mobile layout - 2 cards per row
                    return Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                margin: EdgeInsets.only(right: 6),
                                child: _buildAnalyticsCard(analyticsData[0]),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                margin: EdgeInsets.only(left: 6),
                                child: _buildAnalyticsCard(analyticsData[1]),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                margin: EdgeInsets.only(right: 6),
                                child: _buildAnalyticsCard(analyticsData[2]),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                margin: EdgeInsets.only(left: 6),
                                child: _buildAnalyticsCard(analyticsData[3]),
                              ),
                            ),
                          ],
                        ),
                      ],
                    );
                  }
                },
              ),
            ),

            // Tabs Section
            Container(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildTab('browse', 'Manage Inventory'),
                    _buildTab('requests', 'Equipment Requests'),
                    _buildTab('allocations', 'Active Allocations'),
                    _buildTab('returns', 'Manage Returns'),
                  ],
                ),
              ),
            ),

            SizedBox(height: 16),

            // Search and Filter Section
            Container(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxWidth > 600) {
                    // Desktop layout - search and filter in a row
                    return Row(
                      children: [
                        Expanded(flex: 2, child: _buildSearchBar()),
                        SizedBox(width: 16),
                        _buildCategoryDropdown(),
                      ],
                    );
                  } else {
                    // Mobile layout - search and filter stacked
                    return Column(
                      children: [
                        _buildSearchBar(),
                        SizedBox(height: 12),
                        Row(
                          children: [Expanded(child: _buildCategoryDropdown())],
                        ),
                      ],
                    );
                  }
                },
              ),
            ),

            SizedBox(height: 20),

            // Content based on active tab
            Container(
              padding: EdgeInsets.symmetric(horizontal: 20),
              constraints: BoxConstraints(
                minHeight: MediaQuery.of(context).size.height * 0.5,
              ),
              child: _buildTabContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalyticsCard(Map<String, dynamic> stat) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: stat['color'].withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(stat['icon'], color: stat['color'], size: 20),
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              stat['count'].toString(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            SizedBox(height: 4),
            Text(
              stat['label'],
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String tabId, String label) {
    bool isActive = activeTab == tabId;
    return GestureDetector(
      onTap: () {
        setState(() {
          activeTab = tabId;
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        margin: EdgeInsets.only(right: 8),
        decoration: BoxDecoration(
          color: isActive ? Color(0xFF3B82F6) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isActive ? Color(0xFF3B82F6) : Color(0xFFE2E8F0),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : Color(0xFF374151),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      onChanged: (value) {
        setState(() {
          searchTerm = value;
        });
      },
      decoration: InputDecoration(
        hintText: 'Search equipment...',
        prefixIcon: Icon(Icons.search, color: Colors.grey),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: Color(0xFF3B82F6)),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }

  Widget _buildCategoryDropdown() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Color(0xFFE2E8F0)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedCategory,
          onChanged: (String? value) {
            setState(() {
              selectedCategory = value ?? 'All Categories';
            });
          },
          items: categories.map((String category) {
            return DropdownMenuItem<String>(
              value: category,
              child: Text(category),
            );
          }).toList(),
          icon: Icon(Icons.keyboard_arrow_down, color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (activeTab) {
      case 'browse':
        return _buildBrowseTab();
      case 'requests':
        return _buildRequestsTab();
      case 'allocations':
        return _buildAllocationsTab();
      case 'returns':
        return _buildReturnsTab();
      default:
        return _buildBrowseTab();
    }
  }

  Widget _buildBrowseTab() {
    if (equipmentList.isEmpty) {
      return _buildEmptyState(
        Icons.inventory,
        'No equipment in inventory',
        'Equipment inventory is currently empty. Add new equipment to get started.',
      );
    }

    // Filter equipment based on search term and category
    final List<Map<String, dynamic>> filteredEquipment =
        equipmentList.where((equipment) {
      final String searchLower = searchTerm.toLowerCase();
      final bool matchesSearch = searchLower.isEmpty ||
          (equipment['name']?.toLowerCase().contains(searchLower) ?? false) ||
          (equipment['category']?.toLowerCase().contains(searchLower) ?? false);

      final bool matchesCategory = selectedCategory == 'All Categories' ||
          equipment['category'] == selectedCategory;

      return matchesSearch && matchesCategory;
    }).toList();

    if (filteredEquipment.isEmpty) {
      return _buildEmptyState(
        Icons.search_off,
        'No equipment found',
        'No equipment matches your search criteria. Try adjusting your filters.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Results summary
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Text(
            'Showing ${filteredEquipment.length} of ${equipmentList.length} items',
            style: TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 14,
            ),
          ),
        ),

        // Equipment list
        ListView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          itemCount: filteredEquipment.length,
          itemBuilder: (context, index) {
            final equipment = filteredEquipment[index];
            return Container(
              margin: EdgeInsets.only(bottom: 16),
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 600;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isWide)
                        // Wide screen layout
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildEquipmentImage(equipment, 120, 120),
                            SizedBox(width: 16),
                            Expanded(child: _buildEquipmentContent(equipment)),
                          ],
                        )
                      else
                        // Narrow screen layout
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                _buildEquipmentImage(equipment, 80, 80),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        equipment['name'] ?? '',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Category: ${equipment['category'] ?? ''}',
                                        style: TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 12),
                            _buildEquipmentDetails(equipment),
                          ],
                        ),
                      SizedBox(height: 12),
                      _buildEquipmentActions(equipment),
                    ],
                  );
                },
              ),
            );
          },
        ),
      ],
    );
  }
  // **FIXED**: Added the missing closing brace for the _buildBrowseTab method.


  // Helper method to build equipment image
  Widget _buildEquipmentImage(
    Map<String, dynamic> equipment,
    double width,
    double height,
  ) {
    final imageUrl = buildImageUrl(equipment['image']);

    if (imageUrl.isEmpty) {
      return Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          Icons.inventory,
          color: Colors.grey[400],
          size: width * 0.4,
        ),
      );
    }

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.network(
          imageUrl,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              color: Colors.grey[200],
              child: Icon(
                Icons.image_not_supported,
                color: Colors.grey[400],
                size: width * 0.4,
              ),
            );
          },
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return Container(
              color: Colors.grey[200],
              child: Center(
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[400]!),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // Helper method to build equipment content for wide screens
  Widget _buildEquipmentContent(Map<String, dynamic> equipment) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          equipment['name'] ?? '',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        SizedBox(height: 8),
        _buildEquipmentDetails(equipment),
      ],
    );
  }

  // Helper method to build equipment details
  Widget _buildEquipmentDetails(Map<String, dynamic> equipment) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Category: ${equipment['category'] ?? 'N/A'}',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
        ),
        SizedBox(height: 4),
        Text(
          'Quantity: ${equipment['quantity'] ?? 0} | Available: ${equipment['availableQuantity'] ?? equipment['quantity'] ?? 0} | Allocated: ${equipment['allocatedQuantity'] ?? 0}',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
        ),
        SizedBox(height: 4),
        if (equipment['condition'] != null && equipment['condition'].isNotEmpty)
          Text(
            'Condition: ${equipment['condition']}',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
          ),
        if (equipment['location'] != null && equipment['location'].isNotEmpty)
          Padding(
            padding: EdgeInsets.only(top: 4),
            child: Text(
              'Location: ${equipment['location']}',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
            ),
          ),
        if (equipment['description'] != null &&
            equipment['description'].isNotEmpty)
          Padding(
            padding: EdgeInsets.only(top: 4),
            child: Text(
              'Description: ${equipment['description']}',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
      ],
    );
  }

  // Helper method to build equipment action buttons
  Widget _buildEquipmentActions(Map<String, dynamic> equipment) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 400) {
          // Wide layout - buttons in a row
          return Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Handle edit
                    _showEditEquipmentDialog(equipment);
                  },
                  icon: Icon(Icons.edit, size: 16),
                  label: Text('Edit'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF6B7280),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Handle delete
                    _showDeleteConfirmationDialog(equipment);
                  },
                  icon: Icon(Icons.delete, size: 16),
                  label: Text('Delete'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFEF4444),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          );
        } else {
          // Narrow layout - buttons stacked
          return Column(
            children: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    _showEditEquipmentDialog(equipment);
                  },
                  icon: Icon(Icons.edit, size: 16),
                  label: Text('Edit'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF6B7280),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    _showDeleteConfirmationDialog(equipment);
                  },
                  icon: Icon(Icons.delete, size: 16),
                  label: Text('Delete'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFEF4444),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          );
        }
      },
    );
  }

  void _showAddEquipmentDialog() {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController quantityController = TextEditingController();
    final TextEditingController descriptionController =
        TextEditingController();
    final TextEditingController conditionController = TextEditingController();
    final TextEditingController locationController = TextEditingController();

    String selectedCategory = categories[1]; // Skip "All Categories"

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('Add New Equipment'),
              content: SingleChildScrollView(
                child: Container(
                  width: MediaQuery.of(context).size.width > 600
                      ? 500
                      : double.maxFinite,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Name field
                      TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          labelText: 'Equipment Name *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Category dropdown
                      DropdownButtonFormField<String>(
                        value: selectedCategory,
                        decoration: InputDecoration(
                          labelText: 'Category *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        items: categories.skip(1).map((String category) {
                          return DropdownMenuItem<String>(
                            value: category,
                            child: Text(category),
                          );
                        }).toList(),
                        onChanged: (String? value) {
                          setDialogState(() {
                            selectedCategory = value ?? categories[1];
                          });
                        },
                      ),
                      SizedBox(height: 16),

                      // Quantity field
                      TextField(
                        controller: quantityController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Quantity *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Condition field
                      TextField(
                        controller: conditionController,
                        decoration: InputDecoration(
                          labelText: 'Condition',
                          hintText: 'e.g., New, Good, Fair, Poor',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Location field
                      TextField(
                        controller: locationController,
                        decoration: InputDecoration(
                          labelText: 'Location',
                          hintText: 'Storage location or area',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Description field
                      TextField(
                        controller: descriptionController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Description',
                          hintText: 'Additional details about the equipment',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    _handleAddSubmit(
                      context,
                      nameController,
                      quantityController,
                      descriptionController,
                      conditionController,
                      locationController,
                      selectedCategory,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF3B82F6),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  child: Text('Add Equipment'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _handleAddSubmit(
    BuildContext context,
    TextEditingController nameController,
    TextEditingController quantityController,
    TextEditingController descriptionController,
    TextEditingController conditionController,
    TextEditingController locationController,
    String selectedCategory,
  ) async {
    // Validate required fields
    if (nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Equipment name is required')),
      );
      return;
    }

    if (quantityController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Quantity is required')),
      );
      return;
    }

    int? quantity = int.tryParse(quantityController.text.trim());
    if (quantity == null || quantity <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter a valid quantity greater than 0')),
      );
      return;
    }

    // Prepare equipment data
    Map<String, dynamic> equipmentData = {
      'name': nameController.text.trim(),
      'category': selectedCategory,
      'quantity': quantity,
      'description': descriptionController.text.trim(),
      'condition': conditionController.text.trim(),
      'location': locationController.text.trim(),
    };

    // Close dialog first
    Navigator.of(context).pop();

    // Show loading indicator
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
            SizedBox(width: 16),
            Text('Adding equipment...'),
          ],
        ),
        duration: Duration(seconds: 30), // Long duration, will be hidden manually
      ),
    );

    // Call the API
    try {
      await handleAddEquipment(equipmentData);
      // Success message is shown in handleAddEquipment
    } catch (error) {
      if(mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add equipment: ${error.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
       if(mounted){
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
       }
    }
  }

  void _showEditEquipmentDialog(Map<String, dynamic> equipment) {
    final TextEditingController nameController =
        TextEditingController(text: equipment['name'] ?? '');
    final TextEditingController quantityController =
        TextEditingController(text: equipment['quantity']?.toString() ?? '');
    final TextEditingController descriptionController =
        TextEditingController(text: equipment['description'] ?? '');
    final TextEditingController conditionController =
        TextEditingController(text: equipment['condition'] ?? '');
    final TextEditingController locationController =
        TextEditingController(text: equipment['location'] ?? '');

    String selectedCategory = equipment['category'] ?? categories[1];
    
    // Ensure the selected category exists in the list
    if (!categories.contains(selectedCategory)) {
        selectedCategory = categories[1]; // Default to the first valid category
    }

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('Edit Equipment'),
              content: SingleChildScrollView(
                child: Container(
                  width: MediaQuery.of(context).size.width > 600
                      ? 500
                      : double.maxFinite,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Name field
                      TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          labelText: 'Equipment Name *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Category dropdown
                      DropdownButtonFormField<String>(
                        value: selectedCategory,
                        decoration: InputDecoration(
                          labelText: 'Category *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        items: categories.skip(1).map((String category) {
                          return DropdownMenuItem<String>(
                            value: category,
                            child: Text(category),
                          );
                        }).toList(),
                        onChanged: (String? value) {
                          setDialogState(() {
                            selectedCategory = value ?? categories[1];
                          });
                        },
                      ),
                      SizedBox(height: 16),

                      // Quantity field
                      TextField(
                        controller: quantityController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Quantity *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Condition field
                      TextField(
                        controller: conditionController,
                        decoration: InputDecoration(
                          labelText: 'Condition',
                          hintText: 'e.g., New, Good, Fair, Poor',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Location field
                      TextField(
                        controller: locationController,
                        decoration: InputDecoration(
                          labelText: 'Location',
                          hintText: 'Storage location or area',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),

                      // Description field
                      TextField(
                        controller: descriptionController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Description',
                          hintText: 'Additional details about the equipment',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),

                      if (equipment['image'] != null &&
                          equipment['image'].isNotEmpty)
                        Padding(
                          padding: EdgeInsets.only(top: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Current Image:',
                                style: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF374151),
                                ),
                              ),
                              SizedBox(height: 8),
                              Container(
                                height: 100,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Color(0xFFE2E8F0)),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    buildImageUrl(equipment['image']),
                                    fit: BoxFit.cover,
                                    errorBuilder:
                                        (context, error, stackTrace) {
                                      return Container(
                                        color: Colors.grey[200],
                                        child: Icon(
                                          Icons.image_not_supported,
                                          color: Colors.grey[400],
                                          size: 40,
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    _handleEditSubmit(
                      context,
                      equipment['_id'],
                      nameController,
                      quantityController,
                      descriptionController,
                      conditionController,
                      locationController,
                      selectedCategory,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF3B82F6),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  child: Text('Update Equipment'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _handleEditSubmit(
    BuildContext context,
    String equipmentId,
    TextEditingController nameController,
    TextEditingController quantityController,
    TextEditingController descriptionController,
    TextEditingController conditionController,
    TextEditingController locationController,
    String selectedCategory,
  ) async {
    // Validate required fields
    if (nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Equipment name is required')),
      );
      return;
    }

    if (quantityController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Quantity is required')),
      );
      return;
    }

    int? quantity = int.tryParse(quantityController.text.trim());
    if (quantity == null || quantity <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter a valid quantity greater than 0')),
      );
      return;
    }

    // Prepare update data
    Map<String, dynamic> updateData = {
      'name': nameController.text.trim(),
      'category': selectedCategory,
      'quantity': quantity,
      'description': descriptionController.text.trim(),
      'condition': conditionController.text.trim(),
      'location': locationController.text.trim(),
    };

    // Close dialog
    Navigator.of(context).pop();

    // Show loading indicator
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
            SizedBox(width: 16),
            Text('Updating equipment...'),
          ],
        ),
        duration: Duration(seconds: 30),
      ),
    );

    // Call the API
    try {
      await handleEditEquipment(equipmentId, updateData);
    } catch (error) {
       if(mounted){
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to update equipment: ${error.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
       }
    } finally {
       if(mounted){
         ScaffoldMessenger.of(context).hideCurrentSnackBar();
       }
    }
  }

  void _showDeleteConfirmationDialog(Map<String, dynamic> equipment) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Delete Equipment'),
          content: Text(
            'Are you sure you want to delete "${equipment['name']}"? This action cannot be undone.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                handleDeleteEquipment(equipment['_id']);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFEF4444),
                foregroundColor: Colors.white,
              ),
              child: Text('Delete'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildRequestsTab() {
    return Center(child: Text('Requests tab content - will be implemented'));
  }

  Widget _buildAllocationsTab() {
    return Center(child: Text('Allocations tab content - will be implemented'));
  }

  Widget _buildReturnsTab() {
    return Center(child: Text('Returns tab content - will be implemented'));
  }

  Widget _buildEmptyState(IconData icon, String title, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: Colors.grey[400]),
            SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
            ),
            SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
            ),
          ],
        ),
      ),
    );
  }
}