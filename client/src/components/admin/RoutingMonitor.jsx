import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  Store,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Activity,
  Layers
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import api from '../../services/api';

const SAMPLE_SCENARIOS = [
  {
    id: 'single_item',
    name: 'Scenario A: Single Urgent Medicine (Dolo 650)',
    basketItems: ['Dolo 650mg (1 Strip)'],
    location: 'Connaught Place, New Delhi (28.6304, 77.2177)',
    recommended: {
      pharmacyName: 'Apollo Pharmacy — Connaught Place',
      distanceKm: 0.8,
      etaMins: 14,
      availabilityPercent: 100,
      priceScore: 92,
      ratingScore: 96,
      compositeScore: 96.2,
      status: 'OPTIMAL_FULFILMENT',
      explanation: 'Closest store (0.8km) with 100% verified stock and 14 min ETA.'
    },
    candidates: [
      { name: 'Apollo Pharmacy', dist: '0.8 km', stock: '100%', eta: '14m', price: '₹30', score: 96.2, rank: 1, chosen: true },
      { name: 'MedPlus Chemist', dist: '1.4 km', stock: '100%', eta: '19m', price: '₹32', score: 91.4, rank: 2, fallback: true },
      { name: 'Guardian Pharmacy', dist: '2.8 km', stock: '100%', eta: '26m', price: '₹30', score: 84.0, rank: 3 }
    ]
  },
  {
    id: 'multi_item_split',
    name: 'Scenario B: Multi-Item Emergency Basket (3 Medicines)',
    basketItems: ['Augmentin 625 Duo', 'Pan 40mg', 'Asthalin Inhaler'],
    location: 'Karol Bagh, New Delhi (28.6520, 77.1906)',
    recommended: {
      pharmacyName: 'Consolidated Single-Store: Fortis Healthworld',
      distanceKm: 1.6,
      etaMins: 21,
      availabilityPercent: 100,
      priceScore: 88,
      ratingScore: 94,
      compositeScore: 93.5,
      status: 'SINGLE_STORE_PREFERRED',
      explanation: 'Selected 1 store covering 3/3 basket items to avoid split delivery fees & dual dispatch lag.'
    },
    candidates: [
      { name: 'Fortis Healthworld', dist: '1.6 km', stock: '3/3 Items (100%)', eta: '21m', price: '₹420', score: 93.5, rank: 1, chosen: true },
      { name: 'Sanjivani Medicos', dist: '0.6 km', stock: '2/3 Items (66%)', eta: '12m', price: '₹280', score: 79.2, rank: 2 },
      { name: 'Apollo Pharmacy', dist: '1.9 km', stock: '3/3 Items (100%)', eta: '24m', price: '₹435', score: 89.0, rank: 3, fallback: true }
    ]
  },
  {
    id: 'fallback_failover',
    name: 'Scenario C: Pharmacy Timeout & Automated Failover',
    basketItems: ['Azithral 500mg', 'Crocin 650'],
    location: 'Dwarka Sector 6, New Delhi (28.5921, 77.0460)',
    recommended: {
      pharmacyName: 'Failover Store #2: MedPlus Chemist Sector 10',
      distanceKm: 2.1,
      etaMins: 24,
      availabilityPercent: 100,
      priceScore: 90,
      ratingScore: 92,
      compositeScore: 89.8,
      status: 'FAILOVER_RESOLVED',
      explanation: 'Store #1 timed out after 30s. Routing engine auto-shifted order to Store #2 without patient disruption.'
    },
    candidates: [
      { name: 'City Chemist Sec 6', dist: '0.5 km', stock: '100%', eta: '10m', price: '₹140', score: 95.0, rank: 1, timedOut: true },
      { name: 'MedPlus Chemist Sec 10', dist: '2.1 km', stock: '100%', eta: '24m', price: '₹145', score: 89.8, rank: 2, chosen: true },
      { name: 'Apollo Pharmacy Sec 12', dist: '3.4 km', stock: '100%', eta: '32m', price: '₹140', score: 81.2, rank: 3 }
    ]
  }
];

