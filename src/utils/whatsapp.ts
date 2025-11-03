// WhatsApp utility functions for CRM integration
// Note: This only provides WhatsApp Web links, no contact synchronization

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  phoneNumber: string;
  message: string;
  template?: string;
  sentAt: Date;
  sentBy: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  category: 'follow_up' | 'appointment' | 'service_completion' | 'general';
  variables: string[]; // Variables like {name}, {date}, etc.
}

class WhatsAppService {
  // Format phone number for WhatsApp (Indonesian format)
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Indonesian phone numbers
    if (cleaned.startsWith('0')) {
      // Replace leading 0 with 62
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      // Add 62 prefix for numbers starting with 8
      cleaned = '62' + cleaned;
    } else if (!cleaned.startsWith('62')) {
      // Add 62 prefix if not already present
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }

  // Generate WhatsApp Web URL
  generateWhatsAppURL(phoneNumber: string, message?: string): string {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    const baseURL = 'https://wa.me/';
    
    if (message) {
      const encodedMessage = encodeURIComponent(message);
      return `${baseURL}${formattedNumber}?text=${encodedMessage}`;
    }
    
    return `${baseURL}${formattedNumber}`;
  }

  // Validate phone number for WhatsApp
  isValidPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (minimum 10 digits, maximum 15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
      return false;
    }
    
    // Check if it starts with valid Indonesian prefixes
    return cleaned.startsWith('62') || 
           cleaned.startsWith('0') || 
           cleaned.startsWith('8');
  }

  // Open WhatsApp Web in new tab
  openWhatsApp(phoneNumber: string, message?: string): void {
    const url = this.generateWhatsAppURL(phoneNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Get predefined message templates
  getMessageTemplates(): WhatsAppTemplate[] {
    return [
      {
        id: 'follow_up_1',
        name: 'Follow Up - General',
        message: 'Halo {name}, terima kasih telah menghubungi Hopeline Care. Apakah ada yang bisa kami bantu lebih lanjut?',
        category: 'follow_up',
        variables: ['name']
      },
      {
        id: 'follow_up_2',
        name: 'Follow Up - Service',
        message: 'Halo {name}, bagaimana kabar Anda setelah layanan kemarin? Apakah ada yang ingin Anda sampaikan?',
        category: 'follow_up',
        variables: ['name']
      },
      {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        message: 'Halo {name}, ini pengingat untuk janji temu Anda pada {date} pukul {time}. Mohon konfirmasi kehadiran Anda.',
        category: 'appointment',
        variables: ['name', 'date', 'time']
      },
      {
        id: 'service_completion',
        name: 'Service Completion',
        message: 'Halo {name}, terima kasih telah menggunakan layanan Hopeline Care. Semoga Anda merasa terbantu. Jangan ragu untuk menghubungi kami lagi.',
        category: 'service_completion',
        variables: ['name']
      },
      {
        id: 'welcome_message',
        name: 'Welcome Message',
        message: 'Selamat datang di Hopeline Care, {name}! Kami siap membantu Anda. Silakan sampaikan apa yang bisa kami bantu.',
        category: 'general',
        variables: ['name']
      },
      {
        id: 'check_in',
        name: 'Check In',
        message: 'Halo {name}, kami ingin menanyakan kabar Anda. Bagaimana perasaan Anda hari ini?',
        category: 'follow_up',
        variables: ['name']
      }
    ];
  }

  // Replace template variables with actual values
  processTemplate(template: WhatsAppTemplate, variables: Record<string, string>): string {
    let processedMessage = template.message;
    
    template.variables.forEach(variable => {
      const placeholder = `{${variable}}`;
      const value = variables[variable] || placeholder;
      processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return processedMessage;
  }



  // Get WhatsApp message history for a contact (from localStorage)
  getMessageHistory(contactId: string): WhatsAppMessage[] {
    try {
      const history = localStorage.getItem(`whatsapp_history_${contactId}`);
      if (!history) return [];
      
      const messages = JSON.parse(history);
      return messages.map((msg: any) => ({
        ...msg,
        sentAt: new Date(msg.sentAt)
      }));
    } catch (error) {
      console.error('Error loading WhatsApp history:', error);
      return [];
    }
  }

  // Save WhatsApp message to history
  saveMessageToHistory(message: Omit<WhatsAppMessage, 'id' | 'sentAt'>): void {
    try {
      const messageWithId: WhatsAppMessage = {
        ...message,
        id: this.generateMessageId(),
        sentAt: new Date()
      };
      
      const existingHistory = this.getMessageHistory(message.contactId);
      const updatedHistory = [messageWithId, ...existingHistory].slice(0, 50); // Keep last 50 messages
      
      localStorage.setItem(
        `whatsapp_history_${message.contactId}`, 
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error('Error saving WhatsApp history:', error);
    }
  }

  // Generate unique message ID
  private generateMessageId(): string {
    return `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send WhatsApp message and log to history
  sendMessage(
    contactId: string, 
    phoneNumber: string, 
    message: string, 
    sentBy: string,
    template?: string
  ): void {
    // Validate phone number
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    // Open WhatsApp
    this.openWhatsApp(phoneNumber, message);

    // Log to history
    this.saveMessageToHistory({
      contactId,
      phoneNumber: this.formatPhoneNumber(phoneNumber),
      message,
      template,
      sentBy
    });
  }

  // Get message statistics for dashboard
  getMessageStats(timeRange?: { startDate: Date; endDate: Date }): {
    totalMessages: number;
    messagesThisMonth: number;
    topTemplates: Array<{ template: string; count: number }>;
    activeContacts: number;
  } {
    try {
      // Get all WhatsApp history keys
      const allKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('whatsapp_history_')
      );

      let totalMessages = 0;
      let messagesThisMonth = 0;
      const templateCounts = new Map<string, number>();
      const activeContacts = new Set<string>();

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      allKeys.forEach(key => {
        const contactId = key.replace('whatsapp_history_', '');
        const messages = this.getMessageHistory(contactId);
        
        messages.forEach(message => {
          totalMessages++;
          activeContacts.add(contactId);

          // Count messages this month
          if (message.sentAt >= thisMonthStart) {
            messagesThisMonth++;
          }

          // Count template usage
          if (message.template) {
            const currentCount = templateCounts.get(message.template) || 0;
            templateCounts.set(message.template, currentCount + 1);
          }
        });
      });

      // Get top 5 templates
      const topTemplates = Array.from(templateCounts.entries())
        .map(([template, count]) => ({ template, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalMessages,
        messagesThisMonth,
        topTemplates,
        activeContacts: activeContacts.size
      };
    } catch (error) {
      console.error('Error calculating WhatsApp stats:', error);
      return {
        totalMessages: 0,
        messagesThisMonth: 0,
        topTemplates: [],
        activeContacts: 0
      };
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Export utility functions
export const {
  formatPhoneNumber,
  generateWhatsAppURL,
  openWhatsApp,
  getMessageTemplates,
  processTemplate,
  isValidPhoneNumber,
  sendMessage,
  getMessageHistory,
  getMessageStats
} = whatsappService;