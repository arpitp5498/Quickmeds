import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';

const PrescriptionUpload = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [patientName, setPatientName] = useState(user?.name || '');
  const [doctorName, setDoctorName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select or drag a prescription file to upload', 'warning');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('prescription', file);
      formData.append('patientName', patientName);
      formData.append('doctorName', doctorName);
      formData.append('customerNotes', customerNotes);

      const res = await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        showToast('Prescription uploaded securely for pharmacist review!', 'success');
        navigate('/prescriptions');
      }
    } catch (err) {
      showToast(err.message || 'Prescription upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '750px' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Upload Doctor Prescription</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Upload a legible photo or PDF of your doctor's prescription. A registered pharmacist will review it before fulfillment.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <FileUpload
            label="Prescription Document (JPG, PNG, PDF)"
            onFileSelect={setFile}
            helper="Max size 5MB • Must include doctor details & date"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input
              label="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
            <Input
              label="Doctor / Clinic Name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. S. K. Gupta"
            />
          </div>

          <Input
            label="Special Instructions for Pharmacist (Optional)"
            as="textarea"
            rows={3}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="e.g. Please provide 10 tablets as prescribed, urgent delivery needed"
          />

          <div
            style={{
              backgroundColor: 'var(--primary-50)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-200)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={20} color="var(--primary-600)" style={{ minWidth: '20px', marginTop: '2px' }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--primary-900)', lineHeight: 1.5 }}>
              <strong>Privacy Assurance:</strong> Your prescription is encrypted and accessible only by you and the licensed pharmacist verifying your medicine order.
            </p>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={uploading} icon={FileText}>
            Submit Prescription for Verification
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PrescriptionUpload;
