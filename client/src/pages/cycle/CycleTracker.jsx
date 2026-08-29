import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Heart, AlertCircle, Sparkles, ChevronLeft, ChevronRight,
  Plus, CheckCircle2, ShoppingBag, ShieldAlert, Zap, Bell, Clock, Trash2, Edit3, X
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getMedicineImage } from '../../utils/medicineImages';

const SYMPTOM_OPTIONS = [
  'Severe Cramps', 'Mild Cramps', 'Back Pain', 'Headache',
  'Bloating', 'Fatigue', 'Mood Swings', 'Acne', 'Nausea'
];

const CycleTracker = () => {
  const { showToast } = useToast();
  const { addToCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosProducts, setSosProducts] = useState([]);
  const [sosLoading, setSosLoading] = useState(false);
  const [selectedSOSItems, setSelectedSOSItems] = useState({});

  // Current calendar month view
  const [viewDate, setViewDate] = useState(new Date());

  // Log Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flowIntensity, setFlowIntensity] = useState('Medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    fetchCycleData();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchCycleData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cycle');
      if (res.success && res.data) {
        setCycleData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load cycle data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSOS = async () => {
    setShowSOSModal(true);
    try {
      setSosLoading(true);
      const res = await api.get('/cycle/sos-products');
      if (res.success && res.data) {
        const prods = res.data.products || [];
        setSosProducts(prods);
        // Pre-select the first 2 items by default (e.g. Pads + Cramp medicine)
        const initialSelected = {};
        prods.slice(0, 3).forEach(p => {
          initialSelected[p._id] = { selected: true, quantity: 1, product: p };
        });
        setSelectedSOSItems(initialSelected);
      }
    } catch (err) {
      showToast('Could not load SOS supplies', 'error');
    } finally {
      setSosLoading(false);
    }
  };

  const toggleSOSItem = (product) => {
    setSelectedSOSItems(prev => {
      const current = prev[product._id];
      if (current && current.selected) {
        const updated = { ...prev };
        delete updated[product._id];
        return updated;
      } else {
        return {
          ...prev,
          [product._id]: { selected: true, quantity: 1, product }
        };
      }
    });
  };

  const handleQuickSOSCheckout = async () => {
    const itemsToOrder = Object.values(selectedSOSItems).filter(item => item.selected);
    if (itemsToOrder.length === 0) {
      showToast('Please select at least one item', 'warning');
      return;
    }

    try {
      setSosLoading(true);
      for (const item of itemsToOrder) {
        await api.post('/cart/items', {
          medicineId: item.product._id,
          quantity: item.quantity
        });
      }
      refreshCart();
      showToast('SOS emergency supplies added! Redirecting to instant checkout...', 'success');
      setShowSOSModal(false);
      navigate('/checkout');
    } catch (err) {
      showToast(err.message || 'Failed to prepare SOS order', 'error');
    } finally {
      setSosLoading(false);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Please specify both period start and end dates', 'warning');
      return;
    }

    try {
      setSavingLog(true);
      const res = await api.post('/cycle/log', {
        startDate,
        endDate,
        flowIntensity,
        symptoms: selectedSymptoms,
        notes
      });

      if (res.success) {
        showToast('Cycle updated! Future predictions recalculated.', 'success');
        setShowLogModal(false);
        setStartDate('');
        setEndDate('');
        setSelectedSymptoms([]);
        setNotes('');
        fetchCycleData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save cycle entry', 'error');
    } finally {
      setSavingLog(false);
    }
  };

  const handleDeleteCycle = async (cycleId) => {
    if (!window.confirm('Delete this cycle log?')) return;
    try {
      await api.delete(`/cycle/${cycleId}`);
      showToast('Cycle entry deleted and predictions updated.', 'success');
      fetchCycleData();
    } catch (err) {
      showToast(err.message || 'Failed to delete cycle', 'error');
    }
  };

  const toggleSymptom = (sym) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDayStatus = (dayNum) => {
    if (!cycleData?.calendarEvents) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const match = cycleData.calendarEvents.find(e => e.date === dateStr);
    return match ? match.type : null;
  };

  const isToday = (dayNum) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum;
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Top Banner / SOS Highlight */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
          borderRadius: '20px',
          padding: '2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={24} color="#ffe4e6" />
            <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#ffe4e6' }}>
              Women Care & Health Hub
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Menstrual Cycle Tracker
          </h1>
          <p style={{ marginTop: '8px', color: '#ffe4e6', maxWidth: '540px', fontSize: '0.95rem' }}>
            Smart calendar projections, cycle health logging, and instant SOS delivery for emergency pads, tampons & pain relief.
          </p>
        </div>

        {/* SOS Button */}
        <button
          onClick={handleOpenSOS}
          style={{
            background: '#ffffff',
            color: '#e11d48',
            border: 'none',
            borderRadius: '16px',
            padding: '1rem 1.75rem',
            fontSize: '1.1rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <ShieldAlert size={26} color="#e11d48" />
          <span>🚨 SOS Period Needs</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <Card style={{ textAlign: 'center', borderTop: '4px solid #f43f5e' }}>
          <Clock size={24} color="#f43f5e" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Next Predicted Period</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#e11d48' }}>
            {cycleData?.daysUntilNext !== null && cycleData?.daysUntilNext !== undefined
              ? cycleData.daysUntilNext <= 0 ? 'Today / Active' : `in ${cycleData.daysUntilNext} days`
              : 'Log period to view'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {cycleData?.nextPeriod ? new Date(cycleData.nextPeriod.predictedStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No prediction yet'}
          </div>
        </Card>

        <Card style={{ textAlign: 'center', borderTop: '4px solid #ec4899' }}>
          <Heart size={24} color="#ec4899" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Cycle Length</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {cycleData?.averageCycleLength || 28} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Standard range: 21 - 35 days
          </div>
        </Card>

        <Card style={{ textAlign: 'center', borderTop: '4px solid #8b5cf6' }}>
          <CalendarIcon size={24} color="#8b5cf6" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Period Flow</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {cycleData?.averagePeriodLength || 5} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Based on your past logs
          </div>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Button onClick={() => setShowLogModal(true)} style={{ width: '100%', background: '#e11d48', borderColor: '#e11d48' }}>
            <Plus size={18} /> Log Period Dates
          </Button>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            Update dates to refine prediction accuracy
          </div>
        </Card>
      </div>

      {/* Main Grid: Calendar View + Future Predictions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem',
          alignItems: 'flex-start'
        }}
      >
        {/* Calendar Card */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={22} color="#e11d48" /> {monthNames[month]} {year}
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={prevMonth}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e11d48' }}></span>
              <strong>Period Day (Logged)</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fda4af' }}></span>
              <strong>Predicted Period</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#86efac' }}></span>
              <strong>Fertile Window</strong>
            </span>
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
              <div key={idx} style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', padding: '6px 0' }}>
                {day}
              </div>
            ))}

            {/* Empty slots for month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const status = getDayStatus(dayNum);
              const today = isToday(dayNum);

              let bgColor = 'var(--bg-secondary)';
              let textColor = 'var(--text-primary)';
              let border = today ? '2px solid var(--color-primary)' : '1px solid transparent';

              if (status === 'period') {
                bgColor = '#e11d48';
                textColor = '#ffffff';
              } else if (status === 'predicted') {
                bgColor = '#fda4af';
                textColor = '#9f1239';
              } else if (status === 'fertile') {
                bgColor = '#dcfce7';
                textColor = '#166534';
              }

              return (
                <div
                  key={dayNum}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '12px',
                    background: bgColor,
                    color: textColor,
                    border,
                    fontWeight: status || today ? 800 : 500,
                    fontSize: '0.85rem',
                    position: 'relative'
                  }}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Next 6 Months Predictions & Past Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Future Predictions Card */}
          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#e11d48" /> Upcoming Projected Cycles
            </h3>

            {cycleData?.predictions && cycleData.predictions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cycleData.predictions.slice(0, 5).map((pred, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {new Date(pred.predictedStart).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })} – {new Date(pred.predictedEnd).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Fertility window: {new Date(pred.fertility.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(pred.fertility.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <Badge variant="warning">Cycle #{i + 1}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.85rem' }}>Log your period dates to view customized multi-month predictions.</p>
              </div>
            )}
          </Card>

          {/* Past Log History */}
          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
              Cycle History
            </h3>
            {cycleData?.cycles && cycleData.cycles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {cycleData.cycles.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {new Date(c.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(c.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.periodLength} days • Flow: {c.flowIntensity}
                        {c.symptoms && c.symptoms.length > 0 && ` • Symptoms: ${c.symptoms.join(', ')}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCycle(c._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      title="Delete log"
                    >
                      <Trash2 size={16} color="var(--color-danger, red)" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No past period history logged yet.</p>
            )}
          </Card>
        </div>
      </div>

      {/* 🚨 SOS PERIOD NEEDS MODAL */}
      {showSOSModal && (
        <Modal
          isOpen={showSOSModal}
          onClose={() => setShowSOSModal(false)}
          title="🚨 Instant Period Emergency SOS"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Select your emergency period items. We will automatically route this order to the <strong>nearest verified pharmacy</strong> for priority delivery.
            </p>

            {sosLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Loading emergency supplies...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {sosProducts.map((prod) => {
                  const isSelected = !!selectedSOSItems[prod._id];
                  return (
                    <div
                      key={prod._id}
                      onClick={() => toggleSOSItem(prod)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #e11d48' : '1px solid var(--border-color)',
                        background: isSelected ? '#fff1f2' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by row click
                          style={{ width: '18px', height: '18px', accentColor: '#e11d48' }}
                        />
                        <img
                          src={getMedicineImage(prod)}
                          alt={prod.name}
                          style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', background: '#ffffff', padding: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{prod.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.strength || prod.brand}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#e11d48' }}>₹{prod.mrp}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowSOSModal(false)}>Cancel</Button>
              <button
                onClick={handleQuickSOSCheckout}
                disabled={sosLoading}
                style={{
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={18} /> Instant Order & Deliver
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 📅 LOG PERIOD MODAL */}
      {showLogModal && (
        <Modal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          title="Log Your Period Dates"
        >
          <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Period Started *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="Period Ended *"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                Flow Intensity
              </label>
              <select
                value={flowIntensity}
                onChange={(e) => setFlowIntensity(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                  color: 'var(--text-primary)', fontSize: '0.9rem'
                }}
              >
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Heavy">Heavy</option>
                <option value="Spotting">Spotting</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                Symptoms (Optional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SYMPTOM_OPTIONS.map((sym) => {
                  const selected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: selected ? '1px solid #e11d48' : '1px solid var(--border-color)',
                        background: selected ? '#ffe4e6' : 'var(--bg-secondary)',
                        color: selected ? '#be123c' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Notes (Optional)"
              placeholder="e.g. Took Meftal Spas on day 1 for cramps"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="ghost" type="button" onClick={() => setShowLogModal(false)}>Cancel</Button>
              <Button type="submit" disabled={savingLog} style={{ background: '#e11d48', borderColor: '#e11d48' }}>
                {savingLog ? 'Saving...' : 'Save & Calculate Predictions'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CycleTracker;
