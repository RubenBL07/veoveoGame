import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Save, Crown, Trophy, Star, Target, Users, Settings, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import GameService from '@/lib/gameService';

interface Profile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  level: number;
  xp: number;
  karma: number;
  private_rooms_today: number;
  login_streak: number;
  last_login: string;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  earned_at: string;
}

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  correctGuesses: number;
  photosTaken: number;
  totalXP: number;
  level: number;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    const profileData = await GameService.getUserProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      setEditedProfile({
        display_name: profileData.display_name,
        username: profileData.username
      });
    }
  }, [user]);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    
    const achievementsData = await GameService.getUserAchievements(user.id);
    setAchievements(achievementsData);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (user) {
      Promise.all([fetchProfile(), fetchAchievements()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, authLoading, navigate, fetchProfile, fetchAchievements]);

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editedProfile.display_name,
          username: editedProfile.username
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente",
      });

      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil se actualizó correctamente",
      });

      fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el avatar",
        variant: "destructive",
      });
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const xpForCurrentLevel = (profile.level - 1) * 1000;
    const xpForNextLevel = profile.level * 1000;
    const currentLevelXp = profile.xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return (currentLevelXp / xpNeeded) * 100;
  };

  const getKarmaColor = (karma: number) => {
    if (karma >= 80) return 'text-green-500';
    if (karma >= 60) return 'text-yellow-500';
    if (karma >= 40) return 'text-orange-500';
    return 'text-red-500';
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

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Mi Perfil</h1>
          {profile.is_premium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
              <Crown className="h-3 w-3 mr-1" />
              PREMIUM
            </Badge>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card className="game-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar 
                      username={profile.username}
                      avatarUrl={profile.avatar_url || undefined}
                      size="xl"
                    />
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">
                        {profile.display_name || profile.username}
                      </h2>
                      {profile.is_premium && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">@{profile.username}</p>
                    
                    {/* Level and XP */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Nivel {profile.level}</span>
                        <span className="text-sm text-muted-foreground">{profile.xp} XP</span>
                      </div>
                      <Progress value={getLevelProgress()} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {profile.level * 1000 - profile.xp} XP para el siguiente nivel
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className={`text-2xl font-bold ${getKarmaColor(profile.karma)}`}>
                          {profile.karma}
                        </div>
                        <div className="text-xs text-muted-foreground">Karma</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {profile.login_streak}
                        </div>
                        <div className="text-xs text-muted-foreground">Días seguidos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="game-card">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Partidas Ganadas</div>
                </CardContent>
              </Card>
              <Card className="game-card">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Aciertos</div>
                </CardContent>
              </Card>
              <Card className="game-card">
                <CardContent className="p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Fotos Tomadas</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Logros ({achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes logros aún</h3>
                    <p className="text-muted-foreground">
                      ¡Juega más partidas para desbloquear logros!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-black" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.achievement_name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Obtenido el {new Date(achievement.earned_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="display_name">Nombre para mostrar</Label>
                  <Input
                    id="display_name"
                    value={editing ? editedProfile.display_name || '' : profile.display_name || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    disabled={!editing}
                    placeholder="Tu nombre para mostrar"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={editing ? editedProfile.username || '' : profile.username}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                    disabled={!editing}
                    placeholder="Nombre de usuario único"
                  />
                </div>
                
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="game-button"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setEditedProfile({
                            display_name: profile.display_name,
                            username: profile.username
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setEditing(true)}
                      className="game-button"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {!profile.is_premium && (
              <Card className="game-card">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Actualiza a Premium</h3>
                  <p className="text-muted-foreground mb-4">
                    Desbloquea todas las funcionalidades avanzadas y disfruta de una experiencia sin límites.
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;