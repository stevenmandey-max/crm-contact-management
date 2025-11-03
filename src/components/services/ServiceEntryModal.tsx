import React, { useEffect, useCallback } from 'react';
import { ServiceEntryForm } from './ServiceEntryForm';
import type { ServiceEntry } from '../../types';
import './ServiceEntryModal.css';

interface ServiceEntryModalProps {
  isOpen: boolean;
  contactId: string;
  contactName: string;
  onClose: () => void;
  onServiceLogged: (service: ServiceEntry) => void;
}

export const ServiceEntryModal: React.FC<ServiceEntryModalProps> = ({
  isOpen,
  contactId,
  contactName,
  onClose,
  onServiceLogged
}) => {
  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle service logged
  const handleServiceLogged = useCallback((service: ServiceEntry) => {
    onServiceLogged(service);
    onClose();
  }, [onServiceLogged, onClose]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="service-modal-overlay" onClick={handleBackdropClick}>
      <div className="service-modal-container">
        <div className="service-modal-header">
          <div className="modal-title">
            <h2>Log Service</h2>
            <p>Contact: <strong>{contactName}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        <div className="service-modal-content">
          <ServiceEntryForm
            contactId={contactId}
            onServiceLogged={handleServiceLogged}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};