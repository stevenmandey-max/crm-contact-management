# Service Export - User Filter Feature

## Overview
Fitur filter per user telah ditambahkan ke dalam service export tracking, memungkinkan admin dan editor untuk mengekspor laporan service berdasarkan user tertentu.

## Features Added

### 1. User Filter Dropdown
- Dropdown "Filter by User" di ServiceExportModal
- Menampilkan semua user dengan format: `username (role)`
- Option "All Users" untuk export semua data
- Filter otomatis diterapkan pada semua jenis report

### 2. Enhanced Filename
- Nama file export sekarang menyertakan informasi user filter
- Format: `service_report_[type]_[date]_[daterange]_user_[username].xlsx`
- Contoh: `service_report_detailed_2024-10-24_monthly_user_admin.xlsx`

### 3. Filter Information in Reports
- Summary report menampilkan informasi filter di overall summary
- Analytics report menampilkan "Filter Applied: User: [username]"
- Detailed report tetap menampilkan semua kolom dengan data yang sudah difilter

## How to Use

### Quick Export
Quick export (Weekly/Monthly) masih menggunakan semua user. Untuk filter per user, gunakan Custom Export.

### Custom Export with User Filter
1. Buka ServiceExportModal
2. Pilih "Custom Export"
3. Pilih user dari dropdown "Filter by User"
4. Pilih opsi export lainnya (date range, format, dll)
5. Klik "Export Report"

### Available Report Types with User Filter
- **Detailed Report**: Semua service entries dari user yang dipilih
- **Summary Report**: Ringkasan per contact untuk service dari user yang dipilih
- **Analytics Report**: Analisis performa untuk user yang dipilih

## Technical Implementation

### ServiceExportModal Changes
- Added `users` state untuk menyimpan daftar user
- Added `useEffect` untuk load users saat modal dibuka
- Added user filter dropdown di form
- Filter tersimpan di `exportOptions.filters.userId`

### ServiceExport Service Changes
- Enhanced `generateFileName()` untuk include user info
- Enhanced summary reports untuk show filter information
- Filter logic sudah ada sebelumnya di `getServiceReportData()`

### Data Flow
1. User memilih filter user di modal
2. `userId` disimpan di `exportOptions.filters.userId`
3. `getServiceReportData()` memfilter services berdasarkan `userId`
4. Report generated dengan data yang sudah difilter
5. Filename dan summary info menyertakan informasi user

## Benefits
- **Targeted Analysis**: Analisis performa per user
- **Privacy**: Export data spesifik user saja
- **Accountability**: Tracking service per individual
- **Reporting**: Laporan yang lebih focused dan relevant

## Example Use Cases
1. **Manager Review**: Export service data untuk review performa staff tertentu
2. **Individual Report**: User export data service mereka sendiri
3. **Team Analysis**: Bandingkan performa antar user dengan export terpisah
4. **Audit Trail**: Track service history per user untuk audit

## File Naming Examples
- All users: `service_report_summary_2024-10-24_monthly.xlsx`
- Specific user: `service_report_detailed_2024-10-24_weekly_user_john.xlsx`
- Custom range: `service_report_analytics_2024-10-24_2024-10-01_to_2024-10-31_user_admin.xlsx`
#
# Quick Start Guide

### Step-by-Step Usage
1. **Open Service Export**
   - Navigate to Service Tracking
   - Click "Export" button
   - ServiceExportModal akan terbuka

2. **Select User Filter**
   - Scroll ke bagian "Custom Export"
   - Pada dropdown "Filter by User", pilih:
     - "All Users" untuk semua data
     - Pilih user tertentu (contoh: "admin (Admin)")

3. **Configure Export Options**
   - Report Type: Detailed/Summary/Analytics
   - Date Range: Daily/Weekly/Monthly/Custom
   - Format: Excel/CSV
   - Include Contact Info: ✓/✗

4. **Export Report**
   - Click "Export Report"
   - File akan didownload dengan nama yang mencakup user filter

### Example Scenarios

#### Scenario 1: Monthly Report untuk User Tertentu
```
Filter by User: john (Editor)
Report Type: Summary
Date Range: Monthly
Format: Excel
Include Contact Info: ✓

Result: service_report_summary_2024-10-24_monthly_user_john.xlsx
```

#### Scenario 2: Detailed Analysis untuk Admin
```
Filter by User: admin (Admin)
Report Type: Analytics
Date Range: Custom (2024-10-01 to 2024-10-31)
Format: Excel

Result: service_report_analytics_2024-10-24_2024-10-01_to_2024-10-31_user_admin.xlsx
```

#### Scenario 3: All Users Weekly Summary
```
Filter by User: All Users
Report Type: Summary
Date Range: Weekly
Format: CSV

Result: service_report_summary_2024-10-24_weekly.csv
```

## Notes
- User filter hanya tersedia di Custom Export, bukan Quick Export
- Semua user (Admin dan Editor) bisa menggunakan fitur ini
- Filter user akan mempengaruhi semua data dalam report (services, metrics, summary)
- Filename otomatis menyesuaikan dengan filter yang dipilih