import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Building2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';
import { SEED_BUYERS, SEED_INTERESTS, SEED_PASSPORT_METRICS } from '../data/seedData.js';

export function BuyersTab({ lang, passportScore, passportGrade, onNewDemandPosted }) {
  const [demands, setDemands] = useState(SEED_BUYERS);
  const [interests, setInterests] = useState(SEED_INTERESTS);
  const [showDemandModal, setShowDemandModal] = useState(false);

  // New demand form
  const [buyerName, setBuyerName] = useState('');
  const [crop, setCrop] = useState('Tomato');
  const [qtyQtl, setQtyQtl] = useState(50);
  const [month, setMonth] = useState('Nov 2026');
  const [floorPrice, setFloorPrice] = useState(1400);
  const [minScore, setMinScore] = useState(70);

  // Fetch updated demands & interests from server
  const refreshDemands = () => {
    fetch('/api/demands')
      .then((res) => res.json())
      .then((data) => {
        if (data.demands) setDemands(data.demands);
        if (data.interests) setInterests(data.interests);
      })
      .catch((err) => console.log('Demands fetch notice:', err));
  };

  useEffect(() => {
    refreshDemands();
    // Poll every 3 seconds so QR interest appears automatically within one refresh
    const timer = setInterval(refreshDemands, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentScore = passportScore !== undefined ? passportScore : 83;
  const expectedYield = SEED_PASSPORT_METRICS.expectedYieldQtl || 240;

  // Calculate Tomato Pre-booked percentage
  const eligibleTomatoDemands = demands.filter(
    (d) => (d.cropId === 'tomato' || d.crop?.toLowerCase().includes('tomato')) && currentScore >= d.minScore
  );
  const eligibleQty = eligibleTomatoDemands.reduce((sum, d) => sum + Number(d.qtyQtl), 0);
  const prebookedPct = Math.min(100, Math.round((eligibleQty / expectedYield) * 1000) / 10);

  const handlePostDemand = async (e) => {
    e.preventDefault();
    const newDemand = {
      name: buyerName || 'Direct Institutional Buyer',
      organization: buyerName || 'Hostel / Kitchen Buyer',
      crop,
      cropId: crop.toLowerCase(),
      qtyQtl: Number(qtyQtl),
      month,
      floorPrice: Number(floorPrice),
      minScore: Number(minScore),
      type: 'Buyer'
    };

    try {
      const res = await fetch('/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDemand)
      });
      const data = await res.json();
      if (data.success) {
        setDemands((prev) => [...prev, data.demand]);
        setShowDemandModal(false);
        setBuyerName('');
      }
    } catch (err) {
      setDemands((prev) => [...prev, { ...newDemand, id: `buyer_${Date.now()}` }]);
      setShowDemandModal(false);
    }
  };

  return (
    <div className="tab-content">
      {/* 1. Tomato Pre-booked Share Banner */}
      <div
        className="ui-card"
        style={{
          background: 'linear-gradient(135deg, #15803d, #166534)',
          color: '#ffffff',
          padding: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 600 }}>
              {getTranslation(lang, 'preBookedShare')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 2 }}>
              {prebookedPct}%
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              {eligibleQty} / {expectedYield} {getTranslation(lang, 'qtyQtl')} ({lang === 'hi' ? 'स्कोर' : 'Score'}: {currentScore} {passportGrade})
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.8 }}>
              {lang === 'hi' ? 'पात्र खरीदार' : 'Eligible'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              {eligibleTomatoDemands.length} / {demands.filter(d => d.cropId === 'tomato').length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              width: `${prebookedPct}%`,
              background: '#fde047',
              height: '100%',
              borderRadius: 99,
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>
          ℹ️ {getTranslation(lang, 'preSellNote')}
        </div>
      </div>

      {/* 2. Buyer Demand Board Header & Post Demand Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800 }}>{getTranslation(lang, 'buyersTitle')}</h3>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            {lang === 'hi' ? 'न्यूनतम स्कोर के आधार पर मैचिंग' : 'Filtered by your Passport Score'}
          </p>
        </div>
        <button
          onClick={() => setShowDemandModal(true)}
          className="btn-tap btn-primary"
          style={{ minHeight: 38, padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
        >
          <PlusCircle size={14} />
          <span>{lang === 'hi' ? 'मांग दर्ज करें' : 'Post Demand'}</span>
        </button>
      </div>

      {/* 3. Demand Board Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {demands.map((buyer) => {
          const isEligible = currentScore >= buyer.minScore;
          return (
            <div
              key={buyer.id}
              className="ui-card"
              style={{
                padding: 14,
                borderLeft: isEligible ? '5px solid #16a34a' : '5px solid #cbd5e1',
                opacity: isEligible ? 1 : 0.75
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{buyer.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {buyer.organization || buyer.type} • <strong>{buyer.crop}</strong>
                  </div>
                </div>

                <div>
                  {isEligible ? (
                    <span className="badge badge-verified">
                      <CheckCircle2 size={13} />
                      <span>{getTranslation(lang, 'eligible')}</span>
                    </span>
                  ) : (
                    <span className="badge badge-silver">
                      <XCircle size={13} />
                      <span>{getTranslation(lang, 'ineligible')} ({buyer.minScore}+)</span>
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: '1px solid var(--border)',
                  fontSize: 12
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'मात्रा:' : 'Qty:'}</span>
                  <div style={{ fontWeight: 700 }}>{buyer.qtyQtl} Qtl</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>{getTranslation(lang, 'floorPrice')}</span>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>₹{buyer.floorPrice}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>{getTranslation(lang, 'minScoreRequired')}</span>
                  <div style={{ fontWeight: 700 }}>{buyer.minScore}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Pre-booking Interests Received from QR Link */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="card-title" style={{ fontSize: 15 }}>
            <TrendingUp size={18} color="var(--primary)" />
            <span>{getTranslation(lang, 'interestsReceived')}</span>
          </h3>
          <span className="badge badge-gold" style={{ fontSize: 11 }}>
            {interests.length} {lang === 'hi' ? 'रुचियां' : 'received'}
          </span>
        </div>

        {interests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 8px', color: '#64748b', fontSize: 13 }}>
            {lang === 'hi' ? 'क्यूआर कोड स्कैन होने पर खरीदार की रुचि यहां दिखेगी।' : 'Interests from QR scans will appear here.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interests.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 10,
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: 13
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{item.buyerName}</span>
                  <span style={{ fontWeight: 800, color: '#15803d' }}>₹{item.offerPrice} / qtl</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  <span>{item.qtyQtl} क्विंटल • {item.month}</span>
                  <span>{item.time || 'हाल ही में'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Post New Demand */}
      {showDemandModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowDemandModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 480,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>{getTranslation(lang, 'postDemandTitle')}</h3>
              <button
                onClick={() => setShowDemandModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostDemand}>
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'buyerName')}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Pune Central Kitchen / APMC Trader"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{getTranslation(lang, 'qtyQtl')}</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    className="form-input"
                    value={qtyQtl}
                    onChange={(e) => setQtyQtl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{getTranslation(lang, 'floorPrice')}</label>
                  <input
                    type="number"
                    step="50"
                    className="form-input"
                    value={floorPrice}
                    onChange={(e) => setFloorPrice(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{getTranslation(lang, 'month')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{getTranslation(lang, 'minScoreRequired')}</label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    className="form-input"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-tap btn-primary"
                style={{ width: '100%', marginTop: 12, minHeight: 48 }}
              >
                {getTranslation(lang, 'submitDemand')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
