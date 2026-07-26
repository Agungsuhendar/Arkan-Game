import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface SteppingStone {
  id: string;
  valueNumber: number;
  label: string;
  badgeEmoji: string;
  x: number;
  y: number;
  isCorrect: boolean;
  container?: Phaser.GameObjects.Container;
}

interface ClimbRound {
  prompt: string;
  targetValue: number;
  targetCheckPointName: string;
  stones: { valueNumber: number; label: string; badgeEmoji: string; isCorrect: boolean }[];
}

export class MountainClimbScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private arkanClimberX: number = 180;
  private arkanClimberY: number = 480;
  private arkanClimberContainer?: Phaser.GameObjects.Container;

  private rounds: ClimbRound[] = [
    {
      prompt: '🏔️ Puncak 1: Pilih Batu Angka 3 untuk memanjat ke Pos Pertama 🚩!',
      targetValue: 3,
      targetCheckPointName: 'Pos 1: Hutan Pinus',
      stones: [
        { valueNumber: 1, label: 'Batu 1', badgeEmoji: '🪨', isCorrect: false },
        { valueNumber: 3, label: 'Batu 3', badgeEmoji: '⭐', isCorrect: true },
        { valueNumber: 5, label: 'Batu 5', badgeEmoji: '🪨', isCorrect: false }
      ]
    },
    {
      prompt: '🏔️ Puncak 2: Berapa 4 + 2? Panjat ke Batu Angka 6 🚩!',
      targetValue: 6,
      targetCheckPointName: 'Pos 2: Awan Berkilau',
      stones: [
        { valueNumber: 4, label: 'Batu 4', badgeEmoji: '🪨', isCorrect: false },
        { valueNumber: 6, label: 'Batu 6', badgeEmoji: '🌟', isCorrect: true },
        { valueNumber: 8, label: 'Batu 8', badgeEmoji: '🪨', isCorrect: false }
      ]
    },
    {
      prompt: '🏔️ Puncak Prestasi: Panjat ke Batu Mahkota 10 untuk meraih Tropi Emas 🏆!',
      targetValue: 10,
      targetCheckPointName: 'Puncak Gunung Prestasi',
      stones: [
        { valueNumber: 7, label: 'Batu 7', badgeEmoji: '🪨', isCorrect: false },
        { valueNumber: 10, label: 'Batu 10', badgeEmoji: '👑', isCorrect: true },
        { valueNumber: 9, label: 'Batu 9', badgeEmoji: '🪨', isCorrect: false }
      ]
    }
  ];

  private activeStones: SteppingStone[] = [];
  private promptTextObj?: Phaser.GameObjects.Text;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;

  constructor() {
    super('MountainClimbScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🏔️ Gunung Prestasi Arkan!';
    this.currentRoundIndex = 0;
    this.arkanClimberX = 180;
    this.arkanClimberY = 480;
  }

  create() {
    const { width, height } = this.scale;

    // Mountain Sky Background Gradient (Blue to Golden Sunset Peak)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xfde047, 0x4ade80, 1);
    bg.fillRect(0, 0, width, height);

    // Mountain Slope Polygon Path
    const mountain = this.add.graphics();
    mountain.fillStyle(0x334155, 1);
    mountain.beginPath();
    mountain.moveTo(60, height);
    mountain.lineTo(width / 2, 140);
    mountain.lineTo(width - 60, height);
    mountain.closePath();
    mountain.fillPath();

    // Snowy Mountain Peak Cap
    mountain.fillStyle(0xffffff, 0.95);
    mountain.beginPath();
    mountain.moveTo(width / 2 - 80, 240);
    mountain.lineTo(width / 2, 140);
    mountain.lineTo(width / 2 + 80, 240);
    mountain.closePath();
    mountain.fillPath();

    // Golden Crown & Flag at Peak
    this.add.text(width / 2, 105, '👑 🚩', { fontSize: '42px' }).setOrigin(0.5);

    // Pine Trees Decor on Slope
    this.add.text(120, height - 160, '🌲', { fontSize: '48px' });
    this.add.text(width - 160, height - 160, '🌲', { fontSize: '48px' });
    this.add.text(180, height - 260, '🌲', { fontSize: '38px' });

    this.createClouds();
    this.createUI();
    this.createArkanClimberMascot();

    this.startRound(this.currentRoundIndex);
  }

  private createClouds() {
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.text(50 + i * 220, 50 + (i % 2) * 20, '☁️', { fontSize: '38px' }).setAlpha(0.85);
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

  private createArkanClimberMascot() {
    this.arkanClimberContainer = this.add.container(this.arkanClimberX, this.arkanClimberY);

    // Climber Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.3);
    shadow.fillEllipse(0, 24, 70, 20);
    this.arkanClimberContainer.add(shadow);

    // Climber Badge Card
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0x16a34a, 1);
    cardBg.fillRoundedRect(-60, -25, 120, 46, 18);
    cardBg.strokeRoundedRect(-60, -25, 120, 46, 18);
    this.arkanClimberContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '🧗‍♂️ 👦 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#15803d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanClimberContainer.add(mascotText);

    // Speech Bubble
    this.arkanSpeechBubble = this.add.container(130, this.scale.height - 135);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-135, -22, 270, 44, 16);
    bubbleBg.strokeRoundedRect(-135, -22, 270, 44, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Panjat batu angka untuk menuju puncak!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#854d0e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanSpeechBubble.add(this.arkanSpeechText);
    this.arkanSpeechBubble.setAlpha(0);
  }

  private triggerArkanCheer(message: string) {
    if (this.arkanSpeechBubble && this.arkanSpeechText && this.arkanClimberContainer) {
      this.arkanSpeechText.setText(message);
      this.arkanSpeechBubble.setAlpha(1);
      this.arkanSpeechBubble.setScale(0.8);

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

    // Clear previous stones
    this.activeStones.forEach(s => s.container?.destroy());
    this.activeStones = [];

    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 95, roundData.prompt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1e293b',
        strokeThickness: 5,
        align: 'center',
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.4)', blur: 6, fill: true }
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(roundData.prompt);
    }

    // Positions for Stepping Stones along the slope height
    const stoneY = height - 190 - roundIdx * 100;
    const stoneCount = roundData.stones.length;
    const startX = width / 2 - (stoneCount - 1) * 110;

    roundData.stones.forEach((stoneData, idx) => {
      const posX = startX + idx * 220;
      const stone: SteppingStone = {
        id: `stone_${roundIdx}_${idx}`,
        valueNumber: stoneData.valueNumber,
        label: stoneData.label,
        badgeEmoji: stoneData.badgeEmoji,
        x: posX,
        y: stoneY,
        isCorrect: stoneData.isCorrect
      };

      this.createStoneGraphics(stone);
      this.activeStones.push(stone);
    });
  }

  private createStoneGraphics(stone: SteppingStone) {
    const container = this.add.container(stone.x, stone.y);

    // Stone 3D Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.25);
    shadow.fillCircle(0, 5, 40);
    container.add(shadow);

    // Stone Main Body
    const body = this.add.graphics();
    body.fillStyle(0x64748b, 1);
    body.lineStyle(4, 0xfde047, 1);
    body.fillCircle(0, 0, 36);
    body.strokeCircle(0, 0, 36);
    container.add(body);

    const emojiLabel = this.add.text(0, -8, stone.badgeEmoji, { fontSize: '24px' }).setOrigin(0.5);
    container.add(emojiLabel);

    const valText = this.add.text(0, 14, `${stone.valueNumber}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(valText);

    // Interactive Touch
    const hitArea = this.add.circle(0, 0, 40);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerdown', () => {
      this.evaluateStoneClick(stone, container);
    });

    stone.container = container;
  }

  private evaluateStoneClick(stone: SteppingStone, container: Phaser.GameObjects.Container) {
    if (stone.isCorrect) {
      // ✅ SUCCESS CLIMB JUMP!
      this.spawnRewardParticles(container.x, container.y);

      this.score += 35;
      this.events.emit('update_score', this.score);

      // Animate Arkan jumping to this stone
      if (this.arkanClimberContainer) {
        this.tweens.add({
          targets: this.arkanClimberContainer,
          x: stone.x - 70,
          y: stone.y,
          duration: 400,
          ease: 'Quad.easeOut'
        });
      }

      const cheers = ['✨ Panjatan hebat, Arkan berhasil memanjat!', '🎉 Hore, batu angkanya tepat!', '🌟 Selangkah lagi menuju Puncak!'];
      this.triggerArkanCheer(Phaser.Utils.Array.GetRandom(cheers));

      this.time.delayedCall(950, () => {
        this.currentRoundIndex++;
        if (this.currentRoundIndex < this.rounds.length) {
          this.triggerArkanCheer(`🚩 ${this.rounds[this.currentRoundIndex].targetCheckPointName} Dicapai!`);
          this.startRound(this.currentRoundIndex);
        } else {
          this.finishGame();
        }
      });
    } else {
      // ❌ WRONG STONE
      this.triggerArkanCheer('Hati-hati, pilih batu angka yang tepat ya! 💪');

      this.tweens.add({
        targets: container,
        x: container.x + 8,
        duration: 80,
        yoyo: true,
        repeat: 3
      });
    }
  }
}
