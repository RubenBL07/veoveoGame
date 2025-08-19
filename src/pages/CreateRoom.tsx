import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CreateRoom = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState('5');
  const [aiMode, setAiMode] = useState('random');

  // Redirect if not authenticated - IMMEDIATE redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

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

  const generateRoomCode = async () => {
    let roomCode;
    let isUnique = false;
    
    while (!isUnique) {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Check if code already exists
      const { data, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();
      
      // If no room found with this code, it's unique
      if (error && error.code === 'PGRST116') {
        isUnique = true;
      } else if (error) {
        throw error;
      }
    }
    
    return roomCode;
  };

  const handleCreateRoom = async () => {
    // Double check authentication before proceeding
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const roomCode = await generateRoomCode();
      
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          host_id: user.id,
          room_code: roomCode,
          max_players: parseInt(maxPlayers),
          ai_mode: aiMode,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as player
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: user.id
        });

      if (playerError) throw playerError;

      toast({
        title: "¡Sala creada!",
        description: `Código de sala: ${roomCode}`,
      });

      navigate(`/room/${room.id}`);
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
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Máximo de Jugadores</Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 jugadores</SelectItem>
                  <SelectItem value="4">4 jugadores</SelectItem>
                  <SelectItem value="5">5 jugadores</SelectItem>
                  <SelectItem value="6">6 jugadores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiMode">Modo de IA</Label>
              <Select value={aiMode} onValueChange={setAiMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Aleatorio</SelectItem>
                  <SelectItem value="host_choice">Elección del Host</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">¿Cómo funciona?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La IA seleccionará objetos en las fotos según el modo elegido. 
                ¡Los jugadores deben adivinar qué objeto "ve" la IA!
              </p>
            </div>

            <Button 
              onClick={handleCreateRoom} 
              className="w-full game-button"
              disabled={loading}
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