import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (!token || !type) {
          setStatus('error');
          setMessage('Enlace de confirmación inválido. Faltan parámetros necesarios.');
          return;
        }

        if (type === 'signup') {
          // Verify the email confirmation token
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });

          if (error) {
            console.error('Error confirming email:', error);
            setStatus('error');
            setMessage(error.message || 'Error al confirmar el email. El enlace puede haber expirado.');
          } else {
            setStatus('success');
            setMessage('¡Email confirmado exitosamente! Ya puedes iniciar sesión.');
            
            toast({
              title: "¡Éxito!",
              description: "Tu email ha sido confirmado correctamente.",
            });
            
            // Redirect to auth page after 3 seconds
            setTimeout(() => {
              navigate('/auth');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('Tipo de confirmación no válido.');
        }
      } catch (error: unknown) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('Error inesperado al procesar la confirmación.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmando email...';
      case 'success':
        return '¡Email confirmado!';
      case 'error':
        return 'Error de confirmación';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-12 w-28 h-28 bg-vibrant-green/15 rounded-full blur-3xl"></div>
        <div className="absolute top-48 right-16 w-32 h-32 bg-vibrant-pink/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-8 w-24 h-24 bg-vibrant-yellow/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-12 w-36 h-36 bg-vibrant-blue/15 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="glass-card p-4 inline-block">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Eye className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-wide">Veo Veo</h1>
                <p className="text-muted-foreground font-medium text-sm">Confirmación de Email</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Confirmation Card */}
        <div className="glass-card p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {getIcon()}
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">{getTitle()}</h2>
              <p className="text-muted-foreground text-center leading-relaxed">
                {message}
              </p>
            </div>
            
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Serás redirigido automáticamente en unos segundos...
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full h-12 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90"
                >
                  Ir a Iniciar Sesión
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full h-12 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90"
                >
                  Volver al Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full h-12 text-lg font-bold rounded-2xl"
                >
                  Ir al Inicio
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;