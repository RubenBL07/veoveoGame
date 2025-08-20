import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Tipos para eventos personalizados
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Hook para Google Analytics
export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.VITE_GOOGLE_ANALYTICS_ID!, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Función para trackear eventos personalizados
  const trackEvent = (event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  };

  // Funciones específicas para eventos del juego
  const trackGameEvent = {
    // Eventos de autenticación
    userSignUp: () => trackEvent({ action: 'sign_up', category: 'engagement' }),
    userLogin: () => trackEvent({ action: 'login', category: 'engagement' }),
    
    // Eventos de salas
    createRoom: (roomType: 'private' | 'public') => 
      trackEvent({ action: 'create_room', category: 'game', label: roomType }),
    joinRoom: (roomType: 'private' | 'public') => 
      trackEvent({ action: 'join_room', category: 'game', label: roomType }),
    
    // Eventos de juego
    startGame: () => trackEvent({ action: 'start_game', category: 'game' }),
    endGame: (score: number) => 
      trackEvent({ action: 'end_game', category: 'game', value: score }),
    takePhoto: () => trackEvent({ action: 'take_photo', category: 'game' }),
    makeGuess: (isCorrect: boolean) => 
      trackEvent({ action: 'make_guess', category: 'game', label: isCorrect ? 'correct' : 'incorrect' }),
    
    // Eventos de gamificación
    earnXP: (amount: number) => 
      trackEvent({ action: 'earn_xp', category: 'gamification', value: amount }),
    levelUp: (level: number) => 
      trackEvent({ action: 'level_up', category: 'gamification', value: level }),
    unlockAchievement: (achievementName: string) => 
      trackEvent({ action: 'unlock_achievement', category: 'gamification', label: achievementName }),
    
    // Eventos sociales
    addFriend: () => trackEvent({ action: 'add_friend', category: 'social' }),
    acceptFriendRequest: () => trackEvent({ action: 'accept_friend', category: 'social' }),
    sendMessage: () => trackEvent({ action: 'send_message', category: 'social' }),
    
    // Eventos de premium
    viewPremiumPage: () => trackEvent({ action: 'view_premium', category: 'monetization' }),
    upgradeToPremium: () => trackEvent({ action: 'upgrade_premium', category: 'monetization' }),
    
    // Eventos de navegación
    viewLeaderboards: () => trackEvent({ action: 'view_leaderboards', category: 'engagement' }),
    viewProfile: () => trackEvent({ action: 'view_profile', category: 'engagement' }),
    viewFriends: () => trackEvent({ action: 'view_friends', category: 'social' }),
    viewPublicRooms: () => trackEvent({ action: 'view_public_rooms', category: 'engagement' }),
  };

  return {
    trackEvent,
    trackGameEvent,
  };
};

// Función para inicializar Google Analytics
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.VITE_GOOGLE_ANALYTICS_ID) {
    // Inicializar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', process.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_title: 'Veo Veo Vision',
      page_location: window.location.href,
    });
    
    // Hacer gtag disponible globalmente
    window.gtag = gtag;
  }
};

// Tipos para TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
