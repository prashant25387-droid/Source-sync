import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { CropRecord, PhotoCategory, GrowthStage, CropEvidence } from '../../types';
import { VoiceGuidance } from '../common/VoiceGuidance';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../services/dataService';

interface CropPhotoUploaderProps {
  crops: CropRecord[];
  selectedCropId?: string;
  onUploadSuccess: (evidence: CropEvidence) => void;
  onCancel?: () => void;
}

const PHOTO_CATEGORIES: PhotoCategory[] = [
  'Growth Documentation',
  'Crop Identification',
  'General Condition',
  'Pest / Disease Symptom',
  'Flowering / Fruiting Progress',
  'Harvest Readiness',
  'Harvested Produce',
  'Irrigation & Water Check',
];

const GROWTH_STAGES: GrowthStage[] = [
  'Land Preparation',
  'Sowing / Planting',
  'Germination & Establishment',
  'Vegetative Growth',
  'Flowering',
  'Fruiting / Grain Formation',
  'Maturity',
  'Harvested',
];

// Pre-provided high-res agriculture photos for instant 1-click test in demo
const SAMPLE_DEMO_IMAGES = [
  {
    name: 'Tomato Flowering Stage (Healthy Canopy)',
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    category: 'Flowering / Fruiting Progress' as PhotoCategory,
    desc: 'Dense flowering flush with drip lines visible under silver mulch.',
  },
  {
    name: 'Chana Seedlings in Black Soil',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    category: 'Growth Documentation' as PhotoCategory,
    desc: 'Uniform germination of Bengal Gram after rauni irrigation.',
  },
  {
    name: 'Mustard Crop Field Canopy',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    category: 'General Condition' as PhotoCategory,
    desc: 'Healthy vegetative growth, zero weed competition.',
  },
];

export const CropPhotoUploader: React.FC<CropPhotoUploaderProps> = ({
  crops,
  selectedCropId,
  onUploadSuccess,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropId, setCropId] = useState<string>(selectedCropId || (crops[0]?.id || ''));
  const [category, setCategory] = useState<PhotoCategory>('Growth Documentation');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('Vegetative Growth');
  const [captureDate, setCaptureDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [publicConsent, setPublicConsent] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a valid JPEG, PNG, or WebP image.', 'error');
      return;
    }
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      showToast(t.voice.uploadSuccessPrompt, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleTriggerCameraOrUpload = async () => {
    try {
      const { MobileCameraService } = await import('../../services/cameraService');
      if (MobileCameraService.isNative()) {
        const photoData = await MobileCameraService.capturePhoto();
        if (photoData) {
          setPreviewUrl(photoData);
          showToast(t.voice.uploadSuccessPrompt, 'success');
          return;
        }
      }
    } catch (e) {
      // Fallback to web input
    }
    fileInputRef.current?.click();
  };

  const handleSelectSample = (sample: typeof SAMPLE_DEMO_IMAGES[0]) => {
    setPreviewUrl(sample.url);
    setCategory(sample.category);
    setDescription(sample.desc);
    showToast('Loaded demo farm photograph for instant evaluation!', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      showToast('Please select or upload a photograph first.', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please provide a short description for the photograph.', 'error');
      return;
    }

    setIsSubmitting(true);
    const selectedCrop = crops.find(c => c.id === cropId);

    const newEvidence = dataService.addEvidence({
      cropRecordId: cropId,
      farmerId: selectedCrop?.farmerId || 'farmer-1',
      cropName: selectedCrop?.cropName || 'Crop',
      storagePath: previewUrl,
      category,
      description: description.trim(),
      captureDate,
      uploadDate: new Date().toISOString(),
      growthStage,
      reviewStatus: 'Pending Review',
      publicSharingEnabled: publicConsent,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    showToast('Photograph saved as supporting evidence! Sent to Review Queue.', 'success');
    onUploadSuccess(newEvidence);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/15 shadow-lg p-5 sm:p-7">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          {language === 'hi' ? 'फसल की फोटो जोड़ें' : 'Add Crop Photo'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'hi'
            ? 'अपनी फसल की प्रगति दर्ज करने के लिए एक साफ़ तस्वीर अपलोड करें।'
            : "Upload a clear picture to document your crop's progress."}
        </p>
      </div>

      {/* Bilingual Voice Guidance Card */}
      <div className="mb-6">
        <VoiceGuidance
          englishText={t.voice.uploadGuide}
          hindiText={t.voice.uploadGuide}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Drop Zone / Camera Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Crop Photograph (Max 5MB • JPG, PNG, WebP)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600 bg-slate-900 max-h-72 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Crop preview"
                className="max-h-72 w-full object-contain"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerCameraOrUpload}
                  className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewUrl('')}
                  className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-700 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={handleTriggerCameraOrUpload}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/30'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {language === 'hi' ? 'तस्वीर चुनें या कैमरा खोलें' : 'Tap to Upload or Take Photo'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Drag and drop or browse from gallery / mobile camera
              </p>
            </div>
          )}

          {/* Quick Demo Pre-selected Samples for judges */}
          {!previewUrl && (
            <div className="mt-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Demo Options (Use Sample Agriculture Photos):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_DEMO_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white text-left text-xs flex items-center gap-2 hover:bg-emerald-50/40 transition-colors"
                  >
                    <img src={sample.url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <span className="text-[11px] font-medium text-slate-700 truncate">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Crop Record *
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
              required
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cropName} ({c.publicId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Photo Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PhotoCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
              required
            >
              {PHOTO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Growth Stage *
            </label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
              required
            >
              {GROWTH_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Capture Date (Disclose if taken earlier)
            </label>
            <input
              type="date"
              value={captureDate}
              onChange={(e) => setCaptureDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Short Description * (e.g. canopy spread, flower clusters, drip layout)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what is visible in the photograph..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Additional Observations / Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any related agricultural notes or soil conditions..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium bg-white"
          />
        </div>

        {/* Public Sharing Consent */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={publicConsent}
              onChange={(e) => setPublicConsent(e.target.checked)}
              className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">
                {language === 'hi'
                  ? 'सार्वजनिक क्रॉप पासपोर्ट में शामिल करने की सहमति'
                  : 'Consent to include this photo on the public Crop Passport'}
              </span>
              <span className="text-slate-500 text-[11px]">
                {language === 'hi'
                  ? 'समीक्षक द्वारा अनुमोदन के बाद खरीदार इस तस्वीर को सार्वजनिक पासपोर्ट पर देख सकेंगे।'
                  : 'Once approved as supporting evidence, prospective buyers can inspect this progress photograph.'}
              </span>
            </div>
          </label>
        </div>

        {/* Important Disclosure Alert */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-tight">
            <strong>Transparency Rule:</strong> Submitting a photo documents growth progress. It will not be marked as independently verified until authorized human review is performed by an agronomist.
          </span>
        </div>

        {/* Form Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {t.actions.cancel}
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !previewUrl}
            className={`px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
              isSubmitting || !previewUrl ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Evidence...' : 'Submit Photo Evidence'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
