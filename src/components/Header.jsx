import React, { useState } from 'react';
import { Volume2, VolumeX, Globe, User, ShieldCheck, WifiOff } from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';

export function Header({
  lang,
  setLang,
  isSpeaking,
  onSpeakSummary,
  currentRole,
  setCurrentRole,
  isOnline,
  farmerName
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const languages = [
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' }
  ];

  return (
    <>
      {!isOnline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>{lang === 'hi' ? 'ऑफ़लाइन मोड - आपका डेटा सुरक्षित है' : 'Offline Mode - Data cached locally'}</span>
        </div>
      )}
      <header className="app-header">
        <div className="logo-badge">
          <div className="logo-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>{getTranslation(lang, 'appName')}</h1>
            <p>{getTranslation(lang, 'tagline')}</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Read Aloud / Listen Button */}
          <button
            onClick={onSpeakSummary}
            className={`btn-listen ${isSpeaking ? 'active' : ''}`}
            aria-label="Listen aloud"
            title="Listen aloud in your language"
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isSpeaking ? (lang === 'hi' ? 'रूकें' : 'Stop') : getTranslation(lang, 'listen')}</span>
          </button>

          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="btn-tap btn-secondary"
              style={{ minHeight: 38, minWidth: 38, padding: '6px 10px', borderRadius: '9999px', fontSize: 13 }}
              aria-label="Change language"
            >
              <Globe size={16} />
              <span style={{ fontWeight: 700 }}>{lang.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  zIndex: 60,
                  width: 170,
                  overflow: 'hidden'
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      background: lang === l.code ? 'var(--primary-light)' : 'transparent',
                      color: lang === l.code ? 'var(--primary-dark)' : 'var(--text-main)',
                      fontWeight: lang === l.code ? 800 : 500,
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'block',
                      fontSize: 14
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="btn-tap btn-secondary"
              style={{ minHeight: 38, minWidth: 38, padding: '6px 8px', borderRadius: '9999px', fontSize: 12 }}
              title="Switch user perspective"
            >
              {currentRole === 'officer' ? <ShieldCheck size={16} color="#15803d" /> : <User size={16} />}
              <span style={{ fontSize: 11, fontWeight: 700 }}>
                {currentRole === 'officer' ? 'KVK' : currentRole === 'buyer' ? 'Buyer' : 'Farmer'}
              </span>
            </button>

            {showRoleMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  zIndex: 60,
                  width: 210,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  SWITCH PERSPECTIVE
                </div>
                <button
                  onClick={() => { setCurrentRole('farmer'); setShowRoleMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: currentRole === 'farmer' ? 'var(--primary-light)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  🧑🌾 Farmer ({farmerName || 'Ramesh'})
                </button>
                <button
                  onClick={() => { setCurrentRole('buyer'); setShowRoleMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: currentRole === 'buyer' ? '#e0f2fe' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  🏢 Buyer View (QR page)
                </button>
                <button
                  onClick={() => { setCurrentRole('officer'); setShowRoleMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: currentRole === 'officer' ? '#dcfce7' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  🛡️ FPO / KVK Officer
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
