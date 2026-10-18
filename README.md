# 🌾 FasalSetu (फसलसेतु) — Mobile Application

> **"Plan Smart. Grow Better. Prove Your Progress. Connect with Buyers."**  
> *पानी से प्लानिंग, भरोसे से सेलिंग।*

FasalSetu is a water-aware crop planning and transparent digital **Crop Passport** platform built as a **Native Mobile Application** (Capacitor Android & iOS) and **Progressive Web App (PWA)** for farmers, agronomists, and institutional produce buyers.

---

## 📱 Mobile Application Architecture

### 1. Native Mobile Foundation (Capacitor)
- **App ID:** `in.fasalsetu.app`
- **Native Platform Folder:** `android/` with complete Gradle build scripts, `MainActivity.java`, and `AndroidManifest.xml`.
- **Hardware Integrations:**
  - **Native Camera (`@capacitor/camera`):** Direct phone camera and photo gallery access for capturing timestamped growth evidence.
  - **Native Status Bar (`@capacitor/status-bar`):** Styled dark green (`#14532D`) status bar with safe-area overlays.
  - **Splash Screen (`@capacitor/splash-screen`):** Native launch screen with agricultural branding.
  - **Native Sharing (`@capacitor/share`):** One-tap system sharing of Crop Passports via WhatsApp, Telegram, or SMS.
  - **App Lifecycle (`@capacitor/app`):** Hardware back-button handling and background state management.

### 2. Mobile-First UI/UX Shell
- **Bottom Navigation Tab Bar (`MobileBottomNav`):** Fixed frosted navigation bar with touch haptics and role-specific tabs:
  - **Farmer:** 🏠 गृह (Home) • 🧭 योजना (Plan) • 🎙️ डायरी व पानी (Diary & Water - Center Mic FAB) • 📜 पासपोर्ट (Passport) • 🛍️ मंडी (Mandi)
  - **Buyer:** 🏠 Home • 🛍️ Market • 📋 Demands • 📥 Orders
  - **Admin / Reviewer:** 🏠 Home • 🛡️ Review Queue (Center FAB) • 🛍️ Market
- **Mobile Header (`MobileHeader`):** Simulated 5G/Wi-Fi/Battery status bar, back navigation, live time, quick language toggle (EN / हिंदी), and persona switcher.
- **Desktop Device Simulator:** Toggle between **Phone Frame View** (iPhone 16 / Pixel 9 chassis with dynamic island) and **Fullscreen Mobile View** for easy evaluation on laptops.
- **PWA Capabilities:** Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) allowing direct installation on any smartphone home screen.

---

## 🚀 Key Functional Features

1. **🎙️ Farm Voice Diary & Irrigation Tracking (`/farmer/history`):**
   - High-contrast 72×72px pulsating mic button for Web Speech API (`hi-IN` & `en-IN`).
   - 1-Tap Spoken Presets (*"आज 2 घंटे ट्यूबवेल चलाया"*, *"500 KL पानी दिया ड्रिप से"*, *"यूरिया खाद डाली"*, *"कीड़े लगे थे, नीम स्प्रे किया"*, *"तेज बारिश हुई"*).
   - Voice Unit Disambiguation (*"500 क्या? KL / लीटर / पंप के घंटे / सिंचाई चक्कर"*).
   - Explicit confirmation card before saving (*"पुष्टि करें और सहेजें / Confirm & Save"*).
   - Cumulative Water Meter showing total KL used vs seasonal budget with color progress bar.
   - Chronological timeline filter pills (सभी, पानी, खाद, स्प्रे, बारिश).

2. **📡 Patchy 3G/4G Network Offline Queue (`offlineQueueService.ts`):**
   - In rural fields with poor network, farming entries are safely queued in `localStorage`.
   - Never blames the farmer; displays clear, empathetic offline indicator.
   - Automatically syncs to database upon network reconnection, with a manual "अभी सिंक करें / Sync Now" button.

3. **⚖️ Honest, Non-Technical Labeling:**
   - Records labeled: **"किसान द्वारा दर्ज, फोटो समर्थित"** (*"farmer-logged, photo-backed"*), never falsely marked as verified.
   - Advisory labeled: **"सलाहकारी, अंतिम निर्णय आपका है"** (*"advisory, final decision is yours"*).
   - Booking labeled: **"खरीद की पूर्व-इच्छा, अंतिम बिक्री गारंटी नहीं"** (*"pre-booking intent, not a guaranteed sale"*).

4. **⚡ Quick Commercial Assessment for Buyers (`/passport/:publicId`):**
   - Built specifically for hostel messes, cloud kitchens, traders, and FPOs scanning QR on mobile.
   - Quick decision card highlighting: Reliability Score (Tier A), Water Discipline (80%), Stage Photo evidence count, Pre-booked vs available stock, and 1-tap pre-booking intent submission.

5. **💧 Smart Water-Aware Crop Planner:**
   - Ranks crops by estimated net profit per 1,000 Litres of water (₹/KL).
   - Multi-crop mix optimization matching land area, soil type, and available water budget in Kilolitres.
   - Water deficit warnings if crop water demand exceeds seasonal farm storage.

6. **📜 Transparent 100-Point Farmer Crop Passport:**
   - Water Management Discipline (40 pts), Log Consistency (30 pts), Crop Care (20 pts), Plan Adherence (10 pts).
   - Generates high-resolution QR codes (PNG download & printable layout).
   - Privacy-safe public route (`/passport/:publicId`) hiding phone numbers, emails, and coordinates.

---

## 💻 Running the Application

### 1. Install Dependencies & Start Dev Server:
```powershell
npm install
npm run dev -- --host
```
Open **[http://localhost:5173](http://localhost:5173)**. You will see the app running inside the mobile phone chassis with active bottom tab navigation!

### 2. Run Unit Tests:
```powershell
npm test
```
Runs 14 automated unit tests covering `speechParserService` and `offlineQueueService`.

### 3. Build Web Bundle & Sync Native Android:
```powershell
npm run build
npx cap sync android
```

### 4. Open in Android Studio & Build APK:
```powershell
npx cap open android
```
*(From Android Studio, click **Build → Build Bundle(s) / APK(s) → Build APK(s)** to generate the `.apk` file for Android devices).*
