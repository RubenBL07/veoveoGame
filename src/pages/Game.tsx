import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Camera, Upload, Eye, Trophy, Users, Clock } from 'lucide-react';
import { aiService } from '@/lib/aiService';
import GameService from '@/lib/gameService';
import { CameraService } from '@/lib/cameraService';
import { usePlatform } from '@/hooks/usePlatform';

interface GameData {
  id: string;
  room_id: string;
  current_round: number;
  total_rounds: number;
  current_turn_user_id: string;
  status: 'waiting' | 'photo_taking' | 'guessing' | 'finished';
}

interface GameRound {
  id: string;
  game_id: string;
  round_number: number;
  photographer_id: string;
  photo_url?: string;
  selected_object?: string;
  selected_object_spanish?: string;
  selected_object_english?: string;
  first_letter?: string;
  detected_objects?: string[];
  winner_id?: string;
  status: 'waiting' | 'photo_taken' | 'object_selected' | 'guessing' | 'finished';
  start_time?: string;
  end_time?: string;
}

interface PlayerScore {
  user_id: string;
  score: number;
  profiles: {
    username: string;
    display_name?: string;
  };
}

interface PlayerGuess {
  id: string;
  user_id: string;
  guess: string;
  is_correct: boolean;
  submitted_at: string;
  profiles: {
    username: string;
    display_name?: string;
  };
}

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isNative } = usePlatform();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [playerGuesses, setPlayerGuesses] = useState<PlayerGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchGameData = useCallback(async () => {
    try {
      // Fetch game data
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;
      setGameData(game as GameData);

      // Fetch current round
      const { data: round, error: roundError } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('game_id', gameId)
        .eq('round_number', game.current_round)
        .single();

      if (roundError && roundError.code !== 'PGRST116') {
        throw roundError;
      }
      setCurrentRound(round as GameRound);

      // Fetch player scores
      const { data: scores, error: scoresError } = await supabase
        .from('player_scores')
        .select(`
          user_id,
          score,
          profiles(
            username,
            display_name
          )
        `)
        .eq('game_id', gameId)
        .order('score', { ascending: false });

      if (scoresError) throw scoresError;
      setPlayerScores((scores as PlayerScore[]) || []);


      // Fetch guesses for current round if exists
      if (round) {
        const { data: guesses, error: guessesError } = await supabase
          .from('player_guesses')
          .select(`
            *,
            profiles(
              username,
              display_name
            )
          `)
          .eq('round_id', round.id)
          .order('submitted_at', { ascending: true });

        if (guessesError) throw guessesError;
        setPlayerGuesses(guesses || []);
      }

    } catch (error: unknown) {
      console.error('Error fetching game data:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo cargar los datos del juego";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [gameId, toast]);

  const subscribeToGameUpdates = useCallback(() => {
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        () => {
          fetchGameData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rounds',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchGameData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_guesses',
        },
        () => {
          fetchGameData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchGameData]);

  useEffect(() => {
    if (!user || !gameId) {
      navigate('/auth');
      return;
    }

    fetchGameData();
    const cleanup = subscribeToGameUpdates();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [gameId, user, navigate, fetchGameData, subscribeToGameUpdates, cameraStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: unknown) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await uploadPhoto(blob);
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadPhoto(file);
  };

  const handleNativeCamera = async () => {
    try {
      // Verificar permisos
      const hasPermission = await CameraService.checkPermissions();
      if (!hasPermission) {
        const granted = await CameraService.requestPermissions();
        if (!granted) {
          toast({
            title: "Permisos requeridos",
            description: "Necesitas permisos de cámara para jugar",
            variant: "destructive"
          });
          return;
        }
      }

      // Tomar foto
      const photo = await CameraService.takePhoto();
      
      // Convertir base64 a Blob
      const blob = CameraService.base64ToBlob(photo.base64, photo.format);
      
      // Subir foto
      await uploadPhoto(blob);

    } catch (error) {
      console.error('Error with native camera:', error);
      toast({
        title: "Error de cámara",
        description: "No se pudo tomar la foto",
        variant: "destructive"
      });
    }
  };

  const uploadPhoto = async (file: Blob) => {
    if (!user || !currentRound) return;

    setUploading(true);
    try {
      const fileName = `${user.id}/${currentRound.id}-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('game-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('game-photos')
        .getPublicUrl(fileName);

      // Update round with photo URL
      const { error: updateError } = await supabase
        .from('game_rounds')
        .update({ 
          photo_url: publicUrl,
          status: 'photo_taken'
        })
        .eq('id', currentRound.id);

      if (updateError) throw updateError;

      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setShowCamera(false);
      }

      // Use AI service for real object detection
      const imageFile = file instanceof File ? file : new File([file], 'photo.jpg', { type: 'image/jpeg' });
      const aiResponse = await aiService.detectObjects(imageFile);
      
      if (aiResponse.success && aiResponse.objects.length > 0) {
        const objectNames = aiResponse.objects.map(obj => obj.name);
        setDetectedObjects(objectNames);
        
        if (!aiService.isConfigured()) {
          toast({
            title: "Usando detección simulada",
            description: "Configura VITE_OPENAI_API_KEY para usar IA real",
            variant: "default"
          });
        }
      } else {
        // Fallback to mock objects if AI service fails
        const mockObjects = [
          'mesa', 'silla', 'libro', 'teléfono', 'computadora', 'taza', 'planta',
          'lámpara', 'ventana', 'puerta', 'reloj', 'cuadro', 'almohada', 'botella'
        ];
        const randomObjects = mockObjects.sort(() => 0.5 - Math.random()).slice(0, 8);
        setDetectedObjects(randomObjects);
      }

      toast({
        title: "¡Foto subida!",
        description: "Ahora selecciona el objeto que ves",
      });

    } catch (error: unknown) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const selectObject = async (object: string) => {
    if (!currentRound) return;

    try {
      const { error } = await supabase
        .from('game_rounds')
        .update({
          selected_object: object,
          selected_object_spanish: object,
          selected_object_english: object, // In a real app, translate this
          first_letter: object.charAt(0).toUpperCase(),
          detected_objects: detectedObjects,
          status: 'object_selected'
        })
        .eq('id', currentRound.id);

      if (error) throw error;

      // Update game status to guessing
      const { error: gameError } = await supabase
        .from('games')
        .update({ status: 'guessing' })
        .eq('id', gameId);

      if (gameError) throw gameError;

      setSelectedObject(object);
      
      toast({
        title: "¡Objeto seleccionado!",
        description: `Los demás jugadores ahora adivinarán: ${object}`,
      });

    } catch (error: unknown) {
      console.error('Error selecting object:', error);
      toast({
        title: "Error",
        description: "No se pudo seleccionar el objeto",
        variant: "destructive",
      });
    }
  };

  const submitGuess = async () => {
    if (!guess.trim() || !currentRound || !user) return;

    try {
      const isCorrect = guess.toLowerCase().trim() === currentRound.selected_object?.toLowerCase();
      
      const { error } = await supabase
        .from('player_guesses')
        .insert({
          round_id: currentRound.id,
          user_id: user.id,
          guess: guess.trim(),
          is_correct: isCorrect
        });

      if (error) throw error;

      if (isCorrect) {
        // Update player score
        const { error: scoreError } = await supabase
          .from('player_scores')
          .upsert({
            game_id: gameId!,
            user_id: user.id,
            score: (playerScores.find(p => p.user_id === user.id)?.score || 0) + 10
          });

        if (scoreError) throw scoreError;

        // Mark round as finished and set winner
        const { error: roundError } = await supabase
          .from('game_rounds')
          .update({
            winner_id: user.id,
            status: 'finished',
            end_time: new Date().toISOString()
          })
          .eq('id', currentRound.id);

        if (roundError) throw roundError;

        // Award XP for correct guess
        await GameService.awardXP(user.id, 100, 'Correct guess');

        toast({
          title: "¡Correcto!",
          description: "¡Has adivinado el objeto! +100 XP",
        });
      }

      setGuess('');

    } catch (error: unknown) {
      console.error('Error submitting guess:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive",
      });
    }
  };

  const nextRound = async () => {
    if (!gameData) return;

    try {
      if (gameData.current_round >= gameData.total_rounds) {
        // Game finished - handle completion rewards
        const { error } = await supabase
          .from('games')
          .update({ status: 'finished' })
          .eq('id', gameId);

        if (error) throw error;

        // Calculate game completion stats
        const userScore = playerScores.find(p => p.user_id === user?.id)?.score || 0;
        const maxScore = Math.max(...playerScores.map(p => p.score));
        const won = userScore === maxScore && userScore > 0;
        
        const userGuesses = playerGuesses.filter(g => g.user_id === user?.id);
        const correctGuesses = userGuesses.filter(g => g.is_correct).length;
        
        const userProfile = await GameService.getUserProfile(user?.id || '');
        
        // Handle game completion rewards
        await GameService.handleGameCompletion(user?.id || '', {
          won,
          correctGuesses,
          photosTaken: currentRound?.photographer_id === user?.id ? 1 : 0,
          isPremium: userProfile?.is_premium || false
        });

        return;
      }

      // Create next round
      const nextRoundNumber = gameData.current_round + 1;
      const { error: roundError } = await supabase
        .from('game_rounds')
        .insert({
          game_id: gameId!,
          round_number: nextRoundNumber,
          photographer_id: gameData.current_turn_user_id, // In a real app, rotate this
          status: 'waiting'
        });

      if (roundError) throw roundError;

      // Update game
      const { error: gameError } = await supabase
        .from('games')
        .update({
          current_round: nextRoundNumber,
          status: 'photo_taking'
        })
        .eq('id', gameId);

      if (gameError) throw gameError;

    } catch (error: unknown) {
      console.error('Error starting next round:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la siguiente ronda",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!gameData || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se pudo cargar el juego
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full mt-4"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPhotographer = currentRound?.photographer_id === user.id;
  const canGuess = currentRound?.status === 'object_selected' && !isPhotographer;
  const hasGuessed = playerGuesses.some(g => g.user_id === user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Veo Veo
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Ronda {gameData.current_round}/{gameData.total_rounds}
                </Badge>
                <Badge 
                  variant={gameData.status === 'finished' ? 'default' : 'secondary'}
                >
                  {gameData.status === 'waiting' && 'Esperando'}
                  {gameData.status === 'photo_taking' && 'Tomando foto'}
                  {gameData.status === 'guessing' && 'Adivinando'}
                  {gameData.status === 'finished' && 'Terminado'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Taking Phase */}
            {gameData.status === 'photo_taking' && isPhotographer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Toma una foto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!currentRound?.photo_url && (
                    <>
                      <p className="text-muted-foreground">
                        Toma una foto de un objeto que los demás jugadores deberán adivinar.
                      </p>
                      
                      <div className="flex gap-2">
                        {isNative ? (
                          <Button onClick={handleNativeCamera} disabled={uploading}>
                            <Camera className="h-4 w-4 mr-2" />
                            {uploading ? 'Procesando...' : 'Tomar foto'}
                          </Button>
                        ) : (
                          <Button onClick={startCamera} disabled={showCamera}>
                            <Camera className="h-4 w-4 mr-2" />
                            Usar cámara
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Subir archivo
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {showCamera && (
                        <div className="space-y-4">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full max-w-md mx-auto rounded-lg"
                          />
                          <div className="flex justify-center">
                            <Button onClick={capturePhoto} disabled={uploading}>
                              {uploading ? 'Subiendo...' : 'Capturar foto'}
                            </Button>
                          </div>
                        </div>
                      )}

                      <canvas ref={canvasRef} className="hidden" />
                    </>
                  )}

                  {currentRound?.photo_url && currentRound.status === 'photo_taken' && (
                    <div className="space-y-4">
                      <img 
                        src={currentRound.photo_url} 
                        alt="Foto del juego" 
                        className="w-full max-w-md mx-auto rounded-lg"
                      />
                      <p className="text-center text-muted-foreground">
                        Ahora selecciona el objeto que quieres que adivinen:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {detectedObjects.map((object, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => selectObject(object)}
                            className="capitalize"
                          >
                            {object}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Waiting for photo */}
            {gameData.status === 'photo_taking' && !isPhotographer && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-lg font-medium">
                      Esperando a que el fotógrafo tome la foto...
                    </p>
                    <LoadingSpinner />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guessing Phase */}
            {gameData.status === 'guessing' && currentRound && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    ¡Adivina el objeto!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentRound.photo_url && (
                    <img 
                      src={currentRound.photo_url} 
                      alt="Foto del juego" 
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                  )}
                  
                  {currentRound.first_letter && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Pista:</p>
                      <p className="text-2xl font-bold">
                        Empieza por: {currentRound.first_letter}
                      </p>
                    </div>
                  )}

                  {canGuess && !hasGuessed && (
                    <div className="flex gap-2">
                      <Input
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                      />
                      <Button onClick={submitGuess} disabled={!guess.trim()}>
                        Enviar
                      </Button>
                    </div>
                  )}

                  {hasGuessed && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="font-medium">Ya has enviado tu respuesta</p>
                      <p className="text-sm text-muted-foreground">
                        Esperando a los demás jugadores...
                      </p>
                    </div>
                  )}

                  {isPhotographer && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium">Eres el fotógrafo</p>
                      <p className="text-sm text-muted-foreground">
                        Espera a que los demás adivinen tu objeto
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Round Results */}
            {currentRound?.status === 'finished' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    ¡Ronda terminada!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-lg">
                      El objeto era: <span className="font-bold">{currentRound.selected_object}</span>
                    </p>
                    {currentRound.winner_id && (
                      <p className="text-green-600 font-medium">
                        ¡{playerScores.find(p => p.user_id === currentRound.winner_id)?.profiles.display_name || 
                          playerScores.find(p => p.user_id === currentRound.winner_id)?.profiles.username} 
                          adivinó correctamente!
                      </p>
                    )}
                  </div>

                  {gameData.current_round < gameData.total_rounds && isPhotographer && (
                    <div className="text-center">
                      <Button onClick={nextRound}>
                        Siguiente ronda
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Game Finished */}
            {gameData.status === 'finished' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    ¡Juego terminado!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-4">Puntuaciones finales:</p>
                    <div className="space-y-2">
                      {playerScores.map((player, index) => (
                        <div key={player.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              #{index + 1}
                            </Badge>
                            <span>{player.profiles.display_name || player.profiles.username}</span>
                          </div>
                          <span className="font-bold">{player.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button onClick={() => navigate('/')}>
                      Volver al inicio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Puntuaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {playerScores.map((player, index) => (
                    <div key={player.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? 'default' : 'outline'} className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className={`text-sm ${player.user_id === user.id ? 'font-bold' : ''}`}>
                          {player.profiles.display_name || player.profiles.username}
                        </span>
                      </div>
                      <span className="font-medium">{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Guesses */}
            {playerGuesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Respuestas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {playerGuesses.map((guess) => (
                      <div key={guess.id} className="flex items-center justify-between text-sm">
                        <span className={guess.is_correct ? 'text-green-600 font-medium' : ''}>
                          {guess.profiles.display_name || guess.profiles.username}
                        </span>
                        <span className={`${guess.is_correct ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                          {guess.guess} {guess.is_correct && '✓'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;