import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Users, Clock, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, total: 0 });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations/doctor/appointments?limit=100');
      const consultations = res.data?.consultations || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppts = consultations.filter(c => {
        const d = new Date(c.scheduledTime || c.createdAt);
        return d >= today && d < tomorrow;
      });

      setStats({
        today: todayAppts.length,
        pending: consultations.filter(c => c.status === 'REQUESTED').length,
        completed: consultations.filter(c => c.status === 'COMPLETED').length,
        total: consultations.length
      });
      setTodayAppointments(todayAppts.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const doctor = user?.doctorId;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          Welcome, Dr. {user?.name || 'Doctor'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {doctor?.specialty || 'Specialist'} • {doctor?.qualification || ''}
        </p>
        {doctor?.verificationStatus === 'PENDING' && (
          <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', fontSize: '0.875rem' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Your doctor profile is pending verification. You'll be able to accept consultations once verified by the admin.
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: "Today's Appointments", value: stats.today, icon: CalendarCheck, color: '#3b82f6' },
          { label: 'Pending Requests', value: stats.pending, icon: Clock, color: '#f59e0b' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#10b981' },
          { label: 'Total Consultations', value: stats.total, icon: Users, color: '#8b5cf6' }
        ].map((card, i) => (
          <div key={i} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{card.label}</span>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Today's Appointments</h2>
          <Link to="/doctor/appointments" style={{ fontSize: '0.875rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 500 }}>
            View All →
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <Stethoscope size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>No appointments scheduled for today</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayAppointments.map(appt => (
              <Link key={appt._id} to={`/doctor/appointments/${appt._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                      {appt.patientId?.name || 'Patient'}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {appt.symptoms ? appt.symptoms.substring(0, 60) + (appt.symptoms.length > 60 ? '...' : '') : 'General consultation'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: appt.status === 'REQUESTED' ? '#fef3c7' : appt.status === 'CONFIRMED' ? '#dbeafe' : appt.status === 'IN_PROGRESS' ? '#ede9fe' : '#d1fae5',
                      color: appt.status === 'REQUESTED' ? '#92400e' : appt.status === 'CONFIRMED' ? '#1e40af' : appt.status === 'IN_PROGRESS' ? '#5b21b6' : '#065f46'
                    }}>
                      {appt.status}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(appt.scheduledTime || appt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/doctor/appointments" style={{ padding: '12px 20px', borderRadius: '8px', backgroundColor: 'var(--primary-600)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          View All Appointments
        </Link>
        <Link to="/doctor/profile" style={{ padding: '12px 20px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', border: '1px solid var(--border-light)' }}>
          Update Profile
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;
