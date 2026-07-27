import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

export class BikeRaceScene extends BaseGameScene {
  private arkanBike?: Phaser.GameObjects.Container;
  private ayahBike?: Phaser.GameObjects.Container;
  private ibuBike?: Phaser.GameObjects.Container;
  private arkanX: number = 100;
  private ayahX: number = 100;
  private ibuX: number = 100;
  private finishX: number = 780;
  private speedKmH: number = 0;
  private speedTextObj?: Phaser.GameObjects.Text;
  private isFinished: boolean = false;

  constructor() {
    super('BikeRaceScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🚴‍♂️ Balapan Sepeda Keluarga!';
    this.arkanX = 100;
    this.ayahX = 100;
    this.ibuX = 100;
    this.speedKmH = 0;
    this.isFinished = false;
  }

  create() {
    const { width, height } = this.scale;

    // Outdoor Sunny Park Sky Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xbae6fd, 0xbae6fd, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative Distant Trees & Green Hills
    const hills = this.add.graphics();
    hills.fillStyle(0x4ade80, 0.9);
    hills.fillCircle(150, height - 200, 180);
    hills.fillCircle(450, height - 190, 220);
    hills.fillCircle(750, height - 210, 200);

    hills.fillStyle(0x22c55e, 1);
    hills.fillRect(0, height - 260, width, 60);

    this.createClouds();
    this.createUI();

    // 3D Asphalt Race Track (Bottom Area)
    const trackHeight = 220;
    const trackY = height - trackHeight;

    const track = this.add.graphics();
    track.fillStyle(0x334155, 1);
    track.fillRect(0, trackY, width, trackHeight);

    // Red-White Curb Borders
    const curbTop = this.add.graphics();
    for (let x = 0; x < width; x += 40) {
      curbTop.fillStyle((x / 40) % 2 === 0 ? 0xef4444 : 0xffffff, 1);
      curbTop.fillRect(x, trackY - 8, 40, 8);
      curbTop.fillRect(x, height - 8, 40, 8);
    }

    // Moving Lane Dashed Lines
    this.createMovingRoadDashes(trackY);

    // 🏁 Finish Line Arch (at x = 780)
    this.createFinishLine(this.finishX, trackY, trackHeight);

    // Speedometer Badge Top Center
    const speedBg = this.add.graphics();
    speedBg.fillStyle(0x0f172a, 0.85);
    speedBg.lineStyle(3, 0xf59e0b, 1);
    speedBg.fillRoundedRect(width / 2 - 100, 90, 200, 44, 20);
    speedBg.strokeRoundedRect(width / 2 - 100, 90, 200, 44, 20);

    this.speedTextObj = this.add.text(width / 2, 112, '🚀 Kecepatan: 0 KM/H', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // -------------------------------------------------------------
    // Create Racers (All Facing RIGHT → towards Finish Line)
    // -------------------------------------------------------------

    // 1. Papa Racer (Top Lane: y = trackY + 40)
    this.ayahBike = this.createRacerContainer('👨‍🦱 🚴‍♂️', 'Papa', 0x3b82f6);
    this.ayahBike.setPosition(this.ayahX, trackY + 40);

    // 2. Arkan Racer (Middle Lane: y = trackY + 110) ⭐ PLAYER
    this.arkanBike = this.createRacerContainer('👦 ⭐ 🚴‍♂️', 'Arkan (Kamu)', 0xf59e0b, true);
    this.arkanBike.setPosition(this.arkanX, trackY + 110);

    // 3. Mama Racer (Bottom Lane: y = trackY + 175)
    this.ibuBike = this.createRacerContainer('🧕 🚴‍♀️', 'Mama', 0xec4899);
    this.ibuBike.setPosition(this.ibuX, trackY + 175);

    // Giant 3D Interactive Pedal Button at Bottom Center
    this.createPedalButton();

    // AI Rivals Auto Advance Loop
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.isFinished) return;

        // Ayah steady speed
        this.ayahX += 1.6 + Math.random() * 0.8;
        if (this.ayahBike) this.ayahBike.x = this.ayahX;

        // Ibu steady speed
        this.ibuX += 1.4 + Math.random() * 0.7;
        if (this.ibuBike) this.ibuBike.x = this.ibuX;

        // Decrypt player speed gradually if not tapping
        if (this.speedKmH > 0) {
          this.speedKmH = Math.max(0, this.speedKmH - 0.5);
          if (this.speedTextObj) {
            this.speedTextObj.setText(`🚀 Kecepatan: ${Math.round(this.speedKmH)} KM/H`);
          }
        }

        // Check if Papa or Mama finished first
        if (this.ayahX >= this.finishX && !this.isFinished) {
          this.checkRaceResult('Papa');
        } else if (this.ibuX >= this.finishX && !this.isFinished) {
          this.checkRaceResult('Mama');
        }
      }
    });
  }

  private createClouds() {
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.text(50 + i * 220, 40 + (i % 2) * 20, '☁️', { fontSize: '40px' }).setAlpha(0.7);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 30,
        duration: 3000 + i * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createMovingRoadDashes(trackY: number) {
    const { width } = this.scale;
    const laneY1 = trackY + 75;
    const laneY2 = trackY + 145;

    const dashesGfx = this.add.graphics();
    dashesGfx.fillStyle(0xffffff, 0.9);

    for (let x = -40; x < width + 60; x += 60) {
      dashesGfx.fillRect(x, laneY1, 35, 6);
      dashesGfx.fillRect(x, laneY2, 35, 6);
    }

    // Animate road lines moving backward for motion effect
    this.tweens.add({
      targets: dashesGfx,
      x: -60,
      duration: 500,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createFinishLine(xPos: number, trackY: number, trackHeight: number) {
    // Checkered Finish Line Strip on Road
    const checkGfx = this.add.graphics();
    const rows = 12;
    const cols = 2;
    const cellW = 16;
    const cellH = trackHeight / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        checkGfx.fillStyle((r + c) % 2 === 0 ? 0xffffff : 0x000000, 1);
        checkGfx.fillRect(xPos + c * cellW, trackY + r * cellH, cellW, cellH);
      }
    }

    // 🏁 Golden Finish Arch Posts
    const arch = this.add.graphics();
    arch.fillStyle(0xf59e0b, 1);
    arch.fillRect(xPos - 8, trackY - 70, 14, trackHeight + 70);
    arch.fillRect(xPos + 34, trackY - 70, 14, trackHeight + 70);

    // Arch Banner Top
    arch.fillStyle(0xef4444, 1);
    arch.lineStyle(3, 0xfde047, 1);
    arch.fillRoundedRect(xPos - 20, trackY - 75, 80, 36, 10);
    arch.strokeRoundedRect(xPos - 20, trackY - 75, 80, 36, 10);

    this.add.text(xPos + 20, trackY - 57, '🏁 FINISH', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createRacerContainer(emojiLabel: string, name: string, colorHex: number, isPlayer: boolean = false): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    // Racer Card Background Bubble
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.lineStyle(3, colorHex, 1);
    bg.fillRoundedRect(-75, -34, 150, 68, 22);
    bg.strokeRoundedRect(-75, -34, 150, 68, 22);
    container.add(bg);

    // Player Golden Ring Aura
    if (isPlayer) {
      const aura = this.add.graphics();
      aura.fillStyle(0xfacc15, 0.35);
      aura.fillCircle(0, 0, 46);
      container.addAt(aura, 0);

      this.tweens.add({
        targets: aura,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.6,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Cyclist Sprite / Text Label
    // IMPORTANT FIX: Emoji `🚴‍♂️` faces LEFT by default. We set scaleX = -1 so the cyclist faces RIGHT (FORWARD towards finish line 🏁)!
    const spriteText = this.add.text(-28, 0, emojiLabel, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '36px'
    }).setOrigin(0.5);

    // Flip horizontally so character rides FORWARD to the right!
    spriteText.setScale(-1, 1);
    container.add(spriteText);

    // Name Label
    const nameText = this.add.text(26, 0, name, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: isPlayer ? '#b45309' : '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(nameText);

    return container;
  }

  private createPedalButton() {
    const { width, height } = this.scale;

    const pedalContainer = this.add.container(width / 2, height - 38);

    // 3D Button Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.25);
    shadow.fillRoundedRect(-140, -24, 280, 52, 22);
    pedalContainer.add(shadow);

    // 3D Button Glossy Box
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xef4444, 1);
    btnBg.lineStyle(4, 0xfde047, 1);
    btnBg.fillRoundedRect(-140, -28, 280, 52, 22);
    btnBg.strokeRoundedRect(-140, -28, 280, 52, 22);
    pedalContainer.add(btnBg);

    const btnText = this.add.text(0, -2, '⚡ KAYUH KENCANG! ⚡', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.4)', blur: 4, fill: true }
    }).setOrigin(0.5);
    pedalContainer.add(btnText);

    // Interactive Touch
    const hitArea = this.add.rectangle(0, 0, 280, 52);
    hitArea.setInteractive({ useHandCursor: true });
    pedalContainer.add(hitArea);

    hitArea.on('pointerdown', () => {
      if (this.isFinished) return;

      // Move Arkan forward to the RIGHT
      this.arkanX += 32;
      this.speedKmH = Math.min(60, this.speedKmH + 8);

      if (this.arkanBike) {
        this.arkanBike.x = this.arkanX;
      }

      if (this.speedTextObj) {
        this.speedTextObj.setText(`🚀 Kecepatan: ${Math.round(this.speedKmH)} KM/H`);
      }

      // Button press bounce effect
      this.tweens.add({
        targets: pedalContainer,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });

      // Speed boost smoke particles
      this.spawnSpeedBoostParticles(this.arkanX - 40, this.scale.height - 110);

      this.score += 5;
      this.events.emit('update_score', this.score);

      // Check player victory!
      if (this.arkanX >= this.finishX) {
        this.checkRaceResult('Arkan');
      }
    });
  }

  private spawnSpeedBoostParticles(x: number, y: number) {
    const boostText = this.add.text(x, y, '💨 ✨', { fontSize: '20px' }).setOrigin(0.5);
    this.tweens.add({
      targets: boostText,
      x: x - 40,
      alpha: 0,
      scale: 1.4,
      duration: 400,
      onComplete: () => boostText.destroy()
    });
  }

  private checkRaceResult(winner: string) {
    if (this.isFinished) return;
    this.isFinished = true;

    const { width, height } = this.scale;

    if (winner === 'Arkan') {
      // 🏆 ARKAN WINS JUARA 1!
      this.spawnRewardParticles(width / 2, height / 2);

      const trophyContainer = this.add.container(width / 2, height / 2 - 20);

      const bg = this.add.graphics();
      bg.fillStyle(0xf59e0b, 0.95);
      bg.lineStyle(4, 0xffffff, 1);
      bg.fillRoundedRect(-180, -70, 360, 140, 24);
      bg.strokeRoundedRect(-180, -70, 360, 140, 24);
      trophyContainer.add(bg);

      const title = this.add.text(0, -30, '🏆 HORE! ARKAN JUARA 1! 🏆', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      trophyContainer.add(title);

      const sub = this.add.text(0, 15, 'Hebat sekali! Kayuhan sepedamu super cepat! ⭐', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: '#fef3c7',
        align: 'center'
      }).setOrigin(0.5);
      trophyContainer.add(sub);

      trophyContainer.setScale(0);
      this.tweens.add({
        targets: trophyContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut'
      });

      this.finishGame();
    } else {
      // Rival won, try again toast
      const toast = this.add.text(width / 2, height / 2, `🎉 ${winner} Lebih Dulu! Yuk Coba Lagi! 💪`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        padding: { x: 20, y: 12 }
      }).setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        toast.destroy();
        this.finishGame();
      });
    }
  }
}
