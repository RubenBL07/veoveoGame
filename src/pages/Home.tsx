import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/Avatar';
import { Plus, Users, Settings } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data && !error) {
      setProfile(data);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-8 w-24 h-24 bg-vibrant-green/15 rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-12 w-32 h-32 bg-vibrant-pink/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-16 w-28 h-28 bg-vibrant-yellow/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-8 w-20 h-20 bg-vibrant-blue/15 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary-foreground flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>
              <h1 className="text-xl font-black text-foreground tracking-wide">Veo Veo</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleProfile}
              className="p-2 rounded-2xl"
            >
              <Avatar 
                username={profile?.username} 
                avatarUrl={profile?.avatar_url || undefined}
                size="md"
              />
            </Button>
            <Button
              variant="ghost"
              onClick={signOut}
              className="p-2 rounded-2xl"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-foreground mb-2">
                ¡Hola!
              </h2>
              <p className="text-muted-foreground font-medium">
                ¿Qué quieres hacer hoy?
              </p>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-vibrant-green rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Plus className="w-10 h-10 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground">Crear Sala</h3>
                    <p className="text-muted-foreground font-medium">
                      Inicia una nueva partida
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreateRoom} 
                    className="w-full game-button bg-vibrant-green hover:bg-vibrant-green/90 text-background font-black py-4"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Nueva Sala
                  </Button>
                </div>
              </div>

              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-vibrant-pink rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Users className="w-10 h-10 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground">Unirse a Sala</h3>
                    <p className="text-muted-foreground font-medium">
                      Únete con un código
                    </p>
                  </div>
                  <Button 
                    onClick={handleJoinRoom} 
                    className="w-full game-button bg-vibrant-pink hover:bg-vibrant-pink/90 text-background font-black py-4"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Unirse con Código
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;