import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Phone,
  FileCheck,
  Clock
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import PrescriptionTimeline from './PrescriptionTimeline';

const REJECTION_REASONS = [
  'Expired Prescription (> 6 months old)',
  'Illegible Doctor Handwriting / Unclear Dosage',
  'Dosage Mismatch / Overdose Safety Concern',
  'Invalid Doctor Registration / Missing MCI Reg No.',
  'Missing Doctor Signature & Hospital Stamp',
  'Schedule X Medication - Requires Physical Counterfoil',
  'Medicine Brand/Strength Not Specified'
];

/**
 * PrescriptionInspectionModal Component
 *
 * Provides:
 * - Zoomable document inspection preview (Zoom In/Out, Rotate, Reset)
 * - Patient and Prescribing Doctor details
 * - Linked Order Medicines list
 * - Mandatory regulatory rejection reason dropdown for pharmacists
 * - Pharmacist Registration ID ("Verified by: Lic #DL-PH-2026-98124")
 * - Prominent statutory simulation disclaimer
 */
const PrescriptionInspectionModal = ({
  isOpen = false,
  onClose,
  prescription = null,
  isPharmacist = false,
  onReviewSubmit = null,
  submitting = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [actionType, setActionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [pharmacistConsent, setPharmacistConsent] = useState(true);

  if (!prescription) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onReviewSubmit) return;

    const finalRejectionReason =
      actionType === 'REJECTED'
        ? (customReason.trim() ? `${selectedReason} - ${customReason}` : selectedReason)
        : '';

    onReviewSubmit({
      status: actionType,
      reviewNotes: reviewNotes || 'Prescription verified by pharmacist.',
      rejectionReason: finalRejectionReason,
      licenseNumber: 'DL-PH-2026-98124'
    });
  };

  const isPdf = prescription.mimeType === 'application/pdf' || prescription.fileUrl?.endsWith('.pdf');
  const demoImage = prescription.fileUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Prescription Inspection: ${prescription.originalName || 'Medical Document'}`}
      size="xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Statutory Regulatory Simulation Disclaimer */}
        <div
          style={{
            backgroundColor: 'var(--accent-50)',
            border: '1px solid var(--accent-200)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <ShieldCheck size={18} color="var(--accent-600)" style={{ minWidth: '18px', marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239', display: 'block' }}>
              Statutory Requirement (Pharmacy Practice Regulations):
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9f1239', lineHeight: 1.4 }}>
              Under Indian Drugs and Cosmetics Act & Pharmacy Practice Regulations, all Schedule H & H1 medications require validation by a Registered Pharmacist. (Verified).
            </span>
          </div>
        </div>

        {/* 4-Stage Verification Timeline */}
        <PrescriptionTimeline
          status={prescription.status}
          createdAt={prescription.createdAt}
          reviewedAt={prescription.reviewedAt}
          rejectionReason={prescription.rejectionReason}
          pharmacistLicense="DL-PH-2026-98124"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            alignItems: 'flex-start'
          }}
        >
          {/* Left Column: Zoomable Document Viewer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden'
            }}
          >
            {/* Viewer Controls Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Inspection Tool ({Math.round(zoom * 100)}%)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90°"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <RotateCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Document Surface */}
            <div
              style={{
                minHeight: '320px',
                maxHeight: '460px',
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                position: 'relative'
              }}
            >
              {isPdf ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <FileText size={48} color="var(--primary-600)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>PDF Prescription Upload</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    File: {prescription.originalName} ({((prescription.fileSize || 54000) / 1024).toFixed(1)} KB)
                  </span>
                  <div style={{ marginTop: '1rem' }}>
                    <a
                      href={prescription.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: 'var(--primary-600)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 600
                      }}
                    >
                      <ExternalLink size={14} /> Open PDF in Full Window
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={demoImage}
                  alt="Prescription Document"
                  style={{
                    maxWidth: '100%',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Column: Metadata & Pharmacist Action Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Metadata Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid var(--border-light)',
                fontSize: '0.8125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                <strong>{prescription.patientName || prescription.customerId?.name || 'Self'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Consulting Doctor:</span>
                <strong>{prescription.doctorName || 'Dr. Sharma, MBBS (Reg #MCI-2018-84219)'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Upload Timestamp:</span>
                <span>{new Date(prescription.createdAt || Date.now()).toLocaleString('en-IN')}</span>
              </div>
              {prescription.orderId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Linked Order:</span>
                  <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                    #{prescription.orderId?.orderId || prescription.orderId}
                  </span>
                </div>
              )}
            </div>

            {/* Pharmacist Action Form (If in pharmacy verification mode) */}
            {isPharmacist && prescription.status !== 'APPROVED' && prescription.status !== 'REJECTED' ? (
              <form
                onSubmit={handleSubmit}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Pharmacist Verification Action
                </h4>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActionType('APPROVED')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${actionType === 'APPROVED' ? 'var(--secondary-600)' : 'var(--border-medium)'}`,
                      backgroundColor: actionType === 'APPROVED' ? 'var(--secondary-50)' : '#ffffff',
                      color: actionType === 'APPROVED' ? 'var(--secondary-700)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={15} /> Approve Rx
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('REJECTED')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${actionType === 'REJECTED' ? 'var(--accent-600)' : 'var(--border-medium)'}`,
                      backgroundColor: actionType === 'REJECTED' ? 'var(--accent-50)' : '#ffffff',
                      color: actionType === 'REJECTED' ? 'var(--accent-600)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <XCircle size={15} /> Reject Rx
                  </button>
                </div>

                {actionType === 'REJECTED' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239' }}>
                      Mandatory Regulatory Rejection Reason:
                    </label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-medium)',
                        fontSize: '0.8125rem',
                        backgroundColor: '#ffffff'
                      }}
                      required
                    >
                      {REJECTION_REASONS.map((r, i) => (
                        <option key={i} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <Input
                      label="Additional Rejection Details (Optional)"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Specify defect or guidance for patient..."
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'var(--secondary-50)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--secondary-200)',
                        fontSize: '0.75rem',
                        color: 'var(--secondary-800)'
                      }}
                    >
                      <span>
                        <strong>Pharmacist Registration ID:</strong> Lic #DL-PH-2026-98124 (In-Charge)
                      </span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={pharmacistConsent}
                        onChange={(e) => setPharmacistConsent(e.target.checked)}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        I certify that I have verified the doctor's registration, prescription validity, dosage and drug compatibility.
                      </span>
                    </label>

                    <Input
                      label="Pharmacist Verification Note (Optional)"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="e.g. Verified 10 days course as prescribed"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={actionType === 'APPROVED' ? 'secondary' : 'danger'}
                    size="sm"
                    loading={submitting}
                    disabled={actionType === 'APPROVED' && !pharmacistConsent}
                  >
                    Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
                  </Button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  backgroundColor: prescription.status === 'APPROVED' ? 'var(--secondary-50)' : 'var(--accent-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  border: `1px solid ${prescription.status === 'APPROVED' ? 'var(--secondary-200)' : 'var(--accent-200)'}`,
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {prescription.status === 'APPROVED' ? (
                    <CheckCircle2 size={18} color="var(--secondary-600)" />
                  ) : (
                    <XCircle size={18} color="var(--accent-600)" />
                  )}
                  <strong>
                    Prescription {prescription.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </strong>
                </div>

                {prescription.status === 'APPROVED' && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary-800)' }}>
                    Verified by Licensed Pharmacist • Lic #DL-PH-2026-98124 on{' '}
                    {prescription.reviewedAt ? new Date(prescription.reviewedAt).toLocaleString('en-IN') : 'Recently'}
                  </p>
                )}

                {prescription.status === 'REJECTED' && prescription.rejectionReason && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-700)', fontWeight: 600 }}>
                    Reason: {prescription.rejectionReason}
                  </p>
                )}

                {prescription.reviewNotes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Note: {prescription.reviewNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PrescriptionInspectionModal;
