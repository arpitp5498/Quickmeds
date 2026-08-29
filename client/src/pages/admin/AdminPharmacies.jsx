import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, CheckCircle2, XCircle, Search, Eye, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/ui/Skeleton';

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      let url = '/admin/pharmacies';
      if (statusFilter !== 'ALL') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.success && res.data) {
        setPharmacies(res.data.pharmacies || []);
      }
    } catch (err) {
      console.warn('Error fetching pharmacies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/pharmacies/${id}/status`, { status });
      showToast(`Pharmacy status updated to ${status}`, 'success');
      fetchPharmacies();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const filtered = pharmacies.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.licenseNumber?.toLowerCase().includes(s) ||
      p.address?.city?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pharmacy Partner Compliance</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Audit state drug licenses, approve chemist registrations, and govern retail partners.
        </p>
      </div>

      <Tabs
        activeTab={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: 'ALL', label: 'All Partners' },
          { id: 'PENDING', label: 'Pending Approval' },
          { id: 'VERIFIED', label: 'Verified Partners' },
          { id: 'SUSPENDED', label: 'Suspended' }
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by pharmacy name, license number, or city..."
        />
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Store size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Pharmacies Found</h4>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((p) => {
            const isPending = p.verificationStatus === 'PENDING';
            const isVerified = p.verificationStatus === 'VERIFIED';

            return (
              <Card key={p._id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '48px'
                      }}
                    >
                      <Store size={24} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
                        <Badge
                          variant={
                            isVerified
                              ? 'success'
                              : isPending
                              ? 'pending'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {p.verificationStatus}
                        </Badge>
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        License: <strong>{p.licenseNumber}</strong> • Phone: {p.phone} • {p.address?.city}
                      </p>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Orders Completed: {p.totalOrdersCompleted || 0} • Rating: ★ {p.rating}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/admin/pharmacies/${p._id}`)}
                    >
                      Audit Details
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => handleUpdateStatus(p._id, 'VERIFIED')}
                        >
                          Approve License
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => handleUpdateStatus(p._id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {isVerified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(p._id, 'SUSPENDED')}
                      >
                        Suspend
                      </Button>
                    )}

                    {p.verificationStatus === 'SUSPENDED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(p._id, 'VERIFIED')}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPharmacies;
