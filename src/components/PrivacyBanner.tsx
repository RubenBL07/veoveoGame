import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Eye, Settings, X, Check } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { PrivacyConsent } from './PrivacyConsent';

interface PrivacyBannerProps {
  onConsentComplete: (consent: PrivacyConsent) => void;
}

const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onConsentComplete }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<PrivacyConsent>({
    analytics: false,
    marketing: false,
    essential: true,
    timestamp: Date.now()
  });
  const [showDetails, setShowDetails] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Verificar si ya se ha dado consentimiento
    const savedConsent = localStorage.getItem('privacy_consent');
    if (!savedConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsentChange = (type: keyof Omit<PrivacyConsent, 'essential' | 'timestamp'>) => {
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAcceptAll = () => {
    const fullConsent: PrivacyConsent = {
      analytics: true,
      marketing: true,
      essential: true,
      timestamp: Date.now()
    };
    
    setConsent(fullConsent);
    handleSaveConsent(fullConsent);
  };

  const handleAcceptEssential = () => {
    const essentialConsent: PrivacyConsent = {
      analytics: false,
      marketing: false,
      essential: true,
      timestamp: Date.now()
    };
    
    setConsent(essentialConsent);
    handleSaveConsent(essentialConsent);
  };

  const handleSaveConsent = (finalConsent: PrivacyConsent) => {
    localStorage.setItem('privacy_consent', JSON.stringify(finalConsent));
    setShowBanner(false);
    
    // Track consent
    trackEvent({
      action: 'privacy_consent_given',
      category: 'privacy',
      label: `analytics:${finalConsent.analytics},marketing:${finalConsent.marketing}`
    });

    onConsentComplete(finalConsent);
  };

  const openPrivacyPolicy = () => {
    window.open('/privacy-policy.html', '_blank');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Privacidad</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Usamos cookies y tecnologías similares para mejorar tu experiencia
          </CardDescription>
        </CardHeader>

        {showDetails ? (
          <CardContent className="space-y-4">
            {/* Essential */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="essential-banner"
                checked={consent.essential}
                disabled
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="essential-banner" className="font-medium">
                  Esenciales
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Necesarias para el funcionamiento básico
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="analytics-banner"
                checked={consent.analytics}
                onCheckedChange={() => handleConsentChange('analytics')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="analytics-banner" className="font-medium">
                  Analytics
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Para mejorar la aplicación
                </p>
              </div>
            </div>

            {/* Marketing */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="marketing-banner"
                checked={consent.marketing}
                onCheckedChange={() => handleConsentChange('marketing')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="marketing-banner" className="font-medium">
                  Marketing
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Para contenido personalizado
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAcceptEssential}
                className="flex-1"
              >
                Solo Esenciales
              </Button>
              <Button
                onClick={() => handleSaveConsent(consent)}
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAcceptEssential}
                className="flex-1"
              >
                Solo Esenciales
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="flex-1"
              >
                Aceptar Todo
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={openPrivacyPolicy}
                className="text-xs text-muted-foreground"
              >
                Leer Política de Privacidad
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PrivacyBanner;
