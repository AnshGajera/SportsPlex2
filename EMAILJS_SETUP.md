# EmailJS Setup Guide for Student Head Promotion/Demotion Emails

## Prerequisites
1. EmailJS account (free tier available)
2. Email service provider (Gmail, Outlook, etc.)

## Step-by-Step Setup

### 1. Create EmailJS Account
- Go to [EmailJS.com](https://www.emailjs.com/)
- Sign up for a free account
- Verify your email address

### 2. Add Email Service
- In EmailJS dashboard, go to "Email Services"
- Click "Add New Service"
- Choose your email provider (Gmail, Outlook, etc.)
- Follow the authentication process
- Note down your **Service ID**: `service_570v2gp`

### 3. Create TWO Separate Email Templates

#### 3.1 Promotion Email Template
- Go to "Email Templates" in dashboard
- Click "Create New Template"
- Name it: "Student Head Promotion"
- **Template ID**: `template_7r0fshc` (existing)

**Template Configuration:**
```
To Email: {{to_email}}
From Name: {{from_name}}
Reply To: {{reply_to}}
Subject: 🎉 Congratulations! You are now a Student Head

Template Content:
{{message}}
```

#### 3.2 Demotion Email Template
- Create another new template
- Name it: "Student Head Demotion"
- **You need to create this and get the Template ID**

**Template Configuration:**
```
To Email: {{to_email}}
From Name: {{from_name}}
Reply To: {{reply_to}}
Subject: 📢 Role Update: You are now a Student

Template Content:
{{message}}
```

### 4. Get Public Key
- Go to "Account" → "General"
- Copy your **Public Key**: `whFc9F3Zj5tk5G6vd`

### 5. Update Configuration
Edit `/src/services/emailService.js` and replace the demotion template ID:

```javascript
const EMAIL_SERVICE_ID = 'service_570v2gp';
const PROMOTION_TEMPLATE_ID = 'template_7r0fshc'; // Existing promotion template
const DEMOTION_TEMPLATE_ID = 'YOUR_NEW_DEMOTION_TEMPLATE_ID'; // Replace with new template ID
const EMAIL_PUBLIC_KEY = 'whFc9F3Zj5tk5G6vd';
```

### 6. Current Template Configuration

#### Promotion Template (`template_7r0fshc`):
- **Subject**: 🎉 Congratulations! You are now a Student Head
- **Content**: Congratulatory message with new responsibilities
- **Tone**: Celebratory and encouraging

#### Demotion Template (New - you need to create):
- **Subject**: 📢 Role Update: You are now a Student  
- **Content**: Professional notification of role change
- **Tone**: Respectful and appreciative of past service

### 7. Test the Setup
1. Start your React application
2. Go to Admin User Management
3. Try promoting a student to Student Head (uses promotion template)
4. Try demoting a Student Head to Student (uses demotion template)
5. Check if both emails are sent with correct content

## Template Variables Used (Both Templates)
- `{{to_email}}`: Recipient's email address
- `{{to_name}}`: Student's full name
- `{{from_name}}`: "SportsPlex Administration"
- `{{reply_to}}`: Reply-to email address  
- `{{message}}`: Template-specific message content

## Benefits of Separate Templates
1. **Different Subjects**: Promotion vs. role update notifications
2. **Different Styling**: Can customize colors, layouts per template
3. **Different Content**: Tailored messaging for each scenario
4. **Better Analytics**: Track promotion vs. demotion email metrics
5. **Professional Communication**: Appropriate tone for each situation

## Next Steps
1. Create the demotion template in EmailJS dashboard
2. Copy the new template ID
3. Update `DEMOTION_TEMPLATE_ID` in `/src/services/emailService.js`
4. Test both email functions

## Troubleshooting
1. **422 Error**: Check template "To Email" field is `{{to_email}}`
2. **Wrong content**: Verify you're using the correct template ID
3. **Template not found**: Ensure both templates are created and active
4. **Rate limits**: Free tier has 200 emails/month limit

## Current Status
- ✅ Promotion template: `template_7r0fshc` (working)
- ❌ Demotion template: `template_demotion` (needs to be created)

## Template Creation Steps
1. Go to EmailJS Dashboard → Email Templates
2. Click "Create New Template"
3. Set up the demotion template with the configuration above
4. Copy the generated template ID
5. Replace `template_demotion` in the code with your actual template ID
