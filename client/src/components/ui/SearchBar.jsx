import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search medicines, generic names, brands, symptoms...',
  size = 'md',
  fullWidth = true,
  className = '',
  style = {}
}) => {
  const isLarge = size === 'lg';

  return (
    <div
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        ...style
      }}
      className={`search-bar-container ${className}`}
    >
      <div
        style={{
          position: 'absolute',
          left: isLarge ? '16px' : '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <Search size={isLarge ? 20 : 18} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: isLarge ? '14px 44px' : '10px 38px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-medium)',
          borderRadius: isLarge ? 'var(--radius-full)' : 'var(--radius-md)',
          fontSize: isLarge ? '1rem' : '0.9375rem',
          boxShadow: isLarge ? 'var(--shadow-md)' : 'var(--shadow-xs)',
          outline: 'none',
          transition: 'all var(--transition-fast)'
        }}
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          style={{
            position: 'absolute',
            right: isLarge ? '16px' : '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            borderRadius: 'var(--radius-full)'
          }}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
