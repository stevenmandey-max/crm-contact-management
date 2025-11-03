# Koreksi Daftar Gereja Protestan

## Perubahan
Menghapus "Gereja Katolik Roma — GKR atau Katolik" dari daftar gereja Protestan karena secara teologis dan denominasi, Gereja Katolik Roma bukan bagian dari Protestan.

## Sebelum (47 Gereja)
Daftar termasuk:
- Gereja Katolik Roma — GKR atau Katolik ❌ (Tidak tepat)

## Sesudah (46 Gereja)
Daftar hanya berisi gereja-gereja Protestan yang valid:
- Gereja Kristen Indonesia — GKI
- Gereja Kristen Jawa — GKJ
- Gereja Bethel Indonesia — GBI
- Gereja Pantekosta di Indonesia — GPdI
- Gereja Protestan di Indonesia bagian Barat — GPIB
- Dan 41 gereja Protestan lainnya

## Alasan Koreksi
1. **Denominasi yang Berbeda**: Katolik dan Protestan adalah dua denominasi Kristen yang terpisah
2. **Sejarah Reformasi**: Protestan muncul dari Reformasi abad ke-16 sebagai pemisahan dari Gereja Katolik
3. **Akurasi Data**: Penting untuk memiliki data yang akurat dalam sistem CRM

## Files yang Dimodifikasi
1. `src/utils/constants.ts` - Hapus entry Gereja Katolik Roma dari PROTESTAN_CHURCHES
2. `SUB_AGAMA_FEATURE.md` - Update dokumentasi dari 47 menjadi 46 gereja
3. `PROTESTAN_CHURCHES_CORRECTION.md` - Dokumentasi koreksi ini

## Dampak
- User yang memilih agama "Protestan" akan melihat 46 pilihan gereja yang semuanya valid
- User yang memilih agama "Katolik" akan otomatis mendapat sub-agama "Katolik" (tidak perlu pilih dari daftar)
- Data menjadi lebih akurat dan sesuai dengan denominasi yang benar