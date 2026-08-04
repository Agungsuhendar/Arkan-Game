import Phaser from 'phaser';
import { soundService, SfxType } from '../../application/services/soundService';

export interface BaseSceneConfig {
  promptText: string;
  category: string;
  onFinish?: (stars: number, score: number) => void;
}

export class BaseGameScene extends Phaser.Scene {
  protected promptText: string = 'Letuskan Balon!';
  protected score: number = 0;
  protected stars: number = 3;
  protected category: string = 'huruf';
  protected onFinishCallback?: (stars: number, score: number) => void;

  constructor(key: string) {
    super({ key });
  }

  init(data: BaseSceneConfig) {
    if (data.promptText) this.promptText = data.promptText;
    if (data.category) this.category = data.category;
    if (data.onFinish) this.onFinishCallback = data.onFinish;
    this.score = 0;
    this.stars = 3;
  }

  createUI() {
    const { width } = this.scale;

    if (this.promptText && this.promptText.trim() !== '') {
      // Header Prompt Banner (Glassmorphism rounded card style)
      const bannerBg = this.add.graphics();
      bannerBg.fillStyle(0xffffff, 0.9);
      bannerBg.fillRoundedRect(width / 2 - 250, 20, 500, 60, 24);

      this.add.text(width / 2, 50, this.promptText, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#2d3748',
        align: 'center'
      }).setOrigin(0.5);

      // Speak prompt text for narration
      soundService.speak(this.promptText);
    }

    // Score Counter Top Right
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0xffd166, 1);
    scoreBg.fillRoundedRect(width - 160, 20, 140, 50, 20);

    const scoreText = this.add.text(width - 90, 45, `Bintang: 0`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const onUpdateScore = (newScore: number) => {
      this.score = newScore;
      if (scoreText && scoreText.active && scoreText.scene) {
        scoreText.setText(`Bintang: ${this.score}`);
      }
    };

    this.events.on('update_score', onUpdateScore);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off('update_score', onUpdateScore);
    });
  }

  playSfx(type: SfxType) {
    soundService.playSfx(type);
  }

  speak(text: string) {
    soundService.speak(text);
  }

  spawnRewardParticles(x: number, y: number) {
    soundService.playSfx('coin');
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffd166, 1);
    graphics.fillCircle(0, 0, 8);
    graphics.generateTexture('starParticle', 16, 16);
    graphics.destroy();

    const particles = this.add.particles(x, y, 'starParticle', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 12
    });

    this.time.delayedCall(700, () => particles.destroy());
  }

  finishGame() {
    soundService.playSfx('win');
    soundService.speak('Luar biasa! Kamu berhasil menyelesaikan tantangan ini!');
    this.spawnRewardParticles(this.scale.width / 2, this.scale.height / 2);
    this.time.delayedCall(1200, () => {
      if (this.onFinishCallback) {
        this.onFinishCallback(this.stars, this.score);
      }
    });
  }
}
