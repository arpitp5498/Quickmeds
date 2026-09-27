import React from 'react';
import { Truck, Map, Info } from 'lucide-react';

const RuralDeliveryBanner = ({ distanceKm, estimatedDays }) => {
  if (!distanceKm || distanceKm <= 15) return null; // Only show for distances > 15km

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      margin: '1rem 0'
    }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fde68a', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Truck size={18} />
      </div>
      <div>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#92400e', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Extended Delivery Area <Map size={14} />
        </h4>
        <p style={{ fontSize: '0.8125rem', color: '#b45309', margin: 0, lineHeight: 1.4 }}>
          This location is {distanceKm}km away from our nearest hub. Estimated delivery time is <strong>{estimatedDays} days</strong>.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
          <Info size={12} /> Community drop points are available for faster pickup.
        </div>
      </div>
    </div>
  );
};

export default RuralDeliveryBanner;
