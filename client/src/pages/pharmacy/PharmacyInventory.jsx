import React, { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Pill,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  Zap,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Layers,
  HelpCircle,
  Copy,
  Sliders,
  DollarSign,
  History,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { getMedicineImage } from '../../utils/medicineImages';

const PharmacyInventory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    syncStatus: 'IMPORT_MODE'
  });
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Manual Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockQuantity, setStockQuantity] = useState(25);
  const [price, setPrice] = useState(50);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [sku, setSku] = useState('');

  // ─── CSV Wizard State ──────────────────────────────────────────────
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState(null);
  const csvInputRef = useRef(null);

  // ─── Purchase Invoice OCR State ────────────────────────────────────
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrPreview, setOcrPreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrImportResult, setOcrImportResult] = useState(null);
  const [editingOcrLine, setEditingOcrLine] = useState(null);
  const ocrInputRef = useRef(null);

  // ─── Billing Integration & Demo Simulator State ────────────────────
  const [billingConfig, setBillingConfig] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [selectedSimItem, setSelectedSimItem] = useState('');
  const [simQtySold, setSimQtySold] = useState(2);
  const [simulatingSale, setSimulatingSale] = useState(false);
  const [simSuccess, setSimSuccess] = useState(null);

  // ─── Activity Log State ────────────────────────────────────────────
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const { showToast } = useToast();
  const { socket } = useSocket();

  // Fetch Inventory List
  const fetchInventory = async () => {
    try {
      setLoading(true);
      let url = `/inventory?status=${statusFilter}&source=${sourceFilter}`;
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

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/inventory/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Stats fetch error:', err);
    }
  };

  // Fetch Master Medicines Catalog
  const fetchMasterMedicines = async () => {
    try {
      const res = await api.get('/medicines?limit=150');
      if (res.success && res.data) {
        setMasterMedicines(res.data.medicines || []);
      }
    } catch (err) {
      console.warn('Catalog fetch error:', err);
    }
  };

  // Fetch Billing Configuration
  const fetchBillingConfig = async () => {
    try {
      setBillingLoading(true);
      const res = await api.get('/integrations/billing/status');
      if (res.success && res.data) {
        setBillingConfig(res.data);
      }
    } catch (err) {
      console.warn('Billing config fetch error:', err);
    } finally {
      setBillingLoading(false);
    }
  };

  // Fetch Activities
  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await api.get('/inventory/activities?limit=50');
      if (res.success && res.data) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.warn('Activities fetch error:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchStats();
    fetchMasterMedicines();
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingConfig();
    } else if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab]);

  // Real-time listener for live inventory changes (Webhooks / POS / Orders)
  useEffect(() => {
    if (!socket) return;
    const handleInvUpdate = (data) => {
      fetchInventory();
      fetchStats();
      if (activeTab === 'activities') fetchActivities();
      showToast(`⚡ Live Inventory Update: ${data.item?.medicineId?.name || 'Stock'} (${data.source})`, 'info');
    };
    socket.on('inventory_item_updated', handleInvUpdate);
    return () => {
      socket.off('inventory_item_updated', handleInvUpdate);
    };
  }, [socket, activeTab]);

  // Manual Add / Edit Handlers
  const openAddModal = (presetMedicine = null) => {
    setEditingItem(null);
    const target = presetMedicine || masterMedicines[0];
    setSelectedMedicineId(target?._id || '');
    setStockQuantity(25);
    setPrice(target?.mrp || 50);
    setDiscountPercentage(0);
    setBatchNumber(`BAT-${Date.now().toString().slice(-6)}`);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiryDate(d.toISOString().split('T')[0]);
    setSku('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setSelectedMedicineId(item.medicineId?._id || '');
    setStockQuantity(item.stockQuantity);
    setPrice(item.price);
    setDiscountPercentage(item.discountPercentage || 0);
    setBatchNumber(item.batchNumber || '');
    setExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : '');
    setSku(item.sku || '');
    setModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, {
          stockQuantity: parseInt(stockQuantity, 10),
          price: parseFloat(price),
          discountPercentage: parseFloat(discountPercentage),
          batchNumber,
          expiryDate,
          sku
        });
        showToast('Inventory item updated successfully', 'success');
      } else {
        await api.post('/inventory', {
          medicineId: selectedMedicineId,
          stockQuantity: parseInt(stockQuantity, 10),
          price: parseFloat(price),
          discountPercentage: parseFloat(discountPercentage),
          batchNumber,
          expiryDate,
          sku,
          source: 'MASTER_CATALOG'
        });
        showToast('Medicine added to store stock', 'success');
      }
      setModalOpen(false);
      fetchInventory();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to save inventory item', 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medicine from your inventory?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      showToast('Item removed from inventory', 'info');
      fetchInventory();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  // ─── CSV Import Handlers ──────────────────────────────────────────
  const handleCsvFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setCsvLoading(true);
    setCsvImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/inventory/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data) {
        setCsvPreview(res.data);
        showToast(`Spreadsheet read: ${res.data.totalRows} rows detected.`, 'success');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'File processing failed. Please check the file format and try again.';
      showToast(errMsg, 'error');
      setCsvPreview(null);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleConfirmCsvImport = async () => {
    if (!csvPreview || !csvPreview.rows) return;
    setCsvLoading(true);
    try {
      const res = await api.post('/inventory/confirm-csv-import', {
        items: csvPreview.rows,
        referenceName: csvPreview.fileName
      });
      if (res.success && res.data) {
        setCsvImportResult(res.data);
        showToast(`Import completed: ${res.data.successCount} medicines added!`, 'success');
        fetchInventory();
        fetchStats();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to commit CSV import.';
      showToast(errMsg, 'error');
    } finally {
      setCsvLoading(false);
    }
  };

  // ─── Purchase Invoice OCR Handlers ────────────────────────────────
  const handleOcrFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrFile(file);
    setOcrLoading(true);
    setOcrImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/inventory/ocr-invoice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data) {
        setOcrPreview(res.data);
        showToast(`OCR Completed: Extracted ${res.data.totalItemsCount} line items (${res.data.overallConfidence}% confidence).`, 'success');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to extract invoice details. Please try another image or PDF.';
      showToast(errMsg, 'error');
      setOcrPreview(null);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleConfirmOcrImport = async () => {
    if (!ocrPreview || !ocrPreview.extractedItems) return;
    setOcrLoading(true);
    try {
      const res = await api.post('/inventory/confirm-ocr-import', {
        items: ocrPreview.extractedItems,
        invoiceNumber: ocrPreview.invoiceNumber,
        distributorName: ocrPreview.distributorName
      });
      if (res.success && res.data) {
        setOcrImportResult(res.data);
        showToast(`Invoice Stock Ingested: ${res.data.successCount} line items added to inventory!`, 'success');
        fetchInventory();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to commit invoice items', 'error');
    } finally {
      setOcrLoading(false);
    }
  };

  // ─── Demo POS Sale Simulator Handler ──────────────────────────────
  const handleSimulateSale = async (e) => {
    e.preventDefault();
    if (!selectedSimItem) {
      showToast('Please select a medicine to sell', 'warning');
      return;
    }
    setSimulatingSale(true);
    setSimSuccess(null);
    try {
      const res = await api.post('/integrations/billing/simulate-sale', {
        inventoryId: selectedSimItem,
        quantitySold: parseInt(simQtySold, 10) || 1
      });
      if (res.success && res.data) {
        setSimSuccess(res.data);
        showToast(`✓ POS Sale: ${res.data.medicineName} (${res.data.previousStock} ➔ ${res.data.newStock})`, 'success');
        fetchInventory();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Simulation failed', 'error');
    } finally {
      setSimulatingSale(false);
    }
  };

  // Source Badge Helper
  const getSourceBadge = (source) => {
    switch (source) {
      case 'BILLING_SYNC':
        return <Badge variant="success" size="sm">🟢 Billing Sync</Badge>;
      case 'INVOICE_OCR':
        return <Badge variant="primary" size="sm">🧾 Invoice OCR</Badge>;
      case 'CSV_IMPORT':
        return <Badge variant="secondary" size="sm">📊 CSV Import</Badge>;
      case 'MASTER_CATALOG':
        return <Badge variant="warning" size="sm">📖 Master Catalog</Badge>;
      default:
        return <Badge variant="outline" size="sm">✏️ Manual</Badge>;
    }
  };

  const filtered = inventory.filter((item) => {
    if (!item.medicineId) return false;
    const s = searchTerm.toLowerCase();
    return (
      item.medicineId.name.toLowerCase().includes(s) ||
      item.medicineId.genericName.toLowerCase().includes(s) ||
      (item.batchNumber && item.batchNumber.toLowerCase().includes(s)) ||
      (item.sku && item.sku.toLowerCase().includes(s))
    );
  });

  const tabItems = [
    { id: 'overview', label: '📦 Stock Overview', count: inventory.length },
    { id: 'onboarding', label: '🚀 Onboarding Hub' },
    { id: 'csv_import', label: '📊 CSV / Excel Import' },
    { id: 'catalog', label: '📖 Master Catalog', count: masterMedicines.length },
    { id: 'ocr', label: '🧾 Invoice OCR' },
    { id: 'billing', label: '🔌 Billing & POS Simulator' },
    { id: 'activities', label: '📜 Sync Activity Log' }
  ];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pharmacy Inventory & Setup</h1>
            {stats.syncStatus === 'LIVE_SYNC' ? (
              <Badge variant="success">🟢 LIVE SYNC: {stats.integrationProvider || 'Connected'}</Badge>
            ) : (
              <Badge variant="warning">🟡 IMPORT MODE</Badge>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage store stock with zero-friction onboarding, automated billing synchronization, and invoice OCR extraction.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={UploadCloud} onClick={() => setActiveTab('csv_import')}>
            Bulk Import
          </Button>
          <Button variant="outline" icon={FileText} onClick={() => setActiveTab('ocr')}>
            Invoice OCR
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => openAddModal()}>
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: STOCK OVERVIEW
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '1.5rem'
            }}
          >
            <Card style={{ padding: '1rem', borderLeft: '4px solid var(--primary-500)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL MEDICINES</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>{stats.totalMedicines}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>Active in store</span>
            </Card>

            <Card style={{ padding: '1rem', borderLeft: '4px solid var(--secondary-500)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>IN STOCK</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0', color: 'var(--secondary-600)' }}>{stats.inStock}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Healthy stock</span>
            </Card>

            <Card style={{ padding: '1rem', borderLeft: '4px solid var(--accent-500)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOW STOCK</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0', color: 'var(--accent-600)' }}>{stats.lowStock}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-600)' }}>≤ 5 units left</span>
            </Card>

            <Card style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OUT OF STOCK</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0', color: '#ef4444' }}>{stats.outOfStock}</h3>
              <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Excluded from routing</span>
            </Card>

            <Card style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPIRING SOON</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0', color: '#f59e0b' }}>{stats.expiringSoon}</h3>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Next 60 days</span>
            </Card>
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
                placeholder="Search inventory by medicine name, generic composition, batch, or SKU..."
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock (≤ 5)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                <option value="EXPIRING_SOON">Expiring Soon (≤ 60d)</option>
                <option value="EXPIRED">Expired Stock</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <option value="ALL">All Ingestion Sources</option>
                <option value="BILLING_SYNC">Billing Sync</option>
                <option value="INVOICE_OCR">Invoice OCR</option>
                <option value="CSV_IMPORT">CSV Import</option>
                <option value="MASTER_CATALOG">Master Catalog</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <Skeleton height="280px" />
          ) : filtered.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Boxes size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Inventory Items Found</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '1.25rem' }}>
                Onboard your store inventory quickly via CSV bulk import, Master Catalog, or invoice OCR.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button variant="outline" onClick={() => setActiveTab('onboarding')}>
                  Open Onboarding Hub
                </Button>
                <Button variant="primary" onClick={() => openAddModal()}>
                  Add Single Medicine
                </Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Medicine & Composition</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Schedule</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Stock Qty</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Selling Price</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Batch & Expiry</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ingestion Source</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const med = item.medicineId;
                      const isLow = item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 5);
                      const isOut = item.stockQuantity === 0;
                      const isExp = item.expiryDate && new Date(item.expiryDate) <= new Date();

                      return (
                        <tr
                          key={item._id}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            backgroundColor: isOut ? '#fef2f2' : isExp ? '#fee2e2' : isLow ? '#fffbeb' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid var(--border-light)',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  padding: '3px'
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
                              <Badge variant="prescription" size="sm">Rx ({med?.prescriptionSchedule || 'Sch H'})</Badge>
                            ) : (
                              <Badge variant="success" size="sm">OTC</Badge>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: isOut ? '#ef4444' : isLow ? 'var(--accent-600)' : 'var(--text-main)'
                              }}
                            >
                              {item.stockQuantity} units
                            </span>
                            {isOut && <span style={{ display: 'block', fontSize: '0.6875rem', color: '#ef4444', fontWeight: 700 }}>Out of Stock</span>}
                            {isLow && <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--accent-600)', fontWeight: 600 }}>Low Stock Alert</span>}
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
                            <div style={{ color: isExp ? '#ef4444' : 'inherit', fontWeight: isExp ? 700 : 'normal' }}>
                              Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : 'N/A'}
                              {isExp && ' (EXPIRED)'}
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            {getSourceBadge(item.source)}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              style={{ padding: '6px', color: 'var(--primary-600)', marginRight: '6px', cursor: 'pointer', background: 'none', border: 'none' }}
                              title="Edit stock"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item._id)}
                              style={{ padding: '6px', color: '#ef4444', cursor: 'pointer', background: 'none', border: 'none' }}
                              title="Delete item"
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: ONBOARDING HUB
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'onboarding' && (
        <div>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
            <Badge variant="primary" size="md" style={{ marginBottom: '8px' }}>
              ⚡ ZERO MANUAL ENTRY ONBOARDING
            </Badge>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Add Your Store Inventory with Minimum Effort
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              QuickMeds provides three intelligent pathways to catalogue your pharmacy medicines without tedious manual typing.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1050px',
              margin: '0 auto'
            }}
          >
            {/* Option 1 */}
            <Card
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid var(--primary-600)'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <FileSpreadsheet size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', letterSpacing: '0.5px' }}>
                  OPTION 01
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>
                  IMPORT CSV / EXCEL
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Upload your existing inventory spreadsheet (.csv, .xlsx, .xls) in bulk with automatic column mapping and fuzzy Master Catalog reconciliation.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Button variant="primary" fullWidth icon={UploadCloud} onClick={() => setActiveTab('csv_import')}>
                  Import CSV / Excel
                </Button>
              </div>
            </Card>

            {/* Option 2 */}
            <Card
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid var(--secondary-600)'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--secondary-50)',
                    color: 'var(--secondary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <Pill size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-600)', letterSpacing: '0.5px' }}>
                  OPTION 02
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>
                  MASTER MEDICINE CATALOG
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Select medicines from the standardized QuickMeds catalog of 46+ verified drugs. Add stock and custom retail pricing with a single click.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Button variant="secondary" fullWidth icon={Search} onClick={() => setActiveTab('catalog')}>
                  Browse Catalog
                </Button>
              </div>
            </Card>

            {/* Option 3 */}
            <Card
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid var(--accent-600)'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--accent-50)',
                    color: 'var(--accent-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <FileText size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-600)', letterSpacing: '0.5px' }}>
                  OPTION 03
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>
                  PURCHASE INVOICE OCR
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Snap or upload a wholesale purchase tax invoice (JPG/PNG/PDF) to automatically extract batches, quantities, rates, and expiry dates via AI.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Button variant="accent" fullWidth icon={Sparkles} onClick={() => setActiveTab('ocr')}>
                  Upload Purchase Invoice
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: CSV / EXCEL IMPORT WIZARD
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'csv_import' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>CSV / Excel Bulk Inventory Wizard</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Import thousands of stock records seamlessly. Supports .csv, .xlsx, and .xls formats.
            </p>
          </div>

          {/* Upload Dropzone Card */}
          <Card style={{ marginBottom: '1.5rem', padding: '2rem', textAlign: 'center' }}>
            <input
              type="file"
              ref={csvInputRef}
              onChange={handleCsvFileUpload}
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
            />
            <div
              onClick={() => csvInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: '16px',
                padding: '2.5rem 1rem',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-subtle)',
                transition: 'all 0.2s ease'
              }}
            >
              <UploadCloud size={44} color="var(--primary-600)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px' }}>
                {csvFile ? csvFile.name : 'Click to Upload Spreadsheet or Drag & Drop'}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Supports standard formats: CSV, XLSX, XLS (Up to 15 MB)
              </p>
              {csvLoading && <div style={{ marginTop: '10px', fontWeight: 600, color: 'var(--primary-600)' }}>Reading & Matching Catalog...</div>}
            </div>
          </Card>

          {/* Preview & Column Mapping Section */}
          {csvPreview && (
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Spreadsheet Preview & Catalog Reconciliation</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Total {csvPreview.totalRows} records analyzed from <strong>{csvPreview.fileName}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge variant="success">✓ {csvPreview.matchedCount} Matched</Badge>
                  <Badge variant="warning">⚠ {csvPreview.needsReviewCount} Needs Review</Badge>
                  <Badge variant="danger">✕ {csvPreview.unmatchedCount} Unmatched</Badge>
                </div>
              </div>

              {/* Table preview */}
              <div style={{ overflowX: 'auto', maxHeight: '400px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-subtle)', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '8px 12px' }}>#</th>
                      <th style={{ padding: '8px 12px' }}>Imported Medicine</th>
                      <th style={{ padding: '8px 12px' }}>Catalog Match</th>
                      <th style={{ padding: '8px 12px' }}>Batch</th>
                      <th style={{ padding: '8px 12px' }}>Qty</th>
                      <th style={{ padding: '8px 12px' }}>Price</th>
                      <th style={{ padding: '8px 12px' }}>Expiry</th>
                      <th style={{ padding: '8px 12px' }}>Match Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((row) => (
                      <tr key={row.rowId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{row.rowId}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.rawName}</td>
                        <td style={{ padding: '8px 12px', color: row.matchedMedicineName ? 'var(--primary-700)' : 'var(--text-muted)' }}>
                          {row.matchedMedicineName || '—'}
                        </td>
                        <td style={{ padding: '8px 12px' }}>{row.batchNumber}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{row.quantity}</td>
                        <td style={{ padding: '8px 12px' }}>₹{row.price}</td>
                        <td style={{ padding: '8px 12px' }}>{row.expiryDate}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {row.matchStatus === 'MATCHED' ? (
                            <Badge variant="success" size="sm">✓ {row.confidence}%</Badge>
                          ) : row.matchStatus === 'NEEDS_REVIEW' ? (
                            <Badge variant="warning" size="sm">⚠ Review ({row.confidence}%)</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">✕ Unmatched</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  loading={csvLoading}
                  onClick={handleConfirmCsvImport}
                  icon={CheckCircle2}
                >
                  Confirm & Ingest {csvPreview.matchedCount + csvPreview.needsReviewCount} Items
                </Button>
              </div>
            </Card>
          )}

          {/* Success card */}
          {csvImportResult && (
            <Card style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary-500)', backgroundColor: 'var(--secondary-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={32} color="var(--secondary-600)" />
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--secondary-800)' }}>
                    Bulk Ingestion Complete!
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--secondary-700)', margin: '4px 0 0' }}>
                    Successfully synced {csvImportResult.successCount} of {csvImportResult.totalProcessed} records into store stock.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
                  View Updated Inventory
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setCsvFile(null); setCsvPreview(null); setCsvImportResult(null); }}>
                  Upload Another File
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: MASTER MEDICINE CATALOG
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Master Medicine Catalog</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Browse QuickMeds standardized repository of 46+ verified drugs and add items to your store with 1 click.
              </p>
            </div>

            <div style={{ width: '320px' }}>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search master catalog by name or composition..."
              />
            </div>
          </div>

          {/* Catalog Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '14px'
            }}
          >
            {masterMedicines
              .filter(m => {
                const s = searchTerm.toLowerCase();
                return m.name.toLowerCase().includes(s) || m.genericName.toLowerCase().includes(s) || m.category.toLowerCase().includes(s);
              })
              .map(med => (
                <Card key={med._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '10px',
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
                        alt={med.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 2px' }}>{med.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {med.genericName} • {med.strength}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Badge variant={med.requiresPrescription ? 'prescription' : 'success'} size="sm">
                          {med.requiresPrescription ? 'Rx' : 'OTC'}
                        </Badge>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          MRP ₹{med.mrp}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <Button variant="primary" size="sm" fullWidth icon={Plus} onClick={() => openAddModal(med)}>
                      Add to My Stock
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 5: PURCHASE INVOICE OCR
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'ocr' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Purchase Invoice OCR Extraction</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Upload wholesale purchase tax invoices to automatically extract line items with AI confidence scoring.
            </p>
          </div>

          {/* OCR Upload Card */}
          <Card style={{ marginBottom: '1.5rem', padding: '2rem', textAlign: 'center' }}>
            <input
              type="file"
              ref={ocrInputRef}
              onChange={handleOcrFileUpload}
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: 'none' }}
            />
            <div
              onClick={() => ocrInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: '16px',
                padding: '2.5rem 1rem',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <FileText size={44} color="var(--accent-600)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px' }}>
                {ocrFile ? ocrFile.name : 'Upload Wholesale Tax Invoice (JPG, PNG, PDF)'}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Extracts distributor name, invoice number, batches, quantities, purchase rates, and expiry dates automatically.
              </p>
              {ocrLoading && <div style={{ marginTop: '10px', fontWeight: 600, color: 'var(--accent-600)' }}>Running OCR & Confidence Analysis...</div>}
            </div>
          </Card>

          {/* OCR Extracted Results Table */}
          {ocrPreview && (
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{ocrPreview.distributorName}</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Invoice #{ocrPreview.invoiceNumber} • Date: {ocrPreview.invoiceDate}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant="primary">AI Confidence: {ocrPreview.overallConfidence}%</Badge>
                  <Badge variant="success">✓ {ocrPreview.matchedCount} Matched</Badge>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '400px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-subtle)', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '8px 12px' }}>Line</th>
                      <th style={{ padding: '8px 12px' }}>Extracted Item</th>
                      <th style={{ padding: '8px 12px' }}>Master Match</th>
                      <th style={{ padding: '8px 12px' }}>Batch</th>
                      <th style={{ padding: '8px 12px' }}>Qty</th>
                      <th style={{ padding: '8px 12px' }}>Purchase Rate</th>
                      <th style={{ padding: '8px 12px' }}>MRP</th>
                      <th style={{ padding: '8px 12px' }}>Expiry</th>
                      <th style={{ padding: '8px 12px' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocrPreview.extractedItems.map((item) => (
                      <tr key={item.lineId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{item.lineId}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.extractedName}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--primary-700)' }}>
                          {item.matchedMedicineName}
                        </td>
                        <td style={{ padding: '8px 12px' }}>{item.batchNumber}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ padding: '8px 12px' }}>₹{item.purchasePrice}</td>
                        <td style={{ padding: '8px 12px' }}>₹{item.mrp}</td>
                        <td style={{ padding: '8px 12px' }}>{item.expiryDate}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <Badge variant="success" size="sm">{item.confidence}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  loading={ocrLoading}
                  onClick={handleConfirmOcrImport}
                  icon={CheckCircle2}
                >
                  Confirm & Ingest Invoice Stock ({ocrPreview.extractedItems.length} items)
                </Button>
              </div>
            </Card>
          )}

          {ocrImportResult && (
            <Card style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary-500)', backgroundColor: 'var(--secondary-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={32} color="var(--secondary-600)" />
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--secondary-800)' }}>
                    Invoice Stock Successfully Ingested!
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--secondary-700)', margin: '4px 0 0' }}>
                    {ocrImportResult.successCount} line items added to your live store stock with source INVOICE_OCR.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
                  View Updated Inventory
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 6: BILLING INTEGRATION & DEMO SIMULATOR
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Billing Software Integration & Demo POS Simulator</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Connect your retail pharmacy ERP (Marg ERP, Busy, Vyapar) for real-time inventory synchronization.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Live Connection Card */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>POS / ERP Connection</h3>
                {billingConfig?.integration?.status === 'CONNECTED' ? (
                  <Badge variant="success">🟢 CONNECTED</Badge>
                ) : (
                  <Badge variant="warning">🟡 DISCONNECTED</Badge>
                )}
              </div>

              <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SOFTWARE PROVIDER</span>
                  <strong>{billingConfig?.integration?.provider || 'Marg ERP 9+'}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>STORE / MERCHANT ID</span>
                  <code>{billingConfig?.integration?.merchantId || 'MERCHANT-DEFAULT'}</code>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>API KEY</span>
                  <code>{billingConfig?.integration?.apiKeyMasked || 'qm_live_••••••••••••'}</code>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>WEBHOOK SECRET</span>
                  <code>{billingConfig?.integration?.webhookSecretMasked || 'whsec_••••••••••••'}</code>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>WEBHOOK INGESTION URL</span>
                  <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{billingConfig?.webhookEndpointUrl}</code>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <Button variant="outline" size="sm" fullWidth icon={RefreshCw} onClick={fetchBillingConfig}>
                  Test Connection & Re-sync
                </Button>
              </div>
            </Card>

            {/* Demo Billing Sale Simulator Card */}
            <Card style={{ borderTop: '4px solid var(--accent-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={20} color="var(--accent-600)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                  Demo Billing Sale Simulator
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Simulate a counter/retail POS sale to demonstrate real-time stock deduction via the central InventorySyncService.
              </p>

              <form onSubmit={handleSimulateSale}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Select Medicine in Store
                  </label>
                  <select
                    value={selectedSimItem}
                    onChange={(e) => setSelectedSimItem(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">-- Choose Medicine --</option>
                    {inventory.filter(i => i.stockQuantity > 0).map(item => (
                      <option key={item._id} value={item._id}>
                        {item.medicineId?.name} (Stock: {item.stockQuantity}) — ₹{item.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Quantity Sold at Counter
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={simQtySold}
                    onChange={(e) => setSimQtySold(e.target.value)}
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

                <Button type="submit" variant="accent" fullWidth loading={simulatingSale} icon={Zap}>
                  Simulate Retail POS Sale
                </Button>
              </form>

              {simSuccess && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.8125rem' }}>
                  <strong>✓ Billing Event Received:</strong> {simSuccess.medicineName} stock reduced from <strong>{simSuccess.previousStock}</strong> ➔ <strong>{simSuccess.newStock}</strong> units.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 7: ACTIVITY LOG
          ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'activities' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Inventory Activity & Sync Ledger</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Immutable audit trail of all stock modifications, CSV imports, billing webhooks, and order deductions.
              </p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchActivities}>
              Refresh
            </Button>
          </div>

          {loadingActivities ? (
            <Skeleton height="250px" />
          ) : activities.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <h4>No Activity History Found</h4>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Timestamp</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Medicine Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Stock Movement</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Source</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act) => (
                      <tr key={act._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(act.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>{act.medicineName}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontWeight: 700, color: act.quantityDelta >= 0 ? 'var(--secondary-600)' : '#ef4444' }}>
                            {act.previousStock} ➔ {act.newStock} ({act.quantityDelta >= 0 ? `+${act.quantityDelta}` : act.quantityDelta})
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>{getSourceBadge(act.source)}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{act.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Manual Add / Edit Medicine Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Stock: ${editingItem.medicineId?.name}` : 'Add Medicine to Store Stock'}
      >
        <form onSubmit={handleSaveItem}>
          {!editingItem && (
            <Input
              label="Select Medicine from Master Catalog"
              as="select"
              value={selectedMedicineId}
              onChange={(e) => {
                setSelectedMedicineId(e.target.value);
                const found = masterMedicines.find((m) => m._id === e.target.value);
                if (found) setPrice(found.mrp);
              }}
              required
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
              label="Batch Number"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. BAT-2026-X1"
            />
            <Input
              label="Expiry Date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="SKU Code"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SKU-DOLO-650"
            />
            <Input
              label="Discount % (Optional)"
              type="number"
              min="0"
              max="90"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth style={{ marginTop: '1rem' }}>
            {editingItem ? 'Update Stock' : 'Add to Store Stock'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PharmacyInventory;
