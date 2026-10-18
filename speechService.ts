// Browser Web Speech API text-to-speech service with Hindi & English voice selection

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public hasHindiVoice(): boolean {
    this.loadVoices();
    return this.voices.some(v => v.lang.toLowerCase().startsWith('hi'));
  }

  public speak(
    text: string,
    lang: 'en' | 'hi',
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ) {
    if (!this.synth || !this.isSupported) {
      callbacks?.onError?.(new Error('Speech synthesis not supported in this browser environment'));
      return;
    }

    // Cancel any ongoing speech to avoid overlap
    this.synth.cancel();

    // Small delay to allow cancel to take effect
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        this.loadVoices();

        if (lang === 'hi') {
          utterance.lang = 'hi-IN';
          // Find Hindi voice
          const hiVoice = this.voices.find(v => v.lang.toLowerCase().startsWith('hi'));
          if (hiVoice) {
            utterance.voice = hiVoice;
          }
        } else {
          utterance.lang = 'en-IN';
          // Find Indian English or standard English voice
          const enInVoice = this.voices.find(v => v.lang.toLowerCase() === 'en-in') ||
                            this.voices.find(v => v.lang.toLowerCase().startsWith('en'));
          if (enInVoice) {
            utterance.voice = enInVoice;
          }
        }

        utterance.rate = 0.95; // slightly slower for better farmer comprehension
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          callbacks?.onStart?.();
        };

        utterance.onend = () => {
          callbacks?.onEnd?.();
        };

        utterance.onerror = (e) => {
          // If canceled manually, do not treat as fatal error
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            callbacks?.onError?.(e);
          } else {
            callbacks?.onEnd?.();
          }
        };

        this.synth?.speak(utterance);
      } catch (err) {
        callbacks?.onError?.(err);
      }
    }, 50);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

export const speechService = new SpeechService();
