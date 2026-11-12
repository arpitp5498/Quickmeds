import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronRight, FileUp, Package, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './customer-overview.css';

const finishedOrders = ['DELIVERED', 'REJECTED', 'CANCELLED'];
const statusLabel = status => (status || '').replaceAll('_', ' ').toLowerCase();
const dateLabel = value => value && new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function useAccountList(endpoint, field) {
  const [state, setState] = useState({ loading: true, error: false, rows: [] });
  useEffect(() => {
    const controller = new AbortController();
    api.get(endpoint, { signal: controller.signal }).then(response => {
      const rows = response.data?.[field] ?? response.data;
      if (!response.success || !Array.isArray(rows)) throw new Error('List unavailable');
      if (!controller.signal.aborted) setState({ rows, loading: false, error: false });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ rows: [], loading: false, error: true });
    });
    return () => controller.abort();
  }, [endpoint, field]);
  return state;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const orders = useAccountList('/orders?limit=5', 'orders');
  const consultations = useAccountList('/consultations/my?limit=5', 'consultations');
  const labTests = useAccountList('/lab-tests/bookings/my?limit=5', 'bookings');
  const active = orders.rows.find(order => !finishedOrders.includes(order.orderStatus));
  const recent = orders.rows.filter(order => order._id !== active?._id);
  const visits = consultations.rows.filter(row => ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS'].includes(row.status));
  const tests = labTests.rows.filter(row => ['BOOKED', 'SAMPLE_COLLECTED', 'PROCESSING'].includes(row.status));
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return (
    <div className="qm-overview">
      <header className="qm-overview-header">
        <h1>{firstName ? `Welcome, ${firstName}` : 'My account'}</h1>
        <nav aria-label="Quick actions">
          <Link to="/medicines"><Search size={17} />Find medicines</Link>
          <Link to="/prescriptions/upload"><FileUp size={17} />Upload prescription</Link>
        </nav>
      </header>
      {active && <section className="qm-active-order" aria-label="Active order">
        <Package size={25} aria-hidden="true" />
        <div><h2>Your order is {statusLabel(active.orderStatus)}</h2><p>{active.orderId}{active.pharmacyId?.name && ` · ${active.pharmacyId.name}`}</p></div>
        <Link to={`/orders/${active._id}`}>Track order <ArrowRight size={17} /></Link>
      </section>}
      <section className="qm-account-section">
        <div className="qm-section-head"><h2>Recent orders</h2><Link to="/orders">All orders <ArrowRight size={15} /></Link></div>
        {orders.loading && <p role="status">Loading orders…</p>}
        {orders.error && <p role="status">Your orders couldn’t load. <Link to="/orders">Open order history</Link></p>}
        {!orders.loading && !orders.error && !recent.length && <p>{active ? 'Your latest order is shown above.' : 'Your orders will appear here after checkout.'}</p>}
        {recent.map(order => <Link key={order._id} to={`/orders/${order._id}`} className="qm-account-row">
          <Package size={20} /><span><strong>{order.orderId}</strong><small>{dateLabel(order.createdAt)} · ₹{order.total}</small></span>
          <span className="qm-status">{statusLabel(order.orderStatus)}</span><ChevronRight size={17} />
        </Link>)}
      </section>
      {(visits.length > 0 || tests.length > 0 || consultations.error || labTests.error) && <section className="qm-account-section">
        <div className="qm-section-head"><h2>Care bookings</h2><Link to="/health-records">Health records <ArrowRight size={15} /></Link></div>
        {visits.map(visit => <Link key={visit._id} className="qm-account-row" to="/doctors">
          <CalendarDays size={20} /><span><strong>{visit.doctorId?.name ? `Dr. ${visit.doctorId.name}` : 'Doctor consultation'}</strong>
          <small>{visit.scheduledTime ? new Date(visit.scheduledTime).toLocaleString('en-IN') : 'Instant consultation'} · {statusLabel(visit.status)}</small></span><ChevronRight size={17} />
        </Link>)}
        {tests.map(test => <Link key={test._id} className="qm-account-row" to="/lab-tests">
          <CalendarDays size={20} /><span><strong>{test.tests?.map(item => item.name).join(', ') || 'Lab booking'}</strong>
          <small>{[dateLabel(test.scheduledDate), test.scheduledSlot, statusLabel(test.status)].filter(Boolean).join(' · ')}</small>
          {test.status === 'BOOKED' && test.collectionOTP && <small>Collection code · {test.collectionOTP}</small>}</span><ChevronRight size={17} />
        </Link>)}
        {consultations.error && <p>Consultations couldn’t load. <Link to="/doctors">Open consultations</Link></p>}
        {labTests.error && <p>Lab bookings couldn’t load. <Link to="/lab-tests">Open lab tests</Link></p>}
      </section>}
      <nav className="qm-account-shortcuts" aria-label="More account services">
        <Link to="/doctors">Consult a doctor</Link><Link to="/lab-tests">Book a lab test</Link>
        <Link to="/health-records">Health records</Link><Link to="/pharmacies">Nearby pharmacies</Link>
      </nav>
    </div>
  );
}
