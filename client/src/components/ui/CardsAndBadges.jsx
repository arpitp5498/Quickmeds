import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-subtle)',
        animation: 'pulseGlow 1.5s ease-in-out infinite',
        ...style
      }}
      className={`skeleton-loader ${className}`}
    />
  );
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon = null,
  className = '',
  style = {}
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
      case 'verified':
        return {
          backgroundColor: 'var(--secondary-50)',
          color: 'var(--secondary-700)',
          borderColor: 'rgba(22, 163, 74, 0.25)'
        };
      case 'danger':
      case 'prescription':
        return {
          backgroundColor: 'var(--accent-50)',
          color: 'var(--accent-600)',
          borderColor: 'rgba(225, 29, 72, 0.25)'
        };
      case 'warning':
      case 'pending':
        return {
          backgroundColor: '#fef3c7',
          color: '#b45309',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        };
      case 'primary':
      case 'info':
        return {
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-700)',
          borderColor: 'rgba(2, 132, 199, 0.25)'
        };
      case 'available_now':
        return {
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          borderColor: '#a7f3d0'
        };
      case 'available_today':
        return {
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          borderColor: '#bfdbfe'
        };
      case 'next_available':
        return {
          backgroundColor: '#f8fafc',
          color: '#475569',
          borderColor: '#cbd5e1'
        };
      case 'test_data':
      case 'staging':
        return {
          backgroundColor: '#fef3c7',
          color: '#b45309',
          borderColor: '#fde68a'
        };
      case 'home_collection':
        return {
          backgroundColor: '#f0fdfa',
          color: '#0f766e',
          borderColor: '#99f6e4'
        };
      default:
        return {
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          borderColor: 'var(--border-light)'
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '2px 6px' : '3px 10px',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        lineHeight: 1.2,
        ...getStyles(),
        ...style
      }}
      className={`badge ${className}`}
    >
      {Icon && <Icon size={isSmall ? 12 : 14} />}
      {children}
    </span>
  );
};

export const Card = ({
  children,
  hoverable = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        padding: '1.25rem',
        transition: 'all var(--transition-fast)',
        cursor: onClick ? 'pointer' : 'default',
        ...(hoverable
          ? {
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)'
              }
            }
          : {}),
        ...style
      }}
      className={`custom-card ${hoverable ? 'hoverable-card' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Avatar = ({
  src = '',
  name = 'User',
  size = 40,
  className = ''
}) => {
  const getInitials = (n) => {
    return n
      ? n
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary-100)',
        color: 'var(--primary-800)',
        fontWeight: 600,
        fontSize: size * 0.4,
        border: '1px solid var(--border-light)'
      }}
      className={className}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
