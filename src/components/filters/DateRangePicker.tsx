import React, { useState, useEffect } from 'react';
import { useFilter } from '../../contexts/FilterContext';
import { formatDateForInput } from '../../utils/helpers';
import './DateRangePicker.css';

export const DateRangePicker: React.FC = () => {
  const { filters, updateFilter } = useFilter();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  // Initialize dates from filters
  useEffect(() => {
    if (filters.dateRange) {
      setStartDate(formatDateForInput(filters.dateRange.startDate));
      setEndDate(formatDateForInput(filters.dateRange.endDate));
    } else {
      setStartDate('');
      setEndDate('');
    }
  }, [filters.dateRange]);

  const validateDates = (start: string, end: string): boolean => {
    if (!start && !end) {
      setError('');
      setIsValid(true);
      return true;
    }

    if (start && !end) {
      setError('Please select an end date');
      setIsValid(false);
      return false;
    }

    if (!start && end) {
      setError('Please select a start date');
      setIsValid(false);
      return false;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj > endDateObj) {
      setError('Start date must be before end date');
      setIsValid(false);
      return false;
    }

    const now = new Date();
    if (startDateObj > now) {
      setError('Start date cannot be in the future');
      setIsValid(false);
      return false;
    }

    setError('');
    setIsValid(true);
    return true;
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    
    if (validateDates(value, endDate)) {
      if (value && endDate) {
        updateFilter('dateRange', {
          startDate: new Date(value),
          endDate: new Date(endDate)
        });
      } else if (!value && !endDate) {
        updateFilter('dateRange', undefined);
      }
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    
    if (validateDates(startDate, value)) {
      if (startDate && value) {
        updateFilter('dateRange', {
          startDate: new Date(startDate),
          endDate: new Date(value)
        });
      } else if (!startDate && !value) {
        updateFilter('dateRange', undefined);
      }
    }
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    setIsValid(true);
    updateFilter('dateRange', undefined);
  };

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const startStr = formatDateForInput(start);
    const endStr = formatDateForInput(end);
    
    setStartDate(startStr);
    setEndDate(endStr);
    setError('');
    setIsValid(true);
    
    updateFilter('dateRange', { startDate: start, endDate: end });
  };

  const presetOptions = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 365 days', days: 365 }
  ];

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className={`date-input ${!isValid ? 'error' : ''}`}
            max={formatDateForInput(new Date())}
          />
        </div>

        <div className="date-separator">to</div>

        <div className="date-input-group">
          <label htmlFor="end-date">To</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className={`date-input ${!isValid ? 'error' : ''}`}
            max={formatDateForInput(new Date())}
            min={startDate}
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={clearDates}
            className="clear-dates-btn"
            title="Clear dates"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="date-error">
          {error}
        </div>
      )}

      <div className="date-presets">
        <span className="presets-label">Quick select:</span>
        <div className="preset-buttons">
          {presetOptions.map((preset) => (
            <button
              key={preset.days}
              onClick={() => setPresetRange(preset.days)}
              className="preset-btn"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {filters.dateRange && (
        <div className="date-summary">
          <span className="summary-label">Selected range:</span>
          <span className="summary-value">
            {filters.dateRange.startDate.toLocaleDateString()} - {filters.dateRange.endDate.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};