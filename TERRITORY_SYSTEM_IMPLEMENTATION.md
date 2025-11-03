# Territory System Implementation

## Overview
Sistem territory telah diimplementasikan untuk menggantikan field provinsi dan mission yang lama dengan sistem yang lebih terstruktur berdasarkan data wilayah Indonesia dan organisasi Advent.

## New Features

### 1. Territory Data Structure
- **Provinsi**: Daftar provinsi di Indonesia
- **Kabupaten/Kota**: Daftar kabupaten/kota per provinsi
- **Mission**: Otomatis dipilih berdasarkan kabupaten/kota
- **Uni**: Otomatis dipilih (WIUM/CIUM/EIUC)

### 2. Components Added

#### TerritorySelector Component
- **Location**: `src/components/common/TerritorySelector.tsx`
- **Features**:
  - Cascading dropdown (Provinsi → Kab/Kota)
  - Auto-selection of Mission and Uni
  - Responsive design (horizontal layout on larger screens)
  - Error handling and validation
  - Visual summary of selection

#### useTerritorySelection Hook
- **Location**: `src/hooks/useTerritorySelection.ts`
- **Features**:
  - State management for territory selection
  - Auto-calculation of mission and uni
  - Validation and error handling
  - Callback support for parent components

### 3. Data Integration

#### Territory Data
- **Location**: `src/data/territoryData.ts`
- **Functions**:
  - `getProvinsiList()`: Get all provinces
  - `getKabKotaByProvinsi(provinsi)`: Get cities by province
  - `getMissionByKabKota(provinsi, kabKota)`: Get mission by location
  - `getUniByKabKota(provinsi, kabKota)`: Get uni by location
  - `getTerritoryInfo(provinsi, kabKota)`: Get complete territory info

### 4. Contact Model Updates

#### New Fields Added
```typescript
interface Contact {
  // ... existing fields
  provinsi: string;
  kabKota?: string;    // New field
  mission?: string;    // Changed from Mission type to string
  uni?: string;        // New field
  // ... other fields
}
```

#### ContactModel Constructor Updated
- Added `kabKota` and `uni` parameters
- Updated `mission` type from `Mission` to `string`
- Updated `fromObject` method to handle new fields

### 5. ContactForm Integration

#### Form Updates
- Replaced old provinsi dropdown with TerritorySelector
- Removed old mission dropdown
- Added territory validation
- Updated form data structure
- Added handleTerritoryChange callback

#### Validation
- Validates that kabKota is selected when provinsi is selected
- Territory fields are optional but must be complete if started

### 6. CSS Styling

#### TerritorySelector Styles
- **Location**: `src/components/common/TerritorySelector.css`
- **Features**:
  - Responsive grid layout
  - Auto-selected field styling
  - Territory summary display
  - Error state styling
  - Dark mode support

#### ContactForm Integration
- Added `.territory-group` styles
- Full-width territory selector
- Responsive layout adjustments

## Usage

### Basic Usage
```tsx
import { TerritorySelector } from '../common/TerritorySelector';

<TerritorySelector
  initialProvinsi={formData.provinsi}
  initialKabKota={formData.kabKota}
  onChange={handleTerritoryChange}
  disabled={isSubmitting}
  errors={{
    provinsi: errors.provinsi,
    kabKota: errors.kabKota,
    mission: errors.mission,
    uni: errors.uni
  }}
  className="horizontal"
/>
```

### Hook Usage
```tsx
import { useTerritorySelection } from '../../hooks/useTerritorySelection';

const {
  provinsi,
  kabKota,
  mission,
  uni,
  provinsiOptions,
  kabKotaOptions,
  handleProvinsiChange,
  handleKabKotaChange,
  isValid
} = useTerritorySelection({
  initialProvinsi: 'Jawa Barat',
  initialKabKota: 'Bandung',
  onChange: (selection) => {
    console.log('Territory changed:', selection);
  }
});
```

## Migration Notes

### Legacy Support
- Old `Mission` type is commented out in constants
- Old `PROVINSI_OPTIONS` is commented out
- Existing contacts will continue to work
- New contacts use the territory system

### Data Migration
- Existing contacts retain their `provinsi` and `mission` values
- New `kabKota` and `uni` fields are optional
- Users can edit existing contacts to add complete territory info

## Territory Mapping

### Missions by Region
- **NSM**: North Sumatra Mission
- **CSM**: Central Sumatra Mission  
- **SSM**: South Sumatra Mission
- **JBC**: Java Bandung Conference
- **JC**: Jakarta Conference
- **WJC**: West Java Conference
- **CJM**: Central Java Mission
- **NTM**: North Toraja Mission
- **WKR**: West Papua Region
- **EKM**: East Maluku Mission

### Unis by Region
- **WIUM**: Western Indonesia Union Mission
- **CIUM**: Central Indonesia Union Mission
- **EIUC**: Eastern Indonesia Union Conference

## Benefits

1. **Structured Data**: Clear hierarchy from province to mission
2. **Auto-Selection**: Reduces user input errors
3. **Consistency**: Standardized territory assignments
4. **Scalability**: Easy to add new territories
5. **User Experience**: Intuitive cascading selection
6. **Validation**: Built-in territory validation

## Future Enhancements

1. **Search Functionality**: Add search within dropdowns
2. **Bulk Updates**: Tool to update existing contacts
3. **Territory Reports**: Analytics by territory
4. **Custom Territories**: Support for custom territory definitions
5. **API Integration**: Connect to external territory services

## Files Modified

### Core Files
- `src/types/index.ts` - Updated Contact interface
- `src/models/Contact.ts` - Updated ContactModel
- `src/components/contacts/ContactForm.tsx` - Integrated TerritorySelector
- `src/components/contacts/ContactForm.css` - Added territory styles
- `src/utils/constants.ts` - Commented out legacy options

### New Files
- `src/components/common/TerritorySelector.tsx`
- `src/components/common/TerritorySelector.css`
- `src/hooks/useTerritorySelection.ts`

### Data Files
- `src/data/territoryData.ts` - Territory mapping data

## Testing

The territory system has been integrated into the ContactForm and should be tested by:

1. Creating new contacts with territory selection
2. Editing existing contacts to add territory info
3. Verifying auto-selection of mission and uni
4. Testing validation and error handling
5. Checking responsive design on different screen sizes

## Conclusion

The territory system provides a more structured and user-friendly way to handle location and organizational data in the CRM. It maintains backward compatibility while offering enhanced functionality for new contacts.