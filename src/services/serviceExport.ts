import type { ServiceEntry, ServiceMetrics, Contact } from '../types';
import { serviceStorage } from './serviceStorage';
import { localStorageService } from './localStorage';
import { formatDate } from '../utils/helpers';
import * as XLSX from 'xlsx';

export interface ServiceExportOptions {
  format: 'csv' | 'excel';
  reportType: 'detailed' | 'summary' | 'analytics';
  dateRange: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    startDate?: Date;
    endDate?: Date;
  };
  filters: {
    userId?: string;
    contactId?: string;
    includeContactInfo?: boolean;
  };
}

export interface ServiceReportData {
  services: ServiceEntry[];
  contacts: Contact[];
  metrics: ServiceMetrics[];
  summary: {
    totalServices: number;
    totalDuration: number;
    totalServiceDays: number;
    activeUsers: number;
    activeContacts: number;
    averageDurationPerService: number;
    averageDurationPerDay: number;
  };
}

class ServiceExportService {
  // Generate filename for service reports
  generateFileName(options: ServiceExportOptions): string {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];
    
    let dateRangeStr = '';
    if (options.dateRange.type === 'custom' && options.dateRange.startDate && options.dateRange.endDate) {
      const startStr = options.dateRange.startDate.toISOString().split('T')[0];
      const endStr = options.dateRange.endDate.toISOString().split('T')[0];
      dateRangeStr = `_${startStr}_to_${endStr}`;
    } else {
      dateRangeStr = `_${options.dateRange.type}`;
    }
    
    // Add user filter to filename if specified
    let userFilterStr = '';
    if (options.filters.userId) {
      // Get user info for filename
      const allUsers = localStorageService.getUsers();
      const user = allUsers.find(u => u.id === options.filters.userId);
      if (user) {
        userFilterStr = `_user_${user.username}`;
      }
    }
    
