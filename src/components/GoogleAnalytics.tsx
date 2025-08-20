import { useEffect } from 'react';
import { initializeAnalytics } from '../hooks/useAnalytics';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const gaId = measurementId || process.env.VITE_GOOGLE_ANALYTICS_ID;

  useEffect(() => {
    if (!gaId) {
      console.warn('Google Analytics ID no encontrado. Asegúrate de configurar VITE_GOOGLE_ANALYTICS_ID en tu .env.local');
      return;
    }

    // Cargar el script de Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Inicializar Google Analytics cuando el script se cargue
    script.onload = () => {
      initializeAnalytics();
    };

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [gaId]);

  // No renderizar nada
  return null;
};
