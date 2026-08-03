import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';
import { soundService } from '../../application/services/soundService';

interface PianoKey {
  noteName: string;
  solfeggio: string;
  freq: number;
  colorHex: number;
  keyContainer?: Phaser.GameObjects.Container;
  highlightGfx?: Phaser.GameObjects.Graphics;
}

interface SongNote {
  noteIndex: number; // 0..7 index in pianoKeys
  lyric: string;
}

interface SongRound {
  title: string;
  prompt: string;
  notesSequence: SongNote[];
}

type InstrumentType = 'piano' | 'marimba' | 'synth' | 'drum';

export class MusicStudioScene extends BaseGameScene {
  private currentRoundIndex: number = 0;
  private currentSequenceStep: number = 0;
  private currentInstrument: InstrumentType = 'piano';

  private pianoKeys: PianoKey[] = [
    { noteName: 'C4', solfeggio: 'Do', freq: 261.63, colorHex: 0xef4444 },
    { noteName: 'D4', solfeggio: 'Re', freq: 293.66, colorHex: 0xf97316 },
    { noteName: 'E4', solfeggio: 'Mi', freq: 329.63, colorHex: 0xeab308 },
    { noteName: 'F4', solfeggio: 'Fa', freq: 349.23, colorHex: 0x22c55e },
    { noteName: 'G4', solfeggio: 'Sol', freq: 392.00, colorHex: 0x06b6d4 },
    { noteName: 'A4', solfeggio: 'La', freq: 440.00, colorHex: 0x3b82f6 },
    { noteName: 'B4', solfeggio: 'Si', freq: 493.88, colorHex: 0xa855f7 },
    { noteName: 'C5', solfeggio: "Do'", freq: 523.25, colorHex: 0xec4899 },
  ];

  private rounds: SongRound[] = [
    {
      title: '🌟 Bintang Kecil',
      prompt: '🎵 Ikuti tombol bercahaya untuk lagu Bintang Kecil!',
      notesSequence: [
        { noteIndex: 0, lyric: 'Bin-' },
        { noteIndex: 0, lyric: 'tang' },
        { noteIndex: 4, lyric: 'Ke-' },
        { noteIndex: 4, lyric: 'cil' },
        { noteIndex: 5, lyric: 'di' },
        { noteIndex: 5, lyric: 'langit' },
        { noteIndex: 4, lyric: 'tinggi!' }
      ]
    },
    {
      title: '🌈 Pelangi-Pelangi',
      prompt: '🎵 Tekan tombol berbinar untuk lagu Pelangi-Pelangi!',
      notesSequence: [
        { noteIndex: 2, lyric: 'Pe-' },
        { noteIndex: 3, lyric: 'lan-' },
        { noteIndex: 4, lyric: 'gi' },
        { noteIndex: 4, lyric: 'Pe-' },
        { noteIndex: 3, lyric: 'lan-' },
        { noteIndex: 2, lyric: 'gi' },
        { noteIndex: 1, lyric: 'indah!' }
      ]
    },
    {
      title: '🎈 Balonku Ada Lima',
      prompt: '🎵 Mainkan nada indah lagu Balonku Ada Lima!',
      notesSequence: [
        { noteIndex: 0, lyric: 'Ba-' },
        { noteIndex: 2, lyric: 'lon-' },
        { noteIndex: 4, lyric: 'ku' },
        { noteIndex: 7, lyric: 'a-' },
        { noteIndex: 4, lyric: 'da' },
        { noteIndex: 3, lyric: 'li-' },
        { noteIndex: 2, lyric: 'ma!' }
      ]
    },
    {
      title: '🐥 Potong Bebek Angsa',
      prompt: '🎵 Mari menari & bernyanyi Potong Bebek Angsa!',
      notesSequence: [
        { noteIndex: 4, lyric: 'Po-' },
        { noteIndex: 4, lyric: 'tong' },
        { noteIndex: 3, lyric: 'be-' },
        { noteIndex: 2, lyric: 'bek' },
        { noteIndex: 0, lyric: 'ang-' },
        { noteIndex: 2, lyric: 'sa!' }
      ]
    },
    {
      title: '🚂 Naik Kereta Api',
      prompt: '🎵 Tut tut tut... Mari mainkan Naik Kereta Api!',
      notesSequence: [
        { noteIndex: 0, lyric: 'Naik' },
        { noteIndex: 2, lyric: 'ke-' },
        { noteIndex: 4, lyric: 're-' },
        { noteIndex: 4, lyric: 'ta' },
        { noteIndex: 5, lyric: 'a-' },
        { noteIndex: 4, lyric: 'pi!' }
      ]
    },
    {
      title: '🏔️ Naik Ke Puncak Gunung',
      prompt: '🎵 Kiri kanan kulihat saja... Mainkan lagu Gunung!',
      notesSequence: [
        { noteIndex: 2, lyric: 'Naik' },
        { noteIndex: 4, lyric: 'naik' },
        { noteIndex: 6, lyric: 'ke' },
        { noteIndex: 7, lyric: 'pun-' },
        { noteIndex: 6, lyric: 'cak' },
        { noteIndex: 4, lyric: 'gu-' },
        { noteIndex: 2, lyric: 'nung!' }
      ]
    }
  ];

