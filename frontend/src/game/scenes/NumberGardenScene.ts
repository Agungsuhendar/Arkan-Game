import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface FruitItem {
  id: number;
  value: number;
  imageKey: string;
  name: string;
  x: number;
  y: number;
  container?: Phaser.GameObjects.Container;
  picked?: boolean;
}

interface GardenRound {
  prompt: string;
  targetValue?: number;
  sequenceMode?: boolean;
  fruits: { value: number; imageKey: string; name: string }[];
}

export class NumberGardenScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private currentSequenceTarget: number = 1;
  private rounds: GardenRound[] = [
    {
      prompt: '🌻 Petik buah dari angka terkecil: 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5!',
      sequenceMode: true,
      fruits: [
        { value: 1, imageKey: 'icon_apple', name: 'Apel 1' },
        { value: 2, imageKey: 'icon_orange', name: 'Jeruk 2' },
        { value: 3, imageKey: 'icon_strawberry', name: 'Stroberi 3' },
        { value: 4, imageKey: 'icon_banana', name: 'Pisang 4' },
        { value: 5, imageKey: 'icon_watermelon', name: 'Semangka 5' }
      ]
    },
    {
      prompt: '🌻 Berapa 2 + 3? Petik buah dengan angka 5!',
      targetValue: 5,
      fruits: [
        { value: 3, imageKey: 'icon_banana', name: 'Pisang 3' },
        { value: 5, imageKey: 'icon_watermelon', name: 'Semangka 5' },
        { value: 2, imageKey: 'icon_orange', name: 'Jeruk 2' },
        { value: 4, imageKey: 'icon_strawberry', name: 'Stroberi 4' }
      ]
    },
    {
      prompt: '🌻 Ayo petik buah segar dengan angka 4!',
      targetValue: 4,
      fruits: [
        { value: 2, imageKey: 'icon_orange', name: 'Jeruk 2' },
        { value: 4, imageKey: 'icon_apple', name: 'Apel 4' },
        { value: 3, imageKey: 'icon_banana', name: 'Pisang 3' },
        { value: 1, imageKey: 'icon_strawberry', name: 'Stroberi 1' }
      ]
    }
  ];

  private activeFruits: FruitItem[] = [];
  private basketContainer?: Phaser.GameObjects.Container;
  private basketCountText?: Phaser.GameObjects.Text;
  private collectedCount: number = 0;
  private promptTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;
  private treeCanopyGfx?: Phaser.GameObjects.Graphics;

  constructor() {
    super('NumberGardenScene');
  }

  preload() {
    // Preload 3D Pixar Fruit Icon Assets
    this.load.image('icon_apple', '/icon_apple.png');
    this.load.image('icon_orange', '/icon_orange.png');
    this.load.image('icon_strawberry', '/icon_strawberry.png');
    this.load.image('icon_watermelon', '/icon_watermelon.png');
    this.load.image('icon_banana', '/icon_banana.png');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🌻 Kebun Angka Ajaib Arkan!';
    this.currentRoundIndex = 0;
    this.collectedCount = 0;
    this.currentSequenceTarget = 1;
  }

  create() {
    const { width, height } = this.scale;

    // Outdoor Sunny Garden Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x86efac, 0x86efac, 1);
    bg.fillRect(0, 0, width, height);

    // Green Grass Lawn Ground
    const lawn = this.add.graphics();
    lawn.fillStyle(0x16a34a, 1);
    lawn.fillRect(0, height - 210, width, 210);

    // Darker Lawn Path Accent
    lawn.fillStyle(0x15803d, 1);
    lawn.fillEllipse(width / 2, height - 60, width * 0.8, 80);

    // Wooden Picket Fence Background
    const fence = this.add.graphics();
    for (let x = 10; x < width; x += 44) {
      fence.fillStyle(0xfef08a, 1);
      fence.lineStyle(2, 0xca8a04, 1);
      fence.fillRoundedRect(x, height - 250, 32, 65, 8);
      fence.strokeRoundedRect(x, height - 250, 32, 65, 8);
    }

    this.createClouds();
    this.createFloatingButterflies();
    this.createUI();
    this.createFruitTree();
    this.createBasket();
    this.createArkanFarmerMascot();

    this.startRound(this.currentRoundIndex);
  }

  private createClouds() {
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.text(50 + i * 220, 35 + (i % 2) * 20, '☁️', { fontSize: '38px' }).setAlpha(0.75);
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

  private createFloatingButterflies() {
    const insects = ['🦋', '🐝', '🐞', '🌸'];

    insects.forEach((emoji, i) => {
      const insect = this.add.text(80 + i * 200, 180 + (i % 2) * 40, emoji, { fontSize: '26px' });

      this.tweens.add({
        targets: insect,
        x: insect.x + (i % 2 === 0 ? 60 : -60),
        y: insect.y - 25,
        duration: 2400 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createFruitTree() {
    const { width } = this.scale;

    // Trunk
    const trunk = this.add.graphics();
    trunk.fillStyle(0x78350f, 1);
    trunk.lineStyle(4, 0x451a03, 1);
    trunk.fillRoundedRect(width / 2 - 45, 170, 90, 240, 22);
    trunk.strokeRoundedRect(width / 2 - 45, 170, 90, 240, 22);

    // Big 3D Tree Canopy Foliage
    this.treeCanopyGfx = this.add.graphics();
    this.treeCanopyGfx.fillStyle(0x16a34a, 0.96);
    this.treeCanopyGfx.fillCircle(width / 2, 170, 160);
    this.treeCanopyGfx.fillCircle(width / 2 - 130, 200, 120);
    this.treeCanopyGfx.fillCircle(width / 2 + 130, 200, 120);

    this.treeCanopyGfx.fillStyle(0x22c55e, 0.9);
    this.treeCanopyGfx.fillCircle(width / 2, 150, 140);
    this.treeCanopyGfx.fillCircle(width / 2 - 90, 170, 100);
    this.treeCanopyGfx.fillCircle(width / 2 + 90, 170, 100);
  }

  private shakeTreeCanopy() {
    if (this.treeCanopyGfx) {
      this.tweens.add({
        targets: this.treeCanopyGfx,
        x: 8,
        duration: 80,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          if (this.treeCanopyGfx) this.treeCanopyGfx.x = 0;
        }
      });
    }

    // Leaf burst particles
    const { width } = this.scale;
    for (let i = 0; i < 5; i++) {
      const leaf = this.add.text(width / 2 + (Math.random() * 200 - 100), 180, '🍃', { fontSize: '20px' });
      this.tweens.add({
        targets: leaf,
        y: 350,
        x: leaf.x + (Math.random() * 40 - 20),
        alpha: 0,
        rotation: 1.5,
        duration: 900,
        onComplete: () => leaf.destroy()
      });
    }
  }

  private createBasket() {
    const { height } = this.scale;

    this.basketContainer = this.add.container(780, height - 80);

    const basketShadow = this.add.graphics();
    basketShadow.fillStyle(0x0f172a, 0.2);
    basketShadow.fillRoundedRect(-65, -32, 130, 64, 20);
    this.basketContainer.add(basketShadow);

    const basketBg = this.add.graphics();
    basketBg.fillStyle(0xb45309, 1);
    basketBg.lineStyle(4, 0x78350f, 1);
    basketBg.fillRoundedRect(-65, -34, 130, 64, 20);
    basketBg.strokeRoundedRect(-65, -34, 130, 64, 20);
    this.basketContainer.add(basketBg);

    const basketLabel = this.add.text(0, -10, '🧺 Keranjang', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.basketContainer.add(basketLabel);

    this.basketCountText = this.add.text(0, 12, 'Buah: 0', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#fef08a',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.basketContainer.add(this.basketCountText);
  }

  private createArkanFarmerMascot() {
    const { height } = this.scale;

    this.arkanMascotContainer = this.add.container(120, height - 90);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.2);
    shadow.fillRoundedRect(-85, -28, 170, 60, 22);
    this.arkanMascotContainer.add(shadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0x16a34a, 1);
    cardBg.fillRoundedRect(-85, -32, 170, 60, 22);
    cardBg.strokeRoundedRect(-85, -32, 170, 60, 22);
    this.arkanMascotContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '👨‍🌾 👦 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#15803d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Arkan Speech Bubble
    this.arkanSpeechBubble = this.add.container(130, height - 165);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-125, -22, 250, 44, 16);
    bubbleBg.strokeRoundedRect(-125, -22, 250, 44, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Yuk petik buahnya!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
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
        y: this.scale.height - 102,
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
    this.currentSequenceTarget = 1;

    // Set Banner Prompt
    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 95, roundData.prompt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '23px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#14532d',
        strokeThickness: 5,
        align: 'center',
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.3)', blur: 6, fill: true }
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(roundData.prompt);
    }

    // Clean previous active fruits
    this.activeFruits.forEach(f => f.container?.destroy());
    this.activeFruits = [];

    // Coordinates on Tree Canopy
    const positions = [
      { x: width / 2 - 130, y: 180 },
      { x: width / 2 - 40, y: 130 },
      { x: width / 2 + 50, y: 140 },
      { x: width / 2 + 130, y: 190 },
      { x: width / 2, y: 220 }
    ];

    const shuffledPositions = Phaser.Utils.Array.Shuffle([...positions]);

    roundData.fruits.forEach((data, i) => {
      const pos = shuffledPositions[i] || { x: width / 2, y: 200 };
      const item: FruitItem = {
        id: i,
        value: data.value,
        imageKey: data.imageKey,
        name: data.name,
        x: pos.x,
        y: pos.y,
        picked: false
      };

      item.container = this.createFruitCard(item);
      this.activeFruits.push(item);
    });
  }

  private createFruitCard(item: FruitItem): Phaser.GameObjects.Container {
    const container = this.add.container(item.x, item.y);

    // Fruit 3D Pulsing Glow Aura
    const aura = this.add.graphics();
    aura.fillStyle(0xfef08a, 0.45);
    aura.fillCircle(0, 0, 42);
    container.add(aura);

    // 3D Glass Bubble Background Box
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.96);
    bg.lineStyle(4, 0x16a34a, 1);
    bg.fillCircle(0, 0, 36);
    bg.strokeCircle(0, 0, 36);
    container.add(bg);

    // Render HD 3D Pixar Fruit Icon Image
    if (this.textures.exists(item.imageKey)) {
      const fruitImg = this.add.image(0, 0, item.imageKey);
      fruitImg.setDisplaySize(54, 54);
      container.add(fruitImg);
    } else {
      const txt = this.add.text(0, 0, '🍎', { fontSize: '32px' }).setOrigin(0.5);
      container.add(txt);
    }

    // Number Badge (Golden Star Circle on top right)
    const numBadge = this.add.graphics();
    numBadge.fillStyle(0xf59e0b, 1);
    numBadge.lineStyle(3, 0xffffff, 1);
    numBadge.fillCircle(20, -20, 17);
    numBadge.strokeCircle(20, -20, 17);
    container.add(numBadge);

    const numText = this.add.text(20, -20, `${item.value}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(numText);

    // Floating animation
    this.tweens.add({
      targets: container,
      y: item.y + (Math.random() * 12 - 6),
      duration: 1500 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Touch Event to Pick Fruit
    const hitArea = this.add.circle(0, 0, 42);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerdown', () => {
      if (item.picked) return;

      // Shake tree canopy when fruit is tapped
      this.shakeTreeCanopy();
      this.evaluateFruitPick(item);
    });

    return container;
  }

  private evaluateFruitPick(item: FruitItem) {
    const roundData = this.rounds[this.currentRoundIndex];

    let isCorrect = false;

    if (roundData.sequenceMode) {
      if (item.value === this.currentSequenceTarget) {
        isCorrect = true;
        this.currentSequenceTarget++;
      }
    } else if (roundData.targetValue) {
      if (item.value === roundData.targetValue) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      item.picked = true;
      this.collectedCount++;

      if (this.basketCountText) {
        this.basketCountText.setText(`Buah: ${this.collectedCount}`);
      }

      // Animate Fruit Falling into Woven Basket
      if (item.container) {
        this.tweens.add({
          targets: item.container,
          x: 780,
          y: this.scale.height - 80,
          scaleX: 0.3,
          scaleY: 0.3,
          duration: 650,
          ease: 'Back.easeIn',
          onComplete: () => {
            item.container?.destroy();
          }
        });
      }

      this.spawnRewardParticles(780, this.scale.height - 80);
      this.score += 25;
      this.events.emit('update_score', this.score);

      const cheers = ['✨ Yummy! Buah segar berhasil dipetik!', '🎉 Pintar sekali!', '🌟 Jawaban tepat!'];
      this.triggerArkanCheer(Phaser.Utils.Array.GetRandom(cheers));

      if (roundData.sequenceMode && this.currentSequenceTarget > roundData.fruits.length) {
        this.advanceRound();
      } else if (!roundData.sequenceMode && isCorrect) {
        this.advanceRound();
      }
    } else {
      // Wrong pick
      this.triggerArkanCheer('Coba buah yang lain yuk! 😊');

      if (item.container) {
        this.tweens.add({
          targets: item.container,
          x: item.x + 12,
          duration: 80,
          yoyo: true,
          repeat: 3
        });
      }
    }
  }

  private advanceRound() {
    this.time.delayedCall(800, () => {
      this.currentRoundIndex++;
      if (this.currentRoundIndex < this.rounds.length) {
        this.triggerArkanCheer(`🎉 Panen Level ${this.currentRoundIndex} Selesai!`);
        this.startRound(this.currentRoundIndex);
      } else {
        this.finishGame();
      }
    });
  }
}
