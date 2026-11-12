import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import './medicine-shop.css';

export default function MedicineCategories() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    api.get('/medicines/categories', { signal: controller.signal }).then(res => {
      if (controller.signal.aborted) return;
      if (!res.success || !Array.isArray(res.data?.browseCategories)) throw new Error('Invalid categories response');
      setCategories(res.data.browseCategories);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [retry]);

  return (
    <div className="container med-shop">
      <header className="med-category-header"><h1>Browse by category</h1><Link className="med-link" to="/medicines"><Search size={16} />Search all medicines</Link></header>
      {status === 'loading' ? <div role="status" aria-label="Loading categories"><Skeleton height="140px" /></div> :
        status === 'error' ? <EmptyState title="Categories couldn’t load" description="You can still search for a medicine by name." actionLabel="Try again" onAction={() => setRetry(r => r + 1)} /> :
          categories.length ? <nav className="med-category-list" aria-label="Medicine categories">
            {categories.map(category => <Link to={`/medicines?category=${encodeURIComponent(category)}`} key={category}>{category}<ArrowRight size={17} /></Link>)}
          </nav> : <p className="med-meta">No categories are listed yet.</p>}
    </div>
  );
}
