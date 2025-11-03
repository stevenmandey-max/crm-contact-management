// Territory data mapping for Indonesia SDA Church organization structure
// Complete data based on Excel provided by user

export interface TerritoryInfo {
  provinsi: string;
  kabKota: string;
  mission: string;
  uni: string;
}

// Territory mapping data - Complete structure
const TERRITORY_DATA: Record<string, Record<string, { mission: string; uni: string }>> = {
  // WIUM - Western Indonesia Union Mission
  'Aceh': {
    'Kabupaten Aceh Barat': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Barat Daya': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Besar': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Jaya': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Selatan': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Singkil': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Tamiang': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Tengah': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Tenggara': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Timur': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Aceh Utara': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Bener Meriah': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Bireuen': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Gayo Lues': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Nagan Raya': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Pidie': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Pidie Jaya': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Simeulue': { mission: 'NSM', uni: 'WIUM' },
    'Kota Banda Aceh': { mission: 'NSM', uni: 'WIUM' },
    'Kota Langsa': { mission: 'NSM', uni: 'WIUM' },
    'Kota Lhokseumawe': { mission: 'NSM', uni: 'WIUM' },
    'Kota Sabang': { mission: 'NSM', uni: 'WIUM' },
    'Kota Subulussalam': { mission: 'NSM', uni: 'WIUM' }
  },
  
  'Sumatera Utara': {
    'Kabupaten Asahan': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Batu Bara': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Dairi': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Deli Serdang': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Humbang Hasundutan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Karo': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Labuhanbatu': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Labuhanbatu Selatan': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Labuhanbatu Utara': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Langkat': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Mandailing Natal': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Nias': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Nias Barat': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Nias Selatan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Nias Utara': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Padang Lawas': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Padang Lawas Utara': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Pakpak Bharat': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Samosir': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Serdang Bedagai': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Simalungun': { mission: 'NSM', uni: 'WIUM' },
    'Kabupaten Tapanuli Selatan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Tapanuli Tengah': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Tapanuli Utara': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Toba': { mission: 'NSM', uni: 'WIUM' },
    'Kota Binjai': { mission: 'NSM', uni: 'WIUM' },
    'Kota Gunungsitoli': { mission: 'NSM', uni: 'WIUM' },
    'Kota Medan': { mission: 'NSM', uni: 'WIUM' },
    'Kota Padangsidimpuan': { mission: 'NSM', uni: 'WIUM' },
    'Kota Pematangsiantar': { mission: 'NSM', uni: 'WIUM' },
    'Kota Sibolga': { mission: 'NSM', uni: 'WIUM' },
    'Kota Tanjungbalai': { mission: 'NSM', uni: 'WIUM' },
    'Kota Tebing Tinggi': { mission: 'NSM', uni: 'WIUM' }
  },

  'Sumatera Barat': {
    'Kabupaten Agam': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Dharmasraya': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Kepulauan Mentawai': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Lima Puluh Kota': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Padang Pariaman': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Pasaman': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Pasaman Barat': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Pesisir Selatan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Sijunjung': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Solok': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Solok Selatan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Tanah Datar': { mission: 'CSM', uni: 'WIUM' },
    'Kota Bukittinggi': { mission: 'CSM', uni: 'WIUM' },
    'Kota Padang': { mission: 'CSM', uni: 'WIUM' },
    'Kota Padang Panjang': { mission: 'CSM', uni: 'WIUM' },
    'Kota Pariaman': { mission: 'CSM', uni: 'WIUM' },
    'Kota Payakumbuh': { mission: 'CSM', uni: 'WIUM' },
    'Kota Sawahlunto': { mission: 'CSM', uni: 'WIUM' },
    'Kota Solok': { mission: 'CSM', uni: 'WIUM' }
  },

  'Riau': {
    'Kabupaten Kampar': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Indragiri Hulu': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Bengkalis': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Indragiri Hilir': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Pelalawan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Rokan Hulu': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Rokan Hilir': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Siak': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Kuantan Singingi': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Kepulauan Meranti': { mission: 'CSM', uni: 'WIUM' },
    'Kota Pekanbaru': { mission: 'CSM', uni: 'WIUM' },
    'Kota Dumai': { mission: 'CSM', uni: 'WIUM' }
  },

  'Kepulauan Riau': {
    'Kabupaten Bintan': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Karimun': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Natuna': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Lingga': { mission: 'CSM', uni: 'WIUM' },
    'Kabupaten Kepulauan Anambas': { mission: 'CSM', uni: 'WIUM' },
    'Kota Batam': { mission: 'CSM', uni: 'WIUM' },
    'Kota Tanjung Pinang': { mission: 'CSM', uni: 'WIUM' }
  },

  'Jambi': {
    'Kabupaten Kerinci': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Merangin': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Sarolangun': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Batanghari': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Muaro Jambi': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Tanjung Jabung Barat': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Tanjung Jabung Timur': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Bungo': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Tebo': { mission: 'SSM', uni: 'WIUM' },
    'Kota Jambi': { mission: 'SSM', uni: 'WIUM' },
    'Kota Sungai Penuh': { mission: 'SSM', uni: 'WIUM' }
  },

  'Sumatera Selatan': {
    'Kabupaten Ogan Komering Ulu': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Ogan Komering Ilir': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Muara Enim': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Lahat': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Musi Rawas': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Musi Banyuasin': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Banyuasin': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Ogan Komering Ulu Timur': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Ogan Komering Ulu Selatan': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Ogan Ilir': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Empat Lawang': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Penukal Abab Lematang Ilir': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Musi Rawas Utara': { mission: 'SSM', uni: 'WIUM' },
    'Kota Palembang': { mission: 'SSM', uni: 'WIUM' },
    'Kota Pagar Alam': { mission: 'SSM', uni: 'WIUM' },
    'Kota Lubuk Linggau': { mission: 'SSM', uni: 'WIUM' },
    'Kota Prabumulih': { mission: 'SSM', uni: 'WIUM' }
  },

  'Kepulauan Bangka Belitung': {
    'Kabupaten Bangka': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Belitung': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Bangka Selatan': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Bangka Tengah': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Bangka Barat': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Belitung Timur': { mission: 'SSM', uni: 'WIUM' },
    'Kota Pangkal Pinang': { mission: 'SSM', uni: 'WIUM' }
  },

  'Bengkulu': {
    'Kabupaten Bengkulu Selatan': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Rejang Lebong': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Bengkulu Utara': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Kaur': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Seluma': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Muko Muko': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Lebong': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Kepahiang': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Bengkulu Tengah': { mission: 'SSM', uni: 'WIUM' },
    'Kota Bengkulu': { mission: 'SSM', uni: 'WIUM' }
  },

  'Lampung': {
    'Kabupaten Lampung Selatan': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Lampung Tengah': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Lampung Utara': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Lampung Barat': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Tulang Bawang': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Tanggamus': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Lampung Timur': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Way Kanan': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Pesawaran': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Pringsewu': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Mesuji': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Tulang Bawang Barat': { mission: 'SSM', uni: 'WIUM' },
    'Kabupaten Pesisir Barat': { mission: 'SSM', uni: 'WIUM' },
    'Kota Bandar Lampung': { mission: 'SSM', uni: 'WIUM' },
    'Kota Metro': { mission: 'SSM', uni: 'WIUM' }
  },

  'Banten': {
    'Kabupaten Pandeglang': { mission: 'JBC', uni: 'WIUM' },
    'Kabupaten Lebak': { mission: 'JBC', uni: 'WIUM' },
    'Kabupaten Tangerang': { mission: 'JBC', uni: 'WIUM' },
    'Kabupaten Serang': { mission: 'JBC', uni: 'WIUM' },
    'Kota Tangerang': { mission: 'JBC', uni: 'WIUM' },
    'Kota Cilegon': { mission: 'JBC', uni: 'WIUM' },
    'Kota Serang': { mission: 'JBC', uni: 'WIUM' },
    'Kota Tangerang Selatan': { mission: 'JBC', uni: 'WIUM' }
  },

  // Jakarta - Special case with dual UNI coverage
  'Jakarta': {
    'Kepulauan Seribu': { mission: 'JBC', uni: 'WIUM' },
    'Jakarta Utara': { mission: 'JBC', uni: 'WIUM' },
    'Jakarta Barat': { mission: 'JBC', uni: 'WIUM' },
    'Jakarta Pusat': { mission: 'JC', uni: 'CIUM' },
    'Jakarta Selatan': { mission: 'JC', uni: 'CIUM' },
    'Jakarta Timur': { mission: 'JC', uni: 'CIUM' }
  },

  // CIUM - Central Indonesia Union Mission
  'Jawa Barat': {
    'Depok': { mission: 'JC', uni: 'CIUM' },
    'Bekasi': { mission: 'JC', uni: 'CIUM' },
    'Bogor': { mission: 'JC', uni: 'CIUM' },
    'Karawang': { mission: 'JC', uni: 'CIUM' },
    'Sukabumi': { mission: 'JC', uni: 'CIUM' },
    'Purwakarta': { mission: 'JC', uni: 'CIUM' },
    'Kabupaten Cianjur': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Bandung': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Garut': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Tasikmalaya': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Ciamis': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Kuningan': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Cirebon': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Majalengka': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Sumedang': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Indramayu': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Subang': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Karawang': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Bandung Barat': { mission: 'WJC', uni: 'CIUM' },
    'Kabupaten Pangandaran': { mission: 'WJC', uni: 'CIUM' },
    'Kota Bandung': { mission: 'WJC', uni: 'CIUM' },
    'Kota Cirebon': { mission: 'WJC', uni: 'CIUM' },
    'Kota Cimahi': { mission: 'WJC', uni: 'CIUM' },
    'Kota Tasikmalaya': { mission: 'WJC', uni: 'CIUM' },
    'Kota Banjar': { mission: 'WJC', uni: 'CIUM' }
  }
};

