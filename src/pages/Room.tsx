import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/Avatar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ArrowLeft, Users, Play, Copy, Crown, Camera, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Room {
  id: string;
  room_code: string;
  host_id: string;
  max_players: number;
  current_players: number;
  status: string;
  ai_mode: string;
}

interface Player {
  id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Game {
  id: string;
  status: string;
  current_round: number;
  total_rounds: number;
}

const Room = () => {
  const { roomId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingGame, setStartingGame] = useState(false);

  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;

    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      // Fetch players with profiles
      const { data: roomPlayers, error: roomPlayersError } = await supabase
        .from('room_players')
        .select('id, user_id, joined_at')
        .eq('room_id', roomId);

      if (roomPlayersError) throw roomPlayersError;

      // Fetch profiles for players
      const userIds = roomPlayers?.map(p => p.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine player data with profiles
      const playersWithProfiles = roomPlayers?.map(player => {
        const profile = profiles?.find(p => p.user_id === player.user_id);
        return {
          ...player,
          profiles: profile ? {
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url
          } : null
        };
      }) || [];

      setPlayers(playersWithProfiles.filter(p => p.profiles));

      // Check for active game
      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'active')
        .maybeSingle();

      setGame(gameData);
    } catch (error: unknown) {
      console.error('Error fetching room data:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo cargar la información de la sala";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate]);

  const subscribeToRoomUpdates = useCallback(() => {
    if (!roomId) return;

    const channel = supabase
      .channel('room-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchRoomData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchRoomData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchRoomData]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (roomId && user) {
      fetchRoomData();
      const cleanup = subscribeToRoomUpdates();
      return cleanup;
    }
  }, [roomId, user, fetchRoomData, subscribeToRoomUpdates]);

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

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.room_code);
      toast({
        title: "¡Copiado!",
        description: "Código copiado al portapapeles",
      });
    }
  };

  const startGame = async () => {
    if (!room || !user || room.host_id !== user.id) return;

    if (players.length < 2) {
      toast({
        title: "Pocos jugadores",
        description: "Se necesitan al menos 2 jugadores para empezar",
        variant: "destructive",
      });
      return;
    }

    setStartingGame(true);
    try {
      const { data: newGame, error } = await supabase
        .from('games')
        .insert({
          room_id: room.id,
          total_rounds: 5,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/game/${newGame.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al iniciar el juego";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setStartingGame(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando sala..." className="bg-gradient-to-br from-primary/10 to-secondary" />;
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
        <div className="text-center">
          <h1 className="text-xl">Sala no encontrada</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (game) {
    navigate(`/game/${game.id}`);
    return null;
  }

  const isHost = user?.id === room.host_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Sala de Juego</h1>
        </div>

        {/* Room Info */}
        <Card className="game-card mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-xl font-bold">Código: {room.room_code}</h2>
              <Button variant="ghost" size="sm" onClick={copyRoomCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {room.current_players}/{room.max_players}
              </Badge>
              <Badge variant="outline">
                IA: {room.ai_mode}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Players */}
        <Card className="game-card mb-6">
          <CardHeader>
            <CardTitle>Jugadores ({players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players.map((player) => {
                if (!player.profiles) return null;
                return (
                  <div key={player.id} className="flex items-center gap-3">
                    <Avatar 
                      username={player.profiles.username}
                      avatarUrl={player.profiles.avatar_url || undefined}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {player.profiles.display_name || player.profiles.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{player.profiles.username}
                      </p>
                    </div>
                    {player.user_id === room.host_id && (
                      <Crown className="h-4 w-4 text-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {isHost ? (
          <Button 
            onClick={startGame}
            className="w-full game-button"
            disabled={startingGame || players.length < 2}
          >
            <Play className="h-4 w-4 mr-2" />
            {startingGame ? 'Iniciando...' : 'Comenzar Juego'}
          </Button>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              Esperando que el anfitrión inicie el juego...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;