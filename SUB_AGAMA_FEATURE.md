# Fitur Sub-Agama dengan Daftar Gereja Protestan

## Deskripsi Fitur
Menambahkan field sub-agama di form kontak yang secara otomatis menyesuaikan dengan pilihan agama:
- **Protestan**: Menampilkan autocomplete dengan daftar 47 gereja Protestan dan fitur pencarian
- **Agama lainnya**: Otomatis terisi dengan nama agama yang dipilih (read-only)

## Implementasi

### 1. Konstanta Gereja Protestan
Ditambahkan di `src/utils/constants.ts`:
```typescript
export const PROTESTAN_CHURCHES: string[] = [
  'Gereja Kristen Indonesia — GKI',
  'Gereja Kristen Jawa — GKJ',
  'Gereja Bethel Indonesia — GBI',
  // ... 44 gereja lainnya
];
```

### 2. Tipe Data
Ditambahkan field `subAgama` ke interface Contact di `src/types/index.ts`:
```typescript
export interface Contact {
  // ... field lainnya
  agama: string;
  subAgama?: string; // Sub-category for religion (e.g., Protestant churches)
  // ... field lainnya
}
```

### 3. Model Contact
Diperbarui `src/models/Contact.ts` untuk mendukung field subAgama:
- Constructor parameter baru
- Method update dengan tracking history
- Method toObject dan fromObject
- Search functionality

### 4. Form UI
Diperbarui `src/components/contacts/ContactForm.tsx`:
- Field sub-agama dengan logika kondisional
- AutocompleteInput untuk gereja Protestan dengan fitur pencarian
- Input read-only untuk agama lainnya
- Validasi dan error handling

## Logika Bisnis

### Ketika Agama = "Protestan"
- Field sub-agama menampilkan AutocompleteInput
- User dapat mengetik untuk mencari gereja
- Dropdown menampilkan hasil pencarian yang relevan
- Placeholder: "Cari nama gereja..."

### Ketika Agama = Lainnya (Islam, Katolik, Hindu, Buddha, Konghucu, Advent)
- Field sub-agama otomatis terisi dengan nama agama
- Field menjadi read-only
- Placeholder menunjukkan nama agama

### Ketika Belum Pilih Agama
- Field sub-agama disabled
- Placeholder: "Pilih agama terlebih dahulu"

## Daftar Gereja Protestan (46 Gereja)

1. Gereja Kristen Indonesia — GKI
2. Gereja Kristen Jawa — GKJ
3. Gereja Bethel Indonesia — GBI
4. Gereja Pantekosta di Indonesia — GPdI
5. Gereja Protestan di Indonesia bagian Barat — GPIB
6. Gereja Protestan Maluku — GPM
7. Huria Kristen Batak Protestan — HKBP
8. Gereja Huria Kristen Indonesia — HKI
9. Gereja Methodis Indonesia — GMI
10. Gereja Sidang-Sidang Jemaat Allah di Indonesia — GSJA
11. Gereja Reformed Injili Indonesia — GRII
12. Gereja Kristen Bethel Indonesia — GKBI
13. Gereja Kristen Nazarene Indonesia — GKNI
14. Gereja Isa Almasih — GIA
15. Gereja Kristen Protestan Simalungun — GKPS
16. Gereja Kristen Protestan Angkola — GKPA
17. Gereja Kristen Protestan Indonesia — GKPI
18. Gereja Toraja — GT
19. Gereja Toraja Mamasa — GTM
20. Gereja Kristen Sulawesi Tengah — GKST
21. Gereja Kristen Celebes — GKC
22. Gereja Kristen Kalimantan Barat — GKKB
23. Gereja Kalimantan Evangelis — GKE
24. Gereja Kristen Indonesia di Tanah Papua — GKI Papua
25. Gereja Kemah Injil Indonesia — GKII
26. Gereja Bala Keselamatan — BK
27. Gereja Kristen Indonesia Jawa Barat — GKI Jabar
28. Gereja Kristen Jawa Tengah — GKJT
29. Gereja Kristen Jawa Wetan — GKJW
30. Gereja Kristen Baptis Indonesia — GKBI atau GKBI Baptis
31. Gereja Baptis Indonesia — GBI Baptis
32. Gereja Pantekosta Serikat Indonesia — GPSI
33. Gereja Pantekosta Tabernakel — GPT
34. Gereja Masehi Injili di Timor — GMIT
35. Gereja Masehi Injili di Minahasa — GMIM
36. Gereja Masehi Injili di Halmahera — GMIH
37. Gereja Masehi Injili Sangihe Talaud — GMIST
38. Gereja Masehi Injili di Bolaang Mongondow — GMIBM
39. Gereja Masehi Injili di Talaud — GMITa
40. Gereja Kristen Oikoumene di Indonesia — GKOI
41. Gereja Persekutuan Kristen Alkitab Indonesia — GPKAI
42. Gereja Pentakosta Pusat Surabaya — GPPS
43. Gereja Kristen Setia Indonesia — GKSI
44. Gereja Sidang Jemaat Kristus — GSJK
45. Gereja Kristen Anugerah Indonesia — GKAI
46. Gereja Alkitab Anugerah — GAA
47. Gereja Kristen Kerasulan Baru — GKNB
48. Gereja Pantekosta Isa Almasih — GPIA

## Fitur Pencarian
- **Real-time search**: Hasil muncul saat user mengetik
- **Fuzzy matching**: Mencari berdasarkan nama gereja atau singkatan
- **Sorting**: Hasil yang dimulai dengan kata kunci muncul pertama
- **Limit results**: Maksimal 5 hasil ditampilkan
- **Keyboard navigation**: Arrow keys, Enter, Escape

## Files yang Dimodifikasi
1. `src/utils/constants.ts` - Tambah PROTESTAN_CHURCHES
2. `src/types/index.ts` - Tambah field subAgama
3. `src/models/Contact.ts` - Update model untuk subAgama
4. `src/components/contacts/ContactForm.tsx` - UI dan logika form
5. `SUB_AGAMA_FEATURE.md` - Dokumentasi ini

## Cara Penggunaan
1. Buka form tambah/edit kontak
2. Pilih agama dari dropdown
3. Jika pilih "Protestan":
   - Ketik nama gereja di field sub-agama
   - Pilih dari hasil pencarian
4. Jika pilih agama lain:
   - Field sub-agama otomatis terisi
5. Simpan kontak

## Validasi
- Field sub-agama opsional
- Tidak ada validasi khusus untuk sub-agama
- Data tersimpan dalam database dengan field `subAgama`

## Export/Import
Field sub-agama akan ikut ter-export dalam laporan kontak dan dapat di-import kembali.