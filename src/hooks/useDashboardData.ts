import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  dashboardService, 
  type DashboardData, 
  type TimeRange,
  type ContactMetrics,
  type ServiceMetrics,
  type ContactDistribution,
  type TeamMetrics,
  type TrendData,
  type AlertItem
} from '../services/dashboardService';

// Hook for managing dashboard data with caching and error handling
export const useDashboardData = (timeRange: TimeRange = { type: 'month' }) => {
  const [data, setData] = useState<DashboardData>({
    contactMetrics: {
      newContactsThisMonth: 0,
      newContactsGrowth: 0,
      conversionRate: 0,
      activeContacts: 0,
      urgentContacts: 0,
      totalContacts: 0
    },
    serviceMetrics: {
      totalServiceHoursThisMonth: 0,
      serviceHoursGrowth: 0,
      activeServiceDays: 0,
      averageServiceTimePerContact: 0,
      serviceCoverage: 0,
      totalServiceSessions: 0
    },
    contactDistribution: {
      byStatus: [],
      byPriority: [],
      bySource: [],
      byProvince: []
    },
    teamMetrics: {
      mostActiveUser: { userId: '', username: 'N/A', serviceHours: 0 },
      topContactCreator: { userId: '', username: 'N/A', contactsCreated: 0 },
      userEfficiency: []
    },
    trends: {
      contactCreationTrend: [],
      serviceActivityTrend: [],
      statusProgressionTrend: []
    },
    alerts: [],
    isLoading: true,
    error: null,
    lastUpdated: new Date()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize the time range to prevent unnecessary re-fetches
  const memoizedTimeRange = useMemo(() => timeRange, [
    timeRange.type,
    timeRange.startDate?.getTime(),
    timeRange.endDate?.getTime()
  ]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
      } else {
        setIsRefreshing(true);
      }

      const dashboardData = await dashboardService.getDashboardData(memoizedTimeRange);
      
      setData(dashboardData);
      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [memoizedTimeRange]);

  // Retry mechanism for failed requests
  const retry = useCallback(async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      await fetchDashboardData();
    }
  }, [fetchDashboardData, retryCount]);

  // Refresh data manually
  const refresh = useCallback(async () => {
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!data.isLoading && !isRefreshing) {
        refresh();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refresh, data.isLoading, isRefreshing]);

  return {
    ...data,
    isRefreshing,
    retryCount,
    refresh,
    retry,
    canRetry: retryCount < 3
  };
};

// Hook specifically for contact metrics
export const useContactMetrics = (timeRange: TimeRange = { type: 'month' }) => {
  const [metrics, setMetrics] = useState<ContactMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contactMetrics = await dashboardService.calculateContactMetrics(timeRange);
      setMetrics(contactMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contact metrics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics
  };
};

// Hook specifically for service metrics
export const useServiceMetrics = (timeRange: TimeRange = { type: 'month' }) => {
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const serviceMetrics = await dashboardService.calculateServiceMetrics(timeRange);
      setMetrics(serviceMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load service metrics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics
  };
};

// Hook for team metrics
export const useTeamMetrics = (timeRange: TimeRange = { type: 'month' }) => {
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const teamMetrics = await dashboardService.calculateTeamPerformance(timeRange);
      setMetrics(teamMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team metrics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics
  };
};

// Hook for alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const alertItems = await dashboardService.generateAlerts();
      setAlerts(alertItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh alerts every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchAlerts();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchAlerts, isLoading]);

  return {
    alerts,
    isLoading,
    error,
    refresh: fetchAlerts,
    criticalAlerts: alerts.filter(alert => alert.severity === 'critical'),
    highAlerts: alerts.filter(alert => alert.severity === 'high'),
    totalAlerts: alerts.length
  };
};

// Hook for contact distribution
export const useContactDistribution = () => {
  const [distribution, setDistribution] = useState<ContactDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contactDistribution = await dashboardService.calculateContactDistribution();
      setDistribution(contactDistribution);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contact distribution';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  return {
    distribution,
    isLoading,
    error,
    refresh: fetchDistribution
  };
};

// Hook for trend data
export const useTrendData = (timeRange: TimeRange = { type: 'month' }) => {
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const trendData = await dashboardService.calculateTrends(timeRange);
      setTrends(trendData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trend data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    trends,
    isLoading,
    error,
    refresh: fetchTrends
  };
};

// Utility hook for time range management
export const useTimeRange = (initialRange: TimeRange = { type: 'month' }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);

  const updateTimeRange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange);
  }, []);

  const setPresetRange = useCallback((type: TimeRange['type']) => {
    setTimeRange({ type });
  }, []);

  const setCustomRange = useCallback((startDate: Date, endDate: Date) => {
    setTimeRange({
      type: 'custom',
      startDate,
      endDate
    });
  }, []);

  return {
    timeRange,
    updateTimeRange,
    setPresetRange,
    setCustomRange
  };
};