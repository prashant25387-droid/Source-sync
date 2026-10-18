// Browser Web Speech Recognition (Speech-to-Text) wrapper
// Supports standard SpeechRecognition and webkitSpeechRecognition for Android Chrome & Desktop browsers

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
      }
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public start(
    language: 'hi' | 'en',
    callbacks: SpeechRecognitionCallbacks
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser. Please type manually.');
      return false;
    }

    // Stop any existing active session
    this.stop();

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);
        callbacks.onResult?.(text, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        let msg = 'Speech recognition error occurred.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission was denied. Please allow microphone access in your browser.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech was detected. Please tap microphone and speak clearly.';
        } else if (event.error === 'network') {
          msg = 'Network issue with speech recognition service. Please type manually.';
        } else if (event.error === 'aborted') {
          // Ignored if manually stopped
          return;
        }
        this.isListening = false;
        callbacks.onError?.(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      callbacks.onError?.(err?.message || 'Could not start microphone');
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Safe ignore
      }
    }
    this.isListening = false;
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
