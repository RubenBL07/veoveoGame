import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Shield, Eye, Settings, ExternalLink } from 'lucide-react';

interface PrivacyConsentProps {
  onConsentChange?: (consent: PrivacyConsent) => void;
}

export interface PrivacyConsent {
  analytics: boolean;
  marketing: boolean;
  essential: boolean;
  timestamp: number;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onConsentChange }) => {
  const [consent, setConsent] = useState<PrivacyConsent>({
    analytics: false,
    marketing: false,
    essential: true, // Siempre requerido
    timestamp: Date.now()
  });
  const [showDialog, setShowDialog] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Cargar consentimiento guardado
    const savedConsent = localStorage.getItem('privacy_consent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
      } catch (error) {
        console.error('Error parsing saved consent:', error);
      }
    }
  }, []);

  const handleConsentChange = (newConsent: Partial<PrivacyConsent>) => {
    const updatedConsent = {
      ...consent,
      ...newConsent,
      timestamp: Date.now()
    };
    
    setConsent(updatedConsent);
    localStorage.setItem('privacy_consent', JSON.stringify(updatedConsent));
    
    // Track consent change
    trackEvent({
      action: 'privacy_consent_updated',
      category: 'privacy',
      label: `analytics:${updatedConsent.analytics},marketing:${updatedConsent.marketing}`
    });

    onConsentChange?.(updatedConsent);
  };

  const handleSaveConsent = () => {
    handleConsentChange(consent);
    setShowDialog(false);
    
    // Track consent saved
    trackEvent({
      action: 'privacy_consent_saved',
      category: 'privacy'
    });
  };

  const openPrivacyPolicy = () => {
    window.open('/privacy-policy.html', '_blank');
  };

  const openTermsOfService = () => {
    window.open('/terms-of-service.html', '_blank');
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Privacidad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuración de Privacidad
          </DialogTitle>
          <DialogDescription>
            Controla cómo usamos tu información para mejorar tu experiencia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Essential Cookies - Siempre activo */}
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="essential"
              checked={consent.essential}
              disabled
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="essential" className="font-medium">
                Cookies Esenciales
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Necesarias para el funcionamiento básico de la aplicación. No se pueden desactivar.
              </p>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="analytics"
              checked={consent.analytics}
              onCheckedChange={(checked) => 
                handleConsentChange({ analytics: checked as boolean })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="analytics" className="font-medium">
                Analytics y Rendimiento
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Nos ayudan a entender cómo usas la aplicación para mejorarla.
              </p>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="marketing"
              checked={consent.marketing}
              onCheckedChange={(checked) => 
                handleConsentChange({ marketing: checked as boolean })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="marketing" className="font-medium">
                Marketing y Personalización
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Para mostrarte contenido relevante y ofertas personalizadas.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={openPrivacyPolicy}
              className="justify-start gap-2"
            >
              <Eye className="h-4 w-4" />
              Política de Privacidad
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openTermsOfService}
              className="justify-start gap-2"
            >
              <Shield className="h-4 w-4" />
              Términos de Servicio
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConsent}
              className="flex-1"
            >
              Guardar Preferencias
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyConsent;
