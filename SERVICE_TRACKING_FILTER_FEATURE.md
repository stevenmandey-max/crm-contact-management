# Service Tracking Filter Feature

## Overview
Fitur Service Tracking Filter telah ditambahkan untuk memungkinkan monitoring dan analisis pelayanan yang diberikan kepada contacts berdasarkan periode waktu (harian, mingguan, bulanan, dll).

## Fitur yang Ditambahkan

### ✅ 1. Service Tracking Page
- **Lokasi**: Menu navigasi "Service Tracking" (📊)
- **Akses**: Semua user (Admin & Editor)
- **Fungsi**: Halaman dedicated untuk monitoring service activities

### ✅ 2. Service Filter Component
- **Period Filter**: Hari, Minggu, Bulan, Kuartal, Tahun, Custom Range
- **Contact Filter**: Filter berdasarkan contact tertentu
- **User Filter**: Filter berdasarkan user yang memberikan service
- **Custom Date Range**: Pilih tanggal mulai dan akhir secara manual

### ✅ 3. Service Report Component
- **Summary View**: Ringkasan metrics dan top performers
- **Detailed View**: Tabel detail semua service activities
- **Calendar View**: Tampilan kalender dengan service per hari
- **Real-time Metrics**: Total services, duration, contacts served, dll.

### ✅ 4. Interactive Metrics Dashboard
- **Total Pelayanan**: Jumlah service activities
- **Total Waktu**: Akumulasi durasi pelayanan
- **Hari Pelayanan**: Jumlah hari unik dengan service
- **Contact Dilayani**: Jumlah contact yang mendapat service
- **Rata-rata per Pelayanan**: Average duration per service

## Cara Menggunakan

### 1. Akses Service Tracking
1. Login ke CRM (admin/admin123 atau editor/editor123)
2. Klik **"Service Tracking"** di menu navigasi kiri
3. Halaman Service Tracking akan terbuka

### 2. Menggunakan Filter
#### **Filter Periode:**
- **Hari Ini**: Service hari ini saja
- **Minggu Ini**: Service dalam minggu berjalan (Minggu-Sabtu)
- **Bulan Ini**: Service dalam bulan berjalan
- **Kuartal Ini**: Service dalam kuartal berjalan (3 bulan)
- **Tahun Ini**: Service dalam tahun berjalan
- **Custom Range**: Pilih tanggal mulai dan akhir manual

#### **Filter Contact:**
- Pilih contact tertentu untuk melihat service hanya untuk contact tersebut
- "Semua Contact" untuk melihat semua service

#### **Filter User:**
- Pilih user tertentu untuk melihat service yang diberikan oleh user tersebut
- "Semua User" untuk melihat service dari semua user

### 3. Melihat Report
#### **Summary View (Default):**
- Metrics cards di bagian atas
- Top 10 contacts dengan service terbanyak
- Service breakdown per user
- Visual indicators dan statistics

#### **Detailed View:**
- Tabel lengkap semua service activities
- Kolom: Tanggal, Contact, User, Durasi, Deskripsi
- Sortable dan scrollable
- Export-ready format

#### **Calendar View:**
- Service activities dikelompokkan per tanggal
- Jumlah service dan total durasi per hari
- Chronological order (terbaru di atas)
- Detail service per hari

### 4. Contoh Use Cases

#### **Daily Monitoring:**
1. Set filter ke "Hari Ini"
2. Lihat service yang sudah dilakukan hari ini
3. Monitor productivity harian tim

#### **Weekly Review:**
1. Set filter ke "Minggu Ini"
2. Review performance mingguan
3. Identifikasi contact yang perlu follow-up

#### **Monthly Analysis:**
1. Set filter ke "Bulan Ini"
2. Analisis trend bulanan
3. Evaluasi target dan achievement

#### **Contact-Specific Tracking:**
1. Pilih contact tertentu di filter
2. Set periode (misal: 3 bulan terakhir)
3. Lihat history service untuk contact tersebut

#### **User Performance Review:**
1. Pilih user tertentu di filter
2. Set periode review (misal: kuartal)
3. Evaluasi performance individual

