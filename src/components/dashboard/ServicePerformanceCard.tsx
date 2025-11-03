import React from 'react';
import type { ServiceMetrics } from '../../services/dashboardService';
import './ServicePerformanceCard.css';

interface ServicePerformanceCardProps {
  metrics: ServiceMetrics;
  isLoading: boolean;
  onCardClick?: (metric: string) => void;
}

export const ServicePerformanceCard: React.FC<ServicePerformanceCardProps> = ({
  metrics,
  isLoading,
  onCardClick
}) => {
  const handleMetricClick = (metric: string) => {
    if (onCardClick) {
      onCardClick(metric);
    }
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const icon = isPositive ? '↗' : '↘';
    const className = isPositive ? 'positive' : 'negative';
    
    return (
      <span className={`growth ${className}`}>
        {icon} {Math.abs(growth)}%
      </span>
    );
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="service-performance-card loading">
        <div className="card-header">
          <div className="skeleton-text title"></div>
          <div className="skeleton-icon"></div>
        </div>
        <div className="card-content">
          <div className="metric-item">
            <div className="skeleton-text label"></div>
            <div className="skeleton-text value"></div>
          </div>
          <div className="metric-item">
            <div className="skeleton-text label"></div>
            <div className="skeleton-text value"></div>
          </div>
          <div className="metric-item">
            <div className="skeleton-text label"></div>
            <div className="skeleton-text value"></div>
          </div>
          <div className="metric-item">
            <div className="skeleton-text label"></div>
            <div className="skeleton-text value"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-performance-card">
      <div className="card-header">
        <h3>Service Performance</h3>
        <span className="card-icon" role="img" aria-label="Performance">⚡</span>
      </div>
      
      <div className="card-content">
        {/* Service Hours This Month */}
        <div 
          className="metric-item clickable"
          onClick={() => handleMetricClick('service_hours')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('service_hours');
            }
          }}
          aria-label={`Service hours this month: ${metrics.totalServiceHoursThisMonth} hours`}
        >
          <span className="metric-label">Service Hours This Month</span>
          <div className="metric-value">
            <span className="value">{metrics.totalServiceHoursThisMonth}h</span>
            {formatGrowth(metrics.serviceHoursGrowth)}
          </div>
        </div>

        {/* Active Service Days */}
        <div 
          className="metric-item clickable"
          onClick={() => handleMetricClick('active_days')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('active_days');
            }
          }}
          aria-label={`Active service days: ${metrics.activeServiceDays} days`}
        >
          <span className="metric-label">Active Service Days</span>
          <div className="metric-value">
            <span className="value">{metrics.activeServiceDays}</span>
            <span className="metric-subtitle">Days with activity</span>
          </div>
        </div>

        {/* Average Service Time */}
        <div 
          className="metric-item clickable"
          onClick={() => handleMetricClick('avg_time')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('avg_time');
            }
          }}
          aria-label={`Average service time per contact: ${formatDuration(metrics.averageServiceTimePerContact)}`}
        >
          <span className="metric-label">Avg Service Time</span>
          <div className="metric-value">
            <span className="value">{formatDuration(metrics.averageServiceTimePerContact)}</span>
            <span className="metric-subtitle">Per contact</span>
          </div>
        </div>

        {/* Service Coverage */}
        <div 
          className="metric-item coverage clickable"
          onClick={() => handleMetricClick('coverage')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('coverage');
            }
          }}
          aria-label={`Service coverage: ${metrics.serviceCoverage}%`}
        >
          <span className="metric-label">
            <span className="coverage-icon">📊</span>
            Service Coverage
          </span>
          <div className="metric-value">
            <span className="value">{metrics.serviceCoverage}%</span>
            <div className="coverage-bar">
              <div 
                className="coverage-fill"
                style={{ width: `${Math.min(metrics.serviceCoverage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer with Sessions */}
      <div className="card-footer">
        <div className="session-info">
          <div className="session-stat">
            <span className="session-label">Total Sessions:</span>
            <span className="session-value">{metrics.totalServiceSessions}</span>
          </div>
          <div className="session-stat">
            <span className="session-label">Avg per Day:</span>
            <span className="session-value">
              {metrics.activeServiceDays > 0 
                ? Math.round((metrics.totalServiceSessions / metrics.activeServiceDays) * 10) / 10
                : 0
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};