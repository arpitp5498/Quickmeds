import React, { useState, useEffect } from 'react';
import {
  Clock, Plus, Pill, Bell, BellOff, Trash2, Edit3, ToggleLeft, ToggleRight,
  Sun, Sunrise, Sunset, Moon, Calendar, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const timeLabels = [
  { value: 'Morning', icon: Sunrise, defaultTime: '08:00' },
  { value: 'Afternoon', icon: Sun, defaultTime: '13:00' },
  { value: 'Evening', icon: Sunset, defaultTime: '18:00' },
  { value: 'Night', icon: Moon, defaultTime: '21:00' }
];

const MedicineReminders = () => {
  const { showToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    medicineName: '',
    dosage: '1 tablet',
    frequency: 1,
    timings: [{ time: '08:00', label: 'Morning' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchReminders();
    requestNotificationPermission();
  }, []);

  // Setup Socket.IO listener for real-time reminder alerts
  useEffect(() => {
    // Browser notification check every minute
    const interval = setInterval(() => {
      checkDueReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const checkDueReminders = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();

    for (const reminder of reminders) {
      if (!reminder.isActive) continue;
      if (!reminder.daysOfWeek.includes(currentDay)) continue;

      for (const timing of reminder.timings) {
        if (timing.time === currentTime && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`💊 Time to take ${reminder.medicineName}`, {
            body: `Dosage: ${reminder.dosage} — ${timing.label || 'Scheduled'}`,
            icon: '/pill-icon.png',
            tag: `reminder-${reminder._id}-${timing.time}`
          });
        }
      }
    }
  };

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reminders');
      if (res.success && res.data) {
        setReminders(res.data.reminders || []);
        setTodaySchedule(res.data.todaySchedule || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFrequencyChange = (newFreq) => {
    const freq = parseInt(newFreq) || 1;
    const timings = [];
    for (let i = 0; i < freq; i++) {
      const tl = timeLabels[i] || timeLabels[0];
      timings.push({
        time: form.timings[i]?.time || tl.defaultTime,
        label: tl.value
      });
    }
    setForm({ ...form, frequency: freq, timings });
  };

  const updateTiming = (index, field, value) => {
    const newTimings = [...form.timings];
    newTimings[index] = { ...newTimings[index], [field]: value };
    setForm({ ...form, timings: newTimings });
  };

  const resetForm = () => {
    setForm({
      medicineName: '',
      dosage: '1 tablet',
      frequency: 1,
      timings: [{ time: '08:00', label: 'Morning' }],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        endDate: form.endDate || undefined
      };

      if (editingId) {
        await api.put(`/reminders/${editingId}`, payload);
        showToast('Reminder updated!', 'success');
      } else {
        await api.post('/reminders', payload);
        showToast('Reminder created! You\'ll be notified at the scheduled times.', 'success');
      }

      resetForm();
      fetchReminders();
    } catch (err) {
      showToast(err.message || 'Failed to save reminder', 'error');
    }
  };

  const handleEdit = (reminder) => {
    setForm({
      medicineName: reminder.medicineName,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      timings: reminder.timings,
      startDate: reminder.startDate?.split('T')[0] || '',
      endDate: reminder.endDate?.split('T')[0] || '',
      notes: reminder.notes || ''
    });
    setEditingId(reminder._id);
    setShowForm(true);
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/reminders/${id}/toggle`);
      fetchReminders();
    } catch (err) {
      showToast(err.message || 'Failed to toggle reminder', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      showToast('Reminder deleted', 'success');
      fetchReminders();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const notifStatus = typeof Notification !== 'undefined'
    ? Notification.permission
    : 'unsupported';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={28} /> Medicine Reminders
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Never miss a dose. Set reminders and get notified on time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant={notifStatus === 'granted' ? 'success' : notifStatus === 'denied' ? 'danger' : 'warning'}>
            {notifStatus === 'granted' ? '🔔 Notifications On' : notifStatus === 'denied' ? '🔕 Blocked' : '⚠️ Not Enabled'}
          </Badge>
          <Button onClick={() => { setEditingId(null); setShowForm(!showForm); }}>
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Reminder</>}
          </Button>
        </div>
      </div>

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <Card style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} /> Today's Schedule
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {todaySchedule.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: item.taken ? 'var(--color-success-light, #dcfce7)' : 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {item.taken ? <CheckCircle2 size={18} color="green" /> : <Clock size={18} color="var(--color-primary)" />}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.time} — {item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.medicineName} • {item.dosage}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add/Edit Reminder Form */}
      {showForm && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>
            {editingId ? '✏️ Edit Reminder' : '➕ Add New Reminder'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Input
                label="Medicine Name *"
                placeholder="e.g. Dolo 650mg"
                value={form.medicineName}
                onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                required
              />
              <Input
                label="Dosage *"
                placeholder="e.g. 1 tablet, 5ml"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                required
              />
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                  Times per Day *
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                    color: 'var(--text-primary)', fontSize: '0.9rem'
                  }}
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n} time{n > 1 ? 's' : ''} / day</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time slots */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                ⏰ Reminder Times
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {form.timings.map((timing, i) => {
                  const LabelIcon = timeLabels[i]?.icon || Clock;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', borderRadius: '10px',
                      border: '1px solid var(--border-color)', background: 'var(--bg-secondary)'
                    }}>
                      <LabelIcon size={18} />
                      <input
                        type="time"
                        value={timing.time}
                        onChange={(e) => updateTiming(i, 'time', e.target.value)}
                        style={{
                          padding: '6px', border: '1px solid var(--border-color)',
                          borderRadius: '6px', background: 'var(--bg-primary)',
                          color: 'var(--text-primary)'
                        }}
                        required
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timing.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <Input
                label="End Date (optional)"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>

            <Input
              label="Notes (optional)"
              placeholder="e.g. Take after food, with warm water"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit">{editingId ? 'Update Reminder' : 'Create Reminder'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reminders List */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <Pill size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700 }}>No Reminders Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Add your first medicine reminder to never miss a dose.
          </p>
          <Button onClick={() => setShowForm(true)} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Add Your First Reminder
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reminders.map((r) => (
            <Card key={r._id} style={{ opacity: r.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Pill size={20} color="var(--color-primary)" />
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{r.medicineName}</h3>
                    <Badge variant={r.isActive ? 'success' : 'warning'}>
                      {r.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {r.dosage} • {r.frequency}x daily
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {r.timings.map((t, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem',
                          background: 'var(--color-primary-light, #dbeafe)', fontWeight: 600
                        }}
                      >
                        🕐 {t.time} — {t.label}
                      </span>
                    ))}
                  </div>
                  {r.notes && (
                    <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      📝 {r.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleToggle(r._id)}
                    title={r.isActive ? 'Pause' : 'Activate'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                  >
                    {r.isActive ? <ToggleRight size={24} color="green" /> : <ToggleLeft size={24} color="gray" />}
                  </button>
                  <button
                    onClick={() => handleEdit(r)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                  >
                    <Edit3 size={18} color="var(--color-primary)" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                  >
                    <Trash2 size={18} color="var(--color-danger, red)" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineReminders;
