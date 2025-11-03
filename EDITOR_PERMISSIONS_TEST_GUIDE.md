# Editor Permissions Test Guide 🧪

## 🎯 **Quick Testing Instructions**

Untuk memverifikasi bahwa Editor hanya bisa mengakses data mereka sendiri.

---

## 🔑 **Test Accounts:**

### **Admin Account:**
- **Username**: `admin`
- **Password**: `admin123`
- **Capabilities**: Full access to all data

### **Editor Account:**
- **Username**: `editor`  
- **Password**: `admin123`
- **Capabilities**: Only own data access

---

## 🧪 **TEST SCENARIOS:**

### **Test 1: Contact Access Restriction**

#### **Step 1: Setup Data as Admin**
1. **Login as Admin** (`admin` / `admin123`)
2. **Add 2 contacts**:
   - Contact A: "Admin Contact 1"
   - Contact B: "Admin Contact 2"
3. **Logout**

#### **Step 2: Test Editor Access**
1. **Login as Editor** (`editor` / `admin123`)
2. **Go to Contacts tab**
3. **✅ Expected**: Should see empty contact list or only Editor's contacts
4. **❌ Should NOT see**: Admin's contacts (Contact A & B)

#### **Step 3: Create Editor Data**
1. **Still logged as Editor**
2. **Add 1 contact**: "Editor Contact 1"
3. **✅ Expected**: Should see only "Editor Contact 1" in list

#### **Step 4: Verify Admin Can See All**
1. **Logout and login as Admin**
2. **Go to Contacts tab**
3. **✅ Expected**: Should see all 3 contacts (2 Admin + 1 Editor)

---

### **Test 2: Service Session Restriction**

#### **Step 1: Create Service Sessions**
1. **Login as Admin**
2. **Start service timer** for any contact → Wait 10 seconds → Stop
3. **Go to Service Tracking** → "Service Sessions" tab
4. **✅ Expected**: Should see the session in report

#### **Step 2: Test Editor View**
1. **Logout and login as Editor**
2. **Go to Service Tracking** → "Service Sessions" tab
3. **✅ Expected**: Should see empty report or only Editor's sessions
4. **Check User filter**: Should be disabled, showing only "editor (You)"

#### **Step 3: Create Editor Session**
1. **Still logged as Editor**
2. **Start service timer** for Editor's contact → Wait 10 seconds → Stop
3. **Check Service Sessions report**
4. **✅ Expected**: Should see only Editor's session

---

### **Test 3: Export Data Restriction**

#### **Step 1: Test Editor Export**
1. **Login as Editor**
2. **Go to Service Tracking** → Click "Export Reports"
3. **Check User filter dropdown**:
   - **✅ Expected**: Should be disabled
   - **✅ Expected**: Should show "You can only export your own data"
   - **✅ Expected**: Should only show "editor" in dropdown
4. **Export data**
5. **✅ Expected**: Export should only contain Editor's data

#### **Step 2: Compare with Admin Export**
1. **Logout and login as Admin**
2. **Go to Service Tracking** → Click "Export Reports"
3. **Check User filter dropdown**:
   - **✅ Expected**: Should be enabled
   - **✅ Expected**: Should show "All Users" option
   - **✅ Expected**: Should show both "admin" and "editor" options
4. **Export with "All Users"**
5. **✅ Expected**: Export should contain data from both users

---

### **Test 4: Dashboard Data Filtering**

#### **Step 1: Compare Dashboard Stats**
1. **Login as Admin** → Check Dashboard statistics
2. **Note down numbers**: Total contacts, service sessions, etc.
3. **Logout and login as Editor** → Check Dashboard
4. **✅ Expected**: Editor's numbers should be lower (only their data)
5. **✅ Expected**: Editor should not see Admin's statistics

---

### **Test 5: Delete Permission Restriction**

#### **Step 1: Test Delete Buttons**
1. **Login as Editor**
2. **Go to Contacts tab**
3. **Check action buttons** for Editor's contact:
   - **✅ Expected**: Should see View, Edit, Delete buttons
4. **If Admin contacts visible** (shouldn't happen):
   - **✅ Expected**: Should NOT see Delete button for Admin's contacts

#### **Step 2: Test Delete Action**
1. **Try to delete Editor's own contact**
2. **✅ Expected**: Should work successfully
3. **If somehow able to access Admin contact**:
   - **✅ Expected**: Should show "You can only delete contacts that you created"

---

### **Test 6: Navigation Restrictions**

#### **Step 1: Check Menu Access**
1. **Login as Editor**
2. **Check navigation menu**
3. **✅ Expected**: Should NOT see "User Management" option
4. **✅ Expected**: Should see Dashboard, Contacts, Add Contact, Service Tracking

#### **Step 2: Compare with Admin**
1. **Login as Admin**
2. **Check navigation menu**
3. **✅ Expected**: Should see ALL menu items including "User Management"

---

## 🎯 **EXPECTED BEHAVIOR SUMMARY:**

### **✅ Editor Should Be Able To:**
- View only contacts they created
- Edit only contacts they created  
- Delete only contacts they created
- See only their own service sessions
- Export only their own data
- Access Dashboard with filtered statistics
- Use Service Tracking with own data only

### **❌ Editor Should NOT Be Able To:**
- View Admin's contacts
- View other Editor's contacts
- Edit/Delete other users' contacts
- See other users' service sessions
- Export other users' data
- Access User Management page
- See "All Users" options in filters

### **✅ Admin Should Always:**
- See all data from all users
- Have full access to all features
- Be able to manage all users
- See comprehensive statistics
- Have all export options available

---

## 🚨 **TROUBLESHOOTING:**

### **If Editor Can See Admin Data:**
1. Check if contact `createdBy` field is set correctly
2. Verify `filterContactsByPermission` is being called
3. Check browser localStorage for data corruption

### **If Export Contains Wrong Data:**
1. Verify `canExportOwnDataOnly` returns true for Editor
2. Check if user filter is properly set to Editor's username
3. Verify export service respects user filtering

### **If Permissions Not Working:**
1. Clear browser localStorage and refresh
2. Check browser console for JavaScript errors
3. Verify user role is set correctly in localStorage

---

## 📊 **QUICK VERIFICATION COMMANDS:**

### **Check User Data in Browser Console:**
```javascript
// Check current user
JSON.parse(localStorage.getItem('crm_current_user'))

// Check all users  
JSON.parse(localStorage.getItem('crm_users'))

// Check contacts with createdBy
JSON.parse(localStorage.getItem('crm_contacts')).map(c => ({
  name: c.nama, 
  createdBy: c.createdBy
}))
```

---

**🎉 Use this guide to thoroughly test that Editor permissions are working correctly! 🔒✨**