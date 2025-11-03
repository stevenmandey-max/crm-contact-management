import type { ServiceEntry, ServiceMetrics, ServiceSummary, Contact } from '../types';
import { serviceStorage } from '../services/serviceStorage';

export class ServiceMetricsCalculator {
  // Calculate service metrics for a specific contact and user
  public static calculateUserServiceMetrics(contactId: string, userId: string): ServiceMetrics {
    const services = serviceStorage.getServicesByContactAndUser(contactId, userId);
    
    if (services.length === 0) {
      return {
        contactId,
        userId,
        serviceCount: 0,
        totalDuration: 0,
        firstService: new Date(),
        lastService: new Date(),
        averageDuration: 0,
        servicesThisMonth: 0,
        durationThisMonth: 0
      };
    }

    // Calculate unique service days
    const uniqueDates = new Set(services.map(service => service.date));
    const serviceCount = uniqueDates.size;

    // Calculate total duration
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);

    // Find first and last service dates
    const sortedServices = [...services].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstService = sortedServices[0].createdAt;
    const lastService = sortedServices[sortedServices.length - 1].createdAt;

    // Calculate average duration per service day
    const averageDuration = serviceCount > 0 ? Math.round(totalDuration / serviceCount) : 0;

    // Calculate this month's metrics
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthServices = services.filter(service => 
      new Date(service.createdAt) >= thisMonth
    );
    const thisMonthDates = new Set(thisMonthServices.map(service => service.date));
    const servicesThisMonth = thisMonthDates.size;
    const durationThisMonth = thisMonthServices.reduce((sum, service) => sum + service.duration, 0);

