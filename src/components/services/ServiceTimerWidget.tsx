import React, { useState, useEffect } from 'react';
import { useServiceTimer } from '../../hooks/useServiceTimer';
import './ServiceTimerWidget.css';

interface ServiceTimerWidgetProps {
  contactId: string;
  contactName: string;
  onServiceStart?: () => void;
  onServiceEnd?: (duration: number) => void;
  className?: string;
}

export const ServiceTimerWidget: React.FC<ServiceTimerWidgetProps> = ({
  contactId,
  contactName,
  onServiceStart,
  onServiceEnd,
  className = ''
}) => {
  const [notification, setNotification] = useState<string | null>(null);
  
  const {
    activeSession,
    isLoading,
    isActive,
    startService,
    endService,
    pauseService,
    resumeService,
    formatElapsedTime,
    canStart,
    canEnd,
    canPause,
    canResume,
    getTodayStats,
    forceCompleteAllSessions,
    triggerRecovery
  } = useServiceTimer(contactId);

  // Listen for auto-stop and recovery events
  useEffect(() => {
    const handleServiceAutoStopped = (event: CustomEvent) => {
      const { session } = event.detail;
      const durationMinutes = Math.round((session.duration || 0) / 60);
      
      if (durationMinutes > 0) {
        setNotification(`Previous service (${durationMinutes}m) auto-stopped and recorded`);
        setTimeout(() => setNotification(null), 5000);
      }
    };

    const handleSessionsRecovered = (event: CustomEvent) => {
      const { recoveredSessions } = event.detail;
      
      if (recoveredSessions.length > 0) {
        setNotification(`${recoveredSessions.length} service session(s) recovered from interruption`);
        setTimeout(() => setNotification(null), 5000);
      }
    };

    const handleServiceEnded = (event: CustomEvent) => {
      const { session, contactId: endedContactId } = event.detail;
      
      // If this service was ended from outside (like banner), show notification
      if (endedContactId === contactId) {
        const durationMinutes = Math.round((session.duration || 0) / 60);
        if (durationMinutes > 0) {
          setNotification(`Service completed (${durationMinutes}m) and recorded`);
          setTimeout(() => setNotification(null), 5000);
        }
      }
    };

    window.addEventListener('serviceAutoStopped', handleServiceAutoStopped as EventListener);
    window.addEventListener('sessionsRecovered', handleSessionsRecovered as EventListener);
    window.addEventListener('serviceEnded', handleServiceEnded as EventListener);

    return () => {
      window.removeEventListener('serviceAutoStopped', handleServiceAutoStopped as EventListener);
      window.removeEventListener('sessionsRecovered', handleSessionsRecovered as EventListener);
      window.removeEventListener('serviceEnded', handleServiceEnded as EventListener);
    };
  }, []);

  const handleStartService = async () => {
    const session = await startService(contactId);
    if (session) {
      onServiceStart?.();
    }
  };

  const handleEndService = async () => {
    const completedSession = await endService();
    if (completedSession && completedSession.duration) {
      onServiceEnd?.(completedSession.duration);
    }
  };

  const handlePauseService = async () => {
    await pauseService();
  };

  const handleResumeService = async () => {
    await resumeService();
  };

  const todayStats = getTodayStats();

  return (
    <div className={`service-timer-widget ${className}`}>
      <div className="service-timer-header">
        <div className="service-timer-title">
          <span className="timer-icon">🕐</span>
          <h3>Service Tracking</h3>
        </div>
        <div className="service-timer-subtitle">
          Melayani: <strong>{contactName}</strong>
        </div>
      </div>

      <div className="service-timer-content">
        {!activeSession ? (
          // Start Service State
          <div className="timer-start-state">
            <div className="timer-display-placeholder">
              <span className="timer-text">00:00</span>
              <span className="timer-label">Siap untuk memulai pelayanan</span>
            </div>
            
            <button
              onClick={handleStartService}
              disabled={isLoading || !canStart}
              className="service-btn start-btn"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Memulai...
                </>
              ) : (
                <>
                  <span className="btn-icon">▶️</span>
                  Mulai Pelayanan
                </>
              )}
            </button>
          </div>
        ) : (
          // Active Service State
          <div className="timer-active-state">
            <div className="timer-display">
              <div className="timer-main">
                <span className="timer-text">{formatElapsedTime()}</span>
                <div className={`timer-status ${isActive ? 'active' : 'paused'}`}>
                  {isActive && <div className="pulse-indicator"></div>}
                  <span className="status-text">
                    {isActive ? 'Sedang Melayani' : 'Dijeda'}
                  </span>
                </div>
              </div>
            </div>

            <div className="timer-controls">
              {isActive ? (
                <>
                  <button
                    onClick={handlePauseService}
                    disabled={isLoading || !canPause}
                    className="service-btn pause-btn"
                  >
                    <span className="btn-icon">⏸️</span>
                    Jeda
                  </button>
                  

                  
                  <button
                    onClick={handleEndService}
                    disabled={isLoading || !canEnd}
                    className="service-btn end-btn"
                  >
                    <span className="btn-icon">⏹️</span>
                    Selesai
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleResumeService}
                    disabled={isLoading || !canResume}
                    className="service-btn resume-btn"
                  >
                    <span className="btn-icon">▶️</span>
                    Lanjutkan
                  </button>
                  
                  <button
                    onClick={handleEndService}
                    disabled={isLoading}
                    className="service-btn end-btn"
                  >
                    <span className="btn-icon">⏹️</span>
                    Selesai
                  </button>
                </>
              )}
            </div>


          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="timer-notification">
            <span className="notification-icon">ℹ️</span>
            <span className="notification-text">{notification}</span>
            <button 
              onClick={() => setNotification(null)}
              className="notification-close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Today's Stats */}
        <div className="timer-stats">
          <div className="stats-item">
            <span className="stats-label">Hari ini:</span>
            <span className="stats-value">{todayStats.formattedTime}</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Sesi:</span>
            <span className="stats-value">{todayStats.sessionCount}</span>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="timer-emergency-actions">
          <button
            onClick={() => {
              const recovered = triggerRecovery();
              if (recovered.length === 0) {
                setNotification('No sessions to recover');
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className="emergency-btn recovery-btn"
            title="Manually trigger session recovery"
          >
            🔄 Recovery
          </button>
          
          <button
            onClick={() => {
              const completed = forceCompleteAllSessions();
              if (completed.length > 0) {
                setNotification(`Force completed ${completed.length} active sessions`);
                setTimeout(() => setNotification(null), 5000);
              } else {
                setNotification('No active sessions to complete');
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className="emergency-btn force-complete-btn"
            title="Force complete all active sessions"
          >
            ⚠️ Force Stop All
          </button>
        </div>
      </div>
    </div>
  );
};