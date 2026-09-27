import React, { useState, useEffect } from 'react';
import { Activity, Clock, Droplets, CalendarDays, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [address, setAddress] = useState('');

  const categories = ['All', 'Blood Tests', 'Diabetes', 'Thyroid', 'Full Body Checkup'];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        // Fallback to mock data if API fails
        const mockTests = [
          { _id: '1', name: 'Complete Blood Count (CBC)', category: 'Blood Tests', description: 'Measures different features of your blood, including RBCs, WBCs, and platelets.', price: 399, sampleType: 'Blood', reportTime: '24 hours', preparation: 'No fasting required' },
          { _id: '2', name: 'HbA1c Test', category: 'Diabetes', description: 'Measures your average blood sugar levels over the past 3 months.', price: 499, sampleType: 'Blood', reportTime: '24 hours', preparation: 'Fasting not strictly required but recommended' },
          { _id: '3', name: 'Thyroid Profile Total', category: 'Thyroid', description: 'Measures T3, T4, and TSH levels.', price: 599, sampleType: 'Blood', reportTime: '24 hours', preparation: 'Overnight fasting preferred' }
        ];
        const res = await api.get('/lab-tests').catch(() => ({ success: true, data: mockTests }));
        setTests(res.data || mockTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleBook = (test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  const confirmBooking = async () => {
    try {
      await api.post('/lab-tests/bookings', { testId: selectedTest._id, date, slot, address });
      alert('Lab test booked successfully!');
      setShowModal(false);
    } catch (error) {
      alert('Mock Booking Confirmed (API pending)');
      setShowModal(false);
    }
  };

  const filteredTests = activeCategory === 'All' ? tests : tests.filter(t => t.category === activeCategory);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Lab Tests at Home
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Safe, accurate, and hygienic sample collection from your home.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeCategory === cat ? 'var(--primary-600)' : 'var(--border-medium)'}`,
              backgroundColor: activeCategory === cat ? 'var(--primary-600)' : 'var(--bg-card)',
              color: activeCategory === cat ? '#ffffff' : 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading lab tests...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredTests.map(test => (
            <Card key={test._id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>{test.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>{test.description}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    <Droplets size={16} color="var(--primary-500)" />
                    <span>{test.sampleType} Sample</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    <Clock size={16} color="var(--primary-500)" />
                    <span>Report in {test.reportTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)', gridColumn: '1 / -1' }}>
                    <Activity size={16} color="var(--primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Preparation: {test.preparation}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{test.price}</div>
                <Button variant="primary" onClick={() => handleBook(test)}>Book Now</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && selectedTest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Book {selectedTest.name}</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Select Time Slot</label>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none' }}>
                <option value="">Select a slot...</option>
                <option value="6-8 AM">6:00 AM - 8:00 AM</option>
                <option value="8-10 AM">8:00 AM - 10:00 AM</option>
                <option value="10-12 PM">10:00 AM - 12:00 PM</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Collection Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none', fontFamily: 'inherit' }} placeholder="Enter full address..."></textarea>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={confirmBooking}>Pay ₹{selectedTest.price} & Book</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;
