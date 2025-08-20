import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/Avatar';
import { Plus, Users, Settings, Globe, Trophy, Target, Crown } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GameService from '@/lib/gameService';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';

interface Profile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  level: number;
  xp: number;
  private_rooms_today: number;
}

interface DailyChallenge {
  id: string;
  challenge_type: string;
  challenge_name: string;
  description: string;
  target_value: number;
  current_value: number;
  xp_reward: number;
  completed: boolean;
}

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { trackGameEvent } = useAnalytics();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    const profileData = await GameService.getUserProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  }, [user]);

  const fetchDailyChallenges = useCallback(async () => {
    if (!user) return;
    
    const challenges = await GameService.getDailyChallenges(user.id);
    setDailyChallenges(challenges);
    
    // Create challenges if none exist
    if (challenges.length === 0) {
      await GameService.createDailyChallenges(user.id);
      const newChallenges = await GameService.getDailyChallenges(user.id);
      setDailyChallenges(newChallenges);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchProfile(), fetchDailyChallenges()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, fetchProfile, fetchDailyChallenges]);

  const handleCreateRoom = () => {
    trackGameEvent.createRoom('private');
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  const handlePublicRooms = () => {
    if (profile?.is_premium) {
      trackGameEvent.viewPublicRooms();
      navigate('/public-rooms');
    } else {
      // Show premium upgrade prompt
      trackGameEvent.viewPremiumPage();
      navigate('/premium');
    }
  };

  const handleProfile = () => {
    trackGameEvent.viewProfile();
    navigate('/profile');
  };

  const handleFriends = () => {
    trackGameEvent.viewFriends();
    navigate('/friends');
  };

  const handleLeaderboards = () => {
    if (profile?.is_premium) {
      trackGameEvent.viewLeaderboards();
      navigate('/leaderboards');
    } else {
      trackGameEvent.viewPremiumPage();
      navigate('/premium');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsWrapper pageName="Home">
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
            {profile?.is_premium && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                <Crown className="h-3 w-3" />
                PREMIUM
              </div>
            )}
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

        {/* User Stats */}
        {profile && (
          <div className="px-6 mb-6">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">Nivel {profile.level}</div>
                      <div className="text-xs text-muted-foreground">{profile.xp} XP</div>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, ((profile.xp % 1000) / 1000) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  {!profile.is_premium && (
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Salas privadas</div>
                      <div>{profile.private_rooms_today}/3</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Daily Challenges */}
        {dailyChallenges.length > 0 && (
          <div className="px-6 mb-6">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Desafíos Diarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyChallenges.slice(0, 2).map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{challenge.challenge_name}</div>
                      <div className="text-xs text-muted-foreground">{challenge.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 bg-background rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, (challenge.current_value / challenge.target_value) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {challenge.current_value}/{challenge.target_value}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-primary">+{challenge.xp_reward} XP</div>
                    </div>
                  </div>
                ))}
                {dailyChallenges.length > 2 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/challenges')}>
                      Ver todos ({dailyChallenges.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-black text-foreground mb-2">
                ¡Hola, {profile?.display_name || profile?.username}!
              </h2>
              <p className="text-muted-foreground font-medium">
                ¿Qué quieres hacer hoy?
              </p>
            </div>

            <div className="space-y-4">
              {/* Create Room */}
              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-vibrant-green rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Plus className="w-8 h-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">Crear Sala</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      Inicia una nueva partida
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreateRoom} 
                    className="w-full game-button bg-vibrant-green hover:bg-vibrant-green/90 text-background font-black py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nueva Sala
                  </Button>
                </div>
              </div>

              {/* Join Room */}
              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-vibrant-pink rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Users className="w-8 h-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">Unirse a Sala</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      Únete con un código
                    </p>
                  </div>
                  <Button 
                    onClick={handleJoinRoom} 
                    className="w-full game-button bg-vibrant-pink hover:bg-vibrant-pink/90 text-background font-black py-3"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Unirse con Código
                  </Button>
                </div>
              </div>

              {/* Public Rooms (Premium) */}
              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-vibrant-blue rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Globe className="w-8 h-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">Salas Públicas</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      Juega con personas de todo el mundo
                    </p>
                  </div>
                  <Button 
                    onClick={handlePublicRooms} 
                    className="w-full game-button bg-vibrant-blue hover:bg-vibrant-blue/90 text-background font-black py-3"
                    disabled={!profile?.is_premium}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {profile?.is_premium ? 'Explorar Salas' : 'Requiere Premium'}
                  </Button>
                </div>
              </div>

              {/* Friends */}
              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-vibrant-yellow rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Users className="w-8 h-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">Amigos</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      Gestiona tu lista de amigos
                    </p>
                  </div>
                  <Button 
                    onClick={handleFriends} 
                    className="w-full game-button bg-vibrant-yellow hover:bg-vibrant-yellow/90 text-background font-black py-3"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ver Amigos
                  </Button>
                </div>
              </div>

              {/* Leaderboards */}
              <div className="glass-card p-6 hover-scale floating-card">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Trophy className="w-8 h-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">Clasificaciones</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      Compite con los mejores jugadores
                    </p>
                  </div>
                  <Button 
                    onClick={handleLeaderboards} 
                    className="w-full game-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-background font-black py-3"
                    disabled={!profile?.is_premium}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {profile?.is_premium ? 'Ver Clasificaciones' : 'Requiere Premium'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AnalyticsWrapper>
  );
};

export default Home;