// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * QuickMeds Demo Control Panel (HUD & Launcher)
 * File: client/src/demo/DemoControlPanel.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Play,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Store,
  Truck,
  User,
  Zap,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import {
  fetchDemoStatus,
  triggerRejectionAndReroute,
  resetDemoState
} from './demoApi';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const DemoControlPanel = ({ isOpen, onClose }) => {
  const [demoState, setDemoState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await fetchDemoStatus();
      if (res.success && res.data) {
        setDemoState(res.data);
      }
    } catch (err) {
      console.warn('[Demo] Failed to load demo status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  // Real-time socket sync with backend state machine
  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (data) => {
      if (data?.orderId === demoState?.order?._id || data?.orderId === 'QM-DEMO-001') {
        loadStatus();
      }
    };

    socket.on('order_status_changed', handleStatusChange);
    return () => {
      socket.off('order_status_changed', handleStatusChange);
    };
  }, [socket, demoState?.order?._id]);

  if (!isOpen) return null;

  const handleOpenRoleTab = (roleRoute) => {
    window.open(`/demo/launch/${roleRoute}`, '_blank');
  };

  const handleTriggerRejection = async () => {
    try {
      setActionLoading(true);
      const res = await triggerRejectionAndReroute();
      if (res.success) {
        showToast(
          '⚡ Smart Rerouting Triggered: Pharmacy A rejected ➔ Reassigned to Pharmacy B!',
          'warning'
        );
        loadStatus();
      }
    } catch (err) {
      showToast(err.message || 'Rejection simulation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setActionLoading(true);
      const res = await resetDemoState();
      if (res.success) {
        showToast('Demo order QM-DEMO-001 and inventory reset to initial baseline!', 'success');
        loadStatus();
      }
    } catch (err) {
      showToast(err.message || 'Reset failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const order = demoState?.order;
  const currentStatus = order?.orderStatus || 'PLACED';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>🎬</span>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                QUICKMEDS DEMO MODE
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#e0f2fe', margin: '4px 0 0 0' }}>
              Multi-Role End-to-End Testing (No Repeated Logins)
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Active Demo Order Snapshot */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                SHARED DEMO ORDER
              </span>
              <Badge variant="primary" size="sm">
                #{order?.orderId || 'QM-DEMO-001'}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Current Status
                </span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                  {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Assigned Pharmacy
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  {order?.pharmacyId?.name || demoState?.pharmacyA?.name || 'QuickMeds Demo Pharmacy 1'}
                </span>
              </div>
            </div>

            {order?.fallbackTriggered && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '6px 10px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                <span>Rerouted via Fallback Routing (Attempt #{order.fallbackAttempt})</span>
              </div>
            )}
          </div>

          {/* Role Launchers */}
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
            OPEN ROLE VIEWS IN SEPARATE TABS (NO MULTIPLE LOGINS)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
            {/* Customer */}
            <Button
              variant="outline"
              onClick={() => handleOpenRoleTab('customer')}
              style={{ justifyContent: 'flex-start', padding: '10px' }}
              icon={User}
            >
              <div style={{ textAlign: 'left', marginLeft: '4px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Customer View</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Track Order Live</div>
              </div>
            </Button>

            {/* Pharmacy A */}
            <Button
              variant="outline"
              onClick={() => handleOpenRoleTab('pharmacy1')}
              style={{ justifyContent: 'flex-start', padding: '10px' }}
              icon={Store}
            >
              <div style={{ textAlign: 'left', marginLeft: '4px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Pharmacy A View</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Accept & Prepare</div>
              </div>
            </Button>

            {/* Pharmacy B (Reroute) */}
            <Button
              variant="outline"
              onClick={() => handleOpenRoleTab('pharmacy2')}
              style={{ justifyContent: 'flex-start', padding: '10px' }}
              icon={Store}
            >
              <div style={{ textAlign: 'left', marginLeft: '4px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Pharmacy B View</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Fallback Store</div>
              </div>
            </Button>

            {/* Rider */}
            <Button
              variant="outline"
              onClick={() => handleOpenRoleTab('rider')}
              style={{ justifyContent: 'flex-start', padding: '10px' }}
              icon={Truck}
            >
              <div style={{ textAlign: 'left', marginLeft: '4px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Rider View</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Pickup & Deliver</div>
              </div>
            </Button>
          </div>

          {/* Workflow Simulation Controls */}
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
            SMART FULFILMENT & DEMO ACTIONS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
            <Button
              variant="warning"
              fullWidth
              loading={actionLoading}
              icon={ShieldAlert}
              onClick={handleTriggerRejection}
            >
              ⚡ Test Pharmacy Rejection (Trigger Reroute to Pharmacy B)
            </Button>

            <Button
              variant="primary"
              fullWidth
              icon={Layers}
              onClick={() => {
                onClose();
                navigate('/demo/cockpit');
              }}
            >
              🖥️ Open 3-Sided Live Cockpit (All Roles on One Screen)
            </Button>
          </div>

          {/* Reset Demo Button */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <Button
              variant="ghost"
              fullWidth
              loading={actionLoading}
              icon={RotateCcw}
              onClick={handleReset}
              style={{ color: 'var(--text-muted)' }}
            >
              Reset Demo (Restore Order & Baseline Inventory)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoControlPanel;
