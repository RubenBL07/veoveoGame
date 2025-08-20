import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'finished';
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  max_participants?: number;
  current_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  rules: string[];
  rewards: {
    first_place: number;
    second_place: number;
    third_place: number;
    participation: number;
  };
  is_premium_only: boolean;
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  games_played: number;
  games_won: number;
  accuracy: number;
  joined_at: string;
  rank?: number;
}

export interface TournamentGame {
  id: string;
  tournament_id: string;
  room_id: string;
  game_id: string;
  participants: string[];
  winner_id?: string;
  scores: Record<string, number>;
  played_at: string;
}

export class TournamentService {
  /**
   * Obtener torneos activos
   */
  static async getActiveTournaments(): Promise<Tournament[]> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active tournaments:', error);
      return [];
    }
  }

  /**
   * Obtener torneo por ID
   */
  static async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      return null;
    }
  }

  /**
   * Unirse a un torneo
   */
  static async joinTournament(tournamentId: string, userId: string): Promise<boolean> {
    try {
      // Verificar si el usuario ya está inscrito
      const { data: existing } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        toast({
          title: "Ya estás inscrito",
          description: "Ya participas en este torneo",
          variant: "default",
        });
        return false;
      }

      // Obtener información del torneo
      const tournament = await this.getTournamentById(tournamentId);
      if (!tournament) {
        toast({
          title: "Error",
          description: "Torneo no encontrado",
          variant: "destructive",
        });
        return false;
      }

      // Verificar si el torneo está lleno
      if (tournament.max_participants && tournament.current_participants >= tournament.max_participants) {
        toast({
          title: "Torneo lleno",
          description: "Este torneo ya no acepta más participantes",
          variant: "destructive",
        });
        return false;
      }

      // Verificar si es premium only
      if (tournament.is_premium_only) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('user_id', userId)
          .single();

        if (!profile?.is_premium) {
          toast({
            title: "Torneo Premium",
            description: "Este torneo es solo para usuarios Premium",
            variant: "destructive",
          });
          return false;
        }
      }

      // Obtener información del usuario
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', userId)
        .single();

      // Inscribir al usuario
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: userId,
          username: userProfile?.username || 'Usuario',
          avatar_url: userProfile?.avatar_url,
          score: 0,
          games_played: 0,
          games_won: 0,
          accuracy: 0
        });

      if (error) throw error;

      // Actualizar contador de participantes
      await supabase
        .from('tournaments')
        .update({ current_participants: tournament.current_participants + 1 })
        .eq('id', tournamentId);

      toast({
        title: "¡Inscrito exitosamente!",
        description: `Te has unido al torneo "${tournament.name}"`,
      });

      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Error",
        description: "No se pudo unir al torneo",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Obtener participantes de un torneo
   */
  static async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('score', { ascending: false });

      if (error) throw error;

      // Calcular rankings
      return (data || []).map((participant, index) => ({
        ...participant,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching tournament participants:', error);
      return [];
    }
  }

  /**
   * Registrar resultado de juego en torneo
   */
  static async recordTournamentGame(
    tournamentId: string,
    gameData: {
      roomId: string;
      gameId: string;
      participants: string[];
      winnerId?: string;
      scores: Record<string, number>;
    }
  ): Promise<boolean> {
    try {
      // Registrar el juego
      const { error: gameError } = await supabase
        .from('tournament_games')
        .insert({
          tournament_id: tournamentId,
          room_id: gameData.roomId,
          game_id: gameData.gameId,
          participants: gameData.participants,
          winner_id: gameData.winnerId,
          scores: gameData.scores
        });

      if (gameError) throw gameError;

      // Actualizar estadísticas de participantes
      for (const [userId, score] of Object.entries(gameData.scores)) {
        await this.updateParticipantStats(tournamentId, userId, score, gameData.winnerId === userId);
      }

      return true;
    } catch (error) {
      console.error('Error recording tournament game:', error);
      return false;
    }
  }

  /**
   * Actualizar estadísticas de participante
   */
  private static async updateParticipantStats(
    tournamentId: string,
    userId: string,
    score: number,
    won: boolean
  ): Promise<void> {
    try {
      const { data: participant } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .single();

      if (!participant) return;

      const newScore = participant.score + score;
      const newGamesPlayed = participant.games_played + 1;
      const newGamesWon = participant.games_won + (won ? 1 : 0);
      const newAccuracy = (newGamesWon / newGamesPlayed) * 100;

      await supabase
        .from('tournament_participants')
        .update({
          score: newScore,
          games_played: newGamesPlayed,
          games_won: newGamesWon,
          accuracy: newAccuracy
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating participant stats:', error);
    }
  }

  /**
   * Obtener torneos del usuario
   */
  static async getUserTournaments(userId: string): Promise<Tournament[]> {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          tournament_id,
          tournaments (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(item => item.tournaments).filter(Boolean);
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      return [];
    }
  }

  /**
   * Crear torneo (solo admin)
   */
  static async createTournament(tournament: Omit<Tournament, 'id' | 'created_at' | 'current_participants'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...tournament,
          current_participants: 0
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Torneo creado",
        description: `El torneo "${tournament.name}" ha sido creado exitosamente`,
      });

      return data.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el torneo",
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Finalizar torneo y asignar premios
   */
  static async finishTournament(tournamentId: string): Promise<boolean> {
    try {
      // Obtener participantes ordenados por puntuación
      const participants = await this.getTournamentParticipants(tournamentId);
      
      if (participants.length === 0) return false;

      // Asignar premios
      const winners = participants.slice(0, 3);
      const tournament = await this.getTournamentById(tournamentId);
      
      if (!tournament) return false;

      // Asignar XP a los ganadores
      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i];
        const xpReward = i === 0 ? tournament.rewards.first_place :
                        i === 1 ? tournament.rewards.second_place :
                        tournament.rewards.third_place;

        // Aquí deberías llamar a GameService.awardXP
        // await GameService.awardXP(winner.user_id, xpReward, `Tournament ${tournament.name} - ${i + 1}º lugar`);
      }

      // Asignar XP de participación a todos
      for (const participant of participants) {
        // await GameService.awardXP(participant.user_id, tournament.rewards.participation, `Tournament ${tournament.name} - Participación`);
      }

      // Marcar torneo como finalizado
      await supabase
        .from('tournaments')
        .update({ status: 'finished' })
        .eq('id', tournamentId);

      toast({
        title: "Torneo finalizado",
        description: `El torneo "${tournament.name}" ha terminado. ¡Revisa los resultados!`,
      });

      return true;
    } catch (error) {
      console.error('Error finishing tournament:', error);
      return false;
    }
  }

  /**
   * Obtener próximos torneos
   */
  static async getUpcomingTournaments(): Promise<Tournament[]> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming tournaments:', error);
      return [];
    }
  }
}
