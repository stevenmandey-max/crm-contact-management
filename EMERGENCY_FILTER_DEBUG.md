# Emergency Filter Debug - Find The Issue! 🚨

## 🔍 **COMPREHENSIVE DEBUG SCRIPT:**

Jalankan script ini di browser console untuk menemukan masalah:

```javascript
const emergencyFilterDebug = () => {
  console.log('🚨 EMERGENCY FILTER DEBUG 🚨');
  console.log('================================');
  
  // 1. Check localStorage data
  console.log('\\n1. LOCALSTORAGE DATA:');
  const currentUserStr = localStorage.getItem('crm_currentUser');
  const contactsStr = localStorage.getItem('crm_contacts');
  
  console.log('CurrentUser raw:', currentUserStr);
  console.log('Contacts raw length:', contactsStr?.length || 0);
  
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const allContacts = contactsStr ? JSON.parse(contactsStr) : [];
  
  console.log('Parsed currentUser:', currentUser);
  console.log('Parsed contacts count:', allContacts.length);
  
  // 2. Check each contact in detail
  console.log('\\n2. CONTACT DETAILS:');
  allContacts.forEach((contact, index) => {
    console.log(`Contact ${index + 1}:`);
    console.log(`  Name: "${contact.nama}"`);
    console.log(`  CreatedBy: "${contact.createdBy}" (type: ${typeof contact.createdBy})`);
    console.log(`  ID: "${contact.id}"`);
  });
  
  // 3. Manual permission check with detailed logging
  console.log('\\n3. MANUAL PERMISSION CHECK:');
  console.log(`Current user role: "${currentUser?.role}"`);
  console.log(`Current user username: "${currentUser?.username}" (type: ${typeof currentUser?.username})`);
  
  const manualFiltered = [];
  allContacts.forEach((contact, index) => {
    console.log(`\\nChecking Contact ${index + 1} (${contact.nama}):`);
    console.log(`  contact.createdBy: "${contact.createdBy}"`);
    console.log(`  currentUser.username: "${currentUser?.username}"`);
    console.log(`  Strict equality: ${currentUser?.username === contact.createdBy}`);
    console.log(`  Loose equality: ${currentUser?.username == contact.createdBy}`);
    
    let canAccess = false;
    if (currentUser?.role === 'Admin') {
      canAccess = true;
      console.log(`  ✅ Admin can access`);
    } else if (currentUser?.role === 'Editor') {
      canAccess = currentUser.username === contact.createdBy;
      console.log(`  ${canAccess ? '✅' : '❌'} Editor ${canAccess ? 'can' : 'cannot'} access`);
    }
    
    if (canAccess) {
      manualFiltered.push(contact);
    }
  });
  
  console.log('\\n4. MANUAL FILTER RESULT:');
  console.log(`Expected contacts: ${manualFiltered.length}`);
  manualFiltered.forEach((contact, index) => {
    console.log(`  ${index + 1}. ${contact.nama}`);
  });
  
  // 4. Check React component state
  console.log('\\n5. REACT COMPONENT CHECK:');
  
  // Try to find filter text
  const filterElements = document.querySelectorAll('*');
  let filterText = '';
  for (let el of filterElements) {
    if (el.textContent && el.textContent.includes('Showing') && el.textContent.includes('contacts')) {
      filterText = el.textContent;
      console.log('Found filter text:', filterText);
      break;
    }
  }
  
  // Check table rows
  const tableRows = document.querySelectorAll('table tbody tr');
  console.log(`DOM table rows: ${tableRows.length}`);
  
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const name = cells[0]?.textContent?.trim() || 'Unknown';
    console.log(`  Row ${index + 1}: ${name}`);
  });
  
  // 5. Force data refresh and check again
  console.log('\\n6. FORCE REFRESH TEST:');
  
  // Clear any cached state
  sessionStorage.clear();
  
  // Trigger storage events
  ['crm_contacts', 'crm_currentUser', 'crm_users'].forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: value,
        storageArea: localStorage
      }));
    }
  });
  
  console.log('Storage events triggered');
  
  // 6. Check for any active filters
  console.log('\\n7. ACTIVE FILTERS CHECK:');
  const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
  const selects = document.querySelectorAll('select');
  
  console.log('Search inputs:');
  searchInputs.forEach((input, index) => {
    console.log(`  Input ${index + 1}: "${input.value}" (placeholder: "${input.placeholder}")`);
  });
  
  console.log('Select elements:');
  selects.forEach((select, index) => {
    console.log(`  Select ${index + 1}: "${select.value}"`);
  });
  
  // 7. Summary
  console.log('\\n8. SUMMARY:');
  console.log(`Expected: ${manualFiltered.length} contacts`);
  console.log(`DOM shows: ${tableRows.length} rows`);
  console.log(`Filter text: "${filterText}"`);
  
  const isWorking = manualFiltered.length === tableRows.length;
  console.log(`Status: ${isWorking ? '✅ WORKING' : '❌ BROKEN'}`);
  
  if (!isWorking) {
    console.log('\\n🔧 SUGGESTED FIXES:');
    console.log('1. Hard refresh: Ctrl+Shift+R');
    console.log('2. Clear all data: localStorage.clear(); location.reload();');
    console.log('3. Check browser console for React errors');
    console.log('4. Try incognito mode');
  }
  
  return {
    expected: manualFiltered.length,
    actual: tableRows.length,
    expectedNames: manualFiltered.map(c => c.nama),
    isWorking
  };
};

// Run the debug
emergencyFilterDebug();
```

## 🔧 **QUICK FIXES TO TRY:**

### **Fix 1: Complete Reset**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Fix 2: Force Correct User**
```javascript
localStorage.setItem('crm_currentUser', JSON.stringify({
  id: '2',
  username: 'editor',
  role: 'Editor',
  name: 'Editor User'
}));
location.reload();
```

### **Fix 3: Check for React Errors**
Buka browser console dan lihat apakah ada error React yang muncul.

**Jalankan emergency debug script untuk melihat apa yang sebenarnya terjadi! 🔍**