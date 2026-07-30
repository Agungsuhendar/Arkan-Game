import { BaseGameScene, BaseSceneConfig } from './BaseGameScene';

interface SpellingWord {
  word: string;
  emoji: string;
  name: string;
  distractorLetters: string[];
}

interface LetterSlot {
  letter: string;
  filled: boolean;
  boxGfx?: Phaser.GameObjects.Graphics;
  textObj?: Phaser.GameObjects.Text;
}

export class SpellingGardenScene extends BaseGameScene {
  private currentWordIndex: number = 0;
  private currentSlotIndex: number = 0;

  private words: SpellingWord[] = [
    { word: 'BOLA', emoji: '⚽', name: 'Bola Sepak', distractorLetters: ['K', 'U', 'S', 'M'] },
    { word: 'KUDA', emoji: '🐴', name: 'Kuda Gagah', distractorLetters: ['B', 'L', 'P', 'R'] },
    { word: 'BUKU', emoji: '📖', name: 'Buku Cerita', distractorLetters: ['D', 'A', 'T', 'I'] },
    { word: 'IKAN', emoji: '🐟', name: 'Ikan Berenang', distractorLetters: ['B', 'O', 'S', 'U'] },
    { word: 'ROTI', emoji: '🍞', name: 'Roti Lezat', distractorLetters: ['K', 'A', 'P', 'D'] }
  ];

