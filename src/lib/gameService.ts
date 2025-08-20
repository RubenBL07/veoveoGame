import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  correctGuesses: number;
  photosTaken: number;
  totalXP: number;
  level: number;
}

export interface DailyChallenge {
  id: string;
  challenge_type: string;
  challenge_name: string;
  description: string;
  target_value: number;
  current_value: number;
  xp_reward: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  earned_at: string;
}

class GameService {
  // XP Rewards according to PRD
  private static XP_REWARDS = {
    COMPLETE_GAME: 50,
    CORRECT_GUESS: 100,
    WIN_GAME: 200,
    TAKE_PHOTO: 25,
    DAILY_CHALLENGE: 500,
    PREMIUM_BONUS: 0.25 // 25% bonus for premium users
  };

  // Check if user can create private room (freemium limits)
  static async canCreatePrivateRoom(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('can_create_private_room', { user_uuid: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking room creation permission:', error);
      return false;
    }
  }

  // Award XP to user
  static async awardXP(userId: string, xpAmount: number, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('award_xp', {
          user_uuid: userId,
          xp_amount: xpAmount,
          reason: reason
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }

  // Get user profile with stats
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Get daily challenges for user
  static async getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching daily challenges:', error);
      return [];
    }
  }

  // Create daily challenges for user
  static async createDailyChallenges(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('create_daily_challenges', { user_uuid: userId });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating daily challenges:', error);
    }
  }

  // Update challenge progress
  static async updateChallengeProgress(
    challengeId: string, 
    newValue: number, 
    completed: boolean = false
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = { current_value: newValue };
      
      if (completed) {
        updateData.completed = true;
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('daily_challenges')
        .update(updateData)
        .eq('id', challengeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }

  // Get user achievements
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // Game completion rewards
  static async handleGameCompletion(
    userId: string, 
    gameStats: {
      won: boolean;
      correctGuesses: number;
      photosTaken: number;
      isPremium: boolean;
    }
  ): Promise<void> {
    try {
      let totalXP = 0;

      // Base XP for completing game
      totalXP += this.XP_REWARDS.COMPLETE_GAME;

      // XP for correct guesses
      totalXP += gameStats.correctGuesses * this.XP_REWARDS.CORRECT_GUESS;

      // XP for photos taken
      totalXP += gameStats.photosTaken * this.XP_REWARDS.TAKE_PHOTO;

      // Bonus XP for winning
      if (gameStats.won) {
        totalXP += this.XP_REWARDS.WIN_GAME;
      }

      // Premium bonus
      if (gameStats.isPremium) {
        totalXP = Math.floor(totalXP * (1 + this.XP_REWARDS.PREMIUM_BONUS));
      }

      // Award XP
      await this.awardXP(userId, totalXP, 'Game completion');

      // Update challenge progress
      await this.updateGameChallenges(userId, gameStats);

      toast({
        title: "¡Partida completada!",
        description: `Ganaste ${totalXP} XP`,
      });

    } catch (error) {
      console.error('Error handling game completion:', error);
    }
  }

  // Update game-related challenges
  private static async updateGameChallenges(
    userId: string, 
    gameStats: {
      won: boolean;
      correctGuesses: number;
      photosTaken: number;
    }
  ): Promise<void> {
    try {
      const challenges = await this.getDailyChallenges(userId);

      for (const challenge of challenges) {
        let newValue = challenge.current_value;
        let completed = false;

        switch (challenge.challenge_type) {
          case 'play_games':
            newValue += 1;
            completed = newValue >= challenge.target_value;
            break;
          case 'correct_guesses':
            newValue += gameStats.correctGuesses;
            completed = newValue >= challenge.target_value;
            break;
          case 'win_games':
            if (gameStats.won) {
              newValue += 1;
              completed = newValue >= challenge.target_value;
            }
            break;
        }

        if (newValue !== challenge.current_value) {
          await this.updateChallengeProgress(challenge.id, newValue, completed);
          
          if (completed) {
            // Award challenge XP
            await this.awardXP(userId, challenge.xp_reward, `Challenge: ${challenge.challenge_name}`);
            
            toast({
              title: "¡Desafío completado!",
              description: `${challenge.challenge_name} - +${challenge.xp_reward} XP`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating game challenges:', error);
    }
  }

  // Get public rooms (Premium only)
  static async getPublicRooms(): Promise<Array<{
    id: string;
    room_name?: string;
    current_players: number;
    max_players: number;
    language: string;
    created_at: string;
    profiles: Array<{ username: string; display_name?: string; avatar_url?: string }>;
  }>> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          profiles!rooms_host_id_fkey(username, display_name, avatar_url)
        `)
        .eq('room_type', 'public')
        .eq('status', 'waiting')
        .lt('current_players', 'max_players')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      return [];
    }
  }

  // Create room with premium validation
  static async createRoom(roomData: {
    hostId: string;
    roomType: 'private' | 'public';
    maxPlayers: number;
    aiMode: string;
    timePerRound?: number;
    language?: string;
    roomName?: string;
  }): Promise<string | null> {
    try {
      // Check if user can create private room
      if (roomData.roomType === 'private') {
        const canCreate = await this.canCreatePrivateRoom(roomData.hostId);
        if (!canCreate) {
          toast({
            title: "Límite alcanzado",
            description: "Has alcanzado el límite de 3 salas privadas por día. Actualiza a Premium para crear salas ilimitadas.",
            variant: "destructive",
          });
          return null;
        }
      }

      // Generate room code for private rooms
      let roomCode = null;
      if (roomData.roomType === 'private') {
        roomCode = this.generateRoomCode();
      }

      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          host_id: roomData.hostId,
          room_code: roomCode,
          room_type: roomData.roomType,
          room_name: roomData.roomName,
          max_players: roomData.maxPlayers,
          ai_mode: roomData.aiMode,
          time_per_round: roomData.timePerRound || 60,
          language: roomData.language || 'es',
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      // Add host as player
      await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: roomData.hostId
        });

      return room.id;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la sala",
        variant: "destructive",
      });
      return null;
    }
  }

  // Generate unique room code
  private static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get leaderboards
  static async getLeaderboards(category: string = 'xp', region?: string): Promise<Array<{
    id: string;
    user_id: string;
    category: string;
    region?: string;
    score: number;
    rank: number;
    profiles: { username: string; display_name?: string; avatar_url?: string };
  }>> {
    try {
      let query = supabase
        .from('leaderboards')
        .select(`
          *,
          profiles!leaderboards_user_id_fkey(username, display_name, avatar_url)
        `)
        .eq('category', category)
        .order('score', { ascending: false })
        .limit(100);

      if (region) {
        query = query.eq('region', region);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      return [];
    }
  }
}

export default GameService;
