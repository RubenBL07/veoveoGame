import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, UserPlus, UserCheck, UserX, Search, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import GameService from '@/lib/gameService';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    is_premium: boolean;
  };
}

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending';
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    is_premium: boolean;
  };
}

const Friends = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          *,
          profiles!friends_friend_id_fkey(username, display_name, avatar_url, level, is_premium)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Fetch pending requests (sent by others to me)
      const { data: requestsData, error: requestsError } = await supabase
        .from('friends')
        .select(`
          *,
          profiles!friends_user_id_fkey(username, display_name, avatar_url, level, is_premium)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      setFriends(friendsData || []);
      setPendingRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los amigos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (user) {
      fetchFriends();
    }
  }, [user, authLoading, navigate, fetchFriends]);

  const handleAddFriend = async () => {
    if (!user || !usernameToAdd.trim()) return;

    setAddingFriend(true);
    try {
      // Find user by username
      const { data: targetUser, error: findError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .eq('username', usernameToAdd.trim().toLowerCase())
        .single();

      if (findError || !targetUser) {
        toast({
          title: "Usuario no encontrado",
          description: "Verifica el nombre de usuario e intenta de nuevo",
          variant: "destructive",
        });
        return;
      }

      if (targetUser.user_id === user.id) {
        toast({
          title: "Error",
          description: "No puedes agregarte a ti mismo como amigo",
          variant: "destructive",
        });
        return;
      }

      // Check if friend request already exists
      const { data: existingRequest } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUser.user_id}),and(user_id.eq.${targetUser.user_id},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'accepted') {
          toast({
            title: "Ya son amigos",
            description: `Ya tienes a ${targetUser.username} como amigo`,
            variant: "destructive",
          });
        } else if (existingRequest.status === 'pending') {
          toast({
            title: "Solicitud pendiente",
            description: "Ya hay una solicitud de amistad pendiente",
            variant: "destructive",
          });
        }
        return;
      }

      // Send friend request
      const { error: addError } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: targetUser.user_id,
          status: 'pending'
        });

      if (addError) throw addError;

      toast({
        title: "Solicitud enviada",
        description: `Se envió una solicitud de amistad a ${targetUser.username}`,
      });

      setUsernameToAdd('');
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de amistad",
        variant: "destructive",
      });
    } finally {
      setAddingFriend(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, requesterId: string) => {
    try {
      // Update the request to accepted
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: "¡Solicitud aceptada!",
        description: "Ahora son amigos",
      });

      // Refresh friends list
      fetchFriends();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud de amistad fue rechazada",
      });

      // Refresh friends list
      fetchFriends();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendId: string, friendUsername: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`);

      if (error) throw error;

      toast({
        title: "Amigo removido",
        description: `${friendUsername} fue removido de tu lista de amigos`,
      });

      // Refresh friends list
      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "No se pudo remover al amigo",
        variant: "destructive",
      });
    }
  };

  const handleInviteToGame = (friendId: string, friendUsername: string) => {
    // TODO: Implement game invitation system
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La invitación a juegos estará disponible próximamente",
    });
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

  const filteredFriends = friends.filter(friend =>
    friend.profiles.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.profiles.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Amigos</h1>
          <Badge variant="secondary" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {friends.length} amigos
          </Badge>
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mis Amigos ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Solicitudes ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-6">
            {/* Add Friend Section */}
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Agregar Amigo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de usuario"
                    value={usernameToAdd}
                    onChange={(e) => setUsernameToAdd(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                  />
                  <Button 
                    onClick={handleAddFriend}
                    disabled={addingFriend || !usernameToAdd.trim()}
                    className="game-button"
                  >
                    {addingFriend ? 'Agregando...' : 'Agregar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Friends List */}
            <Card className="game-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Amigos</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar amigos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando amigos...</p>
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? 'No se encontraron amigos' : 'No tienes amigos aún'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Intenta con otro término de búsqueda'
                        : 'Agrega amigos usando sus nombres de usuario para empezar a jugar juntos'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFriends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            username={friend.profiles.username}
                            avatarUrl={friend.profiles.avatar_url || undefined}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {friend.profiles.display_name || friend.profiles.username}
                              </span>
                              {friend.profiles.is_premium && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                Nivel {friend.profiles.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              @{friend.profiles.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleInviteToGame(friend.friend_id, friend.profiles.username)}
                            variant="outline"
                            size="sm"
                            className="game-button"
                          >
                            Invitar a Jugar
                          </Button>
                          <Button
                            onClick={() => handleRemoveFriend(friend.friend_id, friend.profiles.username)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="game-card">
              <CardHeader>
                <CardTitle>Solicitudes Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando solicitudes...</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay solicitudes pendientes</h3>
                    <p className="text-muted-foreground">
                      Cuando alguien te envíe una solicitud de amistad, aparecerá aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            username={request.profiles.username}
                            avatarUrl={request.profiles.avatar_url || undefined}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {request.profiles.display_name || request.profiles.username}
                              </span>
                              {request.profiles.is_premium && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                Nivel {request.profiles.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              @{request.profiles.username} quiere ser tu amigo
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.id, request.user_id)}
                            size="sm"
                            className="game-button"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
