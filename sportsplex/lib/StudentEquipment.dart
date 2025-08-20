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
      Uri.parse('http://10.63.134.100:5000/api/equipment'),
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
      appBar: AppBar(title: Text('Equipment')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: equipment.length,
              itemBuilder: (context, index) {
                final item = equipment[index];
                return Card(
                  margin: EdgeInsets.all(8),
                  child: ListTile(
                    title: Text(item['name'] ?? 'Equipment'),
                    subtitle: Text('Type: ${item['type'] ?? 'N/A'}'),
                  ),
                );
              },
            ),
    );
  }
}
