import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { PlanTab } from './components/PlanTab.jsx';
import { PassportTab } from './components/PassportTab.jsx';
import { BuyersTab } from './components/BuyersTab.jsx';
import { CardTab } from './components/CardTab.jsx';
import { ProfileTab } from './components/ProfileTab.jsx';
import { BuyerPublicView } from './components/BuyerPublicView.jsx';
import { SEED_FARMER, SEED_PASSPORT_METRICS, SEED_LOGS } from './data/seedData.js';

export default function App() {
  const [lang, setLang] = useState('hi'); // Hindi default
  const [activeTab, setActiveTab] = useState('plan');
  const [currentRole, setCurrentRole] = useState('farmer'); // 'farmer', 'buyer', 'officer'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Farmer & Passport state
  const [farmer, setFarmer] = useState(SEED_FARMER);
  const [passportData, setPassportData] = useState({
    ...SEED_PASSPORT_METRICS,
    score: 83,
    grade: 'Gold',
    breakdown: { waterDiscipline: 36.1, loggingConsistency: 24, cropCare: 13.3, planAdherence: 9.8 },
    totalUsedWater: 4600,
    logs: SEED_LOGS
  });

  // Check URL query params for ?passport=<ID> (Direct QR scan from buyer phone)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passportParam = params.get('passport');
    if (passportParam) {
      setCurrentRole('buyer');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial fetch from backend
    fetchPassportData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchPassportData = async () => {
    try {
      const res = await fetch(`/api/passports/${SEED_PASSPORT_METRICS.id}`);
      if (res.ok) {
        const data = await res.json();
        setPassportData(data);
      }
    } catch (e) {
      console.log('Using local seed passport state');
    }
  };

  // Add Log Handler
  const handleAddLog = async (newLog) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLog, passportId: passportData.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.passport) {
          setPassportData(data.passport);
          return;
        }
      }
    } catch (e) {
      console.log('Offline queue add log');
    }

    // Local state fallback
    const updatedLogs = [...passportData.logs, newLog];
    const newUsedWater = updatedLogs.reduce((sum, l) => sum + (Number(l.waterKL) || 0), 0);
    setPassportData((prev) => ({
      ...prev,
      totalUsedWater: newUsedWater,
      logs: updatedLogs
    }));
  };

  // Demo Action: Add +500 KL extra irrigation to drop score from 83 Gold to 74 Silver
  const handleQuickAdd500 = async () => {
    const demoLog = {
      id: `log_demo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'irrigation',
      waterKL: 500,
      condition: 'healthy',
      resolved: true,
      note: 'अतिरिक्त डेमो सिंचाई 500 KL (+500 KL Extra Demo Irrigation)',
      photoUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=400&q=80'
    };

    await handleAddLog(demoLog);
  };

  // Officer Verification Handler
  const handleVerifyPassport = async ({ officerName, verifierOrg }) => {
    try {
      const res = await fetch(`/api/passports/${passportData.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName, verifierOrg })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.passport) {
          setPassportData(data.passport);
        }
      }
    } catch (e) {
      setPassportData((prev) => ({
        ...prev,
        verifiedBy: officerName,
        verifiedAt: new Date().toISOString().split('T')[0],
        verifierOrg
      }));
    }
  };

  // Demo Reset Handler
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        await fetchPassportData();
        alert(lang === 'hi' ? 'डेमो डेटा रीसेट हो गया!' : 'Demo data reset to initial state!');
      }
    } catch (e) {
      window.location.reload();
    }
  };

  // Browser Speech Synthesis (Listen / सुनें)
  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'hi' ? 'आपके ब्राउज़र में आवाज़ सुविधा समर्थित नहीं है।' : 'Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    const currentScore = passportData.score || 83;
    const currentGrade = passportData.grade || 'Gold';

    if (activeTab === 'plan') {
      if (lang === 'hi') {
        speechText = `फसलसेतु योजना: 5 एकड़ जमीन और 6,000 किलोलीटर पानी के लिए सबसे ज्यादा मुनाफा देने वाली फसल चना 40.2 रुपये प्रति किलोलीटर और टमाटर 27.5 रुपये प्रति किलोलीटर है। कुल अनुमानित मुनाफा 1 लाख 84 हजार रुपये है।`;
      } else {
        speechText = `FasalSetu Plan: For 5 acres and 6,000 Kilo-litres of water, the top crops by water profit are Chana at 40.2 Rupees per KL, and Tomato at 27.5 Rupees per KL. Expected total profit is 1 lakh 84 thousand rupees.`;
      }
    } else if (activeTab === 'passport') {
      if (lang === 'hi') {
        speechText = `आपका क्रॉप पासपोर्ट स्कोर ${currentScore} है, श्रेणी ${currentGrade === 'Gold' ? 'स्वर्ण' : currentGrade === 'Silver' ? 'रजत' : 'कांस्य'}। जल अनुशासन 40 में से ${passportData.breakdown?.waterDiscipline || 36.1} है। टमाटर फसल के लिए कुल ${passportData.totalUsedWater?.toLocaleString()} किलोलीटर पानी उपयोग हुआ है।`;
      } else {
        speechText = `Your Crop Passport score is ${currentScore}, grade ${currentGrade}. Water discipline is ${passportData.breakdown?.waterDiscipline || 36.1} out of 40. Total water used is ${passportData.totalUsedWater?.toLocaleString()} Kilo-litres.`;
      }
    } else if (activeTab === 'buyers') {
      const prebooked = currentScore >= 80 ? '62.5' : '37.5';
      if (lang === 'hi') {
        speechText = `खरीदार मांग बोर्ड: टमाटर फसल पर ${prebooked} प्रतिशत मांग अग्रिम बुक हो चुकी है। आपके वर्तमान स्कोर ${currentScore} के आधार पर संस्थागत खरीदार सीधे खरीद के लिए पात्र हैं।`;
      } else {
        speechText = `Buyers Demand Board: ${prebooked} percent of tomato produce is pre-booked based on your current passport score of ${currentScore}.`;
      }
    } else if (activeTab === 'card') {
      if (lang === 'hi') {
        speechText = `आपका डिजिटल किसान पासपोर्ट कार्ड तैयार है। खरीदार इस क्यूआर कोड को स्कैन करके आपकी फसल का पूरा सीजन रिकॉर्ड लाइव देख सकते हैं।`;
      } else {
        speechText = `Your Digital Crop Passport card is ready. Buyers can scan this QR code to view your season-long farm records directly on their phone.`;
      }
    } else {
      speechText = lang === 'hi' ? `फसलसेतु: पानी से प्लानिंग, भरोसे से सेलिंग।` : `FasalSetu: Plan by water, prove with records, pre-sell before harvest.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="app-container">
      {/* App Header with Listen and Language switch */}
      <Header
        lang={lang}
        setLang={setLang}
        isSpeaking={isSpeaking}
        onSpeakSummary={handleSpeakSummary}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isOnline={isOnline}
        farmerName={farmer.name}
      />

      {/* Main View: If Buyer perspective or QR scanned, render BuyerPublicView */}
      {currentRole === 'buyer' ? (
        <BuyerPublicView
          lang={lang}
          passportId={passportData.id}
          onBackToFarmerView={() => setCurrentRole('farmer')}
        />
      ) : (
        <>
          {/* Active Tab Screen */}
          {activeTab === 'plan' && (
            <PlanTab
              lang={lang}
              onNavigateToPassport={() => setActiveTab('passport')}
            />
          )}

          {activeTab === 'passport' && (
            <PassportTab
              lang={lang}
              passportData={passportData}
              onAddLog={handleAddLog}
              onQuickAdd500={handleQuickAdd500}
            />
          )}

          {activeTab === 'buyers' && (
            <BuyersTab
              lang={lang}
              passportScore={passportData.score}
              passportGrade={passportData.grade}
              onNewDemandPosted={fetchPassportData}
            />
          )}

          {activeTab === 'card' && (
            <CardTab
              lang={lang}
              passportData={passportData}
              farmerName={farmer.name}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              lang={lang}
              setLang={setLang}
              farmer={farmer}
              onUpdateFarmer={setFarmer}
              onVerifyPassport={handleVerifyPassport}
              passportData={passportData}
              onResetDemo={handleResetDemo}
            />
          )}

          {/* Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            lang={lang}
          />
        </>
      )}
    </div>
  );
}
