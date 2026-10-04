import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  actionIcon,
  variant = 'empty', // 'empty' | 'error' | 'info' | 'success'
  className = '',
  style = {}
}) => {
  const isError = variant === 'error';
  const isInfo = variant === 'info';

  const iconBg = isError
    ? '#fee2e2'
    : isInfo
    ? 'var(--primary-100)'
    : 'var(--primary-50)';

  const iconColor = isError
    ? '#dc2626'
    : isInfo
    ? 'var(--primary-700)'
    : 'var(--primary-600)';

  const borderColor = isError
    ? '#fca5a5'
    : 'var(--border-medium)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: `1px ${isError ? 'solid' : 'dashed'} ${borderColor}`,
        ...style
      }}
      className={`empty-state ${className}`}
    >
      {Icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}
        >
          <Icon size={30} />
        </div>
      )}

      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: isError ? '#991b1b' : 'var(--text-main)', marginBottom: '0.5rem' }}>
        {title}
      </h4>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: actionLabel ? '1.5rem' : 0
        }}
      >
        {description}
      </p>

      {actionLabel && (
        <Button
          variant={isError ? 'outline' : 'primary'}
          onClick={onAction}
          icon={actionIcon}
          style={isError ? { borderColor: '#dc2626', color: '#dc2626' } : {}}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
