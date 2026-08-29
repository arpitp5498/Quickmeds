import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary-600)',
          color: '#ffffff',
          border: '1px solid transparent'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--secondary-600)',
          color: '#ffffff',
          border: '1px solid transparent'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--primary-600)',
          border: '1px solid var(--primary-600)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--accent-600)',
          color: '#ffffff',
          border: '1px solid transparent'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-main)',
          border: '1px solid transparent'
        };
      case 'emergency':
        return {
          backgroundColor: 'var(--accent-600)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)'
        };
      default:
        return {
          backgroundColor: 'var(--primary-600)',
          color: '#ffffff'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-sm)'
        };
      case 'lg':
        return {
          padding: '12px 24px',
          fontSize: '1.0625rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600
        };
      case 'md':
      default:
        return {
          padding: '9px 18px',
          fontSize: '0.9375rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      className={`custom-button ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : 18} color="currentColor" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 18} />}
        </>
      )}
    </button>
  );
};

export default Button;
