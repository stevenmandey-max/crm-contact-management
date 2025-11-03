import type { ServiceSession } from '../types';
import { serviceStorage } from './serviceStorage';

class ServiceSessionStorageService {
  private readonly STORAGE_KEY = 'crm_service_sessions';

  // Get all service sessions
  getSessions(): ServiceSession[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const sessions = JSON.parse(data);
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }));
    } catch (error) {
      console.error('Error loading service sessions:', error);
      return [];
    }
  }

  // Save sessions to localStorage
  private saveSessions(sessions: ServiceSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving service sessions:', error);
    }
  }

  // Start a new service session
  startSession(contactId: string, userId: string): ServiceSession {
    const now = new Date();
    const session: ServiceSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contactId,
      userId,
      startTime: now,
      status: 'active',
      serviceDate: now.toISOString().split('T')[0], // YYYY-MM-DD
      serviceHour: now.getHours()
    };

    const sessions = this.getSessions();
    
    // Auto-stop any existing active sessions for this user and save them as completed services
    const completedSessions: ServiceSession[] = [];
    const updatedSessions = sessions.map(s => {
      if (s.userId === userId && s.status === 'active') {
        const endTime = now;
        const durationInSeconds = Math.floor((endTime.getTime() - s.startTime.getTime()) / 1000);
        const durationInMinutes = Math.round(durationInSeconds / 60);
        
        const completedSession = { 
          ...s, 
          status: 'completed' as const, 
          endTime, 
          duration: durationInSeconds 
        };
        
        completedSessions.push(completedSession);
        
        // Auto-create service entry for the stopped session if it has meaningful duration
        if (durationInMinutes > 0) {
          try {
            serviceStorage.addServiceEntry({
              contactId: s.contactId,
              userId: s.userId,
              date: s.serviceDate,
              duration: durationInMinutes,
              serviceType: 'Timer Session (Auto-stopped)',
              description: `Auto-stopped when starting new service (${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m)`
            });
            
            console.log(`Auto-stopped and recorded service for contact ${s.contactId}: ${durationInMinutes} minutes`);
          } catch (error) {
            console.error('Failed to create service entry for auto-stopped session:', error);
          }
        }
        
        return completedSession;
      }
      return s;
    });

    // Dispatch events for auto-stopped sessions
    completedSessions.forEach(completedSession => {
      window.dispatchEvent(new CustomEvent('serviceAutoStopped', {
        detail: { 
          session: completedSession,
          newContactId: contactId,
          userId: userId
        }
      }));
    });

    updatedSessions.push(session);
    this.saveSessions(updatedSessions);
    
    // Dispatch event for new session started
    window.dispatchEvent(new CustomEvent('serviceStarted', {
      detail: { session, autoStoppedCount: completedSessions.length }
    }));
    
    return session;
  }

  // End a service session
  endSession(sessionId: string): ServiceSession | null {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return null;

    const session = sessions[sessionIndex];
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
    const durationInMinutes = Math.round(durationInSeconds / 60);

    const updatedSession: ServiceSession = {
      ...session,
      endTime,
      duration: durationInSeconds,
      status: 'completed'
    };

    sessions[sessionIndex] = updatedSession;
    this.saveSessions(sessions);

    // Auto-create service entry in serviceStorage (Log Service)
    if (durationInMinutes > 0) {
      try {
        serviceStorage.addServiceEntry({
          contactId: session.contactId,
          userId: session.userId,
          date: session.serviceDate,
          duration: durationInMinutes,
          serviceType: 'Timer Session',
          description: `Automatic entry from service timer (${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m)`
        });

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('serviceAdded', {
          detail: { contactId: session.contactId, userId: session.userId }
        }));
      } catch (error) {
        console.error('Failed to create service entry from timer session:', error);
      }
    }

    // Dispatch event for service ended to sync all components
    window.dispatchEvent(new CustomEvent('serviceEnded', {
      detail: { 
        session: updatedSession,
        contactId: session.contactId,
        userId: session.userId,
        duration: durationInSeconds
      }
    }));

    return updatedSession;
  }

  // Get active session for a user
  getActiveSession(userId: string): ServiceSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.userId === userId && s.status === 'active') || null;
  }

  // Get all active sessions (for banner)
  getActiveSessions(): ServiceSession[] {
    const sessions = this.getSessions();
    return sessions.filter(s => s.status === 'active');
  }

  // Get active session for a specific contact
  getActiveSessionForContact(contactId: string, userId: string): ServiceSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => 
      s.contactId === contactId && 
      s.userId === userId && 
      s.status === 'active'
    ) || null;
  }

  // Get sessions for a contact
  getSessionsForContact(contactId: string): ServiceSession[] {
    const sessions = this.getSessions();
    return sessions
      .filter(s => s.contactId === contactId && s.status === 'completed')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Get sessions for a user
  getSessionsForUser(userId: string): ServiceSession[] {
    const sessions = this.getSessions();
    return sessions
      .filter(s => s.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Pause a session
  pauseSession(sessionId: string): ServiceSession | null {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return null;

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      status: 'paused'
    };

    this.saveSessions(sessions);
    return sessions[sessionIndex];
  }

  // Resume a paused session
  resumeSession(sessionId: string): ServiceSession | null {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return null;

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      status: 'active'
    };

    this.saveSessions(sessions);
    return sessions[sessionIndex];
  }

  // Get today's sessions for a user
  getTodaySessions(userId: string): ServiceSession[] {
    const today = new Date().toISOString().split('T')[0];
    const sessions = this.getSessions();
    
    return sessions.filter(s => 
      s.userId === userId && 
      s.serviceDate === today
    );
  }

  // Calculate total service time for today
  getTodayServiceTime(userId: string): number {
    const todaySessions = this.getTodaySessions(userId);
    return todaySessions.reduce((total, session) => {
      if (session.status === 'completed' && session.duration) {
        return total + session.duration;
      }
      return total;
    }, 0);
  }

  // Get service statistics
  getServiceStats(userId: string, days: number = 7): {
    totalSessions: number;
    totalTime: number; // in seconds
    averageTime: number; // in seconds
    contactsServed: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const sessions = this.getSessions().filter(s => 
      s.userId === userId && 
      s.status === 'completed' &&
      s.startTime >= cutoffDate
    );

    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const uniqueContacts = new Set(sessions.map(s => s.contactId)).size;

    return {
      totalSessions: sessions.length,
      totalTime,
      averageTime: sessions.length > 0 ? Math.round(totalTime / sessions.length) : 0,
      contactsServed: uniqueContacts
    };
  }

  // Recovery method: Check for orphaned active sessions and auto-complete them
  recoverOrphanedSessions(): ServiceSession[] {
    const sessions = this.getSessions();
    const now = new Date();
    const maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const recoveredSessions: ServiceSession[] = [];

    const updatedSessions = sessions.map(session => {
      // Check for sessions that have been active for too long (likely orphaned)
      if (session.status === 'active') {
        const sessionDuration = now.getTime() - session.startTime.getTime();
        
        if (sessionDuration > maxSessionDuration) {
          // Auto-complete orphaned session
          const durationInSeconds = Math.floor(sessionDuration / 1000);
          const durationInMinutes = Math.round(durationInSeconds / 60);
          
          const recoveredSession: ServiceSession = {
            ...session,
            status: 'completed',
            endTime: now,
            duration: durationInSeconds
          };
          
          recoveredSessions.push(recoveredSession);
          
          // Create service entry for recovered session
          if (durationInMinutes > 0) {
            try {
              serviceStorage.addServiceEntry({
                contactId: session.contactId,
                userId: session.userId,
                date: session.serviceDate,
                duration: Math.min(durationInMinutes, 480), // Cap at 8 hours
                serviceType: 'Timer Session (Recovered)',
                description: `Recovered from system crash/disconnect (${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m)`
              });
              
              console.log(`Recovered orphaned session for contact ${session.contactId}: ${durationInMinutes} minutes`);
            } catch (error) {
              console.error('Failed to create service entry for recovered session:', error);
            }
          }
          
          return recoveredSession;
        }
      }
      
      return session;
    });

    if (recoveredSessions.length > 0) {
      this.saveSessions(updatedSessions);
      
      // Dispatch recovery event
      window.dispatchEvent(new CustomEvent('sessionsRecovered', {
        detail: { recoveredSessions }
      }));
      
      console.log(`Recovered ${recoveredSessions.length} orphaned service sessions`);
    }

    return recoveredSessions;
  }

  // Initialize recovery check on app start
  initializeRecovery(): void {
    // Run recovery check immediately
    this.recoverOrphanedSessions();
    
    // Set up periodic recovery check (every 5 minutes)
    setInterval(() => {
      this.recoverOrphanedSessions();
    }, 5 * 60 * 1000);
    
    // Set up beforeunload handler to save active sessions
    window.addEventListener('beforeunload', () => {
      this.handleBeforeUnload();
    });
    
    // Set up visibility change handler for tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Check for recovery when tab becomes visible again
        setTimeout(() => {
          this.recoverOrphanedSessions();
        }, 1000);
      }
    });
  }

  // Handle browser close/refresh
  private handleBeforeUnload(): void {
    const activeSessions = this.getActiveSessions();
    
    if (activeSessions.length > 0) {
      // Mark sessions with last activity timestamp for recovery
      const sessions = this.getSessions();
      const updatedSessions = sessions.map(session => {
        if (session.status === 'active') {
          return {
            ...session,
            lastActivity: new Date()
          };
        }
        return session;
      });
      
      this.saveSessions(updatedSessions);
    }
  }

  // Force complete all active sessions (for emergency situations)
  forceCompleteAllActiveSessions(userId?: string): ServiceSession[] {
    const sessions = this.getSessions();
    const now = new Date();
    const completedSessions: ServiceSession[] = [];

    const updatedSessions = sessions.map(session => {
      if (session.status === 'active' && (!userId || session.userId === userId)) {
        const durationInSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
        const durationInMinutes = Math.round(durationInSeconds / 60);
        
        const completedSession: ServiceSession = {
          ...session,
          status: 'completed',
          endTime: now,
          duration: durationInSeconds
        };
        
        completedSessions.push(completedSession);
        
        // Create service entry
        if (durationInMinutes > 0) {
          try {
            serviceStorage.addServiceEntry({
              contactId: session.contactId,
              userId: session.userId,
              date: session.serviceDate,
              duration: durationInMinutes,
              serviceType: 'Timer Session (Force Completed)',
              description: `Force completed session (${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m)`
            });
          } catch (error) {
            console.error('Failed to create service entry for force completed session:', error);
          }
        }
        
        return completedSession;
      }
      
      return session;
    });

    if (completedSessions.length > 0) {
      this.saveSessions(updatedSessions);
      
      window.dispatchEvent(new CustomEvent('sessionsForceCompleted', {
        detail: { completedSessions }
      }));
    }

    return completedSessions;
  }
}

export const serviceSessionStorage = new ServiceSessionStorageService();