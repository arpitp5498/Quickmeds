import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileCheck,
  Search,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import PrescriptionTimeline from '../../components/prescriptions/PrescriptionTimeline';
import PrescriptionInspectionModal from '../../components/prescriptions/PrescriptionInspectionModal';

const PharmacyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectingRx, setInspectingRx] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { showToast } = useToast();

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/prescriptions/pharmacy/queue');
      if (res.success && res.data) {
        setPrescriptions(res.data.prescriptions || []);
      }
    } catch (err) {
      console.warn('Error fetching rx queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleReviewSubmit = async ({ status, reviewNotes, rejectionReason }) => {
    if (!inspectingRx) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/prescriptions/${inspectingRx._id}/review`, {
        status,
        reviewNotes,
        rejectionReason: status === 'REJECTED' ? rejectionReason : ''
      });

      if (res.success) {
        showToast(
          status === 'APPROVED'
            ? 'Prescription verified and approved by licensed pharmacist (Lic #DL-PH-2026-98124)'
            : `Prescription rejected: ${rejectionReason}`,
          status === 'APPROVED' ? 'success' : 'warning'
        );
        setInspectingRx(null);
        fetchPrescriptions();
      }
    } catch (err) {
      showToast(err.message || 'Review action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickApprove = async (rx) => {
    try {
      const res = await api.put(`/prescriptions/${rx._id}/review`, {
        status: 'APPROVED',
        reviewNotes: 'Pharmacist verified Schedule H compliance.'
      });
      if (res.success) {
        showToast('Prescription verified and approved (Lic #DL-PH-2026-98124)', 'success');
        fetchPrescriptions();
      }
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return rx.status === 'UPLOADED' || rx.status === 'UNDER_REVIEW';
    return rx.status === filterStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pharmacist Verification Queue</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Statutory verification station for customer Schedule H & H1 prescription orders.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--secondary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--secondary-200)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--secondary-800)'
            }}
          >
            <ShieldCheck size={16} color="var(--secondary-600)" />
            <span>Pharmacist ID: Lic #DL-PH-2026-98124</span>
          </div>
        </div>
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Prescriptions' },
          { id: 'PENDING', label: 'Pending Review' },
          { id: 'APPROVED', label: 'Verified & Approved' },
          { id: 'REJECTED', label: 'Rejected / Defective' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${filterStatus === tab.id ? 'var(--primary-600)' : 'var(--border-medium)'}`,
              backgroundColor: filterStatus === tab.id ? 'var(--primary-600)' : '#ffffff',
              color: filterStatus === tab.id ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="120px" />
            </Card>
          ))}
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Prescriptions in Queue"
          description="All incoming customer prescriptions in this category have been verified."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredPrescriptions.map((rx) => {
            const isApproved = rx.status === 'APPROVED';
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
                          : '#fef3c7',
                        color: isApproved
                          ? 'var(--secondary-600)'
                          : isRejected
                          ? 'var(--accent-600)'
                          : '#b45309',
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
                          variant={isApproved ? 'success' : isRejected ? 'danger' : 'pending'}
                          size="sm"
                        >
                          {rx.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Patient: <strong>{rx.patientName || rx.customerId?.name || 'Self'}</strong> • Doctor: {rx.doctorName || 'Dr. Sharma (MCI-2018-84219)'}
                      </p>

                      {rx.orderId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                          Linked to Order #{rx.orderId?.orderId || rx.orderId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Eye}
                      onClick={() => setInspectingRx(rx)}
                    >
                      Inspect & Verify Document
                    </Button>

                    {!isApproved && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleQuickApprove(rx)}
                      >
                        Quick Approve
                      </Button>
                    )}
                  </div>
                </div>

                {/* 4-Stage Verification Timeline */}
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

      {/* Zoomable Inspection & Verification Modal */}
      {inspectingRx && (
        <PrescriptionInspectionModal
          isOpen={true}
          onClose={() => setInspectingRx(null)}
          prescription={inspectingRx}
          isPharmacist={true}
          onReviewSubmit={handleReviewSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default PharmacyPrescriptions;
