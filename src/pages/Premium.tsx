import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Globe, Trophy, Users, Star, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PaymentService, SUBSCRIPTION_PLANS } from '@/lib/paymentService';

const Premium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const features = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Salas Públicas",
      description: "Acceso a salas públicas mundiales y matchmaking global"
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Leaderboards",
      description: "Clasificaciones globales y regionales en tiempo real"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Sin Límites",
      description: "Salas privadas ilimitadas sin restricciones diarias"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Sin Anuncios",
      description: "Experiencia completamente libre de publicidad"
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "XP Bonus",
      description: "25% de bonus en XP por todas las actividades"
    },
    {
      icon: <Check className="h-5 w-5" />,
      title: "Desafíos Extra",
      description: "3 desafíos diarios simultáneos con recompensas especiales"
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para suscribirte",
        variant: "destructive",
      });
      return;
    }

    setLoading(planId);
    try {
      await PaymentService.redirectToCheckout(planId, user.id);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la suscripción",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" onClick={handleBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Veo Veo Premium</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-12 w-12 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4">
            Desbloquea Todo el Potencial
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accede a todas las funcionalidades avanzadas, juega con personas de todo el mundo 
            y disfruta de una experiencia gaming sin límites.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card key={plan.id} className={`game-card relative overflow-hidden ${
              plan.id === 'premium-monthly' ? 'border-2 border-yellow-400' : 'border border-border'
            }`}>
              {plan.id === 'premium-monthly' && (
                <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-black px-4 py-1 text-sm font-bold rounded-bl-lg">
                  MÁS POPULAR
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black">€{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mes' : 'año'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cancelación en cualquier momento
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full game-button bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black py-4 text-lg"
                >
                  {loading === plan.id ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Crown className="h-5 w-5 mr-2" />
                  )}
                  {loading === plan.id ? 'Procesando...' : 'Suscribirse Ahora'}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {plan.id === 'premium-yearly' ? '2 meses gratis incluidos' : 'Prueba gratuita de 7 días incluida'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="game-card hover-scale">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="game-card mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-black">
              Comparación de Planes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">Funcionalidad</th>
                    <th className="text-center py-4 px-4">
                      <div className="text-muted-foreground">Gratuito</div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-primary">Premium</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-3 px-4">Salas Privadas</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">3 por día</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-primary font-bold">Ilimitadas</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Salas Públicas</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">No disponible</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Leaderboards</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">No disponible</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Anuncios</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">Entre partidas</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-primary font-bold">Sin anuncios</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Bonus XP</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">0%</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-primary font-bold">+25%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Desafíos Diarios</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">1 por día</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-primary font-bold">3 simultáneos</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-black">
              Preguntas Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">¿Puedo cancelar mi suscripción en cualquier momento?</h4>
              <p className="text-muted-foreground text-sm">
                Sí, puedes cancelar tu suscripción Premium en cualquier momento desde la configuración de tu cuenta.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">¿Qué pasa si no me gusta Premium?</h4>
              <p className="text-muted-foreground text-sm">
                Ofrecemos una prueba gratuita de 7 días. Si no estás satisfecho, puedes cancelar sin costo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">¿Los beneficios Premium son permanentes?</h4>
              <p className="text-muted-foreground text-sm">
                Los beneficios Premium están activos mientras mantengas tu suscripción activa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Premium;
