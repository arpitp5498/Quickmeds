import React from 'react';
import { Repeat, ArrowRight, ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const GenericAlternatives = ({ alternatives }) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <Repeat size={20} color="var(--primary-600)" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Switch & Save with Generics</h3>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        These medicines have the exact same active ingredients (composition) but are priced lower.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {alternatives.map((alt, index) => (
          <Card key={index} hoverable style={{ padding: '1.25rem', borderLeft: '4px solid var(--success-500)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, backgroundColor: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                <ShieldCheck size={12} /> Same Composition
              </span>
            </div>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>{alt.name}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>By {alt.manufacturer}</p>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{alt.price}</div>
                {alt.savingsPercentage && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600 }}>
                    Save {alt.savingsPercentage}%
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline" rightIcon={ArrowRight}>View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GenericAlternatives;
