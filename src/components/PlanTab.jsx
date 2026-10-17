import React, { useState, useEffect } from 'react';
import {
  Droplets,
  TrendingUp,
  CloudRain,
  Calculator,
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { getTranslation, getCropDisplayName } from '../i18n/translations.js';
import { rankCrops, optimizeWaterBudget, calculateStressTest } from '../logic/optimizer.js';
import { pumpToKL, floodIrrigationToKL } from '../logic/waterConverter.js';
import { SEED_CROPS } from '../data/seedData.js';

export function PlanTab({ lang, onNavigateToPassport }) {
  const [season, setSeason] = useState('Rabi');
  const [landAcres, setLandAcres] = useState(5);
  const [waterBudgetKL, setWaterBudgetKL] = useState(6000);
  const [sliderPct, setSliderPct] = useState(0); // -50% to +20%
  const [showWaterCalc, setShowWaterCalc] = useState(false);
  const [calcMode, setCalcMode] = useState('pump'); // 'pump' or 'depth'

  // Easy water calc fields
  const [pumpHP, setPumpHP] = useState(5);
  const [pumpHours, setPumpHours] = useState(150);
  const [irrigationsCount, setIrrigationsCount] = useState(4);
  const [depthInches, setDepthInches] = useState(3);

  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [applyRainCredit, setApplyRainCredit] = useState(false);

  // Stress test modal
  const [selectedCropForStress, setSelectedCropForStress] = useState(null);
  const [stressDropPct, setStressDropPct] = useState(20);

  // Load weather on mount
  useEffect(() => {
    fetch('/api/weather?district=Nashik&acres=' + landAcres + '&waterKL=' + waterBudgetKL)
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch((err) => console.log('Weather fetch notice:', err));
  }, [landAcres, waterBudgetKL]);

  // Calculate actual water considering slider
  const effectiveWaterBudget = Math.round(waterBudgetKL * (1 + sliderPct / 100));
  const finalBudgetForOpt = applyRainCredit && weatherData?.rainAdjustment
    ? Math.max(500, effectiveWaterBudget - weatherData.rainAdjustment.rainCreditKL)
    : effectiveWaterBudget;

  const rankedCrops = rankCrops(SEED_CROPS);
  const optimization = optimizeWaterBudget(rankedCrops, Number(landAcres), Number(finalBudgetForOpt));

  // Handler for Easy Water Calculation
  const handleApplyCalculatedWater = () => {
    let computedKL = 6000;
    if (calcMode === 'pump') {
      computedKL = pumpToKL(pumpHP, pumpHours);
    } else {
      computedKL = floodIrrigationToKL(irrigationsCount, depthInches, landAcres);
    }
    if (computedKL > 0) {
      setWaterBudgetKL(computedKL);
      setSliderPct(0);
      setShowWaterCalc(false);
    }
  };

  return (
    <div className="tab-content">
      {/* 1. Farm Parameters Input Card */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="card-title">
            <Droplets size={20} color="var(--water)" />
            <span>{lang === 'hi' ? 'खेत और पानी का विवरण' : 'Farm & Water Parameters'}</span>
          </h2>
          <span className="badge badge-gold" style={{ fontSize: 11 }}>
            {season} 2026
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">{getTranslation(lang, 'landAcres')}</label>
            <input
              type="number"
              min="0.5"
              max="50"
              step="0.5"
              className="form-input"
              value={landAcres}
              onChange={(e) => setLandAcres(Math.max(0.5, parseFloat(e.target.value) || 1))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{getTranslation(lang, 'seasonWater')}</label>
            <input
              type="number"
              min="500"
              max="50000"
              step="100"
              className="form-input"
              value={waterBudgetKL}
              onChange={(e) => setWaterBudgetKL(Math.max(100, parseInt(e.target.value) || 0))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            ℹ️ {getTranslation(lang, 'waterHelper')}
          </span>
          <button
            onClick={() => setShowWaterCalc(!showWaterCalc)}
            className="btn-tap btn-secondary"
            style={{ minHeight: 36, padding: '4px 12px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
          >
            <Calculator size={14} color="var(--primary)" />
            <span>{getTranslation(lang, 'easyWaterEntry')}</span>
            {showWaterCalc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Easy Water Calculator Drawer */}
        {showWaterCalc && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => setCalcMode('pump')}
                className={`btn-tap ${calcMode === 'pump' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minHeight: 36, fontSize: 12, padding: 6 }}
              >
                {getTranslation(lang, 'byPump')}
              </button>
              <button
                onClick={() => setCalcMode('depth')}
                className={`btn-tap ${calcMode === 'depth' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minHeight: 36, fontSize: 12, padding: 6 }}
              >
                {getTranslation(lang, 'byFlood')}
              </button>
            </div>

            {calcMode === 'pump' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>{getTranslation(lang, 'pumpSize')}</label>
                  <select
                    className="form-select"
                    value={pumpHP}
                    onChange={(e) => setPumpHP(parseFloat(e.target.value))}
                    style={{ height: 42 }}
                  >
                    <option value={3}>3 HP (~24 KL/hr)</option>
                    <option value={5}>5 HP (~40 KL/hr)</option>
                    <option value={7.5}>7.5 HP (~60 KL/hr)</option>
                    <option value={10}>10 HP (~80 KL/hr)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>{getTranslation(lang, 'pumpHours')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={pumpHours}
                    onChange={(e) => setPumpHours(parseInt(e.target.value) || 0)}
                    style={{ height: 42 }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>{getTranslation(lang, 'irrigationCount')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={irrigationsCount}
                    onChange={(e) => setIrrigationsCount(parseInt(e.target.value) || 0)}
                    style={{ height: 42 }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>{getTranslation(lang, 'irrigationDepth')}</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={depthInches}
                    onChange={(e) => setDepthInches(parseFloat(e.target.value) || 0)}
                    style={{ height: 42 }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--water)' }}>
                = {calcMode === 'pump' ? pumpToKL(pumpHP, pumpHours) : floodIrrigationToKL(irrigationsCount, depthInches, landAcres)} KL
              </span>
              <button
                onClick={handleApplyCalculatedWater}
                className="btn-tap btn-primary"
                style={{ minHeight: 38, padding: '6px 14px', fontSize: 12 }}
              >
                {getTranslation(lang, 'useCalculatedWater')}
              </button>
            </div>
          </div>
        )}

        {/* Rain-Aware Planning (Open-Meteo Integration) */}
        {weatherData && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#e0f2fe',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CloudRain size={22} color="#0284c7" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                  {lang === 'hi' ? 'मौसम पूर्वानुमान (Open-Meteo)' : 'Rain-Aware Planning (Open-Meteo)'}
                </div>
                <div style={{ fontSize: 11, color: '#0284c7' }}>
                  {weatherData.district}: {weatherData.totalRainMM} mm {lang === 'hi' ? 'बारिश अनुमानित (~' + (weatherData.rainAdjustment?.rainCreditKL || 0) + ' KL पानी बचत)' : 'rain forecast (~' + (weatherData.rainAdjustment?.rainCreditKL || 0) + ' KL saved)'}
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
              <input
                type="checkbox"
                checked={applyRainCredit}
                onChange={(e) => setApplyRainCredit(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#0284c7' }}
              />
              <span>{lang === 'hi' ? 'घटाएं' : 'Apply'}</span>
            </label>
          </div>
        )}
      </div>

      {/* 2. Water-Budget Optimizer (Linear Program) */}
      <div className="ui-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="ui-card-header">
          <div>
            <h3 className="card-title" style={{ color: '#166534' }}>
              <Sliders size={20} color="#16a34a" />
              <span>{getTranslation(lang, 'waterSliderTitle')}</span>
            </h3>
            <p style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
              {lang === 'hi' ? 'पानी कम या ज्यादा होने पर मुनाफा और बुवाई क्षेत्र' : 'Linear program maximizing profit subject to water and 50% max crop land'}
            </p>
          </div>
          <span className="badge badge-verified" style={{ fontSize: 12 }}>
            {sliderPct >= 0 ? `+${sliderPct}%` : `${sliderPct}%`}
          </span>
        </div>

        {/* Interactive Slider */}
        <div style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>
            <span>-50% ({Math.round(waterBudgetKL * 0.5)} KL)</span>
            <span style={{ background: '#ffffff', padding: '2px 8px', borderRadius: 99, border: '1px solid #86efac' }}>
              {finalBudgetForOpt.toLocaleString()} KL
            </span>
            <span>+20% ({Math.round(waterBudgetKL * 1.2)} KL)</span>
          </div>
          <input
            type="range"
            min="-50"
            max="20"
            step="5"
            value={sliderPct}
            onChange={(e) => setSliderPct(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: 12,
              accentColor: '#16a34a',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Optimizer Result Metrics */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            border: '1.5px solid #86efac',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 12
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {getTranslation(lang, 'expectedProfit')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d', lineHeight: 1.2 }}>
              ₹{optimization.expectedProfit.toLocaleString('en-IN')}
            </div>
            {sliderPct !== 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: sliderPct < 0 ? '#b91c1c' : '#15803d' }}>
                {sliderPct < 0 ? `-${Math.abs(Math.round(((184078 - optimization.expectedProfit) / 184078) * 100))}% vs 6,000 KL` : `+${Math.round(((optimization.expectedProfit - 184078) / 184078) * 100)}%`}
              </span>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {getTranslation(lang, 'fallowLand')}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: optimization.fallowLand > 0 ? '#b45309' : '#0f172a', lineHeight: 1.2 }}>
              {optimization.fallowLand} {getTranslation(lang, 'acres')}
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {lang === 'hi' ? 'प्रयुक्त पानी:' : 'Water used:'} {optimization.totalWaterUsed.toLocaleString()} KL
            </span>
          </div>
        </div>

        {/* Recommended Mix Badges */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>
            {getTranslation(lang, 'recommendedMix')}:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {optimization.allocations
              .filter((a) => a.acres > 0)
              .map((a) => (
                <div
                  key={a.cropId}
                  style={{
                    background: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: var_radius_sm,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #dcfce7'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🌱</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {getCropDisplayName(SEED_CROPS.find((c) => c.id === a.cropId), lang)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: '#15803d', fontSize: 14 }}>
                      {a.acres} {getTranslation(lang, 'acres')}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>
                      ({a.waterUsedKL.toLocaleString()} KL)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="honest-notice" style={{ marginTop: 8 }}>
          ℹ️ {getTranslation(lang, 'advisoryNote')}
        </div>
      </div>

      {/* 3. Crop Ranking by Rs/KL */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
            {getTranslation(lang, 'rankCropsTitle')}
          </h3>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            ICAR / Agmarknet (Oct 2026)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rankedCrops.map((crop, index) => {
            const isTop = index === 0;
            return (
              <div
                key={crop.id}
                className="ui-card"
                style={{
                  padding: 12,
                  borderLeft: isTop ? '5px solid #16a34a' : '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedCropForStress(crop)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: isTop ? '#16a34a' : '#e2e8f0',
                          color: isTop ? '#ffffff' : '#475569',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800
                        }}
                      >
                        #{index + 1}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>
                        {getCropDisplayName(crop, lang)}
                      </span>
                      {isTop && (
                        <span className="badge badge-gold" style={{ fontSize: 10, padding: '2px 6px' }}>
                          ★ Top
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      {crop.yieldQtlPerAcre} qtl/acre • {crop.waterKlPerAcre} KL water • ₹{crop.conservativePrice}/qtl
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d' }}>
                      ₹{crop.rsPerKl}{' '}
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                        {getTranslation(lang, 'rsPerKl')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                      <span
                        className={`badge ${
                          crop.volatilityBadge === 'Low' ? 'badge-verified' : crop.volatilityBadge === 'High' ? 'badge-bronze' : 'badge-gold'
                        }`}
                        style={{ fontSize: 10, padding: '1px 6px' }}
                      >
                        {crop.volatilityBadge} Volatility
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid #f1f5f9',
                    fontSize: 11,
                    color: '#64748b'
                  }}
                >
                  <span>
                    {getTranslation(lang, 'profitPerAcre')}: <strong>₹{crop.profitPerAcre.toLocaleString('en-IN')}</strong>
                  </span>
                  <span style={{ color: 'var(--water)', fontWeight: 700 }}>
                    🔍 {lang === 'hi' ? 'भाव गिरावट टेस्ट' : 'Stress test'} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Stress-Test & Break-even Modal */}
      {selectedCropForStress && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)'
          }}
          onClick={() => setSelectedCropForStress(null)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                {getCropDisplayName(selectedCropForStress, lang)} - {getTranslation(lang, 'stressTestTitle')}
              </h3>
              <button
                onClick={() => setSelectedCropForStress(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: var_radius_md, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{getTranslation(lang, 'breakEven')}:</span>
                <strong style={{ color: '#0f172a' }}>₹{selectedCropForStress.breakEvenPrice} / qtl</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>{getTranslation(lang, 'conservativePrice')}:</span>
                <strong style={{ color: '#15803d' }}>₹{selectedCropForStress.conservativePrice} / qtl</strong>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                {getTranslation(lang, 'priceFall')} -{stressDropPct}%
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={stressDropPct}
                onChange={(e) => setStressDropPct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#d97706', height: 10 }}
              />
            </div>

            {(() => {
              const stress = calculateStressTest(selectedCropForStress, stressDropPct);
              return (
                <div
                  style={{
                    background: stress.isProfitable ? '#f0fdf4' : '#fef2f2',
                    padding: 14,
                    borderRadius: var_radius_md,
                    border: `1px solid ${stress.isProfitable ? '#bbf7d0' : '#fecaca'}`
                  }}
                >
                  <div style={{ fontSize: 12, color: stress.isProfitable ? '#166534' : '#991b1b', fontWeight: 600 }}>
                    {getTranslation(lang, 'profitAfterDrop')}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: stress.isProfitable ? '#15803d' : '#dc2626' }}>
                    ₹{stress.newProfit.toLocaleString('en-IN')}{' '}
                    <span style={{ fontSize: 12 }}>/ acre</span>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4, color: stress.isProfitable ? '#15803d' : '#b91c1c' }}>
                    {stress.isProfitable
                      ? `✓ ${getTranslation(lang, 'aboveBreakEven')} (+₹${stress.marginAboveBreakEven}/qtl)`
                      : '⚠️ भाव लागत से नीचे आ गया है!'}
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setSelectedCropForStress(null)}
              className="btn-tap btn-primary"
              style={{ width: '100%', marginTop: 14 }}
            >
              {lang === 'hi' ? 'समझ गए' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const var_radius_sm = 'var(--radius-sm)';
const var_radius_md = 'var(--radius-md)';
