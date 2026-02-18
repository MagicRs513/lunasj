import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lunatv.app',
  appName: 'LunaTV',
  webDir: 'public',
  server: {
    // 加载远程 LunaTV 后端服务
    url: 'https://lunatv.smone.us', // 替换为您的 LunaTV 后端地址
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    webContentsDebuggingEnabled: true,
    captureInput: true,
    appendUserAgent: 'LunaTV-AndroidTV/1.0'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
