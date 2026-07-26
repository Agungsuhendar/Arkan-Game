import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface AnimalItem {
  id: string;
  name: string;
  emoji: string;
  soundText: string;
  favoriteFoodEmoji: string;
  favoriteFoodName: string;
  habitatEmoji: string;
  habitatName: string;
  colorHex: number;
}

interface IslandRound {
  prompt: string;
  targetId: string;
  animals: AnimalItem[];
}

export class AnimalIslandScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private rounds: IslandRound[] = [
    {
      prompt: '🏝️ Cari Kucing Mimi 🐱 yang bersuara "Meong... Meong!"',
      targetId: 'kucing',
      animals: [
        { id: 'anjing', name: 'Anjing', emoji: '🐶', soundText: 'Guk Guk!', favoriteFoodEmoji: '🦴', favoriteFoodName: 'Tulang', habitatEmoji: '🏡', habitatName: 'Rumah', colorHex: 0xf59e0b },
        { id: 'kucing', name: 'Kucing Mimi', emoji: '🐱', soundText: 'Meong!', favoriteFoodEmoji: '🐟', favoriteFoodName: 'Ikan', habitatEmoji: '🏡', habitatName: 'Rumah', colorHex: 0xec4899 },
        { id: 'kelinci', name: 'Kelinci', emoji: '🐰', soundText: 'Mencicit!', favoriteFoodEmoji: '🥕', favoriteFoodName: 'Wortel', habitatEmoji: '🌱', habitatName: 'Taman', colorHex: 0x3b82f6 }
      ]
    },
    {
      prompt: '🏝️ Beri makan Pisang 🍌 lezat untuk Monyet Cerdas 🐒!',
      targetId: 'monyet',
      animals: [
        { id: 'monyet', name: 'Monyet', emoji: '🐒', soundText: 'Uuk Aak!', favoriteFoodEmoji: '🍌', favoriteFoodName: 'Pisang', habitatEmoji: '🌳', habitatName: 'Hutan', colorHex: 0x84cc16 },
        { id: 'gajah', name: 'Gajah', emoji: '🐘', soundText: 'Trot!', favoriteFoodEmoji: '🍉', favoriteFoodName: 'Semangka', habitatEmoji: '🌾', habitatName: 'Padang Rumput', colorHex: 0x64748b },
        { id: 'kelinci', name: 'Kelinci', emoji: '🐰', soundText: 'Mencicit!', favoriteFoodEmoji: '🥕', favoriteFoodName: 'Wortel', habitatEmoji: '🌱', habitatName: 'Taman', colorHex: 0x3b82f6 }
      ]
    },
    {
      prompt: '🏝️ Temukan Lumba-Lumba 🐬 yang berenang bahagia di Laut 🌊!',
      targetId: 'lumba',
      animals: [
        { id: 'singa', name: 'Singa Raja', emoji: '🦁', soundText: 'Roar!', favoriteFoodEmoji: '🥩', favoriteFoodName: 'Daging', habitatEmoji: '🌾', habitatName: 'Padang Rumput', colorHex: 0xeab308 },
        { id: 'lumba', name: 'Lumba-Lumba', emoji: '🐬', soundText: 'Ciprat!', favoriteFoodEmoji: '🐟', favoriteFoodName: 'Ikan Kecil', habitatEmoji: '🌊', habitatName: 'Laut Dalam', colorHex: 0x06b6d4 },
        { id: 'anjing', name: 'Anjing', emoji: '🐶', soundText: 'Guk Guk!', favoriteFoodEmoji: '🦴', favoriteFoodName: 'Tulang', habitatEmoji: '🏡', habitatName: 'Rumah', colorHex: 0xf59e0b }
      ]
    }
  ];

  private activeAnimalContainers: Phaser.GameObjects.Container[] = [];
  private promptTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;

  constructor() {
    super('AnimalIslandScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🏝️ Pulau Hewan Arkan!';
    this.currentRoundIndex = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Tropical Island Ocean & Sky Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x0284c7, 0x0284c7, 1);
    bg.fillRect(0, 0, width, height);

    // Sandy Beach Coastline
    const beach = this.add.graphics();
    beach.fillStyle(0xfef08a, 1);
    beach.fillEllipse(width / 2, height - 120, width * 0.9, 220);

    // Lush Island Grass Patch
    beach.fillStyle(0x4ade80, 1);
    beach.fillEllipse(width / 2, height - 160, width * 0.75, 140);

    // Palm Trees Decor
    this.add.text(60, height - 320, '🌴', { fontSize: '72px' });
    this.add.text(width - 120, height - 320, '🌴', { fontSize: '72px' });
    this.add.text(140, height - 350, '🌴', { fontSize: '54px' });

    this.createClouds();
    this.createUI();
    this.createArkanSailorMascot();

    this.startRound(this.currentRoundIndex);
  }

  private createClouds() {
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.text(60 + i * 220, 45 + (i % 2) * 20, '☁️', { fontSize: '38px' }).setAlpha(0.8);
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

  private createArkanSailorMascot() {
    const { height } = this.scale;

    this.arkanMascotContainer = this.add.container(110, height - 70);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.25);
    shadow.fillRoundedRect(-75, -24, 150, 48, 20);
    this.arkanMascotContainer.add(shadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0x0284c7, 1);
    cardBg.fillRoundedRect(-75, -28, 150, 48, 20);
    cardBg.strokeRoundedRect(-75, -28, 150, 48, 20);
    this.arkanMascotContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '👨‍✈️ 👦 Kapten Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#0369a1',
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

    this.arkanSpeechText = this.add.text(0, 0, '✨ Sentuh hewan yang dicari di pulau ya!', {
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

    // Clear active animals
    this.activeAnimalContainers.forEach(c => c.destroy());
    this.activeAnimalContainers = [];

    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 95, roundData.prompt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#0369a1',
        strokeThickness: 5,
        align: 'center',
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.3)', blur: 6, fill: true }
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(roundData.prompt);
    }

    // Render 3D Animal Cards on Island Ground
    const cardCount = roundData.animals.length;
    const startX = width / 2 - (cardCount - 1) * 125;
    const cardY = height - 250;

    roundData.animals.forEach((animal, idx) => {
      const posX = startX + idx * 250;
      const container = this.add.container(posX, cardY);

      // Card 3D Shadow
      const shadow = this.add.graphics();
      shadow.fillStyle(0x0f172a, 0.2);
      shadow.fillRoundedRect(-80, -90, 160, 180, 24);
      container.add(shadow);

      // Card Main Glossy Body
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0xffffff, 0.96);
      cardBg.lineStyle(4, animal.colorHex, 1);
      cardBg.fillRoundedRect(-80, -95, 160, 180, 24);
      cardBg.strokeRoundedRect(-80, -95, 160, 180, 24);
      container.add(cardBg);

      // Animal Emoji
      const animalEmoji = this.add.text(0, -35, animal.emoji, { fontSize: '64px' }).setOrigin(0.5);
      container.add(animalEmoji);

      // Animal Name Badge
      const nameText = this.add.text(0, 35, animal.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        color: '#0f172a',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(nameText);

      // Sound Badge
      const soundBadge = this.add.text(0, 62, `🔊 "${animal.soundText}"`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        color: '#6366f1',
        fontStyle: 'bold',
        backgroundColor: 'rgba(238, 242, 255, 0.9)',
        padding: { x: 8, y: 3 }
      }).setOrigin(0.5);
      container.add(soundBadge);

      // Touch Interactive
      const hitArea = this.add.rectangle(0, 0, 160, 180);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerdown', () => {
        this.evaluateAnimalChoice(animal, container);
      });

      // Floating bounce animation on entry
      this.tweens.add({
        targets: container,
        y: cardY - 12,
        duration: 1800 + idx * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.activeAnimalContainers.push(container);
    });
  }

  private evaluateAnimalChoice(animal: AnimalItem, container: Phaser.GameObjects.Container) {
    const roundData = this.rounds[this.currentRoundIndex];

    if (animal.id === roundData.targetId) {
      // ✅ SUCCESS MATCH!
      this.spawnRewardParticles(container.x, container.y);

      this.score += 35;
      this.events.emit('update_score', this.score);

      // Animal Happy Jump Animation
      this.tweens.add({
        targets: container,
        scaleX: 1.25,
        scaleY: 1.25,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      const cheers = [
        `✨ Pintar! ${animal.name} (${animal.soundText}) gembira sekali!`,
        `🎉 Tepat sekali! ${animal.name} suka makanan ${animal.favoriteFoodEmoji}!`,
        `🌟 Hebat Kapten Arkan!`
      ];
      this.triggerArkanCheer(Phaser.Utils.Array.GetRandom(cheers));

      this.time.delayedCall(950, () => {
        this.currentRoundIndex++;
        if (this.currentRoundIndex < this.rounds.length) {
          this.triggerArkanCheer(`🎉 Pulau Hewan Level ${this.currentRoundIndex} Selesai!`);
          this.startRound(this.currentRoundIndex);
        } else {
          this.finishGame();
        }
      });
    } else {
      // ❌ WRONG ANIMAL
      this.triggerArkanCheer(`Ini ${animal.name} (${animal.soundText}), coba cari yang lain ya! 😊`);

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
