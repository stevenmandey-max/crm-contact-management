# Panduan WhatsApp Button di CRM

## Cara Melihat WhatsApp Button

### 1. Reset Demo Data (Jika Diperlukan)
Jika Anda tidak melihat WhatsApp button, mungkin karena contact lama tidak memiliki nomor telepon. Untuk reset:

1. Buka browser console (F12)
2. Jalankan script berikut:
```javascript
localStorage.clear();
location.reload();
```

### 2. Lokasi WhatsApp Button

#### Di Contact List:
- **Icon WhatsApp hijau** di kolom "Actions" sebelah kiri button mata (👁️)
- Hanya muncul jika contact memiliki nomor telepon yang valid
- Klik untuk langsung buka WhatsApp Web

#### Di Contact Detail:
- **Button "Kirim WhatsApp"** di bagian action buttons
- Klik untuk buka modal template pesan
- Pilih template atau tulis pesan kustom

### 3. Demo Contacts dengan WhatsApp
Setelah reset, akan ada 4 demo contact dengan nomor telepon:

1. **Budi Santoso** - 08123456789
2. **Siti Nurhaliza** - 08567891234  
3. **Ahmad Rahman** - 62812345678
4. **Maya Sari** - 8123456789

### 4. Validasi Nomor Telepon
WhatsApp button hanya muncul jika nomor telepon:
- Minimal 10 digit, maksimal 15 digit
- Dimulai dengan: 62, 0, atau 8 (format Indonesia)
- Contoh valid: 08123456789, 62812345678, 8123456789

### 5. Fitur WhatsApp Button

#### Icon Button (Contact List):
- Langsung buka WhatsApp Web
- Pesan default: "Halo [Nama], saya dari Hopeline Care."

#### Primary Button (Contact Detail):
- Buka modal template
- Pilihan template pesan
- Tulis pesan kustom
- History tracking

### 6. Template Pesan Tersedia:
- Follow Up - General
- Follow Up - Service
- Appointment Reminder
- Service Completion
- Welcome Message
- Check In

### 7. Troubleshooting

#### WhatsApp Button Tidak Muncul:
1. Pastikan contact memiliki nomor telepon
2. Cek format nomor telepon (harus valid Indonesia)
3. Refresh halaman
4. Clear localStorage dan reload demo data

#### Button Disabled/Abu-abu:
- Nomor telepon tidak valid
- Hover untuk lihat pesan error

#### WhatsApp Tidak Terbuka:
- Pastikan WhatsApp Web bisa diakses
- Cek popup blocker browser
- Pastikan nomor telepon benar

### 8. Format Nomor yang Didukung:
```
08123456789  → 6281234567890 ✅
8123456789   → 6281234567890 ✅  
+6281234567890 → 6281234567890 ✅
6281234567890 → 6281234567890 ✅
```

### 9. Cara Test:
1. Login ke aplikasi (admin/admin123)
2. Pergi ke Contact List
3. Lihat icon WhatsApp hijau di kolom Actions
4. Klik contact untuk lihat detail
5. Klik "Kirim WhatsApp" untuk test template

Jika masih tidak muncul, pastikan sudah clear localStorage dan refresh halaman!