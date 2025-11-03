# Deep Debug Editor Filter Issue 🔍

## 🚨 **MASALAH PERSISTEN:**
- Filter menunjukkan "1 of 4 contacts" 
- Seharusnya Editor melihat 3 kontak (Michael Chen, David Kim, Robert Wilson)
- Hanya Michael Chen yang muncul

## 🔍 **DEEP DEBUG SCRIPT:**

Jalankan di browser console untuk debug mendalam:

```javascript
const deepDebugEditorFilter = () => {
  console.log('=== DEEP DEBUG EDITOR FILTER ===');
  
  // 1. Check current user
  const currentUserStr = localStorage.getItem('crm_currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  console.log('1. Current User:', currentUser);
  
  // 2. Check all contacts with detailed info
  const contactsStr = localStorage.getItem('crm_contacts');
  const allContacts = contactsStr ? JSON.parse(contactsStr) : [];
  console.log('2. All Contacts:', allContacts.length);
  
  allContacts.forEach((contact, index) => {
    console.log(`Contact ${index + 1}:`);
    console.log(`  - Name: ${contact.nama}`);
    console.log(`  - CreatedBy: '${contact.createdBy}'`);
    console.log(`  - ID: ${contact.id}`);
  });
  
  // 3. Manual permission filtering step by step
  console.log('\\n3. PERMISSION FILTERING:');
  const expectedContacts = [];
  
  allContacts.forEach((contact, index) => {
    const canAccess = currentUser?.role === 'Admin' || 
                     (currentUser?.role === 'Editor' && currentUser.username === contact.createdBy);
    
    console.log(`Contact ${index + 1} (${contact.nama}):`);
    console.log(`  - CreatedBy: '${contact.createdBy}'`);
    console.log(`  - Current User: '${currentUser?.username}'`);
    console.log(`  - Can Access: ${canAccess}`);
    
    if (canAccess) {
      expectedContacts.push(contact);
    }
  });
  
  console.log('\\n4. EXPECTED RESULT:');
  console.log(`Expected Contacts: ${expectedContacts.length}`);
  expectedContacts.forEach((contact, index) => {
    console.log(`  ${index + 1}. ${contact.nama} (createdBy: '${contact.createdBy}')`);
  });
  
  // 4. Check FilterContext state (if accessible)
  console.log('\\n5. REACT STATE DEBUG:');
  try {
    // Try to access React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('React DevTools available');
    }
    
    // Check DOM for React fiber
    const filterElement = document.querySelector('[class*="filter"]');
    const contactElement = document.querySelector('[class*="contact-list"]');
    
    console.log('Filter Element:', !!filterElement);
    console.log('Contact Element:', !!contactElement);
    
  } catch (e) {
    console.log('Could not access React state');
  }
  
  // 5. Check actual DOM
  console.log('\\n6. DOM ANALYSIS:');
  const tableRows = document.querySelectorAll('table tbody tr');
  console.log(`DOM Table Rows: ${tableRows.length}`);
  
  tableRows.forEach((row, index) => {
    const nameCell = row.querySelector('td:first-child');
    const name = nameCell ? nameCell.textContent.trim() : 'Unknown';
    console.log(`  Row ${index + 1}: ${name}`);
  });
  
  // 6. Check for any filters applied
  console.log('\\n7. ACTIVE FILTERS CHECK:');
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  const statusSelect = document.querySelector('select');
  
  console.log('Search Input Value:', searchInput?.value || 'None');
  console.log('Status Select Value:', statusSelect?.value || 'None');
  
  // 7. Force refresh test
  console.log('\\n8. FORCE REFRESH TEST:');
  console.log('Triggering storage events...');
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'crm_contacts',
    newValue: localStorage.getItem('crm_contacts'),
    storageArea: localStorage
  }));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'crm_currentUser',
    newValue: localStorage.getItem('crm_currentUser'),
    storageArea: localStorage
  }));
  
  console.log('Storage events triggered. Check if display updates...');
  
  return {
    currentUser,
    allContacts: allContacts.length,
    expectedContacts: expectedContacts.length,
    domRows: tableRows.length,
    expectedNames: expectedContacts.map(c => c.nama)
  };
};

deepDebugEditorFilter();
```

## 🔧 **POSSIBLE FIXES:**

### **Fix 1: Reset All Data**
```javascript
const resetAllData = () => {
  localStorage.removeItem('crm_contacts');
  localStorage.removeItem('crm_currentUser');
  localStorage.removeItem('crm_users');
  location.reload();
};
resetAllData();
```

### **Fix 2: Force Correct Data**
```javascript
const forceCorrectData = () => {
  // Set correct user
  localStorage.setItem('crm_currentUser', JSON.stringify({
    username: 'editor',
    role: 'Editor'
  }));
  
  // Force reload contacts
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'crm_currentUser',
    newValue: localStorage.getItem('crm_currentUser'),
    storageArea: localStorage
  }));
  
  setTimeout(() => location.reload(), 1000);
};
forceCorrectData();
```

### **Fix 3: Check FilterContext Logic**
```javascript
const checkFilterLogic = () => {
  // Simulate FilterContext logic
  const contacts = JSON.parse(localStorage.getItem('crm_contacts') || '[]');
  const user = JSON.parse(localStorage.getItem('crm_currentUser') || '{}');
  
  console.log('Simulating FilterContext:');
  console.log('Input contacts:', contacts.length);
  console.log('Input user:', user);
  
  // Apply permission filtering
  const filtered = contacts.filter(contact => {
    if (user.role === 'Admin') return true;
    if (user.role === 'Editor') return user.username === contact.createdBy;
    return false;
  });
  
  console.log('Filtered result:', filtered.length);
  console.log('Filtered contacts:', filtered.map(c => c.nama));
  
  return filtered;
};
checkFilterLogic();
```

**Jalankan deep debug script untuk melihat apa yang sebenarnya terjadi! 🔍**