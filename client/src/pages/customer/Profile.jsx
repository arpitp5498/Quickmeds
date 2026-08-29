import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({ name, phone });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '650px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Account Settings
      </h1>

      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}
        >
          <Avatar name={user?.name} size={64} />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{user?.name}</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {user?.email} • Role: <strong>{user?.role}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address (Locked)"
            icon={Mail}
            value={user?.email || ''}
            disabled
            helperText="Email address cannot be changed."
          />

          <Input
            label="Mobile Phone Number"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" loading={loading} icon={Save}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
