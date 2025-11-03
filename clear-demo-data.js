/**
 * 🧹 CLEAR DEMO DATA SCRIPT
 * 
 * Jalankan script ini di browser console untuk menghapus data demo
 * yang mengganggu testing.
 */

// Function to clear all demo data
const clearDemoData = () => {
  console.log('🧹 Starting demo data cleanup...');
  
  // Clear contact data
  localStorage.removeItem('crm_contacts');
  console.log('✅ Contacts cleared');
  
  // Clear service data
  localStorage.removeItem('crm_services');
  localStorage.removeItem('crm_service_sessions');
  console.log('✅ Services cleared');
  
  // Keep users and settings for login functionality
  // localStorage.removeItem('crm_users'); // Keep this
  // localStorage.removeItem('crm_current_user'); // Keep this
  // localStorage.removeItem('crm_settings'); // Keep this
  
  console.log('🎉 Demo data cleanup completed!');
  console.log('🔄 Please refresh the page to see changes');
  
  return {
    message: 'Demo data cleared successfully',
    action: 'Please refresh the page'
  };
};

// Function to clear ALL data (including users - use with caution)
const clearAllData = () => {
  console.log('⚠️  WARNING: Clearing ALL data including users!');
  
  const keys = [
    'crm_contacts',
    'crm_services', 
    'crm_service_sessions',
    'crm_users',
    'crm_current_user',
    'crm_settings',
    'user_credentials'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ ${key} cleared`);
  });
  
  console.log('🎉 ALL data cleared!');
  console.log('🔄 Please refresh the page and login again');
  
  return {
    message: 'All data cleared successfully',
    action: 'Please refresh and login again'
  };
};

// Function to check current data
const checkData = () => {
  const data = {
    contacts: JSON.parse(localStorage.getItem('crm_contacts') || '[]').length,
    services: JSON.parse(localStorage.getItem('crm_services') || '[]').length,
    users: JSON.parse(localStorage.getItem('crm_users') || '[]').length,
    currentUser: localStorage.getItem('crm_current_user') ? 'Logged in' : 'Not logged in'
  };
  
  console.log('📊 Current data status:', data);
  return data;
};

// Export functions to global scope for easy access
window.clearDemoData = clearDemoData;
window.clearAllData = clearAllData;
window.checkData = checkData;

console.log(`
🧹 DEMO DATA CLEANER LOADED!

Available commands:
- clearDemoData()    // Clear contacts & services (keep users)
- clearAllData()     // Clear everything (including users)
- checkData()        // Check current data status

Example usage:
> clearDemoData()
> checkData()
`);

// Auto-run check on load
checkData();