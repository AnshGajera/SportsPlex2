import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import 'app_config.dart';

class StudentEquipment extends StatefulWidget {
  final String userId;
  const StudentEquipment({Key? key, required this.userId}) : super(key: key);

  @override
  State<StudentEquipment> createState() => _StudentEquipmentState();
}

class _StudentEquipmentState extends State<StudentEquipment> {
  List<dynamic> equipment = [];
  List<dynamic> myAllocations = [];
  List<dynamic> allEquipmentAllocations = [];
  bool isLoading = true;
  bool isAllocLoading = true;
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

  Future<void> fetchEquipment() async {
    try {
      print('Fetching equipment from: ${AppConfig.baseUrl}/api/equipment/public');
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
      print('Fetching allocations from: ${AppConfig.baseUrl}/api/equipment-working/allocations/my?userId=${widget.userId}');
      final response = await http.get(
        Uri.parse(
          '${AppConfig.baseUrl}/api/equipment-working/allocations/my?userId=${widget.userId}',
        ),
      );
      
      print('Allocations API Response Status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          myAllocations = data is List ? data : [];
          isAllocLoading = false;
        });
      } else {
        print('Allocations API Error: ${response.statusCode} - ${response.body}');
        setState(() {
          myAllocations = [];
          isAllocLoading = false;
        });
      }
    } catch (e) {
      print('Allocations API Exception: $e');
      setState(() {
        myAllocations = [];
        isAllocLoading = false;
      });
    }
  }

  Future<void> fetchAllEquipmentAllocations() async {
    setState(() {
      isAvailabilityLoading = true;
    });
    try {
      print('Fetching all allocations from: ${AppConfig.baseUrl}/api/equipment-working/allocations');
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/api/equipment-working/allocations'),
      );
      
      print('All Allocations API Response Status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          allEquipmentAllocations = data is List ? data : [];
          isAvailabilityLoading = false;
        });
      } else {
        print('All Allocations API Error: ${response.statusCode} - ${response.body}');
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

  bool isDateTimeBlocked(String equipmentId, DateTime checkDate, DateTime? endDate) {
    for (var allocation in allEquipmentAllocations) {
      if (allocation['equipment']['_id'] == equipmentId &&
          allocation['status'] == 'allocated') {
        
        DateTime allocStart = DateTime.parse(allocation['allocationDate']);
        DateTime allocEnd = DateTime.parse(allocation['expectedReturnDate']);
        
        // Check for overlapping date ranges
        DateTime checkStart = checkDate;
        DateTime checkEnd = endDate ?? checkDate.add(Duration(hours: 1));
        
        bool overlaps = checkStart.isBefore(allocEnd) && checkEnd.isAfter(allocStart);
        
        if (overlaps) {
          return true;
        }
      }
    }
    return false;
  }

  int getAvailableQuantity(String equipmentId, DateTime? startDate, DateTime? endDate) {
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
          bool overlaps = startDate.isBefore(allocEnd) && endDate.isAfter(allocStart);
          
          if (overlaps) {
            allocatedQuantity += (allocation['quantityAllocated'] as num?)?.toInt() ?? 0;
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
    
    // Check availability for the selected date range
    int available = getAvailableQuantity(equipmentId, requestStartDate!, expectedReturnDate!);
    if (available < requestQuantity) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Not enough equipment available for selected dates')),
      );
      return;
    }
    
    setState(() {
      isRequesting = true;
    });
    
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/api/equipment-working/request'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'equipmentId': equipmentId,
        'requestStartDate': requestStartDate!.toIso8601String(),
        'expectedReturnDate': expectedReturnDate!.toIso8601String(),
        'quantityRequested': requestQuantity,
        'purpose': requestPurpose,
        'userId': widget.userId,
      }),
    );
    
    setState(() {
      isRequesting = false;
    });
    
    if (response.statusCode == 201) {
      Navigator.of(context).pop();
      fetchEquipment();
      fetchMyAllocations();
      fetchAllEquipmentAllocations(); // Refresh availability data
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Request sent successfully!')));
    } else {
      final error = jsonDecode(response.body);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error['message'] ?? 'Failed to send request')));
    }
  }

  @override
  void initState() {
    super.initState();
    fetchEquipment();
    fetchMyAllocations();
    fetchAllEquipmentAllocations();
    _selectedDay = DateTime.now();
  }

  Widget _buildEquipmentCard(dynamic item, int available, int totalQuantity, int currentAllocated, int index) {
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
      elevation: 8,
      shadowColor: Colors.grey.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              categoryColor.withOpacity(0.05),
            ],
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with icon and category
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: categoryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      iconData,
                      size: 32,
                      color: categoryColor,
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        SizedBox(height: 4),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: categoryColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            category,
                            style: TextStyle(
                              fontSize: 12,
                              color: categoryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              SizedBox(height: 16),
              
              // Description
              if (description.isNotEmpty) ...[
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 16),
              ],
              
              // Availability Stats
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem('Total', totalQuantity.toString(), Colors.blue),
                    _buildStatItem('Available', available.toString(), available > 0 ? Colors.green : Colors.red),
                    if (currentAllocated > 0)
                      _buildStatItem('In Use', currentAllocated.toString(), Colors.orange),
                  ],
                ),
              ),
              
              SizedBox(height: 20),
              
              // Action Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: available > 0 ? categoryColor : Colors.grey[400],
                    foregroundColor: Colors.white,
                    elevation: available > 0 ? 4 : 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: available > 0 ? () {
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
                  } : null,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        available > 0 ? Icons.add_shopping_cart : Icons.block,
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        available > 0 ? 'Request Equipment' : 'Currently Unavailable',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget buildRequestModal(int index) {
    final item = equipment[index];
    final currentAvailable = getAvailableQuantity(
      item['_id'], 
      requestStartDate, 
      expectedReturnDate
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
              Text('Equipment: ${item['name']}', style: TextStyle(fontWeight: FontWeight.bold)),
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
              TextField(
                decoration: InputDecoration(
                  labelText: 'Quantity',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (val) => setState(() {
                  requestQuantity = int.tryParse(val) ?? 1;
                }),
              ),
              SizedBox(height: 16),
              
              // Purpose Input
              TextField(
                decoration: InputDecoration(
                  labelText: 'Purpose (optional)',
                  border: OutlineInputBorder(),
                ),
                onChanged: (val) => setState(() {
                  requestPurpose = val;
                }),
              ),
              SizedBox(height: 16),
              
              // Start Date & Time
              Text('Start Date & Time:', style: TextStyle(fontWeight: FontWeight.bold)),
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
                      setState(() {
                        requestStartDate = DateTime(
                          picked.year,
                          picked.month,
                          picked.day,
                          time.hour,
                          time.minute,
                        );
                        // Auto-set return date to 24 hours later if not set
                        if (expectedReturnDate == null) {
                          expectedReturnDate = requestStartDate!.add(Duration(hours: 24));
                        }
                      });
                    }
                  }
                },
                child: Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
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
                            : DateFormat('yyyy-MM-dd – HH:mm').format(requestStartDate!),
                        style: TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16),
              
              // Return Date & Time
              Text('Return Date & Time:', style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  DateTime initialDate = requestStartDate?.add(Duration(hours: 1)) ?? DateTime.now();
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
                      setState(() {
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
                  padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
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
                            : DateFormat('yyyy-MM-dd – HH:mm').format(expectedReturnDate!),
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
          onPressed: (isRequesting || requestStartDate == null || expectedReturnDate == null || currentAvailable < requestQuantity) 
              ? null 
              : () => sendRequest(item['_id']),
          child: isRequesting
              ? SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : Text('Send Request'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.grey[800],
        title: Text(
          'Equipment Center',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.refresh,
                color: Colors.blue,
                size: 20,
              ),
            ),
            onPressed: () {
              fetchEquipment();
              fetchMyAllocations();
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
      ),
      body: Column(
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
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                if (equipment.isNotEmpty) ...[
                  SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
                        Text('Loading Equipment...', style: TextStyle(fontSize: 16, color: Colors.grey[600])),
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
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[600]),
                        ),
                        SizedBox(height: 8),
                        Text('Check back later for new equipment'),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: equipment.length,
                    itemBuilder: (context, index) {
                      final item = equipment[index];
                      final totalQuantity = item['quantity'] ?? 0;
                      final currentAllocated = allEquipmentAllocations
                          .where((alloc) => 
                              alloc['equipment']['_id'] == item['_id'] && 
                              alloc['status'] == 'allocated')
                          .fold(0, (sum, alloc) => sum + ((alloc['quantityAllocated'] as num?)?.toInt() ?? 0));
                      final available = totalQuantity - currentAllocated;
                      
                      return Padding(
                        padding: EdgeInsets.only(bottom: 16),
                        child: _buildEquipmentCard(item, available, totalQuantity, currentAllocated, index),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}