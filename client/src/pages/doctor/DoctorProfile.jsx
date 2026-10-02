import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, Star, MapPin, Languages, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const DoctorProfile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    about: '',
    fee: 0,
    languages: '',
    phone: ''
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const doctorId = typeof user?.doctorId === 'object' ? user.doctorId._id : user?.doctorId;
      if (!doctorId) {
        toast.error('Doctor profile not found');
        return;
      }
      const res = await api.get(`/consultations/doctors/${doctorId}`);
      const d = res.data;
      setDoctor(d);
      setForm({
        about: d.about || '',
        fee: d.fee || 0,
        languages: (d.languages || []).join(', '),
        phone: d.phone || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Update user profile name/phone through auth
      await updateProfile({ phone: form.phone });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>;
  }

  if (!doctor) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Doctor profile not found. Please contact support.</p>
      </div>
    );
  }

  const verificationBadge = {
    VERIFIED: { icon: CheckCircle, color: '#10b981', label: 'Verified' },
    PENDING: { icon: Clock, color: '#f59e0b', label: 'Pending Verification' },
    REJECTED: { icon: AlertCircle, color: '#ef4444', label: 'Rejected' },
    SUSPENDED: { icon: AlertCircle, color: '#ef4444', label: 'Suspended' }
  };
  const badge = verificationBadge[doctor.verificationStatus] || verificationBadge.PENDING;

  return (
    <div style={{ padding: '24px 16px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '24px' }}>
        Doctor Profile
      </h1>

      {/* Verification Status Banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: doctor.verificationStatus === 'VERIFIED' ? '#d1fae5' : '#fef3c7',
        border: `1px solid ${doctor.verificationStatus === 'VERIFIED' ? '#6ee7b7' : '#fcd34d'}`,
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <badge.icon size={24} style={{ color: badge.color }} />
        <div>
          <p style={{ fontWeight: 600, color: badge.color }}>{badge.label}</p>
          {doctor.verificationStatus === 'PENDING' && (
            <p style={{ fontSize: '0.8125rem', color: '#92400e', marginTop: '2px' }}>
              Your profile is under review. You'll be notified once verified.
            </p>
          )}
          {doctor.verificationNotes && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Note: {doctor.verificationNotes}
            </p>
          )}
        </div>
      </div>

      {/* Read-Only Info */}
      <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Registration Details (Read-Only)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Full Name', value: doctor.name },
            { label: 'Registration Number', value: doctor.registrationNumber },
            { label: 'Specialty', value: doctor.specialty },
            { label: 'Qualification', value: doctor.qualification },
            { label: 'Experience', value: `${doctor.experience || 0} years` },
            { label: 'Rating', value: `⭐ ${doctor.rating || 4.5}/5` },
            { label: 'Consultations', value: doctor.consultationCount || 0 },
            { label: 'Member Since', value: new Date(doctor.createdAt).toLocaleDateString() }
          ].map((item, i) => (
            <div key={i}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Info */}
      <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>
          Contact & Personal Info
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || doctor.email || ''}
              disabled
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Consultation Fee (₹)
            </label>
            <input
              type="number"
              value={form.fee}
              disabled
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Contact admin to update your fee.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Languages size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Languages Spoken
            </label>
            <input
              type="text"
              value={form.languages}
              disabled
              placeholder="e.g., English, Hindi, Tamil"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '8px', backgroundColor: 'var(--primary-600)', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Available Slots */}
      {doctor.availableSlots && doctor.availableSlots.length > 0 && (
        <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> Available Slots
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {doctor.availableSlots.map((slot, i) => (
              <span key={i} style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--primary-200)' }}>
                {slot.day}: {slot.startTime} - {slot.endTime}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
