import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium-monthly',
    name: 'Premium Mensual',
    price: 2.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Salas públicas ilimitadas',
      'Leaderboards globales',
      'Sin límites de salas privadas',
      '25% bonus de XP',
      'Sin anuncios',
      '3 desafíos diarios simultáneos'
    ],
    stripePriceId: 'price_premium_monthly' // Reemplazar con tu ID real de Stripe
  },
  {
    id: 'premium-yearly',
    name: 'Premium Anual',
    price: 29.99,
    currency: 'EUR',
    interval: 'year',
    features: [
      'Todo lo de Premium Mensual',
      '2 meses gratis',
      'Acceso anticipado a nuevas funciones',
      'Soporte prioritario'
    ],
    stripePriceId: 'price_premium_yearly' // Reemplazar con tu ID real de Stripe
  }
];

export class PaymentService {
  /**
   * Crear sesión de checkout para suscripción
   */
  static async createCheckoutSession(planId: string, userId: string): Promise<string | null> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      // Crear sesión de checkout en el backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          stripePriceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: `${window.location.origin}/premium?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión de checkout');
      }

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la sesión de pago",
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Redirigir a Stripe Checkout
   */
  static async redirectToCheckout(planId: string, userId: string): Promise<void> {
    try {
      const sessionId = await this.createCheckoutSession(planId, userId);
      if (!sessionId) return;

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe no se pudo cargar');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    }
  }

  /**
   * Cancelar suscripción
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Error al cancelar suscripción');
      }

      // Actualizar estado en Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción Premium ha sido cancelada",
      });

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Obtener estado de suscripción
   */
  static async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    planId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }> {
    try {
      const response = await fetch(`/api/subscription-status?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Error al obtener estado de suscripción');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { isActive: false };
    }
  }

  /**
   * Procesar webhook de Stripe (para el backend)
   */
  static async processWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Manejar checkout completado
   */
  private static async handleCheckoutCompleted(session: any): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) return;

    // Actualizar usuario como premium
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: true,
        premium_since: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user to premium:', error);
    }
  }

  /**
   * Manejar actualización de suscripción
   */
  private static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const isActive = subscription.status === 'active';
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: isActive,
        premium_until: isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  }

  /**
   * Manejar cancelación de suscripción
   */
  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: false,
        premium_until: null
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription cancellation:', error);
    }
  }
}
