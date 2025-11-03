import type { 
  ContactStatus, 
  Priority, 
  Sumber
} from '../types';
import { localStorageService } from './localStorage';
import { serviceStorage } from './serviceStorage';

// Dashboard-specific interfaces
export interface TimeRange {
  type: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface ContactMetrics {
  newContactsThisMonth: number;
  newContactsGrowth: number; // percentage change
  conversionRate: number; // percentage
  activeContacts: number;
  urgentContacts: number;
  totalContacts: number;
}

export interface ServiceMetrics {
  totalServiceHoursThisMonth: number;
  serviceHoursGrowth: number; // percentage change
  activeServiceDays: number;
  averageServiceTimePerContact: number; // in minutes
  serviceCoverage: number; // percentage
  totalServiceSessions: number;
}

export interface ContactDistribution {
  byStatus: Array<{
    status: ContactStatus;
    count: number;
    percentage: number;
  }>;
  byPriority: Array<{
    priority: Priority;
    count: number;
    percentage: number;
  }>;
  bySource: Array<{
    source: Sumber;
    count: number;
    percentage: number;
  }>;
  byProvince: Array<{
    province: string;
    count: number;
    percentage: number;
  }>;
}

export interface TeamMetrics {
  mostActiveUser: {
    userId: string;
    username: string;
    serviceHours: number;
  };
  topContactCreator: {
    userId: string;
    username: string;
    contactsCreated: number;
  };
  userEfficiency: Array<{
    userId: string;
    username: string;
    averageServiceTime: number;
    totalServices: number;
  }>;
}

export interface TrendData {
  contactCreationTrend: Array<{
    month: string;
    count: number;
    growth: number;
  }>;
  serviceActivityTrend: Array<{
    date: string;
    serviceHours: number;
    sessionCount: number;
  }>;
  statusProgressionTrend: Array<{
    month: string;
    newToProgress: number; // days average
    progressToComplete: number; // days average
  }>;
}

export interface AlertItem {
  id: string;
  type: 'stale_contacts' | 'overdue_followups' | 'urgent_pending' | 'service_gaps';
  title: string;
  description: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionUrl: string;
  createdAt: Date;
}

export interface DashboardData {
  contactMetrics: ContactMetrics;
  serviceMetrics: ServiceMetrics;
  contactDistribution: ContactDistribution;
  teamMetrics: TeamMetrics;
  trends: TrendData;
  alerts: AlertItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
}

class DashboardService {
  // Helper method to get date range based on TimeRange type
  private getDateRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;

    switch (timeRange.type) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        startDate = timeRange.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { startDate, endDate: timeRange.endDate || endDate };
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    return { startDate, endDate };
  }



  // Calculate contact metrics
  async calculateContactMetrics(timeRange: TimeRange = { type: 'month' }): Promise<ContactMetrics> {
    try {
      const contacts = localStorageService.getContacts();
      const { startDate, endDate } = this.getDateRange(timeRange);
      
      // Calculate previous period for comparison
      const periodDuration = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodDuration);
      const previousEndDate = new Date(startDate.getTime() - 1); // End just before current period starts

      // New contacts in current period
      const newContactsThisPeriod = contacts.filter(contact => {
        const createdAt = new Date(contact.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      }).length;

      // New contacts in previous period
      const newContactsPreviousPeriod = contacts.filter(contact => {
        const createdAt = new Date(contact.createdAt);
        return createdAt >= previousStartDate && createdAt <= previousEndDate;
      }).length;

      // Calculate growth percentage
      const newContactsGrowth = newContactsPreviousPeriod > 0 
        ? Math.round(((newContactsThisPeriod - newContactsPreviousPeriod) / newContactsPreviousPeriod) * 100)
        : newContactsThisPeriod > 0 ? 100 : 0;

      // Conversion rate (completed contacts / total contacts)
      const completedContacts = contacts.filter(contact => contact.statusKontak === 'Completed').length;
      const conversionRate = contacts.length > 0 
        ? Math.round((completedContacts / contacts.length) * 100)
        : 0;

      // Active contacts (In Progress or Follow Up)
      const activeContacts = contacts.filter(contact => 
        contact.statusKontak === 'In Progress' || contact.statusKontak === 'Follow Up'
      ).length;

      // Urgent contacts that are not completed
      const urgentContacts = contacts.filter(contact => 
        contact.prioritas === 'Urgent' && contact.statusKontak !== 'Completed'
      ).length;

      return {
        newContactsThisMonth: newContactsThisPeriod,
        newContactsGrowth,
        conversionRate,
        activeContacts,
        urgentContacts,
        totalContacts: contacts.length
      };
    } catch (error) {
      console.error('Error calculating contact metrics:', error);
      throw new Error('Failed to calculate contact metrics');
    }
  }

