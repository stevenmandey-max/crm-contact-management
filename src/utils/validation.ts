import type { Contact, ValidationResult } from '../types';
import { CONTACT_STATUSES, GENDER_OPTIONS, PRIORITY_OPTIONS, SUMBER_OPTIONS } from './constants';

export const validateContact = (contact: Partial<Contact>): ValidationResult => {
  const errors: string[] = [];

  // Required field validation
  if (!contact.nama || contact.nama.trim() === '') {
    errors.push('Nama is required');
  }

  if (!contact.nomorTelepon || contact.nomorTelepon.trim() === '') {
    errors.push('Nomor telepon is required');
  }

  if (!contact.jenisKelamin) {
    errors.push('Jenis kelamin is required');
  } else if (!GENDER_OPTIONS.includes(contact.jenisKelamin)) {
    errors.push('Invalid jenis kelamin');
  }

  if (!contact.alamat || contact.alamat.trim() === '') {
    errors.push('Alamat is required');
  }

  if (!contact.provinsi || contact.provinsi.trim() === '') {
    errors.push('Provinsi is required');
  }

  if (!contact.agama || contact.agama.trim() === '') {
    errors.push('Agama is required');
  }

  if (!contact.alasanMenghubungi || contact.alasanMenghubungi.trim() === '') {
    errors.push('Alasan menghubungi is required');
  }

  if (!contact.sumber) {
    errors.push('Sumber is required');
  } else if (!SUMBER_OPTIONS.includes(contact.sumber)) {
    errors.push('Invalid sumber');
  }

  if (!contact.prioritas) {
    errors.push('Prioritas is required');
  } else if (!PRIORITY_OPTIONS.includes(contact.prioritas)) {
    errors.push('Invalid prioritas');
  }

  if (!contact.statusKontak) {
    errors.push('Status kontak is required');
  } else if (!CONTACT_STATUSES.includes(contact.statusKontak)) {
    errors.push('Invalid status kontak');
  }

  // Field length validation
  if (contact.nama && contact.nama.length > 100) {
    errors.push('Nama must be less than 100 characters');
  }

  if (contact.nomorTelepon && contact.nomorTelepon.length > 20) {
    errors.push('Nomor telepon must be less than 20 characters');
  }

  if (contact.alamat && contact.alamat.length > 200) {
    errors.push('Alamat must be less than 200 characters');
  }

  if (contact.agama && contact.agama.length > 50) {
    errors.push('Agama must be less than 50 characters');
  }

  if (contact.alasanMenghubungi && contact.alasanMenghubungi.length > 500) {
    errors.push('Alasan menghubungi must be less than 500 characters');
  }



  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRequired = (value: string | undefined, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`;
  }
  return null;
};