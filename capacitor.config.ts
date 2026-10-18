import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.fasalsetu.app',
  appName: 'FasalSetu',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#14532D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#DCFCE7',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#14532D',
      overlaysWebView: false,
    },
  },
};

export default config;
