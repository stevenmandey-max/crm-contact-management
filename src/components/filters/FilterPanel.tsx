import React, { useState } from 'react';
import { useFilter } from '../../contexts/FilterContext';
import { DateRangePicker } from './DateRangePicker';
import { StatusFilter } from './StatusFilter';
import { TextFilter } from './TextFilter';
import { GlobalSearchFilter } from './GlobalSearchFilter';
import './FilterPanel.css';

interface FilterPanelProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isCollapsed = false,
  onToggle
}) => {
  const {
    filters,
    clearFilters,
    hasActiveFilters,
    filterCount,
    filterSummary,
    applyQuickFilter,
    totalContacts,
    filteredCount
  } = useFilter();

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'quick'>('basic');

  const handleQuickFilter = (type: 'recent' | 'thisWeek' | 'thisMonth' | 'byStatus', value?: any) => {
    applyQuickFilter(type, value);
  };

  const quickFilters = [
    { label: 'Recent (24h)', action: () => handleQuickFilter('recent') },
    { label: 'This Week', action: () => handleQuickFilter('thisWeek') },
    { label: 'This Month', action: () => handleQuickFilter('thisMonth') },
    { label: 'New Contact', action: () => handleQuickFilter('byStatus', 'New Contact') },
    { label: 'In Progress', action: () => handleQuickFilter('byStatus', 'In Progress') },
    { label: 'Follow Up', action: () => handleQuickFilter('byStatus', 'Follow Up') },
    { label: 'Completed', action: () => handleQuickFilter('byStatus', 'Completed') }
  ];

  return (
    <div className={`filter-panel ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="filter-header">
        <div className="filter-title">
          <h3>Filters</h3>
          {hasActiveFilters && (
            <span className="filter-count">{filterCount} active</span>
          )}
        </div>
        
        <div className="filter-actions">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All
            </button>
          )}
          
          {onToggle && (
            <button onClick={onToggle} className="toggle-btn">
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="filter-content">
          <div className="filter-stats">
            <span className="results-count">
              Showing {filteredCount} of {totalContacts} contacts
            </span>
            {hasActiveFilters && (
              <div className="filter-summary">
                {filterSummary.map((summary, index) => (
                  <span key={index} className="filter-tag">
                    {summary}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="filter-tabs">
            <button
              onClick={() => setActiveTab('basic')}
              className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
            >
              Advanced
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
            >
              Quick Filters
            </button>
          </div>

          <div className="filter-body">
            {activeTab === 'basic' && (
              <div className="basic-filters">
                <div className="filter-group">
                  <label>Search Contacts</label>
                  <GlobalSearchFilter placeholder="Search by name or phone number..." />
                </div>

                <div className="filter-group">
                  <label>Contact Status</label>
                  <StatusFilter />
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <label>Global Search</label>
                  <GlobalSearchFilter placeholder="Search by name or phone number..." />
                </div>

                <div className="filter-group">
                  <label>Date Range</label>
                  <DateRangePicker />
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Address</label>
                    <TextFilter
                      field="alamat"
                      placeholder="Search by address..."
                      value={filters.alamat || ''}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Religion</label>
                    <TextFilter
                      field="agama"
                      placeholder="Search by religion..."
                      value={filters.agama || ''}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Reason for Contact</label>
                  <TextFilter
                    field="alasanMenghubungi"
                    placeholder="Search by reason..."
                    value={filters.alasanMenghubungi || ''}
                  />
                </div>

                {!filters.globalSearch && (
                  <div className="individual-search-note">
                    <p><strong>Note:</strong> Individual name/phone search available when global search is empty</p>
                    <div className="filter-row">
                      <div className="filter-group">
                        <label>Name Only</label>
                        <TextFilter
                          field="nama"
                          placeholder="Search by name only..."
                          value={filters.nama || ''}
                        />
                      </div>

                      <div className="filter-group">
                        <label>Phone Only</label>
                        <TextFilter
                          field="nomorTelepon"
                          placeholder="Search by phone only..."
                          value={filters.nomorTelepon || ''}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quick' && (
              <div className="quick-filters">
                <div className="quick-filter-grid">
                  {quickFilters.map((filter, index) => (
                    <button
                      key={index}
                      onClick={filter.action}
                      className="quick-filter-btn"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                
                <div className="quick-filter-info">
                  <p>Quick filters provide instant filtering options for common use cases.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};