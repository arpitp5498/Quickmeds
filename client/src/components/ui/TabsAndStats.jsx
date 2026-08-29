import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border-light)',
        overflowX: 'auto',
        paddingBottom: '2px',
        marginBottom: '1.5rem'
      }}
      className={`tabs-header ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary-600)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.icon && <tab.icon size={16} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--primary-100)' : 'var(--bg-subtle)',
                  color: isActive ? 'var(--primary-700)' : 'var(--text-muted)'
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color = 'var(--primary-600)',
  bg = 'var(--primary-50)',
  subtitle
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {title}
        </span>
        <h3
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            marginTop: '4px',
            marginBottom: '4px'
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
        {change && (
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isPositive ? 'var(--secondary-600)' : 'var(--accent-600)',
              marginTop: '4px'
            }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </div>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: bg,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default Tabs;
