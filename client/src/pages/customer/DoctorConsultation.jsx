import React, { useState, useEffect } from 'react';
import { Star, Clock, Video, Calendar, Filter, UserRound, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DoctorConsultation = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [symptoms, setSymptoms] = useState('');

  const specialties = ['All', 'General Physician', 'Pediatrician', 'Dermatologist', 'Cardiologist', 'Gynecologist'];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Fallback to mock data if API fails
        const mockDoctors = [
          { _id: '1', name: 'Dr. Sarah Smith', specialty: 'General Physician', qualification: 'MBBS, MD', experience: '12 years', fee: 500, rating: 4.8, languages: ['English', 'Hindi'] },
          { _id: '2', name: 'Dr. Raj Kumar', specialty: 'Pediatrician', qualification: 'MBBS, DCH', experience: '8 years', fee: 600, rating: 4.9, languages: ['English', 'Tamil'] },
          { _id: '3', name: 'Dr. Emily Chen', specialty: 'Dermatologist', qualification: 'MBBS, MD (DVL)', experience: '5 years', fee: 700, rating: 4.7, languages: ['English'] }
        ];
        const res = await api.get('/consultations/doctors').catch(() => ({ success: true, data: mockDoctors }));
        setDoctors(res.data || mockDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBook = (doc) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const confirmBooking = async () => {
    try {
      await api.post('/consultations/request', { doctorId: selectedDoc._id, symptoms });
      alert('Consultation booked successfully!');
      setShowModal(false);
      setSymptoms('');
    } catch (error) {
      alert('Mock Booking Confirmed (API pending)');
      setShowModal(false);
    }
  };

  const filteredDoctors = specialtyFilter === 'All' ? doctors : doctors.filter(d => d.specialty === specialtyFilter);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Online Doctor Consultation
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Consult verified doctors online and get prescriptions instantly.</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Filter size={20} color="var(--text-muted)" />
        <select 
          value={specialtyFilter} 
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', outline: 'none' }}
        >
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredDoctors.map(doc => (
            <Card key={doc._id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)' }}>
                  <UserRound size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px 0' }}>{doc.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)', fontWeight: 600, margin: '0 0 4px 0' }}>{doc.specialty}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{doc.qualification} • {doc.experience}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <span>{doc.rating}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Stethoscope size={16} />
                  <span>₹{doc.fee}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} />
                  <span>Available Now</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" fullWidth icon={Calendar} onClick={() => handleBook(doc)}>Schedule</Button>
                <Button variant="primary" fullWidth icon={Video} onClick={() => handleBook(doc)}>Consult Now</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && selectedDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Book Consultation</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Booking with {selectedDoc.name}</p>
            
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Please describe your symptoms</label>
            <textarea 
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', minHeight: '100px', marginBottom: '1.5rem', fontFamily: 'inherit' }}
              placeholder="E.g., Fever and headache since yesterday..."
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={confirmBooking}>Confirm Booking - ₹{selectedDoc.fee}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorConsultation;
