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
      title: 'Level 1: Hewan & Makanannya! 🐶',
      pairs: [
        { left: { id: 'anjing', label: 'Anjing', imageKey: 'icon_dog' }, right: { id: 'anjing', label: 'Tulang', imageKey: 'icon_bone' } },
        { left: { id: 'kucing', label: 'Kucing', imageKey: 'icon_cat' }, right: { id: 'kucing', label: 'Ikan', imageKey: 'icon_fish' } },
        { left: { id: 'monyet', label: 'Monyet', imageKey: 'icon_monkey' }, right: { id: 'monyet', label: 'Pisang', imageKey: 'icon_banana' } },
        { left: { id: 'kelinci', label: 'Kelinci', imageKey: 'icon_rabbit' }, right: { id: 'kelinci', label: 'Wortel', imageKey: 'icon_carrot' } }
      ]
    },
    {
      title: 'Level 2: Kendaraan & Tempatnya! 🚗',
      pairs: [
        { left: { id: 'mobil', label: 'Mobil', imageKey: 'icon_car' }, right: { id: 'mobil', label: 'Jalan Raya', imageKey: 'emoji:🛣️' } },
        { left: { id: 'pesawat', label: 'Pesawat', imageKey: 'icon_plane' }, right: { id: 'pesawat', label: 'Awan Sky', imageKey: 'emoji:☁️' } },
        { left: { id: 'kapal', label: 'Kapal Laut', imageKey: 'icon_ship' }, right: { id: 'kapal', label: 'Lautan Biru', imageKey: 'emoji:🌊' } },
        { left: { id: 'roket', label: 'Roket', imageKey: 'icon_rocket' }, right: { id: 'roket', label: 'Bulan', imageKey: 'emoji:🌙' } }
      ]
    },
    {
      title: 'Level 3: Huruf Besar & Huruf Kecil! 🔤',
      pairs: [
        { left: { id: 'A', label: 'Huruf A', imageKey: 'emoji:🅰️' }, right: { id: 'A', label: 'huruf a', imageKey: 'emoji:a' } },
        { left: { id: 'B', label: 'Huruf B', imageKey: 'emoji:🅱️' }, right: { id: 'B', label: 'huruf b', imageKey: 'emoji:b' } },
        { left: { id: 'C', label: 'Huruf C', imageKey: 'emoji:🔤' }, right: { id: 'C', label: 'huruf c', imageKey: 'emoji:c' } },
        { left: { id: 'D', label: 'Huruf D', imageKey: 'emoji:🔠' }, right: { id: 'D', label: 'huruf d', imageKey: 'emoji:d' } }
      ]
    },
    {
      title: 'Level 4: Warna & Objek! 🎨',
      pairs: [
        { left: { id: 'merah', label: 'Merah', imageKey: 'emoji:🔴' }, right: { id: 'merah', label: 'Apel Merah', imageKey: 'emoji:🍎' } },
        { left: { id: 'kuning', label: 'Kuning', imageKey: 'emoji:🟡' }, right: { id: 'kuning', label: 'Pisang Kuning', imageKey: 'icon_banana' } },
        { left: { id: 'hijau', label: 'Hijau', imageKey: 'emoji:🟢' }, right: { id: 'hijau', label: 'Daun Hijau', imageKey: 'emoji:🍃' } },
        { left: { id: 'biru', label: 'Biru', imageKey: 'emoji:🔵' }, right: { id: 'biru', label: 'Lautan Biru', imageKey: 'emoji:🌊' } }
      ]
    },
    {
      title: 'Level 5: Berhitung Jumlah Benda! 🔢',
      pairs: [
        { left: { id: '1', label: 'Angka 1', imageKey: 'emoji:1️⃣' }, right: { id: '1', label: '1 Apel', imageKey: 'emoji:🍎' } },
        { left: { id: '2', label: 'Angka 2', imageKey: 'emoji:2️⃣' }, right: { id: '2', label: '2 Pisang', imageKey: 'icon_banana' } },
        { left: { id: '3', label: 'Angka 3', imageKey: 'emoji:3️⃣' }, right: { id: '3', label: '3 Ikan', imageKey: 'icon_fish' } },
        { left: { id: '4', label: 'Angka 4', imageKey: 'emoji:4️⃣' }, right: { id: '4', label: '4 Wortel', imageKey: 'icon_carrot' } }
      ]
    },
    {
      title: 'Level 6: Profesi & Alat Kerja! 🧑‍⚕️',
      pairs: [
        { left: { id: 'dokter', label: 'Pak Dokter', imageKey: 'emoji:👨‍⚕️' }, right: { id: 'dokter', label: 'Stetoskop', imageKey: 'emoji:🩺' } },
        { left: { id: 'koki', label: 'Ibu Koki', imageKey: 'emoji:👩‍🍳' }, right: { id: 'koki', label: 'Wajan Masak', imageKey: 'emoji:🍳' } },
        { left: { id: 'pelukis', label: 'Pelukis', imageKey: 'emoji:🎨' }, right: { id: 'pelukis', label: 'Kuas Lukis', imageKey: 'emoji:🖌️' } },
        { left: { id: 'polisi', label: 'Pak Polisi', imageKey: 'emoji:👮' }, right: { id: 'polisi', label: 'Mobil Polisi', imageKey: 'emoji:🚔' } }
      ]
    },
    {
      title: 'Level 7: Bahasa Inggris & Indonesia! 🇬🇧🇮🇩',
      pairs: [
        { left: { id: 'cat', label: 'Cat', imageKey: 'icon_cat' }, right: { id: 'cat', label: 'Kucing', imageKey: 'icon_cat' } },
        { left: { id: 'dog', label: 'Dog', imageKey: 'icon_dog' }, right: { id: 'dog', label: 'Anjing', imageKey: 'icon_dog' } },
        { left: { id: 'sun', label: 'Sun', imageKey: 'emoji:☀️' }, right: { id: 'sun', label: 'Matahari', imageKey: 'emoji:☀️' } },
        { left: { id: 'car', label: 'Car', imageKey: 'icon_car' }, right: { id: 'car', label: 'Mobil', imageKey: 'icon_car' } }
      ]
    },
    {
      title: 'Level 8: Bayangan & Siluet Benda! 👥',
      pairs: [
        { left: { id: 'apel', label: 'Apel Merah', imageKey: 'emoji:🍎' }, right: { id: 'apel', label: 'Siluet Apel', imageKey: 'emoji:🍏' } },
        { left: { id: 'mobil', label: 'Mobil Merah', imageKey: 'icon_car' }, right: { id: 'mobil', label: 'Siluet Mobil', imageKey: 'emoji:🚙' } },
        { left: { id: 'kucing', label: 'Kucing Orange', imageKey: 'icon_cat' }, right: { id: 'kucing', label: 'Siluet Kucing', imageKey: 'emoji:🐈‍⬛' } },
        { left: { id: 'burung', label: 'Burung Biru', imageKey: 'emoji:🐦' }, right: { id: 'burung', label: 'Siluet Burung', imageKey: 'emoji:🦅' } }
      ]
    },
    {
      title: 'Level 9: Bentuk Geometri & Objek! 📐',
      pairs: [
        { left: { id: 'lingkaran', label: 'Lingkaran', imageKey: 'emoji:🔴' }, right: { id: 'lingkaran', label: 'Bola Sepak', imageKey: 'emoji:⚽' } },
        { left: { id: 'persegi', label: 'Persegi', imageKey: 'emoji:🟦' }, right: { id: 'persegi', label: 'Dadu Mainan', imageKey: 'emoji:🎲' } },
        { left: { id: 'segitiga', label: 'Segitiga', imageKey: 'emoji:🔺' }, right: { id: 'segitiga', label: 'Potongan Pizza', imageKey: 'emoji:🍕' } },
        { left: { id: 'bintang', label: 'Bintang', imageKey: 'emoji:⭐' }, right: { id: 'bintang', label: 'Bintang Laut', imageKey: 'emoji:🪸' } }
      ]
    }
  ];

  private leftItems: MatchItem[] = [];
  private rightItems: MatchItem[] = [];
  private activeStartNode: MatchItem | null = null;
  private currentDragLineGraphics?: Phaser.GameObjects.Graphics;
  private connectedLinesGraphics?: Phaser.GameObjects.Graphics;
  private currentHintGraphics?: Phaser.GameObjects.Graphics;
  private hintTimer?: Phaser.Time.TimerEvent;
  private connectedPairsCount: number = 0;
  private titleTextObj?: Phaser.GameObjects.Text;
  private titleBannerBg?: Phaser.GameObjects.Graphics;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;
  private currentLineStyle: 'rainbow' | 'nature' | 'heart' = 'rainbow';
  private lineStyleButtons: { btn: Phaser.GameObjects.Container; style: 'rainbow' | 'nature' | 'heart'; glow: Phaser.GameObjects.Graphics }[] = [];
  private bgImage?: Phaser.GameObjects.Image;

  constructor() {
    super('MatchLineGameScene');
  }

  preload() {
    // Preload Forest Background provided by user
    this.load.image('matchline_bg', '/matchline_bg.jpg');

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
    this.promptText = '';
    this.currentRoundIndex = 0;
    this.connectedPairsCount = 0;
  }

  create() {
    const { width, height } = this.scale;

    // 1. Forest Landscape Background
    if (this.textures.exists('matchline_bg')) {
      this.bgImage = this.add.image(width / 2, height / 2, 'matchline_bg');
      const scaleX = width / this.bgImage.width;
      const scaleY = height / this.bgImage.height;
      const scale = Math.max(scaleX, scaleY);
      this.bgImage.setScale(scale).setScrollFactor(0);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x15803d, 0x15803d, 0x166534, 0x166534, 1);
      bg.fillRect(0, 0, width, height);
    }

    // Soft Ambient Overlay to make cards & text pop clearly over nature background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0f172a, 0.15);
    overlay.fillRect(0, 0, width, height);

    // Floating Nature Particles (Fireflies & Floating Leaves)
    this.createAmbientNatureParticles();

    this.createDecorations();
    this.createUI();
    this.createArkanMascot();
    this.createLineStyleSelector();

    // Permanent connected lines layer (glowing double-path)
    this.connectedLinesGraphics = this.add.graphics();
    // Hint line layer
    this.currentHintGraphics = this.add.graphics();
    // Dynamic dragging line layer (neon magic trail)
    this.currentDragLineGraphics = this.add.graphics();

    // Global pointer move listener for magic line dragging & hint reset
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.resetHintTimer();

      if (this.activeStartNode && this.currentDragLineGraphics) {
        this.currentDragLineGraphics.clear();

        const startX = this.activeStartNode.nodeX || 0;
        const startY = this.activeStartNode.nodeY || 0;

        let auraColor = 0xfacc15;
        let coreColor = 0xffffff;

        if (this.currentLineStyle === 'nature') {
          auraColor = 0x10b981;
          coreColor = 0xecfdf5;
        } else if (this.currentLineStyle === 'heart') {
          auraColor = 0xf43f5e;
          coreColor = 0xfff1f2;
        }

        // Outer Glowing Magic Aura
        this.currentDragLineGraphics.lineStyle(14, auraColor, 0.5);
        this.currentDragLineGraphics.beginPath();
        this.currentDragLineGraphics.moveTo(startX, startY);
        this.currentDragLineGraphics.lineTo(pointer.x, pointer.y);
        this.currentDragLineGraphics.strokePath();

        // Inner Core Line
        this.currentDragLineGraphics.lineStyle(6, coreColor, 0.95);
        this.currentDragLineGraphics.beginPath();
        this.currentDragLineGraphics.moveTo(startX, startY);
        this.currentDragLineGraphics.lineTo(pointer.x, pointer.y);
        this.currentDragLineGraphics.strokePath();

        // Drag tip star sparkle
        this.spawnTrailSparkle(pointer.x, pointer.y);
      }
    });

    // Global pointerup: forgiving kid-friendly drag release hit detection
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.resetHintTimer();

      if (this.activeStartNode) {
        const oppositeItems = this.activeStartNode.side === 'left' ? this.rightItems : this.leftItems;
        const availableTargets = oppositeItems.filter(item => !item.connected);

        let bestTarget: MatchItem | null = null;
        let minDistance = 140; // Super generous 140px snap radius for children!

        availableTargets.forEach(target => {
          const nodeX = target.nodeX || 0;
          const nodeY = target.nodeY || 0;
          const distToNode = Phaser.Math.Distance.Between(pointer.x, pointer.y, nodeX, nodeY);

          const cardX = target.x || 0;
          const cardY = target.y || 0;
          const distToCard = Phaser.Math.Distance.Between(pointer.x, pointer.y, cardX, cardY);

          const effectiveDist = Math.min(distToNode, distToCard);
          if (effectiveDist < minDistance) {
            minDistance = effectiveDist;
            bestTarget = target;
          }
        });

        if (bestTarget) {
          this.evaluateMatch(this.activeStartNode, bestTarget);
        } else {
          this.deselectActiveItem();
        }
      }

      if (this.currentDragLineGraphics) {
        this.currentDragLineGraphics.clear();
      }
    });

    this.startRound(this.currentRoundIndex);
  }

  private createAmbientNatureParticles() {
    const { width, height } = this.scale;
    const particleSymbols = ['✨', '🍃', '🌟', '🟡', '🍀'];

    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(30, width - 30);
      const y = Phaser.Math.Between(40, height - 40);
      const sym = Phaser.Utils.Array.GetRandom(particleSymbols);
      const p = this.add.text(x, y, sym, {
        fontSize: Phaser.Math.Between(14, 24) + 'px'
      }).setAlpha(Phaser.Math.FloatBetween(0.35, 0.75));

      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(30, 80),
        x: p.x + Phaser.Math.Between(-35, 35),
        alpha: { from: p.alpha, to: 0.1 },
        duration: Phaser.Math.Between(3200, 6500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 180
      });
    }
  }

  private resetHintTimer() {
    if (this.hintTimer) {
      this.hintTimer.remove();
    }
    if (this.currentHintGraphics) {
      this.currentHintGraphics.clear();
    }
    this.hintTimer = this.time.delayedCall(10000, () => {
      this.showAutoHint();
    });
  }

  private showAutoHint() {
    const unconnectedLeft = this.leftItems.find(item => !item.connected);
    if (!unconnectedLeft) return;

    const matchingRight = this.rightItems.find(item => item.matchId === unconnectedLeft.matchId && !item.connected);
    if (!matchingRight) return;

    if (!this.currentHintGraphics) {
      this.currentHintGraphics = this.add.graphics();
    }
    this.currentHintGraphics.clear();
    this.currentHintGraphics.lineStyle(5, 0xfde047, 0.9);

    const x1 = unconnectedLeft.nodeX || 0;
    const y1 = unconnectedLeft.nodeY || 0;
    const x2 = matchingRight.nodeX || 0;
    const y2 = matchingRight.nodeY || 0;

    const steps = 14;
    for (let i = 0; i <= steps; i += 2) {
      const t1 = i / steps;
      const t2 = (i + 1) / steps;
      this.currentHintGraphics.beginPath();
      this.currentHintGraphics.moveTo(x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1);
      this.currentHintGraphics.lineTo(x1 + (x2 - x1) * t2, y1 + (y2 - y1) * t2);
      this.currentHintGraphics.strokePath();
    }

    if (unconnectedLeft.container && matchingRight.container) {
      this.tweens.add({
        targets: [unconnectedLeft.container, matchingRight.container],
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 300,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut'
      });
    }

    this.speak(`Cobalah cocokkan ${unconnectedLeft.label}`);
    this.triggerArkanCheer(`💡 Petunjuk: Tarik ${unconnectedLeft.label}!`);
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

    const bannerW = Math.min(380, width * 0.88);
    const mascotCardBg = this.add.graphics();
    // Glassmorphism Dark Emerald Slate Box
    mascotCardBg.fillStyle(0x064e3b, 0.85);
    mascotCardBg.lineStyle(3, 0x34d399, 1);
    mascotCardBg.fillRoundedRect(-bannerW / 2, -26, bannerW, 52, 22);
    mascotCardBg.strokeRoundedRect(-bannerW / 2, -26, bannerW, 52, 22);
    this.arkanMascotContainer.add(mascotCardBg);

    const fontSize = Math.min(15, Math.max(12, width * 0.017)) + 'px';
    const mascotText = this.add.text(0, 0, '👦 Arkan: "Hubungkan gambar dengan pasangannya ya!"', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize,
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Arkan Speech Bubble Popup
    this.arkanSpeechBubble = this.add.container(width / 2, mascotY - 60);
    const bubbleW = Math.min(340, width * 0.78);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 0.98);
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

  private createLineStyleSelector() {
    const selectorContainer = this.add.container(20, 20);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.75);
    bg.lineStyle(2, 0xf59e0b, 0.8);
    bg.fillRoundedRect(0, 0, 140, 44, 22);
    bg.strokeRoundedRect(0, 0, 140, 44, 22);
    selectorContainer.add(bg);

    const styles: { style: 'rainbow' | 'nature' | 'heart'; emoji: string }[] = [
      { style: 'rainbow', emoji: '🌈' },
      { style: 'nature', emoji: '🍃' },
      { style: 'heart', emoji: '💖' }
    ];

    this.lineStyleButtons = [];

    styles.forEach((item, i) => {
      const btnX = 24 + i * 44;
      const btnY = 22;

      const btnContainer = this.add.container(btnX, btnY);

      const glow = this.add.graphics();
      glow.lineStyle(3, 0xfde047, 1);
      glow.strokeCircle(0, 0, 17);
      glow.setAlpha(this.currentLineStyle === item.style ? 1 : 0);
      btnContainer.add(glow);

      const circle = this.add.graphics();
      circle.fillStyle(0xffffff, 0.95);
      circle.fillCircle(0, 0, 15);
      btnContainer.add(circle);

      const icon = this.add.text(0, 0, item.emoji, { fontSize: '18px' }).setOrigin(0.5);
      btnContainer.add(icon);

      const hit = this.add.circle(0, 0, 20);
      hit.setInteractive({ useHandCursor: true });
      btnContainer.add(hit);

      hit.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.setLineStyle(item.style);
      });

      selectorContainer.add(btnContainer);
      this.lineStyleButtons.push({ btn: btnContainer, style: item.style, glow });
    });
  }

  private setLineStyle(style: 'rainbow' | 'nature' | 'heart') {
    this.currentLineStyle = style;
    this.playSfx('click');

    this.lineStyleButtons.forEach(b => {
      if (b.glow) {
        b.glow.setAlpha(b.style === style ? 1 : 0);
      }
      if (b.style === style) {
        this.tweens.add({
          targets: b.btn,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 150,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      }
    });

    const msgs = {
      rainbow: '🌈 Garis Pelangi Dipilih!',
      nature: '🍃 Garis Daun Hutan Dipilih!',
      heart: '💖 Garis Bintang Cinta Dipilih!'
    };
    this.showToast(msgs[style], style === 'rainbow' ? 0xf59e0b : style === 'nature' ? 0x10b981 : 0xf43f5e);
  }

  private spawnTrailSparkle(x: number, y: number) {
    if (Math.random() > 0.35) return;
    let pool = ['✨', '⭐', '🌟'];
    if (this.currentLineStyle === 'nature') pool = ['🍃', '🍀', '✨'];
    if (this.currentLineStyle === 'heart') pool = ['💖', '🌸', '✨'];

    const sym = Phaser.Utils.Array.GetRandom(pool);
    const sparkle = this.add.text(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10), sym, {
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
    if (this.currentHintGraphics) this.currentHintGraphics.clear();

    // Styled Header Level Title Banner
    const bannerW = Math.min(480, width * 0.88);
    const bannerH = 48;
    const bannerY = 70;

    if (!this.titleBannerBg) {
      this.titleBannerBg = this.add.graphics();
    }
    this.titleBannerBg.clear();
    // Glassmorphic Forest Dark Emerald Backdrop with Amber Gold Border
    this.titleBannerBg.fillStyle(0x0f172a, 0.75);
    this.titleBannerBg.lineStyle(3, 0xf59e0b, 1);
    this.titleBannerBg.fillRoundedRect(width / 2 - bannerW / 2, bannerY - bannerH / 2, bannerW, bannerH, 24);
    this.titleBannerBg.strokeRoundedRect(width / 2 - bannerW / 2, bannerY - bannerH / 2, bannerW, bannerH, 24);

    const titleFontSize = Math.min(22, Math.max(15, width * 0.024)) + 'px';
    if (!this.titleTextObj) {
      this.titleTextObj = this.add.text(width / 2, bannerY, roundData.title, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: titleFontSize,
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
      }).setOrigin(0.5);
    } else {
      this.titleTextObj.setText(roundData.title);
      this.titleTextObj.setFontSize(titleFontSize);
    }

    // Voiceover for new round title
    this.playSfx('whoosh');
    this.speak(roundData.title.replace(/Level \d+: /, ''));
    this.resetHintTimer();

    this.leftItems.forEach(item => item.container?.destroy());
    this.rightItems.forEach(item => item.container?.destroy());
    this.leftItems = [];
    this.rightItems = [];

    const leftList = roundData.pairs.map(p => ({ ...p.left, side: 'left' as const }));
    const rightList = Phaser.Utils.Array.Shuffle(roundData.pairs.map(p => ({ ...p.right, side: 'right' as const })));

    // Adaptive Card Sizing & Spacing
    const numPairs = roundData.pairs.length;
    const startY = 135;
    const availableHeight = height - startY - 70;
    const spacingY = Math.min(92, Math.max(68, availableHeight / numPairs));

    const isMobile = width < 640;
    const edgeMargin = isMobile ? Math.max(10, width * 0.025) : width * 0.05;
    const nodeGap = isMobile ? 12 : 14;

    const centerAreaWidth = width - (edgeMargin * 2);
    const cardW = Math.min(240, Math.max(125, centerAreaWidth * (isMobile ? 0.38 : 0.32)));
    const cardH = Math.min(76, Math.max(52, spacingY * 0.84));

    const leftX = edgeMargin + (cardW / 2);
    const rightX = width - edgeMargin - (cardW / 2);

    leftList.forEach((data, i) => {
      const y = startY + i * spacingY + (cardH / 2);
      const nodeX = leftX + (cardW / 2) + nodeGap;
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
      const nodeX = rightX - (cardW / 2) - nodeGap;
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
    shadow.fillStyle(0x0f172a, 0.22);
    shadow.fillRoundedRect(-halfW + 2, -halfH + 4, cardW, cardH, 18);
    container.add(shadow);

    // Active Golden Selection Glow (hidden initially)
    const activeGlow = this.add.graphics();
    activeGlow.lineStyle(6, 0xf59e0b, 0.95);
    activeGlow.strokeRoundedRect(-halfW - 3, -halfH - 3, cardW + 6, cardH + 6, 20);
    activeGlow.setAlpha(0);
    container.add(activeGlow);
    item.activeGlow = activeGlow;

    // 3D Premium Glass Background Box
    const bg = this.add.graphics();
    const primaryColor = isLeft ? 0x059669 : 0xd97706; // Emerald for left, Amber/Gold for right
    const fillColor = 0xffffff;

    bg.fillStyle(fillColor, 0.94);
    bg.lineStyle(3, primaryColor, 1);
    bg.fillRoundedRect(-halfW, -halfH, cardW, cardH, 18);
    bg.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 18);
    container.add(bg);
    item.cardBg = bg;

    // Top Glossy Highlight Line
    const gloss = this.add.graphics();
    gloss.fillStyle(0xffffff, 0.65);
    gloss.fillRoundedRect(-halfW + 4, -halfH + 2, cardW - 8, Math.max(10, cardH * 0.24), { tl: 16, tr: 16, bl: 0, br: 0 });
    container.add(gloss);

    // Circular White Badge Backing for Icons so emojis & images pop vividly
    const isMobile = this.scale.width < 640;
    const iconSize = Math.min(52, Math.max(36, cardH * 0.76));
    const iconPadding = isMobile ? 6 : 10;
    const iconOffsetX = isLeft ? -halfW + (iconSize / 2) + iconPadding : halfW - (iconSize / 2) - iconPadding;

    const iconBadge = this.add.graphics();
    iconBadge.fillStyle(isLeft ? 0xecfdf5 : 0xfffbe6, 1);
    iconBadge.fillCircle(iconOffsetX, 0, (iconSize / 2) + 2);
    iconBadge.lineStyle(2, primaryColor, 0.5);
    iconBadge.strokeCircle(iconOffsetX, 0, (iconSize / 2) + 2);
    container.add(iconBadge);

    // High Definition 3D Pixar Icon Image or Emoji Fallback
    if (item.imageKey.startsWith('emoji:')) {
      const emojiStr = item.imageKey.replace('emoji:', '');
      const emojiTxt = this.add.text(iconOffsetX, 0, emojiStr, {
        fontSize: Math.min(34, iconSize - 6) + 'px'
      }).setOrigin(0.5);
      container.add(emojiTxt);
    } else if (this.textures.exists(item.imageKey)) {
      const iconImg = this.add.image(iconOffsetX, 0, item.imageKey);
      iconImg.setDisplaySize(iconSize - 4, iconSize - 4);
      container.add(iconImg);
    } else {
      const fallbackTxt = this.add.text(iconOffsetX, 0, item.label.charAt(0) || '⭐', {
        fontSize: '28px',
        color: isLeft ? '#047857' : '#b45309',
        fontFamily: 'Fredoka, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(fallbackTxt);
    }

    // Label Text
    const labelFontSize = Math.min(19, Math.max(13, cardW * 0.095)) + 'px';
    const labelOffsetX = isLeft ? 10 : -10;
    const labelText = this.add.text(labelOffsetX, 0, item.label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: labelFontSize,
      color: isLeft ? '#065f46' : '#92400e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(labelText);

    // Connection Node Dot (Glowing 3D Pearl Circle)
    const nodeGap = isMobile ? 12 : 14;
    const nodeX = isLeft ? halfW + nodeGap : -halfW - nodeGap;

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

    // Generous Extra-Large Touch Target Area for Children
    const touchRadius = Math.max(54, cardH * 0.9);
    const hitAreaNode = this.add.circle(nodeX, 0, touchRadius);
    hitAreaNode.setInteractive({ useHandCursor: true });
    container.add(hitAreaNode);

    // Expanded Full Card Touch Area (Includes generous margins around card)
    const cardHitArea = this.add.rectangle(0, 0, cardW + 30, cardH + 20);
    cardHitArea.setInteractive({ useHandCursor: true });
    container.add(cardHitArea);

    const handleSelectOrConnect = () => {
      this.resetHintTimer();
      if (item.connected) return;

      this.playSfx('click');
      this.speak(item.label);

      if (!this.activeStartNode) {
        this.selectActiveStartItem(item);
      } else if (this.activeStartNode === item) {
        this.deselectActiveItem();
      } else {
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
        let auraColor = 0x10b981;
        let coreColor = 0x059669;

        if (this.currentLineStyle === 'nature') {
          auraColor = 0x10b981;
          coreColor = 0x047857;
        } else if (this.currentLineStyle === 'heart') {
          auraColor = 0xf43f5e;
          coreColor = 0xbe185d;
        }

        this.connectedLinesGraphics.lineStyle(14, auraColor, 0.45);
        this.connectedLinesGraphics.beginPath();
        this.connectedLinesGraphics.moveTo(startItem.nodeX || 0, startItem.nodeY || 0);
        this.connectedLinesGraphics.lineTo(targetItem.nodeX || 0, targetItem.nodeY || 0);
        this.connectedLinesGraphics.strokePath();

        this.connectedLinesGraphics.lineStyle(8, coreColor, 1);
        this.connectedLinesGraphics.beginPath();
        this.connectedLinesGraphics.moveTo(startItem.nodeX || 0, startItem.nodeY || 0);
        this.connectedLinesGraphics.lineTo(targetItem.nodeX || 0, targetItem.nodeY || 0);
        this.connectedLinesGraphics.strokePath();

        this.connectedLinesGraphics.fillStyle(auraColor, 1);
        this.connectedLinesGraphics.fillCircle(startItem.nodeX || 0, startItem.nodeY || 0, 14);
        this.connectedLinesGraphics.fillCircle(targetItem.nodeX || 0, targetItem.nodeY || 0, 14);
      }

      // Card Match Bounce & 360 Spin Celebration Animation!
      if (startItem.container && targetItem.container) {
        this.tweens.add({
          targets: [startItem.container, targetItem.container],
          scaleX: 1.2,
          scaleY: 1.2,
          angle: 360,
          duration: 450,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      }

      this.spawnRewardParticles(startItem.nodeX || 0, startItem.nodeY || 0);
      this.spawnRewardParticles(targetItem.nodeX || 0, targetItem.nodeY || 0);

      this.score += 30;
      this.events.emit('update_score', this.score);

      this.playSfx('success');
      const cheers = [
        `✨ ${startItem.label} cocok dengan ${targetItem.label}! Hebat!`,
        '🎉 Pintar sekali, Arkan bangga!',
        '🌟 Tepat sekali!',
        '👏 Kamu anak yang cerdas!'
      ];
      const randomCheer = Phaser.Utils.Array.GetRandom(cheers);
      this.triggerArkanCheer(randomCheer);
      this.speak(`${startItem.label} cocok dengan ${targetItem.label}! Pintar!`);
      this.playItemSoundEffect(startItem.id);

      this.deselectActiveItem();
      this.resetHintTimer();

      if (this.connectedPairsCount >= 4) {
        this.playSfx('win');
        this.time.delayedCall(1000, () => {
          this.currentRoundIndex++;
          if (this.connectedLinesGraphics) this.connectedLinesGraphics.clear();
          if (this.currentHintGraphics) this.currentHintGraphics.clear();

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
      this.playSfx('wrong');
      this.triggerArkanCheer('Coba lagi yuk, gambar ini belum cocok! 💪');
      this.speak('Coba lagi yuk!');

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
      this.resetHintTimer();
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
      alpha: 0,
      y: height - 85,
      duration: 1600,
      ease: 'Power2',
      onComplete: () => toastContainer.destroy()
    });
  }

  spawnRewardParticles(x: number, y: number) {
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const emoji = Phaser.Utils.Array.GetRandom(['⭐', '✨', '🌟', '🎉', '🎈', '🍃']);
      const p = this.add.text(x, y, emoji, { fontSize: '20px' }).setOrigin(0.5);

      const angle = (i * 360) / particleCount;
      const speed = Phaser.Math.Between(50, 120);
      const rad = (angle * Math.PI) / 180;
      const targetX = x + Math.cos(rad) * speed;
      const targetY = y + Math.sin(rad) * speed;

      this.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.2,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  private playItemSoundEffect(id: string) {
    const itemSoundMap: Record<string, string> = {
      anjing: 'Guk guk! 🐶',
      dog: 'Guk guk! 🐶',
      kucing: 'Meong meong! 🐱',
      cat: 'Meong meong! 🐱',
      mobil: 'Brum brum! 🚗',
      car: 'Brum brum! 🚗',
      pesawat: 'Wushhh! ✈️',
      plane: 'Wushhh! ✈️',
      roket: 'Meluncurrr! 🚀',
      rocket: 'Blast off! 🚀',
      monyet: 'Uu aa aa! 🐒',
      kelinci: 'Hap hap hap! 🐰',
      dokter: 'Tet tot! 🩺',
      polisi: 'Niu niu niu! 🚔',
      sun: 'Shine bright! ☀️',
      lingkaran: 'Golll! ⚽',
      segitiga: 'Nyam nyam pizza! 🍕'
    };

    if (itemSoundMap[id]) {
      this.playSfx('star');
      this.time.delayedCall(1100, () => {
        this.speak(itemSoundMap[id]);
      });
    }
  }
}
