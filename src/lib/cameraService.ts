import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface CameraPhoto {
  base64: string;
  format: string;
  webPath: string;
}

export class CameraService {
  /**
   * Tomar una foto usando la cámara nativa
   */
  static async takePhoto(): Promise<CameraPhoto> {
    try {
      // Vibración de feedback
      await Haptics.impact({ style: ImpactStyle.Medium });

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        direction: CameraDirection.Back
      });

      return {
        base64: image.base64String || '',
        format: image.format || 'jpeg',
        webPath: image.webPath || ''
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      throw new Error('No se pudo tomar la foto');
    }
  }

  /**
   * Seleccionar una foto de la galería
   */
  static async selectFromGallery(): Promise<CameraPhoto> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      return {
        base64: image.base64String || '',
        format: image.format || 'jpeg',
        webPath: image.webPath || ''
      };
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw new Error('No se pudo seleccionar la foto');
    }
  }

  /**
   * Verificar permisos de cámara
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      const permission = await Camera.checkPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  }

  /**
   * Solicitar permisos de cámara
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Camera.requestPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Convertir base64 a Blob
   */
  static base64ToBlob(base64: string, format: string = 'jpeg'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: `image/${format}` });
  }

  /**
   * Crear URL de objeto para la imagen
   */
  static createImageUrl(base64: string, format: string = 'jpeg'): string {
    const blob = this.base64ToBlob(base64, format);
    return URL.createObjectURL(blob);
  }
}
