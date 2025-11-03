import type { ServiceEntry, ServiceMetrics, ServiceSummary } from '../types';
import { SERVICE_STORAGE_KEYS, SERVICE_VALIDATION_RULES } from '../utils/constants';
import { generateId } from '../utils/helpers';

export class ServiceStorage {
  private static instance: ServiceStorage;

  private constructor() {}

  public static getInstance(): ServiceStorage {
    if (!ServiceStorage.instance) {
      ServiceStorage.instance = new ServiceStorage();
    }
    return ServiceStorage.instance;
  }

  // Service Entry CRUD Operations
  public addServiceEntry(serviceEntry: Omit<ServiceEntry, 'id' | 'createdAt' | 'updatedAt'>): ServiceEntry {
    const newService: ServiceEntry = {
      ...serviceEntry,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate service entry
    this.validateServiceEntry(newService);

    const services = this.getAllServices();
    services.push(newService);
    this.saveServices(services);

    // Update metrics after adding service
    this.updateServiceMetrics(serviceEntry.contactId, serviceEntry.userId);

    return newService;
  }

  public getAllServices(): ServiceEntry[] {
    try {
      const servicesData = localStorage.getItem(SERVICE_STORAGE_KEYS.SERVICES);
      if (!servicesData) return [];

      const services = JSON.parse(servicesData);
      return services.map((service: any) => ({
        ...service,
        createdAt: new Date(service.createdAt),
        updatedAt: new Date(service.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading services:', error);
      return [];
    }
  }

  public getServicesByContact(contactId: string): ServiceEntry[] {
    return this.getAllServices().filter(service => service.contactId === contactId);
  }

  public getServicesByUser(userId: string): ServiceEntry[] {
    return this.getAllServices().filter(service => service.userId === userId);
  }

  public getServicesByDate(date: string): ServiceEntry[] {
    return this.getAllServices().filter(service => service.date === date);
  }

  public getServicesByContactAndUser(contactId: string, userId: string): ServiceEntry[] {
    return this.getAllServices().filter(
      service => service.contactId === contactId && service.userId === userId
    );
  }

  public updateServiceEntry(serviceId: string, updates: Partial<ServiceEntry>): ServiceEntry | null {
    const services = this.getAllServices();
    const serviceIndex = services.findIndex(service => service.id === serviceId);

    if (serviceIndex === -1) {
      return null;
    }

    const updatedService = {
      ...services[serviceIndex],
      ...updates,
      updatedAt: new Date()
    };

    // Validate updated service
    this.validateServiceEntry(updatedService);

    services[serviceIndex] = updatedService;
    this.saveServices(services);

    // Update metrics after editing service
    this.updateServiceMetrics(updatedService.contactId, updatedService.userId);

    return updatedService;
  }

  public deleteServiceEntry(serviceId: string): boolean {
    const services = this.getAllServices();
    const serviceIndex = services.findIndex(service => service.id === serviceId);

    if (serviceIndex === -1) {
      return false;
    }

    const deletedService = services[serviceIndex];
    services.splice(serviceIndex, 1);
    this.saveServices(services);

    // Update metrics after deleting service
    this.updateServiceMetrics(deletedService.contactId, deletedService.userId);

    return true;
  }

  // Service Metrics Operations
  public getServiceMetrics(contactId: string, userId: string): ServiceMetrics | null {
    const services = this.getServicesByContactAndUser(contactId, userId);
    if (services.length === 0) return null;

    return this.calculateServiceMetrics(contactId, userId, services);
  }

  public getAllServiceMetrics(): ServiceMetrics[] {
    const services = this.getAllServices();
    const metricsMap = new Map<string, ServiceMetrics>();

    // Group services by contact and user
    services.forEach(service => {
      const key = `${service.contactId}-${service.userId}`;
      if (!metricsMap.has(key)) {
        const metrics = this.calculateServiceMetrics(
          service.contactId,
          service.userId,
          this.getServicesByContactAndUser(service.contactId, service.userId)
        );
        metricsMap.set(key, metrics);
      }
    });

    return Array.from(metricsMap.values());
  }

  public getContactServiceSummary(contactId: string): ServiceSummary {
    const services = this.getServicesByContact(contactId);
    const uniqueDates = new Set(services.map(service => service.date));
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const activeUsers = new Set(services.map(service => service.userId)).size;

    // Get last service info
    const sortedServices = services.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastService = sortedServices[0];

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = this.calculateMonthlyTrend(services);

    return {
      contactId,
      totalServiceDays: uniqueDates.size,
      totalServiceHours: Math.round((totalDuration / 60) * 100) / 100, // Convert to hours with 2 decimal places
      activeUsers,
      lastServiceDate: lastService ? lastService.createdAt : new Date(0),
      lastServiceUser: lastService ? lastService.userId : '',
      monthlyTrend
    };
  }

  // Private helper methods
  private saveServices(services: ServiceEntry[]): void {
    try {
      localStorage.setItem(SERVICE_STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (error) {
      console.error('Error saving services:', error);
      throw new Error('Failed to save service data');
    }
  }

  private validateServiceEntry(service: ServiceEntry): void {
    const rules = SERVICE_VALIDATION_RULES;

    // Validate duration - allow 0 duration for WhatsApp Chat services
    if (service.duration < 0) {
      throw new Error('Service duration cannot be negative');
    }
    
    if (service.duration === 0 && service.serviceType !== 'WhatsApp Chat') {
      throw new Error('Service duration must be greater than 0 for non-chat services');
    }

    if (service.duration > rules.maxDurationPerSession) {
      throw new Error(`Service duration cannot exceed ${rules.maxDurationPerSession} minutes per session`);
    }

    // Validate date
    const serviceDate = new Date(service.date);
    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setDate(today.getDate() - rules.maxPastDate);

    if (serviceDate > today) {
      throw new Error('Cannot log services for future dates');
    }

    if (serviceDate < maxPastDate) {
      throw new Error(`Cannot log services older than ${rules.maxPastDate} days`);
    }

    // Validate daily duration limit (exclude WhatsApp Chat services from duration limits)
    if (service.serviceType !== 'WhatsApp Chat') {
      const dailyServices = this.getServicesByDate(service.date).filter(
        s => s.contactId === service.contactId && s.userId === service.userId && s.id !== service.id && s.serviceType !== 'WhatsApp Chat'
      );
      const dailyDuration = dailyServices.reduce((sum, s) => sum + s.duration, 0) + service.duration;

      if (dailyDuration > rules.maxDurationPerDay) {
        throw new Error(`Total daily service duration cannot exceed ${rules.maxDurationPerDay} minutes`);
      }
    }
  }

  private calculateServiceMetrics(contactId: string, userId: string, services: ServiceEntry[]): ServiceMetrics {
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
    const sortedServices = services.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstService = sortedServices[0].createdAt;
    const lastService = sortedServices[sortedServices.length - 1].createdAt;

    // Calculate average duration per service day
    const averageDuration = Math.round(totalDuration / serviceCount);

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

  private calculateMonthlyTrend(services: ServiceEntry[]): { month: string; serviceCount: number; duration: number; }[] {
    const monthlyData = new Map<string, { serviceCount: Set<string>; duration: number }>();

    // Get last 6 months
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

  private updateServiceMetrics(contactId: string, userId: string): void {
    // This method can be used to trigger metric recalculation
    // For now, metrics are calculated on-demand
    // In the future, we might want to cache calculated metrics
  }

  // Utility methods
  public clearAllServices(): void {
    localStorage.removeItem(SERVICE_STORAGE_KEYS.SERVICES);
    localStorage.removeItem(SERVICE_STORAGE_KEYS.SERVICE_METRICS);
  }

  public exportServiceData(): { services: ServiceEntry[]; metrics: ServiceMetrics[] } {
    return {
      services: this.getAllServices(),
      metrics: this.getAllServiceMetrics()
    };
  }

  public importServiceData(data: { services: ServiceEntry[] }): void {
    // Validate imported data
    data.services.forEach(service => this.validateServiceEntry(service));
    
    // Save imported services
    this.saveServices(data.services);
  }

  public initializeDemoServiceData(): void {
    // Only initialize if no services exist
    const existingServices = this.getAllServices();
    if (existingServices.length > 0) return;

    console.log('Initializing demo service data...');

    // Demo service entries for the last 30 days
    const demoServices: Omit<ServiceEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const today = new Date();
    
    // Demo contact IDs (should match demo contacts)
    const demoContactIds = ['demo-1', 'demo-2', 'demo-3', 'demo-4'];
    const users = ['admin', 'editor'];
    const serviceTypes = ['Konseling', 'Follow Up', 'Konsultasi', 'Terapi', 'Assessment'];
    const descriptions = [
      'Sesi konseling individual',
      'Follow up progress klien',
      'Konsultasi masalah keluarga',
      'Terapi trauma',
      'Assessment awal',
      'Sesi lanjutan',
      'Evaluasi progress',
      'Konseling kelompok'
    ];

    // Generate services for the last 30 days
    for (let i = 0; i < 30; i++) {
      const serviceDate = new Date(today);
      serviceDate.setDate(today.getDate() - i);
      
      // Skip weekends for some realism
      if (serviceDate.getDay() === 0 || serviceDate.getDay() === 6) continue;
      
      // Random number of services per day (0-3)
      const servicesPerDay = Math.floor(Math.random() * 4);
      
      for (let j = 0; j < servicesPerDay; j++) {
        const contactId = demoContactIds[Math.floor(Math.random() * demoContactIds.length)];
        const userId = users[Math.floor(Math.random() * users.length)];
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        // Random duration between 30-180 minutes
        const duration = 30 + Math.floor(Math.random() * 151);
        
        demoServices.push({
          contactId,
          userId,
          date: serviceDate.toISOString().split('T')[0], // YYYY-MM-DD format
          duration,
          serviceType,
          description
        });
      }
    }

    // Add the demo services
    demoServices.forEach(service => {
      this.addServiceEntry(service);
    });

    console.log(`Added ${demoServices.length} demo service entries`);
  }
}

// Export singleton instance
export const serviceStorage = ServiceStorage.getInstance();