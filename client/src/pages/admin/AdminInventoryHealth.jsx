import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const issues = {
  missing: 'Missing inventory',
  broken: 'Broken links',
  stale: 'Stale sync'
};

export default function AdminInventoryHealth() {
  const [issue, setIssue] = useState('missing');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    setResult(null);
    setError('');
    api.get('/admin/inventory-health', { params: { issue, page } }).then(({ data }) => {
      if (current) setResult(data);
    }).catch(e => { if (current) setError(e.message || 'Unable to load inventory health'); });
    return () => { current = false; };
  }, [issue, page, reload]);

  const cell = { textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--border-light)' };
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1>Inventory health</h1>
      <div style={{ display: 'flex', gap: 8, margin: '1rem 0', flexWrap: 'wrap' }}>
        {Object.entries(issues).map(([key, label]) => (
          <Button key={key} variant={issue === key ? 'primary' : 'outline'} aria-pressed={issue === key}
            onClick={() => { setIssue(key); setPage(1); }}>{label}</Button>
        ))}
        <Button variant="outline" onClick={() => setReload(n => n + 1)}>Refresh</Button>
      </div>
      <Card>
        {error ? <p role="alert">{error}</p> : !result ? <p role="status">Checking inventory…</p> : <>
          <p>{result.total} {result.total === 1 ? 'record' : 'records'} · {issue === 'missing'
            ? 'Active medicines without an inventory record'
            : issue === 'broken' ? 'Inventory references a missing medicine or pharmacy'
              : `Last sync over ${result.staleAfterHours} hours ago or unrecorded`}</p>
          {result.rows.length > 0 && <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine', 'Pharmacy', 'Recorded units', 'Last sync'].map(h => <th key={h} style={cell}>{h}</th>)}</tr></thead>
              <tbody>{result.rows.map(row => <tr key={row._id}>
                <td style={cell}>{row.medicine || 'Missing medicine'}<br /><small>{row.medicineId}</small></td>
                <td style={cell}>{row.pharmacy || (issue === 'missing' ? 'Unassigned' : 'Missing pharmacy')}
                  {row.pharmacyId && <><br /><small>{row.pharmacyId}</small></>}</td>
                <td style={cell}>{row.stockQuantity ?? 'Unknown'}</td>
                <td style={cell}>{row.lastSyncedAt ? new Date(row.lastSyncedAt).toLocaleString() : 'Unrecorded'}</td>
              </tr>)}</tbody>
            </table>
          </div>}
          {(page > 1 || result.total > result.limit) && <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {page}</span>
            <Button variant="outline" disabled={page * result.limit >= result.total} onClick={() => setPage(page + 1)}>Next</Button>
          </div>}
        </>}
      </Card>
    </div>
  );
}
