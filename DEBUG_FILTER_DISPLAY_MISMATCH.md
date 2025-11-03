# Debug Filter vs Display Mismatch 🔍

## 🚨 **MASALAH:**
- **Filter Panel**: Showing 4 of 4 contacts ✅
- **Contact Management**: Showing: 1 contacts ❌
- **Display**: Hanya 1 kontak terlihat (Michael Chen)

**Root Cause:** Ada disconnect antara FilterContext dan ContactList display.

---

## 🔍 **DEBUG SCRIPT:**

Jalankan di browser console untuk debug:

```javascript
const debugFilterDisplayMismatch = () => {
  console.log('=== FILTER vs DISPLAY DEBUG ===');
  
  // 1. Check FilterContext state
  const filterPanel = document.querySelector('[class*="filter"]');
  console.log('1. Filter Panel found:', !!filterPanel);
  
  // 2. Check localStorage data
  const currentUserStr = localStorage.getItem('crm_currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const contactsStr = localStorage.getItem('crm_contacts');
  const allContacts = contactsStr ? JSON.parse(contactsStr) : [];
  
  console.log('2. Current User:', currentUser);
  console.log('3. All Contacts:', allContacts.length);
  
  // 3. Check permission filtering
  const visibleContacts = allContacts.filter(contact => {
    if (currentUser?.role === 'Admin') return true;
    if (currentUser?.role === 'Editor') {
      return currentUser.username === contact.createdBy;
    }
    return false;
  });
  
  console.log('4. Permission Filtered Contacts:', visibleContacts.length);
  visibleContacts.forEach((contact, index) => {
    console.log(`   ${index + 1}. ${contact.nama} (createdBy: ${contact.createdBy})`);
  });
  
  // 4. Check DOM elements
  const contactCards = document.querySelectorAll('[class*="contact-card"], tr[class*="contact"]');
  console.log('5. Contact Cards in DOM:', contactCards.length);
  
  // 5. Check table rows specifically
  const tableRows = document.querySelectorAll('table tbody tr');
  console.log('6. Table Rows:', tableRows.length);
  
  // 6. Check if there are hidden elements
  const hiddenElements = document.querySelectorAll('[style*="display: none"], [hidden]');
  console.log('7. Hidden Elements:', hiddenElements.length);
  
  // 7. Check React state (if accessible)
  try {
    const contactListElement = document.querySelector('[class*="contact-list"]');
    if (contactListElement) {
      console.log('8. Contact List Element found');
    }
  } catch (e) {
    console.log('8. Could not access React state');
  }
  
  return {
    currentUser,
    allContacts: allContacts.length,
    visibleContacts: visibleContacts.length,
    domElements: contactCards.length,
    tableRows: tableRows.length
  };
};

debugFilterDisplayMismatch();
```

---

## 🔧 **POSSIBLE CAUSES:**

### **Cause 1: ContactList tidak menggunakan filteredContacts**
- FilterContext menghitung 4 kontak
- ContactList menggunakan data berbeda

### **Cause 2: CSS/Display Issue**
- Kontak ada di DOM tapi hidden
- Table rendering issue

### **Cause 3: State Sync Issue**
- FilterContext dan ContactList out of sync
- Re-render tidak terjadi

### **Cause 4: Pagination Issue**
- Kontak ada tapi tidak di halaman pertama
- Limit display issue

---

## 🔄 **QUICK FIXES:**

### **Fix 1: Force Re-render ContactList**
```javascript
const forceContactListRerender = () => {
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'crm_contacts',
    newValue: localStorage.getItem('crm_contacts'),
    storageArea: localStorage
  }));
  
  // Force page refresh
  setTimeout(() => location.reload(), 500);
};

forceContactListRerender();
```

### **Fix 2: Check for Hidden Elements**
```javascript
const showHiddenContacts = () => {
  const hiddenElements = document.querySelectorAll('[style*="display: none"]');
  hiddenElements.forEach(el => {
    if (el.textContent.includes('contact') || el.querySelector('[class*="contact"]')) {
      el.style.display = '';
      console.log('Showed hidden element:', el);
    }
  });
};

showHiddenContacts();
```

### **Fix 3: Reset Filter State**
```javascript
const resetFilterState = () => {
  // Clear any filter localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('filter') || key.includes('search')) {
      localStorage.removeItem(key);
    }
  });
  
  location.reload();
};

resetFilterState();
```

---

## 📋 **TESTING STEPS:**

1. **Run debug script** - lihat output di console
2. **Check numbers**:
   - Permission Filtered: should be 3-4
   - DOM Elements: should match filtered
   - Table Rows: should match filtered
3. **Apply fixes** berdasarkan hasil debug
4. **Verify display** matches filter count

**Jalankan debug script dulu untuk melihat root cause yang sebenarnya! 🔍**