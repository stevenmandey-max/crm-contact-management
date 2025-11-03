// Test script to verify WhatsApp Chat service functionality
// Run this in the browser console to test

console.log('Testing WhatsApp Chat Service functionality...');

// Test 1: Create a WhatsApp Chat service entry
const testService = {
  contactId: 'demo-1',
  userId: 'admin',
  date: new Date().toISOString().split('T')[0],
  duration: 0, // This should be allowed for WhatsApp Chat
  serviceType: 'WhatsApp Chat',
  description: 'Test WhatsApp Chat service'
};

try {
  // Access the service storage from the global scope (if available)
  if (typeof window !== 'undefined' && window.serviceStorage) {
    const savedService = window.serviceStorage.addServiceEntry(testService);
    console.log('✅ WhatsApp Chat service saved successfully:', savedService);
    
    // Test 2: Retrieve all services and check if our service is there
    const allServices = window.serviceStorage.getAllServices();
    const whatsappServices = allServices.filter(s => s.serviceType === 'WhatsApp Chat');
    console.log('📊 Total WhatsApp Chat services found:', whatsappServices.length);
    console.log('📋 WhatsApp Chat services:', whatsappServices);
    
    // Test 3: Test export functionality
    if (window.serviceExportService) {
      const reportData = window.serviceExportService.getServiceReportData({
        format: 'excel',
        reportType: 'detailed',
        dateRange: { type: 'weekly' },
        filters: { includeContactInfo: true }
      });
      
      const chatServices = reportData.services.filter(s => s.serviceType === 'WhatsApp Chat');
      console.log('📤 Chat services in export data:', chatServices.length);
      console.log('📤 Export data chat services:', chatServices);
    }
    
  } else {
    console.log('❌ Service storage not available in global scope');
    console.log('💡 Try running this test from the browser console when the app is loaded');
  }
} catch (error) {
  console.error('❌ Error testing WhatsApp Chat service:', error);
}

console.log('Test completed. Check the logs above for results.');