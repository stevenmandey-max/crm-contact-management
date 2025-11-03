import type { Contact, ContactStatus, ValidationResult, ContactHistoryEntry, Gender, Priority, Sumber, StatusPernikahan, MediaKomunikasi } from '../types';
import { generateId } from '../utils/helpers';
import { validateContact } from '../utils/validation';

export class ContactModel implements Contact {
  id: string;
  createdAt: Date;
  nama: string;
  nomorTelepon: string;
  jenisKelamin: Gender;
  usia?: number;
  profesi?: string;
  statusPernikahan?: StatusPernikahan;
  mediaKomunikasi?: MediaKomunikasi;
  mission?: string;
  alamat: string;
  provinsi: string;
  kabKota?: string;
  uni?: string;
  agama: string;
  subAgama?: string;
  alasanMenghubungi: string;
  sumber: Sumber;
  prioritas: Priority;
  statusKontak: ContactStatus;
  updatedAt: Date;
  createdBy: string;
  history: ContactHistoryEntry[];

  constructor(
    nama: string,
    nomorTelepon: string,
    jenisKelamin: Gender,
    alamat: string,
    provinsi: string,
    agama: string,
    alasanMenghubungi: string,
    sumber: Sumber,
    prioritas: Priority,
    statusKontak: ContactStatus,
    createdBy: string,
    usia?: number,
    profesi?: string,
    statusPernikahan?: StatusPernikahan,
    mediaKomunikasi?: MediaKomunikasi,
    mission?: string,
    subAgama?: string,
    kabKota?: string,
    uni?: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    history?: ContactHistoryEntry[]
  ) {
    this.id = id || generateId();
    this.nama = nama.trim();
    this.nomorTelepon = nomorTelepon.trim();
    this.jenisKelamin = jenisKelamin;
    this.usia = usia;
    this.profesi = profesi?.trim();
    this.statusPernikahan = statusPernikahan;
    this.mediaKomunikasi = mediaKomunikasi;
    this.mission = mission;
    this.alamat = alamat.trim();
    this.provinsi = provinsi.trim();
    this.kabKota = kabKota?.trim();
    this.uni = uni?.trim();
    this.agama = agama.trim();
    this.subAgama = subAgama?.trim();
    this.alasanMenghubungi = alasanMenghubungi.trim();
    this.sumber = sumber;
    this.prioritas = prioritas;
    this.statusKontak = statusKontak;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.history = history || [{
      id: generateId(),
      timestamp: this.createdAt,
      action: 'created',
      updatedBy: createdBy,
      notes: 'Contact created'
    }];
  }

  // Static method to validate contact data
  static validate(contact: Partial<Contact>): ValidationResult {
    return validateContact(contact);
  }

