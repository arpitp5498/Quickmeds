import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Activity, ShieldCheck, Heart, Sparkles, Thermometer, Wind, Smile } from 'lucide-react';
import Card from '../../components/ui/Card';

const CATEGORIES_DATA = [
  { name: 'Fever & Pain', desc: 'Paracetamol, Ibuprofen, Analgesics', icon: Thermometer, color: '#e11d48', bg: '#ffe4e6' },
  { name: 'Cold & Cough', desc: 'Antihistamines, Cough syrups, Vaporizers', icon: Wind, color: '#0284c7', bg: '#e0f2fe' },
  { name: 'Digestive Care', desc: 'Antacids, ORS, Probiotics, Laxatives', icon: Sparkles, color: '#059669', bg: '#d1fae5' },
  { name: 'Cardiac & Diabetes', desc: 'Blood pressure, Metformin, Statins', icon: Heart, color: '#dc2626', bg: '#fee2e2' },
  { name: 'Antibiotics & Anti-infectives', desc: 'Amoxicillin, Azithromycin (Rx strictly required)', icon: ShieldCheck, color: '#7c3aed', bg: '#ede9fe' },
  { name: 'Vitamins & Supplements', desc: 'Vitamin D3, B-Complex, Calcium, Zinc', icon: Pill, color: '#d97706', bg: '#fef3c7' },
  { name: 'First Aid & Surgical', desc: 'Bandages, Antiseptics, Ointments, Gauze', icon: Activity, color: '#0d9488', bg: '#ccfbf1' },
  { name: 'Skin & Personal Care', desc: 'Moisturizers, Antifungal creams, Lotions', icon: Smile, color: '#db2777', bg: '#fce7f3' }
];

const MedicineCategories = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore Medicine Categories</h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Browse healthcare essentials by therapeutic area and symptom relief.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {CATEGORIES_DATA.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Card
              key={idx}
              hoverable
              onClick={() => navigate(`/medicines?category=${encodeURIComponent(cat.name)}`)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: cat.bg,
                  color: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '52px'
                }}
              >
                <Icon size={26} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '4px' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {cat.desc}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MedicineCategories;
