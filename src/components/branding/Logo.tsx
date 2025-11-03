import React, { useState, useEffect } from 'react';
import { brandingService } from '../../services/brandingService';
import defaultLogo from '../../assets/logos/default-logo.svg';
import './Logo.css';

interface LogoProps {
  variant?: 'header' | 'login' | 'favicon';
  size?: 'small' | 'medium' | 'large' | 'auto';
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'header',
  size = 'auto',
  className = '',
  alt = 'Company Logo',
  onClick
}) => {
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogo = () => {
      try {
        const config = brandingService.getCurrentLogo();
        setLogoUrl(config.logoUrl);
      } catch (error) {
        console.warn('Failed to load logo, using default:', error);
        setLogoUrl(defaultLogo);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogo();

    // Listen for logo updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'crm_branding_config') {
        loadLogo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleLogoUpdate = () => {
      loadLogo();
    };
    
    window.addEventListener('logoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  const logoClasses = [
    'logo',
    `logo--${variant}`,
    `logo--${size}`,
    isLoading ? 'logo--loading' : '',
    className
  ].filter(Boolean).join(' ');

  const handleImageError = () => {
    console.warn('Logo failed to load, falling back to default');
    setLogoUrl(defaultLogo);
  };

  if (isLoading) {
    return (
      <div className={logoClasses}>
        <div className="logo__placeholder" />
      </div>
    );
  }

  return (
    <div className={logoClasses} onClick={onClick}>
      <img 
        src={logoUrl} 
        alt={alt}
        className="logo__image"
        role="img"
        aria-label="Company branding logo"
        onError={handleImageError}
      />
    </div>
  );
};