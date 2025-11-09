import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import 'app_config.dart';

class StudentEquipment extends StatefulWidget {
  final String userId;
  final String? token;
  const StudentEquipment({Key? key, required this.userId, this.token})
    : super(key: key);

  @override
  State<StudentEquipment> createState() => _StudentEquipmentState();
}

class _StudentEquipmentState extends State<StudentEquipment> {
  List<dynamic> equipment = [];
  List<dynamic> myAllocations = [];
  List<dynamic> myRequests = [];
  List<dynamic> allEquipmentAllocations = [];
  bool isLoading = true;
  bool isAllocLoading = true;
  bool isRequestsLoading = true;
  String? requestsError;
  bool isAvailabilityLoading = false;
  int selectedIndex = -1;
  DateTime? requestStartDate;
  DateTime? expectedReturnDate;
  int requestQuantity = 1;
  String requestPurpose = '';
  bool isRequesting = false;
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  // Get authentication headers
  Map<String, String> get authHeaders => {
    'Content-Type': 'application/json',
    if (widget.token != null) 'Authorization': 'Bearer ${widget.token}',
  };

  String _calculateDuration(DateTime start, DateTime end) {
    final duration = end.difference(start);
    if (duration.inDays > 0) {
      return '${duration.inDays} day${duration.inDays > 1 ? 's' : ''}';
    } else if (duration.inHours > 0) {
      return '${duration.inHours} hour${duration.inHours > 1 ? 's' : ''}';
    } else {
      return '${duration.inMinutes} minute${duration.inMinutes > 1 ? 's' : ''}';
    }
  }

  Future<void> fetchEquipment() async {
    try {
      print(
        'Fetching equipment from: ${AppConfig.baseUrl}/api/equipment/public',
      );
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/api/equipment/public'),
      );

      print('Equipment API Response Status: ${response.statusCode}');
      print('Equipment API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          equipment = data is List ? data : [];
          isLoading = false;
        });

