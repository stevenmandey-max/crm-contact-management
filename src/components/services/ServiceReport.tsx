import React, { useState, useEffect } from 'react';
import { serviceStorage } from '../../services/serviceStorage';
import { localStorageService } from '../../services/localStorage';
import { useAuth } from '../../hooks/useAuth';
import { filterServicesByPermission } from '../../utils/dataFilters';
import type { ServiceEntry, Contact } from '../../types';
import type { ServiceFilterOptions } from './ServiceFilter';
import { formatDate } from '../../utils/helpers';
import './ServiceReport.css';

interface ServiceReportProps {
  filters: ServiceFilterOptions;
}

interface ServiceReportData {
  services: ServiceEntry[];
  totalServices: number;
  totalDuration: number;
  totalServiceDays: number;
  contactsServed: number;
  averageDurationPerService: number;
  servicesByContact: Map<string, ServiceEntry[]>;
  servicesByUser: Map<string, ServiceEntry[]>;
  servicesByDate: Map<string, ServiceEntry[]>;
}

export const ServiceReport: React.FC<ServiceReportProps> = ({ filters }) => {
  const { currentUser } = useAuth();
  const [reportData, setReportData] = useState<ServiceReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'calendar'>('summary');

  // Load contacts for name lookup
  useEffect(() => {
    const allContacts = localStorageService.getContacts();
    setContacts(allContacts);
  }, []);

  // Generate report data based on filters
  useEffect(() => {
    if (!filters.startDate || !filters.endDate) return;

    setLoading(true);

    try {
      // Get all services
      let allServices = serviceStorage.getAllServices();
      
      // SECURITY: Filter services by user permissions first
      allServices = filterServicesByPermission(allServices, currentUser);

      // Filter by date range
      const filteredServices = allServices.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= filters.startDate! && serviceDate <= filters.endDate!;
      });

      // Apply additional filters
      let services = filteredServices;

      if (filters.contactId) {
        services = services.filter(service => service.contactId === filters.contactId);
      }

      if (filters.userId) {
        services = services.filter(service => service.userId === filters.userId);
      }

      if (filters.serviceType) {
        services = services.filter(service => 
          service.serviceType?.toLowerCase().includes(filters.serviceType!.toLowerCase()) ||
          service.description?.toLowerCase().includes(filters.serviceType!.toLowerCase())
        );
      }

      // Calculate metrics
      const totalServices = services.length;
      const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
      
      // Count unique service dates
      const uniqueDates = new Set(services.map(service => service.date));
      const totalServiceDays = uniqueDates.size;
      
      // Count unique contacts served
      const uniqueContacts = new Set(services.map(service => service.contactId));
      const contactsServed = uniqueContacts.size;
      
      const averageDurationPerService = totalServices > 0 ? totalDuration / totalServices : 0;

      // Group services
      const servicesByContact = new Map<string, ServiceEntry[]>();
      const servicesByUser = new Map<string, ServiceEntry[]>();
      const servicesByDate = new Map<string, ServiceEntry[]>();

      services.forEach(service => {
        // By contact
        if (!servicesByContact.has(service.contactId)) {
          servicesByContact.set(service.contactId, []);
        }
        servicesByContact.get(service.contactId)!.push(service);

        // By user
        if (!servicesByUser.has(service.userId)) {
          servicesByUser.set(service.userId, []);
        }
        servicesByUser.get(service.userId)!.push(service);

        // By date
        if (!servicesByDate.has(service.date)) {
          servicesByDate.set(service.date, []);
        }
        servicesByDate.get(service.date)!.push(service);
      });

      const reportData: ServiceReportData = {
        services,
        totalServices,
        totalDuration,
        totalServiceDays,
        contactsServed,
        averageDurationPerService,
        servicesByContact,
        servicesByUser,
        servicesByDate
      };

      setReportData(reportData);
    } catch (error) {
      console.error('Error generating service report:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) {
      return 'Chat'; // Special display for WhatsApp services
    }
    if (minutes < 60) {
      return `${minutes} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}j ${remainingMinutes}m` : `${hours} jam`;
  };

  const getContactName = (contactId: string): string => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.nama || 'Unknown Contact';
  };

  const getPeriodLabel = (): string => {
    if (!filters.startDate || !filters.endDate) return '';
    
    const start = filters.startDate.toLocaleDateString('id-ID');
    const end = filters.endDate.toLocaleDateString('id-ID');
    
    if (filters.period === 'day') {
      return `Hari: ${start}`;
    }
    
    return `Periode: ${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="service-report loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="service-report empty">
        <p>Pilih filter untuk melihat laporan pelayanan</p>
      </div>
    );
  }

  return (
    <div className="service-report">
      <div className="report-header">
        <div className="report-title">
          <h3>Laporan Pelayanan</h3>
          <p className="report-period">{getPeriodLabel()}</p>
        </div>
        
        <div className="view-mode-selector">
          <button 
            className={`view-btn ${viewMode === 'summary' ? 'active' : ''}`}
            onClick={() => setViewMode('summary')}
          >
            Ringkasan
          </button>
          <button 
            className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            Detail
          </button>
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            Kalender
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="report-metrics">
        <div className="metric-card">
          <div className="metric-value">{reportData.totalServices}</div>
          <div className="metric-label">Total Pelayanan</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatDuration(reportData.totalDuration)}</div>
          <div className="metric-label">Total Waktu</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{reportData.totalServiceDays}</div>
          <div className="metric-label">Hari Pelayanan</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{reportData.contactsServed}</div>
          <div className="metric-label">Contact Dilayani</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatDuration(Math.round(reportData.averageDurationPerService))}</div>
          <div className="metric-label">Rata-rata per Pelayanan</div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'summary' && (
        <div className="report-content">
          {/* Services by Contact */}
          <div className="report-section">
            <h4>Pelayanan per Contact</h4>
            <div className="contact-services-list">
              {Array.from(reportData.servicesByContact.entries())
                .sort(([,a], [,b]) => b.length - a.length)
                .slice(0, 10)
                .map(([contactId, services]) => {
                  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
                  return (
                    <div key={contactId} className="contact-service-item">
                      <div className="contact-info">
                        <span className="contact-name">{getContactName(contactId)}</span>
                        <span className="service-count">{services.length} pelayanan</span>
                      </div>
                      <div className="service-duration">
                        {formatDuration(totalDuration)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Services by User */}
          <div className="report-section">
            <h4>Pelayanan per User</h4>
            <div className="user-services-list">
              {Array.from(reportData.servicesByUser.entries())
                .sort(([,a], [,b]) => b.length - a.length)
                .map(([userId, services]) => {
                  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
                  return (
                    <div key={userId} className="user-service-item">
                      <div className="user-info">
                        <span className="user-name">{userId}</span>
                        <span className="service-count">{services.length} pelayanan</span>
                      </div>
                      <div className="service-duration">
                        {formatDuration(totalDuration)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="report-content">
          <div className="detailed-services">
            <h4>Detail Pelayanan ({reportData.services.length})</h4>
            <div className="services-table">
              <div className="table-header">
                <div className="col-date">Tanggal</div>
                <div className="col-contact">Contact</div>
                <div className="col-user">User</div>
                <div className="col-duration">Durasi</div>
                <div className="col-description">Deskripsi</div>
              </div>
              <div className="table-body">
                {reportData.services
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((service) => (
                    <div key={service.id} className="table-row">
                      <div className="col-date">{formatDate(new Date(service.date))}</div>
                      <div className="col-contact">{getContactName(service.contactId)}</div>
                      <div className="col-user">{service.userId}</div>
                      <div className="col-duration">{formatDuration(service.duration)}</div>
                      <div className="col-description">{service.description || '-'}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="report-content">
          <div className="calendar-view">
            <h4>Kalender Pelayanan</h4>
            <div className="calendar-services">
              {Array.from(reportData.servicesByDate.entries())
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, services]) => {
                  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
                  return (
                    <div key={date} className="calendar-day-item">
                      <div className="day-header">
                        <span className="day-date">{formatDate(new Date(date))}</span>
                        <span className="day-summary">
                          {services.length} pelayanan • {formatDuration(totalDuration)}
                        </span>
                      </div>
                      <div className="day-services">
                        {services.map(service => (
                          <div key={service.id} className="day-service-item">
                            <span className="service-contact">{getContactName(service.contactId)}</span>
                            <span className="service-user">by {service.userId}</span>
                            <span className="service-duration">{formatDuration(service.duration)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {reportData.services.length === 0 && (
        <div className="no-data">
          <p>Tidak ada data pelayanan untuk periode yang dipilih</p>
        </div>
      )}
    </div>
  );
};