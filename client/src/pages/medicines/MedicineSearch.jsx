import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, MapPin, Pill, Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useDebounce } from '../../hooks/useDebounce';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import { getMedicineImage, showMedicineImagePlaceholder } from '../../utils/medicineImages';
import { MedicineFacts, MedicinePurchase, useMedicineCart } from './MedicinePurchase';
import './medicine-shop.css';

function MedicinePreview({ medicine, basket, onClose, catalogUrl }) {
  const dialog = useRef(null);
  function closePreview() {
    dialog.current.close();
    onClose();
  }
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog className="med-dialog" ref={dialog} aria-labelledby="med-preview-name" onCancel={event => { event.preventDefault(); closePreview(); }}
      onClick={event => { if (event.target === dialog.current) closePreview(); }}>
      <div className="med-dialog-body">
        <button type="button" className="med-close" aria-label="Close preview" onClick={closePreview}><X size={20} /></button>
        <div className="med-image med-preview-image"><img src={getMedicineImage(medicine)} onError={showMedicineImagePlaceholder} alt="" /></div>
        <h2 id="med-preview-name">{medicine.name}</h2>
        <p className="med-meta">{[medicine.strength, medicine.dosageForm].filter(Boolean).join(' · ')}</p>
        {medicine.requiresPrescription && <p className="med-rx">Prescription required at checkout</p>}
        <MedicinePurchase medicine={medicine} basket={basket} />
        {basket.getItemQuantity(medicine._id) > 0 && <Link className="med-link" to="/cart">View cart ({basket.totalItems}) <ArrowRight size={16} /></Link>}
        <details className="med-disclosure"><summary>Product information</summary><MedicineFacts medicine={medicine} /></details>
        <Link to={`/medicines/${medicine._id}`} state={{ catalogUrl }} className="med-link">View full details <ArrowRight size={16} /></Link>
      </div>
    </dialog>
  );
}

