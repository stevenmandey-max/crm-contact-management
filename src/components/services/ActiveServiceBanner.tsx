import React, { useState, useEffect } from 'react';
import { serviceSessionStorage } from '../../services/serviceSessionStorage';
import { localStorageService } from '../../services/localStorage';
import { useAuth } from '../../hooks/useAuth';
import type { ServiceSession, Contact } from '../../types';
import './ActiveServiceBanner.css';

interface ActiveServiceBannerProps {
  onReturnToService: (contactId: string) => void;
}

export const ActiveServiceBanner: React.FC<ActiveServiceBannerProps> = ({
  onReturnToService
}) => {
  const [activeSession, setActiveSession] = useState<ServiceSession | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const { currentUser } = useAuth();

  // Check for active sessions
  useEffect(() => {
    const checkActiveSession = () => {
      if (!currentUser) return;
      
      const currentActiveSession = serviceSessionStorage.getActiveSession(currentUser.username);
      
      if (currentActiveSession) {
        setActiveSession(currentActiveSession);
        
        // Get contact info
        const contactInfo = localStorageService.getContactById(currentActiveSession.contactId);
        setContact(contactInfo);
        
        // Calculate duration
        const now = new Date();
        const startTime = new Date(currentActiveSession.startTime);
        const durationInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setDuration(durationInSeconds);
      } else {
        setActiveSession(null);
        setContact(null);
        setDuration(0);
      }
    };

    // Initial check
    checkActiveSession();

    // Update every second
    const interval = setInterval(checkActiveSession, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Format duration to HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get warning level based on duration
  const getWarningLevel = (seconds: number): 'normal' | 'warning' | 'critical' => {
    if (seconds > 3600) return 'critical'; // > 1 hour
    if (seconds > 1800) return 'warning';  // > 30 minutes
    return 'normal';
  };

  const handleReturnToService = () => {
    if (activeSession) {
      onReturnToService(activeSession.contactId);
    }
  };

  const handleEndService = () => {
    if (activeSession && window.confirm('Apakah Anda yakin ingin mengakhiri pelayanan ini?')) {
      serviceSessionStorage.endSession(activeSession.id);
      setActiveSession(null);
      setContact(null);
      setDuration(0);
    }
  };

  // Don't render if no active session
  if (!activeSession || !contact) {
    return null;
  }

  const warningLevel = getWarningLevel(duration);

  return (
    <div className={`active-service-banner ${warningLevel} ${isMinimized ? 'minimized' : ''}`}>
      <div className="banner-content">
        {!isMinimized && (
          <>
            <div className="service-info">
              <div className="service-status">
                <span className="status-indicator">🔴</span>
                <span className="status-text">Pelayanan Aktif</span>
              </div>
              
              <div className="contact-info">
                <span className="contact-name">{contact.nama}</span>
                <span className="contact-phone">{contact.nomorTelepon}</span>
              </div>
              
              <div className="service-duration">
                <span className="duration-label">Durasi:</span>
                <span className="duration-time">{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="banner-actions">
              <button
                onClick={handleReturnToService}
                className="btn btn-primary btn-sm"
                title="Kembali ke Service Mode"
              >
                <span>🚀</span>
                Kembali ke Pelayanan
              </button>
              
              <button
                onClick={handleEndService}
                className="btn btn-danger btn-sm"
                title="Akhiri Pelayanan"
              >
                <span>⏹️</span>
                Akhiri
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="minimize-btn"
          title={isMinimized ? 'Expand Banner' : 'Minimize Banner'}
        >
          {isMinimized ? (
            <>
              <span className="status-indicator-mini">🔴</span>
              <span className="duration-mini">{formatDuration(duration)}</span>
              <span>▲</span>
            </>
          ) : (
            <span>▼</span>
          )}
        </button>
      </div>

      {warningLevel === 'warning' && !isMinimized && (
        <div className="warning-message">
          ⚠️ Pelayanan sudah berjalan lebih dari 30 menit
        </div>
      )}

      {warningLevel === 'critical' && !isMinimized && (
        <div className="critical-message">
          🚨 Pelayanan sudah berjalan lebih dari 1 jam! Pertimbangkan untuk mengakhiri.
        </div>
      )}
    </div>
  );
};