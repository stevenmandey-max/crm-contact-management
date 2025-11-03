# Quick Filter Status Update

## Perubahan yang Dilakukan

Quick Filter di tab "Quick Filters" telah diperbarui untuk menggunakan status label yang baru menggantikan Status1-Status4.

### Status Lama → Status Baru
- Status1 → New Contact
- Status2 → In Progress  
- Status3 → Follow Up
- Status4 → Completed

## File yang Dimodifikasi

- `src/components/filters/FilterPanel.tsx` - Updated quickFilters array

## Implementasi

```typescript
const quickFilters = [
  { label: 'Recent (24h)', action: () => handleQuickFilter('recent') },
  { label: 'This Week', action: () => handleQuickFilter('thisWeek') },
  { label: 'This Month', action: () => handleQuickFilter('thisMonth') },
  { label: 'New Contact', action: () => handleQuickFilter('byStatus', 'New Contact') },
  { label: 'In Progress', action: () => handleQuickFilter('byStatus', 'In Progress') },
  { label: 'Follow Up', action: () => handleQuickFilter('byStatus', 'Follow Up') },
  { label: 'Completed', action: () => handleQuickFilter('byStatus', 'Completed') }
];
```

## Cara Menggunakan

1. Buka aplikasi CRM Hopeline Care
2. Klik pada panel "Filters" 
3. Pilih tab "Quick Filters"
4. Sekarang akan terlihat status filter dengan label yang lebih deskriptif:
   - **New Contact** - Filter kontak dengan status baru
   - **In Progress** - Filter kontak yang sedang diproses
   - **Follow Up** - Filter kontak yang perlu ditindaklanjuti
   - **Completed** - Filter kontak yang sudah selesai

## Konsistensi

Perubahan ini memastikan konsistensi dengan:
- Status dropdown di ContactForm
- Status display di ContactList
- Status badge di ContactDetail
- Export data
- History tracking messages

Sekarang seluruh aplikasi menggunakan status label yang sama dan lebih user-friendly.