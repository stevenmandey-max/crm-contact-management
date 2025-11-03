import React, { useState, useEffect, useCallback } from 'react';
import type { Contact, ContactStatus, Gender, Priority, Sumber, StatusPernikahan, MediaKomunikasi } from '../../types';
import { ContactModel } from '../../models/Contact';
import { localStorageService } from '../../services/localStorage';
import { CONTACT_STATUSES, RELIGION_OPTIONS, GENDER_OPTIONS, PRIORITY_OPTIONS, SUMBER_OPTIONS, STATUS_PERNIKAHAN_OPTIONS, MEDIA_KOMUNIKASI_OPTIONS, PROTESTAN_CHURCHES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useSuggestions } from '../../hooks/useSuggestions';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { TerritorySelector } from '../common/TerritorySelector';
import type { TerritorySelection } from '../../hooks/useTerritorySelection';
import { ServiceTimerWidget } from '../services/ServiceTimerWidget';
import { serviceSessionStorage } from '../../services/serviceSessionStorage';
import './ContactForm.css';

interface ContactFormProps {
  contact?: Contact | null;
  onSave?: (contact: Contact) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'service';
  initialData?: { nama?: string; nomorTelepon?: string } | null;
}

interface FormData {
  nama: string;
  nomorTelepon: string;
  jenisKelamin: Gender;
  usia: string;
  profesi: string;
  statusPernikahan: StatusPernikahan | '';
  mediaKomunikasi: MediaKomunikasi | '';
  alamat: string;
  // New territory fields
  provinsi: string;
  kabKota: string;
  mission: string;
  uni: string;
  agama: string;
  subAgama: string;
  alasanMenghubungi: string;
  sumber: Sumber | '';
  prioritas: Priority;
  statusKontak: ContactStatus;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSave,
  onCancel,
  mode = 'create',
  initialData
}) => {
  const [formData, setFormData] = useState<FormData>({
    nama: initialData?.nama || '',
    nomorTelepon: initialData?.nomorTelepon || '',
    jenisKelamin: 'Laki-laki',
    usia: '',
    profesi: '',
    statusPernikahan: '' as StatusPernikahan,
    mediaKomunikasi: '' as MediaKomunikasi,
    alamat: '',
    // New territory fields
    provinsi: '',
    kabKota: '',
    mission: '',
    uni: '',
    agama: '',
    subAgama: '',
    alasanMenghubungi: '',
    sumber: '' as Sumber,
    prioritas: 'Urgent', // Changed default to Urgent
    statusKontak: 'New Contact'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [savedContact, setSavedContact] = useState<Contact | null>(contact || null);


  const { currentUser } = useAuth();
  const { suggestions, isNameDuplicate, isPhoneNumberDuplicate } = useSuggestions();

  // Check for active service session when contact changes
  useEffect(() => {
    if (contact && mode === 'edit') {
      // Check if this contact has an active service session
      const activeSession = serviceSessionStorage.getActiveSessionForContact(contact.id, currentUser?.username || '');
      
      if (activeSession) {
        // If there's an active session, switch to service mode
        setSavedContact(contact);
        setCurrentMode('service');
      }
    }
  }, [contact, mode]);

  // Initialize form data when contact prop changes
  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData({
        nama: contact.nama,
        nomorTelepon: contact.nomorTelepon || '',
        jenisKelamin: contact.jenisKelamin || 'Laki-laki',
        usia: contact.usia ? String(contact.usia) : '',
        profesi: contact.profesi || '',
        statusPernikahan: contact.statusPernikahan || '' as StatusPernikahan,
        mediaKomunikasi: contact.mediaKomunikasi || '' as MediaKomunikasi,
        alamat: contact.alamat,
        // Territory fields
        provinsi: contact.provinsi || '',
        kabKota: contact.kabKota || '',
        mission: contact.mission || '',
        uni: contact.uni || '',
        agama: contact.agama,
        subAgama: contact.subAgama || '',
        alasanMenghubungi: contact.alasanMenghubungi,
        sumber: contact.sumber || '' as Sumber,
        prioritas: contact.prioritas || 'Urgent',
        statusKontak: contact.statusKontak
      });
    } else {
      // Reset form for create mode
      setFormData({
        nama: '',
        nomorTelepon: '',
        jenisKelamin: 'Laki-laki',
        usia: '',
        profesi: '',
        statusPernikahan: '' as StatusPernikahan,
        mediaKomunikasi: '' as MediaKomunikasi,
        alamat: '',
        // Territory fields
        provinsi: '',
        kabKota: '',
        mission: '',
        uni: '',
        agama: '',
        subAgama: '',
        alasanMenghubungi: '',
        sumber: '' as Sumber,
        prioritas: 'Urgent', // Changed default to Urgent
        statusKontak: 'New Contact'
      });
    }
    setErrors({});
    setIsDirty(false);
  }, [contact, mode]);

  // Handle initialData from QuickAdd
  useEffect(() => {
    if (initialData && mode === 'create' && !contact) {
      setFormData(prev => ({
        ...prev,
        nama: initialData.nama || prev.nama,
        nomorTelepon: initialData.nomorTelepon || prev.nomorTelepon
      }));
    }
  }, [initialData, mode, contact]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    // Use functional update to prevent stale closure issues
    setFormData(prev => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[field] === value) return prev;
      
      const newData = {
        ...prev,
        [field]: value
      };

      // Handle agama change - auto-set subAgama based on religion
      if (field === 'agama') {
        if (value === 'Protestan') {
          // For Protestan, keep subAgama empty to allow user selection
          newData.subAgama = '';
        } else if (value) {
          // For other religions, auto-set subAgama to the same value
          newData.subAgama = value;
        } else {
          // If no religion selected, clear subAgama
          newData.subAgama = '';
        }
      }
      
      return newData;
    });
    
    setIsDirty(true);

    // Clear error for this field when user starts typing
    setErrors(prev => {
      if (!prev[field]) return prev;
      
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Handle territory selection change
  const handleTerritoryChange = useCallback((selection: TerritorySelection) => {
    setFormData(prev => ({
      ...prev,
      provinsi: selection.provinsi,
      kabKota: selection.kabKota,
      mission: selection.mission,
      uni: selection.uni
    }));
    
    setIsDirty(true);
    
    // Clear territory-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.provinsi;
      delete newErrors.kabKota;
      delete newErrors.mission;
      delete newErrors.uni;
      return newErrors;
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields (only nama and nomorTelepon are required)
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama is required';
    } else if (formData.nama.length > 100) {
      newErrors.nama = 'Nama must be less than 100 characters';
    } else if (mode === 'create' && isNameDuplicate(formData.nama)) {
      newErrors.nama = 'Nama ini sudah ada dalam kontak';
    }

    if (!formData.nomorTelepon.trim()) {
      newErrors.nomorTelepon = 'Nomor telepon is required';
    } else if (formData.nomorTelepon.length > 20) {
      newErrors.nomorTelepon = 'Nomor telepon must be less than 20 characters';
    } else if (mode === 'create' && isPhoneNumberDuplicate(formData.nomorTelepon)) {
      newErrors.nomorTelepon = 'Nomor telepon ini sudah ada dalam kontak';
    }

    // Optional field validations (only validate if filled)
    if (formData.usia.trim()) {
      const usia = parseInt(formData.usia);
      if (isNaN(usia) || usia < 1 || usia > 120) {
        newErrors.usia = 'Usia must be between 1 and 120';
      }
    }

    if (formData.profesi.trim() && formData.profesi.length > 100) {
      newErrors.profesi = 'Profesi must be less than 100 characters';
    }

    if (formData.alamat.trim() && formData.alamat.length > 200) {
      newErrors.alamat = 'Alamat must be less than 200 characters';
    }

    // Territory validation - provinsi and kabKota are required for complete territory info
    if (formData.provinsi && !formData.kabKota) {
      newErrors.kabKota = 'Kab/Kota harus dipilih setelah memilih provinsi';
    }

    if (formData.agama.trim() && formData.agama.length > 50) {
      newErrors.agama = 'Agama must be less than 50 characters';
    }

    if (formData.alasanMenghubungi.trim() && formData.alasanMenghubungi.length > 500) {
      newErrors.alasanMenghubungi = 'Alasan menghubungi must be less than 500 characters';
    }

    // These fields have defaults, so they should always be valid
    if (!formData.jenisKelamin) {
      newErrors.jenisKelamin = 'Jenis kelamin is required';
    }

    if (!formData.prioritas) {
      newErrors.prioritas = 'Prioritas is required';
    }

    if (!formData.statusKontak) {
      newErrors.statusKontak = 'Status kontak is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to save contacts');
      return;
    }

    setIsSubmitting(true);

    try {
      let updatedContact: Contact;

      if ((mode === 'edit' && contact) || (currentMode === 'edit' && savedContact)) {
        // Update existing contact with history tracking
        const contactToUpdate = contact || savedContact!;
        localStorageService.updateContactWithHistory(contactToUpdate.id, {
          ...formData,
          usia: formData.usia ? parseInt(formData.usia) : undefined,
          statusPernikahan: formData.statusPernikahan || undefined,
          mediaKomunikasi: formData.mediaKomunikasi || undefined,
          mission: formData.mission || undefined,
          kabKota: formData.kabKota || undefined,
          uni: formData.uni || undefined,
          sumber: formData.sumber as Sumber
        }, currentUser.username);
        
        // Get the updated contact from storage to include history
        const contactFromStorage = localStorageService.getContactById(contactToUpdate.id);
        updatedContact = contactFromStorage || contactToUpdate;
        
        // Dispatch event to update suggestions
        window.dispatchEvent(new CustomEvent('contactsUpdated'));
      } else {
        // Create new contact
        const newContact = new ContactModel(
          formData.nama,
          formData.nomorTelepon,
          formData.jenisKelamin,
          formData.alamat,
          formData.provinsi,
          formData.agama,
          formData.alasanMenghubungi,
          formData.sumber as Sumber,
          formData.prioritas,
          formData.statusKontak,
          currentUser.username,
          formData.usia ? parseInt(formData.usia) : undefined,
          formData.profesi || undefined,
          formData.statusPernikahan || undefined,
          formData.mediaKomunikasi || undefined,
          formData.mission || undefined,
          formData.subAgama || undefined,
          formData.kabKota || undefined,
          formData.uni || undefined
        );

        localStorageService.addContact(newContact.toObject());
        updatedContact = newContact.toObject();
        
        // Dispatch event to update suggestions
        window.dispatchEvent(new CustomEvent('contactsUpdated'));
      }

      // Handle different modes after save
      if (mode === 'create') {
        // For new contacts, switch to service mode and keep form data
        setSavedContact(updatedContact);
        setCurrentMode('service');
        
        // Update form data with saved contact data to ensure consistency
        setFormData({
          nama: updatedContact.nama,
          nomorTelepon: updatedContact.nomorTelepon || '',
          jenisKelamin: updatedContact.jenisKelamin || 'Laki-laki',
          usia: updatedContact.usia ? String(updatedContact.usia) : '',
          profesi: updatedContact.profesi || '',
          statusPernikahan: updatedContact.statusPernikahan || '' as StatusPernikahan,
          mediaKomunikasi: updatedContact.mediaKomunikasi || '' as MediaKomunikasi,
          alamat: updatedContact.alamat || '',
          // Territory fields
          provinsi: updatedContact.provinsi || '',
          kabKota: updatedContact.kabKota || '',
          mission: updatedContact.mission || '',
          uni: updatedContact.uni || '',
          agama: updatedContact.agama || '',
          subAgama: updatedContact.subAgama || '',
          alasanMenghubungi: updatedContact.alasanMenghubungi || '',
          sumber: updatedContact.sumber || '' as Sumber,
          prioritas: updatedContact.prioritas || 'Urgent',
          statusKontak: updatedContact.statusKontak || 'New Contact'
        });
        
        // Mark as not dirty since we just saved
        setIsDirty(false);
        
        // Show success notification
        alert(`Contact "${updatedContact.nama}" berhasil disimpan! Siap untuk memulai pelayanan.`);
      } else if (currentMode === 'edit' && savedContact) {
        // For updates from service mode, go back to service mode
        setSavedContact(updatedContact);
        setCurrentMode('service');
        
        // Update form data with saved contact data
        setFormData({
          nama: updatedContact.nama,
          nomorTelepon: updatedContact.nomorTelepon || '',
          jenisKelamin: updatedContact.jenisKelamin || 'Laki-laki',
          usia: updatedContact.usia ? String(updatedContact.usia) : '',
          profesi: updatedContact.profesi || '',
          statusPernikahan: updatedContact.statusPernikahan || '' as StatusPernikahan,
          mediaKomunikasi: updatedContact.mediaKomunikasi || '' as MediaKomunikasi,
          alamat: updatedContact.alamat || '',
          // Territory fields
          provinsi: updatedContact.provinsi || '',
          kabKota: updatedContact.kabKota || '',
          mission: updatedContact.mission || '',
          uni: updatedContact.uni || '',
          agama: updatedContact.agama || '',
          subAgama: updatedContact.subAgama || '',
          alasanMenghubungi: updatedContact.alasanMenghubungi || '',
          sumber: updatedContact.sumber || '' as Sumber,
          prioritas: updatedContact.prioritas || 'Urgent',
          statusKontak: updatedContact.statusKontak || 'New Contact'
        });
        
        // Mark as not dirty since we just saved
        setIsDirty(false);
        
        // Show success notification
        alert(`Contact "${updatedContact.nama}" berhasil diupdate! Kembali ke service mode.`);
      } else {
        // For regular edit mode, call onSave callback
        onSave?.(updatedContact);
      }

    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  const getCharacterCount = (field: keyof FormData, maxLength: number) => {
    const currentLength = formData[field].length;
    const isNearLimit = currentLength > maxLength * 0.8;
    return (
      <span className={`character-count ${isNearLimit ? 'near-limit' : ''}`}>
        {currentLength}/{maxLength}
      </span>
    );
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form-header">
        <h2>
          {currentMode === 'service' ? 'Service Mode' : 
           mode === 'edit' ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <p>
          {currentMode === 'service' 
            ? `Ready to serve ${savedContact?.nama || 'contact'}` :
           mode === 'edit' 
            ? 'Update the contact information below' 
            : 'Fill in the details to add a new contact'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nama" className="form-label">
              Nama <span className="required">*</span>
            </label>
            <AutocompleteInput
              id="nama"
              value={formData.nama}
              onChange={(value) => handleInputChange('nama', value)}
              suggestions={suggestions.names}
              className={`form-input ${errors.nama ? 'error' : ''}`}
              placeholder="Enter full name"
              disabled={isSubmitting}
              maxLength={100}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
              excludeFromDuplicateCheck={contact?.nama || savedContact?.nama}
            />
            <div className="form-meta">
              {errors.nama && <span className="error-message">{errors.nama}</span>}
              {getCharacterCount('nama', 100)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nomorTelepon" className="form-label">
              Nomor Telepon <span className="required">*</span>
            </label>
            <AutocompleteInput
              id="nomorTelepon"
              type="tel"
              value={formData.nomorTelepon}
              onChange={(value) => handleInputChange('nomorTelepon', value)}
              suggestions={suggestions.phoneNumbers}
              className={`form-input ${errors.nomorTelepon ? 'error' : ''}`}
              placeholder="Enter phone number"
              disabled={isSubmitting}
              maxLength={20}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              excludeFromDuplicateCheck={contact?.nomorTelepon || savedContact?.nomorTelepon}
            />
            <div className="form-meta">
              {errors.nomorTelepon && <span className="error-message">{errors.nomorTelepon}</span>}
              {getCharacterCount('nomorTelepon', 20)}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jenisKelamin" className="form-label">
              Jenis Kelamin
            </label>
            <select
              id="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={(e) => handleInputChange('jenisKelamin', e.target.value as Gender)}
              className={`form-select ${errors.jenisKelamin ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            <div className="form-meta">
              {errors.jenisKelamin && <span className="error-message">{errors.jenisKelamin}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="usia" className="form-label">
              Usia
            </label>
            <input
              id="usia"
              type="number"
              value={formData.usia}
              onChange={(e) => handleInputChange('usia', e.target.value)}
              className={`form-input ${errors.usia ? 'error' : ''}`}
              placeholder="Enter age (optional)"
              disabled={isSubmitting}
              min="1"
              max="120"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
            />
            <div className="form-meta">
              {errors.usia && <span className="error-message">{errors.usia}</span>}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profesi" className="form-label">
              Profesi
            </label>
            <input
              id="profesi"
              type="text"
              value={formData.profesi}
              onChange={(e) => handleInputChange('profesi', e.target.value)}
              className={`form-input ${errors.profesi ? 'error' : ''}`}
              placeholder="Enter profession (optional)"
              disabled={isSubmitting}
              maxLength={100}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
            />
            <div className="form-meta">
              {errors.profesi && <span className="error-message">{errors.profesi}</span>}
              {getCharacterCount('profesi', 100)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="statusPernikahan" className="form-label">
              Status Pernikahan
            </label>
            <select
              id="statusPernikahan"
              value={formData.statusPernikahan}
              onChange={(e) => handleInputChange('statusPernikahan', e.target.value as StatusPernikahan)}
              className={`form-select ${errors.statusPernikahan ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Pilih Status Pernikahan</option>
              {STATUS_PERNIKAHAN_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="form-meta">
              {errors.statusPernikahan && <span className="error-message">{errors.statusPernikahan}</span>}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mediaKomunikasi" className="form-label">
              Media Komunikasi
            </label>
            <select
              id="mediaKomunikasi"
              value={formData.mediaKomunikasi}
              onChange={(e) => handleInputChange('mediaKomunikasi', e.target.value as MediaKomunikasi)}
              className={`form-select ${errors.mediaKomunikasi ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Pilih Media Komunikasi</option>
              {MEDIA_KOMUNIKASI_OPTIONS.map((media) => (
                <option key={media} value={media}>
                  {media}
                </option>
              ))}
            </select>
            <div className="form-meta">
              {errors.mediaKomunikasi && <span className="error-message">{errors.mediaKomunikasi}</span>}
            </div>
          </div>

          {/* Territory Selection - replaces old mission field */}
          <div className="form-group territory-group">
            <TerritorySelector
              initialProvinsi={formData.provinsi}
              initialKabKota={formData.kabKota}
              onChange={handleTerritoryChange}
              disabled={isSubmitting}
              errors={{
                provinsi: errors.provinsi,
                kabKota: errors.kabKota,
                mission: errors.mission,
                uni: errors.uni
              }}
              className="horizontal"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="agama" className="form-label">
              Agama
            </label>
            <select
              id="agama"
              value={formData.agama}
              onChange={(e) => handleInputChange('agama', e.target.value)}
              className={`form-select ${errors.agama ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Pilih Agama</option>
              {RELIGION_OPTIONS.map((religion) => (
                <option key={religion} value={religion}>
                  {religion}
                </option>
              ))}
            </select>
            <div className="form-meta">
              {errors.agama && <span className="error-message">{errors.agama}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subAgama" className="form-label">
              {formData.agama === 'Protestan' ? 'Gereja' : 'Sub Agama'}
            </label>
            {formData.agama === 'Protestan' ? (
              <AutocompleteInput
                id="subAgama"
                value={formData.subAgama}
                onChange={(value) => handleInputChange('subAgama', value)}
                suggestions={PROTESTAN_CHURCHES}
                className={`form-input ${errors.subAgama ? 'error' : ''}`}
                placeholder="Cari nama gereja..."
                disabled={isSubmitting}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck={false}
                showDuplicateWarning={false}
              />
            ) : (
              <input
                id="subAgama"
                type="text"
                value={formData.subAgama}
                onChange={(e) => handleInputChange('subAgama', e.target.value)}
                className={`form-input ${errors.subAgama ? 'error' : ''}`}
                placeholder={formData.agama ? formData.agama : 'Pilih agama terlebih dahulu'}
                disabled={isSubmitting || !formData.agama}
                readOnly={!!(formData.agama && formData.agama !== 'Protestan')}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck={false}
              />
            )}
            <div className="form-meta">
              {errors.subAgama && <span className="error-message">{errors.subAgama}</span>}
              {formData.agama === 'Protestan' && (
                <span className="help-text">Ketik untuk mencari gereja Protestan</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="alamat" className="form-label">
            Alamat
          </label>
          <textarea
            id="alamat"
            value={formData.alamat}
            onChange={(e) => handleInputChange('alamat', e.target.value)}
            className={`form-textarea ${errors.alamat ? 'error' : ''}`}
            placeholder="Enter complete address (optional)"
            disabled={isSubmitting}
            rows={3}
            maxLength={200}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck="false"
          />
          <div className="form-meta">
            {errors.alamat && <span className="error-message">{errors.alamat}</span>}
            {getCharacterCount('alamat', 200)}
          </div>
        </div>

        {/* Territory selection is now handled above in the territory-group */}

        <div className="form-group">
          <label htmlFor="alasanMenghubungi" className="form-label">
            Alasan Menghubungi
          </label>
          <textarea
            id="alasanMenghubungi"
            value={formData.alasanMenghubungi}
            onChange={(e) => handleInputChange('alasanMenghubungi', e.target.value)}
            className={`form-textarea ${errors.alasanMenghubungi ? 'error' : ''}`}
            placeholder="Enter reason for contact (optional)"
            disabled={isSubmitting}
            rows={4}
            maxLength={500}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck="false"
          />
          <div className="form-meta">
            {errors.alasanMenghubungi && <span className="error-message">{errors.alasanMenghubungi}</span>}
            {getCharacterCount('alasanMenghubungi', 500)}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sumber" className="form-label">
            Sumber
          </label>
          <select
            id="sumber"
            value={formData.sumber}
            onChange={(e) => handleInputChange('sumber', e.target.value as Sumber)}
            className={`form-select ${errors.sumber ? 'error' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">Pilih Sumber</option>
            {SUMBER_OPTIONS.map((sumber) => (
              <option key={sumber} value={sumber}>
                {sumber}
              </option>
            ))}
          </select>
          <div className="form-meta">
            {errors.sumber && <span className="error-message">{errors.sumber}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prioritas" className="form-label">
              Prioritas
            </label>
            <select
              id="prioritas"
              value={formData.prioritas}
              onChange={(e) => handleInputChange('prioritas', e.target.value as Priority)}
              className={`form-select ${errors.prioritas ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <div className="form-meta">
              {errors.prioritas && <span className="error-message">{errors.prioritas}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="statusKontak" className="form-label">
              Status Kontak
            </label>
            <select
              id="statusKontak"
              value={formData.statusKontak}
              onChange={(e) => handleInputChange('statusKontak', e.target.value as ContactStatus)}
              className={`form-select ${errors.statusKontak ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              {CONTACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="form-meta">
              {errors.statusKontak && <span className="error-message">{errors.statusKontak}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                {mode === 'edit' ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              mode === 'edit' ? 'Update Contact' : 'Save Contact'
            )}
          </button>
        </div>
      </form>

      {/* Service Timer Widget - Show in service mode or edit mode */}
      {(currentMode === 'service' || (mode === 'edit' && savedContact)) && savedContact && (
        <ServiceTimerWidget
          contactId={savedContact.id}
          contactName={savedContact.nama}
          onServiceStart={() => {
            console.log('Service started for:', savedContact.nama);
          }}
          onServiceEnd={(duration) => {
            console.log('Service ended for:', savedContact.nama, 'Duration:', duration, 'seconds');
            // You can add additional logic here like updating contact status
          }}
        />
      )}

      {/* Service Mode Actions */}
      {currentMode === 'service' && savedContact && (
        <div className="service-mode-actions">
          <button
            type="button"
            onClick={() => {
              // Ensure form data is populated with saved contact data when switching to edit mode
              if (savedContact) {
                setFormData({
                  nama: savedContact.nama,
                  nomorTelepon: savedContact.nomorTelepon || '',
                  jenisKelamin: savedContact.jenisKelamin || 'Laki-laki',
                  usia: savedContact.usia ? String(savedContact.usia) : '',
                  profesi: savedContact.profesi || '',
                  statusPernikahan: savedContact.statusPernikahan || '' as StatusPernikahan,
                  mediaKomunikasi: savedContact.mediaKomunikasi || '' as MediaKomunikasi,
                  alamat: savedContact.alamat || '',
                  // Territory fields
                  provinsi: savedContact.provinsi || '',
                  kabKota: savedContact.kabKota || '',
                  mission: savedContact.mission || '',
                  uni: savedContact.uni || '',
                  agama: savedContact.agama || '',
                  subAgama: savedContact.subAgama || '',
                  alasanMenghubungi: savedContact.alasanMenghubungi || '',
                  sumber: savedContact.sumber || '' as Sumber,
                  prioritas: savedContact.prioritas || 'Urgent',
                  statusKontak: savedContact.statusKontak || 'New Contact'
                });
              }
              setCurrentMode('edit');
            }}
            className="btn btn-secondary"
          >
            ✏️ Edit Contact Info
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            📋 Back to Contacts
          </button>
        </div>
      )}
    </div>
  );
};