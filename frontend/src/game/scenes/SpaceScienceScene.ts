import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface PlanetItem {
  id: string;
  name: string;
  emoji: string;
  factText: string;
  colorHex: number;
  orbitRadius: number;
  speed: number;
  angle: number;
  container?: Phaser.GameObjects.Container;
}

interface ScienceRound {
  prompt: string;
  targetId: string;
  planets: PlanetItem[];
}

export class SpaceScienceScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private rounds: ScienceRound[] = [
    {
      prompt: '🚀 Terbangkan Roket ke Planet Bumi 🌍 tempat rumah kita tinggal!',
      targetId: 'bumi',
      planets: [
        { id: 'bumi', name: 'Planet Bumi', emoji: '🌍', factText: 'Bumi adalah planet tempat tinggal kita!', colorHex: 0x3b82f6, orbitRadius: 160, speed: 0.008, angle: 0 },
        { id: 'bulan', name: 'Bulan Indah', emoji: '🌙', factText: 'Bulan menyinari malam yang indah!', colorHex: 0xfef08a, orbitRadius: 250, speed: 0.012, angle: 2.1 },
        { id: 'matahari', name: 'Matahari', emoji: '☀️', factText: 'Matahari memberi cahaya dan hangat!', colorHex: 0xf59e0b, orbitRadius: 90, speed: 0.005, angle: 4.2 }
      ]
    },
    {
      prompt: '🚀 Temukan Saturnus 🪐 planet indah dengan cincin berkilau!',
      targetId: 'saturnus',
      planets: [
        { id: 'saturnus', name: 'Saturnus', emoji: '🪐', factText: 'Saturnus punya cincin es yang megah!', colorHex: 0xd97706, orbitRadius: 230, speed: 0.007, angle: 1.0 },
        { id: 'matahari', name: 'Matahari', emoji: '☀️', factText: 'Matahari adalah bintang terbesar!', colorHex: 0xf59e0b, orbitRadius: 90, speed: 0.005, angle: 3.5 },
        { id: 'bumi', name: 'Planet Bumi', emoji: '🌍', factText: 'Bumi kaya akan air dan oksigen!', colorHex: 0x3b82f6, orbitRadius: 160, speed: 0.008, angle: 5.2 }
      ]
    },
    {
      prompt: '🚀 Kunjungi Matahari ☀️ bintang raksasa pembawa hangat!',
      targetId: 'matahari',
      planets: [
        { id: 'matahari', name: 'Matahari', emoji: '☀️', factText: 'Matahari memberi sinar hangat bagi tumbuhan!', colorHex: 0xf59e0b, orbitRadius: 90, speed: 0.005, angle: 0.5 },
        { id: 'komet', name: 'Komet Cepat', emoji: '☄️', factText: 'Komet meluncur cepat di galaksi!', colorHex: 0x38bdf8, orbitRadius: 260, speed: 0.015, angle: 2.8 },
        { id: 'saturnus', name: 'Saturnus', emoji: '🪐', factText: 'Cincin Saturnus dari es dan debu!', colorHex: 0xd97706, orbitRadius: 200, speed: 0.007, angle: 4.8 }
      ]
    }
  ];

  private activePlanets: PlanetItem[] = [];
  private promptTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;

  constructor() {
    super('SpaceScienceScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🚀 Planet Sains Arkan!';
    this.currentRoundIndex = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Deep Cosmic Galaxy Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x090d16, 0x0f172a, 0x1e1b4b, 0x311b92, 1);
    bg.fillRect(0, 0, width, height);

    this.createTwinklingSpaceStars();
    this.createCenterGalaxyOrbitRings();
    this.createUI();
    this.createArkanAstronautMascot();

    this.startRound(this.currentRoundIndex);
  }

  update(_time: number, _delta: number) {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    // Rotate planets smoothly along their orbital paths
    this.activePlanets.forEach(p => {
      if (p.container) {
        p.angle += p.speed;
        p.container.x = centerX + Math.cos(p.angle) * p.orbitRadius;
        p.container.y = centerY + Math.sin(p.angle) * (p.orbitRadius * 0.65);
      }
    });
  }

  private createTwinklingSpaceStars() {
    const { width, height } = this.scale;
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(20, height - 120);
      const star = this.add.text(x, y, '✨', { fontSize: `${Phaser.Math.Between(12, 20)}px` }).setAlpha(0.65);

      this.tweens.add({
        targets: star,
        alpha: 0.15,
        scale: 0.7,
        duration: 1200 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createCenterGalaxyOrbitRings() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    const g = this.add.graphics();
    g.lineStyle(2, 0xc084fc, 0.35);

    // Orbital Rings
    g.strokeEllipse(centerX, centerY, 180 * 2, 180 * 1.3);
    g.strokeEllipse(centerX, centerY, 240 * 2, 240 * 1.3);

    // Galaxy Core Glow
    g.fillStyle(0xfde047, 0.25);
    g.fillCircle(centerX, centerY, 45);
  }

  private createArkanAstronautMascot() {
    const { height } = this.scale;

    this.arkanMascotContainer = this.add.container(110, height - 70);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.3);
    shadow.fillRoundedRect(-75, -24, 150, 48, 20);
    this.arkanMascotContainer.add(shadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0x38bdf8, 1);
    cardBg.fillRoundedRect(-75, -28, 150, 48, 20);
    cardBg.strokeRoundedRect(-75, -28, 150, 48, 20);
    this.arkanMascotContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '👨‍🚀 👦 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#0284c7',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Arkan Speech Bubble
    this.arkanSpeechBubble = this.add.container(130, height - 135);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-135, -22, 270, 44, 16);
    bubbleBg.strokeRoundedRect(-135, -22, 270, 44, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Terbangkan roket ke planet tujuan ya!', {
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

    const { width } = this.scale;
    const roundData = this.rounds[roundIdx];

    // Clear active planets
    this.activePlanets.forEach(p => p.container?.destroy());
    this.activePlanets = [];

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

    // Render Orbiting Planets
    roundData.planets.forEach(planet => {
      const container = this.add.container(0, 0);

      // Planet Glow Aura
      const glow = this.add.graphics();
      glow.fillStyle(planet.colorHex, 0.35);
      glow.fillCircle(0, 0, 48);
      container.add(glow);

      // Planet Main Body
      const body = this.add.graphics();
      body.fillStyle(planet.colorHex, 1);
      body.lineStyle(3, 0xffffff, 1);
      body.fillCircle(0, 0, 36);
      body.strokeCircle(0, 0, 36);
      container.add(body);

      // Planet Emoji
      const planetEmoji = this.add.text(0, 0, planet.emoji, { fontSize: '42px' }).setOrigin(0.5);
      container.add(planetEmoji);

      // Planet Name Badge
      const nameBadge = this.add.text(0, 48, planet.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        padding: { x: 8, y: 3 }
      }).setOrigin(0.5);
      container.add(nameBadge);

      // Touch Interactive
      const hitArea = this.add.circle(0, 0, 48);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerdown', () => {
        this.evaluatePlanetChoice(planet, container);
      });

      planet.container = container;
      this.activePlanets.push(planet);
    });
  }

  private evaluatePlanetChoice(planet: PlanetItem, container: Phaser.GameObjects.Container) {
    const roundData = this.rounds[this.currentRoundIndex];

    if (planet.id === roundData.targetId) {
      // ✅ SUCCESS MATCH!
      this.spawnRewardParticles(container.x, container.y);

      this.score += 35;
      this.events.emit('update_score', this.score);

      // Rocket Launch Pulse Animation
      this.tweens.add({
        targets: container,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      this.triggerArkanCheer(`🚀 ${planet.factText}`);

      this.time.delayedCall(950, () => {
        this.currentRoundIndex++;
        if (this.currentRoundIndex < this.rounds.length) {
          this.triggerArkanCheer(`🎉 Misi Sains Level ${this.currentRoundIndex} Selesai!`);
          this.startRound(this.currentRoundIndex);
        } else {
          this.finishGame();
        }
      });
    } else {
      // ❌ WRONG PLANET
      this.triggerArkanCheer(`Ini ${planet.name}, ayo cari ${roundData.prompt.split('!')[0]}! 🚀`);

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
