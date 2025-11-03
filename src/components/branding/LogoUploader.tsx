import React, { useState, useRef, useCallback } from 'react';
import { brandingService, type BrandingConfig } from '../../services/brandingService';
import { useAuth } from '../../hooks/useAuth';
import './LogoUploader.css';

interface LogoUploaderProps {
  onLogoUpdate?: (config: BrandingConfig) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  onLogoUpdate,
  maxFileSize = 2 * 1024 * 1024, // 2MB
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'],
  showPreview = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<BrandingConfig>(brandingService.getCurrentLogo());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!currentUser) {
      setError('You must be logged in to upload logos');
      return;
    }

    clearMessages();
    setIsUploading(true);

    try {
      // Validate file
      const validation = brandingService.validateLogoFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Show preview
      if (showPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload logo
      const newConfig = await brandingService.updateLogo(file, currentUser.id);
      setCurrentConfig(newConfig);
      setSuccess(`Logo updated successfully! File: ${file.name}`);
      
      // Notify parent component
      onLogoUpdate?.(newConfig);
      
      // Dispatch custom event for Logo component to update
      window.dispatchEvent(new CustomEvent('logoUpdated'));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(errorMessage);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [currentUser, onLogoUpdate, showPreview, clearMessages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleResetToDefault = useCallback(() => {
    if (!currentUser) {
      setError('You must be logged in to reset logo');
      return;
    }

    if (window.confirm('Are you sure you want to reset to the default logo?')) {
      clearMessages();
      const defaultConfig = brandingService.resetToDefault();
      setCurrentConfig(defaultConfig);
      setPreview(null);
      setSuccess('Logo reset to default successfully!');
      
      onLogoUpdate?.(defaultConfig);
      window.dispatchEvent(new CustomEvent('logoUpdated'));
    }
  }, [currentUser, onLogoUpdate, clearMessages]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="logo-uploader">
      <div className="logo-uploader__header">
        <h3>Logo Management</h3>
        <p>Upload a new logo for your application. Supported formats: PNG, JPG, SVG, WebP</p>
      </div>

      {/* Current Logo Display */}
      <div className="logo-uploader__current">
        <h4>Current Logo</h4>
        <div className="current-logo-display">
          <img 
            src={currentConfig.logoUrl} 
            alt="Current Logo" 
            className="current-logo-image"
          />
          <div className="current-logo-info">
            <div className="logo-info-item">
              <span className="label">Type:</span>
              <span className="value">{currentConfig.logoType === 'default' ? 'Default' : 'Custom'}</span>
            </div>
            <div className="logo-info-item">
              <span className="label">File:</span>
              <span className="value">{currentConfig.logoMetadata.originalName}</span>
            </div>
            {currentConfig.logoMetadata.size > 0 && (
              <div className="logo-info-item">
                <span className="label">Size:</span>
                <span className="value">{formatFileSize(currentConfig.logoMetadata.size)}</span>
              </div>
            )}
            <div className="logo-info-item">
              <span className="label">Updated:</span>
              <span className="value">{formatDate(currentConfig.logoMetadata.uploadDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`logo-uploader__dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="logo-uploader__input"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading logo...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              Drag and drop your logo here, or{' '}
              <button 
                type="button" 
                className="browse-button"
                onClick={handleBrowseClick}
              >
                browse files
              </button>
            </p>
            <p className="upload-hint">
              Maximum file size: {formatFileSize(maxFileSize)}
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <div className="logo-uploader__preview">
          <h4>Preview</h4>
          <div className="preview-container">
            <img src={preview} alt="Logo Preview" className="preview-image" />
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="logo-uploader__message logo-uploader__message--error">
          <span className="message-icon">❌</span>
          <span className="message-text">{error}</span>
          <button 
            className="message-close"
            onClick={clearMessages}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="logo-uploader__message logo-uploader__message--success">
          <span className="message-icon">✅</span>
          <span className="message-text">{success}</span>
          <button 
            className="message-close"
            onClick={clearMessages}
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="logo-uploader__actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleResetToDefault}
          disabled={isUploading || currentConfig.logoType === 'default'}
        >
          Reset to Default
        </button>
        
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleBrowseClick}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Choose New Logo'}
        </button>
      </div>

      {/* Guidelines */}
      <div className="logo-uploader__guidelines">
        <h4>Logo Guidelines</h4>
        <ul>
          <li>Recommended size: 200x100 pixels or 1:1 ratio (square)</li>
          <li>Supported formats: PNG, JPG, SVG, WebP</li>
          <li>Maximum file size: {formatFileSize(maxFileSize)}</li>
          <li>For best results, use SVG format for scalability</li>
          <li>Ensure logo has good contrast against dark backgrounds</li>
        </ul>
      </div>
    </div>
  );
};