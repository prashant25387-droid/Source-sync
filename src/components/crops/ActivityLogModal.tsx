import React, { useState, useEffect } from 'react';
import {
  X,
  Droplets,
  ShieldCheck,
  Bug,
  Wrench,
  Sprout,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  Calendar,
  Volume2
} from 'lucide-react';
import { ActivityType, CropRecord } from '../../types';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { speechRecognitionService } from '../../services/speechRecognitionService';
import { parseSpokenFarmLog, convertToKL, ParsedFarmLogResult } from '../../services/speechParserService';

interface ActivityLogModalProps {
  crop: CropRecord;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTIVITY_TYPES: { type: ActivityType; labelEn: string; labelHi: string; icon: any }[] = [
  { type: 'Irrigation', labelEn: 'Irrigation (Paani Log)', labelHi: 'सिंचाई (पानी का रिकॉर्ड)', icon: Droplets },
  { type: 'Fertilizer Application', labelEn: 'Fertilizer / Nutrient Application', labelHi: 'उर्वरक / खाद देना', icon: Sprout },
  { type: 'Pest / Disease Observation', labelEn: 'Pest / Disease Observation', labelHi: 'कीट / रोग का अवलोकन', icon: Bug },
  { type: 'Pest Control Action', labelEn: 'Pest Control Action (Spray)', labelHi: 'कीट नियंत्रण उपाय (स्प्रे / दवा)', icon: ShieldCheck },
  { type: 'Crop Maintenance', labelEn: 'Crop Maintenance / Weeding', labelHi: 'फसल निराई-गुड़ाई व देखभाल', icon: Wrench },
  { type: 'Growth Observation', labelEn: 'Growth Observation', labelHi: 'फसल बढ़वार अवलोकन', icon: Sprout },
  { type: 'Harvest Activity', labelEn: 'Harvest Activity', labelHi: 'कटाई व तुड़ाई', icon: Sprout },
];

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  crop,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  // Manual Form State
  const [activityType, setActivityType] = useState<ActivityType>('Irrigation');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [waterVolumeKL, setWaterVolumeKL] = useState<number | ''>(100);
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Voice Assistant State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedFarmLogResult | null>(null);
  const [waterCalculationExplanation, setWaterCalculationExplanation] = useState<string>('');
  const [showDisambiguation, setShowDisambiguation] = useState<boolean>(false);
  const [disambiguationNumber, setDisambiguationNumber] = useState<number>(0);
  const [manualFormExpanded, setManualFormExpanded] = useState<boolean>(true);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionService.checkSupport()) {
        speechRecognitionService.stop();
      }
    };
  }, []);

  // Handle Speech-to-Text Toggle
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechRecognitionService.stop();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    setInterimTranscript('');

    const started = speechRecognitionService.start(language, {
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript: string, isFinal: boolean) => {
        setInterimTranscript(transcript);
        if (isFinal) {
          handleSpeechResult(transcript);
        }
      },
      onError: (err: string) => {
        setIsListening(false);
        setVoiceError(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setVoiceError(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। कृपया नीचे लिखकर दर्ज करें।'
          : 'Speech recognition not supported in this browser. Please type details manually.'
      );
    }
  };

  // Process final spoken transcript
  const handleSpeechResult = (transcript: string) => {
    if (!transcript || transcript.trim().length < 2) return;

    const parsed = parseSpokenFarmLog(transcript, language);

    // Check if water unit is ambiguous (e.g. "सिंचाई 500" or "paani do hazar")
    if (parsed.clarificationNeeded && parsed.clarificationNeeded.type === 'water_unit') {
      setDisambiguationNumber(parsed.clarificationNeeded.numericValue);
      setShowDisambiguation(true);
      setParsedPreview(parsed);
      setManualFormExpanded(false);
      return;
    }

    // Process parsed water calculation
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

    setParsedPreview(parsed);
    setShowDisambiguation(false);
    setManualFormExpanded(false);
  };

  // Farmer selects water unit from clarification options
  const handleSelectWaterUnit = (
    unit: 'KL' | 'Litres' | 'Hours' | 'Irrigations'
  ) => {
    if (!parsedPreview) return;

    const calculatedKL = convertToKL(disambiguationNumber, unit);
    let explanation = '';
    if (unit === 'KL') {
      explanation = `${disambiguationNumber} KL`;
    } else if (unit === 'Litres') {
      explanation = `${disambiguationNumber} L ÷ 1,000 = ${calculatedKL} KL`;
    } else if (unit === 'Hours') {
      explanation = `${disambiguationNumber} hrs × 30 KL/hr = ${calculatedKL} KL`;
    } else if (unit === 'Irrigations') {
      explanation = `${disambiguationNumber} irrigation(s) × 75 KL = ${calculatedKL} KL`;
    }

    const updated: ParsedFarmLogResult = {
      ...parsedPreview,
      waterVolumeKL: calculatedKL,
      waterUnit: unit,
      isWaterAmbiguous: false,
      clarificationNeeded: undefined,
      description:
        parsedPreview.description ||
        (language === 'hi'
          ? `सिंचाई कार्य: ${calculatedKL} KL`
          : `Irrigation: ${calculatedKL} KL`),
    };

    setParsedPreview(updated);
    setWaterCalculationExplanation(explanation);
    setShowDisambiguation(false);
  };

  // Farmer confirms voice log
  const handleConfirmVoiceLog = () => {
    if (!parsedPreview) return;

    setIsSubmitting(true);
    dataService.addLog({
      cropRecordId: crop.id,
      farmerId: crop.farmerId,
      activityType: parsedPreview.activityType,
      activityDate: new Date().toISOString(),
      waterVolumeKL: parsedPreview.waterVolumeKL,
      description: parsedPreview.description || parsedPreview.rawTranscript,
      notes:
        parsedPreview.notes ||
        (parsedPreview.rawTranscript
          ? `${language === 'hi' ? 'आवाज़ द्वारा रिकॉर्ड' : 'Voice recorded'}: "${parsedPreview.rawTranscript}"`
          : undefined),
    });

    setIsSubmitting(false);
    showToast(
      language === 'hi'
        ? 'आवाज़ रिकॉर्ड दर्ज हो गया! पासपोर्ट स्कोर अपडेट हुआ।'
        : 'Voice farm activity logged! Passport Score updated automatically.',
      'success'
    );
    onSuccess();
    onClose();
  };

  // Farmer chooses to edit details in manual form
  const handleEditDetailsFromVoice = () => {
    if (!parsedPreview) return;

    setActivityType(parsedPreview.activityType);
    if (parsedPreview.waterVolumeKL !== undefined) {
      setWaterVolumeKL(parsedPreview.waterVolumeKL);
    }
    if (parsedPreview.description) {
      setDescription(parsedPreview.description);
    }
    const combinedNotes = [
      parsedPreview.notes,
      parsedPreview.rawTranscript ? `Speech: "${parsedPreview.rawTranscript}"` : '',
    ]
      .filter(Boolean)
      .join(' | ');
    setNotes(combinedNotes);

    setManualFormExpanded(true);
    setParsedPreview(null);
    setShowDisambiguation(false);
  };

  // Cancel voice log review
  const handleCancelVoice = () => {
    setParsedPreview(null);
    setShowDisambiguation(false);
    setInterimTranscript('');
    setManualFormExpanded(true);
  };

  // Manual Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast(
        language === 'hi'
          ? 'कृपया गतिविधि का विवरण दर्ज करें।'
          : 'Please enter an activity description.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    dataService.addLog({
      cropRecordId: crop.id,
      farmerId: crop.farmerId,
      activityType,
      activityDate: new Date(activityDate).toISOString(),
      waterVolumeKL:
        activityType === 'Irrigation' && typeof waterVolumeKL === 'number'
          ? waterVolumeKL
          : undefined,
      description: description.trim(),
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    showToast(
      language === 'hi'
        ? 'खेती की गतिविधि दर्ज! पासपोर्ट स्कोर स्वतः अद्यतन हुआ।'
        : 'Farm activity logged! Passport Score recalculated automatically.',
      'success'
    );
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-emerald-900/10 relative my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {language === 'hi' ? 'खेती की गतिविधि दर्ज करें' : 'Log Farming Activity'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {crop.cropName} • Passport ID: <span className="font-mono font-semibold">{crop.publicId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto pr-1 mt-4 space-y-4">
          {/* SECTION 1: VOICE INPUT (MIC) */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
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
                  {language === 'hi' ? 'आवाज़ द्वारा दर्ज करें (माइक)' : 'Log by Voice (Mic)'}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {language === 'hi' ? 'हिंदी (hi-IN)' : 'English (en-IN)'}
              </span>
            </div>

            {/* Mic Button & Instructions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`relative flex items-center justify-center w-14 h-14 min-w-[56px] min-h-[56px] rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-4 ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse scale-105'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-300/50 hover:scale-102'
                }`}
                title={
                  isListening
                    ? language === 'hi'
                      ? 'रोकने के लिए दबाएं'
                      : 'Tap to stop'
                    : language === 'hi'
                    ? 'बोलने के लिए माइक दबाएं'
                    : 'Tap mic to speak'
                }
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 animate-bounce" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900">
                  {isListening
                    ? language === 'hi'
                      ? 'सुन रहा हूँ... अपनी गतिविधि बोलें'
                      : 'Listening... speak your farm activity'
                    : language === 'hi'
                    ? 'माइक दबाकर बोलें (उदा. "आज 500 KL पानी दिया ड्रिप से")'
                    : 'Tap mic and speak (e.g. "Irrigated 60 KL using drip today")'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'hi'
                    ? 'सिंचाई, खाद, कीट-स्प्रे या मौसम सीधे बोलकर दर्ज करें।'
                    : 'Speak irrigation, fertilizer, pest spray, or weather observations.'}
                </p>
              </div>
            </div>

            {/* Live Transcript / Speech Wave */}
            {interimTranscript && (
              <div className="mt-3 bg-white/90 rounded-xl p-3 border border-emerald-300 shadow-inner">
                <p className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  {language === 'hi' ? 'बोला गया वाक्य:' : 'Spoken Speech:'}
                </p>
                <p className="text-xs font-medium text-slate-800 italic bg-emerald-50/50 p-2 rounded-lg">
                  "{interimTranscript}"
                </p>
              </div>
            )}

            {/* Error Message */}
            {voiceError && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 p-2.5 rounded-xl border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{voiceError}</p>
              </div>
            )}
          </div>

          {/* SECTION 2: DISAMBIGUATION PROMPT (WHEN NUMBER HAS NO UNIT) */}
          {showDisambiguation && (
            <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-300 shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>
                  {language === 'hi'
                    ? `आपने "${disambiguationNumber}" बताया है। यह कितने पानी की मात्रा है?`
                    : `You mentioned "${disambiguationNumber}". What is the water unit?`}
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 mb-3">
                {language === 'hi'
                  ? 'सही जल बजट व पासपोर्ट स्कोर के लिए कृपया सही इकाई चुनें:'
                  : 'Please choose the correct unit so we can compute accurate Kilolitres:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectWaterUnit('KL')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 hover:bg-emerald-50/50 text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      {disambiguationNumber} KL (किलोलीटर)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {language === 'hi' ? 'सीधा KL में दर्ज' : 'Direct KL entry'}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {disambiguationNumber} KL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectWaterUnit('Litres')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 hover:bg-emerald-50/50 text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      {disambiguationNumber} {language === 'hi' ? 'लीटर' : 'Litres'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ÷ 1,000 → {Math.round((disambiguationNumber / 1000) * 10) / 10} KL
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {Math.round((disambiguationNumber / 1000) * 10) / 10} KL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectWaterUnit('Hours')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 hover:bg-emerald-50/50 text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      {disambiguationNumber} {language === 'hi' ? 'घंटे पंप' : 'Pump Hours'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      × 30 KL/hr (5HP) → {Math.round(disambiguationNumber * 30)} KL
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {Math.round(disambiguationNumber * 30)} KL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectWaterUnit('Irrigations')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 hover:bg-emerald-50/50 text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      {disambiguationNumber} {language === 'hi' ? 'सिंचाई चक्कर' : 'Irrigation Cycle'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      × ~75 KL/acre → {Math.round(disambiguationNumber * 75)} KL
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {Math.round(disambiguationNumber * 75)} KL
                  </span>
                </button>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelVoice}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 underline"
                >
                  {language === 'hi' ? 'रद्द करें / मैन्युअल दर्ज करें' : 'Cancel / Enter manually'}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: VOICE LOG CONFIRMATION CARD (MANDATORY CONFIRMATION) */}
          {parsedPreview && !showDisambiguation && (
            <div className="bg-emerald-50/90 rounded-2xl p-4 border-2 border-emerald-500 shadow-md animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    {language === 'hi'
                      ? 'आवाज़ रिकॉर्ड समीक्षा (सहेजने से पहले पुष्टि करें)'
                      : 'Review Voice Log (Confirm Before Saving)'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  {language === 'hi' ? 'पुष्टि शेष' : 'Confirmation Needed'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Detected Activity */}
                <div className="flex items-start justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600 font-medium">
                    {language === 'hi' ? 'पहचानी गई गतिविधि:' : 'Detected Activity:'}
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    {ACTIVITY_TYPES.find(a => a.type === parsedPreview.activityType)?.[
                      language === 'hi' ? 'labelHi' : 'labelEn'
                    ] || parsedPreview.activityType}
                  </span>
                </div>

                {/* Water Applied if Irrigation */}
                {parsedPreview.activityType === 'Irrigation' && (
                  <div className="flex items-start justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-600 font-medium">
                      {language === 'hi' ? 'पानी की मात्रा:' : 'Water Applied:'}
                    </span>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {parsedPreview.waterVolumeKL !== undefined
                          ? `${parsedPreview.waterVolumeKL} KL`
                          : language === 'hi'
                          ? 'दर्ज नहीं'
                          : 'Not specified'}
                      </span>
                      {waterCalculationExplanation && (
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          ({waterCalculationExplanation})
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Condition / Observation if pest or weather */}
                {parsedPreview.condition && (
                  <div className="flex items-start justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-600 font-medium">
                      {language === 'hi' ? 'स्थिति अवलोकन:' : 'Observed Condition:'}
                    </span>
                    <span className="font-semibold text-amber-800">
                      {parsedPreview.condition}
                      {parsedPreview.resolved !== undefined && (
                        <span className="ml-1 text-[10px] font-bold text-slate-600">
                          ({parsedPreview.resolved ? 'ठीक हो गया' : 'जाँच जारी'})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Spoken Text / Description */}
                <div className="py-1">
                  <span className="text-slate-600 font-medium block mb-1">
                    {language === 'hi' ? 'विवरण व मूल आवाज़:' : 'Details & Spoken Text:'}
                  </span>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-slate-800 font-medium italic text-[11px]">
                    "{parsedPreview.rawTranscript}"
                  </div>
                </div>

                {/* Never Auto-saved Notice */}
                <p className="text-[10px] text-slate-500 italic pt-1">
                  {t.voiceAssistant.neverAutoSavedNotice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancelVoice}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleEditDetailsFromVoice}
                  className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-100/70 text-xs font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'विवरण बदलें' : 'Edit Details'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVoiceLog}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting
                    ? language === 'hi'
                      ? 'सहेज रहे हैं...'
                      : 'Saving...'
                    : language === 'hi'
                    ? 'पुष्टि करें और सेव करें'
                    : 'Confirm & Save'}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: MANUAL FORM (COLLAPSIBLE / EXPANDABLE) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'मैन्युअल फॉर्म (हाथ से भरें)' : 'Manual Form Entry'}
              </span>
              <button
                type="button"
                onClick={() => setManualFormExpanded(!manualFormExpanded)}
                className="text-xs text-emerald-800 font-semibold hover:underline"
              >
                {manualFormExpanded
                  ? language === 'hi'
                    ? 'फॉर्म छिपाएं'
                    : 'Hide Form'
                  : language === 'hi'
                  ? 'फॉर्म खोलें'
                  : 'Expand Form'}
              </button>
            </div>

            {manualFormExpanded && (
              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'गतिविधि प्रकार *' : 'Activity Type *'}
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as ActivityType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
                  >
                    {ACTIVITY_TYPES.map((a) => (
                      <option key={a.type} value={a.type}>
                        {language === 'hi' ? a.labelHi : a.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {language === 'hi' ? 'दिनांक व समय *' : 'Date & Time *'}
                    </label>
                    <input
                      type="datetime-local"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                      required
                    />
                  </div>

                  {activityType === 'Irrigation' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                        {language === 'hi'
                          ? 'पानी की मात्रा (KL / 1,000 लीटर)'
                          : 'Water Volume (KL / 1,000 Litres)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={waterVolumeKL}
                        onChange={(e) =>
                          setWaterVolumeKL(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        placeholder={language === 'hi' ? 'उदा. 100 KL' : 'e.g. 100 KL'}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi'
                      ? 'विवरण * (कार्य, खुराक, अवधि)'
                      : 'Description * (Action details, dose or duration)'}
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'उदा. 2 घंटे ड्रिप चलाई; 19:19:19 खाद दी'
                        : 'e.g. 2-hour drip cycle; applied 19:19:19 via venturi'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi'
                      ? 'खेत के नोट्स / अवलोकन (वैकल्पिक)'
                      : 'Observations / Field Notes (Optional)'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder={
                      language === 'hi'
                        ? 'मिट्टी की नमी, मौसम, फसल का रंग या बढ़वार...'
                        : 'Soil condition, weather context, crop response...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    {isSubmitting
                      ? language === 'hi'
                        ? 'सहेज रहे हैं...'
                        : 'Saving...'
                      : language === 'hi'
                      ? 'गतिविधि सहेजें और स्कोर अपडेट करें'
                      : 'Save Activity & Recalculate Score'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