        print('Equipment loaded: ${equipment.length} items');
      } else {
        print('Equipment API Error: ${response.statusCode} - ${response.body}');
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      print('Equipment API Exception: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchMyAllocations() async {
    try {
      // For now, just set empty allocations since this requires authentication
      // We can add authentication later
      print('Skipping my allocations for now (requires authentication)');
      setState(() {
        myAllocations = [];
        isAllocLoading = false;
      });
    } catch (e) {
      print('Allocations API Exception: $e');
      setState(() {
        myAllocations = [];
        isAllocLoading = false;
      });
    }
  }

  Future<void> fetchMyRequests() async {
    // Ensure token exists
    if (widget.token == null || widget.token!.isEmpty) {
      print('⚠️ No token available, skipping my requests fetch');
      setState(() {
        myRequests = [];
        requestsError = 'Not authenticated';
        isRequestsLoading = false;
      });
      return;
    }

    setState(() {
      isRequestsLoading = true;
      requestsError = null;
    });

    try {
      final url = '${AppConfig.baseUrl}/api/equipment-working/requests/my';
      print('Fetching my requests from: $url');
      final response = await http.get(Uri.parse(url), headers: authHeaders);

      print('My Requests API Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          myRequests = data is List ? data : [];
          isRequestsLoading = false;
          requestsError = null;
        });
        print('✅ Successfully loaded ${myRequests.length} requests');
      } else if (response.statusCode == 401) {
        // Unauthorized - token missing/expired
        setState(() {
          myRequests = [];
          isRequestsLoading = false;
          requestsError = 'Not authorized — please log in again.';
        });
        print('🔒 My Requests unauthorized: ${response.body}');
      } else {
        setState(() {
          myRequests = [];
          isRequestsLoading = false;
          requestsError = 'Failed to fetch requests: ${response.statusCode}';
        });
        print('My Requests API Error: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('My Requests API Exception: $e');
      setState(() {
        myRequests = [];
        isRequestsLoading = false;
        requestsError = 'Failed to fetch requests';
      });
    }
  }

  Future<void> fetchAllEquipmentAllocations() async {
    setState(() {
      isAvailabilityLoading = true;
    });
    try {
      print(
        'Fetching all allocations from: ${AppConfig.baseUrl}/api/equipment/allocations/public',
      );
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/api/equipment/allocations/public'),
      );

      print('All Allocations API Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          allEquipmentAllocations = data is List ? data : [];
          isAvailabilityLoading = false;
        });
      } else {
        print(
          'All Allocations API Error: ${response.statusCode} - ${response.body}',
        );
        setState(() {
          allEquipmentAllocations = [];
          isAvailabilityLoading = false;
        });
      }
    } catch (e) {
      print('All Allocations API Exception: $e');
      setState(() {
        allEquipmentAllocations = [];
        isAvailabilityLoading = false;
      });
    }
  }

  bool isDateTimeBlocked(
    String equipmentId,
    DateTime checkDate,
    DateTime? endDate,
  ) {
    for (var allocation in allEquipmentAllocations) {
      if (allocation['equipment']['_id'] == equipmentId &&
          allocation['status'] == 'allocated') {
        DateTime allocStart = DateTime.parse(allocation['allocationDate']);
        DateTime allocEnd = DateTime.parse(allocation['expectedReturnDate']);

        // Check for overlapping date ranges
        DateTime checkStart = checkDate;
        DateTime checkEnd = endDate ?? checkDate.add(Duration(hours: 1));

        bool overlaps =
            checkStart.isBefore(allocEnd) && checkEnd.isAfter(allocStart);

        if (overlaps) {
          return true;
        }
      }
    }
    return false;
  }

  int getAvailableQuantity(
    String equipmentId,
    DateTime? startDate,
    DateTime? endDate,
  ) {
    final equipmentItem = equipment.firstWhere(
      (item) => item['_id'] == equipmentId,
      orElse: () => {'quantity': 0},
    );

    int totalQuantity = equipmentItem['quantity'] ?? 0;
    int allocatedQuantity = 0;

    if (startDate != null && endDate != null) {
      for (var allocation in allEquipmentAllocations) {
        if (allocation['equipment']['_id'] == equipmentId &&
            allocation['status'] == 'allocated') {
          DateTime allocStart = DateTime.parse(allocation['allocationDate']);
          DateTime allocEnd = DateTime.parse(allocation['expectedReturnDate']);

          // Check for overlapping date ranges
          bool overlaps =
              startDate.isBefore(allocEnd) && endDate.isAfter(allocStart);

          if (overlaps) {
            allocatedQuantity +=
                (allocation['quantityAllocated'] as num?)?.toInt() ?? 0;
          }
        }
      }
    }

    return totalQuantity - allocatedQuantity;
  }

  Future<void> sendRequest(String equipmentId) async {
    if (expectedReturnDate == null || requestStartDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select both start and end dates')),
      );
      return;
    }

    if (requestPurpose.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter the purpose for this request')),
      );
      return;
    }

    // Check availability for the selected date range
    int available = getAvailableQuantity(
      equipmentId,
      requestStartDate!,
      expectedReturnDate!,
    );
    if (available < requestQuantity) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Not enough equipment available for selected dates'),
        ),
      );
      return;
    }

    setState(() {
      isRequesting = true;
    });

    // Calculate duration
    final duration = expectedReturnDate!.difference(requestStartDate!);
    String durationText;
    if (duration.inDays > 0) {
      durationText = '${duration.inDays} day${duration.inDays > 1 ? 's' : ''}';
    } else if (duration.inHours > 0) {
      durationText =
          '${duration.inHours} hour${duration.inHours > 1 ? 's' : ''}';
    } else {
      durationText =
          '${duration.inMinutes} minute${duration.inMinutes > 1 ? 's' : ''}';
    }

    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/api/equipment-working/request'),
      headers: authHeaders,
      body: jsonEncode({
        'equipmentId': equipmentId,
        'requestStartDate': requestStartDate!.toIso8601String(),
        'expectedReturnDate': expectedReturnDate!.toIso8601String(),
        'quantityRequested': requestQuantity,
        'duration': durationText,
        'purpose': requestPurpose.trim(),
      }),
    );

    print('Request Response Status: ${response.statusCode}');
    print('Request Response Body: ${response.body}');

    setState(() {
      isRequesting = false;
    });

    if (response.statusCode == 201) {
      Navigator.of(context).pop(); // Close request dialog
      fetchEquipment();
      fetchMyAllocations();
      fetchMyRequests();
      fetchAllEquipmentAllocations(); // Refresh availability data

      // Show success dialog
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            title: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 30),
                SizedBox(width: 10),
                Text('Request Sent!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your equipment request has been submitted successfully.',
                  style: TextStyle(fontSize: 16),
                ),
                SizedBox(height: 12),
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '📋 Request Details:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text('Quantity: $requestQuantity'),
                      Text('Duration: $durationText'),
                      Text('Purpose: ${requestPurpose.trim()}'),
                    ],
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'You can track the status of your request in the "My Requests" section below.',
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                ),
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Text('Got it!', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          );
        },
      );
    } else {
      // Show detailed error message
      String errorMessage = 'Failed to send request';
      try {
        final error = jsonDecode(response.body);
        errorMessage = error['error'] ?? error['message'] ?? errorMessage;
      } catch (e) {
        errorMessage = 'Failed to send request: ${response.statusCode}';
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    fetchEquipment();
    fetchMyAllocations();
    fetchMyRequests();
    fetchAllEquipmentAllocations();
    _selectedDay = DateTime.now();
  }

  Widget _buildEquipmentCard(
    dynamic item,
    int available,
    int totalQuantity,
    int currentAllocated,
    int index,
  ) {
    final category = item['category'] ?? 'Other';
    final name = item['name'] ?? 'Equipment';
    final description = item['description'] ?? '';

    // Choose icon and color based on category
    IconData iconData = Icons.sports;
    Color categoryColor = Colors.blue;

    switch (category.toLowerCase()) {
      case 'volleyball':
        iconData = Icons.sports_volleyball;
        categoryColor = Colors.orange;
        break;
      case 'basketball':
        iconData = Icons.sports_basketball;
        categoryColor = Colors.deepOrange;
        break;
      case 'cricket':
        iconData = Icons.sports_cricket;
        categoryColor = Colors.green;
        break;
      case 'football':
        iconData = Icons.sports_soccer;
        categoryColor = Colors.red;
        break;
      case 'badminton':
        iconData = Icons.sports_tennis;
        categoryColor = Colors.purple;
        break;
      default:
        iconData = Icons.sports;
        categoryColor = Colors.blue;
    }

    return Card(
      elevation: 2,
      shadowColor: Colors.grey.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        constraints: BoxConstraints(minHeight: 160, maxHeight: 200),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.white,
          border: Border.all(color: Colors.grey.withOpacity(0.2), width: 1),
        ),
        child: Padding(
          padding: EdgeInsets.all(12),
          child: Row(
            children: [
              // Left side - Information
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Equipment Name
                    Flexible(
                      child: Text(
                        name,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    SizedBox(height: 6),

                    // Category
                    Flexible(
                      child: Text(
                        'Category: $category',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    SizedBox(height: 6),

                    // Available with green badge
                    Flexible(
                      child: Row(
                        children: [
                          Flexible(
                            child: Text(
                              'Available: $available / $totalQuantity',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          SizedBox(width: 8),
                          Flexible(
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: available > 0
                                    ? Colors.green
                                    : Colors.red,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                available > 0
                                    ? '${((available / totalQuantity) * 100).round()}%'
                                    : 'N/A',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 6),

                    // Condition
                    Flexible(
                      child: Text(
                        'Condition: ${equipment[index]['condition'] ?? 'Good'}',
                        style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    SizedBox(height: 6),

                    // Location
                    Flexible(
                      child: Text(
                        'Location: ${equipment[index]['location'] ?? 'Sports Complex'}',
                        style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    if (description.isNotEmpty) ...[
                      SizedBox(height: 6),
                      Flexible(
                        child: Text(
                          'Description: $description',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],

                    SizedBox(height: 8),

                    // Currently Allocated
                    Flexible(
                      child: Row(
                        children: [
                          Icon(Icons.assignment, size: 14, color: Colors.blue),
                          SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'Allocated: $currentAllocated units',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.blue,
                                fontWeight: FontWeight.w500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),

                    Spacer(),

                    // Action Button
                    SizedBox(
                      width: double.infinity,
                      height: 32,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: available > 0
                              ? Colors.blue
                              : Colors.grey[400],
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        onPressed: available > 0
                            ? () {
                                setState(() {
                                  selectedIndex = index;
                                  requestStartDate = null;
                                  expectedReturnDate = null;
                                  requestQuantity = 1;
                                  requestPurpose = '';
                                });
                                showDialog(
                                  context: context,
                                  builder: (_) => buildRequestModal(index),
                                );
                              }
                            : null,
                        child: Text(
                          'Request Equipment',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Right side - Equipment Image
              SizedBox(width: 12),
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.grey.withOpacity(0.2),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 1,
                      blurRadius: 3,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: _buildEquipmentImage(item, categoryColor, iconData),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEquipmentImage(
    dynamic item,
    Color categoryColor,
    IconData iconData,
  ) {
    final imageUrl = item['image'];

    // Check if we have a valid image URL from database
    if (imageUrl != null && imageUrl.toString().isNotEmpty) {
      String fullImageUrl;

      // Handle different image URL formats from database
      if (imageUrl.toString().startsWith('http')) {
        fullImageUrl = imageUrl.toString();
      } else if (imageUrl.toString().startsWith('/')) {
        fullImageUrl = '${AppConfig.baseUrl}$imageUrl';
      } else {
        fullImageUrl = '${AppConfig.baseUrl}/uploads/equipment/$imageUrl';
      }

      return Image.network(
        fullImageUrl,
        width: 110,
        height: 110,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          print('Image loading error for ${item['name']}: $error');
          return _buildDefaultIcon(categoryColor, iconData);
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            width: 110,
            height: 110,
            color: Colors.grey[50],
            child: Center(
              child: CircularProgressIndicator(
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded /
                          loadingProgress.expectedTotalBytes!
                    : null,
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(categoryColor),
              ),
            ),
          );
        },
      );
    } else {
      // No image available, show category icon
      return _buildDefaultIcon(categoryColor, iconData);
    }
  }

  Widget _buildDefaultIcon(Color categoryColor, IconData iconData) {
    return Container(
      width: 110,
      height: 110,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            categoryColor.withOpacity(0.1),
            categoryColor.withOpacity(0.2),
          ],
        ),
      ),
      child: Icon(iconData, size: 40, color: categoryColor),
    );
  }

  Widget buildRequestModal(int index) {
    final item = equipment[index];

    return StatefulBuilder(
      builder: (BuildContext context, StateSetter setModalState) {
        final currentAvailable = getAvailableQuantity(
          item['_id'],
          requestStartDate,
          expectedReturnDate,
        );

        return AlertDialog(
          title: Text('Request Equipment'),
          content: Container(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Equipment: ${item['name']}',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text('Total Quantity: ${item['quantity'] ?? 0}'),
                  if (requestStartDate != null && expectedReturnDate != null)
                    Text(
                      'Available for selected dates: $currentAvailable',
                      style: TextStyle(
                        color: currentAvailable > 0 ? Colors.green : Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  SizedBox(height: 16),

                  // Quantity Input
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Quantity:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 8),
                      Row(
                        children: [
                          IconButton(
                            onPressed: requestQuantity > 1
                                ? () => setModalState(() {
                                    requestQuantity--;
                                  })
                                : null,
                            icon: Icon(Icons.remove_circle_outline),
                            color: Colors.red,
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '$requestQuantity',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed:
                                requestQuantity <
                                    (currentAvailable > 0
                                        ? currentAvailable
                                        : 100)
                                ? () => setModalState(() {
                                    requestQuantity++;
                                  })
                                : null,
                            icon: Icon(Icons.add_circle_outline),
                            color: Colors.green,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Available: $currentAvailable',
                            style: TextStyle(
                              color: currentAvailable > 0
                                  ? Colors.green
                                  : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Purpose Input
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Purpose (required)',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (val) => setModalState(() {
                      requestPurpose = val;
                    }),
                  ),
                  SizedBox(height: 16),

                  // Start Date & Time
                  Text(
                    'Start Date & Time:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(Duration(days: 30)),
                      );
                      if (picked != null) {
                        final time = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.now(),
                        );
                        if (time != null) {
                          setModalState(() {
                            requestStartDate = DateTime(
                              picked.year,
                              picked.month,
                              picked.day,
                              time.hour,
                              time.minute,
                            );
                            // Auto-set return date to 24 hours later if not set
                            if (expectedReturnDate == null) {
                              expectedReturnDate = requestStartDate!.add(
                                Duration(hours: 24),
                              );
                            }
                          });
                        }
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.calendar_today, color: Colors.blue),
                          SizedBox(width: 8),
                          Text(
                            requestStartDate == null
                                ? 'Select Start Date & Time'
                                : DateFormat(
                                    'yyyy-MM-dd – HH:mm',
                                  ).format(requestStartDate!),
                            style: TextStyle(fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 16),

                  // Return Date & Time
                  Text(
                    'Return Date & Time:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  InkWell(
                    onTap: () async {
                      DateTime initialDate =
                          requestStartDate?.add(Duration(hours: 1)) ??
                          DateTime.now();
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: initialDate,
                        firstDate: requestStartDate ?? DateTime.now(),
                        lastDate: DateTime.now().add(Duration(days: 30)),
                      );
                      if (picked != null) {
                        final time = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.fromDateTime(initialDate),
                        );
                        if (time != null) {
                          setModalState(() {
                            expectedReturnDate = DateTime(
                              picked.year,
                              picked.month,
                              picked.day,
                              time.hour,
                              time.minute,
                            );
                          });
                        }
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.schedule, color: Colors.orange),
                          SizedBox(width: 8),
                          Text(
                            expectedReturnDate == null
                                ? 'Select Return Date & Time'
                                : DateFormat(
                                    'yyyy-MM-dd – HH:mm',
                                  ).format(expectedReturnDate!),
                            style: TextStyle(fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  requestStartDate = null;
                  expectedReturnDate = null;
                  requestQuantity = 1;
                  requestPurpose = '';
                });
                Navigator.of(context).pop();
              },
              child: Text('Cancel'),
            ),
            ElevatedButton(
              onPressed:
                  (isRequesting ||
                      requestStartDate == null ||
                      expectedReturnDate == null ||
                      currentAvailable < requestQuantity)
                  ? null
                  : () => sendRequest(item['_id']),
              child: isRequesting
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text('Send Request'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: Colors.grey[50],
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Colors.grey[800],
          title: Text(
            'Equipment Center',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22),
          ),
          actions: [
            IconButton(
              icon: Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.refresh, color: Colors.blue, size: 20),
              ),
              onPressed: () {
                fetchEquipment();
                fetchMyAllocations();
                fetchMyRequests();
                fetchAllEquipmentAllocations();
              },
            ),
            if (isAvailabilityLoading)
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                    ),
                  ),
                ),
              ),
            SizedBox(width: 8),
          ],
          bottom: TabBar(
            labelColor: Colors.blue,
            unselectedLabelColor: Colors.grey,
            indicatorColor: Colors.blue,
            indicatorWeight: 3,
            tabs: [
              Tab(icon: Icon(Icons.inventory_2), text: 'Available Equipment'),
              Tab(icon: Icon(Icons.pending_actions), text: 'My Requests'),
            ],
          ),
        ),
        body: TabBarView(children: [_buildEquipmentList(), _buildMyRequests()]),
      ),
    );
  }

  Widget _buildEquipmentList() {
    return Column(
      children: [
        // Header Section
        Container(
          width: double.infinity,
          padding: EdgeInsets.fromLTRB(20, 20, 20, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 3,
                offset: Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Available Equipment',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Select and request equipment for your activities',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              if (equipment.isNotEmpty) ...[
                SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${equipment.length} Items Available',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),

        // Equipment List
        Expanded(
          child: isLoading
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Loading Equipment...',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                )
              : equipment.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.sports, size: 80, color: Colors.grey[400]),
                      SizedBox(height: 16),
                      Text(
                        'No Equipment Available',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 8),
                      Text('Check back later for new equipment'),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: equipment.length,
                  itemBuilder: (context, index) {
                    final item = equipment[index];
                    final totalQuantity = item['quantity'] ?? 0;
                    final currentAllocated = allEquipmentAllocations
                        .where(
                          (alloc) =>
                              alloc['equipment']['_id'] == item['_id'] &&
                              alloc['status'] == 'allocated',
                        )
                        .fold(
                          0,
                          (sum, alloc) =>
                              sum +
                              ((alloc['quantityAllocated'] as num?)?.toInt() ??
                                  0),
                        );
                    final available = totalQuantity - currentAllocated;

                    return Padding(
                      padding: EdgeInsets.only(bottom: 8),
                      child: _buildEquipmentCard(
                        item,
                        available,
                        totalQuantity,
                        currentAllocated,
                        index,
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildMyRequests() {
    return Column(
      children: [
        // Header Section
        Container(
          width: double.infinity,
          padding: EdgeInsets.fromLTRB(20, 20, 20, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 3,
                offset: Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'My Requests',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Track the status of your equipment requests',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              if (myRequests.isNotEmpty) ...[
                SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${myRequests.length} Request${myRequests.length != 1 ? 's' : ''}',
                        style: TextStyle(
                          color: Colors.orange,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),

        // Requests List
        Expanded(
          child: isRequestsLoading
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Loading Requests...',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                )
              : myRequests.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inbox, size: 80, color: Colors.grey[400]),
                      SizedBox(height: 16),
                      Text(
                        'No Requests Yet',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Request equipment from the Available Equipment tab',
                        style: TextStyle(color: Colors.grey[500]),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: myRequests.length,
                  itemBuilder: (context, index) {
                    final request = myRequests[index];
                    return _buildRequestCard(request);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildRequestCard(dynamic request) {
    final equipment = request['equipment'] ?? {};
    final status = request['status'] ?? 'pending';
    final quantityRequested = request['quantityRequested'] ?? 0;
    final purpose = request['purpose'] ?? 'N/A';
    final duration = request['duration'] ?? 'N/A';
    final requestDate = request['createdAt'] != null
        ? DateTime.parse(request['createdAt'])
        : null;
    final startDate = request['requestStartDate'] != null
        ? DateTime.parse(request['requestStartDate'])
        : null;
    final returnDate = request['expectedReturnDate'] != null
        ? DateTime.parse(request['expectedReturnDate'])
        : null;

    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (status.toLowerCase()) {
      case 'approved':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        statusText = 'Approved';
        break;
      case 'rejected':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        statusText = 'Rejected';
        break;
      case 'pending':
      default:
        statusColor = Colors.orange;
        statusIcon = Icons.schedule;
        statusText = 'Pending';
        break;
    }

    return Card(
      margin: EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    equipment['name'] ?? 'Equipment',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 16, color: statusColor),
                      SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Divider(),
            SizedBox(height: 8),
            _buildRequestDetailRow(
              Icons.shopping_cart,
              'Quantity',
              '$quantityRequested',
            ),
            SizedBox(height: 8),
            _buildRequestDetailRow(Icons.access_time, 'Duration', duration),
            SizedBox(height: 8),
            if (startDate != null)
              _buildRequestDetailRow(
                Icons.calendar_today,
                'Start Date',
                DateFormat('MMM dd, yyyy – HH:mm').format(startDate),
              ),
            SizedBox(height: 8),
            if (returnDate != null)
              _buildRequestDetailRow(
                Icons.event,
                'Return Date',
                DateFormat('MMM dd, yyyy – HH:mm').format(returnDate),
              ),
            SizedBox(height: 8),
            _buildRequestDetailRow(Icons.description, 'Purpose', purpose),
            if (requestDate != null) ...[
              SizedBox(height: 12),
              Text(
                'Requested on: ${DateFormat('MMM dd, yyyy').format(requestDate)}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRequestDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: Colors.blue),
        SizedBox(width: 8),
        Text(
          '$label: ',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.grey[700],
          ),
        ),
        Expanded(
          child: Text(value, style: TextStyle(color: Colors.grey[600])),
        ),
      ],
    );
  }
}
