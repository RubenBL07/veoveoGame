import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Play, Users, Zap } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-8 w-32 h-32 bg-vibrant-green/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-12 w-24 h-24 bg-vibrant-pink/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-16 w-28 h-28 bg-vibrant-yellow/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-48 right-8 w-20 h-20 bg-vibrant-blue/20 rounded-full blur-2xl"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-between p-6 relative z-10">
        {/* Header */}
        <div className="flex justify-center pt-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <Eye className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-wide">Veo Veo</h1>
            </div>
          </div>
        </div>

        {/* Central content */}
        <div className="flex-1 flex flex-col justify-center items-center space-y-8 px-4">
          {/* Main title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-foreground leading-tight">
              ¡Encuentra y
              <br />
              <span className="text-primary">Fotografía!</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-xs mx-auto">
              El juego visual más divertido para jugar con amigos
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="glass-card p-4 text-center hover-scale">
              <div className="w-12 h-12 bg-vibrant-green rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Eye className="w-6 h-6 text-background" />
              </div>
              <p className="text-sm font-bold text-foreground">Observa</p>
            </div>
            
            <div className="glass-card p-4 text-center hover-scale">
              <div className="w-12 h-12 bg-vibrant-pink rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-background" />
              </div>
              <p className="text-sm font-bold text-foreground">Compite</p>
            </div>
            
            <div className="glass-card p-4 text-center hover-scale">
              <div className="w-12 h-12 bg-vibrant-yellow rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-background" />
              </div>
              <p className="text-sm font-bold text-foreground">Rápido</p>
            </div>
            
            <div className="glass-card p-4 text-center hover-scale">
              <div className="w-12 h-12 bg-vibrant-blue rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Play className="w-6 h-6 text-background" />
              </div>
              <p className="text-sm font-bold text-foreground">Diviértete</p>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="w-full game-button text-lg font-black py-6 bg-primary hover:bg-primary/90"
          >
            <Play className="w-6 h-6 mr-2" />
            ¡Empezar a Jugar!
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button 
                onClick={() => navigate('/auth')}
                className="text-primary font-bold hover:underline"
              >
                Iniciar Sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;