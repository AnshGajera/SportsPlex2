import 'package:flutter/material.dart';

class RegisterScreen extends StatefulWidget {
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
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
                  'Create your account',
                  style: TextStyle(color: Colors.grey[700]),
                ),
                SizedBox(height: 24),
                Form(key: _formKey, child: _buildRegisterForm()),
                SizedBox(height: 24),
                Divider(),
                SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Image.asset('assets/google.png', width: 20, height: 20),
                  label: Text('Sign up with Google'),
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
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  child: Text(
                    'Already have an account? Login',
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
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              // Handle registration
            }
          },
          child: Text('Create Account'),
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
