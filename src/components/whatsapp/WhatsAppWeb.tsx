import React, { useState } from 'react';
import './WhatsAppWeb.css';

export const WhatsAppWeb: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleOpenWhatsAppWeb = () => {
    // Open WhatsApp Web in a new window with specific dimensions
    const whatsappWindow = window.open(
      'https://web.whatsapp.com',
      'whatsapp-web',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (whatsappWindow) {
      setIsConnected(true);
      
      // Check if window is closed
      const checkClosed = setInterval(() => {
        if (whatsappWindow.closed) {
          setIsConnected(false);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  const handleOpenFullscreen = () => {
    window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
  };

  const handleQuickMessage = (phoneNumber: string, message: string) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="whatsapp-launcher-container">
      <div className="whatsapp-launcher-header">
        <div className="header-left">
          <div className="whatsapp-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
          </div>
          <div className="header-info">
            <h1>WhatsApp Launcher</h1>
            <p>Akses WhatsApp Web untuk komunikasi kantor</p>
          </div>
        </div>
        
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isConnected ? 'WhatsApp Terbuka' : 'Tidak Terhubung'}
            </span>
          </div>
        </div>
      </div>

      <div className="launcher-main-content">
        <div className="launch-section">
          <div className="launch-card primary">
            <div className="card-icon">🚀</div>
            <h3>Buka WhatsApp Web</h3>
            <p>Buka WhatsApp Web dalam window terpisah yang optimal untuk bekerja</p>
            <button 
              onClick={handleOpenWhatsAppWeb}
              className="launch-btn primary"
            >
              <span>📱</span>
              Buka WhatsApp Web
            </button>
          </div>

          <div className="launch-card secondary">
            <div className="card-icon">🔗</div>
            <h3>Tab Baru</h3>
            <p>Buka WhatsApp Web di tab baru browser untuk akses penuh</p>
            <button 
              onClick={handleOpenFullscreen}
              className="launch-btn secondary"
            >
              <span>🌐</span>
              Buka di Tab Baru
            </button>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button 
              onClick={() => handleQuickMessage('', 'Halo, saya dari Hopeline Care. Ada yang bisa kami bantu?')}
              className="quick-action-btn"
            >
              <span>💬</span>
              <div>
                <strong>Chat Baru</strong>
                <small>Mulai percakapan baru</small>
              </div>
            </button>

            <button 
              onClick={() => window.open('https://faq.whatsapp.com/web', '_blank')}
              className="quick-action-btn"
            >
              <span>❓</span>
              <div>
                <strong>Bantuan</strong>
                <small>FAQ WhatsApp Web</small>
              </div>
            </button>

            <button 
              onClick={() => window.open('https://www.whatsapp.com/download', '_blank')}
              className="quick-action-btn"
            >
              <span>📲</span>
              <div>
                <strong>Download</strong>
                <small>WhatsApp untuk Desktop</small>
              </div>
            </button>
          </div>
        </div>

        <div className="tips-section">
          <h3>Tips Penggunaan</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">📱</div>
              <div className="tip-content">
                <h4>Scan QR Code</h4>
                <p>Gunakan WhatsApp di ponsel untuk scan QR code yang muncul di WhatsApp Web</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">🔋</div>
              <div className="tip-content">
                <h4>Ponsel Tetap Online</h4>
                <p>Pastikan ponsel tetap terhubung internet agar WhatsApp Web berfungsi</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">🔒</div>
              <div className="tip-content">
                <h4>Keamanan</h4>
                <p>Logout dari WhatsApp Web jika menggunakan komputer umum</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">⚡</div>
              <div className="tip-content">
                <h4>Performa</h4>
                <p>Tutup tab lain untuk performa WhatsApp Web yang optimal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="launcher-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Kenapa Tidak Bisa Embed?</h4>
            <p>WhatsApp Web memblokir embedding di iframe untuk alasan keamanan. Solusi terbaik adalah membuka di window atau tab terpisah.</p>
          </div>
          
          <div className="footer-section">
            <h4>Alternatif</h4>
            <p>Untuk integrasi yang lebih dalam, pertimbangkan menggunakan WhatsApp Business API (berbayar).</p>
          </div>
        </div>
      </div>
    </div>
  );
};