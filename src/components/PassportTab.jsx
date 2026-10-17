import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Award,
  Droplets,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';
import { calculatePassportScore } from '../logic/scoring.js';
import { parseVoiceLog } from '../logic/voiceParser.js';
import { SEED_LOGS, SEED_PASSPORT_METRICS } from '../data/seedData.js';

export function PassportTab({ lang, passportData, onAddLog, onQuickAdd500 }) {
  const [logs, setLogs] = useState(passportData?.logs || SEED_LOGS);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Form state
  const [logType, setLogType] = useState('irrigation');
  const [waterKL, setWaterKL] = useState(500);
  const [cropCondition, setCropCondition] = useState('healthy');
  const [isResolved, setIsResolved] = useState(true);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const processAndSetImage = (file) => {
    if (!file) return;
    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark with date and authentication text
        ctx.fillStyle = 'rgba(15, 23, 42, 0.70)';
        ctx.fillRect(0, height - 34, width, 34);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        ctx.fillText(`🌾 FasalSetu • ${dateStr} • Farmer Photo Evidence`, 10, height - 12);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoUrl(dataUrl);
        setIsProcessingPhoto(false);
        if (!note) {
          setNote(lang === 'hi' ? 'खेत का फोटो प्रमाण (Photo Evidence)' : 'Farm photo evidence captured');
        }
        setShowAddLogModal(true);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
    e.target.value = '';
  };

  // Synchronize when passportData updates from parent/server
  useEffect(() => {
    if (passportData?.logs) {
      setLogs(passportData.logs);
    }
  }, [passportData]);

  // Compute live score from current logs
  const totalWaterUsed = logs.reduce((sum, l) => sum + (Number(l.waterKL) || 0), 0);
  const issuesCount = logs.filter((l) => l.condition === 'problem').length;
  const resolvedCount = logs.filter((l) => l.condition === 'problem' && l.resolved).length;

  const scoreResult = calculatePassportScore({
    plannedWater: passportData?.plannedWaterKL || 4386,
    usedWater: totalWaterUsed,
    logsDone: logs.length,
    issuesCount,
    resolvedCount,
    plannedAcres: passportData?.plannedAcres || 2.50,
    sownAcres: passportData?.sownAcres || 2.46
  });

  const { totalScore, grade, breakdown } = scoreResult;

  // Speech Recognition setup
  const handleStartListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Graceful fallback simulation if browser/hardware speech recognition is unavailable
      const samplePhrases = [
        'सिंचाई 500',
        'paani 2 hazar',
        'keeda laga, neem spray kiya',
        'फसल पूरी तरह स्वस्थ है',
        'सिंचाई 1000'
      ];
      const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
      setVoiceTranscript(randomPhrase);
      applyParsedVoice(randomPhrase);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        applyParsedVoice(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        // Fallback demo simulation
        const fallback = 'सिंचाई 500';
        setVoiceTranscript(fallback);
        applyParsedVoice(fallback);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
      const fallback = 'सिंचाई 500';
      setVoiceTranscript(fallback);
      applyParsedVoice(fallback);
    }
  };

  const applyParsedVoice = (transcript) => {
    const parsed = parseVoiceLog(transcript);
    if (parsed) {
      setLogType(parsed.type);
      if (parsed.waterKL > 0) setWaterKL(parsed.waterKL);
      setCropCondition(parsed.condition);
      setIsResolved(parsed.resolved);
      setNote(parsed.note);
    }
  };

  const handleSaveLog = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: logType,
      waterKL: logType === 'irrigation' ? Number(waterKL) || 0 : 0,
      condition: cropCondition,
      resolved: Boolean(isResolved),
      note: note || (logType === 'irrigation' ? `${waterKL} KL सिंचाई` : 'फसल निरीक्षण'),
      photoUrl: photoUrl || (cropCondition === 'healthy'
        ? 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=400&q=80')
    };

    onAddLog(newEntry);
    setShowAddLogModal(false);
    setVoiceTranscript('');
    setNote('');
  };

  // Photos for 3-column photo grid
  const photoLogs = logs.filter((l) => l.photoUrl);

  return (
    <div className="tab-content">
      {/* Native Camera input (directly launches camera on mobile / webcam) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageCapture}
        style={{ display: 'none' }}
      />
      {/* Photo Gallery / Files input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageCapture}
        style={{ display: 'none' }}
      />

      {/* 1. Big Score Circle & Grade Card */}
      <div className="ui-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
            ID: {passportData?.id || SEED_PASSPORT_METRICS.id}
          </span>
          {passportData?.verifiedBy ? (
            <span className="badge badge-verified">
              <ShieldCheck size={14} />
              <span>{getTranslation(lang, 'fieldVerifiedBadge')}</span>
            </span>
          ) : (
            <span className="badge badge-silver" style={{ fontSize: 11 }}>
              {getTranslation(lang, 'notVerifiedYet')}
            </span>
          )}
        </div>

        {/* Score Circle */}
        <div className={`score-circle ${grade.toLowerCase()}`}>
          <span className="score-num">{totalScore}</span>
          <span className="score-denom">/ 100</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <span
            className={`badge ${grade === 'Gold' ? 'badge-gold' : grade === 'Silver' ? 'badge-silver' : 'badge-bronze'}`}
            style={{ fontSize: 15, padding: '6px 16px' }}
          >
            <Award size={18} />
            <span>
              {grade === 'Gold' ? getTranslation(lang, 'gradeGold') : grade === 'Silver' ? getTranslation(lang, 'gradeSilver') : getTranslation(lang, 'gradeBronze')}
            </span>
          </span>
        </div>

        <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>
          <strong>{passportData?.cropHindiName || 'टमाटर'} (Tomato)</strong> • 2.46 {getTranslation(lang, 'acres')} • Nashik, MH
        </div>

        {/* Demo Quick Button to drop score to 74 */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
          <button
            onClick={onQuickAdd500}
            className="btn-tap btn-secondary"
            style={{
              width: '100%',
              minHeight: 44,
              borderColor: '#f59e0b',
              background: '#fffbeb',
              color: '#92400e',
              fontSize: 13,
              fontWeight: 700
            }}
          >
            <Droplets size={16} color="#d97706" />
            <span>{getTranslation(lang, 'quickAdd500')}</span>
            {totalScore === 83 && <span style={{ fontSize: 11, color: '#b45309' }}>→ 74 Silver</span>}
          </button>
        </div>
      </div>

      {/* 2. Score Breakdown Bars */}
      <div className="ui-card">
        <h3 className="card-title" style={{ fontSize: 16, marginBottom: 14 }}>
          <FileCheck size={18} color="var(--primary)" />
          <span>{getTranslation(lang, 'scoreBreakdown')}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Water Discipline /40 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span>{getTranslation(lang, 'waterDiscipline')}</span>
              <span style={{ color: '#0284c7' }}>{breakdown.waterDiscipline} / 40</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(breakdown.waterDiscipline / 40) * 100}%`,
                  background: breakdown.waterDiscipline >= 32 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : '#eab308'
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              {lang === 'hi' ? 'प्रयुक्त:' : 'Used:'} {totalWaterUsed.toLocaleString()} KL / {lang === 'hi' ? 'नियोजित:' : 'Planned:'} {(passportData?.plannedWaterKL || 4386).toLocaleString()} KL
            </div>
          </div>

          {/* Logging Consistency /30 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span>{getTranslation(lang, 'loggingConsistency')}</span>
              <span style={{ color: '#16a34a' }}>{breakdown.loggingConsistency} / 30</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${(breakdown.loggingConsistency / 30) * 100}%` }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              {logs.length} / 10 {lang === 'hi' ? 'रिकॉर्ड दर्ज' : 'logs completed'}
            </div>
          </div>

          {/* Crop Care /20 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span>{getTranslation(lang, 'cropCare')}</span>
              <span style={{ color: '#15803d' }}>{breakdown.cropCare} / 20</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${(breakdown.cropCare / 20) * 100}%` }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              {resolvedCount} / {issuesCount} {lang === 'hi' ? 'कीट/रोग का समाधान' : 'issues resolved'}
            </div>
          </div>

          {/* Plan Adherence /10 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span>{getTranslation(lang, 'planAdherence')}</span>
              <span style={{ color: '#15803d' }}>{breakdown.planAdherence} / 10</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${(breakdown.planAdherence / 10) * 100}%` }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              {passportData?.sownAcres || 2.46} / {passportData?.plannedAcres || 2.50} {getTranslation(lang, 'acres')} {lang === 'hi' ? 'बोया गया' : 'sown'}
            </div>
          </div>
        </div>

        <div className="honest-notice" style={{ marginTop: 12 }}>
          ℹ️ {getTranslation(lang, 'farmerLoggedNote')}
        </div>
      </div>

      {/* 3. Action Button: Add Farm Log (Voice / Manual) */}
      <button
        onClick={() => setShowAddLogModal(true)}
        className="btn-tap btn-primary"
        style={{ width: '100%', fontSize: 16, boxShadow: 'var(--shadow-md)' }}
      >
        <PlusCircle size={20} />
        <span>{getTranslation(lang, 'addLogTitle')}</span>
      </button>

      {/* 4. Photo Evidence Gallery (3-Column Grid) */}
      <div className="ui-card">
        <div className="ui-card-header">
          <div>
            <h3 className="card-title" style={{ fontSize: 15 }}>
              <Camera size={18} color="var(--primary)" />
              <span>{getTranslation(lang, 'photoEvidenceTitle')}</span>
            </h3>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {photoLogs.length} {lang === 'hi' ? 'फोटो प्रमाण उपलब्ध' : 'photos recorded'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="btn-tap btn-primary"
              style={{ minHeight: 36, padding: '4px 12px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
              title="Take Photo with Camera"
            >
              <Camera size={14} />
              <span>{lang === 'hi' ? 'कैमरा' : 'Camera'}</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="btn-tap btn-secondary"
              style={{ minHeight: 36, padding: '4px 10px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
              title="Upload from Gallery"
            >
              <ImageIcon size={14} />
              <span>{lang === 'hi' ? 'गैलरी' : 'Gallery'}</span>
            </button>
          </div>
        </div>

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

      {/* 5. Season Timeline Table */}
      <div className="ui-card">
        <h3 className="card-title" style={{ fontSize: 15, marginBottom: 12 }}>
          <Calendar size={18} color="var(--water)" />
          <span>{getTranslation(lang, 'timelineTitle')}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: '#f8fafc',
                border: '1px solid var(--border)',
                fontSize: 13
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 16, marginTop: 2 }}>
                  {log.type === 'irrigation' ? '💧' : log.type === 'sowing' ? '🌱' : '🔍'}
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.note}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {log.date} • {log.waterKL > 0 ? `${log.waterKL} KL` : (log.condition === 'healthy' ? 'स्वस्थ' : 'समस्या')}
                  </div>
                </div>
              </div>

              <div>
                {log.condition === 'healthy' || log.resolved ? (
                  <CheckCircle2 size={16} color="#16a34a" />
                ) : (
                  <AlertCircle size={16} color="#ef4444" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Log Modal (Speech recognition + confirmation) */}
      {showAddLogModal && (
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
          onClick={() => setShowAddLogModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>{getTranslation(lang, 'addLogTitle')}</h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Mic Spoken Section */}
            <div
              style={{
                background: '#fef3c7',
                border: '1.5px dashed #f59e0b',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                textAlign: 'center',
                marginBottom: 16
              }}
            >
              <button
                onClick={handleStartListening}
                className={`btn-tap ${isListening ? 'btn-water' : 'btn-primary'}`}
                style={{
                  borderRadius: 'var(--radius-full)',
                  margin: '0 auto',
                  padding: '8px 20px',
                  background: isListening ? '#0284c7' : '#d97706'
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isListening ? getTranslation(lang, 'listening') : getTranslation(lang, 'speakLog')}</span>
              </button>

              {voiceTranscript && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                  "{voiceTranscript}" → {lang === 'hi' ? 'फॉर्म नीचे भर गया है' : 'Form pre-filled below'}
                </div>
              )}
            </div>

            {/* Structured Form with Confirmation */}
            <form onSubmit={handleSaveLog}>
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'logType')}</label>
                <select
                  className="form-select"
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                >
                  <option value="irrigation">{getTranslation(lang, 'typeIrrigation')}</option>
                  <option value="crop_check">{getTranslation(lang, 'typeCropCheck')}</option>
                  <option value="sowing">{getTranslation(lang, 'typeSowing')}</option>
                </select>
              </div>

              {logType === 'irrigation' && (
                <div className="form-group">
                  <label className="form-label">{getTranslation(lang, 'waterAddedKL')}</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    className="form-input"
                    value={waterKL}
                    onChange={(e) => setWaterKL(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'cropCondition')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setCropCondition('healthy'); setIsResolved(true); }}
                    className={`btn-tap ${cropCondition === 'healthy' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minHeight: 44, fontSize: 13 }}
                  >
                    ✓ {getTranslation(lang, 'conditionHealthy')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCropCondition('problem'); }}
                    className={`btn-tap ${cropCondition === 'problem' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minHeight: 44, fontSize: 13, background: cropCondition === 'problem' ? '#dc2626' : undefined }}
                  >
                    ⚠️ {getTranslation(lang, 'conditionProblem')}
                  </button>
                </div>
              </div>

              {cropCondition === 'problem' && (
                <div className="form-group">
                  <label className="form-label">{getTranslation(lang, 'resolvedStatus')}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setIsResolved(true)}
                      className={`btn-tap ${isResolved ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ minHeight: 44, fontSize: 13 }}
                    >
                      {getTranslation(lang, 'yesResolved')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResolved(false)}
                      className={`btn-tap ${!isResolved ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ minHeight: 44, fontSize: 13, background: !isResolved ? '#f59e0b' : undefined }}
                    >
                      {getTranslation(lang, 'noPending')}
                    </button>
                  </div>
                </div>
              )}

              {/* Camera & Photo Evidence Section */}
              <div
                className="form-group"
                style={{
                  background: '#f8fafc',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px dashed var(--border-strong)',
                  marginBottom: 14
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    <Camera size={16} color="var(--primary)" />
                    <span>{getTranslation(lang, 'cropPhotoTitle')}</span>
                  </label>
                  {photoUrl && (
                    <span className="badge badge-verified" style={{ fontSize: 11 }}>
                      ✓ {lang === 'hi' ? 'फोटो संलग्न' : 'Photo Attached'}
                    </span>
                  )}
                </div>

                {photoUrl ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img
                      src={photoUrl}
                      alt="Crop Evidence"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="btn-tap"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(220, 38, 38, 0.88)',
                        color: '#ffffff',
                        minHeight: 32,
                        minWidth: 32,
                        padding: '4px 10px',
                        fontSize: 11,
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>{getTranslation(lang, 'removePhoto')}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                      {lang === 'hi'
                        ? 'अपने मोबाइल कैमरे से फसल की स्थिति का सीधा फोटो प्रमाण अपलोड करें:'
                        : 'Upload photo-backed evidence of your field directly using phone camera:'}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="btn-tap btn-primary"
                        style={{ minHeight: 46, fontSize: 13, padding: '8px 10px' }}
                      >
                        <Camera size={18} />
                        <span>{getTranslation(lang, 'takePhoto')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="btn-tap btn-secondary"
                        style={{ minHeight: 46, fontSize: 13, padding: '8px 10px' }}
                      >
                        <ImageIcon size={18} />
                        <span>{getTranslation(lang, 'chooseGallery')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {isProcessingPhoto && (
                  <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 8, fontWeight: 700 }}>
                    ⏳ {lang === 'hi' ? 'फोटो कंप्रेस व प्रोसेस हो रही है...' : 'Processing and compressing photo...'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'noteOrAction')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={lang === 'hi' ? 'उदा: 500 KL पानी दिया, नीम का तेल छिड़का' : 'e.g. Applied 500 KL, sprayed neem oil'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-tap btn-primary"
                style={{ width: '100%', marginTop: 12, minHeight: 48, fontSize: 16 }}
              >
                {getTranslation(lang, 'saveLog')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
