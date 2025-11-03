import React from 'react';
import type { ServiceSession } from '../../types';
import { serviceSessionStorage } from '../../services/serviceSessionStorage';
import './ServiceHistory.css';

interface ServiceHistoryProps {
  contactId: string;
  contactName: string;
  maxEntries?: number;
  showHeader?: boolean;
}

export const ServiceHistory: React.FC<ServiceHistoryProps> = ({
  contactId,
  contactName,
  maxEntries = 10,
  showHeader = true
}) => {
  const sessions = serviceSessionStorage.getSessionsForContact(contactId);
  const displaySessions = maxEntries ? sessions.slice(0, maxEntries) : sessions;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTotalServiceTime = (): number => {
    return sessions.reduce((total, session) => total + (session.duration || 0), 0);
  };

  const getServiceStats = () => {
    const totalTime = getTotalServiceTime();
    const sessionCount = sessions.length;
    const averageTime = sessionCount > 0 ? Math.round(totalTime / sessionCount) : 0;
    
    return {
      totalTime: formatDuration(totalTime),
      sessionCount,
      averageTime: formatDuration(averageTime)
    };
  };

  const stats = getServiceStats();

  if (sessions.length === 0) {
    return (
      <div className="service-history">
        {showHeader && (
          <div className="service-history-header">
            <h3>🕐 Service History</h3>
            <p>Riwayat pelayanan untuk {contactName}</p>
          </div>
        )}
        <div className="no-service-history">
          <div className="no-history-icon">📋</div>
          <p>Belum ada riwayat pelayanan</p>
          <span>Mulai pelayanan untuk mencatat waktu</span>
        </div>
      </div>
    );
  }

  return (
    <div className="service-history">
      {showHeader && (
        <div className="service-history-header">
          <h3>🕐 Service History</h3>
          <p>Riwayat pelayanan untuk {contactName}</p>
        </div>
      )}

      {/* Service Statistics */}
      <div className="service-stats-summary">
        <div className="stat-item">
          <span className="stat-value">{stats.sessionCount}</span>
          <span className="stat-label">Total Sesi</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalTime}</span>
          <span className="stat-label">Total Waktu</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.averageTime}</span>
          <span className="stat-label">Rata-rata</span>
        </div>
      </div>

      {/* Service Sessions List */}
      <div className="service-sessions">
        <div className="sessions-header">
          <h4>Riwayat Sesi ({displaySessions.length} dari {sessions.length})</h4>
        </div>
        
        <div className="sessions-list">
          {displaySessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-main">
                <div className="session-time">
                  <span className="duration">{formatDuration(session.duration || 0)}</span>
                  <span className="datetime">{formatDateTime(session.startTime)}</span>
                </div>
                
                <div className="session-details">
                  <div className="session-info">
                    <span className="session-date">{session.serviceDate}</span>
                    <span className="session-hour">Jam {session.serviceHour}:00</span>
                  </div>
                  
                  {session.notes && (
                    <div className="session-notes">
                      <span className="notes-icon">📝</span>
                      <span className="notes-text">{session.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="session-status">
                <span className={`status-badge ${session.status}`}>
                  {session.status === 'completed' ? '✅' : '⏸️'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {sessions.length > maxEntries && (
          <div className="sessions-footer">
            <button className="view-all-btn">
              Lihat Semua ({sessions.length} sesi)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};