    const extension = options.format === 'csv' ? 'csv' : 'xlsx';
    return `service_report_${options.reportType}_${timestamp}${dateRangeStr}${userFilterStr}.${extension}`;
  }

  // Filter services by date range
  private filterServicesByDateRange(services: ServiceEntry[], dateRange: ServiceExportOptions['dateRange']): ServiceEntry[] {
    if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      const startStr = dateRange.startDate.toISOString().split('T')[0];
      const endStr = dateRange.endDate.toISOString().split('T')[0];
      
      return services.filter(service => {
        return service.date >= startStr && service.date <= endStr;
      });
    }

    const now = new Date();
    let startDate: Date;

    switch (dateRange.type) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return services;
    }

    const startStr = startDate.toISOString().split('T')[0];
    return services.filter(service => service.date >= startStr);
  }

  // Get service report data
  getServiceReportData(options: ServiceExportOptions): ServiceReportData {
    // Get all services
    let services = serviceStorage.getAllServices();
    
    // Apply date range filter
    services = this.filterServicesByDateRange(services, options.dateRange);
    
    // Apply user filter
    if (options.filters.userId) {
      services = services.filter(service => service.userId === options.filters.userId);
    }
    
    // Apply contact filter
    if (options.filters.contactId) {
      services = services.filter(service => service.contactId === options.filters.contactId);
    }

    // Get related contacts
    const contactIds = new Set(services.map(service => service.contactId));
    const allContacts = localStorageService.getContacts();
    const contacts = allContacts.filter(contact => contactIds.has(contact.id));

    // Calculate metrics
    const metrics = serviceStorage.getAllServiceMetrics().filter(metric => {
      const hasServices = services.some(service => 
        service.contactId === metric.contactId && service.userId === metric.userId
      );
      return hasServices;
    });

    // Calculate summary
    const uniqueDates = new Set(services.map(service => service.date));
    const uniqueUsers = new Set(services.map(service => service.userId));
    const uniqueContacts = new Set(services.map(service => service.contactId));
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);

    const summary = {
      totalServices: services.length,
      totalDuration,
      totalServiceDays: uniqueDates.size,
      activeUsers: uniqueUsers.size,
      activeContacts: uniqueContacts.size,
      averageDurationPerService: services.length > 0 ? Math.round(totalDuration / services.length) : 0,
      averageDurationPerDay: uniqueDates.size > 0 ? Math.round(totalDuration / uniqueDates.size) : 0
    };

    return {
      services,
      contacts,
      metrics,
      summary
    };
  }

  // Format duration for display
  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  // Export detailed service report
  exportDetailedReport(options: ServiceExportOptions): void {
    const data = this.getServiceReportData(options);
    
    // Separate WhatsApp Chat services from other services
    const chatServices = data.services.filter(s => s.serviceType === 'WhatsApp Chat');
    const callServices = data.services.filter(s => s.serviceType !== 'WhatsApp Chat');
    
    // Calculate contact service summaries for detailed report
    const contactServiceSummaries = new Map<string, {
      totalServiceDays: number;
      totalServiceTime: number;
      totalChatCount: number;
      chatDays: number;
    }>();

    // Group services by contact to calculate totals
    data.services.forEach(service => {
      if (!contactServiceSummaries.has(service.contactId)) {
        const contactServices = data.services.filter(s => s.contactId === service.contactId);
        const contactChatServices = contactServices.filter(s => s.serviceType === 'WhatsApp Chat');
        const contactCallServices = contactServices.filter(s => s.serviceType !== 'WhatsApp Chat');
        
        const uniqueDates = new Set(contactCallServices.map(s => s.date));
        const uniqueChatDates = new Set(contactChatServices.map(s => s.date));
        const totalDuration = contactCallServices.reduce((sum, s) => sum + s.duration, 0);
        
        contactServiceSummaries.set(service.contactId, {
          totalServiceDays: uniqueDates.size,
          totalServiceTime: totalDuration,
          totalChatCount: contactChatServices.length,
          chatDays: uniqueChatDates.size
        });
      }
    });
    
    // Prepare detailed data - separate Call Services and Chat Services
    const callServicesData = callServices.map(service => {
      const contact = data.contacts.find(c => c.id === service.contactId);
      const contactSummary = contactServiceSummaries.get(service.contactId);
      
      const row: any = {
        'Service Type': 'Call Service',
        'Service Date': service.date,
        'Contact ID': service.contactId,
        'Contact Name': contact?.nama || 'Unknown',
        'User ID': service.userId,
        'Duration (minutes)': service.duration,
        'Duration (formatted)': this.formatDuration(service.duration),
        'Service Description': service.description || service.serviceType || '',
        'Contact Total Call Days': contactSummary?.totalServiceDays || 0,
        'Contact Total Call Time (minutes)': contactSummary?.totalServiceTime || 0,
        'Contact Total Call Time (formatted)': this.formatDuration(contactSummary?.totalServiceTime || 0),
        'Service Created': formatDate(service.createdAt)
      };

      // Add contact info if requested
      if (options.filters.includeContactInfo && contact) {
        row['Contact Phone'] = contact.nomorTelepon || '';
        row['Contact Address'] = contact.alamat || '';
        row['Contact Status'] = contact.statusKontak || '';
        row['Contact Priority'] = contact.prioritas || '';
        row['Contact Source'] = contact.sumber || '';
      }

      return row;
    });

    // Prepare Chat Services data with frequency tracking
    const chatServicesData = chatServices.map(service => {
      const contact = data.contacts.find(c => c.id === service.contactId);
      const contactSummary = contactServiceSummaries.get(service.contactId);
      
      const row: any = {
        'Service Type': 'WhatsApp Chat',
        'Service Date': service.date,
        'Contact ID': service.contactId,
        'Contact Name': contact?.nama || 'Unknown',
        'User ID': service.userId,
        'Duration (minutes)': 'N/A (Chat)',
        'Duration (formatted)': 'Chat',
        'Service Description': service.description || 'WhatsApp Chat',
        'Contact Total Chat Count': contactSummary?.totalChatCount || 0,
        'Contact Chat Days': contactSummary?.chatDays || 0,
        'Service Created': formatDate(service.createdAt)
      };

      // Add contact info if requested
      if (options.filters.includeContactInfo && contact) {
        row['Contact Phone'] = contact.nomorTelepon || '';
        row['Contact Address'] = contact.alamat || '';
        row['Contact Status'] = contact.statusKontak || '';
        row['Contact Priority'] = contact.prioritas || '';
        row['Contact Source'] = contact.sumber || '';
      }

      return row;
    });

    // Combine data with separators
    const detailedData = [
      // Call Services Section
      ...(callServicesData.length > 0 ? [
        { 'Service Type': '=== CALL SERVICES ===', 'Service Date': '', 'Contact ID': '', 'Contact Name': '', 'User ID': '', 'Duration (minutes)': '', 'Duration (formatted)': '', 'Service Description': '', 'Service Created': '' },
        ...callServicesData
      ] : []),
      
      // Chat Services Section  
      ...(chatServicesData.length > 0 ? [
        { 'Service Type': '=== WHATSAPP CHAT SERVICES ===', 'Service Date': '', 'Contact ID': '', 'Contact Name': '', 'User ID': '', 'Duration (minutes)': '', 'Duration (formatted)': '', 'Service Description': '', 'Service Created': '' },
        ...chatServicesData
      ] : [])
    ];

    // Add summary rows at the end
    const callServicesSummary = {
      'Service Type': '--- CALL SERVICES SUMMARY ---',
      'Service Date': '',
      'Contact ID': '',
      'Contact Name': '',
      'User ID': '',
      'Duration (minutes)': callServices.reduce((sum, s) => sum + s.duration, 0),
      'Duration (formatted)': this.formatDuration(callServices.reduce((sum, s) => sum + s.duration, 0)),
      'Service Description': `${callServices.length} call services`,
      'Service Created': ''
    };

    const chatServicesSummary = {
      'Service Type': '--- CHAT SERVICES SUMMARY ---',
      'Service Date': '',
      'Contact ID': '',
      'Contact Name': '',
      'User ID': '',
      'Duration (minutes)': 'N/A (Chat)',
      'Duration (formatted)': 'Chat',
      'Service Description': `${chatServices.length} chat interactions`,
      'Service Created': ''
    };

    const overallSummary = {
      'Service Type': '--- OVERALL SUMMARY ---',
      'Service Date': '',
      'Contact ID': '',
      'Contact Name': '',
      'User ID': '',
      'Duration (minutes)': `${callServices.reduce((sum, s) => sum + s.duration, 0)} (calls only)`,
      'Duration (formatted)': `${this.formatDuration(callServices.reduce((sum, s) => sum + s.duration, 0))} + ${chatServices.length} chats`,
      'Service Description': `${data.services.length} total services (${callServices.length} calls + ${chatServices.length} chats)`,
      'Service Created': ''
    };

    // Add contact info columns if requested (empty for summary)
    if (options.filters.includeContactInfo) {
      [callServicesSummary, chatServicesSummary, overallSummary].forEach(summary => {
        (summary as any)['Contact Phone'] = '';
        (summary as any)['Contact Address'] = '';
        (summary as any)['Contact Status'] = '';
        (summary as any)['Contact Priority'] = '';
        (summary as any)['Contact Source'] = '';
      });
    }

    detailedData.push(callServicesSummary, chatServicesSummary, overallSummary);

    this.exportData(detailedData, options, 'Detailed Service Report');
  }

  // Export summary report
  exportSummaryReport(options: ServiceExportOptions): void {
    const data = this.getServiceReportData(options);
    
    // Separate chat and call services
    const chatServices = data.services.filter(s => s.serviceType === 'WhatsApp Chat');
    const callServices = data.services.filter(s => s.serviceType !== 'WhatsApp Chat');
    
    // Group by contact
    const contactSummary = new Map<string, {
      contactId: string;
      contactName: string;
      totalCallServices: number;
      totalChatServices: number;
      totalCallDuration: number;
      callServiceDays: number;
      chatServiceDays: number;
      activeUsers: number;
      firstService: string;
      lastService: string;
    }>();

    data.services.forEach(service => {
      const contact = data.contacts.find(c => c.id === service.contactId);
      const key = service.contactId;
      
      if (!contactSummary.has(key)) {
        contactSummary.set(key, {
          contactId: service.contactId,
          contactName: contact?.nama || 'Unknown',
          totalCallServices: 0,
          totalChatServices: 0,
          totalCallDuration: 0,
          callServiceDays: 0,
          chatServiceDays: 0,
          activeUsers: 0,
          firstService: service.date,
          lastService: service.date
        });
      }
      
      const summary = contactSummary.get(key)!;
      
      if (service.serviceType === 'WhatsApp Chat') {
        summary.totalChatServices++;
      } else {
        summary.totalCallServices++;
        summary.totalCallDuration += service.duration;
      }
      
      if (service.date < summary.firstService) {
        summary.firstService = service.date;
      }
      if (service.date > summary.lastService) {
        summary.lastService = service.date;
      }
    });

    // Calculate service days and active users for each contact
    contactSummary.forEach((summary, contactId) => {
      const contactCallServices = callServices.filter(s => s.contactId === contactId);
      const contactChatServices = chatServices.filter(s => s.contactId === contactId);
      const allContactServices = data.services.filter(s => s.contactId === contactId);
      
      const uniqueCallDates = new Set(contactCallServices.map(s => s.date));
      const uniqueChatDates = new Set(contactChatServices.map(s => s.date));
      const uniqueUsers = new Set(allContactServices.map(s => s.userId));
      
      summary.callServiceDays = uniqueCallDates.size;
      summary.chatServiceDays = uniqueChatDates.size;
      summary.activeUsers = uniqueUsers.size;
    });

    const summaryData = Array.from(contactSummary.values()).map(summary => ({
      'Contact ID': summary.contactId,
      'Contact Name': summary.contactName,
      'Call Services': summary.totalCallServices,
      'Chat Services': summary.totalChatServices,
      'Total Services': summary.totalCallServices + summary.totalChatServices,
      'Call Service Days': summary.callServiceDays,
      'Chat Service Days': summary.chatServiceDays,
      'Call Duration (minutes)': summary.totalCallDuration,
      'Call Duration (formatted)': this.formatDuration(summary.totalCallDuration),
      'Chat Frequency': `${summary.totalChatServices} interactions`,
      'Active Users': summary.activeUsers,
      'Average Call Duration': summary.totalCallServices > 0 ? Math.round(summary.totalCallDuration / summary.totalCallServices) : 0,
      'Average Call Duration per Day': summary.callServiceDays > 0 ? Math.round(summary.totalCallDuration / summary.callServiceDays) : 0,
      'Average Chats per Day': summary.chatServiceDays > 0 ? Math.round(summary.totalChatServices / summary.chatServiceDays * 100) / 100 : 0,
      'First Service': summary.firstService,
      'Last Service': summary.lastService
    }));

    // Calculate totals from individual contact summaries for consistency
    const totalCallServices = summaryData.reduce((sum, contact) => sum + contact['Call Services'], 0);
    const totalChatServices = summaryData.reduce((sum, contact) => sum + contact['Chat Services'], 0);
    const totalCallDuration = summaryData.reduce((sum, contact) => sum + contact['Call Duration (minutes)'], 0);
    const totalCallServiceDays = summaryData.reduce((sum, contact) => sum + contact['Call Service Days'], 0);
    const totalChatServiceDays = summaryData.reduce((sum, contact) => sum + contact['Chat Service Days'], 0);

    // Add overall summary at the end
    const filterInfo = options.filters.userId ? 
      ` (Filtered by User: ${localStorageService.getUsers().find(u => u.id === options.filters.userId)?.username || 'Unknown'})` : 
      '';
    
    const overallSummaryRow = {
      'Contact ID': `--- OVERALL SUMMARY${filterInfo} ---`,
      'Contact Name': '',
      'Call Services': totalCallServices,
      'Chat Services': totalChatServices,
      'Total Services': totalCallServices + totalChatServices,
      'Call Service Days': totalCallServiceDays,
      'Chat Service Days': totalChatServiceDays,
      'Call Duration (minutes)': totalCallDuration,
      'Call Duration (formatted)': this.formatDuration(totalCallDuration),
      'Chat Frequency': `${totalChatServices} total interactions`,
      'Active Users': data.summary.activeUsers,
      'Average Call Duration': totalCallServices > 0 ? Math.round(totalCallDuration / totalCallServices) : 0,
      'Average Call Duration per Day': totalCallServiceDays > 0 ? Math.round(totalCallDuration / totalCallServiceDays) : 0,
      'Average Chats per Day': totalChatServiceDays > 0 ? Math.round(totalChatServices / totalChatServiceDays * 100) / 100 : 0,
      'First Service': '',
      'Last Service': ''
    };

    summaryData.push(overallSummaryRow);

    this.exportData(summaryData, options, 'Service Summary Report');
  }

  // Export analytics report
  exportAnalyticsReport(options: ServiceExportOptions): void {
    const data = this.getServiceReportData(options);
    
    // Overall summary
    const filterInfo = options.filters.userId ? 
      localStorageService.getUsers().find(u => u.id === options.filters.userId)?.username || 'Unknown User' : 
      'All Users';
    
    const overallSummary = [{
      'Report Type': 'Overall Summary',
      'Filter Applied': `User: ${filterInfo}`,
      'Total Services': data.summary.totalServices,
      'Total Service Days': data.summary.totalServiceDays,
      'Total Duration (minutes)': data.summary.totalDuration,
      'Total Duration (formatted)': this.formatDuration(data.summary.totalDuration),
      'Active Users': data.summary.activeUsers,
      'Active Contacts': data.summary.activeContacts,
      'Average Duration per Service': data.summary.averageDurationPerService,
      'Average Duration per Day': data.summary.averageDurationPerDay,
      'Report Generated': formatDate(new Date())
    }];

    // User performance
    const userPerformance = new Map<string, {
      userId: string;
      totalServices: number;
      totalDuration: number;
      serviceDays: number;
      contactsServed: number;
    }>();

    data.services.forEach(service => {
      if (!userPerformance.has(service.userId)) {
        userPerformance.set(service.userId, {
          userId: service.userId,
          totalServices: 0,
          totalDuration: 0,
          serviceDays: 0,
          contactsServed: 0
        });
      }
      
      const perf = userPerformance.get(service.userId)!;
      perf.totalServices++;
      perf.totalDuration += service.duration;
    });

    // Calculate service days and contacts served for each user
    userPerformance.forEach((perf, userId) => {
      const userServices = data.services.filter(s => s.userId === userId);
      const uniqueDates = new Set(userServices.map(s => s.date));
      const uniqueContacts = new Set(userServices.map(s => s.contactId));
      
      perf.serviceDays = uniqueDates.size;
      perf.contactsServed = uniqueContacts.size;
    });

    const userPerformanceData = Array.from(userPerformance.values()).map(perf => ({
      'User ID': perf.userId,
      'Total Services': perf.totalServices,
      'Service Days': perf.serviceDays,
      'Total Duration (minutes)': perf.totalDuration,
      'Total Duration (formatted)': this.formatDuration(perf.totalDuration),
      'Contacts Served': perf.contactsServed,
      'Average Duration per Service': Math.round(perf.totalDuration / perf.totalServices),
      'Average Duration per Day': Math.round(perf.totalDuration / perf.serviceDays),
      'Services per Day': Math.round(perf.totalServices / perf.serviceDays * 100) / 100
    }));

    // Combine all analytics data
    const analyticsData = [
      ...overallSummary,
      { 'Report Type': '--- USER PERFORMANCE ---' },
      ...userPerformanceData
    ];

    this.exportData(analyticsData, options, 'Service Analytics Report');
  }

  // Generic export data function
  private exportData(data: any[], options: ServiceExportOptions, sheetName: string): void {
    const filename = this.generateFileName(options);

    if (options.format === 'csv') {
      this.exportToCSV(data, filename);
    } else {
      this.exportToExcel(data, filename, sheetName);
    }
  }

  // Export to CSV
  private exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export to Excel
  private exportToExcel(data: any[], filename: string, sheetName: string): void {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-size columns
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      )
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  }

  // Quick export functions
  exportWeeklyReport(): void {
    this.exportSummaryReport({
      format: 'excel',
      reportType: 'summary',
      dateRange: { type: 'weekly' },
      filters: { includeContactInfo: true }
    });
  }

  exportMonthlyReport(): void {
    this.exportAnalyticsReport({
      format: 'excel',
      reportType: 'analytics',
      dateRange: { type: 'monthly' },
      filters: { includeContactInfo: true }
    });
  }

  exportCustomReport(startDate: Date, endDate: Date, userId?: string): void {
    this.exportDetailedReport({
      format: 'excel',
      reportType: 'detailed',
      dateRange: { 
        type: 'custom',
        startDate,
        endDate
      },
      filters: { 
        userId,
        includeContactInfo: true 
      }
    });
  }
}

// Export singleton instance
export const serviceExportService = new ServiceExportService();