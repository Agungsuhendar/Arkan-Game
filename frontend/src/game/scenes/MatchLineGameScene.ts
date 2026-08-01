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
  cardBg?: Phaser.GameObjects.Graphics;
  activeGlow?: Phaser.GameObjects.Graphics;
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
    this.load.image('icon_cat', '/cat_character_v2.png');
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

    // Premium Vibrant Playground Background Gradient
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

    // Global pointerup: clear dragging line if not dropped on target
    this.input.on('pointerup', () => {
      if (this.activeStartNode && this.currentDragLineGraphics) {
        this.currentDragLineGraphics.clear();
      }
    });

    this.startRound(this.currentRoundIndex);
  }

  private createDecorations() {
    const { width } = this.scale;
    const cloudEmojis = ['☁️', '✨', '🌈', '🌟', '🎈'];

    cloudEmojis.forEach((emoji, i) => {
      const x = (width * 0.08) + i * (width * 0.2);
      const y = 75 + (i % 2) * 20;
      const t = this.add.text(x, y, emoji, { fontSize: '28px' }).setAlpha(0.75);

      this.tweens.add({
        targets: t,
        y: y + 10,
        duration: 2200 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createArkanMascot() {
    const { width, height } = this.scale;
    const mascotY = height - 42;

    this.arkanMascotContainer = this.add.container(width / 2, mascotY);

    const bannerW = Math.min(360, width * 0.85);
    const mascotCardBg = this.add.graphics();
    mascotCardBg.fillStyle(0x0f172a, 0.2);
    mascotCardBg.fillRoundedRect(-bannerW / 2, -24, bannerW, 48, 20);

    mascotCardBg.fillStyle(0xffffff, 0.96);
    mascotCardBg.lineStyle(3, 0xf59e0b, 1);
    mascotCardBg.fillRoundedRect(-bannerW / 2, -28, bannerW, 48, 20);
    mascotCardBg.strokeRoundedRect(-bannerW / 2, -28, bannerW, 48, 20);
    this.arkanMascotContainer.add(mascotCardBg);

    const fontSize = Math.min(15, Math.max(12, width * 0.017)) + 'px';
    const mascotText = this.add.text(0, -4, '👦 Arkan: "Tarik garis atau sentuh gambar ke pasangannya!"', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize,
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Arkan Speech Bubble
    this.arkanSpeechBubble = this.add.container(width / 2, mascotY - 58);
    const bubbleW = Math.min(320, width * 0.75);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-bubbleW / 2, -18, bubbleW, 38, 16);
    bubbleBg.strokeRoundedRect(-bubbleW / 2, -18, bubbleW, 38, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Wah, gambar cocok!', {
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
        y: this.scale.height - 52,
        duration: 180,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      this.tweens.add({
        targets: this.arkanSpeechBubble,
        scaleX: 1.05,
        scaleY: 1.05,
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
    if (Math.random() > 0.35) return;
    const sparkle = this.add.text(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10), '✨', {
      fontSize: '16px'
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

    const { width, height } = this.scale;
    const roundData = this.rounds[roundIdx];
    this.connectedPairsCount = 0;
    this.activeStartNode = null;

    if (this.currentDragLineGraphics) this.currentDragLineGraphics.clear();

    const titleFontSize = Math.min(24, Math.max(16, width * 0.026)) + 'px';
    if (!this.titleTextObj) {
      this.titleTextObj = this.add.text(width / 2, 72, roundData.title, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: titleFontSize,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1e1b4b',
        strokeThickness: 5,
        shadow: { offsetX: 0, offsetY: 3, color: 'rgba(0,0,0,0.3)', blur: 5, fill: true }
      }).setOrigin(0.5);
    } else {
      this.titleTextObj.setText(roundData.title);
      this.titleTextObj.setFontSize(titleFontSize);
    }

    this.leftItems.forEach(item => item.container?.destroy());
    this.rightItems.forEach(item => item.container?.destroy());
    this.leftItems = [];
    this.rightItems = [];

    const leftList = roundData.pairs.map(p => ({ ...p.left, side: 'left' as const }));
    const rightList = Phaser.Utils.Array.Shuffle(roundData.pairs.map(p => ({ ...p.right, side: 'right' as const })));

    // Adaptive Card Sizing & Spacing for Small Screens and Tablets
    const numPairs = roundData.pairs.length;
    const startY = 135;
    const availableHeight = height - startY - 70;
    const spacingY = Math.min(92, Math.max(68, availableHeight / numPairs));

    const cardW = Math.min(215, Math.max(150, width * 0.27));
    const cardH = Math.min(72, Math.max(50, spacingY * 0.82));
    const leftX = width * 0.24;
    const rightX = width * 0.76;

    leftList.forEach((data, i) => {
      const y = startY + i * spacingY + (cardH / 2);
      const nodeX = leftX + (cardW / 2) + 14;
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

      item.container = this.createItemCard(item, true, cardW, cardH);
      this.leftItems.push(item);
    });

    rightList.forEach((data, i) => {
      const y = startY + i * spacingY + (cardH / 2);
      const nodeX = rightX - (cardW / 2) - 14;
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

      item.container = this.createItemCard(item, false, cardW, cardH);
      this.rightItems.push(item);
    });
  }

  private createItemCard(item: MatchItem, isLeft: boolean, cardW: number, cardH: number): Phaser.GameObjects.Container {
    const container = this.add.container(item.x, item.y);
    const halfW = cardW / 2;
    const halfH = cardH / 2;

    // 3D Card Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.18);
    shadow.fillRoundedRect(-halfW, -halfH + 4, cardW, cardH, 18);
    container.add(shadow);

    // Active Golden Selection Glow (hidden initially)
    const activeGlow = this.add.graphics();
    activeGlow.lineStyle(6, 0xf59e0b, 0.9);
    activeGlow.strokeRoundedRect(-halfW - 3, -halfH - 3, cardW + 6, cardH + 6, 20);
    activeGlow.setAlpha(0);
    container.add(activeGlow);
    item.activeGlow = activeGlow;

    // 3D Card Glass Background Box
    const bg = this.add.graphics();
    const primaryColor = isLeft ? 0x0284c7 : 0xdb2777;
    const fillColor = isLeft ? 0xf0f9ff : 0xfdf2f8;

    bg.fillStyle(fillColor, 0.96);
    bg.lineStyle(3, primaryColor, 1);
    bg.fillRoundedRect(-halfW, -halfH, cardW, cardH, 18);
    bg.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 18);
    container.add(bg);
    item.cardBg = bg;

    // Top Glossy Highlight Line
    const gloss = this.add.graphics();
    gloss.fillStyle(0xffffff, 0.55);
    gloss.fillRoundedRect(-halfW + 4, -halfH + 2, cardW - 8, Math.max(10, cardH * 0.22), { tl: 16, tr: 16, bl: 0, br: 0 });
    container.add(gloss);

    // High Definition 3D Pixar Icon Image
    const iconSize = Math.min(52, Math.max(34, cardH * 0.76));
    const iconOffsetX = isLeft ? -halfW + (iconSize / 2) + 12 : halfW - (iconSize / 2) - 12;

    if (this.textures.exists(item.imageKey)) {
      const iconImg = this.add.image(iconOffsetX, 0, item.imageKey);
      iconImg.setDisplaySize(iconSize, iconSize);
      container.add(iconImg);
    }

    // Label Text
    const labelFontSize = Math.min(19, Math.max(13, cardW * 0.095)) + 'px';
    const labelOffsetX = isLeft ? 12 : -12;
    const labelText = this.add.text(labelOffsetX, 0, item.label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: labelFontSize,
      color: isLeft ? '#0369a1' : '#be185d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(labelText);

    // Connection Node Dot (Glowing 3D Pearl Circle)
    const nodeX = isLeft ? halfW + 14 : -halfW - 14;

    const nodeGlow = this.add.graphics();
    nodeGlow.fillStyle(primaryColor, 0.35);
    nodeGlow.fillCircle(nodeX, 0, 18);
    container.add(nodeGlow);

    const nodeBg = this.add.graphics();
    nodeBg.fillStyle(primaryColor, 1);
    nodeBg.fillCircle(nodeX, 0, 14);
    nodeBg.lineStyle(3, 0xffffff, 1);
    nodeBg.strokeCircle(nodeX, 0, 14);
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

    // Touch Target Area (Generous touch target for small mobile phone screens!)
    const touchRadius = Math.max(36, cardH * 0.65);
    const hitAreaNode = this.add.circle(nodeX, 0, touchRadius);
    hitAreaNode.setInteractive({ useHandCursor: true });
    container.add(hitAreaNode);

    // Full Card Touch Area (Tap-to-Select / Tap-to-Connect support for mobile!)
    const cardHitArea = this.add.rectangle(0, 0, cardW, cardH);
    cardHitArea.setInteractive({ useHandCursor: true });
    container.add(cardHitArea);

    const handleSelectOrConnect = () => {
      if (item.connected) return;

      if (!this.activeStartNode) {
        // Mode 1/2: Set this item as active start node!
        this.selectActiveStartItem(item);
      } else if (this.activeStartNode === item) {
        // Deselect if tapped again
        this.deselectActiveItem();
      } else {
        // Complete connection!
        this.evaluateMatch(this.activeStartNode, item);
      }
    };

    // Node Touch Drag Start
    hitAreaNode.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      handleSelectOrConnect();
    });

    hitAreaNode.on('pointerup', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (this.activeStartNode && this.activeStartNode !== item) {
        this.evaluateMatch(this.activeStartNode, item);
      }
    });

    // Full Card Tap
    cardHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      handleSelectOrConnect();
    });

    return container;
  }

  private selectActiveStartItem(item: MatchItem) {
    this.deselectActiveItem();
    this.activeStartNode = item;

    if (item.activeGlow) {
      item.activeGlow.setAlpha(1);
    }

    if (item.container) {
      this.tweens.add({
        targets: item.container,
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private deselectActiveItem() {
    if (this.activeStartNode) {
      if (this.activeStartNode.activeGlow) {
        this.activeStartNode.activeGlow.setAlpha(0);
      }
      if (this.activeStartNode.container) {
        this.tweens.killTweensOf(this.activeStartNode.container);
        this.activeStartNode.container.setScale(1.0);
      }
      this.activeStartNode = null;
    }
    if (this.currentDragLineGraphics) {
      this.currentDragLineGraphics.clear();
    }
  }

  private evaluateMatch(startItem: MatchItem, targetItem: MatchItem) {
    if (startItem.side === targetItem.side) {
      this.showToast('Gariskan ke sisi seberang ya! ➡️', 0xf59e0b);
      this.deselectActiveItem();
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

      this.deselectActiveItem();

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

      this.deselectActiveItem();
    }
  }

  private showToast(message: string, colorHex: number) {
    const { width, height } = this.scale;

    const toastContainer = this.add.container(width / 2, height - 65);
    const toastW = Math.min(320, width * 0.85);

    const bg = this.add.graphics();
    bg.fillStyle(colorHex, 0.95);
    bg.fillRoundedRect(-toastW / 2, -22, toastW, 44, 18);
    toastContainer.add(bg);

    const txt = this.add.text(0, 0, message, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    toastContainer.add(txt);

    this.tweens.add({
      targets: toastContainer,
      y: height - 78,
      duration: 250,
      yoyo: true,
      hold: 900,
      onComplete: () => toastContainer.destroy()
    });
  }
}
