import type { Contact, ExportOptions } from '../types';
import { formatDate } from '../utils/helpers';
import * as XLSX from 'xlsx';

class ExportService {
  // Generate filename based on export options
  generateFileName(options: ExportOptions): string {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let dateRangeStr = '';
    if (options.dateRange.type === 'custom' && options.dateRange.startDate && options.dateRange.endDate) {
      const startStr = options.dateRange.startDate.toISOString().split('T')[0];
      const endStr = options.dateRange.endDate.toISOString().split('T')[0];
      dateRangeStr = `_${startStr}_to_${endStr}`;
    } else if (options.dateRange.type !== 'custom') {
      dateRangeStr = `_${options.dateRange.type}`;
    }
    
    const extension = options.format === 'csv' ? 'csv' : 'xlsx';
    return `crm_contacts_export_${timestamp}${dateRangeStr}.${extension}`;
  }

  // Filter contacts based on date range
  private filterContactsByDateRange(contacts: Contact[], dateRange: ExportOptions['dateRange']): Contact[] {
    if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      return contacts.filter(contact => {
        const contactDate = new Date(contact.createdAt);
        return contactDate >= dateRange.startDate! && contactDate <= dateRange.endDate!;
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
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return contacts; // Return all contacts if no specific range
    }

    return contacts.filter(contact => {
      const contactDate = new Date(contact.createdAt);
      return contactDate >= startDate && contactDate <= now;
    });
  }

  // Prepare data for export
  private prepareExportData(contacts: Contact[], includeFields: (keyof Contact)[]): any[] {
    return contacts.map(contact => {
      const exportRow: any = {};
      
      includeFields.forEach(field => {
        switch (field) {
          case 'createdAt':
          case 'updatedAt':
            exportRow[this.getFieldDisplayName(field)] = formatDate(new Date(contact[field]));
            break;
          default:
            exportRow[this.getFieldDisplayName(field)] = contact[field];
        }
      });
      
      return exportRow;
    });
  }

  // Get display name for fields
  private getFieldDisplayName(field: keyof Contact): string {
    const fieldNames: Record<keyof Contact, string> = {
      id: 'ID',
      createdAt: 'Created Date',
      nama: 'Name',
      nomorTelepon: 'Phone Number',
      jenisKelamin: 'Gender',
      alamat: 'Address',
      provinsi: 'Province',
      agama: 'Religion',
      alasanMenghubungi: 'Reason for Contact',
      sumber: 'Source',
      prioritas: 'Priority',
      statusKontak: 'Contact Status',
      updatedAt: 'Last Updated',
      createdBy: 'Created By',
      history: 'History'
    };
    
    return fieldNames[field] || field;
  }

  // Convert data to CSV format
  private convertToCSV(data: any[]): string {
    if (data.length === 0) {
      return 'No data available for export';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Convert data to proper Excel format using xlsx library
  private convertToExcel(data: any[]): ArrayBuffer {
    if (data.length === 0) {
      // Create empty workbook with message
      const ws = XLSX.utils.aoa_to_sheet([['No data available for export']]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
      return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    }

    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    const colWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max width 50 chars
    });
    ws['!cols'] = colWidths;
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    
    // Add metadata
    wb.Props = {
      Title: 'CRM Contacts Export',
      Subject: 'Contact Management Data',
      Author: 'CRM System',
      CreatedDate: new Date()
    };
    
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  }

  // Download file (overloaded for string and ArrayBuffer)
  private downloadFile(content: string | ArrayBuffer, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // Main export function
  exportContacts(contacts: Contact[], options: ExportOptions): void {
    try {
      // Filter contacts by date range
      const filteredContacts = this.filterContactsByDateRange(contacts, options.dateRange);
      
      if (filteredContacts.length === 0) {
        throw new Error('No contacts found for the selected date range');
      }

      // Prepare data for export
      const exportData = this.prepareExportData(filteredContacts, options.includeFields);
      
      // Generate filename
      const filename = this.generateFileName(options);
      
      // Convert to appropriate format and download
      if (options.format === 'csv') {
        const csvContent = this.convertToCSV(exportData);
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      } else if (options.format === 'excel') {
        const excelContent = this.convertToExcel(exportData);
        this.downloadFile(excelContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }
      
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Get export statistics
  getExportStats(contacts: Contact[], options: ExportOptions): {
    totalContacts: number;
    filteredContacts: number;
    dateRange: string;
    fields: string[];
  } {
    const filteredContacts = this.filterContactsByDateRange(contacts, options.dateRange);
    
    let dateRangeStr = 'All time';
    if (options.dateRange.type === 'custom' && options.dateRange.startDate && options.dateRange.endDate) {
      dateRangeStr = `${options.dateRange.startDate.toLocaleDateString()} - ${options.dateRange.endDate.toLocaleDateString()}`;
    } else if (options.dateRange.type !== 'custom') {
      const ranges = {
        daily: 'Last 24 hours',
        weekly: 'Last 7 days',
        monthly: 'Last 30 days',
        yearly: 'Last 365 days'
      };
      dateRangeStr = ranges[options.dateRange.type] || 'All time';
    }
    
    return {
      totalContacts: contacts.length,
      filteredContacts: filteredContacts.length,
      dateRange: dateRangeStr,
      fields: options.includeFields.map(field => this.getFieldDisplayName(field))
    };
  }

  // Validate export options
  validateExportOptions(options: ExportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!options.format || !['csv', 'excel'].includes(options.format)) {
      errors.push('Invalid export format. Must be CSV or Excel.');
    }
    
    if (!options.includeFields || options.includeFields.length === 0) {
      errors.push('At least one field must be selected for export.');
    }
    
    if (options.dateRange.type === 'custom') {
      if (!options.dateRange.startDate || !options.dateRange.endDate) {
        errors.push('Start date and end date are required for custom date range.');
      } else if (options.dateRange.startDate > options.dateRange.endDate) {
        errors.push('Start date must be before end date.');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get available export formats
  getAvailableFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'csv',
        label: 'CSV',
        description: 'Comma-separated values file, compatible with Excel, Google Sheets, and other applications'
      },
      {
        value: 'excel',
        label: 'Excel (.xlsx)',
        description: 'Native Microsoft Excel format with proper formatting, auto-sized columns, and metadata'
      }
    ];
  }

  // Get available date range options
  getAvailableDateRanges(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'daily',
        label: 'Last 24 Hours',
        description: 'Contacts created in the last 24 hours'
      },
      {
        value: 'weekly',
        label: 'Last 7 Days',
        description: 'Contacts created in the last week'
      },
      {
        value: 'monthly',
        label: 'Last 30 Days',
        description: 'Contacts created in the last month'
      },
      {
        value: 'yearly',
        label: 'Last 365 Days',
        description: 'Contacts created in the last year'
      },
      {
        value: 'custom',
        label: 'Custom Range',
        description: 'Select specific start and end dates'
      }
    ];
  }
}

export const exportService = new ExportService();