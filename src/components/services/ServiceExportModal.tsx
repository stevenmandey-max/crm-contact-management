import React, { useState, useEffect } from 'react';
import { serviceExportService } from '../../services/serviceExport';
import type { ServiceExportOptions } from '../../services/serviceExport';
import type { User } from '../../types';
import { localStorageService } from '../../services/localStorage';
import { useAuth } from '../../hooks/useAuth';
import { canExportOwnDataOnly } from '../../utils/permissions';
import { getAccessibleUsers, shouldShowAllUsersOption, getDefaultUserFilter } from '../../utils/dataFilters';
import './ServiceExportModal.css';

interface ServiceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceExportModal: React.FC<ServiceExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser } = useAuth();
  const [exportOptions, setExportOptions] = useState<ServiceExportOptions>({
    format: 'excel',
    reportType: 'summary',
    dateRange: { type: 'monthly' },
    filters: { includeContactInfo: true }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Load users when modal opens and set default filters based on permissions
  useEffect(() => {
    if (isOpen && currentUser) {
      const allUsers = localStorageService.getUsers();
      const accessibleUsers = getAccessibleUsers(allUsers, currentUser);
      setUsers(accessibleUsers);
      
      // Set default user filter based on permissions
      const defaultUserFilter = getDefaultUserFilter(currentUser);
      setExportOptions(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          userId: defaultUserFilter !== 'all' ? defaultUserFilter : undefined
        }
      }));
    }
  }, [isOpen, currentUser]);

  const handleExport = async () => {
    // Validate custom date range
    if (exportOptions.dateRange.type === 'custom') {
      if (!exportOptions.dateRange.startDate || !exportOptions.dateRange.endDate) {
        alert('Please select both start and end dates for custom range.');
        return;
      }
      
      if (exportOptions.dateRange.startDate > exportOptions.dateRange.endDate) {
        alert('Start date must be before end date.');
        return;
      }
    }

    setIsExporting(true);
    try {
      switch (exportOptions.reportType) {
        case 'detailed':
          serviceExportService.exportDetailedReport(exportOptions);
          break;
        case 'summary':
          serviceExportService.exportSummaryReport(exportOptions);
          break;
        case 'analytics':
          serviceExportService.exportAnalyticsReport(exportOptions);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = (type: 'weekly' | 'monthly') => {
    setIsExporting(true);
    try {
      if (type === 'weekly') {
        serviceExportService.exportWeeklyReport();
      } else {
        serviceExportService.exportMonthlyReport();
      }
      onClose();
    } catch (error) {
      console.error('Quick export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="service-export-modal-overlay" onClick={onClose}>
      <div className="service-export-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Export Service Reports</h2>
            {exportOptions.filters.userId && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                Filtered by: {users.find(u => u.id === exportOptions.filters.userId)?.username || 'Unknown User'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-content">
          {/* Quick Export Options */}
          <div className="quick-export-section">
            <h3>Quick Export</h3>
            <div className="quick-export-buttons">
              <button 
                onClick={() => handleQuickExport('weekly')}
                disabled={isExporting}
                className="quick-export-btn"
              >
                📊 Weekly Summary
              </button>
              <button 
                onClick={() => handleQuickExport('monthly')}
                disabled={isExporting}
                className="quick-export-btn"
              >
                📈 Monthly Analytics
              </button>
            </div>
          </div>

          <div className="divider">OR</div>

          {/* Custom Export Options */}
          <div className="custom-export-section">
            <h3>Custom Export</h3>
            
            {/* Report Type */}
            <div className="form-group">
              <label>Report Type:</label>
              <select 
                value={exportOptions.reportType}
                onChange={e => setExportOptions(prev => ({
                  ...prev, 
                  reportType: e.target.value as any
                }))}
              >
                <option value="detailed">Detailed Report</option>
                <option value="summary">Summary Report</option>
                <option value="analytics">Analytics Report</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="form-group">
              <label>Date Range:</label>
              <select 
                value={exportOptions.dateRange.type}
                onChange={e => setExportOptions(prev => ({
                  ...prev, 
                  dateRange: { type: e.target.value as any }
                }))}
              >
                <option value="daily">Last 24 Hours</option>
                <option value="weekly">Last Week</option>
                <option value="monthly">Last Month</option>
                <option value="quarterly">Last Quarter</option>
                <option value="yearly">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range Inputs */}
            {exportOptions.dateRange.type === 'custom' && (
              <div className="custom-date-range">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.startDate ? 
                      exportOptions.dateRange.startDate.toISOString().split('T')[0] : 
                      ''
                    }
                    onChange={e => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setExportOptions(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          startDate: date
                        }
                      }));
                    }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.endDate ? 
                      exportOptions.dateRange.endDate.toISOString().split('T')[0] : 
                      ''
                    }
                    onChange={e => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setExportOptions(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          endDate: date
                        }
                      }));
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    min={exportOptions.dateRange.startDate ? 
                      exportOptions.dateRange.startDate.toISOString().split('T')[0] : 
                      undefined
                    }
                  />
                </div>
              </div>
            )}

            {/* Format */}
            <div className="form-group">
              <label>Format:</label>
              <select 
                value={exportOptions.format}
                onChange={e => setExportOptions(prev => ({
                  ...prev, 
                  format: e.target.value as any
                }))}
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
            </div>

            {/* User Filter - Only show if user has permission to see all users */}
            <div className="form-group">
              <label>Filter by User:</label>
              <select 
                value={exportOptions.filters.userId || ''}
                onChange={e => setExportOptions(prev => ({
                  ...prev, 
                  filters: {
                    ...prev.filters,
                    userId: e.target.value || undefined
                  }
                }))}
                disabled={canExportOwnDataOnly(currentUser)}
              >
                {shouldShowAllUsersOption(currentUser) && (
                  <option value="">All Users</option>
                )}
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
              {canExportOwnDataOnly(currentUser) && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                  You can only export your own data
                </p>
              )}
            </div>

            {/* Include Contact Info */}
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox"
                  checked={exportOptions.filters.includeContactInfo || false}
                  onChange={e => setExportOptions(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      includeContactInfo: e.target.checked
                    }
                  }))}
                />
                Include Contact Information
              </label>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} disabled={isExporting} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleExport} disabled={isExporting} className="btn-primary">
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>
    </div>
  );
};