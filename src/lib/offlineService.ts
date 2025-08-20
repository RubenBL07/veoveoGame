import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OfflinePhoto {
  id: string;
  base64: string;
  timestamp: number;
  gameId?: string;
  roundId?: string;
}

export interface OfflineGameData {
  gameId: string;
  roundId: string;
  photo: OfflinePhoto;
  detectedObjects: string[];
  selectedObject?: string;
  guesses: Array<{
    userId: string;
    guess: string;
    isCorrect: boolean;
  }>;
}

export class OfflineService {
  private static readonly OFFLINE_PHOTOS_KEY = 'veoveo_offline_photos';
  private static readonly OFFLINE_GAMES_KEY = 'veoveo_offline_games';
  private static readonly SYNC_QUEUE_KEY = 'veoveo_sync_queue';

  /**
   * Verificar si estamos offline
   */
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Guardar foto offline
   */
  static async savePhotoOffline(photo: OfflinePhoto): Promise<void> {
    try {
      const photos = this.getOfflinePhotos();
      photos.push(photo);
      localStorage.setItem(this.OFFLINE_PHOTOS_KEY, JSON.stringify(photos));
      
      toast({
        title: "Foto guardada offline",
        description: "Se sincronizará cuando vuelva la conexión",
      });
    } catch (error) {
      console.error('Error saving photo offline:', error);
    }
  }

  /**
   * Guardar datos del juego offline
   */
  static async saveGameOffline(gameData: OfflineGameData): Promise<void> {
    try {
      const games = this.getOfflineGames();
      games.push(gameData);
      localStorage.setItem(this.OFFLINE_GAMES_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Error saving game offline:', error);
    }
  }

  /**
   * Obtener fotos guardadas offline
   */
  static getOfflinePhotos(): OfflinePhoto[] {
    try {
      const photos = localStorage.getItem(this.OFFLINE_PHOTOS_KEY);
      return photos ? JSON.parse(photos) : [];
    } catch (error) {
      console.error('Error getting offline photos:', error);
      return [];
    }
  }

  /**
   * Obtener juegos guardados offline
   */
  static getOfflineGames(): OfflineGameData[] {
    try {
      const games = localStorage.getItem(this.OFFLINE_GAMES_KEY);
      return games ? JSON.parse(games) : [];
    } catch (error) {
      console.error('Error getting offline games:', error);
      return [];
    }
  }

  /**
   * Sincronizar datos offline cuando vuelve la conexión
   */
  static async syncOfflineData(): Promise<void> {
    if (this.isOffline()) return;

    try {
      // Sincronizar fotos
      const photos = this.getOfflinePhotos();
      for (const photo of photos) {
        await this.syncPhoto(photo);
      }

      // Sincronizar juegos
      const games = this.getOfflineGames();
      for (const game of games) {
        await this.syncGame(game);
      }

      // Limpiar datos sincronizados
      this.clearOfflineData();

      if (photos.length > 0 || games.length > 0) {
        toast({
          title: "Datos sincronizados",
          description: `${photos.length} fotos y ${games.length} juegos sincronizados`,
        });
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      toast({
        title: "Error de sincronización",
        description: "Algunos datos no se pudieron sincronizar",
        variant: "destructive",
      });
    }
  }

  /**
   * Sincronizar una foto individual
   */
  private static async syncPhoto(photo: OfflinePhoto): Promise<void> {
    try {
      // Convertir base64 a blob
      const response = await fetch(photo.base64);
      const blob = await response.blob();

      // Subir a Supabase Storage
      const fileName = `offline_${photo.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('game-photos')
        .upload(fileName, blob);

      if (error) throw error;

      // Actualizar en la base de datos si hay gameId
      if (photo.gameId && photo.roundId) {
        await supabase
          .from('game_rounds')
          .update({ photo_url: data.path })
          .eq('id', photo.roundId);
      }
    } catch (error) {
      console.error('Error syncing photo:', error);
      throw error;
    }
  }

  /**
   * Sincronizar datos del juego
   */
  private static async syncGame(gameData: OfflineGameData): Promise<void> {
    try {
      // Actualizar objetos detectados
      if (gameData.detectedObjects.length > 0) {
        await supabase
          .from('game_rounds')
          .update({ 
            detected_objects: gameData.detectedObjects,
            selected_object: gameData.selectedObject
          })
          .eq('id', gameData.roundId);
      }

      // Sincronizar adivinanzas
      for (const guess of gameData.guesses) {
        await supabase
          .from('player_guesses')
          .upsert({
            game_id: gameData.gameId,
            round_id: gameData.roundId,
            user_id: guess.userId,
            guess: guess.guess,
            is_correct: guess.isCorrect,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error syncing game:', error);
      throw error;
    }
  }

  /**
   * Limpiar datos offline sincronizados
   */
  private static clearOfflineData(): void {
    localStorage.removeItem(this.OFFLINE_PHOTOS_KEY);
    localStorage.removeItem(this.OFFLINE_GAMES_KEY);
  }

  /**
   * Obtener estadísticas offline
   */
  static getOfflineStats(): {
    photosCount: number;
    gamesCount: number;
    totalSize: number;
  } {
    const photos = this.getOfflinePhotos();
    const games = this.getOfflineGames();
    
    // Calcular tamaño aproximado
    const totalSize = photos.reduce((size, photo) => {
      return size + (photo.base64.length * 0.75); // Aproximación base64 a bytes
    }, 0);

    return {
      photosCount: photos.length,
      gamesCount: games.length,
      totalSize: Math.round(totalSize / 1024) // KB
    };
  }

  /**
   * Configurar listeners para cambios de conectividad
   */
  static setupConnectivityListeners(): void {
    window.addEventListener('online', () => {
      toast({
        title: "Conexión restaurada",
        description: "Sincronizando datos offline...",
      });
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      toast({
        title: "Modo offline",
        description: "Los datos se guardarán localmente",
        variant: "default",
      });
    });
  }

  /**
   * Verificar si hay datos pendientes de sincronización
   */
  static hasPendingSync(): boolean {
    const photos = this.getOfflinePhotos();
    const games = this.getOfflineGames();
    return photos.length > 0 || games.length > 0;
  }
}
