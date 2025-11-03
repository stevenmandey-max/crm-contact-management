import React from 'react';
import { useTerritorySelection } from '../../hooks/useTerritorySelection';
import type { TerritorySelection } from '../../hooks/useTerritorySelection';
import { SearchableSelect } from './SearchableSelect';
import './TerritorySelector.css';

export interface TerritorySelectorProps {
  initialProvinsi?: string;
  initialKabKota?: string;
  onChange?: (selection: TerritorySelection) => void;
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
  errors?: {
    provinsi?: string;
    kabKota?: string;
    mission?: string;
    uni?: string;
  };
}

export const TerritorySelector: React.FC<TerritorySelectorProps> = ({
  initialProvinsi,
  initialKabKota,
  onChange,
  disabled = false,
  className = '',
  showLabels = true,
  errors = {}
}) => {
  const {
    provinsi,
    kabKota,
    mission,
    uni,
    provinsiOptions,
    kabKotaOptions,
    handleProvinsiChange,
    handleKabKotaChange
  } = useTerritorySelection({
    initialProvinsi,
    initialKabKota,
    onChange
  });

  return (
    <div className={`territory-selector ${className}`}>
      {/* Provinsi Selection */}
      <div className="territory-field">
        <SearchableSelect
          id="provinsi"
          value={provinsi}
          options={provinsiOptions}
          onChange={handleProvinsiChange}
          placeholder="Pilih atau ketik nama provinsi..."
          disabled={disabled}
          className={errors.provinsi ? 'error' : ''}
          error={!!errors.provinsi}
          label={showLabels ? 'Provinsi' : undefined}
          required={showLabels}
        />
        {errors.provinsi && (
          <span className="error-message">{errors.provinsi}</span>
        )}
      </div>

      {/* Kabupaten/Kota Selection */}
      <div className="territory-field">
        <SearchableSelect
          id="kabKota"
          value={kabKota}
          options={kabKotaOptions}
          onChange={handleKabKotaChange}
          placeholder={provinsi ? 'Pilih atau ketik nama kab/kota...' : 'Pilih provinsi dulu'}
          disabled={disabled || !provinsi}
          className={errors.kabKota ? 'error' : ''}
          error={!!errors.kabKota}
          label={showLabels ? 'Kab/Kota' : undefined}
          required={showLabels}
        />
        {errors.kabKota && (
          <span className="error-message">{errors.kabKota}</span>
        )}
      </div>

      {/* Mission Display (Auto-selected) */}
      <div className="territory-field">
        {showLabels && (
          <label htmlFor="mission" className="territory-label">
            Mission
          </label>
        )}
        <input
          id="mission"
          type="text"
          value={mission}
          className={`territory-input auto-selected ${errors.mission ? 'error' : ''}`}
          disabled
          placeholder={kabKota ? 'Auto-selected' : 'Pilih Kab/Kota dulu'}
          readOnly
        />
        {errors.mission && (
          <span className="error-message">{errors.mission}</span>
        )}
        {mission && (
          <span className="help-text">Otomatis dipilih berdasarkan Kab/Kota</span>
        )}
      </div>

      {/* Uni Display (Auto-selected) */}
      <div className="territory-field">
        {showLabels && (
          <label htmlFor="uni" className="territory-label">
            Uni
          </label>
        )}
        <input
          id="uni"
          type="text"
          value={uni}
          className={`territory-input auto-selected ${errors.uni ? 'error' : ''}`}
          disabled
          placeholder={kabKota ? 'Auto-selected' : 'Pilih Kab/Kota dulu'}
          readOnly
        />
        {errors.uni && (
          <span className="error-message">{errors.uni}</span>
        )}
        {uni && (
          <span className="help-text">
            {uni === 'WIUM' && 'Western Indonesia Union Mission'}
            {uni === 'CIUM' && 'Central Indonesia Union Mission'}
            {uni === 'EIUC' && 'Eastern Indonesia Union Conference'}
          </span>
        )}
      </div>

      {/* Selection Summary */}
      {provinsi && kabKota && mission && uni && (
        <div className="territory-summary">
          <div className="summary-item">
            <span className="summary-label">Wilayah:</span>
            <span className="summary-value">{provinsi} → {kabKota}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Organisasi:</span>
            <span className="summary-value">{mission} ({uni})</span>
          </div>
        </div>
      )}
    </div>
  );
};