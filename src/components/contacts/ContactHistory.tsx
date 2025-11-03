import React, { useState } from 'react';
import type { ContactHistoryEntry } from '../../types';
import { localStorageService } from '../../services/localStorage';
import './ContactHistory.css';

interface ContactHistoryProps {
  history: ContactHistoryEntry[];
  isExpanded?: boolean;
  maxEntries?: number;
}

export const ContactHistory: React.FC<ContactHistoryProps> = ({
  history,
  isExpanded = false,
  maxEntries = 5
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [showAll, setShowAll] = useState(false);

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Determine which entries to show
  const displayHistory = showAll ? sortedHistory : sortedHistory.slice(0, maxEntries);
  const hasMoreEntries = sortedHistory.length > maxEntries;

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Baru saja';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '➕';
      case 'updated':
        return '✏️';
      case 'status_changed':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'status_changed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getUserDisplayName = (userIdentifier: string) => {
    // First try to find by username (current system)
    const userByUsername = localStorageService.getUserByUsername(userIdentifier);
    if (userByUsername) {
      return userByUsername.username;
    }
    
    // Fallback: try to find by ID (legacy data)
    const userById = localStorageService.getUserById(userIdentifier);
    if (userById) {
      return userById.username;
    }
    
    // If no user found, return the identifier itself (might be username)
    return userIdentifier || 'Unknown';
  };

  if (!history || history.length === 0) {
    return (
      <div className="contact-history empty">
        <p className="empty-message">Belum ada riwayat perubahan</p>
      </div>
    );
  }

  return (
    <div className="contact-history">
      <div className="history-header">
        <button
          className="history-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className="toggle-icon">{expanded ? '▼' : '▶'}</span>
          <span className="history-title">
            Riwayat Perubahan ({sortedHistory.length})
          </span>
        </button>
      </div>

      {expanded && (
        <div className="history-content">
          <div className="history-timeline">
            {displayHistory.map((entry, index) => (
              <div key={entry.id} className="history-entry">
                <div className="entry-marker">
                  <span className={`entry-icon ${getActionColor(entry.action)}`}>
                    {getActionIcon(entry.action)}
                  </span>
                  {index < displayHistory.length - 1 && <div className="entry-line" />}
                </div>
                
                <div className="entry-content">
                  <div className="entry-header">
                    <span className="entry-user">
                      {getUserDisplayName(entry.updatedBy)}
                    </span>
                    <span className="entry-time">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  
                  <div className="entry-details">
                    {entry.notes && (
                      <p className="entry-notes">{entry.notes}</p>
                    )}
                    
                    {entry.field && entry.oldValue && entry.newValue && (
                      <div className="entry-change">
                        <span className="field-name">{entry.field}:</span>
                        <div className="value-change">
                          <span className="old-value">"{entry.oldValue}"</span>
                          <span className="arrow">→</span>
                          <span className="new-value">"{entry.newValue}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMoreEntries && (
            <div className="history-actions">
              <button
                className="show-more-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll 
                  ? `Tampilkan lebih sedikit` 
                  : `Tampilkan ${sortedHistory.length - maxEntries} lainnya`
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for use in lists
export const ContactHistoryCompact: React.FC<{
  history: ContactHistoryEntry[];
  maxEntries?: number;
}> = ({ history, maxEntries = 3 }) => {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const recentHistory = sortedHistory.slice(0, maxEntries);

  if (recentHistory.length === 0) {
    return <span className="history-compact empty">Belum ada riwayat</span>;
  }

  const lastEntry = recentHistory[0];
  const getUserDisplayName = (userIdentifier: string) => {
    // First try to find by username (current system)
    const userByUsername = localStorageService.getUserByUsername(userIdentifier);
    if (userByUsername) {
      return userByUsername.username;
    }
    
    // Fallback: try to find by ID (legacy data)
    const userById = localStorageService.getUserById(userIdentifier);
    if (userById) {
      return userById.username;
    }
    
    // If no user found, return the identifier itself (might be username)
    return userIdentifier || 'Unknown';
  };

  const formatCompactTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'Baru saja';
    } else if (diffHours < 24) {
      return `${diffHours}j`;
    } else if (diffDays < 30) {
      return `${diffDays}h`;
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="history-compact">
      <span className="last-update">
        Terakhir diubah oleh {getUserDisplayName(lastEntry.updatedBy)} • {formatCompactTime(lastEntry.timestamp)}
      </span>
      {sortedHistory.length > 1 && (
        <span className="history-count">
          +{sortedHistory.length - 1} perubahan lainnya
        </span>
      )}
    </div>
  );
};