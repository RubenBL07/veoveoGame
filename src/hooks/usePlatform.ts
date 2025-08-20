import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';

export interface PlatformInfo {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  isMobile: boolean;
  isTablet: boolean;
}

export const usePlatform = () => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isNative: false,
    platform: 'web',
    isMobile: false,
    isTablet: false
  });

  useEffect(() => {
    const detectPlatform = async () => {
      try {
        const info = await Device.getInfo();
        
        setPlatformInfo({
          isNative: info.platform !== 'web',
          platform: info.platform as 'ios' | 'android' | 'web',
          isMobile: info.platform === 'ios' || info.platform === 'android',
          isTablet: info.platform === 'ios' || info.platform === 'android'
        });
      } catch (error) {
        // Fallback para web
        setPlatformInfo({
          isNative: false,
          platform: 'web',
          isMobile: false,
          isTablet: false
        });
      }
    };

    detectPlatform();
  }, []);

  return platformInfo;
};
