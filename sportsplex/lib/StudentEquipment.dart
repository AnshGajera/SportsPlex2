import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StudentEquipment extends StatefulWidget {
  final String userId;
  const StudentEquipment({Key? key, required this.userId}) : super(key: key);

  @override
  State<StudentEquipment> createState() => _StudentEquipmentState();
}

class _StudentEquipmentState extends State<StudentEquipment> {
  List<dynamic> equipment = [];
  bool isLoading = true;

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

  @override
  void initState() {
    super.initState();
    fetchEquipment();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('My Equipment')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
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
                      trailing: Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () {
                        // Navigate to equipment details
                      },
                    ),
                  );
                },
              ),
      ),
    );
  }
}
