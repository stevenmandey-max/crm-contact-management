// Application constants

export const CONTACT_STATUSES: string[] = [
  'New Contact',
  'In Progress', 
  'Follow Up',
  'Completed'
];

export const RELIGION_OPTIONS: string[] = [
  'Islam',
  'Protestan',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu',
  'Advent'
];

export const PROTESTAN_CHURCHES: string[] = [
  'Gereja Kristen Indonesia — GKI',
  'Gereja Kristen Jawa — GKJ',
  'Gereja Bethel Indonesia — GBI',
  'Gereja Pantekosta di Indonesia — GPdI',
  'Gereja Protestan di Indonesia bagian Barat — GPIB',
  'Gereja Protestan Maluku — GPM',
  'Huria Kristen Batak Protestan — HKBP',
  'Gereja Huria Kristen Indonesia — HKI',
  'Gereja Methodis Indonesia — GMI',
  'Gereja Sidang-Sidang Jemaat Allah di Indonesia — GSJA',
  'Gereja Reformed Injili Indonesia — GRII',
  'Gereja Kristen Bethel Indonesia — GKBI',
  'Gereja Kristen Nazarene Indonesia — GKNI',
  'Gereja Isa Almasih — GIA',
  'Gereja Kristen Protestan Simalungun — GKPS',
  'Gereja Kristen Protestan Angkola — GKPA',
  'Gereja Kristen Protestan Indonesia — GKPI',
  'Gereja Toraja — GT',
  'Gereja Toraja Mamasa — GTM',
  'Gereja Kristen Sulawesi Tengah — GKST',
  'Gereja Kristen Celebes — GKC',
  'Gereja Kristen Kalimantan Barat — GKKB',
  'Gereja Kalimantan Evangelis — GKE',
  'Gereja Kristen Indonesia di Tanah Papua — GKI Papua',
  'Gereja Kemah Injil Indonesia — GKII',
  'Gereja Bala Keselamatan — BK',
  'Gereja Kristen Indonesia Jawa Barat — GKI Jabar',
  'Gereja Kristen Jawa Tengah — GKJT',
  'Gereja Kristen Jawa Wetan — GKJW',
  'Gereja Kristen Baptis Indonesia — GKBI atau GKBI Baptis',
  'Gereja Baptis Indonesia — GBI Baptis',
  'Gereja Pantekosta Serikat Indonesia — GPSI',
  'Gereja Pantekosta Tabernakel — GPT',
  'Gereja Masehi Injili di Timor — GMIT',
  'Gereja Masehi Injili di Minahasa — GMIM',
  'Gereja Masehi Injili di Halmahera — GMIH',
  'Gereja Masehi Injili Sangihe Talaud — GMIST',
  'Gereja Masehi Injili di Bolaang Mongondow — GMIBM',
  'Gereja Masehi Injili di Talaud — GMITa',
  'Gereja Kristen Oikoumene di Indonesia — GKOI',
  'Gereja Persekutuan Kristen Alkitab Indonesia — GPKAI',
  'Gereja Pentakosta Pusat Surabaya — GPPS',
  'Gereja Kristen Setia Indonesia — GKSI',
  'Gereja Sidang Jemaat Kristus — GSJK',
  'Gereja Kristen Anugerah Indonesia — GKAI',
  'Gereja Alkitab Anugerah — GAA',
  'Gereja Kristen Kerasulan Baru — GKNB',
  'Gereja Pantekosta Isa Almasih — GPIA'
];

export const GENDER_OPTIONS: string[] = [
  'Laki-laki',
  'Perempuan'
];

export const PRIORITY_OPTIONS: string[] = [
  'Rendah',
  'Sedang',
  'Tinggi',
  'Urgent'
];

export const SUMBER_OPTIONS: string[] = [
  'Parabola',
  'IndiHome',
  'Youtube',
  'Facebook',
  'Instagram',
  'Website',
  'Search Engine',
  'Layanan Doa'
];

export const STATUS_PERNIKAHAN_OPTIONS: string[] = [
  'Menikah',
  'Tidak Menikah'
];

export const MEDIA_KOMUNIKASI_OPTIONS: string[] = [
  'WhatsApp Chat',
  'WhatsApp Call',
  'Telepon',
  'SMS'
];

// Legacy MISSION_OPTIONS - now replaced by territory-based system
// export const MISSION_OPTIONS: string[] = [
//   'NSM', 'CSM', 'SSM', 'JBC', 'JC', 'WJC', 'CJM', 'EJC', 'NTM', 'WKR', 'EKM'
// ];

// Service Tracking Constants
export const SERVICE_VALIDATION_RULES = {
  maxDurationPerSession: 480, // 8 hours in minutes
  maxDurationPerDay: 960, // 16 hours in minutes
  maxFutureDate: 0, // cannot log future services
  maxPastDate: 365 // cannot log services older than 1 year
};

export const QUICK_DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 }
];

export const SERVICE_STORAGE_KEYS = {
  SERVICES: 'crm_services',
  SERVICE_METRICS: 'crm_service_metrics'
};

// Legacy PROVINSI_OPTIONS - now replaced by territory-based system
// export const PROVINSI_OPTIONS: string[] = [
//   'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
//   'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung',
//   'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
//   'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
//   'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
//   'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
//   'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya'
// ];

export const USER_ROLES = {
  ADMIN: 'Admin' as const,
  EDITOR: 'Editor' as const
};

export const EXPORT_FORMATS = ['csv', 'excel'] as const;

export const EXPORT_DATE_RANGES = [
  'daily',
  'weekly', 
  'monthly',
  'yearly',
  'custom'
] as const;

export const STORAGE_KEYS = {
  CONTACTS: 'crm_contacts',
  USERS: 'crm_users',
  SETTINGS: 'crm_settings',
  CURRENT_USER: 'crm_current_user'
};

export const DEFAULT_CONTACT_FIELDS: Array<keyof import('../types').Contact> = [
  'id',
  'createdAt',
  'nama',
  'nomorTelepon',
  'jenisKelamin',
  'alamat',
  'provinsi',
  'agama',
  'subAgama',
  'alasanMenghubungi',
  'sumber',
  'prioritas',
  'statusKontak',
  'updatedAt',
  'createdBy'
];

export const STORAGE_VERSION = '1.0.0';