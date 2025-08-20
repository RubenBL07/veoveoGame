import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.veoveovision.app',
  appName: 'Veo Veo Vision',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://veoveogame-7kltsg701-ruben261205-9060s-projects.vercel.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: true,
      spinnerColor: "#6366f1"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a'
    },
    Camera: {
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