// Get list of all provinces
export const getProvinsiList = (): string[] => {
  return Object.keys(TERRITORY_DATA).sort();
};

// Get list of kabupaten/kota for a specific province
export const getKabKotaByProvinsi = (provinsi: string): string[] => {
  const provinsiData = TERRITORY_DATA[provinsi];
  if (!provinsiData) return [];
  return Object.keys(provinsiData).sort();
};

// Get mission for a specific kabupaten/kota in a province
export const getMissionByKabKota = (provinsi: string, kabKota: string): string => {
  const provinsiData = TERRITORY_DATA[provinsi];
  if (!provinsiData) return '';
  const kabKotaData = provinsiData[kabKota];
  if (!kabKotaData) return '';
  return kabKotaData.mission;
};

// Get uni for a specific kabupaten/kota in a province
export const getUniByKabKota = (provinsi: string, kabKota: string): string => {
  const provinsiData = TERRITORY_DATA[provinsi];
  if (!provinsiData) return '';
  const kabKotaData = provinsiData[kabKota];
  if (!kabKotaData) return '';
  return kabKotaData.uni;
};

// Get complete territory info
export const getTerritoryInfo = (provinsi: string, kabKota: string): TerritoryInfo | null => {
  const provinsiData = TERRITORY_DATA[provinsi];
  if (!provinsiData) return null;
  const kabKotaData = provinsiData[kabKota];
  if (!kabKotaData) return null;
  
  return {
    provinsi,
    kabKota,
    mission: kabKotaData.mission,
    uni: kabKotaData.uni
  };
};

