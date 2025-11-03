import React, { useState, useMemo } from 'react';
import { useDashboardData, useTimeRange } from '../../hooks/useDashboardData';
import type { TimeRange } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import { ContactPipelineCard } from './ContactPipelineCard';
import { ServicePerformanceCard } from './ServicePerformanceCard';
import { filterDashboardData } from '../../utils/dataFilters';
import './Dashboard.css';

interface DashboardProps {
  className?: string;
  onNavigate?: (view: string, filters?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ className, onNavigate }) => {
  const { currentUser } = useAuth();
  const { timeRange, setPresetRange, setCustomRange } = useTimeRange();
  const rawDashboardData = useDashboardData(timeRange);
  
  // Filter dashboard data based on user permissions
  const dashboardData = useMemo(() => {
    return filterDashboardData(rawDashboardData, currentUser);
  }, [rawDashboardData, currentUser]);

  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleTimeRangeChange = (newType: TimeRange['type']) => {
    if (newType === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setPresetRange(newType);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setCustomRange(new Date(customStartDate), new Date(customEndDate));
      setShowCustomDatePicker(false);
    }
  };

  // Navigation handlers for drill-down functionality
  const handleContactMetricClick = (metric: string) => {
    if (!onNavigate) return;

    switch (metric) {
      case 'new_contacts':
        onNavigate('contacts', { 
          dateRange: timeRange,
          filter: 'new_this_month'
        });
        break;
      case 'conversion_rate':
        onNavigate('contacts', { 
          statusFilter: ['Completed'],
          showConversionAnalysis: true
        });
        break;
      case 'active_contacts':
        onNavigate('contacts', { 
          statusFilter: ['In Progress', 'Follow Up']
        });
        break;
      case 'urgent_contacts':
        onNavigate('contacts', { 
          priorityFilter: ['Urgent'],
          statusFilter: ['New Contact', 'In Progress', 'Follow Up']
        });
        break;
      default:
        onNavigate('contacts');
    }
  };

  const handleServiceMetricClick = (metric: string) => {
    if (!onNavigate) return;

    switch (metric) {
      case 'service_hours':
        onNavigate('service-tracking', { 
          dateRange: timeRange,
          view: 'hours_analysis'
        });
        break;
      case 'active_days':
        onNavigate('service-tracking', { 
          dateRange: timeRange,
          view: 'daily_activity'
        });
        break;
      case 'avg_time':
        onNavigate('service-tracking', { 
          view: 'efficiency_analysis'
        });
        break;
      case 'coverage':
        onNavigate('service-tracking', { 
          view: 'coverage_analysis'
        });
        break;
      default:
        onNavigate('service-tracking');
    }
  };

  const handleAlertClick = (alertType: string) => {
    if (!onNavigate) return;

    switch (alertType) {
      case 'stale_contacts':
        onNavigate('contacts', { 
          filter: 'stale',
          daysInactive: 30
        });
        break;
      case 'overdue_followups':
        onNavigate('contacts', { 
          statusFilter: ['Follow Up'],
          filter: 'overdue',
          daysOverdue: 7
        });
        break;
      case 'urgent_pending':
        onNavigate('contacts', { 
          priorityFilter: ['Urgent'],
          statusFilter: ['New Contact', 'Follow Up']
        });
        break;
      case 'service_gaps':
        onNavigate('contacts', { 
          statusFilter: ['In Progress'],
          filter: 'no_recent_service',
          daysWithoutService: 14
        });
        break;
      default:
        onNavigate('contacts');
    }
  };

  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (dashboardData.error) {
    return (
      <div className={`dashboard ${className || ''}`}>
        <div className="dashboard-error">
          <div className="error-content">
            <h2>⚠️ Error Loading Dashboard</h2>
            <p>{dashboardData.error}</p>
            {dashboardData.canRetry && (
              <button onClick={dashboardData.retry} className="btn btn-primary">
                Retry ({3 - dashboardData.retryCount} attempts left)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${className || ''}`}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Dashboard</h1>
            <p>Welcome back, {currentUser?.username || 'User'}!</p>
            {!dashboardData.isLoading && (
              <span className="last-updated">
                Last updated: {formatLastUpdated(dashboardData.lastUpdated)}
                {dashboardData.isRefreshing && <span className="refreshing"> • Refreshing...</span>}
              </span>
            )}
          </div>
          
          <div className="header-controls">
            {/* Time Period Selector */}
            <div className="time-range-selector">
              <label htmlFor="timeRange">Time Period:</label>
              <select
                id="timeRange"
                value={timeRange.type}
                onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange['type'])}
                disabled={dashboardData.isLoading || dashboardData.isRefreshing}
              >
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              {dashboardData.isRefreshing && (
                <span className="loading-indicator">Updating...</span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={dashboardData.refresh}
              disabled={dashboardData.isLoading || dashboardData.isRefreshing}
              className="refresh-btn"
              title="Refresh Dashboard"
            >
              {dashboardData.isRefreshing ? '🔄' : '↻'}
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {showCustomDatePicker && (
          <div className="custom-date-picker">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="date-actions">
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateApply}
                disabled={!customStartDate || !customEndDate}
                className="btn btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {dashboardData.isLoading ? (
          <div className="dashboard-loading">
            <div className="loading-grid">
              {/* Hero Metrics Skeleton */}
              <div className="hero-metrics-skeleton">
                <div className="skeleton-card large"></div>
                <div className="skeleton-card large"></div>
              </div>
              
              {/* Secondary Metrics Skeleton */}
              <div className="secondary-metrics-skeleton">
                <div className="skeleton-card medium"></div>
                <div className="skeleton-card medium"></div>
              </div>
              
              {/* Charts Skeleton */}
              <div className="charts-skeleton">
                <div className="skeleton-card chart"></div>
                <div className="skeleton-card chart"></div>
              </div>
              
              {/* Alerts Skeleton */}
              <div className="alerts-skeleton">
                <div className="skeleton-card small"></div>
                <div className="skeleton-card small"></div>
                <div className="skeleton-card small"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* Hero Metrics Section */}
            <section className="hero-metrics-section">
              <div className="section-header">
                <h2>Key Performance Indicators</h2>
              </div>
              <div className="hero-metrics-grid">
                <ContactPipelineCard
                  metrics={dashboardData.contactMetrics}
                  isLoading={dashboardData.isLoading}
                  onCardClick={handleContactMetricClick}
                />
                <ServicePerformanceCard
                  metrics={dashboardData.serviceMetrics}
                  isLoading={dashboardData.isLoading}
                  onCardClick={handleServiceMetricClick}
                />
              </div>
            </section>

            {/* Alerts Section */}
            {dashboardData.alerts.length > 0 && (
              <section className="alerts-section">
                <div className="section-header">
                  <h2>Action Required</h2>
                  <span className="alert-count">{dashboardData.alerts.length} items</span>
                </div>
                <div className="alerts-grid">
                  {dashboardData.alerts.slice(0, 4).map((alert: any) => (
                    <div key={alert.id} className={`alert-card ${alert.severity}`}>
                      <div className="alert-header">
                        <span className="alert-title">{alert.title}</span>
                        <span className="alert-count">{alert.count}</span>
                      </div>
                      <p className="alert-description">{alert.description}</p>
                      <button 
                        className="alert-action"
                        onClick={() => handleAlertClick(alert.type)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Placeholder for future sections */}
            <section className="coming-soon-section">
              <div className="coming-soon-card">
                <h3>📊 Advanced Analytics</h3>
                <p>Detailed charts and trend analysis coming soon...</p>
              </div>
              <div className="coming-soon-card">
                <h3>👥 Team Performance</h3>
                <p>Individual and team metrics coming soon...</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};