import React from 'react';
import type { ContactMetrics } from '../../services/dashboardService';
import './ContactPipelineCard.css';

interface ContactPipelineCardProps {
  metrics: ContactMetrics;
  isLoading: boolean;
  onCardClick?: (metric: string) => void;
}

export const ContactPipelineCard: React.FC<ContactPipelineCardProps> = ({
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

  if (isLoading) {
    return (
      <div className="contact-pipeline-card loading">
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
    <div className="contact-pipeline-card">
      <div className="card-header">
        <h3>Contact Pipeline</h3>
        <span className="card-icon" role="img" aria-label="Contacts">👥</span>
      </div>
      
      <div className="card-content">
        {/* New Contacts This Month */}
        <div 
          className="metric-item clickable"
          onClick={() => handleMetricClick('new_contacts')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('new_contacts');
            }
          }}
          aria-label={`New contacts this month: ${metrics.newContactsThisMonth}`}
        >
          <span className="metric-label">New Contacts This Month</span>
          <div className="metric-value">
            <span className="value">{metrics.newContactsThisMonth}</span>
            {formatGrowth(metrics.newContactsGrowth)}
          </div>
        </div>

        {/* Conversion Rate */}
        <div 
          className="metric-item clickable"
          onClick={() => handleMetricClick('conversion_rate')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('conversion_rate');
            }
          }}
          aria-label={`Conversion rate: ${metrics.conversionRate}%`}
        >
          <span className="metric-label">Conversion Rate</span>
          <div className="metric-value">
            <span className="value">{metrics.conversionRate}%</span>
            <div className="conversion-bar">
              <div 
                className="conversion-fill"
                style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Active Contacts */}
        <div 
          className="metric-item clickable"
          onClick={() => handleMetricClick('active_contacts')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('active_contacts');
            }
          }}
          aria-label={`Active contacts: ${metrics.activeContacts}`}
        >
          <span className="metric-label">Active Contacts</span>
          <div className="metric-value">
            <span className="value">{metrics.activeContacts}</span>
            <span className="metric-subtitle">In Progress + Follow Up</span>
          </div>
        </div>

        {/* Urgent Contacts */}
        <div 
          className={`metric-item urgent clickable ${metrics.urgentContacts > 0 ? 'has-urgent' : ''}`}
          onClick={() => handleMetricClick('urgent_contacts')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMetricClick('urgent_contacts');
            }
          }}
          aria-label={`Urgent contacts: ${metrics.urgentContacts}`}
        >
          <span className="metric-label">
            <span className="urgent-icon">🚨</span>
            Urgent Contacts
          </span>
          <div className="metric-value">
            <span className="value">{metrics.urgentContacts}</span>
            {metrics.urgentContacts > 0 && (
              <span className="urgent-badge">Needs Attention</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer with Total */}
      <div className="card-footer">
        <div className="total-contacts">
          <span className="total-label">Total Contacts:</span>
          <span className="total-value">{metrics.totalContacts}</span>
        </div>
      </div>
    </div>
  );
};