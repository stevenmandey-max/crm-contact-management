import defaultLogo from '../assets/logos/default-logo.svg';

export interface BrandingConfig {
  logoUrl: string;
  logoType: 'default' | 'custom';
  logoMetadata: {
    filename: string;
    originalName: string;
    size: number;
    format: string;
    dimensions?: {
      width: number;
      height: number;
    };
    uploadDate: Date;
    uploadedBy: string;
  };
  fallbackLogo: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class BrandingService {
  private readonly STORAGE_KEY = 'crm_branding_config';
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  // private readonly MIN_DIMENSIONS = { width: 100, height: 50 };
  // private readonly MAX_DIMENSIONS = { width: 800, height: 400 };

  getCurrentLogo(): BrandingConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Convert date strings back to Date objects
        config.logoMetadata.uploadDate = new Date(config.logoMetadata.uploadDate);
        return config;
      }
    } catch (error) {
      console.warn('Failed to load branding config from localStorage:', error);
    }

    // Return default configuration
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): BrandingConfig {
    return {
      logoUrl: defaultLogo,
      logoType: 'default',
      logoMetadata: {
        filename: 'default-logo.svg',
        originalName: 'default-logo.svg',
        size: 0,
        format: 'image/svg+xml',
        uploadDate: new Date(),
        uploadedBy: 'system'
      },
      fallbackLogo: defaultLogo
    };
  }

  async updateLogo(file: File, uploadedBy: string): Promise<BrandingConfig> {
    // Validate file
    const validation = this.validateLogoFile(file);
    if (!validation.isValid) {
      throw new Error(`Logo validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Convert file to base64
      const logoUrl = await this.fileToBase64(file);
      
      // Get image dimensions
      const dimensions = await this.getImageDimensions(logoUrl);

      // Create new branding configuration
      const newConfig: BrandingConfig = {
        logoUrl,
        logoType: 'custom',
        logoMetadata: {
          filename: `custom-logo-${Date.now()}.${this.getFileExtension(file.name)}`,
          originalName: file.name,
          size: file.size,
          format: file.type,
          dimensions,
          uploadDate: new Date(),
          uploadedBy
        },
        fallbackLogo: defaultLogo
      };

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));

      return newConfig;
    } catch (error) {
      console.error('Failed to update logo:', error);
      throw new Error('Failed to process logo file. Please try again.');
    }
  }

  resetToDefault(): BrandingConfig {
    const defaultConfig = this.getDefaultConfig();
    localStorage.removeItem(this.STORAGE_KEY);
    return defaultConfig;
  }

  validateLogoFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file type
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      errors.push(`Unsupported file format. Supported formats: PNG, JPG, SVG, WebP`);
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      errors.push('Invalid file name');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'png';
  }

  // Get logo history (for future enhancement)
  getLogoHistory(): BrandingConfig[] {
    try {
      const history = localStorage.getItem(`${this.STORAGE_KEY}_history`);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  // Save to history (for future enhancement)
  // private saveToHistory(config: BrandingConfig): void {
  //   try {
  //     const history = this.getLogoHistory();
  //     history.unshift(config);
  //     // Keep only last 10 entries
  //     const trimmedHistory = history.slice(0, 10);
  //     localStorage.setItem(`${this.STORAGE_KEY}_history`, JSON.stringify(trimmedHistory));
  //   } catch (error) {
  //     console.warn('Failed to save logo to history:', error);
  //   }
  // }

  // Clear all branding data
  clearBrandingData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(`${this.STORAGE_KEY}_history`);
  }
}

// Export singleton instance
export const brandingService = new BrandingService();