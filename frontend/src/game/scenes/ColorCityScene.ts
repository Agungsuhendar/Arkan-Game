import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface CityBuilding {
  id: string;
  name: string;
  targetColorName: string;
  targetColorHex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isColored: boolean;
  graphicsObj?: Phaser.GameObjects.Graphics;
  labelObj?: Phaser.GameObjects.Text;
}

interface ColorOption {
  name: string;
  colorHex: number;
  badgeEmoji: string;
}

interface CityRound {
  prompt: string;
  targetBuildingId: string;
  targetColorName: string;
}

export class ColorCityScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private rounds: CityRound[] = [
    {
      prompt: '🎨 Warnai Gedung Sekolah dengan warna MERAH 🔴!',
      targetBuildingId: 'sekolah',
      targetColorName: 'Merah'
    },
    {
      prompt: '🎨 Warnai Rumah Arkan dengan warna KUNING 🟡!',
      targetBuildingId: 'rumah',
      targetColorName: 'Kuning'
    },
    {
      prompt: '🎨 Warnai Menara Kota dengan warna BIRU 🔵!',
      targetBuildingId: 'menara',
      targetColorName: 'Biru'
    },
    {
      prompt: '🎨 Warnai Taman Kota dengan warna HIJAU 🟢!',
      targetBuildingId: 'taman',
      targetColorName: 'Hijau'
    }
  ];

  private colorOptions: ColorOption[] = [
    { name: 'Merah', colorHex: 0xef4444, badgeEmoji: '🔴' },
    { name: 'Kuning', colorHex: 0xeab308, badgeEmoji: '🟡' },
    { name: 'Biru', colorHex: 0x3b82f6, badgeEmoji: '🔵' },
    { name: 'Hijau', colorHex: 0x22c55e, badgeEmoji: '🟢' },
    { name: 'Ungu', colorHex: 0xa855f7, badgeEmoji: '🟣' }
  ];

  private buildings: CityBuilding[] = [];
  private selectedColor: ColorOption | null = null;
  private promptTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;
  private colorPaletteContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('ColorCityScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🎨 Kota Warna Arkan!';
    this.currentRoundIndex = 0;
    this.selectedColor = null;
  }

  create() {
    const { width, height } = this.scale;

    // City Sky Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xe0e7ff, 0xe0e7ff, 1);
    bg.fillRect(0, 0, width, height);

    // City Road Ground
    const road = this.add.graphics();
    road.fillStyle(0x475569, 1);
    road.fillRect(0, height - 200, width, 200);

    // Road Markings
    for (let x = 0; x < width; x += 60) {
      road.fillStyle(0xfde047, 0.9);
      road.fillRect(x, height - 120, 35, 8);
    }

    this.createClouds();
    this.createUI();
    this.createCityBuildings();
    this.createPaintPalette();
    this.createArkanArchitectMascot();

    this.startRound(this.currentRoundIndex);
  }

  private createClouds() {
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.text(50 + i * 220, 40 + (i % 2) * 20, '☁️', { fontSize: '38px' }).setAlpha(0.75);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 30,
        duration: 3200 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createCityBuildings() {
    const { height } = this.scale;

    this.buildings = [
      {
        id: 'sekolah',
        name: '🏫 Sekolah',
        targetColorName: 'Merah',
        targetColorHex: 0xef4444,
        x: 120,
        y: height - 340,
        width: 140,
        height: 140,
        isColored: false
      },
      {
        id: 'rumah',
        name: '🏡 Rumah Arkan',
        targetColorName: 'Kuning',
        targetColorHex: 0xeab308,
        x: 310,
        y: height - 330,
        width: 130,
        height: 130,
        isColored: false
      },
      {
        id: 'menara',
        name: '🏢 Menara Kota',
        targetColorName: 'Biru',
        targetColorHex: 0x3b82f6,
        x: 500,
        y: height - 410,
        width: 130,
        height: 210,
        isColored: false
      },
      {
        id: 'taman',
        name: '🌳 Taman Kota',
        targetColorName: 'Hijau',
        targetColorHex: 0x22c55e,
        x: 690,
        y: height - 320,
        width: 140,
        height: 120,
        isColored: false
      }
    ];

    this.buildings.forEach(b => {
      this.renderBuildingGraphics(b);
    });
  }

  private renderBuildingGraphics(b: CityBuilding) {
    if (b.graphicsObj) b.graphicsObj.destroy();
    if (b.labelObj) b.labelObj.destroy();

    const g = this.add.graphics();
    const currentColor = b.isColored ? b.targetColorHex : 0xcbd5e1;
    const strokeColor = b.isColored ? 0x0f172a : 0x64748b;

    // Building 3D Shadow
    g.fillStyle(0x0f172a, 0.15);
    g.fillRoundedRect(b.x + 6, b.y + 6, b.width, b.height, 16);

    // Building Main Body
    g.fillStyle(currentColor, 1);
    g.lineStyle(4, strokeColor, 1);
    g.fillRoundedRect(b.x, b.y, b.width, b.height, 16);
    g.strokeRoundedRect(b.x, b.y, b.width, b.height, 16);

    // Windows Grid
    const winCols = 2;
    const winRows = Math.floor(b.height / 55);
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        g.fillStyle(b.isColored ? 0xfef08a : 0xf1f5f9, 0.9);
        g.fillRoundedRect(b.x + 18 + c * 50, b.y + 20 + r * 50, 32, 32, 6);
      }
    }

    b.graphicsObj = g;

    // Building Name Label Badge
    b.labelObj = this.add.text(b.x + b.width / 2, b.y - 18, b.name, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Interactive Touch on Building
    const hitArea = this.add.rectangle(b.x + b.width / 2, b.y + b.height / 2, b.width, b.height);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      this.evaluateBuildingPaint(b);
    });
  }

  private createPaintPalette() {
    const { width, height } = this.scale;

    this.colorPaletteContainers.forEach(c => c.destroy());
    this.colorPaletteContainers = [];

    const startX = width / 2 - (this.colorOptions.length * 60) / 2 + 30;
    const paletteY = height - 55;

    // Palette Background Bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0f172a, 0.85);
    barBg.lineStyle(3, 0xf59e0b, 1);
    barBg.fillRoundedRect(width / 2 - 180, paletteY - 32, 360, 64, 26);
    barBg.strokeRoundedRect(width / 2 - 180, paletteY - 32, 360, 64, 26);

    this.colorOptions.forEach((opt, i) => {
      const posX = startX + i * 65;
      const container = this.add.container(posX, paletteY);

      // Paint Can Glow
      const glow = this.add.graphics();
      glow.fillStyle(opt.colorHex, 0.4);
      glow.fillCircle(0, 0, 26);
      container.add(glow);

      // Paint Can Circle
      const canBg = this.add.graphics();
      canBg.fillStyle(opt.colorHex, 1);
      canBg.lineStyle(3, 0xffffff, 1);
      canBg.fillCircle(0, 0, 20);
      canBg.strokeCircle(0, 0, 20);
      container.add(canBg);

      const label = this.add.text(0, 0, opt.badgeEmoji, { fontSize: '18px' }).setOrigin(0.5);
      container.add(label);

      // Touch Paint Can
      const hitArea = this.add.circle(0, 0, 26);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerdown', () => {
        this.selectColorOption(opt, container);
      });

      this.colorPaletteContainers.push(container);
    });
  }

  private selectColorOption(opt: ColorOption, container: Phaser.GameObjects.Container) {
    this.selectedColor = opt;

    // Pulse feedback on selected paint can
    this.tweens.add({
      targets: container,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 120,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });

    this.triggerArkanCheer(`🎨 Cat warna ${opt.name} dipilih! Sentuh gedungnya!`);
  }

  private createArkanArchitectMascot() {
    const { height } = this.scale;

    this.arkanMascotContainer = this.add.container(110, height - 70);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.2);
    shadow.fillRoundedRect(-75, -24, 150, 48, 20);
    this.arkanMascotContainer.add(shadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0xec4899, 1);
    cardBg.fillRoundedRect(-75, -28, 150, 48, 20);
    cardBg.strokeRoundedRect(-75, -28, 150, 48, 20);
    this.arkanMascotContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '👨‍🎨 👦 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#be185d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Arkan Speech Bubble
    this.arkanSpeechBubble = this.add.container(130, height - 135);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-125, -22, 250, 44, 16);
    bubbleBg.strokeRoundedRect(-125, -22, 250, 44, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Pilih cat warna di bawah ya!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#854d0e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanSpeechBubble.add(this.arkanSpeechText);
    this.arkanSpeechBubble.setAlpha(0);
  }

  private triggerArkanCheer(message: string) {
    if (this.arkanSpeechBubble && this.arkanSpeechText && this.arkanMascotContainer) {
      this.arkanSpeechText.setText(message);
      this.arkanSpeechBubble.setAlpha(1);
      this.arkanSpeechBubble.setScale(0.8);

      this.tweens.add({
        targets: this.arkanMascotContainer,
        y: this.scale.height - 82,
        duration: 180,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      this.tweens.add({
        targets: this.arkanSpeechBubble,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
        hold: 1200,
        onComplete: () => {
          this.tweens.add({
            targets: this.arkanSpeechBubble,
            alpha: 0,
            duration: 300
          });
        }
      });
    }
  }

  private startRound(roundIdx: number) {
    if (roundIdx >= this.rounds.length) {
      this.finishGame();
      return;
    }

    const { width } = this.scale;
    const roundData = this.rounds[roundIdx];
    this.selectedColor = null;

    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 95, roundData.prompt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '23px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1e1b4b',
        strokeThickness: 5,
        align: 'center',
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.3)', blur: 6, fill: true }
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(roundData.prompt);
    }
  }

  private evaluateBuildingPaint(b: CityBuilding) {
    const roundData = this.rounds[this.currentRoundIndex];

    if (!this.selectedColor) {
      this.triggerArkanCheer('Pilih kaleng cat warna di bawah dulu ya! 🎨');
      return;
    }

    if (b.id === roundData.targetBuildingId && this.selectedColor.name === roundData.targetColorName) {
      // ✅ SUCCESSFUL COLORING!
      b.isColored = true;
      this.renderBuildingGraphics(b);

      // Paint splash particles
      this.spawnRewardParticles(b.x + b.width / 2, b.y + b.height / 2);

      this.score += 30;
      this.events.emit('update_score', this.score);

      const cheers = ['✨ Wah, gedungnya jadi indah sekali!', '🎉 Hebat, warna yang cocok!', '🌟 Pintar sekali Arkan!'];
      this.triggerArkanCheer(Phaser.Utils.Array.GetRandom(cheers));

      this.time.delayedCall(900, () => {
        this.currentRoundIndex++;
        if (this.currentRoundIndex < this.rounds.length) {
          this.triggerArkanCheer(`🎉 Kota Warna Level ${this.currentRoundIndex} Selesai!`);
          this.startRound(this.currentRoundIndex);
        } else {
          this.finishGame();
        }
      });
    } else {
      // ❌ WRONG COLOR
      this.triggerArkanCheer(`Coba cat dengan warna ${roundData.targetColorName} ya! 😊`);

      if (b.graphicsObj) {
        this.tweens.add({
          targets: b.graphicsObj,
          x: b.graphicsObj.x + 8,
          duration: 80,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            if (b.graphicsObj) b.graphicsObj.x = 0;
          }
        });
      }
    }
  }
}
