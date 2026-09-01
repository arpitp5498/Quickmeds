import React, { useEffect, useRef } from 'react';
import { Bell, Volume2, X, Pill, Clock } from 'lucide-react';
import { playReminderChime } from '../../utils/reminderSound';

/**
 * ReminderAlertOverlay — Global modal overlay for medicine reminder alerts.
 *
 * Props:
 *   alert        — { medicineName, dosage, time, label, notes }
 *   onDismiss    — Function to dismiss the alert (stops sound + closes)
 *   audioUnlocked — Boolean, whether AudioContext has been unlocked
 */
const ReminderAlertOverlay = ({ alert, onDismiss, audioUnlocked }) => {
  const overlayRef = useRef(null);

  // Prevent body scroll while overlay is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const handlePlaySound = () => {
    try {
      playReminderChime();
    } catch (e) {
      console.warn('[ReminderAlert] Manual play failed:', e);
    }
  };

  // Format time for display (e.g. "20:00" → "8:00 PM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
        animation: 'reminderFadeIn 0.3s ease'
      }}
      onClick={(e) => {
        // Close if clicking backdrop (not the card itself)
        if (e.target === overlayRef.current) onDismiss();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          position: 'relative',
          animation: 'reminderSlideUp 0.35s ease'
        }}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss reminder"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#94a3b8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Animated bell icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            animation: 'reminderPulse 1.5s ease-in-out infinite'
          }}
        >
          <Bell size={30} color="#ffffff" />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#1e293b',
          margin: '0 0 0.25rem'
        }}>
          🔔 Medicine Reminder
        </h2>

        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          margin: '0 0 1.25rem'
        }}>
          It's time for your scheduled dose
        </p>

        {/* Medicine details card */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Pill size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {alert.medicineName}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {alert.dosage}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Clock size={14} color="#3b82f6" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
              {formatTime(alert.time)} — {alert.label}
            </span>
          </div>

          {alert.notes && (
            <p style={{
              fontSize: '0.8rem',
              color: '#64748b',
              fontStyle: 'italic',
              marginTop: '6px',
              marginBottom: 0
            }}>
              📝 {alert.notes}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {/* Play Sound fallback — shown when audio might be blocked */}
          <button
            onClick={handlePlaySound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: '2px solid #3b82f6',
              background: '#eff6ff',
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Volume2 size={18} />
            Play Sound
          </button>

          <button
            onClick={onDismiss}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            ✓ Dismiss
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes reminderFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes reminderSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reminderPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50%      { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(59,130,246,0); }
        }
      `}</style>
    </div>
  );
};

export default ReminderAlertOverlay;