  private letterSlots: LetterSlot[] = [];
  private activeBubbleContainers: Phaser.GameObjects.Container[] = [];
  private promptTextObj?: Phaser.GameObjects.Text;
  private objectCardContainer?: Phaser.GameObjects.Container;
  private objectEmojiText?: Phaser.GameObjects.Text;
  private objectNameText?: Phaser.GameObjects.Text;
  private arkanMascotContainer?: Phaser.GameObjects.Container;
  private arkanSpeechBubble?: Phaser.GameObjects.Container;
  private arkanSpeechText?: Phaser.GameObjects.Text;
  private spawnEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super('SpellingGardenScene');
  }

  init(data: BaseSceneConfig) {
    super.init(data);
    this.promptText = '🔤 Taman Ejaan Kata Arkan!';
    this.currentWordIndex = 0;
    this.currentSlotIndex = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Outdoor Garden Sky Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x86efac, 0x86efac, 1);
    bg.fillRect(0, 0, width, height);

    // Green Grass Ground
    const lawn = this.add.graphics();
    lawn.fillStyle(0x15803d, 1);
    lawn.fillRect(0, height - 190, width, 190);

    // Garden Flowers & Mushrooms Decor
    ['🌻', '🌷', '🌸', '🌼', '🌺'].forEach((flw, i) => {
      this.add.text(50 + i * 190, height - 150 + (i % 2) * 20, flw, { fontSize: '42px' });
    });

    this.createClouds();
    this.createUI();
    this.createArkanMascot();

    this.startWordRound(this.currentWordIndex);
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

  private createArkanMascot() {
    const { height } = this.scale;

    this.arkanMascotContainer = this.add.container(120, height - 110);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.2);
    shadow.fillRoundedRect(-75, -25, 150, 50, 20);
    this.arkanMascotContainer.add(shadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(3, 0x16a34a, 1);
    cardBg.fillRoundedRect(-75, -28, 150, 56, 20);
    cardBg.strokeRoundedRect(-75, -28, 150, 56, 20);
    this.arkanMascotContainer.add(cardBg);

    const mascotText = this.add.text(0, 0, '👦 🔤 Arkan', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#15803d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.arkanMascotContainer.add(mascotText);

    // Speech Bubble
    this.arkanSpeechBubble = this.add.container(120, height - 170);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfef08a, 1);
    bubbleBg.lineStyle(3, 0xca8a04, 1);
    bubbleBg.fillRoundedRect(-120, -22, 240, 44, 16);
    bubbleBg.strokeRoundedRect(-120, -22, 240, 44, 16);
    this.arkanSpeechBubble.add(bubbleBg);

    this.arkanSpeechText = this.add.text(0, 0, '✨ Susun hurufnya yuk!', {
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
        y: this.scale.height - 118,
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
        hold: 1400,
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

  private startWordRound(wordIdx: number) {
    if (wordIdx >= this.words.length) {
      this.finishGame();
      return;
    }

    const { width } = this.scale;
    const wordData = this.words[wordIdx];
    this.currentSlotIndex = 0;

    // Clear previous bubbles & slots
    if (this.spawnEvent) this.spawnEvent.destroy();
    this.activeBubbleContainers.forEach(b => b.destroy());
    this.activeBubbleContainers = [];

    // Header Prompt Text
    const promptMsg = `🔤 Eja kata: ${wordData.name} (${wordData.word.length} Huruf)!`;
    if (!this.promptTextObj) {
      this.promptTextObj = this.add.text(width / 2, 90, promptMsg, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#15803d',
        strokeThickness: 5,
        align: 'center'
      }).setOrigin(0.5);
    } else {
      this.promptTextObj.setText(promptMsg);
    }

    this.speak(`Eja kata ${wordData.name}`);

    // Object Image Card (Top Center: y = 180)
    if (this.objectCardContainer) this.objectCardContainer.destroy();
    this.objectCardContainer = this.add.container(width / 2, 175);

    const cardShadow = this.add.graphics();
    cardShadow.fillStyle(0x0f172a, 0.2);
    cardShadow.fillRoundedRect(-80, -55, 160, 110, 20);
    this.objectCardContainer.add(cardShadow);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.96);
    cardBg.lineStyle(4, 0xf59e0b, 1);
    cardBg.fillRoundedRect(-80, -60, 160, 110, 20);
    cardBg.strokeRoundedRect(-80, -60, 160, 110, 20);
    this.objectCardContainer.add(cardBg);

    this.objectEmojiText = this.add.text(0, -15, wordData.emoji, { fontSize: '48px' }).setOrigin(0.5);
    this.objectNameText = this.add.text(0, 28, wordData.name, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.objectCardContainer.add([this.objectEmojiText, this.objectNameText]);

    // Create Target Slot Boxes (Center: y = 295)
    this.letterSlots = [];
    const letters = wordData.word.split('');
    const slotW = 60;
    const slotGap = 16;
    const totalW = letters.length * slotW + (letters.length - 1) * slotGap;
    const startX = width / 2 - totalW / 2 + slotW / 2;
    const slotY = 295;

    letters.forEach((char, idx) => {
      const posX = startX + idx * (slotW + slotGap);

      const boxGfx = this.add.graphics();
      boxGfx.fillStyle(0xffffff, 0.9);
      boxGfx.lineStyle(3, idx === 0 ? 0xf59e0b : 0x94a3b8, 1);
      boxGfx.fillRoundedRect(posX - slotW / 2, slotY - 30, slotW, 60, 16);
      boxGfx.strokeRoundedRect(posX - slotW / 2, slotY - 30, slotW, 60, 16);

      const textObj = this.add.text(posX, slotY, '?', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '28px',
        color: '#94a3b8',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.letterSlots.push({
        letter: char,
        filled: false,
        boxGfx,
        textObj
      });
    });

    // Start spawning floating letter bubbles
    this.spawnEvent = this.time.addEvent({
      delay: 1300,
      callback: this.spawnLetterBubble,
      callbackScope: this,
      loop: true
    });
  }

  private spawnLetterBubble() {
    if (!this.scene.isActive()) return;
    const { width, height } = this.scale;
    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    const currentTargetChar = currentWord.word[this.currentSlotIndex];
    if (!currentTargetChar) return;

    // 50% chance to spawn target letter, 50% distractor
    const isTarget = Math.random() > 0.45;
    const letterChar = isTarget
      ? currentTargetChar
      : Phaser.Utils.Array.GetRandom(currentWord.distractorLetters);

    const bubbleColors = [0xef4444, 0xec4899, 0xa855f7, 0x3b82f6, 0x06b6d4, 0x22c55e, 0xf59e0b];
    const colorHex = Phaser.Utils.Array.GetRandom(bubbleColors);

    const posX = Phaser.Math.Between(100, width - 100);
    const container = this.add.container(posX, height + 60);

    // Soap Bubble Graphics
    const bubbleGfx = this.add.graphics();
    bubbleGfx.fillStyle(colorHex, 0.85);
    bubbleGfx.lineStyle(3, 0xffffff, 0.9);
    bubbleGfx.fillCircle(0, 0, 42);
    bubbleGfx.strokeCircle(0, 0, 42);

    // Inner Specular Glare
    bubbleGfx.fillStyle(0xffffff, 0.6);
    bubbleGfx.fillCircle(-14, -14, 10);

    const letterTxt = this.add.text(0, 2, letterChar, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.4)', blur: 4, fill: true }
    }).setOrigin(0.5);

    container.add([bubbleGfx, letterTxt]);
    container.setSize(84, 84);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.handleBubbleClick(letterChar, container);
    });

    // Float Upward Tween
    this.tweens.add({
      targets: container,
      y: -80,
      x: posX + Phaser.Math.Between(-40, 40),
      duration: Phaser.Math.Between(5000, 7000),
      onComplete: () => {
        container.destroy();
      }
    });

    this.activeBubbleContainers.push(container);
  }

  private handleBubbleClick(letterChar: string, container: Phaser.GameObjects.Container) {
    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    // Pop SFX & Phonics Speech
    this.playSfx('pop');
    this.speak(`Huruf ${letterChar}`);

    const targetChar = currentWord.word[this.currentSlotIndex];
    const targetSlot = this.letterSlots[this.currentSlotIndex];

    if (letterChar === targetChar && targetSlot && !targetSlot.filled) {
      // ✅ CORRECT LETTER!
      targetSlot.filled = true;

      // Animate letter flying into slot box
      const targetX = targetSlot.textObj?.x || 450;
      const targetY = targetSlot.textObj?.y || 295;

      this.tweens.add({
        targets: container,
        x: targetX,
        y: targetY,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 350,
        ease: 'Back.easeIn',
        onComplete: () => {
          container.destroy();
          this.playSfx('coin');
          this.spawnRewardParticles(targetX, targetY);

          if (targetSlot.textObj) {
            targetSlot.textObj.setText(targetChar);
            targetSlot.textObj.setColor('#16a34a');
          }
          if (targetSlot.boxGfx) {
            targetSlot.boxGfx.clear();
            targetSlot.boxGfx.fillStyle(0xdcfce7, 1);
            targetSlot.boxGfx.lineStyle(4, 0x22c55e, 1);
            targetSlot.boxGfx.fillRoundedRect(targetX - 30, targetY - 30, 60, 60, 16);
            targetSlot.boxGfx.strokeRoundedRect(targetX - 30, targetY - 30, 60, 60, 16);
          }
        }
      });

      this.score += 15;
      this.events.emit('update_score', this.score);
      this.currentSlotIndex++;

      // Highlight next slot if available
      if (this.currentSlotIndex < this.letterSlots.length) {
        const nextSlot = this.letterSlots[this.currentSlotIndex];
        if (nextSlot && nextSlot.boxGfx && nextSlot.textObj) {
          const nextX = nextSlot.textObj.x;
          const nextY = nextSlot.textObj.y;
          nextSlot.boxGfx.clear();
          nextSlot.boxGfx.fillStyle(0xffffff, 1);
          nextSlot.boxGfx.lineStyle(4, 0xf59e0b, 1);
          nextSlot.boxGfx.fillRoundedRect(nextX - 30, nextY - 30, 60, 60, 16);
          nextSlot.boxGfx.strokeRoundedRect(nextX - 30, nextY - 30, 60, 60, 16);
        }
      }

      // Check if full word completed!
      if (this.currentSlotIndex >= currentWord.word.length) {
        this.time.delayedCall(800, () => {
          this.playSfx('win');
          this.speak(`${currentWord.word}! ${currentWord.name}!`);
          this.triggerArkanCheer(`🎉 Pintar! Kata ${currentWord.word} berhasil dieja!`);

          this.time.delayedCall(1600, () => {
            this.currentWordIndex++;
            this.startWordRound(this.currentWordIndex);
          });
        });
      }
    } else {
      // ❌ WRONG LETTER
      this.playSfx('wrong');
      this.tweens.add({
        targets: container,
        x: container.x + 12,
        duration: 60,
        yoyo: true,
        repeat: 3
      });
    }
  }
}