    return {
      contactId,
      userId,
      serviceCount,
      totalDuration,
      firstService,
      lastService,
      averageDuration,
      servicesThisMonth,
      durationThisMonth
    };
  }

  // Calculate comprehensive service summary for a contact
  public static calculateContactServiceSummary(contactId: string): ServiceSummary {
    const services = serviceStorage.getServicesByContact(contactId);
    
    if (services.length === 0) {
      return {
        contactId,
        totalServiceDays: 0,
        totalServiceHours: 0,
        activeUsers: 0,
        lastServiceDate: new Date(0),
        lastServiceUser: '',
        monthlyTrend: []
      };
    }

    // Calculate total unique service days
    const uniqueDates = new Set(services.map(service => service.date));
    const totalServiceDays = uniqueDates.size;

    // Calculate total duration in hours
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const totalServiceHours = Math.round((totalDuration / 60) * 100) / 100; // Convert to hours with 2 decimal places

    // Calculate active users
    const activeUsers = new Set(services.map(service => service.userId)).size;

    // Find last service info
    const sortedServices = [...services].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastService = sortedServices[0];

    // Calculate monthly trend
    const monthlyTrend = this.calculateMonthlyTrend(services);

    return {
      contactId,
      totalServiceDays,
      totalServiceHours,
      activeUsers,
      lastServiceDate: lastService.createdAt,
      lastServiceUser: lastService.userId,
      monthlyTrend
    };
  }

  // Calculate daily service summary for a specific date
  public static calculateDailyServiceSummary(contactId: string, date: string): {
    totalDuration: number;
    sessionCount: number;
    users: string[];
    services: ServiceEntry[];
  } {
    const services = serviceStorage.getServicesByContact(contactId)
      .filter(service => service.date === date);

    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const sessionCount = services.length;
    const users = Array.from(new Set(services.map(service => service.userId)));

    return {
      totalDuration,
      sessionCount,
      users,
      services
    };
  }

  // Calculate service statistics for analytics
  public static calculateServiceStatistics(services: ServiceEntry[]): {
    totalServices: number;
    totalDuration: number;
    averageDuration: number;
    uniqueContacts: number;
    uniqueUsers: number;
    servicesPerDay: number;
    durationPerDay: number;
  } {
    if (services.length === 0) {
      return {
        totalServices: 0,
        totalDuration: 0,
        averageDuration: 0,
        uniqueContacts: 0,
        uniqueUsers: 0,
        servicesPerDay: 0,
        durationPerDay: 0
      };
    }

    const totalServices = services.length;
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const averageDuration = Math.round(totalDuration / totalServices);
    
    const uniqueContacts = new Set(services.map(service => service.contactId)).size;
    const uniqueUsers = new Set(services.map(service => service.userId)).size;
    const uniqueDates = new Set(services.map(service => service.date)).size;

    const servicesPerDay = uniqueDates > 0 ? Math.round((totalServices / uniqueDates) * 100) / 100 : 0;
    const durationPerDay = uniqueDates > 0 ? Math.round((totalDuration / uniqueDates) * 100) / 100 : 0;

    return {
      totalServices,
      totalDuration,
      averageDuration,
      uniqueContacts,
      uniqueUsers,
      servicesPerDay,
      durationPerDay
    };
  }

  // Helper method to calculate monthly trend
  private static calculateMonthlyTrend(services: ServiceEntry[]): {
    month: string;
    serviceCount: number;
    duration: number;
  }[] {
    const monthlyData = new Map<string, { serviceCount: Set<string>; duration: number }>();

    // Initialize last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      months.push(monthKey);
      monthlyData.set(monthKey, { serviceCount: new Set(), duration: 0 });
    }

    // Aggregate service data by month
    services.forEach(service => {
      const monthKey = service.date.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        data.serviceCount.add(service.date);
        data.duration += service.duration;
      }
    });

    // Convert to array format
    return months.map(month => ({
      month,
      serviceCount: monthlyData.get(month)!.serviceCount.size,
      duration: monthlyData.get(month)!.duration
    }));
  }

  // Update contact with service summary
  public static updateContactWithServiceSummary(contact: Contact): Contact {
    const serviceSummary = this.calculateContactServiceSummary(contact.id);
    
    return {
      ...contact,
      totalServiceDays: serviceSummary.totalServiceDays,
      totalServiceHours: serviceSummary.totalServiceHours,
      lastServiceDate: serviceSummary.lastServiceDate.getTime() > 0 ? serviceSummary.lastServiceDate : undefined,
      lastServiceUser: serviceSummary.lastServiceUser || undefined
    };
  }

  // Batch update all contacts with service summaries
  public static updateAllContactsWithServiceSummaries(contacts: Contact[]): Contact[] {
    return contacts.map(contact => this.updateContactWithServiceSummary(contact));
  }

  // Get top performing users by service metrics
  public static getTopPerformingUsers(limit: number = 10): {
    userId: string;
    totalServices: number;
    totalDuration: number;
    uniqueContacts: number;
    averageDuration: number;
  }[] {
    const services = serviceStorage.getAllServices();
    const userMetrics = new Map<string, {
      totalServices: number;
      totalDuration: number;
      uniqueContacts: Set<string>;
      serviceDays: Set<string>;
    }>();

    // Aggregate metrics by user
    services.forEach(service => {
      if (!userMetrics.has(service.userId)) {
        userMetrics.set(service.userId, {
          totalServices: 0,
          totalDuration: 0,
          uniqueContacts: new Set(),
          serviceDays: new Set()
        });
      }

      const metrics = userMetrics.get(service.userId)!;
      metrics.totalServices++;
      metrics.totalDuration += service.duration;
      metrics.uniqueContacts.add(service.contactId);
      metrics.serviceDays.add(`${service.contactId}-${service.date}`);
    });

    // Convert to array and calculate final metrics
    const userPerformance = Array.from(userMetrics.entries()).map(([userId, metrics]) => ({
      userId,
      totalServices: metrics.serviceDays.size, // Unique service days
      totalDuration: metrics.totalDuration,
      uniqueContacts: metrics.uniqueContacts.size,
      averageDuration: metrics.serviceDays.size > 0 ? Math.round(metrics.totalDuration / metrics.serviceDays.size) : 0
    }));

    // Sort by total service days and return top performers
    return userPerformance
      .sort((a, b) => b.totalServices - a.totalServices)
      .slice(0, limit);
  }
}

// Export utility functions
export const calculateServiceMetrics = ServiceMetricsCalculator.calculateUserServiceMetrics;
export const calculateContactServiceSummary = ServiceMetricsCalculator.calculateContactServiceSummary;
export const calculateDailyServiceSummary = ServiceMetricsCalculator.calculateDailyServiceSummary;
export const updateContactWithServiceSummary = ServiceMetricsCalculator.updateContactWithServiceSummary;