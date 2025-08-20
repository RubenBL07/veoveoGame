import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Medal, Crown, Globe, TrendingUp, Users, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GameService from '@/lib/gameService';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  category: string;
  score: number;
  rank: number;
  region: string;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    is_premium: boolean;
  };
}

const Leaderboards = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: LeaderboardEntry[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('xp');
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [userProfile, setUserProfile] = useState<{ is_premium?: boolean; xp?: number; games_won?: number; accuracy?: number; games_played?: number } | null>(null);

  const categories = [
    { value: 'xp', label: 'Experiencia', icon: <Star className="h-4 w-4" /> },
    { value: 'games_won', label: 'Partidas Ganadas', icon: <Trophy className="h-4 w-4" /> },
    { value: 'accuracy', label: 'Precisión', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'games_played', label: 'Partidas Jugadas', icon: <Users className="h-4 w-4" /> }
  ];

  const regions = [
    { value: 'global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
    { value: 'es', label: 'España', icon: <Globe className="h-4 w-4" /> },
    { value: 'mx', label: 'México', icon: <Globe className="h-4 w-4" /> },
    { value: 'ar', label: 'Argentina', icon: <Globe className="h-4 w-4" /> },
    { value: 'co', label: 'Colombia', icon: <Globe className="h-4 w-4" /> }
  ];

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    const profile = await GameService.getUserProfile(user.id);
    setUserProfile(profile);
  }, [user]);

  const fetchLeaderboards = useCallback(async () => {
    try {
      setLoading(true);
      const newLeaderboards: { [key: string]: LeaderboardEntry[] } = {};

      // Fetch all categories
      for (const category of categories) {
        const region = selectedRegion === 'global' ? undefined : selectedRegion;
        const data = await GameService.getLeaderboards(category.value, region);
        newLeaderboards[category.value] = data;
      }

      setLeaderboards(newLeaderboards);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las clasificaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (user) {
      fetchUserProfile();
      fetchLeaderboards();
    }
  }, [user, authLoading, navigate, fetchUserProfile, fetchLeaderboards]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchLeaderboards();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchLeaderboards]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">🥇 1º</Badge>;
    if (rank === 2) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-black">🥈 2º</Badge>;
    if (rank === 3) return <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">🥉 3º</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const formatScore = (category: string, score: number) => {
    switch (category) {
      case 'xp':
        return `${score.toLocaleString()} XP`;
      case 'games_won':
        return `${score} victorias`;
      case 'accuracy':
        return `${score}%`;
      case 'games_played':
        return `${score} partidas`;
      default:
        return score.toString();
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'xp':
        return 'Puntos de experiencia totales acumulados';
      case 'games_won':
        return 'Número total de partidas ganadas';
      case 'accuracy':
        return 'Porcentaje de aciertos en adivinanzas';
      case 'games_played':
        return 'Número total de partidas jugadas';
      default:
        return '';
    }
  };

  // Don't render anything if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-light">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check premium status
  if (!userProfile?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Clasificaciones</h1>
          </div>

          <Card className="game-card text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Requiere Premium</h2>
              <p className="text-muted-foreground mb-6">
                Las clasificaciones están disponibles exclusivamente para usuarios Premium.
                Compite con jugadores de todo el mundo y muestra tus habilidades.
              </p>
              <Button 
                onClick={() => navigate('/premium')}
                className="game-button bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black"
              >
                <Crown className="h-4 w-4 mr-2" />
                Actualizar a Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentLeaderboard = leaderboards[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Clasificaciones</h1>
          <Badge variant="secondary" className="ml-auto">
            <Trophy className="h-3 w-3 mr-1" />
            Actualizado cada 30s
          </Badge>
        </div>

        {/* Filters */}
        <Card className="game-card mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          {category.icon}
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Región</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        <div className="flex items-center gap-2">
                          {region.icon}
                          {region.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Description */}
        <Card className="game-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {categories.find(c => c.value === selectedCategory)?.icon}
              <div>
                <h3 className="font-semibold">
                  {categories.find(c => c.value === selectedCategory)?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getCategoryDescription(selectedCategory)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top 100 - {categories.find(c => c.value === selectedCategory)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando clasificaciones...</p>
              </div>
            ) : currentLeaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
                <p className="text-muted-foreground">
                  Sé el primero en aparecer en esta clasificación
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentLeaderboard.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      entry.user_id === user.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar 
                        username={entry.profiles.username}
                        avatarUrl={entry.profiles.avatar_url || undefined}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {entry.profiles.display_name || entry.profiles.username}
                          </span>
                          {entry.profiles.is_premium && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {entry.user_id === user.id && (
                            <Badge variant="secondary" className="text-xs">Tú</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            @{entry.profiles.username}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Nivel {entry.profiles.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatScore(selectedCategory, entry.score)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getRankBadge(entry.rank)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Stats Summary */}
        {userProfile && (
          <Card className="game-card mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tu Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userProfile.level}</div>
                  <div className="text-sm text-muted-foreground">Nivel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.xp?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">XP Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.karma || 50}
                  </div>
                  <div className="text-sm text-muted-foreground">Karma</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.is_premium ? 'Premium' : 'Gratuito'}
                  </div>
                  <div className="text-sm text-muted-foreground">Plan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
