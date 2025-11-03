import React, { useState, useMemo } from 'react';
import { serviceSessionStorage } from '../../services/serviceSessionStorage';
import { localStorageService } from '../../services/localStorage';
import { useAuth } from '../../hooks/useAuth';
import type { ServiceSession } from '../../types';
import { filterServiceSessionsByPermission, getAccessibleUsers, shouldShowAllUsersOption, getDefaultUserFilter } from '../../utils/dataFilters';
import './ServiceSessionReport.css';

export const ServiceSessionReport: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedUser, setSelectedUser] = useState<string>(() => getDefaultUserFilter(currentUser));
  const [, setForceRender] = useState(0);

  // Force re-render when currentUser changes
  React.useEffect(() => {
    setForceRender(prev => prev + 1);
  }, [currentUser?.role, currentUser?.username]);

  // Get users that current user can access
  const allUsers = localStorageService.getUsers();
  const users = getAccessibleUsers(allUsers, currentUser);
  
  // Get all sessions
  const allSessions = serviceSessionStorage.getSessions();
  
  // Filter sessions based on selected criteria and user permissions
  const filteredSessions = useMemo(() => {
    let sessions = allSessions.filter(s => s.status === 'completed');
    
    // SECURITY: First filter by user permissions (Editor can only see their own sessions)
    sessions = filterServiceSessionsByPermission(sessions, currentUser);
    
    // SECURITY: HARDCODED CHECK - if username is 'editor', force filter to only their data
    if (currentUser?.username === 'editor') {
      sessions = sessions.filter(s => s.userId === 'editor');
    } else if (currentUser?.role === 'Admin' && selectedUser !== 'all') {
      // Admin can filter by specific user
      sessions = sessions.filter(s => s.userId === selectedUser);
    }
    
    // Filter by period
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (selectedPeriod) {
      case 'today':
        sessions = sessions.filter(s => s.serviceDate === today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        sessions = sessions.filter(s => new Date(s.startTime) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        sessions = sessions.filter(s => new Date(s.startTime) >= monthAgo);
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }
    
    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [allSessions, selectedPeriod, selectedUser]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const totalTime = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const uniqueContacts = new Set(filteredSessions.map(s => s.contactId)).size;
    const averageTime = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;
    
    return {
      totalSessions,
      totalTime,
      uniqueContacts,
      averageTime
    };
  }, [filteredSessions]);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped = filteredSessions.reduce((acc, session) => {
      const date = session.serviceDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {} as Record<string, ServiceSession[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredSessions]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getContactName = (contactId: string): string => {
    const contact = localStorageService.getContactById(contactId);
    return contact?.nama || 'Unknown Contact';
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.username === userId);
    return user?.username || userId;
  };

  return (
    <div className="service-session-report">
      <div className="report-header">
        <h2>📊 Service Session Report</h2>
        <p>Laporan detail aktivitas pelayanan dan durasi waktu</p>
        
        {/* Permission Level Indicator */}
        <div className="permission-indicator">
          <span className="permission-icon">
            {currentUser?.role === 'Admin' ? '👑' : '🔒'}
          </span>
          <span className="permission-text">
            {currentUser?.role === 'Admin' 
              ? 'Admin: Akses semua data user' 
              : `Editor: Hanya data ${currentUser?.username}`
            }
          </span>
        </div>
        
        <div className="integration-info">
          <span className="info-icon">🔄</span>
          <span>Timer sessions otomatis tersimpan ke Log Service dan Service Calendar</span>
        </div>
      </div>

      {/* Filters */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Periode:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="filter-select"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
        </div>

        <div className="filter-group">
          <label>User:</label>
          {shouldShowAllUsersOption(currentUser) ? (
            // Admin: Show dropdown
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua User</option>
              {users.map(user => (
                <option key={user.username} value={user.username}>
                  {user.username} {user.username === currentUser?.username ? '(You)' : ''}
                </option>
              ))}
            </select>
          ) : (
            // Editor: Show clean locked display
            <div className="filter-select locked-display">
              <span className="locked-user-text">
                {currentUser?.username} (You)
              </span>
              <span className="lock-icon-inline">🔒</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="report-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">Total Sesi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(stats.totalTime)}</div>
          <div className="stat-label">Total Waktu</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.uniqueContacts}</div>
          <div className="stat-label">Contact Dilayani</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(stats.averageTime)}</div>
          <div className="stat-label">Rata-rata Durasi</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="sessions-report">
        {sessionsByDate.length === 0 ? (
          <div className="no-sessions">
            <div className="no-sessions-icon">📋</div>
            <h3>Tidak ada data sesi</h3>
            <p>Belum ada sesi pelayanan untuk periode yang dipilih</p>
          </div>
        ) : (
          sessionsByDate.map(([date, sessions]) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <h3>{formatDate(date)}</h3>
                <div className="date-stats">
                  <span>{sessions.length} sesi</span>
                  <span>
                    {formatDuration(sessions.reduce((sum, s) => sum + (s.duration || 0), 0))}
                  </span>
                </div>
              </div>

              <div className="sessions-list">
                {sessions.map((session) => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <div className="session-contact">
                        <strong>{getContactName(session.contactId)}</strong>
                        <span className="session-user">oleh {getUserName(session.userId)}</span>
                      </div>
                      <div className="session-duration">
                        {formatDuration(session.duration || 0)}
                      </div>
                    </div>

                    <div className="session-details">
                      <div className="session-time">
                        <span className="time-start">{formatTime(session.startTime)}</span>
                        <span className="time-separator">→</span>
                        <span className="time-end">
                          {session.endTime ? formatTime(session.endTime) : 'Ongoing'}
                        </span>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};