// Add remaining CIUM and EIUC data
Object.assign(TERRITORY_DATA, {
  'Jawa Tengah': {
    'Kabupaten Cilacap': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Banyumas': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Purbalingga': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Banjarnegara': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Kebumen': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Purworejo': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Wonosobo': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Magelang': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Boyolali': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Klaten': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Sukoharjo': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Wonogiri': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Karanganyar': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Sragen': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Grobogan': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Blora': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Rembang': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Pati': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Kudus': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Jepara': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Demak': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Semarang': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Temanggung': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Kendal': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Batang': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Pekalongan': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Pemalang': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Tegal': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Brebes': { mission: 'CJM', uni: 'CIUM' },
    'Kota Magelang': { mission: 'CJM', uni: 'CIUM' },
    'Kota Surakarta': { mission: 'CJM', uni: 'CIUM' },
    'Kota Salatiga': { mission: 'CJM', uni: 'CIUM' },
    'Kota Semarang': { mission: 'CJM', uni: 'CIUM' },
    'Kota Pekalongan': { mission: 'CJM', uni: 'CIUM' },
    'Kota Tegal': { mission: 'CJM', uni: 'CIUM' }
  },

  'DI Yogyakarta': {
    'Kabupaten Kulon Progo': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Bantul': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Gunungkidul': { mission: 'CJM', uni: 'CIUM' },
    'Kabupaten Sleman': { mission: 'CJM', uni: 'CIUM' },
    'Kota Yogyakarta': { mission: 'CJM', uni: 'CIUM' }
  },

  'Jawa Timur': {
    'Kabupaten Pacitan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Ponorogo': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Trenggalek': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Tulungagung': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Blitar': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Kediri': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Malang': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Lumajang': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Jember': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Banyuwangi': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Bondowoso': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Situbondo': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Probolinggo': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Pasuruan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Sidoarjo': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Mojokerto': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Jombang': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Nganjuk': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Madiun': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Magetan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Ngawi': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Bojonegoro': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Tuban': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Lamongan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Gresik': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Bangkalan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Sampang': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Pamekasan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Sumenep': { mission: 'EJC', uni: 'CIUM' },
    'Kota Kediri': { mission: 'EJC', uni: 'CIUM' },
    'Kota Blitar': { mission: 'EJC', uni: 'CIUM' },
    'Kota Malang': { mission: 'EJC', uni: 'CIUM' },
    'Kota Probolinggo': { mission: 'EJC', uni: 'CIUM' },
    'Kota Pasuruan': { mission: 'EJC', uni: 'CIUM' },
    'Kota Mojokerto': { mission: 'EJC', uni: 'CIUM' },
    'Kota Madiun': { mission: 'EJC', uni: 'CIUM' },
    'Kota Surabaya': { mission: 'EJC', uni: 'CIUM' },
    'Kota Batu': { mission: 'EJC', uni: 'CIUM' }
  },

  'Bali': {
    'Kabupaten Jembrana': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Tabanan': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Badung': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Gianyar': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Klungkung': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Bangli': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Karangasem': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Buleleng': { mission: 'EJC', uni: 'CIUM' },
    'Kota Denpasar': { mission: 'EJC', uni: 'CIUM' }
  },

  'Nusa Tenggara Barat': {
    'Kabupaten Lombok Barat': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Lombok Tengah': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Lombok Timur': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Sumbawa': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Dompu': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Bima': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Sumbawa Barat': { mission: 'EJC', uni: 'CIUM' },
    'Kabupaten Lombok Utara': { mission: 'EJC', uni: 'CIUM' },
    'Kota Mataram': { mission: 'EJC', uni: 'CIUM' },
    'Kota Bima': { mission: 'EJC', uni: 'CIUM' }
  },

  'Nusa Tenggara Timur': {
    'Kabupaten Kupang': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Timor Tengah Selatan': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Timor Tengah Utara': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Belu': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Alor': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Flores Timur': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Sikka': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Ende': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Ngada': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Manggarai': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Sumba Timur': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Sumba Barat': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Lembata': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Rote Ndao': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Manggarai Barat': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Nagekeo': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Sumba Tengah': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Sumba Barat Daya': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Manggarai Timur': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Sabu Raijua': { mission: 'NTM', uni: 'CIUM' },
    'Kabupaten Malaka': { mission: 'NTM', uni: 'CIUM' },
    'Kota Kupang': { mission: 'NTM', uni: 'CIUM' }
  },

  'Kalimantan Barat': {
    'Kabupaten Sambas': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Mempawah': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Sanggau': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Ketapang': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Sintang': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Kapuas Hulu': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Bengkayang': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Landak': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Sekadau': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Melawi': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Kayong Utara': { mission: 'WKR', uni: 'CIUM' },
    'Kabupaten Kubu Raya': { mission: 'WKR', uni: 'CIUM' },
    'Kota Pontianak': { mission: 'WKR', uni: 'CIUM' },
    'Kota Singkawang': { mission: 'WKR', uni: 'CIUM' }
  },

  'Kalimantan Tengah': {
    'Kabupaten Kotawaringin Barat': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Kotawaringin Timur': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Kapuas': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Barito Selatan': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Barito Utara': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Katingan': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Seruyan': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Sukamara': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Lamandau': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Gunung Mas': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Pulang Pisau': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Murung Raya': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Barito Timur': { mission: 'EKM', uni: 'CIUM' },
    'Kota Palangkaraya': { mission: 'EKM', uni: 'CIUM' }
  },

  'Kalimantan Selatan': {
    'Kabupaten Tanah Laut': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Kotabaru': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Banjar': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Barito Kuala': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Tapin': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Hulu Sungai Selatan': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Hulu Sungai Tengah': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Hulu Sungai Utara': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Tabalong': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Tanah Bumbu': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Balangan': { mission: 'EKM', uni: 'CIUM' },
    'Kota Banjarmasin': { mission: 'EKM', uni: 'CIUM' },
    'Kota Banjarbaru': { mission: 'EKM', uni: 'CIUM' }
  },

  'Kalimantan Timur': {
    'Kabupaten Paser': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Kutai Kartanegara': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Berau': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Kutai Barat': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Kutai Timur': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Penajam Paser Utara': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Mahakam Ulu': { mission: 'EKM', uni: 'CIUM' },
    'Kota Balikpapan': { mission: 'EKM', uni: 'CIUM' },
    'Kota Samarinda': { mission: 'EKM', uni: 'CIUM' },
    'Kota Bontang': { mission: 'EKM', uni: 'CIUM' }
  },

  'Kalimantan Utara': {
    'Kabupaten Bulungan': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Malinau': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Nunukan': { mission: 'EKM', uni: 'CIUM' },
    'Kabupaten Tana Tidung': { mission: 'EKM', uni: 'CIUM' },
    'Kota Tarakan': { mission: 'EKM', uni: 'CIUM' }
  },

  // EIUC - Eastern Indonesia Union Conference
  'Gorontalo': {
    'Gorontalo': { mission: 'BMGM', uni: 'EIUC' },
    'Boalemo': { mission: 'BMGM', uni: 'EIUC' },
    'Bone Bolango': { mission: 'BMGM', uni: 'EIUC' },
    'Gorontalo Utara': { mission: 'BMGM', uni: 'EIUC' },
    'Pohuwato': { mission: 'BMGM', uni: 'EIUC' }
  },

  'Maluku Utara': {
    'Ternate': { mission: 'MNMC', uni: 'EIUC' },
    'Tidore Kepulauan': { mission: 'MNMC', uni: 'EIUC' },
    'Halmahera Barat': { mission: 'MNMC', uni: 'EIUC' },
    'Halmahera Selatan': { mission: 'MNMC', uni: 'EIUC' },
    'Halmahera Tengah': { mission: 'MNMC', uni: 'EIUC' },
    'Halmahera Timur': { mission: 'MNMC', uni: 'EIUC' },
    'Halmahera Utara': { mission: 'MNMC', uni: 'EIUC' },
    'Kepulauan Sula': { mission: 'MNMC', uni: 'EIUC' },
    'Pulau Morotai': { mission: 'MNMC', uni: 'EIUC' },
    'Pulau Taliabu': { mission: 'MNMC', uni: 'EIUC' }
  },

  'Maluku': {
    'Ambon': { mission: 'MM', uni: 'EIUC' },
    'Tual': { mission: 'MM', uni: 'EIUC' },
    'Buru': { mission: 'MM', uni: 'EIUC' },
    'Buru Selatan': { mission: 'MM', uni: 'EIUC' },
    'Kepulauan Aru': { mission: 'MM', uni: 'EIUC' },
    'Kepulauan Tanimbar': { mission: 'MM', uni: 'EIUC' },
    'Maluku Barat Daya': { mission: 'MM', uni: 'EIUC' },
    'Maluku Tengah': { mission: 'MM', uni: 'EIUC' },
    'Maluku Tenggara': { mission: 'MM', uni: 'EIUC' },
    'Seram Bagian Barat': { mission: 'MM', uni: 'EIUC' },
    'Seram Bagian Timur': { mission: 'MM', uni: 'EIUC' }
  },

  'Papua Barat Daya': {
    'Sorong (Kota)': { mission: 'SPM', uni: 'EIUC' },
    'Maybrat': { mission: 'SPM', uni: 'EIUC' },
    'Raja Ampat': { mission: 'SPM', uni: 'EIUC' },
    'Sorong (Kabupaten)': { mission: 'SPM', uni: 'EIUC' },
    'Sorong Selatan': { mission: 'SPM', uni: 'EIUC' },
    'Tambrauw': { mission: 'SPM', uni: 'EIUC' }
  },

  'Papua': {
    'Jayapura': { mission: 'PM', uni: 'EIUC' },
    'Biak Numfor': { mission: 'PM', uni: 'EIUC' },
    'Jayapura (Kabupaten)': { mission: 'PM', uni: 'EIUC' },
    'Keerom': { mission: 'PM', uni: 'EIUC' },
    'Kepulauan Yapen': { mission: 'PM', uni: 'EIUC' },
    'Mamberamo Raya': { mission: 'PM', uni: 'EIUC' },
    'Sarmi': { mission: 'PM', uni: 'EIUC' },
    'Supiori': { mission: 'PM', uni: 'EIUC' },
    'Waropen': { mission: 'PM', uni: 'EIUC' }
  },

  'Papua Barat': {
    'Fakfak': { mission: 'WPM', uni: 'EIUC' },
    'Kaimana': { mission: 'WPM', uni: 'EIUC' },
    'Manokwari': { mission: 'WPM', uni: 'EIUC' },
    'Manokwari Selatan': { mission: 'WPM', uni: 'EIUC' },
    'Pegunungan Arfak': { mission: 'WPM', uni: 'EIUC' },
    'Teluk Bintuni': { mission: 'WPM', uni: 'EIUC' },
    'Teluk Wondama': { mission: 'WPM', uni: 'EIUC' }
  },

  'Sulawesi Tengah': {
    'Palu': { mission: 'CSM', uni: 'EIUC' },
    'Banggai': { mission: 'CSM', uni: 'EIUC' },
    'Banggai Kepulauan': { mission: 'CSM', uni: 'EIUC' },
    'Banggai Laut': { mission: 'CSM', uni: 'EIUC' },
    'Buol': { mission: 'CSM', uni: 'EIUC' },
    'Donggala': { mission: 'CSM', uni: 'EIUC' },
    'Morowali': { mission: 'CSM', uni: 'EIUC' },
    'Morowali Utara': { mission: 'CSM', uni: 'EIUC' },
    'Parigi Moutong': { mission: 'CSM', uni: 'EIUC' },
    'Poso': { mission: 'CSM', uni: 'EIUC' },
    'Sigi': { mission: 'CSM', uni: 'EIUC' },
    'Tojo Una Una': { mission: 'CSM', uni: 'EIUC' },
    'Tolitoli': { mission: 'CSM', uni: 'EIUC' }
  },

  'Sulawesi Tenggara': {
    'Baubau': { mission: 'SSC', uni: 'EIUC' },
    'Tenggari': { mission: 'SSC', uni: 'EIUC' },
    'Bombana': { mission: 'SSC', uni: 'EIUC' },
    'Buton': { mission: 'SSC', uni: 'EIUC' },
    'Buton Selatan': { mission: 'SSC', uni: 'EIUC' },
    'Buton Tengah': { mission: 'SSC', uni: 'EIUC' },
    'Buton Utara': { mission: 'SSC', uni: 'EIUC' },
    'Kolaka': { mission: 'SSC', uni: 'EIUC' },
    'Kolaka Timur': { mission: 'SSC', uni: 'EIUC' },
    'Kolaka Utara': { mission: 'SSC', uni: 'EIUC' },
    'Konawe': { mission: 'SSC', uni: 'EIUC' },
    'Konawe Kepulauan': { mission: 'SSC', uni: 'EIUC' },
    'Konawe Selatan': { mission: 'SSC', uni: 'EIUC' },
    'Konawe Utara': { mission: 'SSC', uni: 'EIUC' },
    'Muna': { mission: 'SSC', uni: 'EIUC' },
    'Muna Barat Wakatobi': { mission: 'SSC', uni: 'EIUC' }
  },

  'Sulawesi Utara': {
    'Bitung': { mission: 'NMBM', uni: 'EIUC' },
    'Minahasa Utara': { mission: 'NMBM', uni: 'EIUC' },
    'Manado': { mission: 'MNMC', uni: 'EIUC' },
    'Kotamobagu': { mission: 'BMGM', uni: 'EIUC' },
    'Bolaang Mongondow': { mission: 'BMGM', uni: 'EIUC' },
    'Bolaang Mongondow Selatan': { mission: 'BMGM', uni: 'EIUC' },
    'Bolaang Mongondow Timur': { mission: 'BMGM', uni: 'EIUC' },
    'Bolaang Mongondow Utara': { mission: 'BMGM', uni: 'EIUC' },
    'Kepulauan Sangihe': { mission: 'NIM', uni: 'EIUC' },
    'Kepulauan Siau Tagulandang Biaro': { mission: 'NIM', uni: 'EIUC' },
    'Kepulauan Talaud': { mission: 'NIM', uni: 'EIUC' },
    'Minahasa': { mission: 'MC', uni: 'EIUC' },
    'Minahasa Selatan': { mission: 'MC', uni: 'EIUC' },
    'Minahasa Tenggara': { mission: 'MC', uni: 'EIUC' },
    'Tomohon': { mission: 'MC', uni: 'EIUC' }
  },

  'Papua Pegunungan': {
    'Jayawijaya': { mission: 'PM', uni: 'EIUC' },
    'Lanny Jaya': { mission: 'PM', uni: 'EIUC' },
    'Mamberamo Tengah': { mission: 'PM', uni: 'EIUC' },
    'Nduga': { mission: 'PM', uni: 'EIUC' },
    'Pegunungan Bintang': { mission: 'PM', uni: 'EIUC' },
    'Tolikara': { mission: 'PM', uni: 'EIUC' },
    'Yahukimo': { mission: 'PM', uni: 'EIUC' },
    'Yalimo': { mission: 'PM', uni: 'EIUC' }
  },

  'Papua Selatan': {
    'Asmat': { mission: 'PM', uni: 'EIUC' },
    'Boven Digoel': { mission: 'PM', uni: 'EIUC' },
    'Mappi': { mission: 'PM', uni: 'EIUC' },
    'Merauke': { mission: 'PM', uni: 'EIUC' }
  },

  'Papua Tengah': {
    'Deiyai': { mission: 'CPM', uni: 'EIUC' },
    'Dogiyai': { mission: 'CPM', uni: 'EIUC' },
    'Intan Jaya': { mission: 'CPM', uni: 'EIUC' },
    'Mimika': { mission: 'CPM', uni: 'EIUC' },
    'Nabire': { mission: 'CPM', uni: 'EIUC' },
    'Paniai': { mission: 'CPM', uni: 'EIUC' },
    'Puncak': { mission: 'CPM', uni: 'EIUC' },
    'Puncak Jaya': { mission: 'CPM', uni: 'EIUC' }
  },

  'Sulawesi Selatan': {
    'Makassar': { mission: 'SSC', uni: 'EIUC' },
    'Palopo': { mission: 'LTTM', uni: 'EIUC' },
    'Parepare': { mission: 'SSC', uni: 'EIUC' },
    'Bantaeng': { mission: 'SSC', uni: 'EIUC' },
    'Barru': { mission: 'SSC', uni: 'EIUC' },
    'Bone': { mission: 'SSC', uni: 'EIUC' },
    'Bulukumba': { mission: 'SSC', uni: 'EIUC' },
    'Enrekang': { mission: 'SSC', uni: 'EIUC' },
    'Gowa': { mission: 'SSC', uni: 'EIUC' },
    'Jeneponto': { mission: 'SSC', uni: 'EIUC' },
    'Kepulauan Selayar': { mission: 'SSC', uni: 'EIUC' },
    'Luwu': { mission: 'LTTM', uni: 'EIUC' },
    'Luwu Timur': { mission: 'LTTM', uni: 'EIUC' },
    'Luwu Utara': { mission: 'LTTM', uni: 'EIUC' },
    'Maros': { mission: 'SSC', uni: 'EIUC' },
    'Pangkajene Dan Kepulauan': { mission: 'SSC', uni: 'EIUC' },
    'Pinrang': { mission: 'SSC', uni: 'EIUC' },
    'Sidenreng Rappang': { mission: 'SSC', uni: 'EIUC' },
    'Sinjai': { mission: 'SSC', uni: 'EIUC' },
    'Soppeng': { mission: 'SSC', uni: 'EIUC' },
    'Takalar': { mission: 'SSC', uni: 'EIUC' },
    'Tana Toraja': { mission: 'LTTM', uni: 'EIUC' },
    'Toraja Utara': { mission: 'LTTM', uni: 'EIUC' },
    'Wajo': { mission: 'SSC', uni: 'EIUC' }
  }
});

