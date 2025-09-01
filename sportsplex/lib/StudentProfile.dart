import 'package:flutter/material.dart';

class StudentProfile extends StatefulWidget {
  @override
  _StudentProfileState createState() => _StudentProfileState();
}

class _StudentProfileState extends State<StudentProfile> {
  bool isEditing = false;
  bool loading = false;
  bool uploadingCertificate = false;
  String notification = '';
  String notificationType = 'success';

  // Profile fields
  Map<String, String> formData = {
    'firstName': '',
    'middleName': '',
    'lastName': '',
    'email': '',
    'phoneNumber': '',
    'college': '',
    'department': '',
    'rollNo': '',
  };

  // Certificates
  List<Map<String, dynamic>> certificates = [];
  Map<String, dynamic> certificateData = {
    'title': '',
    'description': '',
    'file': null,
  };

  // Dummy user data for initial display
  Map<String, dynamic> displayData = {
    'firstName': 'John',
    'middleName': '',
    'lastName': 'Doe',
    'email': 'john.doe@example.com',
    'phoneNumber': '1234567890',
    'college': 'ABC College',
    'department': 'Computer Science',
    'rollNo': '12345',
    'role': 'student',
  };

  @override
  void initState() {
    super.initState();
    // TODO: Fetch user profile and certificates from backend
    formData = Map<String, String>.from(displayData);
  }

  void showNotification(String message, {String type = 'success'}) {
    setState(() {
      notification = message;
      notificationType = type;
    });
    Future.delayed(Duration(seconds: 5), () {
      setState(() {
        notification = '';
      });
    });
  }

  void handleProfileUpdate() async {
    setState(() {
      loading = true;
    });
    // TODO: Send update to backend
    await Future.delayed(Duration(seconds: 1));
    setState(() {
      displayData = Map<String, dynamic>.from(formData);
      isEditing = false;
      loading = false;
    });
    showNotification('Profile updated successfully!', type: 'success');
  }

  void handleCertificateUpload() async {
    if (certificateData['title'] == '' || certificateData['file'] == null) {
      showNotification(
        'Please provide a title and select a file',
        type: 'error',
      );
      return;
    }
    setState(() {
      uploadingCertificate = true;
    });
    // TODO: Upload certificate to backend
    await Future.delayed(Duration(seconds: 1));
    setState(() {
      certificates.add({
        'title': certificateData['title'],
        'description': certificateData['description'],
        'file': certificateData['file'],
      });
      certificateData = {'title': '', 'description': '', 'file': null};
      uploadingCertificate = false;
    });
    showNotification('Certificate uploaded successfully!', type: 'success');
  }

  void handleDeleteCertificate(int index) {
    setState(() {
      certificates.removeAt(index);
    });
    showNotification('Certificate deleted successfully!', type: 'success');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
        actions: [
          CircleAvatar(
            backgroundColor: Colors.blue[100],
            child: Text(
              '${displayData['firstName'][0]}${displayData['lastName'][0]}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.blue[700],
              ),
            ),
          ),
          SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (notification.isNotEmpty)
                Container(
                  width: double.infinity,
                  margin: EdgeInsets.only(bottom: 16),
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: notificationType == 'success'
                        ? Colors.green[400]
                        : Colors.red[400],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        notificationType == 'success'
                            ? Icons.check_circle
                            : Icons.cancel,
                        color: Colors.white,
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          notification,
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 32,
                            backgroundColor: Colors.blue[100],
                            child: Text(
                              '${displayData['firstName'][0]}${displayData['lastName'][0]}',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue[700],
                              ),
                            ),
                          ),
                          SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${displayData['firstName']} ${displayData['lastName']}',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                displayData['email'],
                                style: TextStyle(color: Colors.grey[700]),
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 4),
                                padding: EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.blue[100],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  displayData['role'].toString().toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue[800],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Spacer(),
                          ElevatedButton.icon(
                            icon: Icon(isEditing ? Icons.close : Icons.edit),
                            label: Text(isEditing ? 'Cancel' : 'Edit Profile'),
                            onPressed: () {
                              setState(() {
                                isEditing = !isEditing;
                              });
                            },
                          ),
                        ],
                      ),
                      SizedBox(height: 16),
                      isEditing ? _buildEditForm() : _buildProfileInfo(),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 24),
              Text(
                'Certificates',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              _buildCertificateUploadForm(),
              SizedBox(height: 16),
              ...certificates.asMap().entries.map((entry) {
                int idx = entry.key;
                var cert = entry.value;
                return Card(
                  margin: EdgeInsets.symmetric(vertical: 6),
                  child: ListTile(
                    leading: Icon(Icons.workspace_premium, color: Colors.blue),
                    title: Text(cert['title'] ?? ''),
                    subtitle: Text(cert['description'] ?? ''),
                    trailing: IconButton(
                      icon: Icon(Icons.delete, color: Colors.red),
                      onPressed: () => handleDeleteCertificate(idx),
                    ),
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _infoRow('First Name', displayData['firstName']),
        _infoRow('Middle Name', displayData['middleName']),
        _infoRow('Last Name', displayData['lastName']),
        _infoRow('Email', displayData['email']),
        _infoRow('Phone Number', displayData['phoneNumber']),
        _infoRow('Roll Number', displayData['rollNo']),
        _infoRow('College', displayData['college']),
        _infoRow('Department', displayData['department']),
      ],
    );
  }

  Widget _buildEditForm() {
    return Column(
      children: [
        _editField('First Name', 'firstName'),
        _editField('Middle Name', 'middleName'),
        _editField('Last Name', 'lastName'),
        _editField('Email', 'email'),
        _editField('Phone Number', 'phoneNumber'),
        _editField('Roll Number', 'rollNo'),
        _editField('College', 'college'),
        _editField('Department', 'department'),
        SizedBox(height: 12),
        loading
            ? CircularProgressIndicator()
            : ElevatedButton.icon(
                icon: Icon(Icons.save),
                label: Text('Save Changes'),
                onPressed: handleProfileUpdate,
              ),
      ],
    );
  }

  Widget _editField(String label, String key) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: TextFormField(
        initialValue: formData[key],
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
        onChanged: (val) {
          setState(() {
            formData[key] = val;
          });
        },
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text('$label: ', style: TextStyle(fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(value, style: TextStyle(color: Colors.grey[800])),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificateUploadForm() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            TextFormField(
              decoration: InputDecoration(labelText: 'Title'),
              onChanged: (val) {
                setState(() {
                  certificateData['title'] = val;
                });
              },
              initialValue: certificateData['title'],
            ),
            SizedBox(height: 8),
            TextFormField(
              decoration: InputDecoration(labelText: 'Description'),
              onChanged: (val) {
                setState(() {
                  certificateData['description'] = val;
                });
              },
              initialValue: certificateData['description'],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    certificateData['file'] != null
                        ? 'File selected'
                        : 'No file selected',
                  ),
                ),
                TextButton.icon(
                  icon: Icon(Icons.upload_file),
                  label: Text('Select File'),
                  onPressed: () {
                    // TODO: Implement file picker
                  },
                ),
              ],
            ),
            SizedBox(height: 8),
            uploadingCertificate
                ? CircularProgressIndicator()
                : ElevatedButton.icon(
                    icon: Icon(Icons.upload_file),
                    label: Text('Upload Certificate'),
                    onPressed: handleCertificateUpload,
                  ),
          ],
        ),
      ),
    );
  }
}
