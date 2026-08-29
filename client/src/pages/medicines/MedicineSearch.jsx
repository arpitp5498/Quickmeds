import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Pill,
  ShieldAlert,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useDebounce } from '../../hooks/useDebounce';
import SearchBar from '../../components/ui/SearchBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { getMedicineImage } from '../../utils/medicineImages';

export const CATEGORIES = [
  'All',
  'Fever & Pain',
  'Cold & Cough',
  'Digestive Care',
  'Cardiac & Diabetes',
  'Antibiotics & Anti-infectives',
  'Vitamins & Supplements',
  'First Aid & Surgical',
  'Women Care & Hygiene'
];

const DEFAULT_CATEGORY_COUNTS = {
  'All': 36,
  'Fever & Pain': 7,
  'Cold & Cough': 6,
  'Cardiac & Diabetes': 7,
  'Digestive Care': 4,
  'Antibiotics & Anti-infectives': 4,
  'Vitamins & Supplements': 3,
  'First Aid & Surgical': 3,
  'Women Care & Hygiene': 2
};

const MedicineSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [category, setCategory] = useState(initialCategory);
  const [requiresPrescription, setRequiresPrescription] = useState('ALL'); // 'ALL' | 'OTC' | 'RX'
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);

  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [categoryCounts, setCategoryCounts] = useState(DEFAULT_CATEGORY_COUNTS);
  const [loading, setLoading] = useState(true);

  const { location } = useLocation();
  const navigate = useNavigate();

  // Keep URL in sync
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
    if (category && category !== 'All') params.category = category;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, category, setSearchParams]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        let url = `/medicines?page=${page}&limit=24&sort=${sort}&lat=${location.lat}&lng=${location.lng}`;

        if (debouncedSearch.trim()) {
          url += `&q=${encodeURIComponent(debouncedSearch.trim())}`;
        }
        if (category && category !== 'All') {
          url += `&category=${encodeURIComponent(category)}`;
        }
        if (requiresPrescription === 'OTC') {
          url += `&requiresPrescription=false`;
        } else if (requiresPrescription === 'RX') {
          url += `&requiresPrescription=true`;
        }

        const res = await api.get(url);
        if (res.success && res.data) {
          setMedicines(res.data.medicines || []);
          setPagination(res.data.pagination || { total: 0, pages: 1 });
          if (res.data.categoryCounts) {
            const counts = { ...DEFAULT_CATEGORY_COUNTS, ...res.data.categoryCounts };
            // Total 'All' count
            counts['All'] = Object.entries(counts)
              .filter(([k]) => k !== 'All')
              .reduce((acc, [, v]) => acc + v, 0);
            setCategoryCounts(counts);
          }
        }
      } catch (err) {
        console.warn('Medicine search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [debouncedSearch, category, requiresPrescription, sort, page, location.lat, location.lng]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setRequiresPrescription('ALL');
    setPage(1);
  };

  // Compute category label with count
  const getCategoryLabel = (cat) => {
    const count = categoryCounts[cat];
    return count !== undefined ? `${cat} (${count})` : cat;
  };

  // Descriptive section heading based on state
  const getSectionTitle = () => {
    if (debouncedSearch.trim() && category !== 'All') {
      return `Results for "${debouncedSearch.trim()}" in ${category}`;
    }
    if (debouncedSearch.trim()) {
      return `Results for "${debouncedSearch.trim()}"`;
    }
    if (category !== 'All') {
      return `${category} — Demo Medicines`;
    }
    return 'Commonly Searched Demo Medicines';
  };

  const getSectionSubtitle = () => {
    if (loading) return 'Checking real-time stock across verified pharmacies...';
    if (medicines.length === 0) return 'No matching items in this selection.';
    if (category === 'All' && !debouncedSearch.trim()) {
      return `Browse all ${pagination.total || medicines.length} simulated master items with live inventory matching.`;
    }
    return `Showing ${medicines.length} of ${pagination.total || medicines.length} demo medicines available nearby.`;
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title & Location Context */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Search Medicines &amp; Healthcare
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Simulated live inventory &amp; pricing across verified pharmacies near <strong>{location.address}</strong>
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          placeholder="Search by medicine name (e.g. Dolo 650), salt formula (e.g. Paracetamol), or category..."
          size="lg"
        />
      </div>

      {/* Category Discovery Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Browse Categories
          </span>
          {category !== 'All' && (
            <button
              onClick={() => handleCategoryClick('All')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              Reset to All ({categoryCounts['All'] || 36})
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'thin'
          }}
          className="category-pill-row"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                style={{
                  padding: '7px 15px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-medium)'}`,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(15, 118, 110, 0.25)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{cat}</span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 600
                  }}
                >
                  {categoryCounts[cat] || (cat === 'All' ? 36 : 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Bar: Prescription Toggle + Sort Dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Prescription Type Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Filter:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setRequiresPrescription('ALL')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: requiresPrescription === 'ALL' ? 'var(--primary-100)' : 'transparent',
                color: requiresPrescription === 'ALL' ? 'var(--primary-800)' : 'var(--text-muted)'
              }}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setRequiresPrescription('OTC')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: requiresPrescription === 'OTC' ? 'var(--secondary-100)' : 'transparent',
                color: requiresPrescription === 'OTC' ? 'var(--secondary-700)' : 'var(--text-muted)'
              }}
            >
              OTC (No Rx)
            </button>
            <button
              type="button"
              onClick={() => setRequiresPrescription('RX')}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: requiresPrescription === 'RX' ? 'var(--accent-100)' : 'transparent',
                color: requiresPrescription === 'RX' ? 'var(--accent-700)' : 'var(--text-muted)'
              }}
            >
              Prescription (Rx)
            </button>
          </div>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '5px 10px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="popular">Most Relevant</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Section Header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={18} color="var(--primary-600)" />
            {getSectionTitle()}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {getSectionSubtitle()}
          </p>
        </div>

        {debouncedSearch.trim() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            style={{ fontSize: '0.75rem' }}
          >
            Clear Search Text
          </Button>
        )}
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {[...Array(8)].map((_, idx) => (
            <div key={idx} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <Skeleton height="210px" borderRadius="var(--radius-lg)" style={{ marginBottom: '14px' }} />
              <Skeleton height="22px" width="80%" style={{ marginBottom: '8px' }} />
              <Skeleton height="14px" width="60%" style={{ marginBottom: '14px' }} />
              <Skeleton height="38px" />
            </div>
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={debouncedSearch.trim() ? "No medicines found" : `No medicines found in ${category}`}
          description={
            debouncedSearch.trim()
              ? `We couldn't find medicines matching "${debouncedSearch}"${category !== 'All' ? ` under ${category}` : ''}. Try searching for a salt formula (e.g. Paracetamol) or check another category.`
              : `No demo medicines are currently listed under "${category}". Choose another category above or view all demo medicines.`
          }
          actionLabel={debouncedSearch.trim() ? "Clear Search" : "Show All Medicines"}
          onAction={handleResetFilters}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {medicines.map((med) => (
            <Card
              key={med._id}
              hoverable
              onClick={() => navigate(`/medicines/${med._id}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: '1.25rem',
                borderRadius: 'var(--radius-xl)',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                {/* Realistic Medicine Product Showcase Box */}
                <div
                  style={{
                    position: 'relative',
                    height: '210px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    marginBottom: '14px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px'
                  }}
                >
                  <img
                    src={getMedicineImage(med)}
                    alt={med.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    loading="lazy"
                  />
                  {med.requiresPrescription ? (
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <Badge variant="prescription" size="sm">
                        Rx Required
                      </Badge>
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <Badge variant="success" size="sm">
                        OTC
                      </Badge>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '2px' }}>
                  {med.category}
                </div>

                <h3
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginBottom: '4px',
                    color: 'var(--text-main)'
                  }}
                >
                  {med.name}
                </h3>

                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {med.genericName} • {med.dosageForm}
                </p>
              </div>

              <div>
                {/* Availability & Price Summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    marginBottom: '10px',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '8px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{med.lowestPrice || med.mrp}
                    </span>
                    {med.lowestPrice && med.lowestPrice < med.mrp && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through',
                          marginLeft: '6px'
                        }}
                      >
                        ₹{med.mrp}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-700)', fontWeight: 600 }}>
                    {med.availablePharmaciesCount > 0
                      ? `In stock at ${med.availablePharmaciesCount} stores`
                      : 'Check stores'}
                  </div>
                </div>

                <Button variant="outline" size="sm" fullWidth icon={Store}>
                  View Stores &amp; Prices
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page || page}
          totalPages={pagination.pages || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default MedicineSearch;
