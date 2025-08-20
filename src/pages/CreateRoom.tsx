import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Zap, Crown, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import GameService from '@/lib/gameService';

const CreateRoom = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState('5');
  const [aiMode, setAiMode] = useState('random');
  const [roomType, setRoomType] = useState<'private' | 'public'>('private');
  const [timePerRound, setTimePerRound] = useState('60');
  const [language, setLanguage] = useState('es');
  const [roomName, setRoomName] = useState('');
  const [userProfile, setUserProfile] = useState<{ is_premium?: boolean; private_rooms_today?: number } | null>(null);

  // Redirect if not authenticated - IMMEDIATE redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      GameService.getUserProfile(user.id).then(setUserProfile);
    }
  }, [user]);

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
    return null; // Will redirect via useEffect
  }

  const handleCreateRoom = async () => {
    // Double check authentication before proceeding
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Validate room name for public rooms
    if (roomType === 'public' && (!roomName.trim() || roomName.trim().length > 25)) {
      toast({
        title: "Error",
        description: "El nombre de la sala pública debe tener entre 1 y 25 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const roomId = await GameService.createRoom({
        hostId: user.id,
        roomType: roomType,
        maxPlayers: parseInt(maxPlayers),
        aiMode: aiMode,
        timePerRound: parseInt(timePerRound),
        language: language,
        roomName: roomType === 'public' ? roomName.trim() : null
      });

      if (roomId) {
        toast({
          title: "¡Sala creada!",
          description: roomType === 'private' ? "Comparte el código con tus amigos" : "Tu sala pública está disponible",
        });
        navigate(`/room/${roomId}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear la sala";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPremium = userProfile?.is_premium;
  const canCreatePrivate = userProfile ? (isPremium || userProfile.private_rooms_today < 3) : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Crear Sala</h1>
        </div>

        <Card className="game-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Nueva Sala de Juego
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="roomType">Tipo de Sala</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={roomType === 'private' ? 'default' : 'outline'}
                  onClick={() => setRoomType('private')}
                  className="flex items-center gap-2"
                  disabled={!canCreatePrivate}
                >
                  <Users className="h-4 w-4" />
                  Privada
                  {!isPremium && userProfile && (
                    <span className="text-xs bg-muted px-1 rounded">
                      {userProfile.private_rooms_today}/3
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant={roomType === 'public' ? 'default' : 'outline'}
                  onClick={() => setRoomType('public')}
                  className="flex items-center gap-2"
                  disabled={!isPremium}
                >
                  <Globe className="h-4 w-4" />
                  Pública
                  {!isPremium && <Crown className="h-3 w-3" />}
                </Button>
              </div>
              {!isPremium && roomType === 'public' && (
                <p className="text-xs text-muted-foreground">
                  Las salas públicas requieren suscripción Premium
                </p>
              )}
              {!canCreatePrivate && roomType === 'private' && (
                <p className="text-xs text-muted-foreground">
                  Límite diario alcanzado. Actualiza a Premium para crear salas ilimitadas.
                </p>
              )}
            </div>

            {/* Room Name (Public only) */}
            {roomType === 'public' && (
              <div className="space-y-2">
                <Label htmlFor="roomName">Nombre de la Sala</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Mi sala divertida"
                  maxLength={25}
                />
                <p className="text-xs text-muted-foreground">
                  {roomName.length}/25 caracteres
                </p>
              </div>
            )}

            {/* Max Players */}
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Máximo de Jugadores</Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 jugadores</SelectItem>
                  <SelectItem value="3">3 jugadores</SelectItem>
                  <SelectItem value="4">4 jugadores</SelectItem>
                  <SelectItem value="5">5 jugadores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Per Round */}
            <div className="space-y-2">
              <Label htmlFor="timePerRound">Tiempo por Ronda</Label>
              <Select value={timePerRound} onValueChange={setTimePerRound}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 segundos</SelectItem>
                  <SelectItem value="60">1 minuto</SelectItem>
                  <SelectItem value="120">2 minutos</SelectItem>
                  <SelectItem value="180">3 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Mode */}
            <div className="space-y-2">
              <Label htmlFor="aiMode">Modo de IA</Label>
              <Select value={aiMode} onValueChange={setAiMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Automático</SelectItem>
                  <SelectItem value="host_choice">Manual (Host elige)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">¿Cómo funciona?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {aiMode === 'random' 
                  ? 'La IA seleccionará automáticamente un objeto de la foto para que adivinen.'
                  : 'Tú elegirás qué objeto de la lista detectada quieres que adivinen.'
                }
              </p>
            </div>

            <Button 
              onClick={handleCreateRoom} 
              className="w-full game-button"
              disabled={loading || (roomType === 'public' && !roomName.trim()) || (roomType === 'private' && !canCreatePrivate)}
            >
              {loading ? 'Creando...' : 'Crear Sala'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRoom;