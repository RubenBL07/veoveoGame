import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Globe, Clock, Search, Filter, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import GameService from '@/lib/gameService';

interface PublicRoom {
  id: string;
  room_name: string;
  max_players: number;
  current_players: number;
  language: string;
  time_per_round: number;
  ai_mode: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const PublicRooms = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [userProfile, setUserProfile] = useState<{ is_premium?: boolean } | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    const profile = await GameService.getUserProfile(user.id);
    setUserProfile(profile);
  }, [user]);

  const fetchPublicRooms = useCallback(async () => {
    try {
      const publicRooms = await GameService.getPublicRooms();
      setRooms(publicRooms);
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las salas públicas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (user) {
      fetchUserProfile();
      fetchPublicRooms();
    }
  }, [user, authLoading, navigate, fetchUserProfile, fetchPublicRooms]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchPublicRooms();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, fetchPublicRooms]);

  const handleJoinRoom = async (roomId: string) => {
    if (!user) return;

    setJoiningRoom(roomId);
    try {
      // Check if user is already in the room
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPlayer) {
        navigate(`/room/${roomId}`);
        return;
      }

      // Add user to room
      const { error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomId,
          user_id: user.id
        });

      if (joinError) throw joinError;

      // Update room player count
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        await supabase
          .from('rooms')
          .update({ current_players: room.current_players + 1 })
          .eq('id', roomId);
      }

      toast({
        title: "¡Te has unido!",
        description: "Bienvenido a la sala pública",
      });

      navigate(`/room/${roomId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al unirse a la sala";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setJoiningRoom(null);
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
            <h1 className="text-2xl font-bold text-primary">Salas Públicas</h1>
          </div>

          <Card className="game-card text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-10 w-10 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Requiere Premium</h2>
              <p className="text-muted-foreground mb-6">
                Las salas públicas están disponibles exclusivamente para usuarios Premium.
                Únete a jugadores de todo el mundo y compite en tiempo real.
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

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.profiles.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.profiles.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = languageFilter === 'all' || room.language === languageFilter;
    const matchesTime = timeFilter === 'all' || room.time_per_round.toString() === timeFilter;
    
    return matchesSearch && matchesLanguage && matchesTime;
  });

  const getLanguageLabel = (lang: string) => {
    const labels: { [key: string]: string } = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'pt': 'Português',
      'de': 'Deutsch'
    };
    return labels[lang] || lang;
  };

  const getTimeLabel = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds === 60) return '1m';
    return `${Math.floor(seconds / 60)}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Salas Públicas</h1>
          <Badge variant="secondary" className="ml-auto">
            <Globe className="h-3 w-3 mr-1" />
            {rooms.length} salas disponibles
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="game-card mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre de sala o anfitrión..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los idiomas</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier tiempo</SelectItem>
                  <SelectItem value="30">30 segundos</SelectItem>
                  <SelectItem value="60">1 minuto</SelectItem>
                  <SelectItem value="120">2 minutos</SelectItem>
                  <SelectItem value="180">3 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rooms List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando salas públicas...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <Card className="game-card text-center">
            <CardContent className="p-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay salas disponibles</h3>
              <p className="text-muted-foreground">
                {searchTerm || languageFilter !== 'all' || timeFilter !== 'all'
                  ? 'No se encontraron salas con los filtros aplicados'
                  : 'No hay salas públicas activas en este momento. ¡Crea una sala y sé el primero!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="game-card hover-scale">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg truncate">{room.room_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar 
                          username={room.profiles.username}
                          avatarUrl={room.profiles.avatar_url || undefined}
                          size="sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          {room.profiles.display_name || room.profiles.username}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.current_players}/{room.max_players}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Idioma:</span>
                    <span>{getLanguageLabel(room.language)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeLabel(room.time_per_round)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Modo IA:</span>
                    <span>{room.ai_mode === 'random' ? 'Automático' : 'Manual'}</span>
                  </div>
                  <Button 
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={joiningRoom === room.id || room.current_players >= room.max_players}
                    className="w-full game-button"
                  >
                    {joiningRoom === room.id ? 'Uniéndose...' : 
                     room.current_players >= room.max_players ? 'Sala llena' : 'Unirse'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRooms;
