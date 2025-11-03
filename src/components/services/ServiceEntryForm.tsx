import React, { useState, useCallback } from 'react';
import { serviceStorage } from '../../services/serviceStorage';
import { QUICK_DURATION_OPTIONS, SERVICE_VALIDATION_RULES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import type { ServiceEntry } from '../../types';
import './ServiceEntryForm.css';

interface ServiceEntryFormProps {
  contactId: string;
  onServiceLogged: (service: ServiceEntry) => void;
  onCancel: () => void;
  initialDate?: Date;
}

interface FormData {
  duration: string;
  customDuration: string;
  date: string;
}

export const ServiceEntryForm: React.FC<ServiceEntryFormProps> = ({
  contactId,
  onServiceLogged,
  onCancel,
  initialDate = new Date()
}) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  
  // Helper function to format date consistently
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<FormData>({
    duration: '',
    customDuration: '',
    date: formatDateForInput(initialDate)
  });

  // Handle quick duration selection
  const handleQuickDuration = useCallback((minutes: number) => {
    setFormData(prev => ({ ...prev, duration: String(minutes) }));
    setUseCustomDuration(false);
    setErrors(prev => ({ ...prev, duration: '' }));
  }, []);

  // Handle custom duration toggle
  const handleCustomDurationToggle = useCallback(() => {
    setUseCustomDuration(prev => {
      const newValue = !prev;
      if (newValue) {
        setFormData(prev => ({ ...prev, duration: '' }));
      } else {
        setFormData(prev => ({ ...prev, customDuration: '' }));
      }
      return newValue;
    });
    setErrors(prev => ({ ...prev, duration: '' }));
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate duration
    const durationValue = useCustomDuration ? 
      parseInt(formData.customDuration) : 
      parseInt(formData.duration);

    if (!durationValue || isNaN(durationValue) || durationValue <= 0) {
      newErrors.duration = 'Please select or enter a valid duration';
    } else if (durationValue > SERVICE_VALIDATION_RULES.maxDurationPerSession) {
      newErrors.duration = `Duration cannot exceed ${SERVICE_VALIDATION_RULES.maxDurationPerSession / 60} hours per session`;
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = 'Service date is required';
    } else {
      const serviceDate = new Date(formData.date);
      const today = new Date();
      const maxPastDate = new Date();
      maxPastDate.setDate(today.getDate() - SERVICE_VALIDATION_RULES.maxPastDate);

      if (serviceDate > today) {
        newErrors.date = 'Cannot log services for future dates';
      } else if (serviceDate < maxPastDate) {
        newErrors.date = `Cannot log services older than ${SERVICE_VALIDATION_RULES.maxPastDate} days`;
      }
    }

    // Check daily duration limit
    if (!newErrors.duration && !newErrors.date && durationValue) {
      try {
        const existingServices = serviceStorage.getServicesByDate(formData.date).filter(s => 
          s.contactId === contactId && 
          s.userId === currentUser?.id
        );
        
        const dailyDuration = existingServices.reduce((total, s) => total + s.duration, 0) + durationValue;
        
        if (dailyDuration > SERVICE_VALIDATION_RULES.maxDurationPerDay) {
          newErrors.duration = `Total daily service duration cannot exceed ${SERVICE_VALIDATION_RULES.maxDurationPerDay / 60} hours`;
        }
      } catch (error) {
        console.error('Error validating daily duration:', error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const durationValue = useCustomDuration ? 
        parseInt(formData.customDuration) : 
        parseInt(formData.duration);

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const serviceData = {
        contactId,
        userId: currentUser.id,
        date: formData.date,
        duration: durationValue
      };

      const newService = serviceStorage.addServiceEntry(serviceData);
      onServiceLogged(newService);
      
      // Reset form
      setFormData({
        duration: '',
        customDuration: '',
        date: formatDateForInput(new Date())
      });
      setUseCustomDuration(false);
      
    } catch (error) {
      console.error('Error logging service:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to log service' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <form onSubmit={handleSubmit} className="service-entry-form">
      <div className="form-header">
        <h3>Log Service Activity</h3>
        <p>Record time spent serving this contact</p>
      </div>

      {errors.submit && (
        <div className="error-banner">
          {errors.submit}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          Service Date <span className="required">*</span>
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className={`form-input ${errors.date ? 'error' : ''}`}
          disabled={isSubmitting}
          max={formatDateForInput(new Date())} // Prevent future dates
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">
          Service Duration <span className="required">*</span>
        </label>
        
        {!useCustomDuration && (
          <div className="quick-duration-buttons">
            {QUICK_DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleQuickDuration(option.value)}
                className={`duration-btn ${
                  formData.duration === String(option.value) ? 'active' : ''
                }`}
                disabled={isSubmitting}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {useCustomDuration && (
          <div className="custom-duration-input">
            <input
              type="number"
              value={formData.customDuration}
              onChange={(e) => handleInputChange('customDuration', e.target.value)}
              className={`form-input ${errors.duration ? 'error' : ''}`}
              placeholder="Enter minutes"
              min="1"
              max={SERVICE_VALIDATION_RULES.maxDurationPerSession}
              disabled={isSubmitting}
            />
            <span className="input-suffix">minutes</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleCustomDurationToggle}
          className="toggle-custom-btn"
          disabled={isSubmitting}
        >
          {useCustomDuration ? 'Use Quick Options' : 'Enter Custom Duration'}
        </button>

        {errors.duration && <span className="error-message">{errors.duration}</span>}
        
        {(formData.duration || formData.customDuration) && (
          <div className="duration-preview">
            Duration: {formatDuration(
              useCustomDuration ? 
                parseInt(formData.customDuration) || 0 : 
                parseInt(formData.duration) || 0
            )}
          </div>
        )}
      </div>



      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging Service...' : 'Log Service'}
        </button>
      </div>
    </form>
  );
};