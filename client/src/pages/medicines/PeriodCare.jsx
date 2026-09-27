import React, { useState, useEffect } from 'react';
import { Heart, Package, ShieldCheck, Filter } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const PeriodCare = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { isAuthenticated } = useAuth();

  const categories = ['All', 'Sanitary Pads', 'Menstrual Cups', 'Tampons', 'Pain Relief', 'Hygiene Wipes', 'Hot Water Bottles'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Mock data fallback
        const mockProducts = [
          { _id: '1', name: 'Ultra Thin Sanitary Pads (XL)', category: 'Sanitary Pads', brand: 'Stayfree', price: 299, image: 'https://via.placeholder.com/150' },
          { _id: '2', name: 'Reusable Menstrual Cup (Medium)', category: 'Menstrual Cups', brand: 'Sirona', price: 349, image: 'https://via.placeholder.com/150' },
          { _id: '3', name: 'Period Pain Relief Roll On', category: 'Pain Relief', brand: 'Nua', price: 199, image: 'https://via.placeholder.com/150' },
          { _id: '4', name: 'Intimate Hygiene Wipes', category: 'Hygiene Wipes', brand: 'Pee Safe', price: 99, image: 'https://via.placeholder.com/150' }
        ];
        
        // In reality, this would hit /api/medicines?category=Women Care & Hygiene
        const res = await api.get('/medicines?category=Women Care & Hygiene').catch(() => ({ success: true, data: { medicines: mockProducts } }));
        setProducts(res.data?.medicines || mockProducts);
      } catch (error) {
        console.error('Error fetching period care products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ backgroundColor: '#fdf2f8', padding: '3rem 1.25rem', textAlign: 'center', borderBottom: '1px solid #fbcfe8' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Heart size={48} color="#db2777" fill="#db2777" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#9d174d', marginBottom: '1rem' }}>
            Period Care — Delivered with Care & Discretion
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#be185d', marginBottom: '2rem' }}>
            Everything you need for a comfortable cycle, delivered fast and discreetly to your door.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid #fbcfe8', color: '#9d174d', fontWeight: 600 }}>
              <Package size={18} /> Discreet Packaging Guaranteed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid #fbcfe8', color: '#9d174d', fontWeight: 600 }}>
              <ShieldCheck size={18} /> Verified Authentic Products
            </div>
          </div>
          
          {isAuthenticated && (
            <div style={{ marginTop: '2rem' }}>
              <Link to="/cycle-tracker" style={{ display: 'inline-block', backgroundColor: '#db2777', color: '#ffffff', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontWeight: 700, textDecoration: 'none' }}>
                Open Cycle Tracker
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '2rem', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${activeCategory === cat ? '#db2777' : 'var(--border-medium)'}`,
                backgroundColor: activeCategory === cat ? '#db2777' : 'var(--bg-card)',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filteredProducts.map(product => (
              <Card key={product._id} hoverable style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {product.brand}
                </span>
                
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3, flexGrow: 1 }}>
                  {product.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{product.price}</span>
                  <Button size="sm" style={{ backgroundColor: '#db2777', borderColor: '#db2777', color: '#fff' }}>Add to Cart</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodCare;
