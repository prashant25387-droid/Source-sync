import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Send,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';
import { SEED_PASSPORT_METRICS, SEED_LOGS } from '../data/seedData.js';

export function BuyerPublicView({ lang, passportId, onBackToFarmerView }) {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Show Interest form
  const [buyerName, setBuyerName] = useState('');
  const [qtyQtl, setQtyQtl] = useState(30);
  const [offerPrice, setOfferPrice] = useState(1450);
  const [month, setMonth] = useState('Nov 2026');
  const [minScore, setMinScore] = useState(70);

  const pid = passportId || SEED_PASSPORT_METRICS.id;

  const fetchPassport = () => {
    fetch(`/api/passports/${pid}`)
      .then((res) => res.json())
      .then((data) => {
        setPassport(data);
        setLoading(false);
      })
      .catch((err) => {
        setPassport({
          ...SEED_PASSPORT_METRICS,
          score: 83,
          grade: 'Gold',
          breakdown: { waterDiscipline: 36.1, loggingConsistency: 24, cropCare: 13.3, planAdherence: 9.8 },
          totalUsedWater: 4600,
          logs: SEED_LOGS
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPassport();
  }, [pid]);

  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    const payload = {
      passportId: pid,
      buyerName: buyerName || 'Hostel / Cloud Kitchen Buyer',
      qtyQtl: Number(qtyQtl),
      offerPrice: Number(offerPrice),
      month,
      minScore: Number(minScore)
    };

    try {
      await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.log('Interest submit notice:', e);
    }

    setSubmitted(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  if (loading) {
    return (
      <div className="tab-content" style={{ textAlign: 'center', padding: 40 }}>
        <div>Loading Crop Passport...</div>
      </div>
    );
  }

  const logs = passport?.logs || SEED_LOGS;
  const photoLogs = logs.filter((l) => l.photoUrl);

  return (
    <div className="tab-content" style={{ paddingBottom: 40 }}>
      {/* Top Buyer Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBackToFarmerView}
          className="btn-tap btn-secondary"
          style={{ minHeight: 36, padding: '4px 12px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
        >
          <ArrowLeft size={14} />
          <span>{lang === 'hi' ? 'किसान ऐप पर वापस जाएं' : 'Back to Farmer View'}</span>
        </button>
        <span className="badge badge-verified" style={{ fontSize: 11 }}>
          Verified QR Link
        </span>
      </div>

      {/* Main Passport Presentation Card */}
      <div className="ui-card" style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          {getTranslation(lang, 'buyerPageTitle')}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
          टमाटर (Tomato) • 2.46 {getTranslation(lang, 'acres')}
        </h2>
        <div style={{ fontSize: 13, color: '#475569' }}>
          Nashik District, Maharashtra • Rabi 2026 Season
        </div>

        {/* Live Score Circle */}
        <div style={{ margin: '18px auto 8px' }}>
          <div className={`score-circle ${passport.grade?.toLowerCase() || 'gold'}`}>
            <span className="score-num">{passport.score}</span>
            <span className="score-denom">/ 100</span>
          </div>
        </div>

        <span
          className={`badge ${
            passport.grade === 'Gold' ? 'badge-gold' : passport.grade === 'Silver' ? 'badge-silver' : 'badge-bronze'
          }`}
          style={{ fontSize: 15, padding: '6px 18px', marginTop: 8 }}
        >
          <Award size={16} />
          <span>{passport.grade} Grade</span>
        </span>

        {passport.verifiedBy ? (
          <div
            style={{
              marginTop: 12,
              background: '#dcfce7',
              color: '#166534',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ShieldCheck size={16} />
            <span>Field-Verified by {passport.verifiedBy}</span>
          </div>
        ) : (
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            ℹ️ {getTranslation(lang, 'farmerLoggedNote')}
          </div>
        )}
      </div>

      {/* Water & Plan Metrics */}
      <div className="ui-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>WATER DISCIPLINE</span>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--water)' }}>
            {passport.totalUsedWater?.toLocaleString()} KL
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            Budget: {(passport.plannedWaterKL || 4386).toLocaleString()} KL
          </span>
        </div>

        <div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>EXPECTED YIELD</span>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>
            {passport.expectedYieldQtl || 240} Qtl
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            Harvest: Nov - Dec 2026
          </span>
        </div>
      </div>

      {/* Photo Evidence Grid */}
      <div className="ui-card">
        <h3 className="card-title" style={{ fontSize: 15, marginBottom: 10 }}>
          <Camera size={16} color="var(--primary)" />
          <span>{getTranslation(lang, 'photoEvidenceTitle')}</span>
        </h3>
        <div className="photo-grid">
          {photoLogs.map((p, idx) => (
            <div key={p.id || idx} className="photo-card">
              <img src={p.photoUrl} alt="Crop status" loading="lazy" />
              <div className="photo-caption">
                <span>{p.date.slice(5)}</span>
                <span>{p.condition === 'healthy' ? '✓' : '⚠️'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show Pre-booking Interest Form */}
      <div className="ui-card" style={{ border: '2px solid var(--primary)', background: '#f0fdf4' }}>
        <h3 className="card-title" style={{ fontSize: 16, color: '#166534' }}>
          <Building2 size={18} color="var(--primary)" />
          <span>{getTranslation(lang, 'showInterestTitle')}</span>
        </h3>
        <p style={{ fontSize: 12, color: '#15803d', marginBottom: 12 }}>
          {lang === 'hi' ? 'अपनी खरीद इच्छा किसान को सीधे भेजें' : 'Send your pre-booking purchase intent directly to the farmer.'}
        </p>

        {submitted ? (
          <div
            style={{
              padding: 16,
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #16a34a',
              textAlign: 'center'
            }}
          >
            <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 800, color: '#166534', fontSize: 15 }}>
              {getTranslation(lang, 'interestSuccess')}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Offer: {qtyQtl} Qtl @ ₹{offerPrice}/Qtl ({month})
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitInterest}>
            <div className="form-group">
              <label className="form-label">{getTranslation(lang, 'buyerName')}</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. DU Hostel / FreshBite Kitchen"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'qtyQtl')}</label>
                <input
                  type="number"
                  min="5"
                  className="form-input"
                  value={qtyQtl}
                  onChange={(e) => setQtyQtl(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'offerPrice')}</label>
                <input
                  type="number"
                  step="50"
                  className="form-input"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
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
                <label className="form-label">{getTranslation(lang, 'minScoreWanted')}</label>
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
              style={{ width: '100%', marginTop: 8, minHeight: 48 }}
            >
              <Send size={16} />
              <span>{getTranslation(lang, 'submitInterest')}</span>
            </button>
          </form>
        )}

        <div className="honest-notice" style={{ marginTop: 12 }}>
          ℹ️ {getTranslation(lang, 'preSellNote')}
        </div>
      </div>
    </div>
  );
}