  // Calculate service metrics
  async calculateServiceMetrics(timeRange: TimeRange = { type: 'month' }): Promise<ServiceMetrics> {
    try {
      const services = serviceStorage.getAllServices();
      const contacts = localStorageService.getContacts();
      const { startDate, endDate } = this.getDateRange(timeRange);
      
      // Calculate previous period for comparison
      const periodDuration = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodDuration);
      const previousEndDate = new Date(startDate.getTime() - 1);

      // Filter services for current period
      const currentPeriodServices = services.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= startDate && serviceDate <= endDate;
      });

      // Filter services for previous period
      const previousPeriodServices = services.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= previousStartDate && serviceDate <= previousEndDate;
      });

      // Total service hours this period (convert minutes to hours)
      const totalServiceMinutesThisPeriod = currentPeriodServices.reduce((sum, service) => sum + service.duration, 0);
      const totalServiceHoursThisPeriod = Math.round((totalServiceMinutesThisPeriod / 60) * 100) / 100;

      // Total service hours previous period
      const totalServiceMinutesPreviousPeriod = previousPeriodServices.reduce((sum, service) => sum + service.duration, 0);
      const totalServiceHoursPreviousPeriod = Math.round((totalServiceMinutesPreviousPeriod / 60) * 100) / 100;

      // Calculate growth percentage
      const serviceHoursGrowth = totalServiceHoursPreviousPeriod > 0 
        ? Math.round(((totalServiceHoursThisPeriod - totalServiceHoursPreviousPeriod) / totalServiceHoursPreviousPeriod) * 100)
        : totalServiceHoursThisPeriod > 0 ? 100 : 0;

      // Active service days (unique dates with service activity)
      const uniqueServiceDates = new Set(currentPeriodServices.map(service => service.date));
      const activeServiceDays = uniqueServiceDates.size;

      // Average service time per contact
      const contactsWithService = new Set(currentPeriodServices.map(service => service.contactId));
      const averageServiceTimePerContact = contactsWithService.size > 0 
        ? Math.round(totalServiceMinutesThisPeriod / contactsWithService.size)
        : 0;

      // Service coverage (percentage of contacts that have received service)
      const serviceCoverage = contacts.length > 0 
        ? Math.round((contactsWithService.size / contacts.length) * 100)
        : 0;

      return {
        totalServiceHoursThisMonth: totalServiceHoursThisPeriod,
        serviceHoursGrowth,
        activeServiceDays,
        averageServiceTimePerContact,
        serviceCoverage,
        totalServiceSessions: currentPeriodServices.length
      };
    } catch (error) {
      console.error('Error calculating service metrics:', error);
      throw new Error('Failed to calculate service metrics');
    }
  }

  // Calculate contact distribution
  async calculateContactDistribution(): Promise<ContactDistribution> {
    try {
      const contacts = localStorageService.getContacts();
      const totalContacts = contacts.length;

      // Distribution by status
      const statusCounts = new Map<ContactStatus, number>();
      const priorityCounts = new Map<Priority, number>();
      const sourceCounts = new Map<Sumber, number>();
      const provinceCounts = new Map<string, number>();

      contacts.forEach(contact => {
        // Count by status
        statusCounts.set(contact.statusKontak, (statusCounts.get(contact.statusKontak) || 0) + 1);
        
        // Count by priority
        priorityCounts.set(contact.prioritas, (priorityCounts.get(contact.prioritas) || 0) + 1);
        
        // Count by source
        sourceCounts.set(contact.sumber, (sourceCounts.get(contact.sumber) || 0) + 1);
        
        // Count by province
        provinceCounts.set(contact.provinsi, (provinceCounts.get(contact.provinsi) || 0) + 1);
      });

      // Convert to arrays with percentages
      const byStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0
      }));

      const byPriority = Array.from(priorityCounts.entries()).map(([priority, count]) => ({
        priority,
        count,
        percentage: totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0
      }));

      // Get top 3 sources
      const bySource = Array.from(sourceCounts.entries())
        .map(([source, count]) => ({
          source,
          count,
          percentage: totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Get top provinces
      const byProvince = Array.from(provinceCounts.entries())
        .map(([province, count]) => ({
          province,
          count,
          percentage: totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        byStatus,
        byPriority,
        bySource,
        byProvince
      };
    } catch (error) {
      console.error('Error calculating contact distribution:', error);
      throw new Error('Failed to calculate contact distribution');
    }
  }

  // Calculate team performance metrics
  async calculateTeamPerformance(timeRange: TimeRange = { type: 'month' }): Promise<TeamMetrics> {
    try {
      const services = serviceStorage.getAllServices();
      const contacts = localStorageService.getContacts();
      const users = localStorageService.getUsers();
      const { startDate, endDate } = this.getDateRange(timeRange);

      // Filter services for current period
      const currentPeriodServices = services.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= startDate && serviceDate <= endDate;
      });

      // Calculate user service hours
      const userServiceHours = new Map<string, number>();
      const userServiceCounts = new Map<string, number>();

      currentPeriodServices.forEach(service => {
        const currentHours = userServiceHours.get(service.userId) || 0;
        const currentCount = userServiceCounts.get(service.userId) || 0;
        
        userServiceHours.set(service.userId, currentHours + (service.duration / 60));
        userServiceCounts.set(service.userId, currentCount + 1);
      });

      // Find most active user
      let mostActiveUser = {
        userId: '',
        username: 'N/A',
        serviceHours: 0
      };

      for (const [userId, hours] of userServiceHours.entries()) {
        if (hours > mostActiveUser.serviceHours) {
          const user = users.find(u => u.id === userId);
          mostActiveUser = {
            userId,
            username: user?.username || 'Unknown',
            serviceHours: Math.round(hours * 100) / 100
          };
        }
      }

      // Calculate contact creation by user for current period
      const userContactCounts = new Map<string, number>();
      contacts.forEach(contact => {
        const createdAt = new Date(contact.createdAt);
        if (createdAt >= startDate && createdAt <= endDate) {
          const currentCount = userContactCounts.get(contact.createdBy) || 0;
          userContactCounts.set(contact.createdBy, currentCount + 1);
        }
      });

      // Find top contact creator
      let topContactCreator = {
        userId: '',
        username: 'N/A',
        contactsCreated: 0
      };

      for (const [userId, count] of userContactCounts.entries()) {
        if (count > topContactCreator.contactsCreated) {
          const user = users.find(u => u.id === userId);
          topContactCreator = {
            userId,
            username: user?.username || 'Unknown',
            contactsCreated: count
          };
        }
      }

      // Calculate user efficiency (average service time)
      const userEfficiency = Array.from(userServiceHours.entries()).map(([userId, totalHours]) => {
        const user = users.find(u => u.id === userId);
        const serviceCount = userServiceCounts.get(userId) || 0;
        const averageServiceTime = serviceCount > 0 ? Math.round((totalHours * 60) / serviceCount) : 0;

        return {
          userId,
          username: user?.username || 'Unknown',
          averageServiceTime,
          totalServices: serviceCount
        };
      }).sort((a, b) => b.totalServices - a.totalServices);

      return {
        mostActiveUser,
        topContactCreator,
        userEfficiency
      };
    } catch (error) {
      console.error('Error calculating team performance:', error);
      throw new Error('Failed to calculate team performance');
    }
  }

  // Generate alerts for actionable items
  async generateAlerts(): Promise<AlertItem[]> {
    try {
      const contacts = localStorageService.getContacts();
      const services = serviceStorage.getAllServices();
      const now = new Date();
      const alerts: AlertItem[] = [];

      // Stale contacts (no activity > 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const staleContacts = contacts.filter(contact => {
        const lastUpdate = new Date(contact.updatedAt);
        return lastUpdate < thirtyDaysAgo && contact.statusKontak !== 'Completed';
      });

      if (staleContacts.length > 0) {
        alerts.push({
          id: 'stale_contacts',
          type: 'stale_contacts',
          title: 'Stale Contacts',
          description: `${staleContacts.length} contacts have no activity for more than 30 days`,
          count: staleContacts.length,
          severity: staleContacts.length > 10 ? 'high' : 'medium',
          actionUrl: '/contacts?filter=stale',
          createdAt: now
        });
      }

      // Overdue follow-ups (Follow Up status > 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const overdueFollowups = contacts.filter(contact => {
        const lastUpdate = new Date(contact.updatedAt);
        return contact.statusKontak === 'Follow Up' && lastUpdate < sevenDaysAgo;
      });

      if (overdueFollowups.length > 0) {
        alerts.push({
          id: 'overdue_followups',
          type: 'overdue_followups',
          title: 'Overdue Follow-ups',
          description: `${overdueFollowups.length} contacts in Follow Up status for more than 7 days`,
          count: overdueFollowups.length,
          severity: overdueFollowups.length > 5 ? 'critical' : 'high',
          actionUrl: '/contacts?filter=overdue_followup',
          createdAt: now
        });
      }

      // Urgent contacts not in progress
      const urgentPending = contacts.filter(contact => 
        contact.prioritas === 'Urgent' && 
        contact.statusKontak !== 'In Progress' && 
        contact.statusKontak !== 'Completed'
      );

      if (urgentPending.length > 0) {
        alerts.push({
          id: 'urgent_pending',
          type: 'urgent_pending',
          title: 'Urgent Contacts Pending',
          description: `${urgentPending.length} urgent priority contacts are not in progress`,
          count: urgentPending.length,
          severity: 'critical',
          actionUrl: '/contacts?filter=urgent_pending',
          createdAt: now
        });
      }

      // Service gaps (contacts without recent service)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const recentServices = new Set(
        services
          .filter(service => new Date(service.date) >= fourteenDaysAgo)
          .map(service => service.contactId)
      );

      const contactsWithoutRecentService = contacts.filter(contact => 
        contact.statusKontak === 'In Progress' && !recentServices.has(contact.id)
      );

      if (contactsWithoutRecentService.length > 0) {
        alerts.push({
          id: 'service_gaps',
          type: 'service_gaps',
          title: 'Service Gaps',
          description: `${contactsWithoutRecentService.length} active contacts without service in 14 days`,
          count: contactsWithoutRecentService.length,
          severity: 'medium',
          actionUrl: '/contacts?filter=service_gaps',
          createdAt: now
        });
      }

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw new Error('Failed to generate alerts');
    }
  }

  // Calculate trend data
  async calculateTrends(): Promise<TrendData> {
    try {
      const contacts = localStorageService.getContacts();
      const services = serviceStorage.getAllServices();

      // Contact creation trend (last 6 months)
      const contactCreationTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthContacts = contacts.filter(contact => {
          const createdAt = new Date(contact.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        const prevMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);
        const prevMonthContacts = contacts.filter(contact => {
          const createdAt = new Date(contact.createdAt);
          return createdAt >= prevMonthStart && createdAt <= prevMonthEnd;
        }).length;

        const growth = prevMonthContacts > 0 
          ? Math.round(((monthContacts - prevMonthContacts) / prevMonthContacts) * 100)
          : monthContacts > 0 ? 100 : 0;

        contactCreationTrend.push({
          month: date.toISOString().slice(0, 7), // YYYY-MM format
          count: monthContacts,
          growth
        });
      }

      // Service activity trend (last 30 days)
      const serviceActivityTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        const dayServices = services.filter(service => service.date === dateStr);
        const serviceHours = Math.round((dayServices.reduce((sum, service) => sum + service.duration, 0) / 60) * 100) / 100;

        serviceActivityTrend.push({
          date: dateStr,
          serviceHours,
          sessionCount: dayServices.length
        });
      }

      // Status progression trend (simplified - average days in each status)
      const statusProgressionTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        // This is a simplified calculation - in a real system you'd track status changes
        statusProgressionTrend.push({
          month: date.toISOString().slice(0, 7),
          newToProgress: 3, // Average days from New to In Progress
          progressToComplete: 7 // Average days from In Progress to Complete
        });
      }

      return {
        contactCreationTrend,
        serviceActivityTrend,
        statusProgressionTrend
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      throw new Error('Failed to calculate trends');
    }
  }

  // Main method to get all dashboard data
  async getDashboardData(timeRange: TimeRange = { type: 'month' }): Promise<DashboardData> {
    try {
      const [
        contactMetrics,
        serviceMetrics,
        contactDistribution,
        teamMetrics,
        trends,
        alerts
      ] = await Promise.all([
        this.calculateContactMetrics(timeRange),
        this.calculateServiceMetrics(timeRange),
        this.calculateContactDistribution(),
        this.calculateTeamPerformance(timeRange),
        this.calculateTrends(),
        this.generateAlerts()
      ]);

      return {
        contactMetrics,
        serviceMetrics,
        contactDistribution,
        teamMetrics,
        trends,
        alerts,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();