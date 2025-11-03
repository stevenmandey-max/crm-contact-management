import React, { useState, useEffect } from 'react';
import { ServiceFilter, type ServiceFilterOptions } from './ServiceFilter';
import { ServiceReport } from './ServiceReport';
import { ServiceSessionReport } from './ServiceSessionReport';
import { localStorageService } from '../../services/localStorage';
import { useAuth } from '../../hooks/useAuth';
import { getAccessibleUsers } from '../../utils/dataFilters';
import type { Contact } from '../../types';
import './ServiceTracking.css';

export const ServiceTracking: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'manual' | 'sessions'>('sessions');
  const [filters, setFilters] = useState<ServiceFilterOptions>({
    period: 'month'
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<Array<{ username: string }>>([]);

  // Load contacts and users for filter options
  useEffect(() => {
    const allContacts = localStorageService.getContacts();
    setContacts(allContacts);

    const allUsers = localStorageService.getUsers();
    // Filter users based on current user permissions
    const accessibleUsers = getAccessibleUsers(allUsers, currentUser);
    setUsers(accessibleUsers);
  }, [currentUser]);

  const handleFilterChange = (newFilters: ServiceFilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="service-tracking">
      <div className="service-tracking-header">
        <div className="header-content">
          <h1>Service Tracking</h1>
          <p>Monitor dan analisis pelayanan yang diberikan kepada contacts</p>
          <div className="unified-system-info">
            <span className="system-icon">🔗</span>
            <span>Unified System: Timer Sessions, Manual Log Service, dan Service Calendar terintegrasi</span>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="service-tabs">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          >
            🕐 Service Sessions
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          >
            📊 Manual Reports
          </button>
        </div>
      </div>

      <div className="service-tracking-content">
        {activeTab === 'sessions' ? (
          <ServiceSessionReport />
        ) : (
          <>
            <ServiceFilter
              onFilterChange={handleFilterChange}
              initialFilters={filters}
              contacts={contacts}
              users={users}
            />
            <ServiceReport filters={filters} />
          </>
        )}
      </div>
    </div>
  );
};