import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface MatchItem {
  id: string;
  label: string;
  imageKey: string;
  matchId: string;
  side: 'left' | 'right';
  x?: number;
  y?: number;
  nodeX?: number;
  nodeY?: number;
  container?: Phaser.GameObjects.Container;
  connected?: boolean;
}

interface MatchRound {
  title: string;
  pairs: {
    left: { id: string; label: string; imageKey: string };
    right: { id: string; label: string; imageKey: string };
  }[];
}

export class MatchLineGameScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private rounds: MatchRound[] = [
    {
      title: 'Cocokkan Hewan & Makanannya! 🐶',
      pairs: [
        { left: { id: 'anjing', label: 'Anjing', imageKey: 'icon_dog' }, right: { id: 'anjing', label: 'Tulang', imageKey: 'icon_bone' } },
        { left: { id: 'kucing', label: 'Kucing', imageKey: 'icon_cat' }, right: { id: 'kucing', label: 'Ikan', imageKey: 'icon_fish' } },
        { left: { id: 'monyet', label: 'Monyet', imageKey: 'icon_monkey' }, right: { id: 'monyet', label: 'Pisang', imageKey: 'icon_banana' } },
        { left: { id: 'kelinci', label: 'Kelinci', imageKey: 'icon_rabbit' }, right: { id: 'kelinci', label: 'Wortel', imageKey: 'icon_carrot' } }
      ]
    },
    {
      title: 'Cocokkan Kendaraan & Tempatnya! 🚗',
      pairs: [
        { left: { id: 'mobil', label: 'Mobil', imageKey: 'icon_car' }, right: { id: 'mobil', label: 'Jalan Raya', imageKey: 'icon_car' } },
        { left: { id: 'pesawat', label: 'Pesawat', imageKey: 'icon_plane' }, right: { id: 'pesawat', label: 'Awan', imageKey: 'icon_plane' } },
        { left: { id: 'kapal', label: 'Kapal Laut', imageKey: 'icon_ship' }, right: { id: 'kapal', label: 'Laut', imageKey: 'icon_ship' } },
        { left: { id: 'roket', label: 'Roket', imageKey: 'icon_rocket' }, right: { id: 'roket', label: 'Bulan', imageKey: 'icon_rocket' } }
      ]
    }
  ];

  private leftItems: MatchItem[] = [];
  private rightItems: MatchItem[] = [];
  private activeStartNode: MatchItem | null = null;
  private currentDragLineGraphics?: Phaser.GameObjects.Graphics;
  private connectedLinesGraphics?: Phaser.GameObjects.Graphics;
  private connectedPairsCount: number = 0;
  private titleTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;

  constructor() {
    super('MatchLineGameScene');
  }

  preload() {
    // Preload 3D Pixar Icon Images
    this.load.image('icon_dog', '/icon_dog.png');
    this.load.image('icon_bone', '/icon_bone.png');
    this.load.image('icon_cat', '/icon_cat.png');
    this.load.image('icon_fish', '/icon_fish.png');
    this.load.image('icon_monkey', '/icon_monkey.png');
    this.load.image('icon_banana', '/icon_banana.png');
    this.load.image('icon_rabbit', '/icon_rabbit.png');
    this.load.image('icon_carrot', '/icon_carrot.png');
    this.load.image('icon_car', '/icon_car.png');
    this.load.image('icon_plane', '/icon_plane.png');
    this.load.image('icon_ship', '/icon_ship.png');
    this.load.image('icon_rocket', '/icon_rocket.png');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🔗 Tarik Garis & Cocokkan Gambar!';
    this.currentRoundIndex = 0;
    this.connectedPairsCount = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Premium Vibrant Playground Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x818cf8, 0x818cf8, 1);
    bg.fillRect(0, 0, width, height);

    // Soft Background Sunburst Pattern
    const sunburst = this.add.graphics();
    sunburst.fillStyle(0xffffff, 0.08);
    for (let i = 0; i < 12; i++) {
      sunburst.beginPath();
      sunburst.moveTo(width / 2, height / 2);
      const a1 = (i * 30 * Math.PI) / 180;
      const a2 = ((i * 30 + 15) * Math.PI) / 180;
      sunburst.lineTo(width / 2 + 800 * Math.cos(a1), height / 2 + 800 * Math.sin(a1));
      sunburst.lineTo(width / 2 + 800 * Math.cos(a2), height / 2 + 800 * Math.sin(a2));
      sunburst.closePath();
      sunburst.fillPath();
    }

    this.createDecorations();
    this.createUI();
    this.createArkanMascot();

    // Permanent connected lines layer (glowing double-path)
    this.connectedLinesGraphics = this.add.graphics();
    // Dynamic dragging line layer (neon magic trail)
    this.currentDragLineGraphics = this.add.graphics();

    // Global pointer move listener for magic line dragging
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.activeStartNode && this.currentDragLineGraphics) {
        this.currentDragLineGraphics.clear();

        const startX = this.activeStartNode.nodeX || 0;
        const startY = this.activeStartNode.nodeY || 0;

        // Outer Neon Glow Layer
        this.currentDragLineGraphics.lineStyle(14, 0xfacc15, 0.45);
        this.currentDragLineGraphics.beginPath();
        this.currentDragLineGraphics.moveTo(startX, startY);
        this.currentDragLineGraphics.lineTo(pointer.x, pointer.y);
        this.currentDragLineGraphics.strokePath();

        // Inner Bright White Magic Core
        this.currentDragLineGraphics.lineStyle(6, 0xffffff, 0.95);
        this.currentDragLineGraphics.beginPath();
        this.currentDragLineGraphics.moveTo(startX, startY);
        this.currentDragLineGraphics.lineTo(pointer.x, pointer.y);
        this.currentDragLineGraphics.strokePath();

        // Drag tip star sparkle
        this.spawnTrailSparkle(pointer.x, pointer.y);
      }
    });

    // Pointer up listener to clear dragging line if released outside
    this.input.on('pointerup', () => {
      if (this.activeStartNode) {
        this.activeStartNode = null;
        if (this.currentDragLineGraphics) {
          this.currentDragLineGraphics.clear();
        }
      }
    });

    this.startRound(this.currentRoundIndex);
  }

  private createDecorations() {
    const cloudEmojis = ['☁️', '✨', '🌈', '🌟', '🎈'];

    cloudEmojis.forEach((emoji, i) => {
      const x = 70 + i * 200;
      const y = 85 + (i % 2) * 25;
      const t = this.add.text(x, y, emoji, { fontSize: '32px' }).setAlpha(0.7);

      this.tweens.add({
        targets: t,
        y: y + 12,
        duration: 2200 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createArkanMascot() {
    const { width, height } = this.scale;

    this.arkanMascotContainer = this.add.container(width / 2, height - 55);

    const mascotCardBg = this.add.graphics();
    mascotCardBg.fillStyle(0x0f172a, 0.2);
    mascotCardBg.fillRoundedRect(-150, -30, 300, 56, 24);

    mascotCardBg.fillStyle(0xffffff, 0.95);
    mascotCardBg.lineStyle(3, 0xf59e0b, 1);
    mascotCardBg.fillRoundedRect(-150, -35, 300, 56, 24);
    mascotCardBg.strokeRoundedRect(-150, -35, 300, 56, 24);
    this.arkanMascotContainer.add(mascotCardBg);

    const mascotText = this.add.text(0, -8, '👦 Arkan: "Tarik garis gambar ke pasangannya!"', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Arkan Speech Bubble
    this.arkanSpeechBubble = this.add.container(width / 2, height - 120);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-135, -22, 270, 44, 16);
    bubbleBg.strokeRoundedRect(-135, -22, 270, 44, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Wah, gambar cocok!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
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
        y: this.scale.height - 68,
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

  private spawnTrailSparkle(x: number, y: number) {
    if (Math.random() > 0.4) return;
    const sparkle = this.add.text(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10), '✨', {
      fontSize: '18px'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: sparkle,
      scale: 0,
      alpha: 0,
      duration: 350,
      onComplete: () => sparkle.destroy()
    });
  }

  private startRound(roundIdx: number) {
    if (roundIdx >= this.rounds.length) {
      this.finishGame();
      return;
    }

    const { width } = this.scale;
    const roundData = this.rounds[roundIdx];
    this.connectedPairsCount = 0;
    this.activeStartNode = null;

    if (this.currentDragLineGraphics) this.currentDragLineGraphics.clear();

    if (!this.titleTextObj) {
      this.titleTextObj = this.add.text(width / 2, 95, roundData.title, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '25px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1e1b4b',
        strokeThickness: 5,
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.3)', blur: 6, fill: true }
      }).setOrigin(0.5);
    } else {
      this.titleTextObj.setText(roundData.title);
    }

    this.leftItems.forEach(item => item.container?.destroy());
    this.rightItems.forEach(item => item.container?.destroy());
    this.leftItems = [];
    this.rightItems = [];

    const leftList = roundData.pairs.map(p => ({ ...p.left, side: 'left' as const }));
    const rightList = Phaser.Utils.Array.Shuffle(roundData.pairs.map(p => ({ ...p.right, side: 'right' as const })));

    const startY = 165;
    const spacingY = 95;
    const leftX = width * 0.25;
    const rightX = width * 0.75;

    leftList.forEach((data, i) => {
      const y = startY + i * spacingY;
      const nodeX = leftX + 115;
      const item: MatchItem = {
        id: data.id,
        label: data.label,
        imageKey: data.imageKey,
        matchId: data.id,
        side: 'left',
        x: leftX,
        y,
        nodeX,
        nodeY: y,
        connected: false
      };

      item.container = this.createItemCard(item, true);
      this.leftItems.push(item);
    });

    rightList.forEach((data, i) => {
      const y = startY + i * spacingY;
      const nodeX = rightX - 115;
      const item: MatchItem = {
        id: data.id,
        label: data.label,
        imageKey: data.imageKey,
        matchId: data.id,
        side: 'right',
        x: rightX,
        y,
        nodeX,
        nodeY: y,
        connected: false
      };

      item.container = this.createItemCard(item, false);
      this.rightItems.push(item);
    });
  }

  private createItemCard(item: MatchItem, isLeft: boolean): Phaser.GameObjects.Container {
    const container = this.add.container(item.x, item.y);

    // 3D Card Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.2);
    shadow.fillRoundedRect(-105, -34, 210, 72, 22);
    container.add(shadow);

    // 3D Card Glass Background Box
    const bg = this.add.graphics();
    const primaryColor = isLeft ? 0x0284c7 : 0xdb2777;
    const fillColor = isLeft ? 0xf0f9ff : 0xfdf2f8;

    bg.fillStyle(fillColor, 0.96);
    bg.lineStyle(4, primaryColor, 1);
    bg.fillRoundedRect(-105, -38, 210, 72, 22);
    bg.strokeRoundedRect(-105, -38, 210, 72, 22);
    container.add(bg);

    // Top Glossy Highlight Line
    const gloss = this.add.graphics();
    gloss.fillStyle(0xffffff, 0.6);
    gloss.fillRoundedRect(-100, -34, 200, 16, { tl: 18, tr: 18, bl: 0, br: 0 });
    container.add(gloss);

    // High Definition 3D Pixar Icon Image
    if (this.textures.exists(item.imageKey)) {
      const iconImg = this.add.image(isLeft ? -65 : 65, 0, item.imageKey);
      iconImg.setDisplaySize(56, 56);
      container.add(iconImg);
    }

    // Label Text
    const labelText = this.add.text(isLeft ? 12 : -12, 0, item.label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '21px',
      color: isLeft ? '#0369a1' : '#be185d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(labelText);

    // Connection Node Dot (Glowing 3D Pearl Circle)
    const nodeX = isLeft ? 115 : -115;

    const nodeGlow = this.add.graphics();
    nodeGlow.fillStyle(primaryColor, 0.3);
    nodeGlow.fillCircle(nodeX, 0, 22);
    container.add(nodeGlow);

    const nodeBg = this.add.graphics();
    nodeBg.fillStyle(primaryColor, 1);
    nodeBg.fillCircle(nodeX, 0, 16);
    nodeBg.lineStyle(3, 0xffffff, 1);
    nodeBg.strokeCircle(nodeX, 0, 16);
    container.add(nodeBg);

    // Pulse node glow tween
    this.tweens.add({
      targets: nodeGlow,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Interactive Touch Area for Line Connecting
    const hitArea = this.add.circle(nodeX, 0, 28);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (item.connected) return;

      this.activeStartNode = item;

      this.tweens.add({
        targets: container,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 120,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });

    hitArea.on('pointerup', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();

      if (this.activeStartNode && this.activeStartNode !== item) {
        this.evaluateMatch(this.activeStartNode, item);
        this.activeStartNode = null;
        if (this.currentDragLineGraphics) this.currentDragLineGraphics.clear();
      }
    });

    return container;
  }

  private evaluateMatch(startItem: MatchItem, targetItem: MatchItem) {
    if (startItem.side === targetItem.side) {
      this.showToast('Gariskan ke sisi seberang ya! ➡️', 0xf59e0b);
      return;
    }

    if (startItem.matchId === targetItem.matchId) {
      // ✅ SUCCESSFUL MATCH!
      startItem.connected = true;
      targetItem.connected = true;
      this.connectedPairsCount++;

      if (this.connectedLinesGraphics) {
        this.connectedLinesGraphics.lineStyle(14, 0x10b981, 0.4);
        this.connectedLinesGraphics.beginPath();
        this.connectedLinesGraphics.moveTo(startItem.nodeX || 0, startItem.nodeY || 0);
        this.connectedLinesGraphics.lineTo(targetItem.nodeX || 0, targetItem.nodeY || 0);
        this.connectedLinesGraphics.strokePath();

        this.connectedLinesGraphics.lineStyle(8, 0x059669, 1);
        this.connectedLinesGraphics.beginPath();
        this.connectedLinesGraphics.moveTo(startItem.nodeX || 0, startItem.nodeY || 0);
        this.connectedLinesGraphics.lineTo(targetItem.nodeX || 0, targetItem.nodeY || 0);
        this.connectedLinesGraphics.strokePath();

        this.connectedLinesGraphics.fillStyle(0x10b981, 1);
        this.connectedLinesGraphics.fillCircle(startItem.nodeX || 0, startItem.nodeY || 0, 14);
        this.connectedLinesGraphics.fillCircle(targetItem.nodeX || 0, targetItem.nodeY || 0, 14);
      }

      this.spawnRewardParticles(startItem.nodeX || 0, startItem.nodeY || 0);
      this.spawnRewardParticles(targetItem.nodeX || 0, targetItem.nodeY || 0);

      this.score += 30;
      this.events.emit('update_score', this.score);

      const cheers = [
        '✨ Wah, gambarnya cocok sekali!',
        '🎉 Pintar sekali, Arkan bangga!',
        '🌟 Tepat sekali!',
        '👏 Kamu anak yang cerdas!'
      ];
      const randomCheer = Phaser.Utils.Array.GetRandom(cheers);
      this.triggerArkanCheer(randomCheer);

      if (this.connectedPairsCount >= 4) {
        this.time.delayedCall(800, () => {
          this.currentRoundIndex++;
          if (this.connectedLinesGraphics) this.connectedLinesGraphics.clear();

          if (this.currentRoundIndex < this.rounds.length) {
            this.triggerArkanCheer(`🎉 Level ${this.currentRoundIndex} Selesai!`);
            this.startRound(this.currentRoundIndex);
          } else {
            this.finishGame();
          }
        });
      }
    } else {
      // ❌ WRONG MATCH
      this.triggerArkanCheer('Coba lagi yuk, gambar ini belum cocok! 💪');

      const errorLine = this.add.graphics();
      errorLine.lineStyle(8, 0xef4444, 0.85);
      errorLine.beginPath();
      errorLine.moveTo(startItem.nodeX || 0, startItem.nodeY || 0);
      errorLine.lineTo(targetItem.nodeX || 0, targetItem.nodeY || 0);
      errorLine.strokePath();

      this.tweens.add({
        targets: errorLine,
        alpha: 0,
        duration: 500,
        onComplete: () => errorLine.destroy()
      });
    }
  }

  private showToast(message: string, colorHex: number) {
    const { width, height } = this.scale;

    const toastContainer = this.add.container(width / 2, height - 70);

    const bg = this.add.graphics();
    bg.fillStyle(colorHex, 0.95);
    bg.fillRoundedRect(-160, -25, 320, 50, 20);
    toastContainer.add(bg);

    const txt = this.add.text(0, 0, message, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    toastContainer.add(txt);

    this.tweens.add({
      targets: toastContainer,
      y: height - 85,
      duration: 250,
      yoyo: true,
      hold: 900,
      onComplete: () => toastContainer.destroy()
    });
  }
}
