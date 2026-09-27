import React, { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import useVoiceSearch from '../../hooks/useVoiceSearch';

const VoiceSearchButton = ({ onResult, size = 'md' }) => {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    language,
    setLanguage,
    isSupported
  } = useVoiceSearch();

  const prevIsListening = useRef(isListening);

  useEffect(() => {
    if (prevIsListening.current && !isListening && transcript) {
      if (onResult) {
        onResult(transcript);
      }
    }
    prevIsListening.current = isListening;
  }, [isListening, transcript, onResult]);

  if (!isSupported) {
    return null;
  }

  const toggleLanguage = (e) => {
    e.stopPropagation();
    setLanguage(language === 'en-IN' ? 'hi-IN' : 'en-IN');
  };

  const buttonSize = size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isListening && transcript && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          "{transcript}..."
        </span>
      )}
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          backgroundColor: isListening ? '#fee2e2' : 'var(--bg-subtle)',
          color: isListening ? '#dc2626' : 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isListening ? '0 0 0 4px rgba(220, 38, 38, 0.2)' : 'none',
          animation: isListening ? 'pulse 1.5s infinite' : 'none'
        }}
        title={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
      </button>
      
      <button
        type="button"
        onClick={toggleLanguage}
        style={{
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.625rem',
          fontWeight: 700,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-muted)',
          cursor: 'pointer'
        }}
        title="Toggle language (English/Hindi)"
      >
        {language === 'en-IN' ? 'EN' : 'HI'}
      </button>

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
        `}
      </style>
    </div>
  );
};

export default VoiceSearchButton;