export default function MedicineSearch() {
  const [params, setParams] = useSearchParams();
  const searchTerm = params.get('q') || '';
  const query = useDebounce(searchTerm.trim(), 300);
  const category = params.get('category') || 'All';
  const rx = ['OTC', 'RX'].includes(params.get('rx')) ? params.get('rx') : 'ALL';
  const sort = ['price_asc', 'price_desc'].includes(params.get('sort')) ? params.get('sort') : 'popular';
  const pageParam = Number(params.get('page'));
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const { location } = useLocation();
  const basket = useMedicineCart();
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = !!searchTerm || category !== 'All' || rx !== 'ALL' || sort !== 'popular';
  const filterCount = Number(rx !== 'ALL') + Number(sort !== 'popular');
  const choices = category !== 'All' && !categories.includes(category) ? [category, ...categories] : categories;
  const resultsHeading = query ? `Results for “${query}”` : category === 'All' ? 'All medicines' : category;
  const catalogUrl = '/medicines' + (params.size ? '?' + params.toString() : '');

  function change(key, value) {
    const next = new URLSearchParams(params);
    if (key !== 'page') next.delete('page');
    const defaults = { q: '', category: 'All', rx: 'ALL', sort: 'popular', page: 1 };
    if (value !== defaults[key]) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setSelected(null);
    const request = { page, limit: 24, sort, lat: location.lat, lng: location.lng };
    if (query) request.q = query;
    if (category !== 'All') request.category = category;
    if (rx !== 'ALL') request.requiresPrescription = rx === 'RX';
    api.get('/medicines', { params: request, signal: controller.signal }).then(res => {
      if (controller.signal.aborted) return;
      if (!res.success || !Array.isArray(res.data?.medicines)) throw new Error('Invalid catalog response');
      setMedicines(res.data.medicines);
      setPagination(res.data.pagination || { total: res.data.medicines.length, pages: 1 });
      setCategories(res.data.browseCategories ?? Object.keys(res.data.categoryCounts || {}));
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [page, sort, query, category, rx, location.lat, location.lng, retry]);

  return (
    <div className="container med-shop">
      <header className="med-header">
        <h1>Find a medicine</h1>
        <p className="med-address"><MapPin size={16} aria-hidden="true" />Delivery to {location.address}</p>
        <div className="med-tools">
          <label className="med-search"><Search aria-hidden="true" size={20} />
            <input type="search" aria-label="Search medicines" placeholder="Search by medicine or generic name" value={searchTerm} onChange={e => change('q', e.target.value)} />
          </label>
          <div className="med-select">
            <select aria-label="Medicine category" value={category} onChange={e => change('category', e.target.value)}>
              <option value="All">All categories</option>
              {choices.map(name => <option key={name}>{name}</option>)}
            </select><ChevronDown aria-hidden="true" size={16} />
          </div>
          <button className="med-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="medicine-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
            <SlidersHorizontal size={17} aria-hidden="true" /> Filters{filterCount > 0 && ` (${filterCount})`}
          </button>
        </div>
        <div id="medicine-filters" className="med-filters" hidden={!filtersOpen}>
          <label>Prescription<select aria-label="Prescription" value={rx} onChange={e => change('rx', e.target.value)}>
            <option value="ALL">All medicines</option><option value="OTC">No prescription needed</option><option value="RX">Prescription required</option>
          </select></label>
          <label>Sort by<select aria-label="Sort by" value={sort} onChange={e => change('sort', e.target.value)}>
            <option value="popular">Most relevant</option><option value="price_asc">MRP, low to high</option><option value="price_desc">MRP, high to low</option>
          </select></label>
        </div>
      </header>
      <section aria-labelledby="medicine-results">
        {category === 'Period care & hygiene' && <nav className="med-related" aria-label="Period care services">
          <Link className="med-link" to="/cycle-tracker">Cycle tracker <ArrowRight size={15} /></Link>
          <Link className="med-link" to="/doctors">Book a consultation <ArrowRight size={15} /></Link>
        </nav>}
        <div className="med-results">
          <h2 id="medicine-results">{resultsHeading}</h2>
          <span className="med-meta" role="status">{status === 'loading' ? 'Searching…' : status === 'ready' ? `${pagination.total} result${pagination.total === 1 ? '' : 's'}` : ''}</span>
          {filtered && <button type="button" className="med-reset" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
        </div>
        {status === 'loading' ? (
          <div className="med-grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} height="280px" borderRadius="var(--radius-lg)" />)}</div>
        ) : status === 'error' ? (
          <EmptyState icon={Pill} title="Medicines couldn’t load" description="Availability is unknown. Try loading the catalog again." actionLabel="Try again" onAction={() => setRetry(r => r + 1)} />
        ) : !medicines.length ? (
          <EmptyState icon={Search} title="No medicines found" description="Try a different medicine name or browse all categories." actionLabel={filtered ? 'Clear filters' : undefined} onAction={() => setParams({}, { replace: true })} />
        ) : (
          <>
            <div className="med-grid">
              {medicines.map(medicine => (
                <article className="med-card" key={medicine._id}>
                  <div className="med-image"><img loading="lazy" decoding="async" src={getMedicineImage(medicine)} onError={showMedicineImagePlaceholder} alt="" /></div>
                  <div className="med-card-info">
                    <h3><button type="button" className="med-open-preview" onClick={() => setSelected(medicine)} aria-haspopup="dialog">{medicine.name}</button></h3>
                    <p className="med-meta">{[medicine.strength, medicine.dosageForm].filter(Boolean).join(' · ')}</p>
                    {medicine.requiresPrescription && <small className="med-rx">Prescription required</small>}
                  </div>
                  <MedicinePurchase medicine={medicine} basket={basket} />
                </article>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={next => {
              change('page', next);
              document.getElementById('medicine-results')?.scrollIntoView({ block: 'start', behavior: 'instant' });
            }} />
          </>
        )}
      </section>
      {selected && <MedicinePreview medicine={selected} basket={basket} catalogUrl={catalogUrl} onClose={() => setSelected(null)} />}
    </div>
  );
}