  private promptTextObj?: Phaser.GameObjects.Text;
  private currentLyricTextObj?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private catMascotContainer?: Phaser.GameObjects.Container;
  private dinoMascotContainer?: Phaser.GameObjects.Container;
  private spotlightGfxList: Phaser.GameObjects.Graphics[] = [];
  private instrumentButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('MusicStudioScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🎵 Studio Pianika & Musik Arkan!';
    this.currentRoundIndex = 0;
    this.currentSequenceStep = 0;
    this.currentInstrument = 'piano';
  }

  create() {
    const { width, height } = this.scale;

    // Disco Stage Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x311b92, 0x311b92, 1);
    bg.fillRect(0, 0, width, height);

    // Stage Floor
    const floor = this.add.graphics();
    floor.fillStyle(0x431407, 1);
    floor.fillRect(0, height - 230, width, 230);

    // Wooden Stage Planks
    for (let x = 0; x < width; x += 120) {
      floor.lineStyle(2, 0x78350f, 0.6);
      floor.strokeRect(x, height - 230, 120, 230);
    }

    this.createStageLights();
    this.createUI();
    this.createBandMembers();
    this.createInstrumentSelector();
    this.createRainbowPiano();

    this.startRound(this.currentRoundIndex);
  }

  private createStageLights() {
    // Glowing Disco Spotlights Overhead
    const spotColors = [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7];
    spotColors.forEach((color, i) => {
      const spot = this.add.graphics();
      spot.fillStyle(color, 0.15);
      const posX = 120 + i * 160;
      spot.fillTriangle(posX, 0, posX - 90, 420, posX + 90, 420);
      this.spotlightGfxList.push(spot);

      // Swaying lights tween
      this.tweens.add({
        targets: spot,
        alpha: 0.28,
        duration: 1200 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createBandMembers() {
    const { height, width } = this.scale;
    const centerX = width / 2;

    // 1. Arkan Lead Pianist (Center)
    this.arkanMascotContainer = this.add.container(centerX, height - 250);
    const arkanTxt = this.add.text(0, 0, '👦 🎹', { fontSize: '60px' }).setOrigin(0.5);
    const arkanLabel = this.add.text(0, 42, 'Arkan (Pianis)', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#fef08a',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add([arkanTxt, arkanLabel]);

    // 2. Kucing Maracas (Left)
    this.catMascotContainer = this.add.container(centerX - 240, height - 240);
    const catTxt = this.add.text(0, 0, '🐱 🪇', { fontSize: '52px' }).setOrigin(0.5);
    const catLabel = this.add.text(0, 38, 'Kucing Mimi', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#f472b6',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.catMascotContainer.add([catTxt, catLabel]);

    // 3. Dino Drummer (Right)
    this.dinoMascotContainer = this.add.container(centerX + 240, height - 240);
    const dinoTxt = this.add.text(0, 0, '🦖 🥁', { fontSize: '52px' }).setOrigin(0.5);
    const dinoLabel = this.add.text(0, 38, 'Dino Drummer', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.dinoMascotContainer.add([dinoTxt, dinoLabel]);

    // Continuous rhythm sway animation
    this.tweens.add({
      targets: [this.arkanMascotContainer, this.catMascotContainer, this.dinoMascotContainer],
      y: '-=10',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createInstrumentSelector() {
    const { width } = this.scale;
    const instruments: { type: InstrumentType; label: string; icon: string; colorHex: number }[] = [
      { type: 'piano', label: 'Pianika', icon: '🎹', colorHex: 0x38bdf8 },
      { type: 'marimba', label: 'Marimba', icon: '🪵', colorHex: 0xf59e0b },
      { type: 'synth', label: 'Synth', icon: '⚡', colorHex: 0xa855f7 },
      { type: 'drum', label: 'Perkusi', icon: '🥁', colorHex: 0xef4444 },
    ];

    const btnWidth = 105;
    const btnHeight = 38;
    const startX = width / 2 - (instruments.length * btnWidth) / 2 + btnWidth / 2;
    const posY = 158;

    instruments.forEach((inst, idx) => {
      const posX = startX + idx * (btnWidth + 10);
      const container = this.add.container(posX, posY);

      const bg = this.add.graphics();
      bg.fillStyle(inst.colorHex, 0.9);
      bg.lineStyle(2, 0xffffff, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 14);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 14);
      container.add(bg);

      const label = this.add.text(0, 0, `${inst.icon} ${inst.label}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(label);

      const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerdown', () => {
        this.currentInstrument = inst.type;
        this.playSfx('click');

        // Highlight selected instrument button
        this.instrumentButtons.forEach(btn => btn.setScale(1.0));
        container.setScale(1.12);

        this.showToast(`Alat Musik: ${inst.icon} ${inst.label}`, inst.colorHex);
      });

      this.instrumentButtons.push(container);
    });

    if (this.instrumentButtons[0]) {
      this.instrumentButtons[0].setScale(1.12);
    }
  }

  private createRainbowPiano() {
    const { width, height } = this.scale;
    const pianoY = height - 90;
    const isMobile = width < 640;
    const keyWidth = isMobile ? Math.min(80, (width * 0.95) / 8 - 4) : 88;
    const keyHeight = isMobile ? 135 : 150;
    const startX = width / 2 - (this.pianoKeys.length * keyWidth) / 2 + keyWidth / 2;

    this.pianoKeys.forEach((keyData, idx) => {
      const posX = startX + idx * (keyWidth + 4);
      const container = this.add.container(posX, pianoY);

      // Key Shadow
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRoundedRect(-keyWidth / 2, -keyHeight / 2 + 10, keyWidth, keyHeight, 18);
      container.add(shadow);

      // Golden Aura Highlight Gfx (Shown when this key is the active target)
      const highlightGfx = this.add.graphics();
      highlightGfx.lineStyle(6, 0xfde047, 1);
      highlightGfx.strokeRoundedRect(-keyWidth / 2 - 4, -keyHeight / 2 - 4, keyWidth + 8, keyHeight + 8, 22);
      highlightGfx.setAlpha(0);
      container.add(highlightGfx);
      keyData.highlightGfx = highlightGfx;

      // Piano Key Main Body
      const keyBg = this.add.graphics();
      keyBg.fillStyle(keyData.colorHex, 1);
      keyBg.lineStyle(3, 0xffffff, 1);
      keyBg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 18);
      keyBg.strokeRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 18);
      container.add(keyBg);

      // Solfeggio Name (Do, Re, Mi)
      const nameText = this.add.text(0, -25, keyData.solfeggio, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isMobile ? '22px' : '26px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
      }).setOrigin(0.5);
      container.add(nameText);

      // Note Frequency Code (C4, D4...)
      const codeText = this.add.text(0, 30, keyData.noteName, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isMobile ? '13px' : '15px',
        color: 'rgba(255,255,255,0.85)',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(codeText);

      // Touch Area
      const hitArea = this.add.rectangle(0, 0, keyWidth, keyHeight);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerdown', () => {
        this.handleKeyPress(idx, keyData, container);
      });

      keyData.keyContainer = container;
    });
  }

  private handleKeyPress(keyIndex: number, keyData: PianoKey, container: Phaser.GameObjects.Container) {
    // 1. Synthesize Instrument Note Audio (NO TTS call here to avoid audio muffling!)
    soundService.playNote(keyData.freq, 0.65, this.currentInstrument);

    // 2. Key Press Animation
    this.tweens.add({
      targets: container,
      y: container.y + 12,
      scaleY: 0.94,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // 3. Band Members Dance Jump Animation
    if (this.arkanMascotContainer) {
      this.tweens.add({
        targets: this.arkanMascotContainer,
        y: '-=18',
        duration: 120,
        yoyo: true,
        ease: 'Cubic.easeOut'
      });
    }

    // 4. Spawn Musical Note Particles
    this.spawnMusicNoteParticle(container.x, container.y - 80);

    // 5. Evaluate Sequence Step
    const roundData = this.rounds[this.currentRoundIndex];
    if (!roundData) return;

    const currentTargetNote = roundData.notesSequence[this.currentSequenceStep];
    if (keyIndex === currentTargetNote.noteIndex) {
      // ✅ Correct Note in Song Sequence: Display Lyric Visually (without TTS overlap!)
      if (this.currentLyricTextObj) {
        this.currentLyricTextObj.setText(`🎵 "${currentTargetNote.lyric}"`);
      }

      this.score += 15;
      this.events.emit('update_score', this.score);

      this.currentSequenceStep++;
      this.updateTargetNoteHighlight();

      // Check if song finished!
      if (this.currentSequenceStep >= roundData.notesSequence.length) {
        this.time.delayedCall(600, () => {
          this.advanceRound();
        });
      }
    } else {
      // Free play note sounded
    }
  }

  private spawnMusicNoteParticle(x: number, y: number) {
    const emojis = ['🎵', '🎶', '🎼', '⭐', '✨', '🎸', '🎹'];
    const randomEmoji = Phaser.Utils.Array.GetRandom(emojis);

    const particle = this.add.text(x, y, randomEmoji, { fontSize: '28px' }).setOrigin(0.5);
    this.tweens.add({
      targets: particle,
      y: y - 100 - Math.random() * 40,
      x: x + (Math.random() * 80 - 40),
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => particle.destroy()
    });
  }

  private startRound(roundIdx: number) {
    if (roundIdx >= this.rounds.length) {
      this.finishGame();
      return;
    }

    const { width } = this.scale;
    const roundData = this.rounds[roundIdx];
    this.currentSequenceStep = 0;

    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 75, roundData.prompt, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '20px',
        color: '#fef08a',
        fontStyle: 'bold',
        stroke: '#431407',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(roundData.prompt);
    }

    if (!this.currentLyricTextObj) {
      this.currentLyricTextObj = this.add.text(width / 2, 115, `Lagu: ${roundData.title}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#67e8f9',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      this.currentLyricTextObj.setText(`Lagu: ${roundData.title}`);
    }

    // Speak song title ONCE at round start (so piano play notes are clean and crystal clear)
    this.speak(`Lagu ${roundData.title.replace(/^[^\s]+\s/, '')}`);
    this.updateTargetNoteHighlight();
  }

  private updateTargetNoteHighlight() {
    const roundData = this.rounds[this.currentRoundIndex];

    // Clear all highlights
    this.pianoKeys.forEach(k => k.highlightGfx?.setAlpha(0));

    if (roundData && this.currentSequenceStep < roundData.notesSequence.length) {
      const targetNoteIdx = roundData.notesSequence[this.currentSequenceStep].noteIndex;
      const targetKey = this.pianoKeys[targetNoteIdx];
      if (targetKey && targetKey.highlightGfx) {
        targetKey.highlightGfx.setAlpha(1);

        // Pulsing highlight tween
        this.tweens.add({
          targets: targetKey.highlightGfx,
          alpha: 0.3,
          duration: 400,
          yoyo: true,
          repeat: -1
        });
      }
    }
  }

  private advanceRound() {
    this.playSfx('win');
    this.speak('Hebat sekali! Lagu selesai dengan sempurna!');
    this.spawnRewardParticles(this.scale.width / 2, this.scale.height / 2);

    this.time.delayedCall(1500, () => {
      this.currentRoundIndex++;
      this.startRound(this.currentRoundIndex);
    });
  }

  private showToast(message: string, colorHex: number) {
    const { width, height } = this.scale;

    const toastContainer = this.add.container(width / 2, height - 200);
    const toastW = Math.min(300, width * 0.8);

    const bg = this.add.graphics();
    bg.fillStyle(colorHex, 0.95);
    bg.fillRoundedRect(-toastW / 2, -20, toastW, 40, 16);
    toastContainer.add(bg);

    const txt = this.add.text(0, 0, message, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    toastContainer.add(txt);

    this.tweens.add({
      targets: toastContainer,
      alpha: 0,
      y: height - 230,
      duration: 1400,
      ease: 'Power2',
      onComplete: () => toastContainer.destroy()
    });
  }
}