// Get all missions for a specific UNI
export const getMissionsByUni = (uni: string): string[] => {
  const missions = new Set<string>();
  
  Object.values(TERRITORY_DATA).forEach(provinsiData => {
    Object.values(provinsiData).forEach(kabKotaData => {
      if (kabKotaData.uni === uni) {
        missions.add(kabKotaData.mission);
      }
    });
  });
  
  return Array.from(missions).sort();
};

// Get all UNIs
export const getUniList = (): string[] => {
  const unis = new Set<string>();
  
  Object.values(TERRITORY_DATA).forEach(provinsiData => {
    Object.values(provinsiData).forEach(kabKotaData => {
      unis.add(kabKotaData.uni);
    });
  });
  
  return Array.from(unis).sort();
};

// Get mission full name (for display purposes)
export const getMissionFullName = (missionCode: string, uni: string): string => {
  const missionNames: Record<string, Record<string, string>> = {
    'WIUM': {
      'NSM': 'North Sumatera Mission',
      'CSM': 'Central Sumatera Mission',
      'SSM': 'South Sumatera Mission',
      'JBC': 'Jakarta Banten Conference'
    },
    'CIUM': {
      'JC': 'Jakarta Conference',
      'WJC': 'West Java Conference',
      'CJM': 'Central Java Mission',
      'EJC': 'East Java Conference',
      'NTM': 'Nusa Tenggara Mission',
      'WKR': 'West Kalimantan Region',
      'EKM': 'East Kalimantan Mission'
    },
    'EIUC': {
      'BMGM': 'Bolaang Mongondow General Mission',
      'MNMC': 'Minahasa Mission Conference',
      'MM': 'Maluku Mission',
      'SPM': 'South Papua Mission',
      'PM': 'Papua Mission',
      'WPM': 'West Papua Mission',
      'CSM': 'Central Sulawesi Mission',
      'SSC': 'South Sulawesi Conference',
      'NMBM': 'North Minahasa Mission',
      'NIM': 'North Indonesia Mission',
      'MC': 'Minahasa Conference',
      'CPM': 'Central Papua Mission',
      'LTTM': 'Luwu Toraja Mission'
    }
  };
  
  return missionNames[uni]?.[missionCode] || missionCode;
};

// Get UNI full name
export const getUniFullName = (uniCode: string): string => {
  const uniNames: Record<string, string> = {
    'WIUM': 'Western Indonesia Union Mission',
    'CIUM': 'Central Indonesia Union Mission',
    'EIUC': 'Eastern Indonesia Union Conference'
  };
  
  return uniNames[uniCode] || uniCode;
};