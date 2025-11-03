import React, { useState, useEffect } from 'react';
import type { Contact, ExportOptions } from '../../types';
import { exportService } from '../../services/export';
import { DEFAULT_CONTACT_FIELDS } from '../../utils/constants';
import { formatDateForInput } from '../../utils/helpers';
import './ExportModal.css';

interface ExportModalProps {
  contacts: Contact[];
  isOpen: boolean;
  onClose: () => void;
  onExportComplete?: (filename: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  contacts,
  isOpen,
  onClose,
  onExportComplete
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      type: 'monthly'
    },
    includeFields: [...DEFAULT_CONTACT_FIELDS]
  });

  const [isExporting, setIsExporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [exportStats, setExportStats] = useState<any>(null);

  // Update export stats when options change
  useEffect(() => {
    if (isOpen && contacts.length > 0) {
      try {
        const stats = exportService.getExportStats(contacts, exportOptions);
        setExportStats(stats);
      } catch (error) {
        console.error('Error calculating export stats:', error);
      }
    }
  }, [exportOptions, contacts, isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors([]);
      setIsExporting(false);
    }
  }, [isOpen]);

  const handleFormatChange = (format: 'csv' | 'excel') => {
    setExportOptions(prev => ({ ...prev, format }));
  };

  const handleDateRangeTypeChange = (type: ExportOptions['dateRange']['type']) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: { type }
    }));
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (!value) return;
    
    const date = new Date(value);
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      }
    }));
  };

  const handleFieldToggle = (field: keyof Contact) => {
    setExportOptions(prev => {
      const currentFields = prev.includeFields;
      const newFields = currentFields.includes(field)
        ? currentFields.filter(f => f !== field)
        : [...currentFields, field];
      
      return {
        ...prev,
        includeFields: newFields
      };
    });
  };

  const selectAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: [...DEFAULT_CONTACT_FIELDS]
    }));
  };

  const clearAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: []
    }));
  };

  const handleExport = async () => {
    setErrors([]);
    
    // Validate export options
    const validation = exportService.validateExportOptions(exportOptions);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (contacts.length === 0) {
      setErrors(['No contacts available for export']);
      return;
    }

    setIsExporting(true);

    try {
      const filename = exportService.generateFileName(exportOptions);
      exportService.exportContacts(contacts, exportOptions);
      
      onExportComplete?.(filename);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setErrors([errorMessage]);
    } finally {
      setIsExporting(false);
    }
  };

  const getFieldDisplayName = (field: keyof Contact): string => {
    const fieldNames: Record<keyof Contact, string> = {
      id: 'Contact ID',
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
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Export Contacts</h2>
          <button onClick={onClose} className="close-btn" disabled={isExporting}>
            ✕
          </button>
        </div>

        <div className="export-modal-content">
          {errors.length > 0 && (
            <div className="export-errors">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-options">
              {exportService.getAvailableFormats().map((format) => (
                <label key={format.value} className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={() => handleFormatChange(format.value as 'csv' | 'excel')}
                    disabled={isExporting}
                  />
                  <div className="format-info">
                    <span className="format-label">{format.label}</span>
                    <span className="format-description">{format.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Date Range</h3>
            <div className="date-range-options">
              {exportService.getAvailableDateRanges().map((range) => (
                <label key={range.value} className="date-range-option">
                  <input
                    type="radio"
                    name="dateRange"
                    value={range.value}
                    checked={exportOptions.dateRange.type === range.value}
                    onChange={() => handleDateRangeTypeChange(range.value as any)}
                    disabled={isExporting}
                  />
                  <div className="range-info">
                    <span className="range-label">{range.label}</span>
                    <span className="range-description">{range.description}</span>
                  </div>
                </label>
              ))}
            </div>

            {exportOptions.dateRange.type === 'custom' && (
              <div className="custom-date-inputs">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.startDate ? formatDateForInput(exportOptions.dateRange.startDate) : ''}
                    onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                    max={formatDateForInput(new Date())}
                    disabled={isExporting}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.endDate ? formatDateForInput(exportOptions.dateRange.endDate) : ''}
                    onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                    max={formatDateForInput(new Date())}
                    min={exportOptions.dateRange.startDate ? formatDateForInput(exportOptions.dateRange.startDate) : undefined}
                    disabled={isExporting}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="export-section">
            <h3>Fields to Include</h3>
            <div className="field-selection-header">
              <span>{exportOptions.includeFields.length} of {DEFAULT_CONTACT_FIELDS.length} fields selected</span>
              <div className="field-actions">
                <button
                  onClick={selectAllFields}
                  className="field-action-btn"
                  disabled={isExporting || exportOptions.includeFields.length === DEFAULT_CONTACT_FIELDS.length}
                >
                  Select All
                </button>
                <button
                  onClick={clearAllFields}
                  className="field-action-btn"
                  disabled={isExporting || exportOptions.includeFields.length === 0}
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="field-options">
              {DEFAULT_CONTACT_FIELDS.map((field) => (
                <label key={field} className="field-option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                    disabled={isExporting}
                  />
                  <span className="field-name">{getFieldDisplayName(field)}</span>
                </label>
              ))}
            </div>
          </div>

          {exportStats && (
            <div className="export-stats">
              <h3>Export Preview</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Contacts:</span>
                  <span className="stat-value">{exportStats.totalContacts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Contacts to Export:</span>
                  <span className="stat-value">{exportStats.filteredContacts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Date Range:</span>
                  <span className="stat-value">{exportStats.dateRange}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Fields:</span>
                  <span className="stat-value">{exportStats.fields.length} selected</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="export-modal-footer">
          <button
            onClick={onClose}
            className="cancel-btn"
            disabled={isExporting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            className="export-btn"
            disabled={isExporting || exportOptions.includeFields.length === 0 || (exportStats && exportStats.filteredContacts === 0)}
          >
            {isExporting ? (
              <>
                <span className="export-spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                <span>📥</span>
                Export {exportStats?.filteredContacts || 0} Contacts
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};