## Technical Implementation

### Components Created
```
src/components/services/ServiceFilter.tsx - Filter component
src/components/services/ServiceFilter.css - Filter styling
src/components/services/ServiceReport.tsx - Report component  
src/components/services/ServiceReport.css - Report styling
src/components/services/ServiceTracking.tsx - Main page component
src/components/services/ServiceTracking.css - Page styling
```

### Types Added
```typescript
interface ServiceEntry {
  id: string;
  contactId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  duration: number; // in minutes
  serviceType?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceSummary {
  contactId: string;
  totalServiceDays: number;
  totalServiceHours: number;
  activeUsers: number;
  lastServiceDate?: Date;
  lastServiceUser?: string;
  monthlyTrend: Array<{
    month: string;
    serviceCount: number;
    duration: number;
  }>;
}
```

### Navigation Updates
- Added 'service-tracking' to ViewType union
- Added Service Tracking nav item with 📊 icon
- Updated MainLayout routing

## Filter Options Detail

### Period Calculations
```typescript
// Hari Ini
startDate = today 00:00:00
endDate = today 23:59:59

// Minggu Ini (Minggu-Sabtu)
startDate = Sunday of current week 00:00:00
endDate = Saturday of current week 23:59:59

// Bulan Ini
startDate = 1st day of current month 00:00:00
endDate = last day of current month 23:59:59

// Kuartal Ini
startDate = 1st day of current quarter 00:00:00
endDate = last day of current quarter 23:59:59

// Tahun Ini
startDate = January 1st of current year 00:00:00
endDate = December 31st of current year 23:59:59

// Custom Range
startDate = user selected start date 00:00:00
endDate = user selected end date 23:59:59
```

### Data Aggregation
- Services filtered by date range first
- Then filtered by contact/user if specified
- Metrics calculated from filtered dataset
- Real-time updates when filters change

## Metrics Calculations

### Total Services
Count of all service entries in filtered period

### Total Duration
Sum of all service durations in minutes, displayed as hours/minutes

### Service Days
Count of unique dates with service activities

### Contacts Served
Count of unique contacts that received services

### Average Duration
Total duration divided by total services

### Top Performers
- Contacts: Sorted by total service count
- Users: Sorted by total service count
- Includes duration breakdown

## Benefits

### 📊 **Analytics & Insights**
- Comprehensive service analytics
- Performance tracking per user
- Contact service history analysis
- Trend identification

### 🎯 **Performance Management**
- Individual user performance review
- Team productivity monitoring
- Service quality assessment
- Goal tracking and achievement

### 📈 **Business Intelligence**
- Service demand patterns
- Resource allocation insights
- Contact engagement levels
- Operational efficiency metrics

### 🔍 **Operational Monitoring**
- Daily activity tracking
- Weekly/monthly reviews
- Contact follow-up identification
- Service gap analysis

## Future Enhancements

### Possible Additions
1. **Export Functionality** - Export filtered reports to Excel/PDF
2. **Advanced Charts** - Graphs and visualizations for trends
3. **Service Categories** - Categorize services by type
4. **Automated Reports** - Scheduled email reports
5. **Performance Targets** - Set and track service goals
6. **Service Quality Ratings** - Rate service quality and track satisfaction

### Integration Ideas
1. **Dashboard Integration** - Service metrics in main dashboard
2. **Contact Detail Integration** - Service history in contact view
3. **Notification System** - Alerts for service milestones
4. **Mobile Responsive** - Optimized mobile experience

## Conclusion

Service Tracking Filter memberikan visibility lengkap terhadap aktivitas pelayanan dalam CRM. Dengan filter yang fleksibel dan report yang komprehensif, tim dapat:

- Monitor performance harian, mingguan, dan bulanan
- Mengidentifikasi contact yang perlu follow-up
- Evaluasi produktivitas individual dan tim
- Membuat keputusan berbasis data untuk improvement

Fitur ini essential untuk management yang ingin memahami dan meningkatkan kualitas pelayanan kepada contacts.