import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Calendar,
  Clock,
  Mic,
  MicOff,
  Sprout,
  Bug,
  ShieldCheck,
  Wrench,
  CloudRain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  Wifi,
  WifiOff,
  RefreshCw,
  Volume2,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { offlineQueueService } from '../../services/offlineQueueService';
import { speechRecognitionService } from '../../services/speechRecognitionService';
import { parseSpokenFarmLog, convertToKL, ParsedFarmLogResult } from '../../services/speechParserService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ActivityType, CropRecord, CropLog } from '../../types';
import { VoiceGuidance } from '../../components/common/VoiceGuidance';

interface FarmHistoryPageProps {
  navigate: (path: string) => void;
}

const COMMON_FARM_PHRASES = [
  { text: 'आज 2 घंटे ट्यूबवेल चलाया', icon: '💧', labelHi: '2 घंटे ट्यूबवेल (60 KL)', labelEn: '2 hrs tubewell (60 KL)' },
  { text: '500 KL पानी दिया ड्रिप से', icon: '💧', labelHi: '500 KL ड्रिप पानी', labelEn: '500 KL drip irrigation' },
  { text: 'सिंचाई 500', icon: '❓', labelHi: 'सिंचाई 500 (इकाई पूछें)', labelEn: 'Irrigation 500 (clarify unit)' },
  { text: 'एक बोरी यूरिया खाद डाली', icon: '🌾', labelHi: 'यूरिया खाद दी', labelEn: 'Urea fertilizer applied' },
  { text: 'कीड़े लगे थे, नीम का स्प्रे किया', icon: '🐛', labelHi: 'नीम स्प्रे (कीट नियंत्रण)', labelEn: 'Neem spray for pests' },
  { text: 'खेत में तेज बारिश हुई', icon: '🌧️', labelHi: 'बारिश दर्ज करें', labelEn: 'Record rainfall' },
  { text: 'निराई-गुड़ाई और खरपतवार निकाली', icon: '🚜', labelHi: 'निराई-गुड़ाई कार्य', labelEn: 'Weeding / Maintenance' },
];

