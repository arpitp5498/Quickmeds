import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, FileUp, MapPin, Package, Search } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import './Landing.css';

const collections = [
  {
    label: 'Pain & fever',
    to: '/medicines?category=Pain%20%26%20fever',
    image: '/medicines/crocin-500-advance-tablet-netmeds.jpg',
    tone: 'blue'
  },
  {
    label: 'First aid & SOS',
    to: '/emergency',
    image: '/medicines/hansaplast-regular-bandage-strips.png',
    tone: 'green'
  },
  {
    label: 'Period care',
    to: '/medicines?category=Period%20care%20%26%20hygiene',
    image: '/medicines/sanitary-pads-xl-whisper-ultra-clean-netmeds.jpg',
    tone: 'pink'
  }
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const { location } = useLocation();
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/medicines?q=${encodeURIComponent(query)}` : '/medicines');
  }

  return (
    <div className="container qm-home">
      <section className="qm-home-hero" aria-labelledby="home-search-title">
        <div className="qm-home-search-area">
          <h1 id="home-search-title">Find your medicines<span>.</span></h1>
          <p className="qm-home-intro">Search by name to check prices and availability in your area.</p>
          <form className="qm-home-search" role="search" aria-label="Medicine search" onSubmit={handleSearch}>
            <Search size={21} aria-hidden="true" />
            <input
              type="search"
              aria-label="Medicine or generic name"
              placeholder="Medicine or generic name"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              enterKeyHint="search"
            />
            <button type="submit">Find medicine</button>
          </form>
          {location?.address && (
            <p className="qm-home-address">
              <MapPin size={16} aria-hidden="true" />
              <span>Delivery area <strong>{location.address}</strong></span>
            </p>
          )}
        </div>

        <nav className="qm-home-actions" aria-label="Prescriptions and orders">
          <Link to="/prescriptions/upload">
            <span className="qm-home-action-icon"><FileUp aria-hidden="true" size={23} /></span>
            <span><strong>Upload a prescription</strong><small>Send a photo or PDF for review</small></span>
            <ChevronRight aria-hidden="true" size={18} />
          </Link>
          <Link to="/orders">
            <span className="qm-home-action-icon"><Package aria-hidden="true" size={23} /></span>
            <span><strong>Track an order</strong><small>View your latest order status</small></span>
            <ChevronRight aria-hidden="true" size={18} />
          </Link>
        </nav>
      </section>

      <section className="qm-home-collections" aria-labelledby="home-collections-title">
        <div className="qm-home-section-heading">
          <h2 id="home-collections-title">Browse essentials</h2>
          <Link to="/medicines">All medicines <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="qm-home-collection-list">
          {collections.map(({ label, to, image, tone }) => (
            <Link key={to} to={to} className={`qm-home-collection qm-home-collection--${tone}`}>
              <span className="qm-home-product"><img src={image} width="88" height="88" loading="lazy" decoding="async" alt="" /></span>
              <strong>{label}</strong>
              <ChevronRight aria-hidden="true" size={17} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
