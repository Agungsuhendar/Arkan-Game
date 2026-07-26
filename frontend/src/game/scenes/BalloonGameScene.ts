import Phaser from 'phaser';
import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

export interface BalloonConfig extends BaseSceneConfig {
  targetLetter: string;
  distractors: string[];
}

export class BalloonGameScene extends BaseGameScene {
  private targetLetter: string = 'A';
  private distractors: string[] = ['B', 'C', 'D'];
  private balloonColors: number[] = [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0x6a4c93];

  constructor() {
    super('BalloonGameScene');
  }

  init(data: BalloonConfig) {
    super.init(data);
    if (data.targetLetter) this.targetLetter = data.targetLetter;
    if (data.distractors) this.distractors = data.distractors;
  }

  create() {
    const { width, height } = this.scale;

    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x8ecae6, 0x8ecae6, 0x219ebc, 0x219ebc, 1);
    bg.fillRect(0, 0, width, height);

    this.createUI();

    // Spawn balloons loop
    this.time.addEvent({
      delay: 1400,
      callback: this.spawnBalloon,
      callbackScope: this,
      loop: true
    });
  }

  spawnBalloon() {
    if (!this.scene.isActive()) return;
    const { width, height } = this.scale;
    const x = Phaser.Math.Between(80, width - 80);

    const isTarget = Math.random() > 0.4;
    const letterText = isTarget
      ? this.targetLetter
      : this.distractors[Math.floor(Math.random() * this.distractors.length)];

    const color = this.balloonColors[Math.floor(Math.random() * this.balloonColors.length)];

    // Balloon Container
    const container = this.add.container(x, height + 80);

    const balloonGraphics = this.add.graphics();
    balloonGraphics.fillStyle(color, 1);
    balloonGraphics.fillEllipse(0, 0, 80, 100);
    balloonGraphics.fillTriangle(-6, 50, 6, 50, 0, 58);

    const textObj = this.add.text(0, -5, letterText, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([balloonGraphics, textObj]);
    container.setSize(80, 100);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      if (letterText === this.targetLetter) {
        this.score += 10;
        this.events.emit('update_score', this.score);
        this.spawnRewardParticles(container.x, container.y);

        this.tweens.add({
          targets: container,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            container.destroy();
            if (this.score >= 50) {
              this.finishGame();
            }
          }
        });
      } else {
        // Wobble on wrong balloon
        this.tweens.add({
          targets: container,
          x: container.x + 10,
          yoyo: true,
          repeat: 3,
          duration: 50
        });
      }
    });

    // Float upward tween
    this.tweens.add({
      targets: container,
      y: -100,
      duration: Phaser.Math.Between(4500, 6500),
      onComplete: () => {
        container.destroy();
      }
    });
  }
}