export const FarmHistoryPage: React.FC<FarmHistoryPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const crops = dataService.getCrops();
  const [selectedCropId, setSelectedCropId] = useState<string>(() => {
    return crops.length > 0 ? crops[0].id : '';
  });

  const selectedCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  // Network & Offline Queue State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'Irrigation' | 'Fertilizer' | 'Pest' | 'Rain'>('all');

  // Speech Recognition & Parser State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedFarmLogResult | null>(null);
  const [waterCalculationExplanation, setWaterCalculationExplanation] = useState<string>('');

  // Disambiguation state
  const [showDisambiguation, setShowDisambiguation] = useState<boolean>(false);
  const [disambiguationNumber, setDisambiguationNumber] = useState<number>(0);

  // Manual fallback inputs
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  const [manualType, setManualType] = useState<ActivityType>('Irrigation');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [manualWaterKL, setManualWaterKL] = useState<number | ''>(60);
  const [manualDescription, setManualDescription] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Subscribe to network and offline queue
  useEffect(() => {
    const unsubscribe = offlineQueueService.subscribe((online, count) => {
      setIsOnline(online);
      setPendingQueueCount(count);
    });

    return () => {
      unsubscribe();
      if (speechRecognitionService.checkSupport()) {
        speechRecognitionService.stop();
      }
    };
  }, []);

  // Fetch logs for current crop
  const logs = selectedCrop ? dataService.getLogs(selectedCrop.id) : [];

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Irrigation') return log.activityType === 'Irrigation';
    if (activeFilter === 'Fertilizer') return log.activityType === 'Fertilizer Application';
    if (activeFilter === 'Pest') return log.activityType === 'Pest / Disease Observation' || log.activityType === 'Pest Control Action';
    if (activeFilter === 'Rain') return log.description.toLowerCase().includes('barish') || log.description.toLowerCase().includes('बारिश') || log.description.toLowerCase().includes('rain');
    return true;
  });

  // Calculate Cumulative Water Meter
  const totalWaterUsedKL = logs
    .filter(l => l.activityType === 'Irrigation' && typeof l.waterVolumeKL === 'number')
    .reduce((sum, l) => sum + (l.waterVolumeKL || 0), 0);

  // Baseline seasonal water budget (e.g. 1,000 - 1,200 KL per acre for Tomato, 600 KL for pulses)
  const indicativeWaterBudgetKL = selectedCrop
    ? Math.round((selectedCrop.cropName.includes('Tomato') ? 1100 : 800) * (selectedCrop.cultivatedArea || 1))
    : 1000;

  const remainingBudgetKL = Math.max(0, indicativeWaterBudgetKL - totalWaterUsedKL);
  const waterConsumptionPercent = Math.min(100, Math.round((totalWaterUsedKL / indicativeWaterBudgetKL) * 100));

  // Sync Offline Queue
  const handleManualSync = () => {
    setIsSyncing(true);
    const { synced, failed } = offlineQueueService.syncPending();
    setIsSyncing(false);
    setRefreshKey(prev => prev + 1);

    if (synced > 0) {
      showToast(
        language === 'hi'
          ? `${synced} रिकॉर्ड सफलतापूर्वक सर्वर से सिंक हो गए!`
          : `${synced} records synced successfully!`,
        'success'
      );
    } else if (failed > 0) {
      showToast(
        language === 'hi'
          ? 'नेटवर्क धीमा है, रिकॉर्ड आपके फोन में सुरक्षित हैं।'
          : 'Slow network; records safely preserved on device.',
        'info'
      );
    }
  };

  // Toggle Microphone Speech-to-Text
  const handleToggleMic = () => {
    if (isListening) {
      speechRecognitionService.stop();
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    setInterimTranscript('');

    const started = speechRecognitionService.start(language, {
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal) {
          processTranscript(transcript);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setSpeechError(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setSpeechError(
        language === 'hi'
          ? 'ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। आप नीचे दिए गए आम वाक्यों पर टैप कर सकते हैं।'
          : 'Speech recognition unavailable in this browser. You can tap common spoken phrases below.'
      );
    }
  };

  // Process transcript through speechParserService
  const processTranscript = (transcript: string) => {
    if (!transcript || transcript.trim().length < 2) return;

    const parsed = parseSpokenFarmLog(transcript, language);

    // Check for water unit ambiguity (e.g. "सिंचाई 500")
    if (parsed.clarificationNeeded && parsed.clarificationNeeded.type === 'water_unit') {
      setDisambiguationNumber(parsed.clarificationNeeded.numericValue);
      setShowDisambiguation(true);
      setParsedResult(parsed);
      return;
    }

    // Set water explanation if applicable
    if (parsed.waterUnit === 'Litres' && parsed.numericValue) {
      const kl = Math.round((parsed.numericValue / 1000) * 10) / 10;
      setWaterCalculationExplanation(`${parsed.numericValue} L ÷ 1,000 = ${kl} KL`);
    } else if (parsed.pumpHours) {
      const kl = Math.round(parsed.pumpHours * 30);
      setWaterCalculationExplanation(`${parsed.pumpHours} hrs × 30 KL/hr = ${kl} KL`);
    } else if (parsed.waterVolumeKL) {
      setWaterCalculationExplanation(`${parsed.waterVolumeKL} KL`);
    } else {
      setWaterCalculationExplanation('');
    }

    setParsedResult(parsed);
    setShowDisambiguation(false);
  };

  // Handle Disambiguation Selection
  const handleSelectWaterUnit = (unit: 'KL' | 'Litres' | 'Hours' | 'Irrigations') => {
    if (!parsedResult) return;

    const calculatedKL = convertToKL(disambiguationNumber, unit);
    let explanation = '';
    if (unit === 'KL') explanation = `${disambiguationNumber} KL`;
    if (unit === 'Litres') explanation = `${disambiguationNumber} L ÷ 1,000 = ${calculatedKL} KL`;
    if (unit === 'Hours') explanation = `${disambiguationNumber} hrs × 30 KL/hr = ${calculatedKL} KL`;
    if (unit === 'Irrigations') explanation = `${disambiguationNumber} cycle(s) × 75 KL = ${calculatedKL} KL`;

    const updated: ParsedFarmLogResult = {
      ...parsedResult,
      waterVolumeKL: calculatedKL,
      waterUnit: unit,
      isWaterAmbiguous: false,
      clarificationNeeded: undefined,
      description:
        parsedResult.description ||
        (language === 'hi' ? `सिंचाई कार्य: ${calculatedKL} KL` : `Irrigation: ${calculatedKL} KL`),
    };

    setParsedResult(updated);
    setWaterCalculationExplanation(explanation);
    setShowDisambiguation(false);
  };

  // Farmer explicitly confirms voice log
  const handleConfirmVoiceLog = () => {
    if (!parsedResult || !selectedCrop) return;

    const newLogData = {
      cropRecordId: selectedCrop.id,
      farmerId: selectedCrop.farmerId,
      activityType: parsedResult.activityType,
      activityDate: new Date().toISOString(),
      waterVolumeKL: parsedResult.waterVolumeKL,
      description: parsedResult.description || parsedResult.rawTranscript,
      notes: parsedResult.notes || `Spoken: "${parsedResult.rawTranscript}"`,
    };

    // Queue with offline support
    offlineQueueService.queueLog(newLogData);

    setParsedResult(null);
    setInterimTranscript('');
    setRefreshKey(prev => prev + 1);

    showToast(
      language === 'hi'
        ? 'रिकॉर्ड सुरक्षित हो गया! पासपोर्ट स्कोर स्वतः अपडेट हुआ।'
        : 'Farm activity recorded! Passport score updated.',
      'success'
    );
  };

  // Handle 1-Tap Spoken Preset Selection
  const handlePresetSelect = (text: string) => {
    setInterimTranscript(text);
    processTranscript(text);
  };

  // Manual Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription.trim() || !selectedCrop) return;

    offlineQueueService.queueLog({
      cropRecordId: selectedCrop.id,
      farmerId: selectedCrop.farmerId,
      activityType: manualType,
      activityDate: new Date(manualDate).toISOString(),
      waterVolumeKL: manualType === 'Irrigation' && typeof manualWaterKL === 'number' ? manualWaterKL : undefined,
      description: manualDescription.trim(),
      notes: manualNotes.trim() || undefined,
    });

    setManualDescription('');
    setShowManualForm(false);
    setRefreshKey(prev => prev + 1);

    showToast(
      language === 'hi' ? 'खेत रिकॉर्ड सुरक्षित हुआ!' : 'Farm record saved!',
      'success'
    );
  };

  // Spoken Summary for Text-to-Speech
  const spokenHindi = `खेत की डायरी में अब तक कुल ${totalWaterUsedKL} किलोलीटर पानी का उपयोग दर्ज है, जबकि आपका जल बजट ${indicativeWaterBudgetKL} किलोलीटर है। कुल ${logs.length} गतिविधियां किसान द्वारा दर्ज की गई हैं। नया रिकॉर्ड जोड़ने के लिए ऊपर दिए गए बड़े माइक को दबाएं। यह सलाह है, अंतिम निर्णय किसान का है।`;

  const spokenEnglish = `Your farm diary shows ${totalWaterUsedKL} kilolitres of water applied against a seasonal budget of ${indicativeWaterBudgetKL} kilolitres, with ${logs.length} farmer-logged activities. Tap the large microphone button above to record a new entry by voice. This is advisory information; the final decision is yours.`;

  return (
    <div className="space-y-4 pb-8">
      {/* Screen Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-5 rounded-3xl text-white shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-[10px] font-bold">
            <Droplets className="w-3.5 h-3.5 text-cyan-300" />
            <span>{t.farmHistory.tabLabel}</span>
          </div>

          {/* Network Resilience Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
              isOnline
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                : 'bg-amber-900/80 text-amber-200 border border-amber-500'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>{language === 'hi' ? 'नेटवर्क सक्रिय' : 'Online'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>{language === 'hi' ? 'कमजोर/ऑफलाइन' : 'Offline Safe'}</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {t.farmHistory.title}
        </h1>
        <p className="text-xs text-emerald-200/90 mt-1">
          {t.farmHistory.subtitle}
        </p>

        {/* Honest Badge */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 font-semibold">
            {t.farmHistory.farmerLoggedBadge}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 font-semibold">
            {t.farmHistory.advisoryBadge}
          </span>
        </div>
      </div>

      {/* Voice Guidance Read-Aloud */}
      <VoiceGuidance
        englishText={spokenEnglish}
        hindiText={spokenHindi}
        compact
      />

      {/* Offline Pending Sync Bar (When logs are queued offline) */}
      {pendingQueueCount > 0 && (
        <div className="bg-amber-50 rounded-2xl p-3.5 border-2 border-amber-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">
                {language === 'hi'
                  ? `${pendingQueueCount} रिकॉर्ड फोन में सुरक्षित हैं`
                  : `${pendingQueueCount} records queued safely on phone`}
              </div>
              <p className="text-[11px] text-amber-800/90">
                {t.farmHistory.offlineNotice}
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{t.farmHistory.syncNow}</span>
          </button>
        </div>
      )}

      {/* Crop Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          {language === 'hi' ? 'फसल चुनें:' : 'Select Crop:'}
        </span>
        {crops.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCropId(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCrop?.id === c.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {language === 'hi' && c.cropNameHi ? c.cropNameHi : c.cropName} ({c.publicId})
          </button>
        ))}
      </div>

      {/* SECTION 1: PROMINENT GIANT VOICE RECORDER CARD (ONE MAIN ACTION) */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl p-5 border-2 border-emerald-500/40 shadow-md text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              {isListening && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isListening ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-bold text-slate-800">
              {language === 'hi' ? 'आवाज़ से दर्ज करें (स्पीच टू टेक्स्ट)' : 'Voice Logging (Speech-to-Text)'}
            </span>
          </div>

          {/* Giant Mic Button */}
          <div className="py-2 flex justify-center">
            <button
              type="button"
              onClick={handleToggleMic}
              className={`relative flex items-center justify-center w-20 h-20 min-w-[80px] min-h-[80px] rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 ${
                isListening
                  ? 'bg-red-600 text-white ring-8 ring-red-200 animate-pulse scale-105'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white ring-4 ring-emerald-300/50 hover:scale-105'
              }`}
              title={isListening ? 'Tap to stop' : 'Tap to speak'}
            >
              {isListening ? (
                <MicOff className="w-9 h-9 animate-bounce" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">
              {isListening
                ? language === 'hi'
                  ? 'सुन रहा हूँ... बोलिए'
                  : 'Listening... speak now'
                : language === 'hi'
                ? 'माइक दबाकर बोलें'
                : 'Tap mic to speak your farm activity'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isListening
                ? language === 'hi'
                  ? 'बोलने के बाद रोकने के लिए दोबारा दबाएं'
                  : 'Tap again when finished speaking'
                : language === 'hi'
                ? 'जैसे: "आज 2 घंटे ट्यूबवेल चलाया" या "खाद डाली"'
                : 'e.g. "Irrigated 60 KL today using tubewell"'}
            </p>
          </div>

          {/* Live Audio Transcript Display */}
          {interimTranscript && (
            <div className="bg-white rounded-2xl p-3 border border-emerald-300 shadow-inner text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span>{language === 'hi' ? 'सुनी गई आवाज़:' : 'Heard Speech:'}</span>
              </div>
              <p className="text-xs font-medium text-slate-800 italic bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                "{interimTranscript}"
              </p>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-2xl border border-red-200 text-red-700 text-xs text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{speechError}</p>
            </div>
          )}

          {/* 1-Tap Spoken Voice Presets (For fast entry or when mic/network is unavailable) */}
          <div className="pt-2 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {t.farmHistory.commonPhrasesTitle}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_FARM_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(phrase.text)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-400 text-[11px] font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <span>{phrase.icon}</span>
                  <span>{language === 'hi' ? phrase.labelHi : phrase.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 1B: WATER DISAMBIGUATION PROMPT */}
        {showDisambiguation && (
          <div className="mt-4 bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 text-left animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2 text-amber-950 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {language === 'hi'
                  ? `आपने "${disambiguationNumber}" बताया है। यह कितने पानी की मात्रा है?`
                  : `You mentioned "${disambiguationNumber}". What is the water unit?`}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 mb-3">
              {language === 'hi'
                ? 'सही जल बजट व स्कोर के लिए सही इकाई चुनें:'
                : 'Select the unit to calculate accurate Kilolitres:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectWaterUnit('KL')}
                className="p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">{disambiguationNumber} KL (किलोलीटर)</div>
                <div className="text-[10px] text-slate-500">सीधा KL में दर्ज</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectWaterUnit('Litres')}
                className="p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">
                  {disambiguationNumber} {language === 'hi' ? 'लीटर' : 'Litres'}
                </div>
                <div className="text-[10px] text-slate-500">
                  ÷ 1,000 → {Math.round((disambiguationNumber / 1000) * 10) / 10} KL
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectWaterUnit('Hours')}
                className="p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">
                  {disambiguationNumber} {language === 'hi' ? 'घंटे पंप' : 'Pump Hours'}
                </div>
                <div className="text-[10px] text-slate-500">
                  × 30 KL/hr → {Math.round(disambiguationNumber * 30)} KL
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectWaterUnit('Irrigations')}
                className="p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-900">
                  {disambiguationNumber} {language === 'hi' ? 'सिंचाई चक्कर' : 'Irrigation Cycle'}
                </div>
                <div className="text-[10px] text-slate-500">
                  × ~75 KL/ac → {Math.round(disambiguationNumber * 75)} KL
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1C: EXPLICIT CONFIRMATION CARD BEFORE SAVING */}
        {parsedResult && !showDisambiguation && (
          <div className="mt-4 bg-white rounded-2xl p-4 border-2 border-emerald-600 text-left shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'hi'
                    ? 'आवाज़ रिकॉर्ड समीक्षा (सहेजने से पहले पुष्टि करें)'
                    : 'Review Voice Log (Confirm Before Saving)'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {t.farmHistory.farmerLoggedBadge}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">गतिविधि:</span>
                <span className="font-bold text-slate-900">{parsedResult.activityType}</span>
              </div>

              {parsedResult.activityType === 'Irrigation' && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">पानी की मात्रा:</span>
                  <div className="text-right">
                    <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {parsedResult.waterVolumeKL !== undefined ? `${parsedResult.waterVolumeKL} KL` : '—'}
                    </span>
                    {waterCalculationExplanation && (
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        ({waterCalculationExplanation})
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="py-1">
                <span className="text-slate-500 block mb-1">विवरण:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 italic text-[11px]">
                  "{parsedResult.rawTranscript}"
                </p>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                {t.voiceAssistant.neverAutoSavedNotice}
              </p>
            </div>

            {/* Confirmation Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmVoiceLog}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'hi' ? 'पुष्टि करें और सहेजें' : 'Confirm & Save'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: CUMULATIVE WATER METER CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-[10px] font-bold">
              <Droplets className="w-3.5 h-3.5 text-cyan-700" />
              <span>{t.farmHistory.waterDiscipline}</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              {language === 'hi' ? 'सीजन का जल उपयोग मीटर' : 'Seasonal Water Meter'}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">
              {t.farmHistory.remainingWater}
            </span>
            <span className="text-lg font-black text-emerald-800">
              {remainingBudgetKL.toLocaleString()} KL
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>{totalWaterUsedKL.toLocaleString()} KL उपयोग हुआ</span>
            <span>बजट: {indicativeWaterBudgetKL.toLocaleString()} KL</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                waterConsumptionPercent > 90
                  ? 'bg-amber-600'
                  : 'bg-gradient-to-r from-cyan-600 to-emerald-600'
              }`}
              style={{ width: `${waterConsumptionPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Advisory Honesty Notice */}
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
          <strong>सूचना:</strong> {t.farmHistory.advisoryBadge}। जल बजट केवल मार्गदर्शक गणना है। खेत में मिट्टी की वास्तविक नमी देखकर ही पानी दें।
        </p>
      </div>

      {/* SECTION 3: CHRONOLOGICAL ACTIVITY TIMELINE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>
              {language === 'hi' ? 'खेत का सम्पूर्ण इतिहास' : 'Complete Field History'} ({filteredLogs.length})
            </span>
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'all' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
              }`}
            >
              {t.farmHistory.allTab}
            </button>
            <button
              onClick={() => setActiveFilter('Irrigation')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'Irrigation' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
              }`}
            >
              {t.farmHistory.waterTab}
            </button>
            <button
              onClick={() => setActiveFilter('Fertilizer')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'Fertilizer' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
              }`}
            >
              {t.farmHistory.fertilizerTab}
            </button>
            <button
              onClick={() => setActiveFilter('Pest')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'Pest' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
              }`}
            >
              {t.farmHistory.pestTab}
            </button>
          </div>
        </div>

        {/* Timeline Cards */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center text-xs text-slate-500">
            {t.farmHistory.emptyHistory}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log: CropLog) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0 mt-0.5">
                    {log.activityType === 'Irrigation' ? (
                      <Droplets className="w-4 h-4 text-cyan-600" />
                    ) : log.activityType === 'Fertilizer Application' ? (
                      <Sprout className="w-4 h-4 text-emerald-600" />
                    ) : log.activityType.includes('Pest') ? (
                      <Bug className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Wrench className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">
                        {log.activityType}
                      </span>
                      {log.waterVolumeKL && log.waterVolumeKL > 0 && (
                        <span className="text-[10px] font-extrabold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-md">
                          {log.waterVolumeKL} KL
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                        {t.farmHistory.farmerLoggedBadge}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{log.description}</p>
                    {log.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 italic">{log.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {new Date(log.activityDate).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    ✓ {t.farmHistory.syncedBadge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Collapsible Fallback */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 mx-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>
            {showManualForm
              ? language === 'hi' ? 'मैन्युअल फॉर्म बंद करें' : 'Close Manual Form'
              : language === 'hi' ? 'हाथ से लिखकर दर्ज करना चाहते हैं? यहाँ क्लिक करें' : 'Prefer typing manually? Tap here'}
          </span>
        </button>

        {showManualForm && (
          <form onSubmit={handleManualSubmit} className="mt-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-800">
              {language === 'hi' ? 'मैन्युअल रिकॉर्ड फॉर्म' : 'Manual Record Form'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">गतिविधि प्रकार</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="Irrigation">सिंचाई (Water Log)</option>
                  <option value="Fertilizer Application">खाद / पोषक तत्व (Fertilizer)</option>
                  <option value="Pest Control Action">कीट स्प्रे (Pest Control)</option>
                  <option value="Crop Maintenance">निराई / गुड़ाई (Weeding)</option>
                  <option value="Growth Observation">फसल अवलोकन (Observation)</option>
                </select>
              </div>

              {manualType === 'Irrigation' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">पानी की मात्रा (KL)</label>
                  <input
                    type="number"
                    value={manualWaterKL}
                    onChange={(e) => setManualWaterKL(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">विवरण *</label>
              <input
                type="text"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="कार्य का विवरण..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white font-bold"
              >
                सुरक्षित करें
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
