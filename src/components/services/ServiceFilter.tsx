import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { shouldShowAllUsersOption } from '../../utils/dataFilters';
import './ServiceFilter.css';

export interface ServiceFilterOptions {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  contactId?: string;
  userId?: string;
  serviceType?: string;
}

interface ServiceFilterProps {
  onFilterChange: (filters: ServiceFilterOptions) => void;
  initialFilters?: ServiceFilterOptions;
  contacts?: Array<{ id: string; nama: string }>;
  users?: Array<{ username: string }>;
}

export const ServiceFilter: React.FC<ServiceFilterProps> = ({
  onFilterChange,
  initialFilters,
  contacts = [],
  users = []
}) => {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<ServiceFilterOptions>({
    period: 'month',
    ...initialFilters
  });

  const [showCustomDates, setShowCustomDates] = useState(false);

  // Update filters when they change
  useEffect(() => {
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (filters.period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'custom':
        startDate = filters.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = filters.endDate || new Date();
        setShowCustomDates(true);
        break;
      
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
    }

    const updatedFilters = {
      ...filters,
      startDate,
      endDate
    };

    onFilterChange(updatedFilters);
  }, [filters.period, filters.startDate, filters.endDate, filters.contactId, filters.userId, filters.serviceType]);

  const handlePeriodChange = (period: ServiceFilterOptions['period']) => {
    setFilters(prev => ({ ...prev, period }));
    setShowCustomDates(period === 'custom');
  };

  const handleContactChange = (contactId: string) => {
    setFilters(prev => ({ ...prev, contactId: contactId || undefined }));
  };

  const handleUserChange = (userId: string) => {
    setFilters(prev => ({ ...prev, userId: userId || undefined }));
  };

  const handleServiceTypeChange = (serviceType: string) => {
    setFilters(prev => ({ ...prev, serviceType: serviceType || undefined }));
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
    if (!filters.startDate || !filters.endDate) return '';
    
    const start = filters.startDate.toLocaleDateString('id-ID');
    const end = filters.endDate.toLocaleDateString('id-ID');
    
    if (filters.period === 'day') {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  const clearFilters = () => {
    setFilters({
      period: 'month'
    });
    setShowCustomDates(false);
  };

  return (
    <div className="service-filter">
      <div className="filter-header">
        <h4>Filter Pelayanan</h4>
        <button onClick={clearFilters} className="clear-filters-btn">
          Reset
        </button>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Periode Waktu:</label>
          <select 
            value={filters.period} 
            onChange={(e) => handlePeriodChange(e.target.value as ServiceFilterOptions['period'])}
            className="filter-select"
          >
            <option value="day">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="quarter">Kuartal Ini</option>
            <option value="year">Tahun Ini</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {contacts.length > 0 && (
          <div className="filter-group">
            <label>Contact:</label>
            <select 
              value={filters.contactId || ''} 
              onChange={(e) => handleContactChange(e.target.value)}
              className="filter-select"
            >
              <option value="">Semua Contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.nama}
                </option>
              ))}
            </select>
          </div>
        )}

        {users.length > 0 && (
          <div className="filter-group">
            <label>User:</label>
            {shouldShowAllUsersOption(currentUser) ? (
              // ADMIN: Show full dropdown
              <select 
                value={filters.userId || ''} 
                onChange={(e) => handleUserChange(e.target.value)}
                className="filter-select"
              >
                <option value="">Semua User</option>
                {users.map(user => (
                  <option key={user.username} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            ) : (
              // Editor: Show clean locked display
              <div className="filter-select locked-display">
                <span className="locked-user-text">
                  {currentUser?.username}
                </span>
                <span className="lock-icon-inline">🔒</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showCustomDates && (
        <div className="filter-row custom-dates">
          <div className="filter-group">
            <label>Tanggal Mulai:</label>
            <input
              type="date"
              value={filters.startDate ? formatDateForInput(filters.startDate) : ''}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Tanggal Akhir:</label>
            <input
              type="date"
              value={filters.endDate ? formatDateForInput(filters.endDate) : ''}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      )}

      <div className="filter-summary">
        <span className="summary-label">Periode:</span>
        <span className="summary-value">{getPeriodLabel()}</span>
        {filters.contactId && (
          <>
            <span className="summary-separator">•</span>
            <span className="summary-value">
              Contact: {contacts.find(c => c.id === filters.contactId)?.nama}
            </span>
          </>
        )}
        {filters.userId && (
          <>
            <span className="summary-separator">•</span>
            <span className="summary-value">User: {filters.userId}</span>
          </>
        )}
      </div>
    </div>
  );
};