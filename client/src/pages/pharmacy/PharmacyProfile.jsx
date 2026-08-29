import React, { useState, useEffect } from 'react';
import { Store, Phone, Mail, MapPin, Clock, Save, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';

const PharmacyProfile = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [openTime, setOpenTime] = useState('08:00 AM');
  const [closeTime, setCloseTime] = useState('11:00 PM');
  const [isOpen, setIsOpen] = useState(true);
  const [is24x7, setIs24x7] = useState(false);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/pharmacies/profile/me');
        if (res.success && res.data) {
          const p = res.data.pharmacy;
          setPharmacy(p);
          setName(p.name || '');
          setTagline(p.tagline || '');
          setPhone(p.phone || '');
          setEmail(p.email || '');
          setStreet(p.address?.street || '');
          setCity(p.address?.city || '');
          setOpenTime(p.operatingHours?.open || '08:00 AM');
          setCloseTime(p.operatingHours?.close || '11:00 PM');
          setIsOpen(p.isOpen !== undefined ? p.isOpen : true);
          setIs24x7(p.operatingHours?.is24x7 || false);
          setServiceRadiusKm(p.serviceRadiusKm || 10);
        }
      } catch (err) {
        console.warn('Pharmacy profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/pharmacies/profile/me', {
        name,
        tagline,
        phone,
        email,
        address: {
          street,
          city,
          fullAddress: `${street}, ${city}`
        },
        operatingHours: {
          open: openTime,
          close: closeTime,
          is24x7
        },
        isOpen,
        serviceRadiusKm: parseFloat(serviceRadiusKm)
      });

      if (res.success) {
        showToast('Pharmacy profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton height="300px" />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pharmacy Settings & Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Configure store operating hours, service radius, and contact information.
        </p>
      </div>

      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Store size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{pharmacy?.name}</h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Drug License: <strong>{pharmacy?.licenseNumber}</strong>
              </span>
            </div>
          </div>

          <Badge variant="verified">
            <ShieldCheck size={14} /> {pharmacy?.verificationStatus || 'VERIFIED'}
          </Badge>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input
              label="Pharmacy Public Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Tagline / Description"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. 24x7 Emergency Medstore"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input
              label="Store Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Store Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input
              label="Street / Market Address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <Input
              label="Opening Time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
            <Input
              label="Closing Time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
            <Input
              label="Service Radius (km)"
              type="number"
              min="1"
              max="25"
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
              />
              Accepting Online Orders Right Now
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={is24x7}
                onChange={(e) => setIs24x7(e.target.checked)}
              />
              24x7 Emergency Service
            </label>
          </div>

          <Button type="submit" variant="primary" loading={saving} icon={Save}>
            Save Pharmacy Profile
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PharmacyProfile;
