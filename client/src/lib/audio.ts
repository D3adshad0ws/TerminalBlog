import { Howl } from 'howler';

class AudioManager {
  private bgm: Howl;
  private soundEffects: {
    [key: string]: Howl;
  };
  private isMuted: boolean = false;

  constructor() {
    // Initialize background music with a K-pop inspired track
    this.bgm = new Howl({
      src: ['/audio/bgm.mp3'],
      loop: true,
      volume: 0.5,
      html5: true
    });

    // Initialize sound effects
    this.soundEffects = {
      shoot: new Howl({
        src: ['/audio/shoot.mp3'],
        volume: 0.3
      }),
      explosion: new Howl({
        src: ['/audio/explosion.mp3'],
        volume: 0.4
      })
    };
  }

  playBGM() {
    if (!this.isMuted) {
      this.bgm.play();
    }
  }

  stopBGM() {
    this.bgm.stop();
  }

  playSound(sound: 'shoot' | 'explosion') {
    if (!this.isMuted && this.soundEffects[sound]) {
      this.soundEffects[sound].play();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.bgm.pause();
    } else {
      this.bgm.play();
    }
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();