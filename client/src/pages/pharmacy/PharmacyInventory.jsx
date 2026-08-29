import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Pill
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { getMedicineImage } from '../../utils/medicineImages';

const PharmacyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockQuantity, setStockQuantity] = useState(20);
  const [price, setPrice] = useState(50);
  const [discountPercentage, setDiscountPercentage] = useState(5);
  const [batchNumber, setBatchNumber] = useState('');

  const { showToast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let url = '/inventory';
      if (lowStockOnly) url += '?lowStockOnly=true';
      const res = await api.get(url);
      if (res.success && res.data) {
        setInventory(res.data.inventory || []);
      }
    } catch (err) {
      console.warn('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Fetch master medicines list for adding new inventory
    api.get('/medicines?limit=100').then((res) => {
      if (res.success && res.data) {
        setMasterMedicines(res.data.medicines || []);
      }
    });
  }, [lowStockOnly]);

  const openAddModal = () => {
    setEditingItem(null);
    setSelectedMedicineId(masterMedicines[0]?._id || '');
    setStockQuantity(25);
    setPrice(masterMedicines[0]?.mrp || 50);
    setDiscountPercentage(5);
    setBatchNumber(`BAT-${Date.now().toString().slice(-6)}`);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setSelectedMedicineId(item.medicineId?._id || '');
    setStockQuantity(item.stockQuantity);
    setPrice(item.price);
    setDiscountPercentage(item.discountPercentage || 0);
    setBatchNumber(item.batchNumber || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, {
          stockQuantity: parseInt(stockQuantity, 10),
          price: parseFloat(price),
          discountPercentage: parseFloat(discountPercentage)
        });
        showToast('Inventory item updated', 'success');
      } else {
        await api.post('/inventory', {
          medicineId: selectedMedicineId,
          stockQuantity: parseInt(stockQuantity, 10),
          price: parseFloat(price),
          discountPercentage: parseFloat(discountPercentage),
          batchNumber
        });
        showToast('Medicine added to inventory', 'success');
      }

      setModalOpen(false);
      fetchInventory();
    } catch (err) {
      showToast(err.message || 'Failed to save inventory', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      showToast('Item removed from inventory', 'info');
      fetchInventory();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filtered = inventory.filter((item) => {
    if (!item.medicineId) return false;
    const s = searchTerm.toLowerCase();
    return (
      item.medicineId.name.toLowerCase().includes(s) ||
      item.medicineId.genericName.toLowerCase().includes(s) ||
      item.batchNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pharmacy Inventory</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage your store stock levels, batch numbers, and selling prices in real time.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Medicine to Stock
        </Button>
      </div>

      {/* Filter Bar */}
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
        <div style={{ flex: 1, minWidth: '240px' }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search your inventory by medicine or batch..."
          />
        </div>

        <button
          type="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${lowStockOnly ? 'var(--accent-500)' : 'var(--border-medium)'}`,
            backgroundColor: lowStockOnly ? 'var(--accent-50)' : 'var(--bg-card)',
            color: lowStockOnly ? 'var(--accent-700)' : 'var(--text-main)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <AlertTriangle size={16} /> Low Stock Only ({inventory.filter((i) => i.stockQuantity <= 5).length})
        </button>
      </div>

      {/* Inventory Table / Cards */}
      {loading ? (
        <Skeleton height="200px" />
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Boxes size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Inventory Items Found</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click "Add Medicine to Stock" to begin cataloguing your store inventory.
          </p>
        </Card>
      ) : (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Medicine & Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Stock Qty</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Selling Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Batch & Expiry</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const med = item.medicineId;
                  const isLow = item.stockQuantity <= (item.lowStockThreshold || 5);
                  return (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: isLow ? '#fffbeb' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--border-light)',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              padding: '4px'
                            }}
                          >
                            <img
                              src={getMedicineImage(med)}
                              alt={med?.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{med?.name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {med?.genericName} • {med?.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {med?.requiresPrescription ? (
                          <Badge variant="prescription" size="sm">Rx</Badge>
                        ) : (
                          <Badge variant="success" size="sm">OTC</Badge>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isLow ? 'var(--accent-600)' : 'var(--text-main)'
                          }}
                        >
                          {item.stockQuantity} units
                        </span>
                        {isLow && (
                          <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--accent-600)', fontWeight: 600 }}>
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700 }}>₹{item.price}</span>
                        {item.price < med?.mrp && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                            ₹{med?.mrp}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div>Batch: {item.batchNumber || 'N/A'}</div>
                        <div>Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          style={{ padding: '6px', color: 'var(--primary-600)', marginRight: '6px' }}
                          aria-label="Edit stock"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          style={{ padding: '6px', color: 'var(--accent-600)' }}
                          aria-label="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Inventory Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Stock: ${editingItem.medicineId?.name}` : 'Add Medicine to Stock'}
      >
        <form onSubmit={handleSave}>
          {!editingItem && (
            <Input
              label="Select Medicine from Catalog"
              as="select"
              value={selectedMedicineId}
              onChange={(e) => {
                setSelectedMedicineId(e.target.value);
                const found = masterMedicines.find((m) => m._id === e.target.value);
                if (found) setPrice(found.mrp);
              }}
            >
              {masterMedicines.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.genericName}) — MRP ₹{m.mrp}
                </option>
              ))}
            </Input>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
            <Input
              label="Selling Price (₹)"
              type="number"
              min="0"
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Discount %"
              type="number"
              min="0"
              max="90"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
            />
            <Input
              label="Batch Number"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. BAT-APL-2026"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth style={{ marginTop: '1rem' }}>
            {editingItem ? 'Update Stock' : 'Add to Inventory'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PharmacyInventory;
