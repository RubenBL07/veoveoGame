import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.veoveo.app',
  appName: 'Veo Veo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://veoveo-game-oozlt114e-ruben261205-9060s-projects.vercel.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: true,
      spinnerColor: "#6366f1",
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a',
      overlaysWebView: false
    },
    Camera: {
      androidScaleType: 'CENTER_CROP',
      quality: 90,
      allowEditing: false,
      resultType: 'DATA_URL'
    },
    App: {
      url: 'https://veoveo-game-oozlt114e-ruben261205-9060s-projects.vercel.app',
      appId: 'com.veoveo.app',
      appName: 'Veo Veo',
      webDir: 'dist',
      bundledWebRuntime: false
    },
    Device: {
      language: 'es',
      locale: 'es-ES'
    },
    Haptics: {
      enabled: true
    },
    Network: {
      enabled: true
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#1a1a1a',
    limitsNavigationsToAppBoundDomains: true
  },
  android: {
    backgroundColor: '#1a1a1a',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
