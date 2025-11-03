# WhatsApp Integration for CRM

## Overview
WhatsApp integration telah ditambahkan ke CRM untuk memudahkan komunikasi dengan contacts. Fitur ini menggunakan WhatsApp Web links dan **tidak melakukan sinkronisasi kontak** dari WhatsApp.

## Features Implemented

### ✅ 1. WhatsApp Web Link Integration
- Click to chat langsung ke nomor contact
- Format nomor otomatis untuk Indonesia (+62)
- Validasi nomor telepon
- Buka WhatsApp Web di tab baru

### ✅ 2. WhatsApp Button Components
- **Primary Button**: Full button dengan text "Kirim WhatsApp"
- **Secondary Button**: Button dengan border dan icon
- **Icon Button**: Compact button hanya icon untuk space terbatas

### ✅ 3. Message Templates
- **Follow Up - General**: Template untuk follow up umum
- **Follow Up - Service**: Template setelah layanan
- **Appointment Reminder**: Pengingat janji temu
- **Service Completion**: Pesan setelah layanan selesai
- **Welcome Message**: Pesan selamat datang
- **Check In**: Template untuk menanyakan kabar

### ✅ 4. WhatsApp History Tracking
- Log setiap WhatsApp link yang diklik
- Track template yang digunakan
- Simpan riwayat per contact
- Tampilkan history di Contact Detail

### ✅ 5. Integration Points
- **Contact Detail**: WhatsApp button di action buttons + History section
- **Contact List**: Icon WhatsApp button untuk quick access
- **Dashboard**: WhatsApp stats bisa ditambahkan ke metrics

## Technical Implementation

### Core Service: `whatsappService`
```typescript
// Format nomor telepon Indonesia
whatsappService.formatPhoneNumber('08123456789') // Returns: '6281234567890'

// Generate WhatsApp URL
whatsappService.generateWhatsAppURL('08123456789', 'Hello!') 
// Returns: 'https://wa.me/6281234567890?text=Hello!'

// Send message dan log ke history
whatsappService.sendMessage(contactId, phoneNumber, message, sentBy, template)

// Get message history
whatsappService.getMessageHistory(contactId)
```

### Components

#### WhatsAppButton
```tsx
<WhatsAppButton
  contact={contact}
  variant="primary" // 'primary' | 'secondary' | 'icon'
  showTemplates={true} // Show template modal or direct send
  className="custom-class"
/>
```

#### WhatsAppHistory
```tsx
<WhatsAppHistory 
  contactId={contact.id}
  className="contact-detail-whatsapp"
/>
```

## Phone Number Formatting

### Supported Formats
- `08123456789` → `6281234567890`
- `8123456789` → `6281234567890`  
- `+6281234567890` → `6281234567890`
- `6281234567890` → `6281234567890`

### Validation Rules
- Minimum 10 digits, maximum 15 digits
- Must start with 62, 0, or 8 for Indonesian numbers
- Invalid numbers will disable WhatsApp button

## Message Templates

### Template Variables
- `{name}` - Contact name
- `{date}` - Current date (Indonesian format)
- `{time}` - Current time (Indonesian format)

### Example Template Processing
```typescript
const template = {
  message: "Halo {name}, ini pengingat untuk janji temu Anda pada {date} pukul {time}."
}

const processed = whatsappService.processTemplate(template, {
  name: "John Doe",
  date: "24 Oktober 2024", 
  time: "14:00"
})
// Result: "Halo John Doe, ini pengingat untuk janji temu Anda pada 24 Oktober 2024 pukul 14:00."
```

## Data Storage

### WhatsApp History Storage
- Stored in localStorage per contact: `whatsapp_history_{contactId}`
- Maximum 50 messages per contact
- Data structure:
```typescript
interface WhatsAppMessage {
  id: string;
  contactId: string;
  phoneNumber: string;
  message: string;
  template?: string;
  sentAt: Date;
  sentBy: string;
}
```

### No Contact Synchronization
- **Tidak ada** import kontak dari WhatsApp
- **Tidak ada** sync pesan dari WhatsApp
- **Hanya** track outgoing messages yang dikirim via CRM

## Security & Privacy

### Data Protection
- Hanya menyimpan log pesan yang dikirim via CRM
- Tidak mengakses kontak atau pesan WhatsApp user
- Tidak ada API key atau token yang disimpan
- Semua data tersimpan lokal di browser

### Permission Model
- Semua user (Admin & Editor) bisa kirim WhatsApp
- History tracking per user yang mengirim
- Tidak ada pembatasan khusus untuk WhatsApp features

## Usage Examples

### 1. Quick Send dari Contact List
```tsx
// Icon button di contact list untuk quick access
<WhatsAppButton
  contact={contact}
  variant="icon"
  showTemplates={false} // Direct send tanpa template modal
/>
```

### 2. Template Send dari Contact Detail
```tsx
// Full button dengan template options
<WhatsAppButton
  contact={contact}
  variant="primary"
  showTemplates={true} // Show template selection modal
/>
```

### 3. Custom Message
User bisa menulis pesan kustom di template modal selain menggunakan predefined templates.

## Dashboard Integration (Future)

WhatsApp stats bisa ditambahkan ke dashboard:
```typescript
const stats = whatsappService.getMessageStats();
// Returns:
// {
//   totalMessages: 150,
//   messagesThisMonth: 45,
//   topTemplates: [
//     { template: 'follow_up_1', count: 20 },
//     { template: 'welcome_message', count: 15 }
//   ],
//   activeContacts: 30
// }
```

## Files Created

### Core Files
- `src/utils/whatsapp.ts` - WhatsApp service dan utilities
- `src/components/whatsapp/WhatsAppButton.tsx` - WhatsApp button component
- `src/components/whatsapp/WhatsAppButton.css` - Styling untuk button
- `src/components/whatsapp/WhatsAppHistory.tsx` - History display component  
- `src/components/whatsapp/WhatsAppHistory.css` - Styling untuk history

### Integration Points
- `src/components/contacts/ContactDetail.tsx` - Added WhatsApp button & history
- `src/components/contacts/ContactList.tsx` - Added WhatsApp icon button

## Benefits

### ✅ User Experience
- One-click WhatsApp communication
- Template messages untuk konsistensi
- History tracking untuk follow-up
- No manual copy-paste nomor telepon

### ✅ Business Process
- Standardized messaging dengan templates
- Communication history per contact
- No data leakage atau privacy concerns
- Easy integration dengan existing workflow

### ✅ Technical
- No external dependencies atau API keys
- Lightweight implementation
- Browser-based, no server requirements
- Easy to maintain dan extend

## Future Enhancements

### Possible Additions
1. **Bulk WhatsApp** - Send to multiple contacts
2. **Message Scheduling** - Schedule messages untuk later
3. **WhatsApp Analytics** - Dashboard metrics untuk WhatsApp usage
4. **Custom Templates** - User-defined message templates
5. **Message Status** - Track delivered/read status (jika menggunakan API)

### API Integration (Optional)
Jika di masa depan ingin upgrade ke WhatsApp Business API:
- Message automation
- Incoming message handling
- Media sharing (images, documents)
- Group messaging
- Message status tracking

## Conclusion

WhatsApp integration ini memberikan komunikasi yang seamless tanpa mengorbankan privacy atau security. User bisa langsung berkomunikasi dengan contacts sambil tetap tracking history untuk follow-up yang lebih baik.