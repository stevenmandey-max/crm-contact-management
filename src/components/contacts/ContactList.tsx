import React, { useState, useEffect, useMemo } from 'react';
import type { Contact } from '../../types';
import { localStorageService } from '../../services/localStorage';
import { formatDateCompact } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { useFilter } from '../../contexts/FilterContext';
import { ExportButton } from '../export/ExportButton';
import { ContactHistoryCompact } from './ContactHistory';
import { WhatsAppButton } from '../whatsapp/WhatsAppButton';
import { QuickAddContact } from './QuickAddContact';
import { canDeleteContacts, canAccessContact } from '../../utils/permissions';
import './ContactList.css';

interface ContactListProps {
  onContactSelect?: (contact: Contact) => void;
  onContactEdit?: (contact: Contact) => void;
  onContactDelete?: (contactId: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  onContactSelect,
  onContactEdit,
  onContactDelete
}) => {
  const [sortBy, setSortBy] = useState<keyof Contact>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const { currentUser } = useAuth();
  const { filteredContacts, isLoading, refreshContacts, filters } = useFilter();

  // Refresh contacts when component mounts
  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  // Sort filtered contacts (permission filtering already done in FilterContext)
  const sortedContacts = useMemo(() => {
    const contacts = [...filteredContacts];
    
    contacts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const aTime = new Date(aValue as Date).getTime();
        const bTime = new Date(bValue as Date).getTime();
        
        if (sortOrder === 'asc') {
          return aTime < bTime ? -1 : aTime > bTime ? 1 : 0;
        } else {
          return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
        }
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Ensure values are not undefined
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return contacts;
  }, [filteredContacts, sortBy, sortOrder]);

  // Show quick add when there's a search query but no results
  useEffect(() => {
    const hasSearchQuery = filters.globalSearch && filters.globalSearch.trim().length > 0;
    const hasNoResults = sortedContacts.length === 0;
    setShowQuickAdd(Boolean(hasSearchQuery && hasNoResults && !isLoading));
  }, [filters.globalSearch, sortedContacts.length, isLoading]);

  // Pagination
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Contact) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (contactId: string) => {
    // Check if user has delete permission
    if (!canDeleteContacts(currentUser)) {
      alert('You do not have permission to delete contacts');
      return;
    }

    // Get the contact to check ownership for Editor role
    const contact = filteredContacts.find(c => c.id === contactId);
    if (!contact) {
      alert('Contact not found');
      return;
    }

    // Check if user can access this specific contact
    if (!canAccessContact(currentUser, contact.createdBy)) {
      alert('You can only delete contacts that you created');
      return;
    }

    // Create detailed confirmation message
    const confirmMessage = `⚠️ KONFIRMASI HAPUS KONTAK

Apakah Anda yakin ingin menghapus kontak berikut?

👤 Nama: ${contact.nama}
📞 Telepon: ${contact.nomorTelepon || 'Tidak ada'}
📍 Provinsi: ${contact.provinsi || 'Tidak ada'}
🏷️ Status: ${contact.statusKontak}
⭐ Prioritas: ${contact.prioritas}
📅 Dibuat: ${contact.createdAt ? formatDateCompact(new Date(contact.createdAt)) : 'Tidak diketahui'}

⚠️ PERINGATAN:
• Kontak ini akan dihapus secara permanen
• Semua riwayat perubahan akan hilang
• Data layanan terkait akan terpengaruh
• Tindakan ini TIDAK DAPAT dibatalkan

Ketik "HAPUS" untuk konfirmasi atau "Batal" untuk membatalkan.`;

    const userInput = prompt(confirmMessage);
    
    if (userInput === 'HAPUS') {
      try {
        localStorageService.deleteContact(contactId);
        refreshContacts();
        onContactDelete?.(contactId);
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
      }
    }
  };

  const getSortIcon = (field: keyof Contact) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New Contact': '#e74c3c',
      'In Progress': '#f39c12',
      'Follow Up': '#3498db',
      'Completed': '#27ae60'
    };
    return colors[status as keyof typeof colors] || '#95a5a6';
  };

  const handleQuickAddContact = () => {
    // This function is no longer used since QuickAdd now redirects to form
    // But keeping it for interface compatibility
    setShowQuickAdd(false);
  };

  const handleQuickAddCancel = () => {
    setShowQuickAdd(false);
  };

  if (isLoading) {
    return (
      <div className="contact-list-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <div className="header-left">
          <h2>Contact Management</h2>
          <div className="contact-list-stats">
            <span>Showing: {sortedContacts.length} contacts</span>
          </div>
        </div>
        
        <div className="header-actions">
          <ExportButton 
            contacts={sortedContacts}
            variant="primary"
            size="medium"
          />
        </div>
      </div>

      {showQuickAdd ? (
        <QuickAddContact
          searchQuery={filters.globalSearch || ''}
          onContactAdded={handleQuickAddContact}
          onCancel={handleQuickAddCancel}
        />
      ) : sortedContacts.length === 0 ? (
        <div className="no-contacts">
          <p>No contacts found matching current filters</p>
        </div>
      ) : (
        <>
          <div className="contact-table-container">
            <table className="contact-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nama')} className="sortable">
                    Nama {getSortIcon('nama')}
                  </th>
                  <th onClick={() => handleSort('nomorTelepon')} className="sortable">
                    Telepon {getSortIcon('nomorTelepon')}
                  </th>
                  <th onClick={() => handleSort('provinsi')} className="sortable">
                    Provinsi {getSortIcon('provinsi')}
                  </th>
                  <th onClick={() => handleSort('sumber')} className="sortable">
                    Sumber {getSortIcon('sumber')}
                  </th>
                  <th onClick={() => handleSort('prioritas')} className="sortable">
                    Prioritas {getSortIcon('prioritas')}
                  </th>
                  <th onClick={() => handleSort('statusKontak')} className="sortable">
                    Status {getSortIcon('statusKontak')}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    Created {getSortIcon('createdAt')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((contact) => (
                  <tr key={contact.id} className="contact-row">
                    <td className="contact-name">
                      <div className="name-with-history">
                        <strong>{contact.nama}</strong>
                        <ContactHistoryCompact 
                          history={contact.history || []} 
                          maxEntries={1}
                        />
                      </div>
                    </td>
                    <td className="contact-phone">
                      {contact.nomorTelepon || '-'}
                    </td>
                    <td className="contact-city">
                      {contact.provinsi || '-'}
                    </td>
                    <td className="contact-sumber">
                      <span className="sumber-badge">
                        {contact.sumber || 'Lainnya'}
                      </span>
                    </td>
                    <td className="contact-priority">
                      <span className={`priority-badge priority-${(contact.prioritas || 'sedang').toLowerCase()}`}>
                        {contact.prioritas || 'Sedang'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(contact.statusKontak) }}
                      >
                        {contact.statusKontak}
                      </span>
                    </td>
                    <td className="contact-date">
                      {contact.createdAt ? formatDateCompact(new Date(contact.createdAt)) : 'No Date'}
                    </td>
                    <td className="contact-actions">
                      <WhatsAppButton
                        contact={contact}
                        variant="icon"
                        showTemplates={false}
                        className="contact-list-whatsapp"
                      />
                      <button
                        onClick={() => onContactSelect?.(contact)}
                        className="action-btn view-btn"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => onContactEdit?.(contact)}
                        className="action-btn edit-btn"
                        title="Edit Contact"
                      >
                        ✏️
                      </button>
                      {canDeleteContacts(currentUser) && canAccessContact(currentUser, contact.createdBy) && (
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="action-btn delete-btn"
                          title="Delete Contact"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};