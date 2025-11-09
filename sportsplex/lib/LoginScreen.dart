import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'app_config.dart';
import 'dart:convert';

class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Example API endpoints (replace with your actual backend URLs)
  final String loginUrl = '${AppConfig.baseUrl}/api/auth/login';
  final String registerUrl = '${AppConfig.baseUrl}/api/auth/register';

  bool isLoading = false;
  String errorMessage = '';

  Future<void> loginUser() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });
    try {
      final response = await http.post(
        Uri.parse(loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      print('Login response: ${response.statusCode} ${response.body}');
      if (response.statusCode == 200) {
        setState(() {
          errorMessage = '';
        });
        final data = jsonDecode(response.body);
        final role = data['role'];
        final token = data['token'];
        if (role == 'student') {
          Navigator.pushReplacementNamed(
            context,
            '/studentDashboard',
            arguments: {'token': token},
          );
        } else if (role == 'student_head') {
          Navigator.pushReplacementNamed(
            context,
            '/studentHeadDashboard',
            arguments: {'token': token},
          );
        } else if (role == 'admin') {
          Navigator.pushReplacementNamed(
            context,
            '/adminDashboard',
            arguments: {'token': token},
          );
        } else {
          // Default fallback
          Navigator.pushReplacementNamed(
            context,
            '/home',
            arguments: {'token': token},
          );
        }
      } else {
        setState(() {
          errorMessage = 'Login failed: ' + response.body;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error: $e';
      });
      print('Login error: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> registerUser() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });
    try {
      final response = await http.post(
        Uri.parse(registerUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'middleName': middleName,
          'lastName': lastName,
          'email': regEmail,
          'phone': phone,
          'rollNo': rollNo,
          'college': college,
          'department': department,
          'password': regPassword,
          'gender': gender,
        }),
      );
      if (response.statusCode == 200) {
        // Registration successful, handle navigation or show success
        setState(() {
          errorMessage = '';
        });
        // Example: Navigator.pushReplacementNamed(context, '/login');
      } else {
        setState(() {
          errorMessage = 'Registration failed: ' + response.body;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error: $e';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  bool showPassword = false;
  int activeTab = 0; // 0: Login, 1: Register
  final _formKey = GlobalKey<FormState>();

  // Login fields
  String email = '';
  String password = '';

  // Register fields
  String firstName = '';
  String middleName = '';
  String lastName = '';
  String regEmail = '';
  String phone = '';
  String rollNo = '';
  String college = '';
  String department = '';
  String regPassword = '';
  String confirmPassword = '';
  String gender = '';

  final List<String> colleges = [
    'CSPIT',
    'PDPIAS',
    'RPCP',
    'CMPICA',
    'DEPSTAR',
    'MTIN',
  ];
  final Map<String, List<String>> branchesByDept = {
    'CMPICA': ['BCA', 'MCA', 'B.Sc. (IT)', 'Ph.D. (Computer Applications)'],
    'PDPIAS': [
      'B.Sc. (Hons.) Microbiology',
      'B.Sc. (Hons.) Biochemistry',
      'Ph.D. (PDPIAS)',
    ],
    'RPCP': ['B.Pharm', 'M.Pharm', 'Ph.D. (Pharmacy)'],
    'CSPIT': [
      'B.Tech AIML',
      'B.Tech Civil Engineering',
      'B.Tech CSE',
      'B.Tech IT',
      'B.Tech CE',
      'B.Tech EE',
      'B.Tech EC',
      'B.Tech ME',
      'M.Tech',
      'Ph.D. (Engineering)',
    ],
    'DEPSTAR': ['B.Tech CSE', 'B.Tech IT', 'B.Tech CE'],
    'MTIN': [
      'B.Sc. Nursing',
      'Post Basic B.Sc. Nursing',
      'M.Sc. Nursing',
      'Ph.D. (Nursing)',
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFE0E7FF),
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            width: 380,
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 16)],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset('assets/img2.jpg', width: 48, height: 48),
                    SizedBox(width: 12),
                    Text(
                      'SportsPlex',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  'Access your sports management system',
                  style: TextStyle(color: Colors.grey[700]),
                ),
                SizedBox(height: 24),
                Container(
                  decoration: BoxDecoration(
                    color: Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => activeTab = 0),
                          child: Container(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: activeTab == 0
                                  ? Colors.white
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: activeTab == 0
                                  ? [
                                      BoxShadow(
                                        color: Colors.black12,
                                        blurRadius: 4,
                                      ),
                                    ]
                                  : [],
                            ),
                            child: Center(
                              child: Text(
                                'Login',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: activeTab == 0
                                      ? Colors.black
                                      : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => activeTab = 1),
                          child: Container(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: activeTab == 1
                                  ? Colors.white
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: activeTab == 1
                                  ? [
                                      BoxShadow(
                                        color: Colors.black12,
                                        blurRadius: 4,
                                      ),
                                    ]
                                  : [],
                            ),
                            child: Center(
                              child: Text(
                                'Register',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: activeTab == 1
                                      ? Colors.black
                                      : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 24),
                Form(
                  key: _formKey,
                  child: activeTab == 0
                      ? _buildLoginForm()
                      : _buildRegisterForm(),
                ),
                SizedBox(height: 24),
                Divider(),
                SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Image.asset('assets/google.png', width: 20, height: 20),
                  label: Text('Log in with Google'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.blue,
                    elevation: 0,
                    side: BorderSide(color: Colors.blue),
                    minimumSize: Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                TextButton(
                  onPressed: () {},
                  child: Text(
                    'Forgot Password?',
                    style: TextStyle(color: Colors.blue),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return Column(
      children: [
        if (errorMessage.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Text(errorMessage, style: TextStyle(color: Colors.red)),
          ),
        TextFormField(
          decoration: InputDecoration(
            labelText: 'Email',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          keyboardType: TextInputType.emailAddress,
          onChanged: (val) => email = val,
          validator: (val) =>
              val == null || val.isEmpty ? 'Email is required' : null,
        ),
        SizedBox(height: 16),
        TextFormField(
          decoration: InputDecoration(
            labelText: 'Password',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            suffixIcon: IconButton(
              icon: Icon(
                showPassword ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () => setState(() => showPassword = !showPassword),
            ),
          ),
          obscureText: !showPassword,
          onChanged: (val) => password = val,
          validator: (val) =>
              val == null || val.isEmpty ? 'Password is required' : null,
        ),
        SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Checkbox(value: false, onChanged: (_) {}),
                Text('Remember me'),
              ],
            ),
            TextButton(
              onPressed: () {},
              child: Text(
                'Forgot your password?',
                style: TextStyle(color: Colors.blue),
              ),
            ),
          ],
        ),
        SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading
              ? null
              : () {
                  if (_formKey.currentState!.validate()) {
                    loginUser();
                  }
                },
          child: isLoading ? CircularProgressIndicator() : Text('Sign In'),
          style: ElevatedButton.styleFrom(
            minimumSize: Size(double.infinity, 48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRegisterForm() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'First Name',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onChanged: (val) => firstName = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'Middle Name',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onChanged: (val) => middleName = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'Last Name',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onChanged: (val) => lastName = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
          ],
        ),
        SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'College Email ID',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
                onChanged: (val) => regEmail = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  prefixText: '+91 ',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                keyboardType: TextInputType.phone,
                maxLength: 10,
                onChanged: (val) => phone = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
          ],
        ),
        SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'College',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                value: college.isEmpty ? null : college,
                items: colleges
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) => setState(() => college = val ?? ''),
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'Department',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                value: department.isEmpty ? null : department,
                items: (college.isNotEmpty && branchesByDept[college] != null)
                    ? branchesByDept[college]!
                          .map(
                            (d) => DropdownMenuItem(value: d, child: Text(d)),
                          )
                          .toList()
                    : [],
                onChanged: (val) => setState(() => department = val ?? ''),
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
          ],
        ),
        SizedBox(height: 16),
        TextFormField(
          decoration: InputDecoration(
            labelText: 'Roll No',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onChanged: (val) => rollNo = val,
          validator: (val) => val == null || val.isEmpty ? 'Required' : null,
        ),
        SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                obscureText: true,
                onChanged: (val) => regPassword = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                obscureText: true,
                onChanged: (val) => confirmPassword = val,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
            ),
          ],
        ),
        SizedBox(height: 16),
        Row(
          children: [
            Text('Gender:', style: TextStyle(fontWeight: FontWeight.w500)),
            SizedBox(width: 16),
            Expanded(
              child: RadioListTile<String>(
                title: Text('Male'),
                value: 'male',
                groupValue: gender,
                onChanged: (val) => setState(() => gender = val ?? ''),
              ),
            ),
            Expanded(
              child: RadioListTile<String>(
                title: Text('Female'),
                value: 'female',
                groupValue: gender,
                onChanged: (val) => setState(() => gender = val ?? ''),
              ),
            ),
          ],
        ),
        SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading
              ? null
              : () {
                  if (_formKey.currentState!.validate()) {
                    registerUser();
                  }
                },
          child: isLoading
              ? CircularProgressIndicator()
              : Text('Create Account'),
          style: ElevatedButton.styleFrom(
            minimumSize: Size(double.infinity, 48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }
}