  // Static method to create from plain object
  static fromObject(obj: any): ContactModel {
    // Convert history entries to proper format
    const history = obj.history ? obj.history.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })) : undefined;

    return new ContactModel(
      obj.nama || '',
      obj.nomorTelepon || '',
      obj.jenisKelamin || 'Laki-laki',
      obj.alamat || '',
      obj.provinsi || '',
      obj.agama || '',
      obj.alasanMenghubungi || '',
      obj.sumber || 'Parabola', // Default sumber
      obj.prioritas || 'Urgent',
      obj.statusKontak || 'New Contact',
      obj.createdBy || '',
      obj.usia,
      obj.profesi,
      obj.statusPernikahan,
      obj.mediaKomunikasi,
      obj.mission,
      obj.subAgama,
      obj.kabKota,
      obj.uni,
      obj.id,
      obj.createdAt ? new Date(obj.createdAt) : undefined,
      obj.updatedAt ? new Date(obj.updatedAt) : undefined,
      history
    );
  }

  // Static method to create from JSON string
  static fromJSON(json: string): ContactModel {
    try {
      const obj = JSON.parse(json);
      return ContactModel.fromObject(obj);
    } catch (error) {
      throw new Error('Invalid JSON format for Contact');
    }
  }

  // Instance method to validate this contact
  validate(): ValidationResult {
    return ContactModel.validate(this);
  }

  // Instance method to update contact data with history tracking
  update(updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'createdBy' | 'history'>>, updatedBy: string): void {
    const changes: Array<{field: string, oldValue: string, newValue: string}> = [];
    
    if (updates.nama !== undefined && updates.nama.trim() !== this.nama) {
      changes.push({field: 'nama', oldValue: this.nama, newValue: updates.nama.trim()});
      this.nama = updates.nama.trim();
    }
    
    if (updates.nomorTelepon !== undefined && updates.nomorTelepon.trim() !== this.nomorTelepon) {
      changes.push({field: 'nomorTelepon', oldValue: this.nomorTelepon, newValue: updates.nomorTelepon.trim()});
      this.nomorTelepon = updates.nomorTelepon.trim();
    }
    
    if (updates.jenisKelamin !== undefined && updates.jenisKelamin !== this.jenisKelamin) {
      changes.push({field: 'jenisKelamin', oldValue: this.jenisKelamin, newValue: updates.jenisKelamin});
      this.jenisKelamin = updates.jenisKelamin;
    }
    
    if (updates.usia !== undefined && updates.usia !== this.usia) {
      changes.push({field: 'usia', oldValue: String(this.usia || ''), newValue: String(updates.usia)});
      this.usia = updates.usia;
    }
    
    if (updates.profesi !== undefined && updates.profesi?.trim() !== this.profesi) {
      changes.push({field: 'profesi', oldValue: this.profesi || '', newValue: updates.profesi.trim()});
      this.profesi = updates.profesi.trim();
    }
    
    if (updates.statusPernikahan !== undefined && updates.statusPernikahan !== this.statusPernikahan) {
      changes.push({field: 'statusPernikahan', oldValue: this.statusPernikahan || '', newValue: updates.statusPernikahan});
      this.statusPernikahan = updates.statusPernikahan;
    }
    
    if (updates.mediaKomunikasi !== undefined && updates.mediaKomunikasi !== this.mediaKomunikasi) {
      changes.push({field: 'mediaKomunikasi', oldValue: this.mediaKomunikasi || '', newValue: updates.mediaKomunikasi});
      this.mediaKomunikasi = updates.mediaKomunikasi;
    }
    
    if (updates.mission !== undefined && updates.mission !== this.mission) {
      changes.push({field: 'mission', oldValue: this.mission || '', newValue: updates.mission});
      this.mission = updates.mission;
    }
    
    if (updates.alamat !== undefined && updates.alamat.trim() !== this.alamat) {
      changes.push({field: 'alamat', oldValue: this.alamat, newValue: updates.alamat.trim()});
      this.alamat = updates.alamat.trim();
    }
    
    if (updates.provinsi !== undefined && updates.provinsi.trim() !== this.provinsi) {
      changes.push({field: 'provinsi', oldValue: this.provinsi, newValue: updates.provinsi.trim()});
      this.provinsi = updates.provinsi.trim();
    }
    
    if (updates.agama !== undefined && updates.agama.trim() !== this.agama) {
      changes.push({field: 'agama', oldValue: this.agama, newValue: updates.agama.trim()});
      this.agama = updates.agama.trim();
    }
    
    if (updates.subAgama !== undefined && updates.subAgama?.trim() !== this.subAgama) {
      changes.push({field: 'subAgama', oldValue: this.subAgama || '', newValue: updates.subAgama.trim()});
      this.subAgama = updates.subAgama.trim();
    }
    
    if (updates.alasanMenghubungi !== undefined && updates.alasanMenghubungi.trim() !== this.alasanMenghubungi) {
      changes.push({field: 'alasanMenghubungi', oldValue: this.alasanMenghubungi, newValue: updates.alasanMenghubungi.trim()});
      this.alasanMenghubungi = updates.alasanMenghubungi.trim();
    }
    
    if (updates.sumber !== undefined && updates.sumber !== this.sumber) {
      changes.push({field: 'sumber', oldValue: this.sumber, newValue: updates.sumber});
      this.sumber = updates.sumber;
    }
    
    if (updates.prioritas !== undefined && updates.prioritas !== this.prioritas) {
      changes.push({field: 'prioritas', oldValue: this.prioritas, newValue: updates.prioritas});
      this.prioritas = updates.prioritas;
    }
    
    if (updates.statusKontak !== undefined && updates.statusKontak !== this.statusKontak) {
      changes.push({field: 'statusKontak', oldValue: this.statusKontak, newValue: updates.statusKontak});
      this.statusKontak = updates.statusKontak;
    }
    
    // Only update timestamp and add history if there were actual changes
    if (changes.length > 0) {
      this.updatedAt = new Date();
      
      // Add history entries for each change
      changes.forEach(change => {
        const historyEntry: ContactHistoryEntry = {
          id: generateId(),
          timestamp: this.updatedAt,
          action: change.field === 'statusKontak' ? 'status_changed' : 'updated',
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          updatedBy: updatedBy,
          notes: `${this.getFieldDisplayName(change.field)} diubah dari "${change.oldValue}" menjadi "${change.newValue}"`
        };
        this.history.push(historyEntry);
      });
    }
  }

  // Helper method to get display name for fields
  private getFieldDisplayName(field: string): string {
    const fieldNames: Record<string, string> = {
      nama: 'Nama',
      nomorTelepon: 'Nomor Telepon',
      jenisKelamin: 'Jenis Kelamin',
      usia: 'Usia',
      profesi: 'Profesi',
      statusPernikahan: 'Status Pernikahan',
      mediaKomunikasi: 'Media Komunikasi',
      mission: 'Mission',
      alamat: 'Alamat',
      provinsi: 'Provinsi',
      agama: 'Agama',
      subAgama: 'Sub Agama',
      alasanMenghubungi: 'Alasan Menghubungi',
      sumber: 'Sumber',
      prioritas: 'Prioritas',
      statusKontak: 'Status Kontak'
    };
    return fieldNames[field] || field;
  }

  // Method to add custom history entry
  addHistoryEntry(action: 'created' | 'updated' | 'status_changed', updatedBy: string, notes?: string, field?: string, oldValue?: string, newValue?: string): void {
    const historyEntry: ContactHistoryEntry = {
      id: generateId(),
      timestamp: new Date(),
      action,
      field,
      oldValue,
      newValue,
      updatedBy,
      notes: notes || `Contact ${action}`
    };
    this.history.push(historyEntry);
  }

  // Method to get history sorted by timestamp (newest first)
  getHistory(): ContactHistoryEntry[] {
    return [...this.history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Method to get recent history (last N entries)
  getRecentHistory(limit: number = 5): ContactHistoryEntry[] {
    return this.getHistory().slice(0, limit);
  }

  // Convert to plain object
  toObject(): Contact {
    return {
      id: this.id,
      createdAt: this.createdAt,
      nama: this.nama,
      nomorTelepon: this.nomorTelepon,
      jenisKelamin: this.jenisKelamin,
      usia: this.usia,
      profesi: this.profesi,
      statusPernikahan: this.statusPernikahan,
      mediaKomunikasi: this.mediaKomunikasi,
      mission: this.mission,
      alamat: this.alamat,
      provinsi: this.provinsi,
      agama: this.agama,
      subAgama: this.subAgama,
      alasanMenghubungi: this.alasanMenghubungi,
      sumber: this.sumber,
      prioritas: this.prioritas,
      statusKontak: this.statusKontak,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      history: this.history
    };
  }

  // Convert to JSON string
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  // Check if contact matches search criteria
  matchesSearch(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      this.nama.toLowerCase().includes(term) ||
      this.nomorTelepon.toLowerCase().includes(term) ||
      this.jenisKelamin.toLowerCase().includes(term) ||
      (this.usia && String(this.usia).includes(term)) ||
      (this.profesi && this.profesi.toLowerCase().includes(term)) ||
      (this.statusPernikahan && this.statusPernikahan.toLowerCase().includes(term)) ||
      (this.mediaKomunikasi && this.mediaKomunikasi.toLowerCase().includes(term)) ||
      (this.mission && this.mission.toLowerCase().includes(term)) ||
      this.alamat.toLowerCase().includes(term) ||
      this.provinsi.toLowerCase().includes(term) ||
      this.agama.toLowerCase().includes(term) ||
      (this.subAgama && this.subAgama.toLowerCase().includes(term)) ||
      this.alasanMenghubungi.toLowerCase().includes(term) ||
      this.sumber.toLowerCase().includes(term) ||
      this.prioritas.toLowerCase().includes(term) ||
      this.statusKontak.toLowerCase().includes(term)
    );
  }

  // Get contact age in days
  getAgeInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if contact was recently updated (within last 24 hours)
  isRecentlyUpdated(): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.updatedAt.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24;
  }
}

