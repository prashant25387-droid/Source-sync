import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Globe,
  Droplets,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Key,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';
import { SEED_FARMER } from '../data/seedData.js';

export function ProfileTab({
  lang,
  setLang,
  farmer,
  onUpdateFarmer,
  onVerifyPassport,
  passportData,
  onResetDemo
}) {
  const [phone, setPhone] = useState(farmer?.phone || '9876543210');
  const [name, setName] = useState(farmer?.name || 'Ramesh Patel');
  const [village, setVillage] = useState(farmer?.village || 'Pimpalgaon Baswant');
  const [district, setDistrict] = useState(farmer?.district || 'Nashik');
  const [landAcres, setLandAcres] = useState(farmer?.landAcres || 5);
  const [waterSource, setWaterSource] = useState(farmer?.waterSource || 'Tube-well (नलकूप)');
  const [pumpHp, setPumpHp] = useState(farmer?.pumpHp || 5);

  // OTP Login Flow state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [mockOtpHint, setMockOtpHint] = useState('');

  // Officer verification form state
  const [officerName, setOfficerName] = useState('Dr. A. K. Verma');
  const [verifierOrg, setVerifierOrg] = useState('KVK Nashik (ICAR)');
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Reminders
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetch('/api/reminders')
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((e) => console.log('Reminders notice:', e));
  }, []);

  const handleSendOtp = async () => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setIsOtpSent(true);
      setMockOtpHint(data.mockOtp || '1234');
      setOtpCode(data.mockOtp || '1234');
    } catch (e) {
      setIsOtpSent(true);
      setMockOtpHint('1234');
      setOtpCode('1234');
    }
  };

  const handleVerifyOtpAndSave = async (e) => {
    e.preventDefault();
    const updatedFarmer = {
      phone,
      name,
      village,
      district,
      landAcres: Number(landAcres),
      waterSource,
      pumpHp: Number(pumpHp),
      preferredLanguage: lang
    };

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedFarmer, otp: otpCode || '1234' })
      });
      const data = await res.json();
      if (data.farmer) {
        onUpdateFarmer(data.farmer);
      } else {
        onUpdateFarmer(updatedFarmer);
      }
    } catch (e) {
      onUpdateFarmer(updatedFarmer);
    }
    setIsOtpSent(false);
    alert(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक सुरक्षित की गई!' : 'Profile updated successfully!');
  };

  const handleOfficerVerify = async (e) => {
    e.preventDefault();
    if (onVerifyPassport) {
      await onVerifyPassport({ officerName, verifierOrg });
      setVerifySuccess(true);
      setTimeout(() => setVerifySuccess(false), 3000);
    }
  };

  return (
    <div className="tab-content">
      {/* 1. Farmer Account Profile Form */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="card-title">
            <User size={20} color="var(--primary)" />
            <span>{lang === 'hi' ? 'किसान खाता और प्रोफ़ाइल' : 'Farmer Profile & Account'}</span>
          </h2>
          <span className="badge badge-verified">
            {lang === 'hi' ? 'सक्रिय खाता' : 'Active'}
          </span>
        </div>

        <form onSubmit={handleVerifyOtpAndSave}>
          <div className="form-group">
            <label className="form-label">
              <Phone size={15} />
              <span>{lang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="tel"
                required
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                className="btn-tap btn-secondary"
                style={{ minHeight: 44, padding: '6px 12px', fontSize: 13, whiteSpace: 'nowrap' }}
              >
                <Key size={14} />
                <span>{lang === 'hi' ? 'OTP भेजें' : 'Get OTP'}</span>
              </button>
            </div>
            {isOtpSent && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                ✓ OTP sent! For quick testing, OTP is: <strong>{mockOtpHint}</strong>
              </div>
            )}
          </div>

          {isOtpSent && (
            <div className="form-group" style={{ background: '#f0fdf4', padding: 10, borderRadius: 'var(--radius-sm)' }}>
              <label className="form-label">Enter OTP Code</label>
              <input
                type="text"
                className="form-input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 1234"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{lang === 'hi' ? 'किसान का पूरा नाम' : 'Full Name'}</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'hi' ? 'गाँव' : 'Village'}</label>
              <input
                type="text"
                className="form-input"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'hi' ? 'ज़िला' : 'District'}</label>
              <select
                className="form-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="Nashik">Nashik (नासिक)</option>
                <option value="Indore">Indore (इंदौर)</option>
                <option value="Karnal">Karnal (करनाल)</option>
                <option value="Jaipur">Jaipur (जयपुर)</option>
                <option value="Pune">Pune (पुणे)</option>
                <option value="Varanasi">Varanasi (वाराणसी)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'hi' ? 'कुल ज़मीन (एकड़)' : 'Land (Acres)'}</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={landAcres}
                onChange={(e) => setLandAcres(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'hi' ? 'पंप क्षमता (HP)' : 'Pump (HP)'}</label>
              <input
                type="number"
                className="form-input"
                value={pumpHp}
                onChange={(e) => setPumpHp(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{lang === 'hi' ? 'मुख्य पानी का स्रोत' : 'Water Source'}</label>
            <select
              className="form-select"
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value)}
            >
              <option value="Tube-well">Tube-well / Borewell (नलकूप / बोरवेल)</option>
              <option value="Canal">Canal (नहर / नहर सिंचाई)</option>
              <option value="Farm Pond">Farm Pond / Talab (खेत तलाब)</option>
              <option value="Drip">Drip Irrigation (ड्रिप / टपक)</option>
              <option value="Rainfed">Rain-fed (वर्षा आधारित)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-tap btn-primary"
            style={{ width: '100%', marginTop: 8, minHeight: 48 }}
          >
            {lang === 'hi' ? 'प्रोफ़ाइल सुरक्षित करें' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* 2. Reminders & Nudges */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="card-title" style={{ fontSize: 15 }}>
            <Bell size={18} color="var(--primary)" />
            <span>{lang === 'hi' ? 'समय पर अलर्ट और सलाह' : 'Farm Nudges & Alerts'}</span>
          </h3>
          <span className="badge badge-gold" style={{ fontSize: 11 }}>
            {reminders.length} Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reminders.map((rem) => (
            <div
              key={rem.id}
              style={{
                padding: 10,
                borderRadius: 'var(--radius-sm)',
                background: rem.type === 'irrigation' ? '#e0f2fe' : '#fef3c7',
                border: `1px solid ${rem.type === 'irrigation' ? '#bae6fd' : '#fde68a'}`,
                fontSize: 13
              }}
            >
              <div style={{ fontWeight: 700, color: rem.type === 'irrigation' ? '#0369a1' : '#92400e' }}>
                {lang === 'hi' ? rem.titleHi : rem.titleEn}
              </div>
              <p style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                {lang === 'hi' ? rem.bodyHi : rem.bodyEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FPO / KVK Field Verification Role (Phase 2) */}
      <div className="ui-card" style={{ border: '1.5px solid #16a34a', background: '#f0fdf4' }}>
        <div className="ui-card-header">
          <h3 className="card-title" style={{ fontSize: 15, color: '#166534' }}>
            <ShieldCheck size={18} color="#16a34a" />
            <span>{lang === 'hi' ? 'FPO / KVK सत्यापन अधिकारी' : 'FPO / KVK Verification Role'}</span>
          </h3>
          {passportData?.verifiedBy ? (
            <span className="badge badge-verified">Verified</span>
          ) : (
            <span className="badge badge-silver">Pending Field Check</span>
          )}
        </div>

        <p style={{ fontSize: 12, color: '#15803d', marginBottom: 12 }}>
          {lang === 'hi'
            ? 'कृषि विज्ञान केंद्र (KVK) या FPO अधिकारी खेत का मुआयना करके पासपोर्ट को आधिकारिक रूप से सत्यापित कर सकते हैं।'
            : 'Authorized KVK agronomist or FPO inspector can attest this Crop Passport after field inspection.'}
        </p>

        {passportData?.verifiedBy ? (
          <div
            style={{
              padding: 12,
              background: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #86efac'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', fontWeight: 800 }}>
              <CheckCircle2 size={18} />
              <span>{lang === 'hi' ? 'सत्यापित पासपोर्ट' : 'Field-Verified Passport'}</span>
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              Officer: <strong>{passportData.verifiedBy}</strong> ({passportData.verifierOrg || 'KVK Nashik'})
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Date: {passportData.verifiedAt || '18 Oct 2026'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleOfficerVerify}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12 }}>
                {lang === 'hi' ? 'अधिकारी का नाम' : 'Officer Name'}
              </label>
              <input
                type="text"
                className="form-input"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12 }}>
                {lang === 'hi' ? 'संस्था (KVK / FPO)' : 'Institution'}
              </label>
              <input
                type="text"
                className="form-input"
                value={verifierOrg}
                onChange={(e) => setVerifierOrg(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-tap btn-primary"
              style={{ width: '100%', minHeight: 44, fontSize: 14 }}
            >
              <ShieldCheck size={16} />
              <span>{lang === 'hi' ? 'फील्ड सत्यापित करें (Mark Field-Verified)' : 'Mark Field-Verified'}</span>
            </button>
          </form>
        )}
      </div>

      {/* 4. Reset Demo Data Button */}
      <div style={{ textAlign: 'center', marginTop: 10, padding: 8 }}>
        <button
          onClick={onResetDemo}
          className="btn-tap btn-secondary"
          style={{ minHeight: 38, padding: '4px 16px', fontSize: 12, color: '#64748b' }}
        >
          <RotateCcw size={14} />
          <span>{lang === 'hi' ? 'डेमो डेटा रीसेट करें (Reset to Seed)' : 'Reset Demo to Seed State'}</span>
        </button>
      </div>
    </div>
  );
}
