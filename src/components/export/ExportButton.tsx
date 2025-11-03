import React, { useState } from 'react';
import type { Contact } from '../../types';
import { ExportModal } from './ExportModal';
import { useAuth } from '../../hooks/useAuth';
import './ExportButton.css';

interface ExportButtonProps {
  contacts: Contact[];
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  contacts,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState<{
    filename: string;
    timestamp: Date;
  } | null>(null);

  const { canExportData } = useAuth();

  const handleExportClick = () => {
    if (!canExportData()) {
      alert('You do not have permission to export data');
      return;
    }

    if (contacts.length === 0) {
      alert('No contacts available to export');
      return;
    }

    setIsModalOpen(true);
  };

  const handleExportComplete = (filename: string) => {
    setLastExportInfo({
      filename,
      timestamp: new Date()
    });
    
    // Show success message
    const message = `Export completed successfully!\nFile: ${filename}`;
    alert(message);
  };

  const getButtonText = () => {
    switch (variant) {
      case 'icon':
        return '';
      case 'secondary':
        return 'Export';
      default:
        return `Export ${contacts.length} Contacts`;
    }
  };

  const getButtonIcon = () => {
    return '📥';
  };

  const isDisabled = disabled || !canExportData() || contacts.length === 0;

  return (
    <>
      <button
        onClick={handleExportClick}
        disabled={isDisabled}
        className={`export-button ${variant} ${size} ${className}`}
        title={
          !canExportData() 
            ? 'You do not have permission to export data'
            : contacts.length === 0
            ? 'No contacts available to export'
            : `Export ${contacts.length} contacts`
        }
      >
        <span className="export-icon">{getButtonIcon()}</span>
        {variant !== 'icon' && (
          <span className="export-text">{getButtonText()}</span>
        )}
        
        {contacts.length > 0 && variant === 'primary' && (
          <span className="contact-count">{contacts.length}</span>
        )}
      </button>

      {lastExportInfo && (
        <div className="last-export-info">
          <span className="export-success-icon">✅</span>
          <span className="export-info-text">
            Last export: {lastExportInfo.filename} at {lastExportInfo.timestamp.toLocaleTimeString()}
          </span>
        </div>
      )}

      <ExportModal
        contacts={contacts}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportComplete={handleExportComplete}
      />
    </>
  );
};