// Factory functions for creating contacts
export const createContact = (
  nama: string,
  nomorTelepon: string,
  jenisKelamin: Gender,
  alamat: string,
  provinsi: string,
  agama: string,
  alasanMenghubungi: string,
  sumber: Sumber,
  prioritas: Priority,
  statusKontak: ContactStatus,
  createdBy: string,
  usia?: number,
  profesi?: string,
  statusPernikahan?: StatusPernikahan,
  mediaKomunikasi?: MediaKomunikasi,
  mission?: string,
  subAgama?: string
): ContactModel => {
  return new ContactModel(nama, nomorTelepon, jenisKelamin, alamat, provinsi, agama, alasanMenghubungi, sumber, prioritas, statusKontak, createdBy, usia, profesi, statusPernikahan, mediaKomunikasi, mission, subAgama);
};

export const createContactFromData = (data: Partial<Contact>): ContactModel | null => {
  const validation = ContactModel.validate(data);
  if (!validation.isValid) {
    return null;
  }

  return new ContactModel(
    data.nama!,
    data.nomorTelepon!,
    data.jenisKelamin!,
    data.alamat!,
    data.provinsi!,
    data.agama!,
    data.alasanMenghubungi!,
    data.sumber!,
    data.prioritas!,
    data.statusKontak!,
    data.createdBy!,
    data.usia,
    data.profesi,
    data.statusPernikahan,
    data.mediaKomunikasi,
    data.mission,
    data.subAgama,
    data.id,
    data.createdAt ? new Date(data.createdAt) : undefined,
    data.updatedAt ? new Date(data.updatedAt) : undefined
  );
};