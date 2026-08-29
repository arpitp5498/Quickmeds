import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Eye,
  FileCheck
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import PrescriptionTimeline from '../../components/prescriptions/PrescriptionTimeline';
import PrescriptionInspectionModal from '../../components/prescriptions/PrescriptionInspectionModal';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/prescriptions');
        if (res.success && res.data) {
          setPrescriptions(res.data.prescriptions || []);
        }
      } catch (err) {
        console.warn('Prescription fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '960px' }}>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Prescriptions</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage your uploaded medical prescriptions and track licensed pharmacist verification status.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/prescriptions/upload')}
        >
          Upload New Prescription
        </Button>
      </div>

      {/* Statutory Requirement Simulation Banner */}
      <div
        style={{
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}
      >
        <ShieldCheck size={20} color="var(--accent-600)" style={{ minWidth: '20px', marginTop: '2px' }} />
        <div>
          <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#9f1239' }}>
            Statutory Requirement
          </h5>
          <p style={{ fontSize: '0.8125rem', color: '#be123c', marginTop: '2px', lineHeight: 1.4 }}>
            Under Indian Pharmacy Practice Regulations, all Schedule H/X drugs require licensed pharmacist verification prior to dispensing.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="100px" />
            </Card>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Prescriptions Uploaded"
          description="Upload your doctor prescription to seamlessly order Schedule H & H1 emergency medications from nearby verified pharmacies."
          actionLabel="Upload Prescription"
          onAction={() => navigate('/prescriptions/upload')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {prescriptions.map((rx) => {
            const isApproved = rx.status === 'APPROVED' || rx.status === 'VERIFIED';
            const isRejected = rx.status === 'REJECTED';

            return (
              <Card key={rx._id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isApproved
                          ? 'var(--secondary-50)'
                          : isRejected
                          ? 'var(--accent-50)'
                          : 'var(--primary-50)',
                        color: isApproved
                          ? 'var(--secondary-600)'
                          : isRejected
                          ? 'var(--accent-600)'
                          : 'var(--primary-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '48px'
                      }}
                    >
                      <FileText size={24} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 800 }}>
                          {rx.originalName}
                        </h4>
                        <Badge
                          variant={
                            isApproved
                              ? 'success'
                              : isRejected
                              ? 'danger'
                              : 'pending'
                          }
                          size="sm"
                        >
                          {rx.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Patient: <strong>{rx.patientName || 'Self'}</strong>
                        {rx.doctorName && ` • Doctor: ${rx.doctorName}`}
                        {rx.pharmacyId && ` • Verified by: ${rx.pharmacyId.name}`}
                      </div>

                      {rx.rejectionReason && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent-600)', marginTop: '4px', fontWeight: 600 }}>
                          Rejection Reason: {rx.rejectionReason}
                        </p>
                      )}

                      {rx.reviewNotes && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Pharmacist Note: {rx.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedDoc(rx)}
                    >
                      Inspect Document
                    </Button>
                  </div>
                </div>

                {/* 4-Stage Visual Verification Timeline */}
                <div style={{ marginTop: '10px' }}>
                  <PrescriptionTimeline
                    status={rx.status}
                    createdAt={rx.createdAt}
                    reviewedAt={rx.reviewedAt}
                    rejectionReason={rx.rejectionReason}
                    pharmacistLicense="DL-PH-2026-98124"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Document Inspection Preview Modal */}
      {selectedDoc && (
        <PrescriptionInspectionModal
          isOpen={true}
          onClose={() => setSelectedDoc(null)}
          prescription={selectedDoc}
          isPharmacist={false}
        />
      )}
    </div>
  );
};

export default MyPrescriptions;
