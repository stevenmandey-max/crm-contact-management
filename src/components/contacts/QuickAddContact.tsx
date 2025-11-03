import React from 'react';
import type { Contact } from '../../types';
import './QuickAddContact.css';

interface QuickAddContactProps {
  searchQuery: string;
  onContactAdded: (contact: Contact) => void;
  onCancel: () => void;
}

export const QuickAddContact: React.FC<QuickAddContactProps> = ({
  searchQuery,
  onCancel
}) => {
  // Parse search query to determine if it's a name or phone number
  const parseSearchQuery = (query: string) => {
    const trimmed = query.trim();
    
    // Check if it looks like a phone number (contains digits and common phone chars)
    const phonePattern = /^[\d\s\-\+\(\)]+$/;
    const isPhoneNumber = phonePattern.test(trimmed) && trimmed.length >= 8;
    
    if (isPhoneNumber) {
      return {
        nama: '',
        nomorTelepon: trimmed.replace(/\s/g, '') // Remove spaces
      };
    } else {
      return {
        nama: trimmed,
        nomorTelepon: ''
      };
    }
  };

  const parsedData = parseSearchQuery(searchQuery);

  const handleAddContact = () => {
    // Close the quick add component
    onCancel();
    
    // Trigger navigation to Add Contact form with parsed data
    window.dispatchEvent(new CustomEvent('navigateToAddContact', { 
      detail: parsedData 
    }));
  };

  return (
    <div className="quick-add-contact">
      <div className="quick-add-header">
        <div className="search-result-info">
          <span className="search-icon">🔍</span>
          <div className="search-text">
            <strong>"{searchQuery}"</strong> tidak ditemukan
          </div>
        </div>
      </div>

      <div className="quick-add-content">
        <div className="parsed-data-preview">
          <h4>Data yang terdeteksi:</h4>
          <div className="data-preview">
            {parsedData.nama && (
              <div className="data-item">
                <span className="data-label">Nama:</span>
                <span className="data-value">{parsedData.nama}</span>
              </div>
            )}
            {parsedData.nomorTelepon && (
              <div className="data-item">
                <span className="data-label">Nomor Telepon:</span>
                <span className="data-value">{parsedData.nomorTelepon}</span>
              </div>
            )}
          </div>
        </div>

        <div className="quick-add-actions">
          <button
            onClick={handleAddContact}
            className="quick-add-btn primary"
          >
            <span>📝</span>
            Tambah Contact
          </button>

          <button
            onClick={onCancel}
            className="quick-add-btn cancel"
          >
            <span>✕</span>
            Batal
          </button>
        </div>

        <div className="quick-add-info">
          <div className="info-item">
            <strong>Tambah Contact:</strong> Buka form lengkap untuk menambah contact dengan semua field yang diperlukan
          </div>
        </div>
      </div>
    </div>
  );
};