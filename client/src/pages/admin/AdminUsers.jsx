import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserX, UserCheck, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/ui/Skeleton';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/admin/users';
      if (roleFilter !== 'ALL') {
        url += `?role=${roleFilter}`;
      }
      const res = await api.get(url);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleUserActive = async (user) => {
    try {
      const newStatus = !user.isActive;
      await api.patch(`/admin/users/${user._id}/status`, { isActive: newStatus });
      showToast(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'info');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Status toggle failed', 'error');
    }
  };

  const filtered = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Management & Access Control</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Govern customer accounts, pharmacy operators, delivery partners, and administrators.
        </p>
      </div>

      <Tabs
        activeTab={roleFilter}
        onChange={setRoleFilter}
        tabs={[
          { id: 'ALL', label: 'All Users' },
          { id: 'CUSTOMER', label: 'Customers' },
          { id: 'PHARMACY', label: 'Pharmacies' },
          { id: 'DELIVERY_PARTNER', label: 'Delivery Riders' },
          { id: 'ADMIN', label: 'Admins' }
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search user by name, email, or mobile..."
        />
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Users Found</h4>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>User</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Joined</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'danger'
                            : u.role === 'PHARMACY'
                            ? 'primary'
                            : u.role === 'DELIVERY_PARTNER'
                            ? 'secondary'
                            : 'info'
                        }
                        size="sm"
                      >
                        {u.role.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{u.phone || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={u.isActive !== false ? 'success' : 'danger'} size="sm">
                        {u.isActive !== false ? 'Active' : 'Banned'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Button
                        variant={u.isActive !== false ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => toggleUserActive(u)}
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </Button>
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

export default AdminUsers;
