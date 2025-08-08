# 🚀 SportsPlex Route Configuration

## 📋 Complete Route Setup for Admin and User Pages

### 🔐 **Public Routes** (No Authentication Required)
- `/` - Login page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset
- `/verifyEmail` - Email verification
- `/registergoogle` - Google registration

---

### 👑 **Admin Routes** (Admin Role Required)
All admin routes are prefixed with `/admin/`

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | `AdminDashboard` | Admin main dashboard |
| `/admin/equipment` | `AdminEquipment` | Manage equipment inventory |
| `/admin/clubs` | `AdminClubs` | Manage sports clubs |
| `/admin/matches` | `AdminMatches` | Schedule and manage matches |
| `/admin/announcements` | `AdminAnnouncements` | Create and manage announcements |
| `/admin/analytics` | `AdminAnalytics` | View system analytics |
| `/admin/user-management` | `AdminUserManagement` | Manage all users |
| `/admin/profile` | `AdminProfile` | Admin profile management |

**Additional Admin Routes:**
- `/admin/student-head-requests` - Student head requests
- `/admin/requests` - Approve various requests

---

### 👤 **User Routes** (User Role Required)
All user routes are prefixed with `/user/`

| Route | Component | Description |
|-------|-----------|-------------|
| `/user/dashboard` | `UserDashboard` | User main dashboard |
| `/user/equipment` | `UserEquipment` | Browse and request equipment |
| `/user/clubs` | `UserClubs` | Browse and join clubs |
| `/user/matches` | `UserMatches` | View match schedules |
| `/user/announcements` | `UserAnnouncements` | View announcements |
| `/user/profile` | `UserProfile` | User profile management |

---

### 🔄 **Legacy Routes** (Backward Compatibility)
These routes redirect to appropriate role-based pages:

| Legacy Route | Admin Redirect | User Redirect |
|--------------|----------------|---------------|
| `/Home` | `/admin/dashboard` | `/user/dashboard` |
| `/equipment` | `/admin/equipment` | `/user/equipment` |
| `/clubs` | `/admin/clubs` | `/user/clubs` |
| `/matches` | `/admin/matches` | `/user/matches` |
| `/announcements` | `/admin/announcements` | `/user/announcements` |
| `/admin` | `/admin/dashboard` | N/A |
| `/profile` | `/admin/profile` | `/user/profile` |

---

### 🔧 **Special Routes**
- `/schedule-match` - Schedule match component
- `/student-head` - Student head functionality

---

## 🎯 **Navigation Logic**

### **Navbar Behavior:**
The navbar automatically shows role-appropriate links:

**For Admins:**
- Home → `/admin/dashboard`
- Equipment → `/admin/equipment`
- Clubs → `/admin/clubs`
- Matches → `/admin/matches`
- Announcements → `/admin/announcements`
- Users → `/admin/user-management`
- Analytics → `/admin/analytics`
- Profile → `/admin/profile`

**For Users:**
- Home → `/user/dashboard`
- Equipment → `/user/equipment`
- Clubs → `/user/clubs`
- Matches → `/user/matches`
- Announcements → `/user/announcements`
- Profile → `/user/profile`

---

## 🛠️ **Implementation Notes**

1. **Role Detection:** The system uses `currentUser.role` to determine admin vs user
2. **Protected Routes:** All dashboard routes require authentication
3. **Automatic Redirection:** Login system should redirect to appropriate dashboard based on role
4. **Backward Compatibility:** Old routes still work but redirect to new structure

---

## 🎮 **How to Use**

### **For Login Logic:**
```javascript
// After successful login, redirect based on role
if (user.role === 'admin') {
  navigate('/admin/dashboard');
} else {
  navigate('/user/dashboard');
}
```

### **For Navigation:**
```javascript
// Use role-based routing in components
const dashboardPath = currentUser?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
```

---

## ✅ **Setup Complete!**

All routes are now configured and ready for role-based navigation. The system will automatically route users to their appropriate pages based on their role (admin/user). 🚀
