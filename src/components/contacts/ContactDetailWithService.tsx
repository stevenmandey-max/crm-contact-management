import React, { useState, useEffect, useCallback } from 'react';
import type { Contact, ServiceEntry, ServiceSummary } from '../../types';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { serviceStorage } from '../../services/serviceStorage';
import { ContactHistory } from './ContactHistory';
import { ServiceEntryModal } from '../services/ServiceEntryModal';
import { ServiceCalendar } from '../services/ServiceCalendar';
import { ContactServiceFilter, type ContactServiceFilterOptions } from './ContactServiceFilter';
import './ContactDetail.css';

interface ContactDetailWithServiceProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onClose?: () => void;
}

export const ContactDetailWithService: React.FC<ContactDetailWithServiceProps> = ({
  contact,
  onEdit,
  onDelete,
  onClose
}) => {
  const { hasPermission } = useAuth();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceSummary, setServiceSummary] = useState<ServiceSummary | null>(null);
  const [filteredServiceSummary, setFilteredServiceSummary] = useState<ServiceSummary | null>(null);
  const [serviceFilter, setServiceFilter] = useState<ContactServiceFilterOptions>({ period: 'all' });

  // Load service summary
  const loadServiceSummary = useCallback(() => {
    const summary = serviceStorage.getContactServiceSummary(contact.id);
    setServiceSummary(summary);
  }, [contact.id]);

  // Calculate filtered service summary
  const calculateFilteredSummary = useCallback(() => {
    if (!serviceSummary) {
      setFilteredServiceSummary(null);
      return;
    }

    // If showing all time, use original summary
    if (serviceFilter.period === 'all') {
      setFilteredServiceSummary(serviceSummary);
      return;
    }

    // Get all services for this contact
    const allServices = serviceStorage.getServicesByContact(contact.id);
    
    // Filter services by date range
    let filteredServices = allServices;
    if (serviceFilter.startDate && serviceFilter.endDate) {
      const startDate = serviceFilter.startDate;
      const endDate = serviceFilter.endDate;
      filteredServices = allServices.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= startDate && serviceDate <= endDate;
      });
    }

    // Calculate filtered metrics
    const totalServiceDays = new Set(filteredServices.map(s => s.date)).size;
    const totalServiceHours = filteredServices.reduce((sum, s) => sum + s.duration, 0) / 60;
    const activeUsers = new Set(filteredServices.map(s => s.userId)).size;
    
    const lastService = filteredServices
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const lastServiceDate: Date | undefined = lastService ? new Date(lastService.date) : undefined;
    const lastServiceUser: string | undefined = lastService?.userId;

    // Calculate monthly trend for filtered period
    const monthlyData = new Map<string, { serviceCount: Set<string>; duration: number }>();
    
    filteredServices.forEach(service => {
      const date = new Date(service.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { serviceCount: new Set(), duration: 0 });
      }
      
      monthlyData.get(monthKey)!.serviceCount.add(service.date);
      monthlyData.get(monthKey)!.duration += service.duration;
    });

    const monthlyTrend = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month,
        serviceCount: data.serviceCount.size,
        duration: data.duration
      }));

    const filtered: ServiceSummary = {
      contactId: contact.id,
      totalServiceDays,
      totalServiceHours,
      activeUsers,
      monthlyTrend
    };

    if (lastServiceDate) {
      filtered.lastServiceDate = lastServiceDate;
    }
    if (lastServiceUser) {
      filtered.lastServiceUser = lastServiceUser;
    }

    setFilteredServiceSummary(filtered);
  }, [contact.id, serviceSummary, serviceFilter]);

  // Load service summary on mount and when contact changes
  useEffect(() => {
    loadServiceSummary();
  }, [loadServiceSummary]);

  // Calculate filtered summary when service summary or filter changes
  useEffect(() => {
    calculateFilteredSummary();
  }, [calculateFilteredSummary]);

  // Listen for service updates
  useEffect(() => {
    const handleServiceUpdate = () => {
      loadServiceSummary();
    };

    window.addEventListener('serviceAdded', handleServiceUpdate);
    window.addEventListener('serviceUpdated', handleServiceUpdate);
    window.addEventListener('serviceDeleted', handleServiceUpdate);

    return () => {
      window.removeEventListener('serviceAdded', handleServiceUpdate);
      window.removeEventListener('serviceUpdated', handleServiceUpdate);
      window.removeEventListener('serviceDeleted', handleServiceUpdate);
    };
  }, [loadServiceSummary]);

  const handleDelete = () => {
    if (!hasPermission('Admin')) {
      alert('Only administrators can delete contacts');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${contact.nama}?`)) {
      onDelete?.(contact.id);
    }
  };

  const handleLogService = () => {
    setShowServiceModal(true);
  };

  const handleServiceLogged = (service: ServiceEntry) => {
    console.log('Service logged:', service);
    // Service summary will be updated via event listener
  };

  const handleFilterChange = (newFilter: ContactServiceFilterOptions) => {
    setServiceFilter(newFilter);
  };

  const formatDuration = (hours: number): string => {
    if (hours === 0) return '0h';
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
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
    return status;
  };



  const isRecentlyUpdated = () => {
    const now = new Date();
    const updated = new Date(contact.updatedAt);
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  return (
    <div className="contact-detail-overlay">
      <div className="contact-detail-container">
        <div className="contact-detail-header">
          <div className="contact-detail-title">
            <h2>{contact.nama}</h2>
            <div className="contact-status-info">
              <span 
                className="status-badge large"
                style={{ backgroundColor: getStatusColor(contact.statusKontak) }}
              >
                {getStatusLabel(contact.statusKontak)}
              </span>
              {isRecentlyUpdated() && (
                <span className="recently-updated">Recently Updated</span>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="close-btn"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="contact-detail-content">
          {/* Service Tracking Section */}
          <div className="service-tracking-section">
            <div className="section-header">
              <h3>Service Tracking</h3>
              <button
                onClick={handleLogService}
                className="log-service-btn"
                title="Log new service activity"
              >
                <span>📝</span>
                Log Service
              </button>
            </div>

            {/* Service Filter */}
            <ContactServiceFilter
              onFilterChange={handleFilterChange}
              initialFilters={serviceFilter}
            />

            {filteredServiceSummary && filteredServiceSummary.totalServiceDays > 0 && (
              <div className="service-summary">
                <div className="service-stats">
                  <div className="stat-item">
                    <div className="stat-value">{filteredServiceSummary.totalServiceDays}</div>
                    <div className="stat-label">Service Days</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{formatDuration(filteredServiceSummary.totalServiceHours)}</div>
                    <div className="stat-label">Total Time</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{filteredServiceSummary.activeUsers}</div>
                    <div className="stat-label">Active Users</div>
                  </div>
                </div>

                {filteredServiceSummary.lastServiceDate && (
                  <div className="last-service-info">
                    <span className="last-service-label">Last Service:</span>
                    <span className="last-service-date">
                      {formatDate(filteredServiceSummary.lastServiceDate)}
                    </span>
                    {filteredServiceSummary.lastServiceUser && (
                      <span className="last-service-user">
                        by {filteredServiceSummary.lastServiceUser}
                      </span>
                    )}
                  </div>
                )}

                {filteredServiceSummary.monthlyTrend && filteredServiceSummary.monthlyTrend.length > 0 && (
                  <div className="monthly-trend">
                    <h4>Recent Activity (Last 6 Months)</h4>
                    <div className="trend-chart">
                      {filteredServiceSummary.monthlyTrend.map((month) => (
                        <div key={month.month} className="trend-bar">
                          <div 
                            className="trend-fill"
                            style={{ 
                              height: `${Math.max(5, (month.serviceCount / Math.max(...filteredServiceSummary.monthlyTrend.map(m => m.serviceCount))) * 100)}%` 
                            }}
                            title={`${month.month}: ${month.serviceCount} days, ${formatDuration(month.duration)}`}
                          />
                          <div className="trend-label">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(!filteredServiceSummary || filteredServiceSummary.totalServiceDays === 0) && (
              <div className="no-service-data">
                <p>No service activities recorded yet.</p>
                <p>Click "Log Service" to start tracking service time for this contact.</p>
              </div>
            )}
          </div>

          {/* Service Calendar */}
          <div className="service-calendar-section">
            <h4>Service Calendar</h4>
            <p>Highlighted dates show when services were provided to this contact</p>
            <ServiceCalendar 
              contactId={contact.id}
              onDateClick={(date, services) => {
                console.log('Date clicked:', date, 'Services:', services);
                // TODO: Show service details for the selected date
              }}
            />
          </div>

          {/* Contact History Section */}
          <ContactHistory 
            history={contact.history || []} 
            isExpanded={false}
            maxEntries={5}
          />
        </div>

        <div className="contact-detail-actions">
          <button
            onClick={() => onEdit?.(contact)}
            className="action-btn edit-btn"
          >
            <span>✏️</span>
            Edit Contact
          </button>
          
          {hasPermission('Admin') && (
            <button
              onClick={handleDelete}
              className="action-btn delete-btn"
            >
              <span>🗑️</span>
              Delete Contact
            </button>
          )}
          
          <button
            onClick={onClose}
            className="action-btn close-btn-secondary"
          >
            Close
          </button>
        </div>
      </div>

      {/* Service Entry Modal */}
      {showServiceModal && (
        <ServiceEntryModal
          isOpen={showServiceModal}
          contactId={contact.id}
          contactName={contact.nama}
          onClose={() => setShowServiceModal(false)}
          onServiceLogged={handleServiceLogged}
        />
      )}
    </div>
  );
};