import React, { useId, useRef, useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check, X } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import Button from '../ui/Button';

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

export default function LocationPicker({ onSelect, label }) {
  const { location, setLocation, detectCurrentLocation, isDetecting, locationError } = useLocation();
  const [query, setQuery] = useState('');
  const dialog = useRef(null);
  const id = useId();
  const matches = POPULAR_LOCATIONS.filter(area => area.name.toLowerCase().includes(query.trim().toLowerCase()));
  const areaName = location.city === 'Current Area' ? 'Current location' : location.address?.split(',')[0] || location.city;
  const close = () => dialog.current?.close();
  const select = area => {
    if (!dialog.current?.open) return;
    (onSelect || setLocation)(area);
    close();
  };
  return (
    <>
      <button type="button" className="qm-area-trigger" aria-label={label || `Change delivery area, ${areaName}`}
        aria-haspopup="dialog" onClick={() => { setQuery(''); dialog.current.showModal(); }}>
        <MapPin size={16} /><span>{label || areaName}</span><ChevronDown size={14} />
      </button>
      <dialog ref={dialog} className="qm-location-dialog" aria-labelledby={id + '-title'}
        onClick={event => { if (event.target === dialog.current) close(); }}>
        <div className="qm-dialog-inner">
          <div className="qm-dialog-title"><h2 id={id + '-title'}>Delivery area</h2>
            <button type="button" aria-label="Close delivery area" onClick={close}><X size={20} /></button>
          </div>
          <Button variant="outline" fullWidth icon={Navigation} loading={isDetecting}
            onClick={async () => { const area = await detectCurrentLocation(); if (area) select(area); }}>Use my current location</Button>
          {locationError && <p role="alert">{locationError}</p>}
          <label htmlFor={id + '-search'}>Search by area or city</label>
          <input id={id + '-search'} type="search" value={query} placeholder="e.g. Noida"
            onKeyDown={event => { if (event.key === 'Enter') event.preventDefault(); }}
            onChange={event => setQuery(event.target.value)} />
          <div className="qm-area-options">
            {matches.map(area => (
              <button key={area.name} type="button" disabled={isDetecting} onClick={() =>
                select({ address: area.name, city: area.city, lat: area.lat, lng: area.lng })}>
                <MapPin size={15} /><span>{area.name}</span>{!onSelect && location.lat === area.lat && location.lng === area.lng && <Check size={16} aria-label="Selected" />}
              </button>
            ))}
            {!matches.length && <p role="status">No matching areas. Use your current location to search nearby.</p>}
          </div>
        </div>
      </dialog>
    </>
  );
}
