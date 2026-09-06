import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  QrCode,
  Zap,
  Bell,
  ShieldCheck,
  Truck,
  X
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * AppDownloadModal Component
 *
 * Provides a comprehensive mobile app installation & download experience:
 * - Direct 1-tap PWA installation when supported (Chrome / Android / Edge)
 * - Step-by-step iOS (Safari) "Add to Home Screen" guide
 * - Android APK / Instant Web App download
 * - QR code for instant mobile handoff from desktop
 * - Key mobile app differentiators (10s sound reminders, live rider GPS, OTP handover)
 */
const AppDownloadModal = ({ isOpen = false, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios' | 'qr'

  useEffect(() => {
    // Detect if browser fired beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if already running in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    // Auto-detect OS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: alert instructions
      alert(
        'To install QuickMeds: tap your browser menu (three dots or share button) and select "Add to Home Screen" or "Install App".'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download QuickMeds Mobile App"
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ maxWidth: '360px' }}>
            <Badge
              variant="default"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: 'none',
                marginBottom: '8px'
              }}
            >
              📱 Official Mobile Experience
            </Badge>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
              QuickMeds on Your Phone
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#e0f2fe', margin: 0, lineHeight: 1.5 }}>
              Express 15–20 min emergency deliveries, audible 10-second sound alarms, live rider GPS tracking, and secure OTP verification.
            </p>
          </div>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Smartphone size={32} color="#ffffff" />
          </div>
        </div>

        {/* Device Selector Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'android' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'android' ? 'var(--primary-700)' : 'var(--text-muted)',
              fontWeight: activeTab === 'android' ? 700 : 500,
              fontSize: '0.875rem',
              boxShadow: activeTab === 'android' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🤖 Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'ios' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'ios' ? 'var(--primary-700)' : 'var(--text-muted)',
              fontWeight: activeTab === 'ios' ? 700 : 500,
              fontSize: '0.875rem',
              boxShadow: activeTab === 'ios' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🍏 iPhone (iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'qr' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'qr' ? 'var(--primary-700)' : 'var(--text-muted)',
              fontWeight: activeTab === 'qr' ? 700 : 500,
              fontSize: '0.875rem',
              boxShadow: activeTab === 'qr' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={16} />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Tab Content: Android */}
        {activeTab === 'android' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: '0 0 2px 0' }}>
                    Instant Progressive Web App (PWA)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No 50MB Play Store download needed • 0 storage overhead • Works offline
                  </span>
                </div>
                <Badge variant="success">Recommended</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>1-Tap install straight to your phone's app drawer and home screen.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Full push notifications & 10-second audible medicine alarms.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Always updated with latest pharmacy inventory and routing.</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={Download}
                onClick={handleInstallClick}
              >
                {isInstalled ? 'App Already Installed ✓' : '⚡ Install QuickMeds App (1-Tap)'}
              </Button>
            </div>

            {/* Store Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>
                  Google Play Store & APK
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Native Play Store listing rolling out across select cities.
                </span>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                GET IT ON Google Play ➔
              </button>
            </div>
          </div>
        )}

        {/* Tab Content: iOS */}
        {activeTab === 'ios' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}
          >
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '4px' }}>
              Add QuickMeds to iPhone / iPad Home Screen
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Run QuickMeds in full-screen standalone mode without the Safari URL bar:
            </p>

            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
              <li>
                Open <strong>https://quickmedss.vercel.app</strong> in <strong>Safari</strong> on your iPhone.
              </li>
              <li>
                Tap the <strong>Share</strong> button <Share2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom toolbar of Safari.
              </li>
              <li>
                Scroll down and tap <strong>"Add to Home Screen"</strong> (with the ➕ icon).
              </li>
              <li>
                Tap <strong>"Add"</strong> in the top-right corner. QuickMeds will appear on your Home Screen as an app!
              </li>
            </ol>

            <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>
                ✓ Features enabled: Fullscreen view, biometric autofill, and express checkout.
              </span>
            </div>
          </div>
        )}

        {/* Tab Content: QR Code */}
        {activeTab === 'qr' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0 }}>
              Scan with Phone Camera to Open & Install
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, maxWidth: '320px' }}>
              Point your smartphone camera at this QR code to immediately launch QuickMeds on your mobile browser.
            </p>

            {/* Programmatic High-Resolution QR Representation */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '2px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)',
                margin: '8px 0'
              }}
            >
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fquickmedss.vercel.app&color=0284c7"
                alt="QuickMeds Mobile App QR Code"
                width={180}
                height={180}
                style={{ display: 'block' }}
              />
            </div>

            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-700)' }}>
              quickmedss.vercel.app
            </span>
          </div>
        )}

        {/* App Features List */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            paddingTop: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Zap size={14} color="#0284c7" />
            <span>15-min delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Bell size={14} color="#0284c7" />
            <span>10s sound alerts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Truck size={14} color="#0284c7" />
            <span>Live rider GPS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="#0284c7" />
            <span>OTP handover</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AppDownloadModal;
