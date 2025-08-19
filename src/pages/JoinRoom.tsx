import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const JoinRoom = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double check authentication before proceeding
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    
    // Validate room code format
    const trimmedCode = roomCode.trim().toUpperCase();
    if (!trimmedCode) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de sala",
        variant: "destructive",
      });
      return;
    }

    if (trimmedCode.length !== 6) {
      toast({
        title: "Error",
        description: "El código de sala debe tener 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      toast({
        title: "Error",
        description: "El código de sala solo puede contener letras y números",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', trimmedCode)
        .maybeSingle();

      if (roomError || !room) {
        throw new Error('Sala no encontrada');
      }

      if (room.status !== 'waiting') {
        throw new Error('Esta sala ya está en juego');
      }

      if (room.current_players >= room.max_players) {
        throw new Error('La sala está llena');
      }

      // Check if user is already in the room
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPlayer) {
        // User already in room, just navigate
        navigate(`/room/${room.id}`);
        return;
      }

      // Add user to room
      const { error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: user.id
        });

      if (joinError) throw joinError;

      // Update room player count
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', room.id);

      if (updateError) throw updateError;

      toast({
        title: "¡Te has unido!",
        description: `Bienvenido a la sala ${trimmedCode}`,
      });

      navigate(`/room/${room.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al unirse a la sala";
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
          <h1 className="text-2xl font-bold text-primary">Unirse a Sala</h1>
        </div>

        <Card className="game-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Hash className="h-6 w-6" />
              Código de Sala
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Ingresa el código de 6 caracteres</Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center font-mono text-lg"
                  required
                />
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Pide el código de sala al anfitrión para unirte al juego
                </p>
              </div>

              <Button 
                type="submit"
                className="w-full game-button"
                disabled={loading || roomCode.length !== 6}
              >
                {loading ? 'Uniéndose...' : 'Unirse a la Sala'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinRoom;