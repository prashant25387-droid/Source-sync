import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export class MobileCameraService {
  public static async capturePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Prompts user: Camera or Photo Gallery
        saveToGallery: true,
      });

      return image.dataUrl || null;
    } catch (err: any) {
      console.warn('Native camera capture cancelled or unavailable, falling back:', err);
      return null;
    }
  }

  public static isNative(): boolean {
    return typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform();
  }
}
