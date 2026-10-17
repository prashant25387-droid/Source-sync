import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Share2,
  Download,
  Eye,
  EyeOff,
  ShieldCheck,
  Award,
  Check,
  Send,
  Lock,
  Printer
} from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';
import { SEED_PASSPORT_METRICS } from '../data/seedData.js';

export function CardTab({ lang, passportData, farmerName }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isPublic, setIsPublic] = useState(passportData?.isPublic !== false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const passportId = passportData?.id || SEED_PASSPORT_METRICS.id;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const qrUrl = `${currentOrigin}/?passport=${passportId}`;

  useEffect(() => {
    QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.log('QR generation notice:', err));
  }, [qrUrl]);

  const toggleVisibility = async () => {
    const nextState = !isPublic;
    setIsPublic(nextState);
    try {
      await fetch(`/api/passports/${passportId}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: nextState })
      });
    } catch (e) {
      console.log('Visibility update notice:', e);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `🌾 फसलसेतु क्रॉप पासपोर्ट (FasalSetu Crop Passport)\nकिसान: ${farmerName || 'Ramesh Patel'}\nफसल: टमाटर (Tomato)\nपासपोर्ट स्कोर: ${passportData?.score || 83} (${passportData?.grade || 'Gold'})\nपारदर्शी सीजन रिकॉर्ड देखने के लिए लिंक खोलें:\n${qrUrl}`
  );

  const smsMessage = encodeURIComponent(
    `FasalSetu Crop Passport: Farmer ${farmerName || 'Ramesh Patel'}, Tomato. Score ${passportData?.score || 83} (${passportData?.grade || 'Gold'}). View live records: ${qrUrl}`
  );

  const handlePrintCard = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tab-content">
      {/* 1. Passport Card (Printable / Shareable) */}
      <div
        className="ui-card"
        id="passport-card-print"
        style={{
          border: '2px solid #16a34a',
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 30%)',
          padding: 20,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: '#15803d',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16
              }}
            >
              FS
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d' }}>FasalSetu</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>CROP PASSPORT CARD</div>
            </div>
          </div>

          <span
            className={`badge ${
              passportData?.grade === 'Gold' ? 'badge-gold' : passportData?.grade === 'Silver' ? 'badge-silver' : 'badge-bronze'
            }`}
            style={{ fontSize: 13, padding: '4px 12px' }}
          >
            <Award size={15} />
            <span>{passportData?.grade || 'Gold'}</span>
          </span>
        </div>

        {/* QR Code Centerpiece */}
        <div style={{ textAlign: 'center', margin: '14px 0' }}>
          {qrDataUrl ? (
            <div
              style={{
                display: 'inline-block',
                padding: 10,
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)'
              }}
            >
              <img src={qrDataUrl} alt="Crop Passport QR" style={{ width: 180, height: 180, display: 'block' }} />
            </div>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              QR Code generating...
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {passportId}
          </div>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 2, padding: '0 12px' }}>
            {getTranslation(lang, 'scanToVerify')}
          </p>
        </div>

        {/* Farmer & Crop Details */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            padding: 12,
            border: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            fontSize: 12
          }}
        >
          <div>
            <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'किसान का नाम' : 'Farmer'}</span>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{farmerName || 'Ramesh Patel'}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'फसल' : 'Crop'}</span>
            <div style={{ fontWeight: 700, fontSize: 13 }}>टमाटर (Tomato) • 2.46 {getTranslation(lang, 'acres')}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'जिला / राज्य' : 'Location'}</span>
            <div style={{ fontWeight: 700 }}>Nashik, MH</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>{lang === 'hi' ? 'पासपोर्ट स्कोर' : 'Score'}</span>
            <div style={{ fontWeight: 800, color: '#15803d', fontSize: 14 }}>
              {passportData?.score || 83} / 100
            </div>
          </div>
        </div>

        {passportData?.verifiedBy && (
          <div
            style={{
              marginTop: 10,
              padding: '6px 10px',
              background: '#dcfce7',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ShieldCheck size={14} />
            <span>Field-Verified by {passportData.verifiedBy}</span>
          </div>
        )}
      </div>

      {/* 2. Share Options (WhatsApp, SMS, Copy) */}
      <div className="ui-card">
        <h3 className="card-title" style={{ fontSize: 15, marginBottom: 12 }}>
          <Share2 size={18} color="var(--primary)" />
          <span>{lang === 'hi' ? 'खरीदारों को शेयर करें' : 'Share Passport'}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tap"
            style={{
              background: '#25d366',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700
            }}
          >
            <Send size={16} />
            <span>WhatsApp</span>
          </a>

          <a
            href={`sms:?body=${smsMessage}`}
            className="btn-tap btn-secondary"
            style={{ textDecoration: 'none', fontSize: 13 }}
          >
            <Share2 size={16} />
            <span>SMS Link</span>
          </a>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button
            onClick={handleCopyLink}
            className="btn-tap btn-secondary"
            style={{ flex: 1, fontSize: 13 }}
          >
            {copied ? <Check size={16} color="#16a34a" /> : <QrCode size={16} />}
            <span>{copied ? (lang === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (lang === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
          </button>

          <button
            onClick={handlePrintCard}
            className="btn-tap btn-secondary"
            style={{ flex: 1, fontSize: 13 }}
          >
            <Printer size={16} />
            <span>{getTranslation(lang, 'downloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* 3. Farmer Privacy Controls */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{getTranslation(lang, 'visibilityTitle')}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {isPublic ? getTranslation(lang, 'publicVisible') : getTranslation(lang, 'privateHidden')}
            </div>
          </div>

          <button
            onClick={toggleVisibility}
            className={`btn-tap ${isPublic ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minHeight: 40, padding: '6px 14px', fontSize: 13 }}
          >
            {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{isPublic ? (lang === 'hi' ? 'दिखाई दे रहा है' : 'Public') : (lang === 'hi' ? 'छिपा हुआ' : 'Hidden')}</span>
          </button>
        </div>

        <div className="honest-notice" style={{ marginTop: 12 }}>
          🔒 {getTranslation(lang, 'consentNote')}
        </div>
      </div>
    </div>
  );
}
