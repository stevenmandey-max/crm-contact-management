import React, { useState, useEffect } from 'react';
import type { Contact } from '../../types';
import { Navigation } from './Navigation';
import { ContactList } from '../contacts/ContactList';
import { ContactForm } from '../contacts/ContactForm';
import { ContactDetail } from '../contacts/ContactDetail';
import { UserManagement } from '../users/UserManagement';
import { Dashboard } from '../dashboard/Dashboard';
import { ServiceTracking } from '../services/ServiceTracking';
import { ActiveServiceBanner } from '../services/ActiveServiceBanner';

import { FilterProvider } from '../../contexts/FilterContext';
import { FilterPanel } from '../filters/FilterPanel';
import { localStorageService } from '../../services/localStorage';
import './MainLayout.css';

type ViewType = 'dashboard' | 'contacts' | 'add-contact' | 'service-tracking' | 'users';

interface MainLayoutProps {
  initialView?: ViewType;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  initialView = 'dashboard'
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [quickAddData, setQuickAddData] = useState<any>(null);

  // Listen for navigation from QuickAddContact
  useEffect(() => {
    const handleNavigateToAddContact = (event: CustomEvent) => {
      setQuickAddData(event.detail);
      setCurrentView('add-contact');
      setEditingContact(null);
    };

    window.addEventListener('navigateToAddContact', handleNavigateToAddContact as EventListener);

    return () => {
      window.removeEventListener('navigateToAddContact', handleNavigateToAddContact as EventListener);
    };
  }, []);



  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedContact(null);
    setEditingContact(null);
    setShowContactDetail(false);
    
    // Clear quick add data when changing views
    if (view !== 'add-contact') {
      setQuickAddData(null);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  const handleContactEdit = (contact: Contact) => {
    setEditingContact(contact);
    setCurrentView('add-contact');
  };

  const handleContactDelete = () => {
    setShowContactDetail(false);
    setSelectedContact(null);
  };

  const handleContactSave = (savedContact?: Contact) => {
    // For edit mode, go back to contacts
    if (editingContact) {
      setEditingContact(null);
      setCurrentView('contacts');
    }
    // For create mode, stay in add-contact view but clear quickAddData
    // The ContactForm will handle service mode internally
    if (!editingContact && savedContact) {
      // Clear quickAddData since contact is now saved
      setQuickAddData(null);
      // Stay in add-contact view for service mode
    }
  };

  const handleFormCancel = () => {
    setEditingContact(null);
    setQuickAddData(null);
    setCurrentView('contacts');
  };

  const handleDetailClose = () => {
    setShowContactDetail(false);
    setSelectedContact(null);
  };



  const handleDashboardNavigate = (view: string, filters?: any) => {
    // For now, just navigate to the view - in the future we can apply filters
    console.log('Dashboard navigation:', view, filters);
    
    switch (view) {
      case 'contacts':
        setCurrentView('contacts');
        break;
      case 'service-tracking':
        // Future: navigate to service tracking view
        console.log('Service tracking navigation not yet implemented');
        break;
      default:
        setCurrentView('contacts');
    }
  };

  const handleReturnToService = (contactId: string) => {
    // Get the contact from storage
    const contact = localStorageService.getContactById(contactId);
    if (contact) {
      // Set the contact as editing contact and switch to add-contact view
      // This will put the form in service mode
      setEditingContact(contact);
      setCurrentView('add-contact');
      setQuickAddData(null);
      setShowContactDetail(false);
      setSelectedContact(null);
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleDashboardNavigate} />;
      
      case 'contacts':
        return (
          <FilterProvider>
            <div className="contacts-with-filters">
              <FilterPanel />
              <ContactList
                onContactSelect={handleContactSelect}
                onContactEdit={handleContactEdit}
                onContactDelete={handleContactDelete}
              />
            </div>
          </FilterProvider>
        );
      
      case 'add-contact':
        return (
          <ContactForm
            contact={editingContact}
            mode={editingContact ? 'edit' : 'create'}
            onSave={handleContactSave}
            onCancel={handleFormCancel}
            initialData={quickAddData}
          />
        );
      
      case 'service-tracking':
        return <ServiceTracking />;
      
      case 'users':
        return <UserManagement />;
      
      default:
        return <Dashboard onNavigate={handleDashboardNavigate} />;
    }
  };

  return (
    <div className="main-layout">
      {/* Active Service Banner - shows when there's an active service session */}
      <ActiveServiceBanner onReturnToService={handleReturnToService} />
      
      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="main-content">
        {renderMainContent()}
      </main>

      {showContactDetail && selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onEdit={handleContactEdit}
          onDelete={handleContactDelete}
          onClose={handleDetailClose}
        />
      )}
    </div>
  );
};