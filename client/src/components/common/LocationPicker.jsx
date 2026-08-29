import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const POPULAR_LOCATIONS = [
  { name: 'Connaught Place, New Delhi', city: 'New Delhi', lat: 28.629, lng: 77.214 },
  { name: 'Karol Bagh, New Delhi', city: 'New Delhi', lat: 28.651, lng: 77.19 },
  { name: 'South Extension, New Delhi', city: 'New Delhi', lat: 28.571, lng: 77.221 },
  { name: 'Lajpat Nagar, New Delhi', city: 'New Delhi', lat: 28.567, lng: 77.243 },
  { name: 'Janakpuri, West Delhi', city: 'New Delhi', lat: 28.629, lng: 77.085 },
  { name: 'Sector 18, Noida', city: 'Noida', lat: 28.5708, lng: 77.326 },
  { name: 'Cyber Hub, Gurugram', city: 'Gurugram', lat: 28.4986, lng: 77.0878 },
  { name: 'Indiranagar, Bengaluru', city: 'Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Bandra West, Mumbai', city: 'Mumbai', lat: 19.0596, lng: 72.8295 }
];

const LocationPicker = () => {
  const { location, setLocation, detectCurrentLocation, isDetecting, locationError } =
    useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const handleSelectPreset = (loc) => {
    setLocation({
      address: loc.name,
      city: loc.city,
      lat: loc.lat,
      lng: loc.lng
    });
    setIsOpen(false);
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      setLocation({
        address: manualAddress.trim(),
        city: 'Selected Area',
        lat: 28.629, // default Delhi coords or geocoded
        lng: 77.214
      });
      setManualAddress('');
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-main)',
          fontSize: '0.8125rem',
          maxWidth: '220px',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        title={location.address}
      >
        <MapPin size={15} color="var(--primary-600)" style={{ minWidth: '15px' }} />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}
        >
          {location.city || 'Set Location'}
        </span>
        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Delivery Location">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* GPS Auto-detect Button */}
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              detectCurrentLocation();
              setIsOpen(false);
            }}
            loading={isDetecting}
            icon={Navigation}
          >
            Detect My GPS Location
          </Button>

          {locationError && (
            <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{locationError}</p>
          )}

          {/* Manual Address Input */}
          <form onSubmit={handleSaveManual}>
            <Input
              label="Or enter custom address / pincode"
              placeholder="e.g. 14 Main Ring Road, Lajpat Nagar, 110024"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!manualAddress.trim()}
              fullWidth
            >
              Set Custom Address
            </Button>
          </form>

          {/* Quick Hub Presets */}
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Popular Delivery Hubs
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '8px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {POPULAR_LOCATIONS.map((loc, i) => {
                const isSelected = location.address === loc.name;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectPreset(loc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--primary-50)' : 'transparent',
                      color: isSelected ? 'var(--primary-700)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin
                        size={14}
                        color={isSelected ? 'var(--primary-600)' : 'var(--text-muted)'}
                      />
                      <span>{loc.name}</span>
                    </div>
                    {isSelected && <Check size={16} color="var(--primary-600)" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LocationPicker;
