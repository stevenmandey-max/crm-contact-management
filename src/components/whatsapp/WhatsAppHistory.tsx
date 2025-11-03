import React, { useState, useEffect } from 'react';
import { whatsappService, type WhatsAppMessage } from '../../utils/whatsapp';
import { formatDate } from '../../utils/helpers';
import './WhatsAppHistory.css';

interface WhatsAppHistoryProps {
  contactId: string;
  className?: string;
}

export const WhatsAppHistory: React.FC<WhatsAppHistoryProps> = ({
  contactId,
  className = ''
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [contactId]);

  const loadMessages = () => {
    setIsLoading(true);
    try {
      const history = whatsappService.getMessageHistory(contactId);
      setMessages(history);
    } catch (error) {
      console.error('Error loading WhatsApp history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateDisplayName = (templateId: string): string => {
    const templates = whatsappService.getMessageTemplates();
    const template = templates.find(t => t.id === templateId);
    return template?.name || templateId;
  };

  const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} jam yang lalu`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} hari yang lalu`;
    } else {
      return formatDate(date);
    }
  };

  const displayedMessages = showAll ? messages : messages.slice(0, 5);

  if (isLoading) {
    return (
      <div className={`whatsapp-history loading ${className}`}>
        <div className="history-header">
          <h4>📱 Riwayat WhatsApp</h4>
        </div>
        <div className="loading-messages">
          <div className="message-skeleton"></div>
          <div className="message-skeleton"></div>
          <div className="message-skeleton"></div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`whatsapp-history empty ${className}`}>
        <div className="history-header">
          <h4>📱 Riwayat WhatsApp</h4>
        </div>
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>Belum ada riwayat WhatsApp</p>
          <span className="empty-subtitle">
            Pesan WhatsApp yang dikirim akan muncul di sini
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`whatsapp-history ${className}`}>
      <div className="history-header">
        <h4>📱 Riwayat WhatsApp</h4>
        <span className="message-count">{messages.length} pesan</span>
      </div>

      <div className="messages-list">
        {displayedMessages.map((message) => (
          <div key={message.id} className="message-item">
            <div className="message-header">
              <div className="message-info">
                <span className="message-time">
                  {formatMessageTime(message.sentAt)}
                </span>
                <span className="message-sender">
                  oleh {message.sentBy}
                </span>
              </div>
              {message.template && (
                <div className="message-template">
                  <span className="template-badge">
                    📋 {getTemplateDisplayName(message.template)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="message-content">
              <div className="message-text">
                {message.message}
              </div>
              <div className="message-phone">
                📱 {message.phoneNumber}
              </div>
            </div>
          </div>
        ))}
      </div>

      {messages.length > 5 && (
        <div className="history-actions">
          <button
            onClick={() => setShowAll(!showAll)}
            className="show-more-btn"
          >
            {showAll 
              ? `Tampilkan lebih sedikit` 
              : `Tampilkan semua (${messages.length - 5} lainnya)`
            }
          </button>
        </div>
      )}

      {messages.length > 0 && (
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-label">Total Pesan:</span>
            <span className="stat-value">{messages.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pesan Terakhir:</span>
            <span className="stat-value">
              {formatMessageTime(messages[0].sentAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};