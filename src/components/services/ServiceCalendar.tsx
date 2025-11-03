import React, { useState, useEffect, useCallback } from 'react';
import { serviceStorage } from '../../services/serviceStorage';
import type { ServiceEntry } from '../../types';
import './ServiceCalendar.css';

interface ServiceCalendarProps {
  contactId: string;
  onDateClick?: (date: string, services: ServiceEntry[]) => void;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasService: boolean;
  serviceCount: number;
  totalDuration: number;
  services: ServiceEntry[];
}

export const ServiceCalendar: React.FC<ServiceCalendarProps> = ({
  contactId,
  onDateClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [services, setServices] = useState<ServiceEntry[]>([]);

  // Load services for the contact
  const loadServices = useCallback(() => {
    const contactServices = serviceStorage.getServicesByContact(contactId);
    setServices(contactServices);
  }, [contactId]);

  // Generate calendar days for current month
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, currentMonth, 1);
    // Last day of the month
    const lastDay = new Date(year, currentMonth + 1, 0);
    
    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at the last day of the week containing the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Group services by date for quick lookup
    const servicesByDate = new Map<string, ServiceEntry[]>();
    services.forEach(service => {
      const dateKey = service.date;
      if (!servicesByDate.has(dateKey)) {
        servicesByDate.set(dateKey, []);
      }
      servicesByDate.get(dateKey)!.push(service);
    });
    

    
    // Generate all days in the calendar view
    const current = new Date(startDate);
    while (current <= endDate) {
      // Use local date formatting to avoid timezone issues
      const currentYear = current.getFullYear();
      const currentMonthNum = current.getMonth() + 1;
      const currentDay = current.getDate();
      const dateString = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      
      const dayServices = servicesByDate.get(dateString) || [];
      const totalDuration = dayServices.reduce((sum, service) => sum + service.duration, 0);
      

      
      const calendarDay: CalendarDay = {
        date: dateString,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === currentMonth,
        isToday: current.getTime() === today.getTime(),
        hasService: dayServices.length > 0,
        serviceCount: dayServices.length,
        totalDuration,
        services: dayServices
      };
      
      days.push(calendarDay);
      current.setDate(current.getDate() + 1);
    }
    
    setCalendarDays(days);
  }, [currentDate, services]);

  // Load services on mount and when contact changes
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Listen for service updates
  useEffect(() => {
    const handleServiceUpdate = () => {
      loadServices();
    };

    window.addEventListener('serviceAdded', handleServiceUpdate);
    window.addEventListener('serviceUpdated', handleServiceUpdate);
    window.addEventListener('serviceDeleted', handleServiceUpdate);

    return () => {
      window.removeEventListener('serviceAdded', handleServiceUpdate);
      window.removeEventListener('serviceUpdated', handleServiceUpdate);
      window.removeEventListener('serviceDeleted', handleServiceUpdate);
    };
  }, [loadServices]);

  // Generate calendar when services or current date changes
  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    if (day.hasService && onDateClick) {
      onDateClick(day.date, day.services);
    }
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
  };

  // Get month/year display
  const monthYearDisplay = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="service-calendar">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            onClick={goToPreviousMonth}
            className="nav-btn"
            title="Previous month"
          >
            ‹
          </button>
          <h3 className="month-year">{monthYearDisplay}</h3>
          <button 
            onClick={goToNextMonth}
            className="nav-btn"
            title="Next month"
          >
            ›
          </button>
        </div>
        <button 
          onClick={goToToday}
          className="today-btn"
        >
          Today
        </button>
      </div>

      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="week-day-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              !day.isCurrentMonth ? 'other-month' : ''
            } ${
              day.isToday ? 'today' : ''
            } ${
              day.hasService ? 'has-service' : ''
            }`}
            onClick={() => handleDayClick(day)}
            title={
              day.hasService 
                ? `${day.serviceCount} service${day.serviceCount > 1 ? 's' : ''}, ${formatDuration(day.totalDuration)}`
                : undefined
            }
          >
            <span className="day-number">{day.day}</span>
            {day.hasService && (
              <div className="service-indicator">
                <div className="service-dot"></div>
                <span className="service-count">{day.serviceCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot"></div>
          <span>Service day</span>
        </div>
        <div className="legend-item">
          <div className="legend-today"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};