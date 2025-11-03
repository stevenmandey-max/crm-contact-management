# Kustomisasi Peringatan Duplikasi untuk Field Sub-Agama

## Masalah
Sebelumnya, field sub-agama (nama gereja) menampilkan peringatan duplikasi ketika user memilih gereja yang sama dengan kontak lain. Ini tidak diinginkan karena:
- Banyak orang bisa berasal dari gereja yang sama
- Nama gereja boleh duplikasi antar kontak
- Hanya nama dan nomor telepon yang harus unik

## Solusi
Menambahkan prop `showDuplicateWarning` ke komponen AutocompleteInput untuk mengontrol kapan peringatan duplikasi ditampilkan.

## Implementasi

### 1. Modifikasi AutocompleteInput
Ditambahkan prop baru di `src/components/common/AutocompleteInput.tsx`:

```typescript
interface AutocompleteInputProps {
  // ... props lainnya
  showDuplicateWarning?: boolean; // New prop to control duplicate warning
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  // ... props lainnya
  showDuplicateWarning = true // Default to true for backward compatibility
}) => {
```

### 2. Logika Kondisional
Peringatan duplikasi hanya muncul jika `showDuplicateWarning` adalah `true`:

```typescript
// Check if current value is a duplicate (only if warning is enabled)
const isDuplicate = showDuplicateWarning && suggestions.some(
  suggestion => suggestion.toLowerCase() === value.toLowerCase() && value.trim()
);
```

### 3. Penggunaan di ContactForm
Field sub-agama menggunakan `showDuplicateWarning={false}`:

```typescript
<AutocompleteInput
  id="subAgama"
  value={formData.subAgama}
  onChange={(value) => handleInputChange('subAgama', value)}
  suggestions={PROTESTAN_CHURCHES}
  // ... props lainnya
  showDuplicateWarning={false} // Tidak menampilkan peringatan duplikasi
/>
```

## Perilaku Field

### Field dengan Peringatan Duplikasi (showDuplicateWarning=true)
- **Nama**: Menampilkan peringatan jika nama sudah ada
- **Nomor Telepon**: Menampilkan peringatan jika nomor sudah ada

### Field tanpa Peringatan Duplikasi (showDuplicateWarning=false)
- **Sub-Agama (Gereja)**: Tidak menampilkan peringatan duplikasi
- User dapat memilih gereja yang sama dengan kontak lain tanpa peringatan

## Backward Compatibility
- Prop `showDuplicateWarning` bersifat opsional dengan default `true`
- Semua penggunaan AutocompleteInput yang ada tetap berfungsi normal
- Hanya field sub-agama yang dimodifikasi untuk tidak menampilkan peringatan

## UI/UX Improvement
- ✅ Tidak ada lagi peringatan "Data ini sudah ada dalam kontak" untuk nama gereja
- ✅ Tidak ada lagi styling warning (border orange) untuk nama gereja yang sama
- ✅ Tidak ada lagi badge "Sudah Ada" di dropdown suggestions untuk gereja
- ✅ User experience lebih smooth saat memilih gereja yang populer

## Files yang Dimodifikasi
1. `src/components/common/AutocompleteInput.tsx` - Tambah prop showDuplicateWarning
2. `src/components/contacts/ContactForm.tsx` - Set showDuplicateWarning={false} untuk sub-agama
3. `DUPLICATE_WARNING_CUSTOMIZATION.md` - Dokumentasi ini

## Testing
Untuk menguji fitur ini:
1. Buat kontak pertama dengan agama Protestan dan pilih gereja (misal: GKI)
2. Buat kontak kedua dengan agama Protestan dan pilih gereja yang sama (GKI)
3. Pastikan tidak ada peringatan duplikasi untuk field gereja
4. Pastikan peringatan duplikasi masih muncul untuk nama dan nomor telepon

## Kesimpulan
Perubahan ini membuat sistem lebih logis dan user-friendly dengan memungkinkan duplikasi data yang memang wajar untuk diduplikasi (seperti nama gereja) sambil tetap mempertahankan validasi unik untuk data yang harus unik (nama dan nomor telepon).