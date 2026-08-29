import React from 'react';
import {
  UploadCloud,
  FileSearch,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  ShieldCheck
} from 'lucide-react';

/**
 * PrescriptionTimeline Component
 *
 * 4-Stage Visual Verification Timeline:
 * 1. PENDING (Prescription uploaded by customer)
 * 2. UNDER_REVIEW (Pharmacist inspecting document & regulatory credentials)
 * 3. VERIFIED / REJECTED (Licensed pharmacist verification decision)
 * 4. DISPENSING (Approved for medicine dispatch)
 */
const PrescriptionTimeline = ({
  status = 'UPLOADED',
  createdAt = null,
  reviewedAt = null,
  rejectionReason = '',
  pharmacistLicense = 'DL-PH-2026-98124',
  compact = false
}) => {
  const normalizedStatus = (status || 'UPLOADED').toUpperCase();
  const isApproved = normalizedStatus === 'APPROVED' || normalizedStatus === 'VERIFIED';
  const isRejected = normalizedStatus === 'REJECTED';
  const isUnderReview = normalizedStatus === 'UNDER_REVIEW';
  const isPending = normalizedStatus === 'UPLOADED' || normalizedStatus === 'PENDING';

  const stages = [
    {
      id: 1,
      title: '1. PENDING',
      subtitle: 'Prescription Uploaded',
      icon: UploadCloud,
      isCompleted: true,
      isCurrent: isPending,
      timestamp: createdAt ? new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Logged'
    },
    {
      id: 2,
      title: '2. UNDER REVIEW',
      subtitle: 'Pharmacist Inspection',
      icon: FileSearch,
      isCompleted: isUnderReview || isApproved || isRejected,
      isCurrent: isUnderReview,
      timestamp: isUnderReview ? 'In Progress' : (isApproved || isRejected ? 'Reviewed' : 'Awaiting')
    },
    {
      id: 3,
      title: isRejected ? '3. REJECTED' : '3. VERIFIED',
      subtitle: isRejected ? 'Regulatory Defect' : 'Pharmacist Approved',
      icon: isRejected ? XCircle : CheckCircle2,
      isCompleted: isApproved || isRejected,
      isCurrent: isApproved || isRejected,
      isFailed: isRejected,
      timestamp: reviewedAt ? new Date(reviewedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (isApproved || isRejected ? 'Done' : 'Pending')
    },
    {
      id: 4,
      title: '4. DISPENSING',
      subtitle: isRejected ? 'Blocked' : 'Approved for Dispatch',
      icon: Package,
      isCompleted: isApproved,
      isCurrent: false,
      isBlocked: isRejected,
      timestamp: isApproved ? 'Authorized' : (isRejected ? 'Restricted' : 'Queue')
    }
  ];

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {stages.map((stage, i) => {
          const isDone = stage.isCompleted && !stage.isFailed;
          const isErr = stage.isFailed;
          const isCurr = stage.isCurrent;

          return (
            <React.Fragment key={stage.id}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: isErr
                    ? 'var(--accent-50)'
                    : isDone
                    ? 'var(--secondary-50)'
                    : isCurr
                    ? 'var(--primary-50)'
                    : 'var(--bg-subtle)',
                  color: isErr
                    ? 'var(--accent-600)'
                    : isDone
                    ? 'var(--secondary-700)'
                    : isCurr
                    ? 'var(--primary-700)'
                    : 'var(--text-muted)',
                  border: `1px solid ${
                    isErr
                      ? 'rgba(225, 29, 72, 0.3)'
                      : isDone
                      ? 'rgba(22, 163, 74, 0.3)'
                      : isCurr
                      ? 'rgba(2, 132, 199, 0.3)'
                      : 'var(--border-light)'
                  }`
                }}
              >
                <stage.icon size={11} />
                <span>{stage.title}</span>
              </div>
              {i < stages.length - 1 && (
                <span style={{ color: 'var(--border-medium)', fontSize: '0.7rem' }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        padding: '1rem',
        marginTop: '8px'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          position: 'relative'
        }}
      >
        {stages.map((stage, idx) => {
          const isDone = stage.isCompleted && !stage.isFailed;
          const isErr = stage.isFailed;
          const isCurr = stage.isCurrent;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isErr
                  ? 'var(--accent-50)'
                  : isDone
                  ? 'var(--secondary-50)'
                  : isCurr
                  ? 'var(--primary-50)'
                  : 'var(--bg-subtle)',
                border: `1px solid ${
                  isErr
                    ? 'var(--accent-200)'
                    : isDone
                    ? 'var(--secondary-200)'
                    : isCurr
                    ? 'var(--primary-200)'
                    : 'var(--border-light)'
                }`
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isErr
                    ? 'var(--accent-600)'
                    : isDone
                    ? 'var(--secondary-600)'
                    : isCurr
                    ? 'var(--primary-600)'
                    : 'var(--border-medium)',
                  color: '#ffffff',
                  marginBottom: '6px'
                }}
              >
                <StageIcon size={16} />
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: isErr
                    ? 'var(--accent-700)'
                    : isDone
                    ? 'var(--secondary-800)'
                    : isCurr
                    ? 'var(--primary-800)'
                    : 'var(--text-muted)'
                }}
              >
                {stage.title}
              </span>

              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {stage.subtitle}
              </span>

              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: isErr ? 'var(--accent-600)' : isDone ? 'var(--secondary-700)' : 'var(--text-subtle)',
                  marginTop: '4px'
                }}
              >
                {stage.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Verification details footer */}
      {isApproved && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px dashed var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--secondary-800)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--secondary-600)" />
            <span>
              <strong>Verified by Registered Pharmacist:</strong> Lic #{pharmacistLicense}
            </span>
          </div>
          {reviewedAt && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {new Date(reviewedAt).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      {isRejected && rejectionReason && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 10px',
            backgroundColor: 'var(--accent-100)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--accent-700)',
            fontWeight: 600
          }}
        >
          Rejection Notice: {rejectionReason}
        </div>
      )}
    </div>
  );
};

export default PrescriptionTimeline;
