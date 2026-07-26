import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface ShapeSlot {
  id: string;
  shapeType: 'circle' | 'triangle' | 'square' | 'star' | 'heart';
  name: string;
  colorHex: number;
  badgeEmoji: string;
  slotX: number;
  slotY: number;
  isFilled: boolean;
  slotGraphics?: Phaser.GameObjects.Graphics;
}

interface PieceItem {
  id: string;
  shapeType: 'circle' | 'triangle' | 'square' | 'star' | 'heart';
  name: string;
  colorHex: number;
  badgeEmoji: string;
  startX: number;
  startY: number;
  container?: Phaser.GameObjects.Container;
  isPlaced: boolean;
}

interface CastleRound {
  prompt: string;
  shapes: { id: string; shapeType: 'circle' | 'triangle' | 'square' | 'star' | 'heart'; name: string; colorHex: number; badgeEmoji: string }[];
}

export class CastlePuzzleScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private rounds: CastleRound[] = [
    {
      prompt: '🏰 Pasang bentuk Segitiga 🔺 & Persegi 🟦 untuk membuka Gerbang Kastil!',
      shapes: [
        { id: 'tri1', shapeType: 'triangle', name: 'Segitiga', colorHex: 0xef4444, badgeEmoji: '🔺' },
        { id: 'sq1', shapeType: 'square', name: 'Persegi', colorHex: 0x3b82f6, badgeEmoji: '🟦' }
      ]
    },
    {
      prompt: '🏰 Pasang Lingkaran Emas 🟡 & Bintang ⭐ pada Pintu Rahasia!',
      shapes: [
        { id: 'circ1', shapeType: 'circle', name: 'Lingkaran', colorHex: 0xeab308, badgeEmoji: '🟡' },
        { id: 'star1', shapeType: 'star', name: 'Bintang', colorHex: 0xa855f7, badgeEmoji: '⭐' }
      ]
    },
    {
      prompt: '🏰 Pasang Kunci Hati 💖 & Bintang Emas ⭐ untuk meraih Mahkota!',
      shapes: [
        { id: 'heart1', shapeType: 'heart', name: 'Hati', colorHex: 0xec4899, badgeEmoji: '💖' },
        { id: 'star2', shapeType: 'star', name: 'Bintang Emas', colorHex: 0xf59e0b, badgeEmoji: '⭐' }
      ]
    }
  ];

  private activeSlots: ShapeSlot[] = [];
  private activePieces: PieceItem[] = [];
  private promptTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;
  private filledCount: number = 0;

  constructor() {
    super('CastlePuzzleScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🏰 Kastil Puzzle Arkan!';
    this.currentRoundIndex = 0;
    this.filledCount = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Magical Night Sky Gradient Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x1e1b4b, 0x311b92, 0x4a148c, 1);
    bg.fillRect(0, 0, width, height);

    this.createStarsAndSparkles();
    this.createCastleGateBackground();
    this.createUI();
    this.createArkanKnightMascot();

    this.startRound(this.currentRoundIndex);
  }

  private createStarsAndSparkles() {
    const { width, height } = this.scale;
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(30, width - 30);
      const y = Phaser.Math.Between(30, height - 220);
      const star = this.add.text(x, y, '✨', { fontSize: `${Phaser.Math.Between(14, 22)}px` }).setAlpha(0.7);

      this.tweens.add({
        targets: star,
        alpha: 0.2,
        scale: 0.8,
        duration: 1500 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createCastleGateBackground() {
    const { width, height } = this.scale;

    const gate = this.add.graphics();

    // Left Castle Tower
    gate.fillStyle(0x334155, 1);
    gate.lineStyle(4, 0x64748b, 1);
    gate.fillRoundedRect(60, height - 480, 140, 360, 16);
    gate.strokeRoundedRect(60, height - 480, 140, 360, 16);

    // Right Castle Tower
    gate.fillRoundedRect(width - 200, height - 480, 140, 360, 16);
    gate.strokeRoundedRect(width - 200, height - 480, 140, 360, 16);

    // Tower Roofs
    gate.fillStyle(0x7c3aed, 1);
    gate.fillTriangle(60, height - 480, 130, height - 550, 200, height - 480);
    gate.fillTriangle(width - 200, height - 480, width - 130, height - 550, width - 60, height - 480);

    // Center Gate Arch Frame
    gate.fillStyle(0x1e293b, 0.95);
    gate.lineStyle(6, 0xf59e0b, 1);
    gate.fillRoundedRect(230, height - 460, 440, 320, 32);
    gate.strokeRoundedRect(230, height - 460, 440, 320, 32);

    // Torches
    this.add.text(115, height - 410, '🔥', { fontSize: '32px' }).setOrigin(0.5);
    this.add.text(width - 135, height - 410, '🔥', { fontSize: '32px' }).setOrigin(0.5);
  }

  private createArkanKnightMascot() {
    const { height } = this.scale;

    this.arkanMascotContainer = this.add.container(110, height - 70);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.25);
    shadow.fillRoundedRect(-75, -24, 150, 48, 20);
    this.arkanMascotContainer.add(shadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0xa855f7, 1);
    cardBg.fillRoundedRect(-75, -28, 150, 48, 20);
    cardBg.strokeRoundedRect(-75, -28, 150, 48, 20);
    this.arkanMascotContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '⚔️ 👦 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#6d28d9',
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

    this.arkanSpeechText = this.add.text(0, 0, '✨ Geser kepingan bentuk ke bingkai gerbang!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
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

    const { width, height } = this.scale;
    const roundData = this.rounds[roundIdx];
    this.filledCount = 0;

    // Clear previous objects
    this.activeSlots.forEach(s => s.slotGraphics?.destroy());
    this.activeSlots = [];

    this.activePieces.forEach(p => p.container?.destroy());
    this.activePieces = [];

    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 95, roundData.prompt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1e1b4b',
        strokeThickness: 5,
        align: 'center',
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.4)', blur: 6, fill: true }
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(roundData.prompt);
    }

    // Create Target Slots inside the Gate (Center X area)
    const slotCount = roundData.shapes.length;
    const slotStartX = width / 2 - (slotCount - 1) * 120;
    const slotY = height - 300;

    roundData.shapes.forEach((sData, idx) => {
      const posX = slotStartX + idx * 240;
      const slot: ShapeSlot = {
        id: sData.id,
        shapeType: sData.shapeType,
        name: sData.name,
        colorHex: sData.colorHex,
        badgeEmoji: sData.badgeEmoji,
        slotX: posX,
        slotY: slotY,
        isFilled: false
      };

      this.renderSlotGraphics(slot);
      this.activeSlots.push(slot);
    });

    // Create Draggable Pieces at Bottom Tray
    const pieceStartX = width / 2 - (slotCount - 1) * 140;
    const pieceY = height - 85;

    roundData.shapes.forEach((sData, idx) => {
      const posX = pieceStartX + idx * 280;
      const piece: PieceItem = {
        id: sData.id,
        shapeType: sData.shapeType,
        name: sData.name,
        colorHex: sData.colorHex,
        badgeEmoji: sData.badgeEmoji,
        startX: posX,
        startY: pieceY,
        isPlaced: false
      };

      this.createDraggablePiece(piece);
      this.activePieces.push(piece);
    });
  }

  private renderSlotGraphics(slot: ShapeSlot) {
    if (slot.slotGraphics) slot.slotGraphics.destroy();

    const g = this.add.graphics();
    g.lineStyle(4, slot.colorHex, 0.9);
    g.fillStyle(0x0f172a, 0.7);

    if (slot.shapeType === 'triangle') {
      g.fillTriangle(slot.slotX, slot.slotY - 45, slot.slotX - 45, slot.slotY + 35, slot.slotX + 45, slot.slotY + 35);
      g.strokeTriangle(slot.slotX, slot.slotY - 45, slot.slotX - 45, slot.slotY + 35, slot.slotX + 45, slot.slotY + 35);
    } else if (slot.shapeType === 'square') {
      g.fillRoundedRect(slot.slotX - 40, slot.slotY - 40, 80, 80, 16);
      g.strokeRoundedRect(slot.slotX - 40, slot.slotY - 40, 80, 80, 16);
    } else if (slot.shapeType === 'circle') {
      g.fillCircle(slot.slotX, slot.slotY, 44);
      g.strokeCircle(slot.slotX, slot.slotY, 44);
    } else if (slot.shapeType === 'star' || slot.shapeType === 'heart') {
      g.fillRoundedRect(slot.slotX - 42, slot.slotY - 42, 84, 84, 20);
      g.strokeRoundedRect(slot.slotX - 42, slot.slotY - 42, 84, 84, 20);
    }

    // Dashed Inner Outline Label
    this.add.text(slot.slotX, slot.slotY, slot.badgeEmoji, { fontSize: '32px' }).setOrigin(0.5).setAlpha(0.45);

    slot.slotGraphics = g;
  }

  private createDraggablePiece(piece: PieceItem) {
    const container = this.add.container(piece.startX, piece.startY);

    // Piece Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.3);
    shadow.fillCircle(0, 5, 42);
    container.add(shadow);

    // Piece Main Body
    const body = this.add.graphics();
    body.fillStyle(piece.colorHex, 1);
    body.lineStyle(4, 0xffffff, 1);

    if (piece.shapeType === 'triangle') {
      body.fillTriangle(0, -40, -40, 30, 40, 30);
      body.strokeTriangle(0, -40, -40, 30, 40, 30);
    } else if (piece.shapeType === 'square') {
      body.fillRoundedRect(-36, -36, 72, 72, 14);
      body.strokeRoundedRect(-36, -36, 72, 72, 14);
    } else if (piece.shapeType === 'circle') {
      body.fillCircle(0, 0, 38);
      body.strokeCircle(0, 0, 38);
    } else {
      body.fillRoundedRect(-38, -38, 76, 76, 18);
      body.strokeRoundedRect(-38, -38, 76, 76, 18);
    }
    container.add(body);

    const emojiLabel = this.add.text(0, 0, piece.badgeEmoji, { fontSize: '36px' }).setOrigin(0.5);
    container.add(emojiLabel);

    // Interactive Dragging
    container.setSize(90, 90);
    container.setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(container);

    container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (piece.isPlaced) return;
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', () => {
      if (piece.isPlaced) return;
      this.evaluatePieceDrop(piece, container);
    });

    piece.container = container;
  }

  private evaluatePieceDrop(piece: PieceItem, container: Phaser.GameObjects.Container) {
    const matchingSlot = this.activeSlots.find(s => s.id === piece.id && !s.isFilled);

    if (matchingSlot) {
      const dist = Phaser.Math.Distance.Between(container.x, container.y, matchingSlot.slotX, matchingSlot.slotY);

      if (dist < 80) {
        // ✅ SNAP INTO SLOT!
        piece.isPlaced = true;
        matchingSlot.isFilled = true;
        this.filledCount++;

        this.tweens.add({
          targets: container,
          x: matchingSlot.slotX,
          y: matchingSlot.slotY,
          duration: 180,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.spawnRewardParticles(matchingSlot.slotX, matchingSlot.slotY);
          }
        });

        this.score += 35;
        this.events.emit('update_score', this.score);

        this.triggerArkanCheer(`✨ Wah, kepingan ${piece.name} terpasang sempurna!`);

        if (this.filledCount >= this.activeSlots.length) {
          this.time.delayedCall(850, () => {
            this.currentRoundIndex++;
            if (this.currentRoundIndex < this.rounds.length) {
              this.triggerArkanCheer(`🎉 Gerbang Kastil Level ${this.currentRoundIndex} Terbuka!`);
              this.startRound(this.currentRoundIndex);
            } else {
              this.finishGame();
            }
          });
        }
        return;
      }
    }

    // ❌ SNAP BACK TO START
    this.tweens.add({
      targets: container,
      x: piece.startX,
      y: piece.startY,
      duration: 250,
      ease: 'Sine.easeInOut'
    });

    this.triggerArkanCheer('Coba paskan ke bingkai gerbang yang cocok ya! 💪');
  }
}
