import React from 'react';
import { Store, MapPin, Star, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const PriceComparisonTable = ({ pharmacies, mrp }) => {
  if (!pharmacies || pharmacies.length === 0) return null;

  // Sort by price ascending
  const sortedPharmacies = [...pharmacies].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPharmacies[0].price;

  return (
    <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="var(--primary-600)" />
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Compare Prices Nearby</h4>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: '#ffffff' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pharmacy</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Distance</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedPharmacies.map((pharmacy, index) => {
              const isCheapest = pharmacy.price === lowestPrice;
              const savings = mrp - pharmacy.price;
              
              return (
                <tr key={pharmacy._id || index} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: isCheapest ? '#f0fdf4' : '#ffffff' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Store size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {pharmacy.name}
                          {isCheapest && <span style={{ fontSize: '0.625rem', padding: '2px 6px', backgroundColor: 'var(--success-100)', color: 'var(--success-700)', borderRadius: '10px', fontWeight: 700 }}>BEST PRICE</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Star size={12} fill="#f59e0b" color="#f59e0b" /> {pharmacy.rating || '4.5'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{pharmacy.price}</div>
                    {savings > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600 }}>Save ₹{savings}</div>
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {pharmacy.distance} km
                    </div>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <Button variant={isCheapest ? 'primary' : 'outline'} size="sm">Select</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceComparisonTable;
