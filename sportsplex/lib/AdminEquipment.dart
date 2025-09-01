import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
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
    fetchEquipment();
    fetchRequests();
    fetchAllocations();
    fetchAnalytics();
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
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '${AppConfig.baseUrl}/$cleanPath';
  }

  // Fetch functions
  Future<void> fetchEquipment() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/equipment'),
        headers: authHeaders,
      );
      if (response.statusCode == 200) {
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
      if (response.statusCode == 200) {
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
      if (response.statusCode == 200) {
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
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          analyticsData = [
            {
              'icon': Icons.inventory,
              'count': equipmentList.length,
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
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/equipment'),
        headers: authHeaders,
        body: json.encode(equipmentData),
      );

      if (response.statusCode == 201) {
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment added successfully!')),
        );
      }
    } catch (error) {
      print('Error adding equipment: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding equipment: $error')),
      );
    }
  }

  Future<void> handleEditEquipment(String equipmentId, Map<String, dynamic> equipmentData) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/equipment/$equipmentId'),
        headers: authHeaders,
        body: json.encode(equipmentData),
      );

      if (response.statusCode == 200) {
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment updated successfully!')),
        );
      }
    } catch (error) {
      print('Error updating equipment: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating equipment: $error')),
      );
    }
  }

  Future<void> handleDeleteEquipment(String equipmentId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/equipment/$equipmentId'),
        headers: authHeaders,
      );

      if (response.statusCode == 200) {
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment deleted successfully!')),
        );
      }
    } catch (error) {
      print('Error deleting equipment: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting equipment: $error')),
      );
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
                  child: Icon(
                    stat['icon'],
                    color: stat['color'],
                    size: 20,
                  ),
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
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
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
    List<Map<String, dynamic>> filteredEquipment = equipmentList.where((equipment) {
      // Search term filter
      bool matchesSearch = true;
      if (searchTerm.isNotEmpty) {
        String searchLower = searchTerm.toLowerCase();
        matchesSearch = (equipment['name']?.toLowerCase().contains(searchLower) ?? false) ||
                       (equipment['category']?.toLowerCase().contains(searchLower) ?? false) ||
                       (equipment['description']?.toLowerCase().contains(searchLower) ?? false) ||
                       (equipment['location']?.toLowerCase().contains(searchLower) ?? false);
      }

      // Category filter
      bool matchesCategory = true;
      if (selectedCategory != 'All Categories') {
        matchesCategory = equipment['category'] == selectedCategory;
      }

      return matchesSearch && matchesCategory;
    }).toList();

    if (filteredEquipment.isEmpty) {
      return _buildEmptyState(
        Icons.search_off,
        'No equipment found',
        searchTerm.isNotEmpty || selectedCategory != 'All Categories'
            ? 'No equipment matches your search criteria. Try adjusting your filters.'
            : 'Equipment inventory is currently empty.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Results summary
        Padding(
          padding: EdgeInsets.only(bottom: 16),
          child: Text(
            'Showing ${filteredEquipment.length} of ${equipmentList.length} equipment items',
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
                        // Wide screen layout - image and content side by side
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Image section
                            _buildEquipmentImage(equipment, 120, 120),
                            SizedBox(width: 16),
                            // Content section
                            Expanded(
                              child: _buildEquipmentContent(equipment),
                            ),
                          ],
                        )
                      else
                        // Narrow screen layout - image on top, content below
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                _buildEquipmentImage(equipment, 80, 80),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
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

  // Helper method to build equipment image
  Widget _buildEquipmentImage(Map<String, dynamic> equipment, double width, double height) {
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
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
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
        if (equipment['description'] != null && equipment['description'].isNotEmpty)
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
    final TextEditingController categoryController = TextEditingController();
    final TextEditingController quantityController = TextEditingController();
    final TextEditingController descriptionController = TextEditingController();
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
                  width: MediaQuery.of(context).size.width > 600 ? 500 : double.maxFinite,
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                            categoryController.text = selectedCategory;
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                      categoryController,
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
    TextEditingController categoryController,
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
            Text('Adding equipment...'),
          ],
        ),
        duration: Duration(seconds: 30),
      ),
    );

    // Call the API
    try {
      await handleAddEquipment(equipmentData);
      
      // Hide loading indicator
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      
    } catch (error) {
      // Hide loading indicator
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to add equipment: $error'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showEditEquipmentDialog(Map<String, dynamic> equipment) {
    final TextEditingController nameController = TextEditingController(text: equipment['name'] ?? '');
    final TextEditingController categoryController = TextEditingController(text: equipment['category'] ?? '');
    final TextEditingController quantityController = TextEditingController(text: equipment['quantity']?.toString() ?? '');
    final TextEditingController descriptionController = TextEditingController(text: equipment['description'] ?? '');
    final TextEditingController conditionController = TextEditingController(text: equipment['condition'] ?? '');
    final TextEditingController locationController = TextEditingController(text: equipment['location'] ?? '');
    
    String selectedCategory = equipment['category'] ?? categories.first;
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('Edit Equipment'),
              content: SingleChildScrollView(
                child: Container(
                  width: MediaQuery.of(context).size.width > 600 ? 500 : double.maxFinite,
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      SizedBox(height: 16),
                      
                      // Category dropdown
                      DropdownButtonFormField<String>(
                        value: categories.contains(selectedCategory) ? selectedCategory : categories[1],
                        decoration: InputDecoration(
                          labelText: 'Category *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                            categoryController.text = selectedCategory;
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      
                      if (equipment['image'] != null && equipment['image'].isNotEmpty)
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
                                    errorBuilder: (context, error, stackTrace) {
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
                      categoryController,
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
    TextEditingController categoryController,
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
      
      // Hide loading indicator
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      
    } catch (error) {
      // Hide loading indicator
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update equipment: $error'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showDeleteConfirmationDialog(Map<String, dynamic> equipment) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Delete Equipment'),
          content: Text('Are you sure you want to delete "${equipment['name']}"? This action cannot be undone.'),
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
    return Center(
      child: Text('Requests tab content - will be implemented'),
    );
  }

  Widget _buildAllocationsTab() {
    return Center(
      child: Text('Allocations tab content - will be implemented'),
    );
  }

  Widget _buildReturnsTab() {
    return Center(
      child: Text('Returns tab content - will be implemented'),
    );
  }

  Widget _buildEmptyState(IconData icon, String title, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: Colors.grey[400],
          ),
          SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }
}
import 'package:http/http.dart' as http;
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
  bool isAddModalOpen = false;

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
    'Tennis',
    'Cricket',
    'Badminton',
    'Table Tennis',
    'Volleyball',
  ];

  @override
  void initState() {
    super.initState();
    fetchEquipment();
    fetchRequests();
    fetchAllocations();
    fetchAnalytics();
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
      // Return a path to a local placeholder asset or an empty string
      return '';
    }
    // If it already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // If it starts with /, remove it to avoid double slashes
    final cleanPath = imagePath.startsWith('/')
        ? imagePath.substring(1)
        : imagePath;
    return '${AppConfig.baseUrl}/$cleanPath';
  }

  // Fetch functions
  Future<void> fetchEquipment() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/equipment'),
        headers: authHeaders,
      );
      if (response.statusCode == 200) {
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
      if (response.statusCode == 200) {
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
      if (response.statusCode == 200) {
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
      if (response.statusCode == 200) {
        final analytics = json.decode(response.body);
        setState(() {
          analyticsData = [
            {
              'icon': Icons.inventory,
              'count': analytics['totalEquipment'] ?? 0,
              'label': 'Total Equipment',
              'color': Color(0xFF3B82F6),
            },
            {
              'icon': Icons.access_time,
              'count': analytics['pending'] ?? 0,
              'label': 'Pending Requests',
              'color': Color(0xFFF59E0B),
            },
            {
              'icon': Icons.group,
              'count': analytics['totalAllocated'] ?? 0,
              'label': 'Active Allocations',
              'color': Color(0xFF10B981),
            },
            {
              'icon': Icons.warning,
              'count': analytics['overdueAllocations'] ?? 0,
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

  // Request management functions
  Future<void> handleApproveRequest(String requestId) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/equipment/requests/$requestId'),
        headers: authHeaders,
        body: json.encode({
          'status': 'approved',
          'adminNotes': 'Request approved',
        }),
      );

      if (response.statusCode == 200) {
        fetchRequests();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Request approved successfully!')),
        );
      }
    } catch (error) {
      print('Error approving request: $error');
    }
  }

  Future<void> handleRejectRequest(String requestId, String reason) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/equipment/requests/$requestId'),
        headers: authHeaders,
        body: json.encode({
          'status': 'rejected',
          'adminNotes': reason.isEmpty ? 'Request rejected' : reason,
        }),
      );

      if (response.statusCode == 200) {
        fetchRequests();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Request rejected successfully!')),
        );
      }
    } catch (error) {
      print('Error rejecting request: $error');
    }
  }

  Future<void> handleReturnEquipment(
    String allocationId,
    String returnCondition,
    String returnNotes,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/equipment/return/$allocationId'),
        headers: authHeaders,
        body: json.encode({
          'returnCondition': returnCondition,
          'returnNotes': returnNotes,
        }),
      );

      if (response.statusCode == 200) {
        fetchAllocations();
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment returned successfully!')),
        );
      }
    } catch (error) {
      print('Error returning equipment: $error');
    }
  }

  // Equipment management functions
  Future<void> handleAddEquipment(Map<String, dynamic> equipmentData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/equipment'),
        headers: authHeaders,
        body: json.encode(equipmentData),
      );

      if (response.statusCode == 201) {
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment added successfully!')),
        );
      }
    } catch (error) {
      print('Error adding equipment: $error');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error adding equipment: $error')));
    }
  }

  Future<void> handleEditEquipment(
    String equipmentId,
    Map<String, dynamic> equipmentData,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/equipment/$equipmentId'),
        headers: authHeaders,
        body: json.encode(equipmentData),
      );

      if (response.statusCode == 200) {
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment updated successfully!')),
        );
      }
    } catch (error) {
      print('Error updating equipment: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating equipment: $error')),
      );
    }
  }

  Future<void> handleDeleteEquipment(String equipmentId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/equipment/$equipmentId'),
        headers: authHeaders,
      );

      if (response.statusCode == 200) {
        fetchEquipment();
        fetchAnalytics();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Equipment deleted successfully!')),
        );
      }
    } catch (error) {
      print('Error deleting equipment: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting equipment: $error')),
      );
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
              child: Row(
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
                      setState(() {
                        isAddModalOpen = true;
                      });
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
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Color(0xFFE2E8F0)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedCategory,
          onChanged: (String? newValue) {
            setState(() {
              selectedCategory = newValue!;
            });
          },
          items: categories.map<DropdownMenuItem<String>>((String value) {
            return DropdownMenuItem<String>(value: value, child: Text(value));
          }).toList(),
          style: TextStyle(color: Colors.black, fontSize: 14),
          isExpanded: true,
          icon: Icon(Icons.keyboard_arrow_down, color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildAnalyticsCard(Map<String, dynamic> stat) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: stat['color'].withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(stat['icon'], size: 18, color: stat['color']),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${stat['count']}',
                  style: TextStyle(
                    color: stat['color'],
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  stat['label'],
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
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

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: equipmentList.length,
      itemBuilder: (context, index) {
        final equipment = equipmentList[index];
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
              // **FIXED HERE**: The Column's children are now correctly structured.
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isWide)
                    // Wide screen layout - image and content side by side
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image section
                        _buildEquipmentImage(equipment, 120, 120),
                        SizedBox(width: 16),
                        // Content section
                        Expanded(child: _buildEquipmentContent(equipment)),
                      ],
                    )
                  else
                    // Narrow screen layout - image on top, content below
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            _buildEquipmentImage(equipment, 80, 80),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
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
    );
  }

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

  void _showEditEquipmentDialog(Map<String, dynamic> equipment) {
    // TODO: Implement edit equipment dialog
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Edit functionality will be implemented')),
    );
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

  // **FIXED HERE**: Removed the extra closing brace that was here.
  Widget _buildRequestsTab() {
    if (requests.isEmpty) {
      return _buildEmptyState(
        Icons.inventory,
        'No equipment requests',
        'There are no equipment requests to review at the moment.',
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: requests.length,
      itemBuilder: (context, index) {
        final request = requests[index];
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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      request['equipment']?['name'] ?? '',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Requested by: ${request['requester']?['firstName'] ?? ''} ${request['requester']?['lastName'] ?? ''}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Email: ${request['requester']?['email'] ?? ''}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Quantity: ${request['quantityRequested'] ?? 0}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Duration: ${request['duration']?['hours'] ?? 0} hours ${request['duration']?['minutes'] ?? 0} min',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    if (request['purpose'] != null)
                      Text(
                        'Purpose: ${request['purpose']}',
                        style: TextStyle(color: Color(0xFF64748B)),
                      ),
                    Text(
                      'Requested on: ${_formatDate(request['createdAt'])}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    SizedBox(height: 8),
                    _buildStatusChip(request['status']),
                    if (request['status'] == 'pending') ...[
                      SizedBox(height: 12),
                      Row(
                        children: [
                          ElevatedButton(
                            onPressed: () {
                              handleApproveRequest(request['_id']);
                            },
                            child: Text('Approve'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF10B981),
                              foregroundColor: Colors.white,
                            ),
                          ),
                          SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () {
                              _showRejectDialog(request['_id']);
                            },
                            child: Text('Reject'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFFEF4444),
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (request['adminNotes'] != null) ...[
                      SizedBox(height: 8),
                      Text(
                        'Admin Notes: ${request['adminNotes']}',
                        style: TextStyle(
                          color: Color(0xFF64748B),
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (request['equipment']?['image'] != null)
                Container(
                  margin: EdgeInsets.only(left: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    // **FIXED HERE**: Used the helper function for consistency.
                    child: Image.network(
                      buildImageUrl(request['equipment']['image']),
                      width: 120,
                      height: 90,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 120,
                          height: 90,
                          color: Colors.grey[200],
                          child: Icon(Icons.image_not_supported),
                        );
                      },
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAllocationsTab() {
    final activeAllocations = allocations
        .where((a) => a['status'] == 'allocated')
        .toList();

    if (activeAllocations.isEmpty) {
      return _buildEmptyState(
        Icons.group,
        'No active allocations',
        'There are no equipment allocations currently active.',
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: activeAllocations.length,
      itemBuilder: (context, index) {
        final allocation = activeAllocations[index];
        return AllocationCard(
          allocation: allocation,
          buildImageUrl: buildImageUrl,
        );
      },
    );
  }

  Widget _buildReturnsTab() {
    final activeAllocations = allocations
        .where((a) => a['status'] == 'allocated')
        .toList();

    if (activeAllocations.isEmpty) {
      return _buildEmptyState(
        Icons.inventory,
        'No equipment to return',
        'There are no equipment allocations waiting for return.',
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: activeAllocations.length,
      itemBuilder: (context, index) {
        final allocation = activeAllocations[index];
        final isOverdue = DateTime.now().isAfter(
          DateTime.parse(allocation['expectedReturnDate']),
        );

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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      allocation['equipment']?['name'] ?? '',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Allocated to: ${allocation['allocatedTo']?['firstName'] ?? ''} ${allocation['allocatedTo']?['lastName'] ?? ''}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Quantity: ${allocation['quantityAllocated'] ?? 0}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Allocated on: ${_formatDate(allocation['allocationDate'])}',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    Text(
                      'Expected return: ${_formatDate(allocation['expectedReturnDate'])}${isOverdue ? ' (OVERDUE)' : ''}',
                      style: TextStyle(
                        color: isOverdue
                            ? Color(0xFFDC2626)
                            : Color(0xFF64748B),
                        fontWeight: isOverdue
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                    SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        _showReturnDialog(allocation['_id']);
                      },
                      child: Text('Mark as Returned'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF3B82F6),
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              if (allocation['equipment']?['image'] != null)
                Container(
                  margin: EdgeInsets.only(left: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    // **FIXED HERE**: Used the helper function for consistency.
                    child: Image.network(
                      buildImageUrl(allocation['equipment']['image']),
                      width: 120,
                      height: 90,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 120,
                          height: 90,
                          color: Colors.grey[200],
                          child: Icon(Icons.image_not_supported),
                        );
                      },
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(IconData icon, String title, String subtitle) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Color(0xFF9CA3AF)),
          SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Color(0xFF374151),
            ),
          ),
          SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(color: Color(0xFF64748B)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;

    switch (status) {
      case 'approved':
        backgroundColor = Color(0xFFDCFCE7);
        textColor = Color(0xFF166534);
        break;
      case 'allocated':
        backgroundColor = Color(0xFFDBEAFE);
        textColor = Color(0xFF1E40AF);
        break;
      case 'pending':
        backgroundColor = Color(0xFFFEF3C7);
        textColor = Color(0xFF92400E);
        break;
      default:
        backgroundColor = Color(0xFFFEE2E2);
        textColor = Color(0xFFDC2626);
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textColor,
        ),
      ),
    );
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateString;
    }
  }

  void _showRejectDialog(String requestId) {
    TextEditingController reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Reject Request'),
          content: TextField(
            controller: reasonController,
            decoration: InputDecoration(
              hintText: 'Enter rejection reason (optional)',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                handleRejectRequest(requestId, reasonController.text);
                Navigator.of(context).pop();
              },
              child: Text('Reject'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFEF4444),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }

  void _showReturnDialog(String allocationId) {
    String selectedCondition = 'good';
    TextEditingController notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text('Mark Equipment as Returned'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    value: selectedCondition,
                    decoration: InputDecoration(
                      labelText: 'Return Condition',
                      border: OutlineInputBorder(),
                    ),
                    items: ['excellent', 'good', 'fair', 'poor', 'damaged']
                        .map(
                          (condition) => DropdownMenuItem(
                            value: condition,
                            child: Text(condition.toUpperCase()),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedCondition = value!;
                      });
                    },
                  ),
                  SizedBox(height: 16),
                  TextField(
                    controller: notesController,
                    decoration: InputDecoration(
                      hintText: 'Return notes (optional)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    handleReturnEquipment(
                      allocationId,
                      selectedCondition,
                      notesController.text,
                    );
                    Navigator.of(context).pop();
                  },
                  child: Text('Mark as Returned'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF3B82F6),
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}

// AllocationCard widget with timer
class AllocationCard extends StatefulWidget {
  final Map<String, dynamic> allocation;
  final String Function(String?) buildImageUrl; // Pass the helper function

  AllocationCard({required this.allocation, required this.buildImageUrl});

  @override
  _AllocationCardState createState() => _AllocationCardState();
}

class _AllocationCardState extends State<AllocationCard> {
  String timeLeft = '';
  Timer? timer;

  @override
  void initState() {
    super.initState();
    _updateTimer();
    timer = Timer.periodic(Duration(seconds: 1), (timer) {
      _updateTimer();
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  void _updateTimer() {
    if (widget.allocation['expectedReturnDate'] == null) {
      if (mounted) {
        setState(() {
          timeLeft = 'Unknown';
        });
      }
      return;
    }

    final endTime = DateTime.parse(widget.allocation['expectedReturnDate']);
    final now = DateTime.now();
    final diff = endTime.difference(now);

    if (diff.isNegative) {
      if (mounted) {
        setState(() {
          timeLeft = 'Expired';
        });
      }
      return;
    }

    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    final seconds = diff.inSeconds % 60;

    if (mounted) {
      setState(() {
        timeLeft = '${hours}h ${minutes}m ${seconds}s';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOverdue = timeLeft == 'Expired';

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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.allocation['equipment']?['name'] ?? '',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
                SizedBox(height: 8),
                Text(
                  'Allocated to: ${widget.allocation['allocatedTo']?['firstName'] ?? ''} ${widget.allocation['allocatedTo']?['lastName'] ?? ''}',
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                Text(
                  'Email: ${widget.allocation['allocatedTo']?['email'] ?? ''}',
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                Text(
                  'Quantity: ${widget.allocation['quantityAllocated'] ?? 0}',
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                Text(
                  'Allocated on: ${_formatDate(widget.allocation['allocationDate'])}',
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                Text(
                  'Time left: $timeLeft${isOverdue ? ' (OVERDUE)' : ''}',
                  style: TextStyle(
                    color: isOverdue ? Color(0xFFDC2626) : Color(0xFF64748B),
                    fontWeight: isOverdue ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                SizedBox(height: 8),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: isOverdue ? Color(0xFFFEE2E2) : Color(0xFFDBEAFE),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isOverdue ? 'Overdue' : 'Active',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isOverdue ? Color(0xFFDC2626) : Color(0xFF1E40AF),
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (widget.allocation['equipment']?['image'] != null)
            Container(
              margin: EdgeInsets.only(left: 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                // **FIXED HERE**: Used the passed helper function.
                child: Image.network(
                  widget.buildImageUrl(widget.allocation['equipment']['image']),
                  width: 120,
                  height: 90,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 120,
                      height: 90,
                      color: Colors.grey[200],
                      child: Icon(Icons.image_not_supported),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateString;
    }
  }
}
