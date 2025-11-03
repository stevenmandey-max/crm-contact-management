import { useState, useCallback, useEffect } from 'react';
import { 
  getProvinsiList, 
  getKabKotaByProvinsi, 
  getMissionByKabKota, 
  getUniByKabKota,
  getTerritoryInfo 
} from '../data/territoryData';

export interface TerritorySelection {
  provinsi: string;
  kabKota: string;
  mission: string;
  uni: string;
}

export interface UseTerritorySelectionProps {
  initialProvinsi?: string;
  initialKabKota?: string;
  onChange?: (selection: TerritorySelection) => void;
}

export const useTerritorySelection = ({
  initialProvinsi = '',
  initialKabKota = '',
  onChange
}: UseTerritorySelectionProps = {}) => {
  const [provinsi, setProvinsi] = useState(initialProvinsi);
  const [kabKota, setKabKota] = useState(initialKabKota);
  const [mission, setMission] = useState('');
  const [uni, setUni] = useState('');

  // Get available options
  const provinsiOptions = getProvinsiList();
  const kabKotaOptions = provinsi ? getKabKotaByProvinsi(provinsi) : [];

  // Update mission and uni when kabKota changes
  useEffect(() => {
    if (provinsi && kabKota) {
      const newMission = getMissionByKabKota(provinsi, kabKota);
      const newUni = getUniByKabKota(provinsi, kabKota);
      
      setMission(newMission);
      setUni(newUni);
      
      // Notify parent component
      if (onChange) {
        onChange({
          provinsi,
          kabKota,
          mission: newMission,
          uni: newUni
        });
      }
    } else {
      setMission('');
      setUni('');
      
      if (onChange) {
        onChange({
          provinsi,
          kabKota,
          mission: '',
          uni: ''
        });
      }
    }
  }, [provinsi, kabKota, onChange]);

  // Handle provinsi change
  const handleProvinsiChange = useCallback((newProvinsi: string) => {
    setProvinsi(newProvinsi);
    
    // Reset dependent fields
    setKabKota('');
    setMission('');
    setUni('');
  }, []);

  // Handle kabKota change
  const handleKabKotaChange = useCallback((newKabKota: string) => {
    setKabKota(newKabKota);
  }, []);

  // Reset all selections
  const reset = useCallback(() => {
    setProvinsi('');
    setKabKota('');
    setMission('');
    setUni('');
  }, []);

  // Set initial values (useful for edit mode)
  const setInitialValues = useCallback((initialValues: Partial<TerritorySelection>) => {
    if (initialValues.provinsi) {
      setProvinsi(initialValues.provinsi);
    }
    if (initialValues.kabKota) {
      setKabKota(initialValues.kabKota);
    }
    // mission and uni will be auto-calculated by useEffect
  }, []);

  // Validate current selection
  const isValid = provinsi && kabKota && mission && uni;
  
  // Get territory info for current selection
  const territoryInfo = getTerritoryInfo(provinsi, kabKota);

  return {
    // Current values
    provinsi,
    kabKota,
    mission,
    uni,
    
    // Available options
    provinsiOptions,
    kabKotaOptions,
    
    // Handlers
    handleProvinsiChange,
    handleKabKotaChange,
    
    // Utilities
    reset,
    setInitialValues,
    isValid,
    territoryInfo,
    
    // Current selection object
    selection: {
      provinsi,
      kabKota,
      mission,
      uni
    }
  };
};