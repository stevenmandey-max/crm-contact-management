import React, { useState, useEffect } from 'react';
import './ContactServiceFilter.css';

export interface ContactServiceFilterOptions {
  period: 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

interface ContactServiceFilterProps {
  onFilterChange: (filters: ContactServiceFilterOptions) => void;
  initialFilters?: ContactServiceFilterOptions;
}

export const ContactServiceFilter: React.FC<ContactServiceFilterProps> = ({
  onFilterChange,
  initialFilters
}) => {
  const [filters, setFilters] = useState<ContactServiceFilterOptions>({
    period: 'all',
    ...initialFilters
  });

  const [showCustomDates, setShowCustomDates] = useState(false);

  // Update filters when they change
  useEffect(() => {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (filters.period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        endDate = new Date(now);
        break;
      
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = new Date(now);
        break;
      
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        endDate = new Date(now);
        break;
      
      case 'custom':
        startDate = filters.startDate;
        endDate = filters.endDate;
        setShowCustomDates(true);
        break;
      
      case 'all':
      default:
        startDate = undefined;
        endDate = undefined;
        setShowCustomDates(false);
        break;
    }

    const updatedFilters = {
      ...filters,
      startDate,
      endDate
    };

    onFilterChange(updatedFilters);
  }, [filters.period, filters.startDate, filters.endDate]);

  const handlePeriodChange = (period: ContactServiceFilterOptions['period']) => {
    setFilters(prev => ({ ...prev, period }));
    setShowCustomDates(period === 'custom');
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (value) {
      const date = new Date(value);
      setFilters(prev => ({ ...prev, [field]: date }));
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getPeriodLabel = () => {
    if (filters.period === 'all') return 'Semua Waktu';
    if (!filters.startDate || !filters.endDate) return '';
    
    const start = filters.startDate.toLocaleDateString('id-ID');
    const end = filters.endDate.toLocaleDateString('id-ID');
    
    return `${start} - ${end}`;
  };

  const clearFilters = () => {
    setFilters({ period: 'all' });
    setShowCustomDates(false);
  };

  return (
    <div className="contact-service-filter">
      <div className="filter-header">
        <span className="filter-label">Filter Periode:</span>
        <button onClick={clearFilters} className="clear-btn" title="Reset ke semua waktu">
          ↻
        </button>
      </div>

      <div className="filter-controls">
        <div className="period-buttons">
          <button 
            className={`period-btn ${filters.period === 'all' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('all')}
          >
            Semua
          </button>
          <button 
            className={`period-btn ${filters.period === 'week' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('week')}
          >
            7 Hari
          </button>
          <button 
            className={`period-btn ${filters.period === 'month' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('month')}
          >
            30 Hari
          </button>
          <button 
            className={`period-btn ${filters.period === 'quarter' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('quarter')}
          >
            3 Bulan
          </button>
          <button 
            className={`period-btn ${filters.period === 'year' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('year')}
          >
            1 Tahun
          </button>
          <button 
            className={`period-btn ${filters.period === 'custom' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('custom')}
          >
            Custom
          </button>
        </div>

        {showCustomDates && (
          <div className="custom-dates">
            <div className="date-input-group">
              <label>Dari:</label>
              <input
                type="date"
                value={filters.startDate ? formatDateForInput(filters.startDate) : ''}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>Sampai:</label>
              <input
                type="date"
                value={filters.endDate ? formatDateForInput(filters.endDate) : ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        )}
      </div>

      {filters.period !== 'all' && (
        <div className="filter-summary">
          <span className="summary-text">{getPeriodLabel()}</span>
        </div>
      )}
    </div>
  );
};