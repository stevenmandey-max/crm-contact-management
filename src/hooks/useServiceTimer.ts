import { useState, useEffect, useCallback } from 'react';
import type { ServiceSession } from '../types';
import { serviceSessionStorage } from '../services/serviceSessionStorage';
import { useAuth } from './useAuth';

export const useServiceTimer = (contactId?: string) => {
  const { currentUser } = useAuth();
  const [activeSession, setActiveSession] = useState<ServiceSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load active session on mount and initialize recovery
  useEffect(() => {
    if (!currentUser) return;

    // Initialize recovery system
    serviceSessionStorage.initializeRecovery();

    const session = contactId 
      ? serviceSessionStorage.getActiveSessionForContact(contactId, currentUser.username)
      : serviceSessionStorage.getActiveSession(currentUser.username);
    
    setActiveSession(session);
    
    if (session) {
      const elapsed = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }

    // Listen for recovery events
    const handleSessionsRecovered = (event: CustomEvent) => {
      const { recoveredSessions } = event.detail;
      console.log('Sessions recovered:', recoveredSessions);
      
      // Show notification to user
      if (recoveredSessions.length > 0) {
        const message = `${recoveredSessions.length} service session(s) recovered from system interruption`;
        // You can replace this with a proper notification system
        console.info(message);
      }
    };

    const handleServiceAutoStopped = (event: CustomEvent) => {
      const { session } = event.detail;
      console.log('Service auto-stopped:', session);
      
      // Show notification about auto-stopped service
      const durationMinutes = Math.round((session.duration || 0) / 60);
      if (durationMinutes > 0) {
        const message = `Previous service (${durationMinutes}m) auto-stopped and recorded`;
        console.info(message);
      }
    };

    const handleServiceEnded = (event: CustomEvent) => {
      const { session, contactId: endedContactId } = event.detail;
      console.log('Service ended:', session);
      
      // If this is the session for our contact, update state
      if (!contactId || endedContactId === contactId) {
        setActiveSession(null);
        setElapsedTime(0);
      }
    };

    const handleServiceStarted = (event: CustomEvent) => {
      const { session } = event.detail;
      console.log('Service started:', session);
      
      // If this is a session for our contact, update state
      if (!contactId || session.contactId === contactId) {
        setActiveSession(session);
        setElapsedTime(0);
      }
    };

    window.addEventListener('sessionsRecovered', handleSessionsRecovered as EventListener);
    window.addEventListener('serviceAutoStopped', handleServiceAutoStopped as EventListener);
    window.addEventListener('serviceEnded', handleServiceEnded as EventListener);
    window.addEventListener('serviceStarted', handleServiceStarted as EventListener);

    return () => {
      window.removeEventListener('sessionsRecovered', handleSessionsRecovered as EventListener);
      window.removeEventListener('serviceAutoStopped', handleServiceAutoStopped as EventListener);
      window.removeEventListener('serviceEnded', handleServiceEnded as EventListener);
      window.removeEventListener('serviceStarted', handleServiceStarted as EventListener);
    };
  }, [currentUser, contactId]);

  // Update elapsed time every second for active sessions
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Start service session
  const startService = useCallback(async (targetContactId?: string) => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    
    try {
      const session = serviceSessionStorage.startSession(
        targetContactId || contactId || '', 
        currentUser.username
      );
      
      setActiveSession(session);
      setElapsedTime(0);
      
      return session;
    } catch (error) {
      console.error('Error starting service:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, contactId]);

  // End service session
  const endService = useCallback(async () => {
    if (!activeSession || !currentUser) return null;
    
    setIsLoading(true);
    
    try {
      const completedSession = serviceSessionStorage.endSession(activeSession.id);
      
      setActiveSession(null);
      setElapsedTime(0);
      
      return completedSession;
    } catch (error) {
      console.error('Error ending service:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, currentUser]);

  // Pause service session
  const pauseService = useCallback(async () => {
    if (!activeSession) return null;
    
    try {
      const pausedSession = serviceSessionStorage.pauseSession(activeSession.id);
      setActiveSession(pausedSession);
      return pausedSession;
    } catch (error) {
      console.error('Error pausing service:', error);
      return null;
    }
  }, [activeSession]);

  // Resume service session
  const resumeService = useCallback(async () => {
    if (!activeSession) return null;
    
    try {
      const resumedSession = serviceSessionStorage.resumeSession(activeSession.id);
      setActiveSession(resumedSession);
      return resumedSession;
    } catch (error) {
      console.error('Error resuming service:', error);
      return null;
    }
  }, [activeSession]);

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get service history for contact
  const getServiceHistory = useCallback(() => {
    if (!contactId) return [];
    return serviceSessionStorage.getSessionsForContact(contactId);
  }, [contactId]);

  // Get today's stats
  const getTodayStats = useCallback(() => {
    if (!currentUser) return { totalTime: 0, sessionCount: 0 };
    
    const todaySessions = serviceSessionStorage.getTodaySessions(currentUser.username);
    const totalTime = serviceSessionStorage.getTodayServiceTime(currentUser.username);
    
    return {
      totalTime,
      sessionCount: todaySessions.length,
      formattedTime: formatElapsedTime(totalTime)
    };
  }, [currentUser, formatElapsedTime]);

  // Force complete all active sessions (emergency function)
  const forceCompleteAllSessions = useCallback(() => {
    if (!currentUser) return [];
    
    const completedSessions = serviceSessionStorage.forceCompleteAllActiveSessions(currentUser.username);
    
    if (completedSessions.length > 0) {
      setActiveSession(null);
      setElapsedTime(0);
      
      console.log(`Force completed ${completedSessions.length} active sessions`);
    }
    
    return completedSessions;
  }, [currentUser]);

  // Manual recovery trigger
  const triggerRecovery = useCallback(() => {
    const recoveredSessions = serviceSessionStorage.recoverOrphanedSessions();
    
    if (recoveredSessions.length > 0) {
      // Refresh active session state
      if (currentUser) {
        const session = contactId 
          ? serviceSessionStorage.getActiveSessionForContact(contactId, currentUser.username)
          : serviceSessionStorage.getActiveSession(currentUser.username);
        
        setActiveSession(session);
        
        if (session) {
          const elapsed = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
          setElapsedTime(elapsed);
        } else {
          setElapsedTime(0);
        }
      }
    }
    
    return recoveredSessions;
  }, [currentUser, contactId]);

  return {
    // State
    activeSession,
    elapsedTime,
    isLoading,
    isActive: activeSession?.status === 'active',
    isPaused: activeSession?.status === 'paused',
    
    // Actions
    startService,
    endService,
    pauseService,
    resumeService,
    
    // Recovery & Emergency Actions
    forceCompleteAllSessions,
    triggerRecovery,
    
    // Utilities
    formatElapsedTime: () => formatElapsedTime(elapsedTime),
    getServiceHistory,
    getTodayStats,
    
    // Computed values
    canStart: !activeSession && !!currentUser,
    canEnd: !!activeSession && activeSession.status === 'active',
    canPause: !!activeSession && activeSession.status === 'active',
    canResume: !!activeSession && activeSession.status === 'paused'
  };
};