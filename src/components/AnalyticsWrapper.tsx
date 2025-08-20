import { ReactNode, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsWrapperProps {
  children: ReactNode;
  pageName: string;
  trackPageView?: boolean;
}

export const AnalyticsWrapper = ({ 
  children, 
  pageName, 
  trackPageView = true 
}: AnalyticsWrapperProps) => {
  const { trackGameEvent } = useAnalytics();

  useEffect(() => {
    if (trackPageView) {
      // Track page view
      trackGameEvent.trackEvent({
        action: 'page_view',
        category: 'navigation',
        label: pageName,
      });
    }
  }, [pageName, trackPageView, trackGameEvent]);

  return <>{children}</>;
};
