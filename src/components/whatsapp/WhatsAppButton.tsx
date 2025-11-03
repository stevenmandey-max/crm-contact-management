import React, { useState } from 'react';
import { whatsappService, type WhatsAppTemplate } from '../../utils/whatsapp';
import { useAuth } from '../../hooks/useAuth';
import { serviceStorage } from '../../services/serviceStorage';
import type { Contact } from '../../types';
import './WhatsAppButton.css';

interface WhatsAppButtonProps {
  contact: Contact;
  variant?: 'primary' | 'secondary' | 'icon';
  showTemplates?: boolean;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  contact,
  variant = 'primary',
  showTemplates = true,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const templates = whatsappService.getMessageTemplates();

  // Record WhatsApp service entry
  const recordWhatsAppService = (messageType: string, message: string) => {
    if (!currentUser) return;

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      serviceStorage.addServiceEntry({
        contactId: contact.id,
        userId: currentUser.username,
        date: today,
        duration: 0, // WhatsApp chat has 0 duration - we count frequency, not time
        serviceType: 'WhatsApp Chat',
        description: `${messageType}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
      });

      console.log('WhatsApp service recorded:', {
        contact: contact.nama,
        user: currentUser.username,
        type: messageType,
        date: today
      });
    } catch (error) {
      console.error('Error recording WhatsApp service:', error);
      // Don't block the WhatsApp functionality if service recording fails
    }
  };

  // Quick send without template
  const handleQuickSend = () => {
    if (!whatsappService.isValidPhoneNumber(contact.nomorTelepon)) {
      alert('Nomor telepon tidak valid untuk WhatsApp');
      return;
    }

    try {
      const message = `Halo ${contact.nama}, saya dari Hopeline Care.`;
      
      whatsappService.sendMessage(
        contact.id,
        contact.nomorTelepon,
        message,
        currentUser?.username || 'Unknown',
        'quick_message'
      );

      // Record WhatsApp service
      recordWhatsAppService('Quick Message', message);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      alert('Gagal membuka WhatsApp. Periksa nomor telepon.');
    }
  };

  // Send with template
  const handleTemplateSend = () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    
    try {
      const variables = {
        name: contact.nama,
        date: new Date().toLocaleDateString('id-ID'),
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      const processedMessage = whatsappService.processTemplate(selectedTemplate, variables);
      
      whatsappService.sendMessage(
        contact.id,
        contact.nomorTelepon,
        processedMessage,
        currentUser?.username || 'Unknown',
        selectedTemplate.id
      );

      // Record WhatsApp service
      recordWhatsAppService(`Template: ${selectedTemplate.name}`, processedMessage);

      setShowTemplateModal(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error sending template message:', error);
      alert('Gagal mengirim pesan. Periksa nomor telepon.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send custom message
  const handleCustomSend = () => {
    if (!customMessage.trim()) return;

    setIsLoading(true);

    try {
      whatsappService.sendMessage(
        contact.id,
        contact.nomorTelepon,
        customMessage,
        currentUser?.username || 'Unknown',
        'custom_message'
      );

      // Record WhatsApp service
      recordWhatsAppService('Custom Message', customMessage);

      setShowTemplateModal(false);
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending custom message:', error);
      alert('Gagal mengirim pesan. Periksa nomor telepon.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render button based on variant
  const renderButton = () => {
    const isValidNumber = whatsappService.isValidPhoneNumber(contact.nomorTelepon);
    
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={showTemplates ? () => setShowTemplateModal(true) : handleQuickSend}
            disabled={!isValidNumber}
            className={`whatsapp-btn whatsapp-btn-icon ${className}`}
            title={isValidNumber ? 'Kirim WhatsApp' : 'Nomor telepon tidak valid'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
          </button>
        );
      
      case 'secondary':
        return (
          <button
            onClick={showTemplates ? () => setShowTemplateModal(true) : handleQuickSend}
            disabled={!isValidNumber}
            className={`whatsapp-btn whatsapp-btn-secondary ${className}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
            WhatsApp
          </button>
        );
      
      default:
        return (
          <button
            onClick={showTemplates ? () => setShowTemplateModal(true) : handleQuickSend}
            disabled={!isValidNumber}
            className={`whatsapp-btn whatsapp-btn-primary ${className}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
            Kirim WhatsApp
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="whatsapp-modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="whatsapp-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Kirim WhatsApp ke {contact.nama}</h3>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="contact-info">
                <span className="phone-number">
                  📱 {whatsappService.formatPhoneNumber(contact.nomorTelepon)}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <button
                  onClick={handleQuickSend}
                  className="quick-action-btn"
                  disabled={isLoading}
                >
                  💬 Chat Langsung
                </button>
              </div>

              {/* Templates */}
              <div className="templates-section">
                <h4>Template Pesan</h4>
                <div className="templates-grid">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="template-name">{template.name}</div>
                      <div className="template-preview">
                        {whatsappService.processTemplate(template, {
                          name: contact.nama,
                          date: new Date().toLocaleDateString('id-ID'),
                          time: '14:00'
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTemplate && (
                  <button
                    onClick={handleTemplateSend}
                    disabled={isLoading}
                    className="send-template-btn"
                  >
                    {isLoading ? 'Mengirim...' : 'Kirim Template'}
                  </button>
                )}
              </div>

              {/* Custom Message */}
              <div className="custom-message-section">
                <h4>Pesan Kustom</h4>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Tulis pesan kustom..."
                  className="custom-message-input"
                  rows={3}
                />
                <button
                  onClick={handleCustomSend}
                  disabled={!customMessage.trim() || isLoading}
                  className="send-custom-btn"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Pesan Kustom'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};