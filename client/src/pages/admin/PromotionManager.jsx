import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Calendar,
  Percent,
  Package,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/CardsAndBadges';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = [
  'Pain & Fever',
  'Oral Rehydration & Electrolytes',
  'Gastrointestinal Care',
  'Acidity & Reflux',
  'Constipation & Diarrhoea',
  'Allergy & Antihistamines',
  'Respiratory & Asthma',
  'Diabetes Care',
  'Cardiovascular Care',
  'Dermatological & Skin Care',
  'Wound Care & Antiseptics',
  'Eye, Ear & Nasal Care',
  'Vitamins & Mineral Supplements',
  'Bone & Nutritional Support',
  'Women Health & Hygiene',
  'Pediatric Care',
  'Essential Outpatient Medicines'
];

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'expired', label: 'Expired' },
  { id: 'inactive', label: 'Inactive' }
];

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getPromotionStatus = (promo) => {
  if (!promo.isActive) return 'Inactive';
  const now = new Date();
  const from = new Date(promo.validFrom);
  const to = new Date(promo.validTo);
  if (to < now) return 'Expired';
  if (from > now) return 'Scheduled';
  return 'Active';
};

const PromotionManager = () => {
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    applicableTo: 'SPECIFIC_MEDICINES',
    selectedMedicines: [], // array of { _id, name }
    categories: [],
    validFrom: '',
    validTo: '',
    priority: 0
  });

  // Medicine picker search state
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSearchResults, setMedSearchResults] = useState([]);
  const [searchingMeds, setSearchingMeds] = useState(false);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }
      const res = await api.get(`/promotions?${params.toString()}`);
      if (res.success && res.data) {
        setPromotions(res.data.promotions || []);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to fetch promotions', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, showToast]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Handle medicine search for picker
  useEffect(() => {
    if (!medSearchQuery.trim()) {
      setMedSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingMeds(true);
        const res = await api.get(`/medicines?q=${encodeURIComponent(medSearchQuery.trim())}&limit=10`);
        if (res.success && res.data) {
          setMedSearchResults(res.data.medicines || []);
        }
      } catch (err) {
        console.error('Error searching medicines:', err);
      } finally {
        setSearchingMeds(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [medSearchQuery]);

  const openCreateModal = () => {
    setEditingPromotion(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData({
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountAmount: '',
      applicableTo: 'SPECIFIC_MEDICINES',
      selectedMedicines: [],
      categories: [],
      validFrom: today,
      validTo: nextMonth,
      priority: 0
    });
    setMedSearchQuery('');
    setMedSearchResults([]);
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromotion(promo);
    const meds = (promo.medicineIds || []).map((m) =>
      typeof m === 'object' ? { _id: m._id, name: m.name } : { _id: m, name: 'Medicine' }
    );

    setFormData({
      name: promo.name || '',
      description: promo.description || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue ?? '',
      maxDiscountAmount: promo.maxDiscountAmount ?? '',
      applicableTo: promo.applicableTo || 'SPECIFIC_MEDICINES',
      selectedMedicines: meds,
      categories: promo.categories || [],
      validFrom: formatDateForInput(promo.validFrom),
      validTo: formatDateForInput(promo.validTo),
      priority: promo.priority ?? 0
    });
    setMedSearchQuery('');
    setMedSearchResults([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    setMedSearchQuery('');
    setMedSearchResults([]);
  };

  const handleToggleStatus = async (promo) => {
    try {
      setActionLoadingId(promo._id);
      const res = await api.patch(`/promotions/${promo._id}/toggle`);
      if (res.success) {
        showToast(
          `Promotion ${promo.name} is now ${!promo.isActive ? 'Active' : 'Inactive'}`,
          'success'
        );
        fetchPromotions();
      }
    } catch (err) {
      showToast(err?.message || 'Failed to toggle status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (promo) => {
    if (!window.confirm(`Are you sure you want to delete promotion "${promo.name}"?`)) {
      return;
    }
    try {
      setActionLoadingId(promo._id);
      const res = await api.delete(`/promotions/${promo._id}`);
      if (res.success) {
        showToast('Promotion deleted successfully', 'success');
        fetchPromotions();
      }
    } catch (err) {
      showToast(err?.message || 'Failed to delete promotion', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddMedicine = (med) => {
    if (formData.selectedMedicines.some((m) => m._id === med._id)) return;
    setFormData((prev) => ({
      ...prev,
      selectedMedicines: [...prev.selectedMedicines, { _id: med._id, name: med.name }]
    }));
  };

  const handleRemoveMedicine = (medId) => {
    setFormData((prev) => ({
      ...prev,
      selectedMedicines: prev.selectedMedicines.filter((m) => m._id !== medId)
    }));
  };

  const handleToggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Promotion name is required', 'error');
      return;
    }
    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid positive discount value', 'error');
      return;
    }
    if (formData.discountType === 'PERCENTAGE' && val > 50) {
      showToast('Percentage discount cannot exceed 50% for pharmaceutical products', 'error');
      return;
    }
    if (formData.applicableTo === 'SPECIFIC_MEDICINES' && formData.selectedMedicines.length === 0) {
      showToast('Please select at least one medicine', 'error');
      return;
    }
    if (formData.applicableTo === 'CATEGORY' && formData.categories.length === 0) {
      showToast('Please select at least one category', 'error');
      return;
    }
    if (!formData.validFrom || !formData.validTo) {
      showToast('Start and End dates are required', 'error');
      return;
    }
    if (new Date(formData.validTo) <= new Date(formData.validFrom)) {
      showToast('End date must be after start date', 'error');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: val,
      maxDiscountAmount:
        formData.discountType === 'PERCENTAGE' && formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
      applicableTo: formData.applicableTo,
      medicineIds:
        formData.applicableTo === 'SPECIFIC_MEDICINES'
          ? formData.selectedMedicines.map((m) => m._id)
          : [],
      categories: formData.applicableTo === 'CATEGORY' ? formData.categories : [],
      validFrom: new Date(formData.validFrom).toISOString(),
      validTo: new Date(formData.validTo).toISOString(),
      priority: parseInt(formData.priority, 10) || 0
    };

    try {
      setSaving(true);
      if (editingPromotion) {
        await api.put(`/promotions/${editingPromotion._id}`, payload);
        showToast('Promotion updated successfully', 'success');
      } else {
        await api.post('/promotions', payload);
        showToast('Promotion created successfully', 'success');
      }
      closeModal();
      fetchPromotions();
    } catch (err) {
      showToast(err?.message || 'Failed to save promotion', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'Scheduled':
        return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
      case 'Expired':
        return { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' };
      case 'Inactive':
      default:
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Tag size={28} color="var(--primary-600)" /> Promotions & Discounts
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure and manage promotional discounts across medicines and therapeutic categories.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          icon={Plus}
          iconPosition="left"
        >
          Create Promotion
        </Button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '8px',
          overflowX: 'auto'
        }}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Promotion Cards List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} style={{ padding: '20px' }}>
              <Skeleton width="60%" height="24px" style={{ marginBottom: '12px' }} />
              <Skeleton width="90%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="40%" height="20px" style={{ marginBottom: '16px' }} />
              <Skeleton width="100%" height="36px" />
            </Card>
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No promotions found"
          description={
            activeFilter === 'all'
              ? 'No promotions have been configured yet. Create one to get started.'
              : `There are currently no ${activeFilter} promotions.`
          }
          actionLabel="Create Promotion"
          onAction={openCreateModal}
          actionIcon={Plus}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px'
          }}
        >
          {promotions.map((promo) => {
            const status = getPromotionStatus(promo);
            const statusStyle = getStatusBadgeStyle(status);
            const isPercentage = promo.discountType === 'PERCENTAGE';
            const isActing = actionLoadingId === promo._id;

            return (
              <Card
                key={promo._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div>
                  {/* Top Bar: Discount Value Badge + Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.9375rem',
                          fontWeight: 800,
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px'
                        }}
                      >
                        {isPercentage ? (
                          <>
                            <Percent size={14} /> {promo.discountValue}% OFF
                          </>
                        ) : (
                          `₹${promo.discountValue} OFF`
                        )}
                      </span>

                      <Badge variant="default" size="sm">
                        {promo.discountType}
                      </Badge>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Name and Description */}
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '6px'
                    }}
                  >
                    {promo.name}
                  </h3>
                  {promo.description && (
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}
                    >
                      {promo.description}
                    </p>
                  )}

                  {/* Max Discount Cap */}
                  {isPercentage && promo.maxDiscountAmount && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '10px',
                        fontWeight: 600
                      }}
                    >
                      Max discount cap: ₹{promo.maxDiscountAmount}
                    </div>
                  )}

                  {/* Applicable Scope */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '12px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}
                    >
                      Applicable To:{' '}
                      <span style={{ color: 'var(--primary-700)' }}>
                        {promo.applicableTo === 'CATEGORY' ? 'Categories' : 'Specific Medicines'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {promo.applicableTo === 'CATEGORY' ? (
                        promo.categories && promo.categories.length > 0 ? (
                          promo.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: 'var(--bg-card)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-main)'
                              }}
                            >
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None specified</span>
                        )
                      ) : promo.medicineIds && promo.medicineIds.length > 0 ? (
                        promo.medicineIds.map((m, idx) => {
                          const medName = typeof m === 'object' ? m.name : m;
                          return (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: 'var(--bg-card)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-main)'
                              }}
                            >
                              {medName}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None selected</span>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '16px'
                    }}
                  >
                    <Calendar size={14} />
                    <span>
                      {formatDateDisplay(promo.validFrom)} → {formatDateDisplay(promo.validTo)}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions: Active Toggle, Edit, Delete */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(promo)}
                    disabled={isActing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: isActing ? 'not-allowed' : 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: promo.isActive ? '#16a34a' : 'var(--text-muted)'
                    }}
                  >
                    {promo.isActive ? (
                      <ToggleRight size={22} color="#16a34a" />
                    ) : (
                      <ToggleLeft size={22} color="var(--text-muted)" />
                    )}
                    <span>{promo.isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(promo)}
                      icon={Edit}
                      disabled={isActing}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(promo)}
                      icon={Trash2}
                      disabled={isActing}
                      style={{ color: 'var(--accent-600)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '4px'
              }}
            >
              Promotion Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monsoon Wellness 20% Off"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '4px'
              }}
            >
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short note or promotional terms"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Discount Type Radio & Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '8px'
                }}
              >
                Discount Type
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="radio"
                    name="discountType"
                    value="PERCENTAGE"
                    checked={formData.discountType === 'PERCENTAGE'}
                    onChange={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                  />
                  Percentage
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="radio"
                    name="discountType"
                    value="FIXED_AMOUNT"
                    checked={formData.discountType === 'FIXED_AMOUNT'}
                    onChange={() => setFormData({ ...formData, discountType: 'FIXED_AMOUNT', maxDiscountAmount: '' })}
                  />
                  Fixed Amount
                </label>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px'
                }}
              >
                {formData.discountType === 'PERCENTAGE' ? 'Discount Value (% off, max 50%) *' : 'Discount Value (₹ off) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={formData.discountType === 'PERCENTAGE' ? '50' : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 50'}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Max Discount Amount (Only for Percentage) */}
          {formData.discountType === 'PERCENTAGE' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px'
                }}
              >
                Max Discount Amount (₹ cap, optional)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                placeholder="e.g. 200 (leave blank for uncapped)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          )}

          {/* Applicable To Radio */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '8px'
              }}
            >
              Applicable To
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="applicableTo"
                  value="SPECIFIC_MEDICINES"
                  checked={formData.applicableTo === 'SPECIFIC_MEDICINES'}
                  onChange={() => setFormData({ ...formData, applicableTo: 'SPECIFIC_MEDICINES' })}
                />
                Specific Medicines
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="applicableTo"
                  value="CATEGORY"
                  checked={formData.applicableTo === 'CATEGORY'}
                  onChange={() => setFormData({ ...formData, applicableTo: 'CATEGORY' })}
                />
                Category
              </label>
            </div>
          </div>

          {/* Specific Medicines Picker */}
          {formData.applicableTo === 'SPECIFIC_MEDICINES' && (
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)'
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px'
                }}
              >
                Search & Select Medicines *
              </label>

              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Type medicine name to search..."
                  value={medSearchQuery}
                  onChange={(e) => setMedSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-card)'
                  }}
                />
              </div>

              {/* Dropdown / Search Results */}
              {searchingMeds && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px' }}>
                  Searching medicines...
                </div>
              )}
              {medSearchResults.length > 0 && (
                <div
                  style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '8px'
                  }}
                >
                  {medSearchResults.map((med) => {
                    const isSelected = formData.selectedMedicines.some((m) => m._id === med._id);
                    return (
                      <div
                        key={med._id}
                        onClick={() => !isSelected && handleAddMedicine(med)}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-light)',
                          cursor: isSelected ? 'default' : 'pointer',
                          backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div>
                          <strong>{med.name}</strong>{' '}
                          <span style={{ color: 'var(--text-muted)' }}>
                            ({med.strength} • ₹{med.mrp})
                          </span>
                        </div>
                        {isSelected ? (
                          <Badge variant="success" size="sm">Added</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" type="button">
                            + Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected medicines chips */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Selected Medicines ({formData.selectedMedicines.length}):
                </span>
                {formData.selectedMedicines.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-600)' }}>
                    No medicines selected yet.
                  </span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.selectedMedicines.map((med) => (
                      <span
                        key={med._id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-800)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '16px'
                        }}
                      >
                        {med.name}
                        <X
                          size={13}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleRemoveMedicine(med._id)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Picker */}
          {formData.applicableTo === 'CATEGORY' && (
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)'
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '8px'
                }}
              >
                Select Categories ({formData.categories.length} selected) *
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '4px'
                }}
              >
                {CATEGORIES.map((cat) => {
                  const checked = formData.categories.includes(cat);
                  return (
                    <label
                      key={cat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: checked ? 'var(--primary-50)' : 'transparent',
                        border: checked ? '1px solid var(--primary-300)' : '1px solid transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleCategory(cat)}
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dates: Valid From & Valid To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px'
                }}
              >
                Valid From *
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px'
                }}
              >
                Valid To *
              </label>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '4px'
              }}
            >
              Priority (Higher number = higher precedence)
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '12px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '16px'
            }}
          >
            <Button variant="ghost" type="button" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingPromotion ? 'Save Changes' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PromotionManager;
