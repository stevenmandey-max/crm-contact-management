import React, { useState, useRef, useEffect } from 'react';
import type { ContactStatus } from '../../types';
import { useFilter } from '../../contexts/FilterContext';
import { CONTACT_STATUSES } from '../../utils/constants';
import './StatusFilter.css';

export const StatusFilter: React.FC = () => {
  const { filters, updateFilter } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedStatuses = filters.statusKontak || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusToggle = (status: ContactStatus) => {
    const currentStatuses = selectedStatuses;
    let newStatuses: ContactStatus[];

    if (currentStatuses.includes(status)) {
      // Remove status
      newStatuses = currentStatuses.filter(s => s !== status);
    } else {
      // Add status
      newStatuses = [...currentStatuses, status];
    }

    updateFilter('statusKontak', newStatuses.length > 0 ? newStatuses : undefined);
  };

  const selectAllStatuses = () => {
    updateFilter('statusKontak', [...CONTACT_STATUSES] as ContactStatus[]);
  };

  const clearAllStatuses = () => {
    updateFilter('statusKontak', undefined);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New Contact': '#e74c3c',
      'In Progress': '#f39c12',
      'Follow Up': '#3498db',
      'Completed': '#27ae60'
    };
    return colors[status as keyof typeof colors] || '#95a5a6';
  };

  const getStatusLabel = (status: string) => {
    // Status is already the display label now
    return status;
  };

  const getDisplayText = () => {
    if (selectedStatuses.length === 0) {
      return 'Select status...';
    }
    if (selectedStatuses.length === 1) {
      return getStatusLabel(selectedStatuses[0]);
    }
    if (selectedStatuses.length === CONTACT_STATUSES.length) {
      return 'All statuses';
    }
    return `${selectedStatuses.length} statuses selected`;
  };

  return (
    <div className="status-filter" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`status-select-btn ${isOpen ? 'open' : ''} ${selectedStatuses.length > 0 ? 'has-selection' : ''}`}
      >
        <span className="select-text">{getDisplayText()}</span>
        <span className="select-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="status-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-title">Select Status</span>
            <div className="dropdown-actions">
              <button
                onClick={selectAllStatuses}
                className="action-btn select-all"
                disabled={selectedStatuses.length === CONTACT_STATUSES.length}
              >
                All
              </button>
              <button
                onClick={clearAllStatuses}
                className="action-btn clear-all"
                disabled={selectedStatuses.length === 0}
              >
                None
              </button>
            </div>
          </div>

          <div className="status-options">
            {CONTACT_STATUSES.map((status) => (
              <label
                key={status}
                className={`status-option ${selectedStatuses.includes(status as ContactStatus) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status as ContactStatus)}
                  onChange={() => handleStatusToggle(status as ContactStatus)}
                  className="status-checkbox"
                />
                
                <div className="status-info">
                  <span
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(status) }}
                  ></span>
                  <span className="status-name">{getStatusLabel(status)}</span>
                  <span className="status-code">({status})</span>
                </div>
              </label>
            ))}
          </div>

          {selectedStatuses.length > 0 && (
            <div className="dropdown-footer">
              <div className="selected-summary">
                {selectedStatuses.length} of {CONTACT_STATUSES.length} selected
              </div>
            </div>
          )}
        </div>
      )}

      {selectedStatuses.length > 0 && (
        <div className="selected-status-tags">
          {selectedStatuses.map((status) => (
            <span
              key={status}
              className="status-tag"
              style={{ backgroundColor: getStatusColor(status) }}
            >
              {getStatusLabel(status)}
              <button
                onClick={() => handleStatusToggle(status)}
                className="remove-status-btn"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};