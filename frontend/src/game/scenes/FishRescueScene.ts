import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

export class FishRescueScene extends BaseGameScene {

  constructor() {
    super('FishRescueScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = 'Tolong Arkan selamatkan ikan dari jaring!';
  }

  create() {
    const { width, height } = this.scale;

    // Deep sea ocean gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0077b6, 0x0077b6, 0x03045e, 0x03045e, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative Seaweeds & Coral at bottom
    const coral = this.add.graphics();
    coral.fillStyle(0xff70a6, 0.8);
    coral.fillCircle(100, height - 20, 60);
    coral.fillStyle(0xff9770, 0.8);
    coral.fillCircle(width - 120, height - 30, 80);

    this.createUI();

    // Arkan Scuba Diver Character
    const arkanContainer = this.add.container(120, 180);
    const arkanText = this.add.text(0, 0, '🤿 👦 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    arkanContainer.add(arkanText);

    // Float Arkan in water
    this.tweens.add({
      targets: arkanContainer,
      y: 195,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Trapped Fish in Net
    const fishContainer = this.add.container(width / 2 + 100, 220);
    const fishText = this.add.text(0, 0, '🐠 🕸️ (Tersangkut Jaring)', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#ffd166'
    }).setOrigin(0.5);
    fishContainer.add(fishText);

    // Speech Bubble Prompt
    const speechBg = this.add.graphics();
    speechBg.fillStyle(0xffffff, 0.95);
    speechBg.fillRoundedRect(width / 2 - 200, 100, 400, 50, 20);

    this.add.text(width / 2, 125, 'Pilih tombol A untuk memotong jaring!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#023e8a'
    }).setOrigin(0.5);

    // Answer Buttons A, B, C along line
    const options = ['A', 'B', 'C'];
    options.forEach((opt, idx) => {
      const btnX = width / 2 - 150 + idx * 150;
      const btnY = height - 120;

      const circleBg = this.add.graphics();
      const color = opt === 'A' ? 0x06d6a0 : 0x3a86ff;
      circleBg.fillStyle(color, 1);
      circleBg.fillCircle(btnX, btnY, 40);

      const letter = this.add.text(btnX, btnY, opt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '36px',
        color: '#ffffff'
      }).setOrigin(0.5);

      const interactiveArea = this.add.circle(btnX, btnY, 40);
      interactiveArea.setInteractive({ useHandCursor: true });

      interactiveArea.on('pointerdown', () => {
        if (opt === 'A') {
          this.score += 30;
          this.events.emit('update_score', this.score);
          this.spawnRewardParticles(btnX, btnY);

          // Free the fish animation
          this.tweens.add({
            targets: fishContainer,
            x: width + 100,
            duration: 1500,
            ease: 'Power2'
          });

          this.time.delayedCall(1600, () => this.finishGame());
        } else {
          this.tweens.add({
            targets: letter,
            x: btnX + 8,
            duration: 60,
            yoyo: true,
            repeat: 3
          });
        }
      });
    });
  }
}
