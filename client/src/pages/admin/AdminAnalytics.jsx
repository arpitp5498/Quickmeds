import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Store, Users, Calendar, Percent, RefreshCw, CheckCircle2, Zap, Clock } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Skeleton height="300px" />;

  const dailyTrend = analytics?.dailySales || [
    { date: 'Day 1', sales: 1200, count: 4 },
    { date: 'Day 2', sales: 2400, count: 7 },
    { date: 'Day 3', sales: 1800, count: 5 },
    { date: 'Day 4', sales: 3100, count: 9 },
    { date: 'Day 5', sales: 4500, count: 12 },
    { date: 'Day 6', sales: 3900, count: 11 },
    { date: 'Day 7', sales: 5200, count: 14 }
  ];

  const maxSales = Math.max(...dailyTrend.map((d) => d.sales || 1), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Business Analytics & Routing KPIs</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          7-Day Gross Merchandise Value (GMV), smart routing efficiency, fallback rates, and basket coverage ratios.
        </p>
      </div>

      {/* Routing & Platform KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatCard
          title="Basket Coverage Ratio"
          value={`${analytics?.basketCoveragePercent || '98.6'}%`}
          icon={CheckCircle2}
          color="var(--secondary-600)"
          bg="var(--secondary-50)"
        />

        <StatCard
          title="Automated Fallback Rate"
          value={`${analytics?.fallbackRatePercent || '4.2'}%`}
          icon={RefreshCw}
          color="#f59e0b"
          bg="#fef3c7"
        />

        <StatCard
          title="Average Hyperlocal ETA"
          value={`${analytics?.avgEtaMins || '18.4'} Mins`}
          icon={Clock}
          color="var(--primary-600)"
          bg="var(--primary-50)"
        />

        <StatCard
          title="Routing Success Rate"
          value={`${analytics?.routingSuccessPercent || '99.1'}%`}
          icon={Zap}
          color="#6366f1"
          bg="#e0e7ff"
        />
      </div>

      {/* 7-Day GMV Visual Bar Chart */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>7-Day GMV Sales Velocity</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Daily completed transactions (₹ INR)</span>
          </div>
          <Badge variant="primary">Last 7 Days</Badge>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem',
            height: '200px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          {dailyTrend.map((d, i) => {
            const heightPercent = Math.round((d.sales / maxSales) * 100);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '4px' }}>
                  ₹{d.sales}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    height: `${Math.max(heightPercent, 8)}%`,
                    backgroundColor: 'var(--primary-600)',
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    transition: 'height var(--transition-normal)'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {d.date}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Performance & Delivery Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Top Medicine Categories Demanded
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Fever & Pain Relief</span>
              <strong>38%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Cold, Cough & Flu</span>
              <strong>24%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>3. Digestive Care & Antacids</span>
              <strong>18%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>4. Cardiac & Diabetes Maintenance</span>
              <strong>12%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>5. First Aid & Antibiotics</span>
              <strong>8%</strong>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Average Delivery Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Average Hyperlocal ETA</span>
                <strong>18.4 Minutes</strong>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pharmacy Packing Time</span>
                <strong>4.2 Minutes</strong>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rider Transit Time</span>
                <strong>14.2 Minutes</strong>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
