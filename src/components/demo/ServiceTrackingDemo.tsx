import React, { useState } from 'react';
import { ContactDetailWithService } from '../contacts/ContactDetailWithService';
import { serviceStorage } from '../../services/serviceStorage';
import type { Contact } from '../../types';

// Demo contact data
const demoContact: Contact = {
  id: 'demo-contact-1',
  nama: 'John Doe',
  nomorTelepon: '081234567890',
  jenisKelamin: 'Laki-laki',
  alamat: 'Jl. Demo No. 123, Jakarta',
  provinsi: 'DKI Jakarta',
  agama: 'Islam',
  alasanMenghubungi: 'Ingin belajar lebih tentang agama',
  sumber: 'Website',
  prioritas: 'Tinggi',
  statusKontak: 'In Progress',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  createdBy: 'admin',
  history: [
    {
      id: 'history-1',
      action: 'created',
      timestamp: new Date('2024-01-15'),
      updatedBy: 'admin',
      notes: 'Initial contact created'
    }
  ],
  // Optional fields
  usia: 25,
  profesi: 'Software Developer',
  statusPernikahan: 'Tidak Menikah',
  mediaKomunikasi: 'WhatsApp Chat',
  mission: 'NSM'
};

export const ServiceTrackingDemo: React.FC = () => {
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [sampleDataAdded, setSampleDataAdded] = useState(false);

  const addSampleServiceData = () => {
    if (sampleDataAdded) return;

    // Add sample service entries for the demo contact
    // Using current month dates for better testing
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    
    const sampleServices = [
      {
        contactId: demoContact.id,
        userId: 'admin',
        date: `${currentYear}-${currentMonth}-05`,
        duration: 60
      },
      {
        contactId: demoContact.id,
        userId: 'admin',
        date: `${currentYear}-${currentMonth}-10`,
        duration: 90
      },
      {
        contactId: demoContact.id,
        userId: 'admin',
        date: `${currentYear}-${currentMonth}-15`,
        duration: 45
      },
      {
        contactId: demoContact.id,
        userId: 'admin',
        date: `${currentYear}-${currentMonth}-20`,
        duration: 120
      },
      {
        contactId: demoContact.id,
        userId: 'admin',
        date: `${currentYear}-${currentMonth}-25`,
        duration: 75
      }
    ];

    sampleServices.forEach(service => {
      try {
        serviceStorage.addServiceEntry(service);
      } catch (error) {
        console.log('Sample service already exists or error:', error);
      }
    });

    setSampleDataAdded(true);
  };

  const handleShowDemo = () => {
    addSampleServiceData();
    setShowContactDetail(true);
  };

  const handleCloseDemo = () => {
    setShowContactDetail(false);
  };

  const handleEditContact = (contact: Contact) => {
    console.log('Edit contact:', contact);
    alert('Edit functionality not implemented in demo');
  };

  const handleDeleteContact = (contactId: string) => {
    console.log('Delete contact:', contactId);
    alert('Delete functionality not implemented in demo');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Service Tracking Demo</h1>
      <p>Click the button below to test the service tracking functionality</p>
      
      <button
        onClick={handleShowDemo}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Open Contact with Service Tracking
      </button>

      <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', margin: '2rem auto' }}>
        <h3>Features to Test:</h3>
        <ul>
          <li>View highlighted service dates in the calendar</li>
          <li>Click "Log Service" button to add new service entries</li>
          <li>Try different duration options (15min, 30min, 1hr, 2hr)</li>
          <li>Test custom duration input</li>
          <li>View service statistics and trends update in real-time</li>
          <li>Navigate through different months in the calendar</li>
          <li>Check validation (future dates, excessive durations)</li>
          <li>Hover over service dates to see tooltips</li>
        </ul>
      </div>

      {showContactDetail && (
        <ContactDetailWithService
          contact={demoContact}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
          onClose={handleCloseDemo}
        />
      )}
    </div>
  );
};