const RoutingMonitor = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveRoutingData, setLiveRoutingData] = useState(null);

  const scenario = SAMPLE_SCENARIOS[selectedScenario];

  const handleSimulateRerun = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <Card style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                Smart Fulfilment Routing Engine Visualizer
              </h3>
              <Badge variant="success" size="sm">Active Engine</Badge>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time multi-factor matrix evaluation and candidate score comparison
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateRerun}
            disabled={isSimulating}
            icon={RefreshCw}
          >
            {isSimulating ? 'Recalculating...' : 'Re-Run Routing Matrix'}
          </Button>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {SAMPLE_SCENARIOS.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedScenario(idx)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${selectedScenario === idx ? 'var(--primary-600)' : 'var(--border-light)'}`,
              backgroundColor: selectedScenario === idx ? 'var(--primary-50)' : 'var(--bg-subtle)',
              color: selectedScenario === idx ? 'var(--primary-700)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {s.name.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Active Routing Scenario Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left: Input Parameters & Recommendation */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
              Selected Routing Scenario
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px', marginBottom: '8px' }}>
              {scenario.name}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <MapPin size={14} color="var(--primary-600)" />
                <span><strong>Origin:</strong> {scenario.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Layers size={14} color="var(--secondary-600)" />
                <span><strong>Basket:</strong> {scenario.basketItems.join(', ')}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-700)' }}>
                Engine Decision:
              </span>
              <Badge variant={scenario.recommended.status.includes('FAILOVER') ? 'warning' : 'primary'} size="sm">
                {scenario.recommended.status}
              </Badge>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
              {scenario.recommended.explanation}
            </p>
          </div>
        </div>

        {/* Right: Multi-Factor Scoring Weight Breakdown */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)'
          }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '10px' }}>
            Multi-Factor Dimension Weights:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>1. Stock Availability & Coverage</span>
                <strong>40% Weight</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                <div style={{ width: '40%', height: '100%', backgroundColor: 'var(--primary-600)', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>2. Proximity Distance (Haversine/Road)</span>
                <strong>25% Weight</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--secondary-600)', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>3. Estimated Delivery Time (ETA)</span>
                <strong>15% Weight</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                <div style={{ width: '15%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>4. Price Competitiveness & Platform Fees</span>
                <strong>10% Weight</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                <div style={{ width: '10%', height: '100%', backgroundColor: '#8b5cf6', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>5. Partner Fulfilment Reliability Rating</span>
                <strong>10% Weight</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                <div style={{ width: '10%', height: '100%', backgroundColor: '#ec4899', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Comparison Matrix Table */}
      <div>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '10px' }}>
          Candidate Pharmacy Scoring Matrix:
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Rank & Pharmacy</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Proximity</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Stock Match</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Target ETA</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Estimated Order Value</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Composite Score</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Routing Status</th>
              </tr>
            </thead>
            <tbody>
              {scenario.candidates.map((c, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: c.chosen ? 'var(--primary-50)' : c.timedOut ? '#fef2f2' : 'transparent'
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>#{c.rank}</span>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>{c.dist}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--secondary-700)', fontWeight: 600 }}>{c.stock}</td>
                  <td style={{ padding: '10px 12px' }}>{c.eta}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{c.price}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--primary-700)' }}>
                    {c.score} / 100
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {c.chosen ? (
                      <Badge variant="success" size="sm">✔ Selected Fulfilment</Badge>
                    ) : c.timedOut ? (
                      <Badge variant="danger" size="sm">✖ 30s Timeout (Fallback)</Badge>
                    ) : c.fallback ? (
                      <Badge variant="warning" size="sm">Alternative Candidate</Badge>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Eligible Candidate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default RoutingMonitor;
