import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [label, setLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { showToast } = useToast();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/addresses');
      if (res.success && res.data) {
        setAddresses(res.data.addresses || []);
      }
    } catch (err) {
      console.warn('Address fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setLabel('Home');
    setRecipientName('');
    setPhone('');
    setStreet('');
    setCity('New Delhi');
    setState('Delhi');
    setPincode('110001');
    setLandmark('');
    setIsDefault(false);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        label,
        recipientName,
        phone,
        street,
        city,
        state,
        pincode,
        landmark,
        fullAddress: `${street}, ${landmark ? landmark + ', ' : ''}${city}, ${state} ${pincode}`,
        isDefault
      };

      if (editingId) {
        await api.put(`/users/addresses/${editingId}`, payload);
        showToast('Address updated successfully', 'success');
      } else {
        await api.post('/users/addresses', payload);
        showToast('New address saved', 'success');
      }

      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      showToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      showToast('Address deleted', 'info');
      fetchAddresses();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '800px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Saved Delivery Addresses</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage your delivery destinations for quick medicine checkout.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="80px" />
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Saved Addresses"
          description="Add your home, work, or family address to speed up emergency medicine delivery."
          actionLabel="Add Address"
          onAction={openAddModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {addresses.map((addr) => (
            <Card key={addr._id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '40px'
                    }}
                  >
                    <MapPin size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{addr.label}</h4>
                      {addr.isDefault && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: 'var(--secondary-50)',
                            color: 'var(--secondary-700)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)'
                          }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '2px' }}>
                      {addr.fullAddress}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Contact: {addr.recipientName} ({addr.phone})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr._id)}
                    style={{ color: 'var(--accent-600)', padding: '6px' }}
                    aria-label="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Address Label"
              as="select"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Parents">Parents</option>
              <option value="Other">Other</option>
            </Input>

            <Input
              label="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <Input
            label="Contact Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            required
          />

          <Input
            label="Street Address / Flat / Building"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="e.g. Flat 402, Block C, Royal Heights"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>

          <Input
            label="Landmark (Optional)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Metro Station"
          />

          <Button type="submit" variant="primary" fullWidth style={{ marginTop: '1rem' }}>
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Addresses;
