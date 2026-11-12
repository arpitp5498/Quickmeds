import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, FileUp, Heart, MapPin, Package, Pill, Search, ShieldPlus, Zap } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import './Landing.css';

const collections = [
  { label: 'Pain & fever', category: 'Pain & fever', icon: Pill },
  { label: 'First aid', category: 'First aid & skin care', icon: ShieldPlus },
  { label: 'Period care', category: 'Period care & hygiene', icon: Heart }
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
    <section className="qm-home" aria-labelledby="home-search-title">
      <div className="container qm-home-hero">
        <div>
          <h1 id="home-search-title">Find your medicines. <span>Get them delivered.</span></h1>
          <p className="qm-home-intro">Check stock and delivery times in your area.</p>
          <form className="qm-home-search" role="search" aria-label="Medicine search" onSubmit={handleSearch}>
            <label><Search size={20} aria-hidden="true" /><input type="search" aria-label="Medicine or generic name"
              placeholder="Medicine or generic name" value={searchQuery} onChange={event => setSearchQuery(event.target.value)}
              enterKeyHint="search" /></label>
            <button type="submit">Find medicine</button>
          </form>
          <nav className="qm-home-shortcuts" aria-label="Order shortcuts">
            <Link className="qm-home-urgent" to="/emergency"><Zap size={17} />SOS essentials</Link>
            <Link to="/prescriptions/upload"><FileUp size={17} />Upload a prescription</Link>
            <Link to="/orders"><Package size={17} />Track an order</Link>
          </nav>
        </div>
        <nav className="quickmeds-discovery" aria-labelledby="home-browse-title">
          <h2 id="home-browse-title">Browse by need</h2>
          <div className="discovery-links">
            {collections.map(({ label, category, icon: Icon }) => (
              <Link key={category} to={`/medicines?category=${encodeURIComponent(category)}`}><Icon size={23} />{label}</Link>
            ))}
            <Link to="/medicines"><ArrowRight size={23} />All medicines</Link>
          </div>
          {location?.address && <p className="qm-home-address"><MapPin size={16} />Delivery area · {location.address}</p>}
        </nav>
      </div>
    </section>
  );
}
