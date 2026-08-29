import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

const Timeline = ({ steps = [], currentStatus = '' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {steps.map((step, index) => {
        const isCompleted = step.isCompleted;
        const isCurrent = step.isCurrent;
        const isRejected = step.isRejected;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
            {/* Timeline Bar & Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isRejected
                    ? 'var(--accent-500)'
                    : isCompleted
                    ? 'var(--secondary-600)'
                    : isCurrent
                    ? 'var(--primary-600)'
                    : 'var(--bg-subtle)',
                  color: isCompleted || isCurrent || isRejected ? '#ffffff' : 'var(--text-muted)',
                  border: isCurrent ? '3px solid var(--primary-200)' : 'none',
                  zIndex: 2
                }}
              >
                {isRejected ? (
                  <AlertCircle size={14} />
                ) : isCompleted ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Clock size={14} />
                ) : (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--border-medium)'
                    }}
                  />
                )}
              </div>

              {!isLast && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '36px',
                    backgroundColor: isCompleted ? 'var(--secondary-500)' : 'var(--border-medium)',
                    margin: '4px 0'
                  }}
                />
              )}
            </div>

            {/* Timeline Content */}
            <div style={{ paddingBottom: isLast ? '0' : '24px', flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <h5
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: isCurrent || isCompleted ? 600 : 500,
                    color: isCurrent
                      ? 'var(--primary-600)'
                      : isCompleted
                      ? 'var(--text-main)'
                      : 'var(--text-muted)'
                  }}
                >
                  {step.title}
                </h5>
                {step.timestamp && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {step.timestamp}
                  </span>
                )}
              </div>

              {step.description && (
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
