import React, { useState, useEffect } from 'react';
import { FileText, Eye, ExternalLink, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/prescriptions');
        if (res.success && res.data) {
          setPrescriptions(res.data.prescriptions || []);
        }
      } catch (err) {
        console.warn('Admin rx error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Prescription Compliance Audit</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Statutory verification records for Schedule H prescriptions fulfilled on QuickMeds.
        </p>
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : prescriptions.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Prescriptions Logged</h4>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Prescription File</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Doctor</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Verified By</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Document</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{rx.originalName}</td>
                    <td style={{ padding: '12px 16px' }}>{rx.patientName || rx.customerId?.name}</td>
                    <td style={{ padding: '12px 16px' }}>{rx.doctorName || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        variant={
                          rx.status === 'APPROVED'
                            ? 'success'
                            : rx.status === 'REJECTED'
                            ? 'danger'
                            : 'pending'
                        }
                        size="sm"
                      >
                        {rx.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{rx.reviewedBy?.name || 'Pending'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(rx.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {rx.fileUrl && (
                        <a
                          href={rx.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: 'var(--primary-600)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                        >
                          <ExternalLink size={14} /> Open
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminPrescriptions;
