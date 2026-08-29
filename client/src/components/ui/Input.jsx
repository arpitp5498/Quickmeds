import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      fullWidth = true,
      className = '',
      style = {},
      type = 'text',
      as = 'input', // 'input' | 'textarea' | 'select'
      children,
      ...props
    },
    ref
  ) => {
    const Component = as;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: fullWidth ? '100%' : 'auto',
          marginBottom: '1rem'
        }}
        className={className}
      >
        {label && (
          <label
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-main)'
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: 'relative', width: '100%' }}>
          {Icon && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: as === 'textarea' ? '14px' : '50%',
                transform: as === 'textarea' ? 'none' : 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Icon size={18} />
            </div>
          )}

          <Component
            ref={ref}
            type={as === 'input' ? type : undefined}
            style={{
              width: '100%',
              padding: '10px 14px',
              paddingLeft: Icon ? '40px' : '14px',
              paddingRight: RightIcon ? '40px' : '14px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: `1px solid ${error ? 'var(--error)' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
              resize: as === 'textarea' ? 'vertical' : 'none',
              ...style
            }}
            {...props}
          >
            {children}
          </Component>

          {RightIcon && (
            <div
              onClick={onRightIconClick}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                cursor: onRightIconClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RightIcon size={18} />
            </div>
          )}
        </div>

        {error && (
          <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 500 }}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
