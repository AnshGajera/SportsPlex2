import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class StudentEquipment extends StatefulWidget {
  final String userId;
  const StudentEquipment({Key? key, required this.userId}) : super(key: key);

  @override
  State<StudentEquipment> createState() => _StudentEquipmentState();
}

class _StudentEquipmentState extends State<StudentEquipment> {
  List<dynamic> equipment = [];
  List<dynamic> myAllocations = [];
  bool isLoading = true;
  bool isAllocLoading = true;
  int selectedIndex = -1;
  DateTime? expectedReturnDate;
  int requestQuantity = 1;
  String requestPurpose = '';
  bool isRequesting = false;

  Future<void> fetchEquipment() async {
    final response = await http.get(
      Uri.parse('http://192.168.43.154:5000/api/equipment'),
    );
    if (response.statusCode == 200) {
      setState(() {
        equipment = jsonDecode(response.body);
        isLoading = false;
      });
    } else {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchMyAllocations() async {
    final response = await http.get(
      Uri.parse('http://192.168.43.154:5000/api/equipment/allocations/my?userId=${widget.userId}'),
    );
    if (response.statusCode == 200) {
      setState(() {
        myAllocations = jsonDecode(response.body);
        isAllocLoading = false;
      });
    } else {
      setState(() {
        isAllocLoading = false;
      });
    }
  }

  Future<void> sendRequest(String equipmentId) async {
    if (expectedReturnDate == null) return;
    setState(() { isRequesting = true; });
    final response = await http.post(
      Uri.parse('http://192.168.43.154:5000/api/equipment/request'),
      headers: { 'Content-Type': 'application/json' },
      body: jsonEncode({
        'equipmentId': equipmentId,
        'expectedReturnDate': expectedReturnDate!.toIso8601String(),
        'quantityRequested': requestQuantity,
        'purpose': requestPurpose,
        'userId': widget.userId,
      }),
    );
    setState(() { isRequesting = false; });
    if (response.statusCode == 201) {
      Navigator.of(context).pop();
      fetchEquipment();
      fetchMyAllocations();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Request sent successfully!')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to send request')));
    }
  }

  @override
  void initState() {
    super.initState();
    fetchEquipment();
    fetchMyAllocations();
  }

  Widget buildRequestModal(int index) {
    final item = equipment[index];
    return AlertDialog(
      title: Text('Request Equipment'),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Equipment: ${item['name']}'),
            SizedBox(height: 8),
            Text('Available: ${item['availableQuantity'] ?? item['quantity'] ?? 0}'),
            SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(labelText: 'Quantity'),
              keyboardType: TextInputType.number,
              onChanged: (val) => setState(() { requestQuantity = int.tryParse(val) ?? 1; }),
            ),
            SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(labelText: 'Purpose (optional)'),
              onChanged: (val) => setState(() { requestPurpose = val; }),
            ),
            SizedBox(height: 8),
            Text('Return By (Date & Time):'),
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
                      expectedReturnDate = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
                    });
                  }
                }
              },
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  expectedReturnDate == null
                    ? 'Select Date & Time'
                    : DateFormat('yyyy-MM-dd – kk:mm').format(expectedReturnDate!),
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: isRequesting ? null : () => sendRequest(item['_id']),
          child: isRequesting ? CircularProgressIndicator() : Text('Send Request'),
        ),
      ],
    );
  }

  Widget buildAllocationCard(dynamic allocation) {
    final now = DateTime.now();
    final expectedReturn = DateTime.tryParse(allocation['expectedReturnDate'] ?? '') ?? now;
    final diff = expectedReturn.difference(now);
    final isOverdue = diff.inSeconds <= 0;
    String timeLeft;
    if (isOverdue) {
      timeLeft = 'Expired (OVERDUE)';
    } else {
      timeLeft = '${diff.inHours}h ${diff.inMinutes % 60}m';
    }
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(Icons.sports_baseball, color: isOverdue ? Colors.red : Colors.green),
        title: Text(allocation['equipment']['name'] ?? 'Equipment'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Quantity: ${allocation['quantityAllocated']}'),
            Text('Allocated on: ${DateFormat('yyyy-MM-dd – kk:mm').format(DateTime.parse(allocation['allocationDate']))}'),
            Text('Return by: ${DateFormat('yyyy-MM-dd – kk:mm').format(expectedReturn)}'),
            Text('Time left: $timeLeft', style: TextStyle(color: isOverdue ? Colors.red : Colors.black)),
          ],
        ),
        trailing: isOverdue ? Icon(Icons.warning, color: Colors.red) : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('My Equipment')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Expanded(
              child: isLoading
                  ? Center(child: CircularProgressIndicator())
                  : equipment.isEmpty
                  ? Center(child: Text('No equipment found'))
                  : ListView.builder(
                      itemCount: equipment.length,
                      itemBuilder: (context, index) {
                        final item = equipment[index];
                        return Card(
                          margin: EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            leading: Icon(Icons.sports_baseball, color: Colors.green),
                            title: Text(item['name'] ?? 'Equipment'),
                            subtitle: Text(item['description'] ?? ''),
                            trailing: ElevatedButton(
                              child: Text('Request'),
                              onPressed: () {
                                setState(() {
                                  selectedIndex = index;
                                  expectedReturnDate = null;
                                  requestQuantity = 1;
                                  requestPurpose = '';
                                });
                                showDialog(
                                  context: context,
                                  builder: (_) => buildRequestModal(index),
                                );
                              },
                            ),
                          ),
                        );
                      },
                    ),
            ),
            Divider(height: 32),
            Text('My Allocations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Expanded(
              child: isAllocLoading
                  ? Center(child: CircularProgressIndicator())
                  : myAllocations.isEmpty
                  ? Center(child: Text('No current allocations'))
                  : ListView.builder(
                      itemCount: myAllocations.length,
                      itemBuilder: (context, index) => buildAllocationCard(myAllocations[index]),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
