<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="voice-quiz-card font-quicksand q-pa-lg text-white column no-wrap shadow-24 relative-position overflow-hidden">
      <!-- Glow background decorations -->
      <div class="glow-orb-1"></div>
      <div class="glow-orb-2"></div>

      <!-- Top Bar Header -->
      <div class="row items-center justify-between q-mb-md header-bar relative-position z-top">
        <div class="row items-center q-gutter-x-sm">
          <div class="avatar-circle-sm relative-position shadow-4">
            <img src="/arkan_character.png" class="avatar-img" alt="Arkan" />
          </div>
          <div>
            <div class="text-h5 font-fredoka text-bold text-amber-3 row items-center gap-xs">
              <span>🎙️✨ Kuis Suara & Bicara Arkan</span>
            </div>
            <div class="text-caption text-purple-2 font-fredoka">
              Suara Narator Manusia Alami (Natural Human Voice) 🔊
            </div>
          </div>
        </div>
        <button class="btn-close-fullscreen flex flex-center shadow-4" @click="closeModal" title="Tutup Kuis">✕</button>
      </div>

      <!-- Category Selector Tabs -->
      <div class="row q-gutter-x-xs justify-center q-mb-md relative-position z-top">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab-btn font-fredoka shadow-3"
          :class="{ active: currentCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <span class="q-mr-xs">{{ cat.emoji }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Question Speech Box with Arkan Companion Avatar -->
      <div class="question-display-box column items-center text-center q-pa-md shadow-12 relative-position q-mb-md z-top">
        <div class="row items-center justify-between full-width q-px-sm q-mb-xs">
          <div class="round-badge font-fredoka shadow-4 row items-center q-gutter-x-xs">
            <span>🎯</span>
            <span>Soal #{{ currentRoundIndex + 1 }} dari {{ activeQuestions.length }}</span>
          </div>

          <div v-if="comboStreak > 1" class="combo-badge font-fredoka shadow-4 animate-bounce">
            🔥 Combo x{{ comboStreak }}!
          </div>
        </div>

        <!-- Question Text & Audio Button -->
        <div class="text-h4 font-fredoka text-bold text-amber-3 q-my-sm question-text-glow">
          "{{ currentQuestion.questionText }}"
        </div>

        <button class="btn-repeat-audio font-fredoka row items-center q-px-md q-py-xs shadow-6 q-mt-xs" @click="speakCurrentQuestion">
          <span class="sound-wave-icon q-mr-xs">🔊</span>
          <span>Dengarkan Suara Alami Arkan</span>
        </button>

        <!-- Revealed Answer Emblem (When answered correctly) -->
        <div v-if="isAnsweredCorrectly" class="revealed-animal-box animate-bounce q-mt-md flex flex-center shadow-8">
          <span class="animal-emoji-giant">{{ currentQuestion.emoji }}</span>
        </div>
      </div>

      <!-- Real-time Spoken Transcript Box with Wave Equalizer -->
      <div class="transcript-box column items-center justify-center q-py-sm q-px-lg rounded-borders text-center q-mb-md relative-position z-top">
        <div class="row items-center gap-xs q-mb-xs">
          <span class="text-caption text-bold text-purple-2 font-fredoka">🗣️ Terdeteksi Suara Kamu:</span>
          <!-- Audio Wave Equalizer when listening -->
          <div v-if="isListening" class="equalizer-bars row items-end gap-xs">
            <div class="bar bar-1"></div>
            <div class="bar bar-2"></div>
            <div class="bar bar-3"></div>
            <div class="bar bar-4"></div>
            <div class="bar bar-5"></div>
          </div>
        </div>

        <div class="text-h6 font-fredoka text-bold text-amber-3 spoken-text">
          {{ spokenTranscript || (isListening ? '🎙️ Mendengarkan ucapanmu...' : 'Belum ada suara terdeteksi') }}
        </div>
      </div>

      <!-- Pulsing Interactive Microphone Button -->
      <div class="mic-button-wrapper flex flex-center relative-position q-my-sm z-top">
        <!-- Ripple Rings Animation when Listening -->
        <div v-if="isListening" class="pulse-ring ring-1"></div>
        <div v-if="isListening" class="pulse-ring ring-2"></div>
        <div v-if="isListening" class="pulse-ring ring-3"></div>

        <button
          class="btn-mic-pulse flex flex-center shadow-16 cursor-pointer relative-position"
          :class="{ listening: isListening, success: isAnsweredCorrectly }"
          :disabled="isListening || isAnsweredCorrectly"
          @click="startListening"
        >
          <span v-if="!isListening && !isAnsweredCorrectly" class="text-h3">🎙️</span>
          <span v-else-if="isListening" class="text-h3 animate-pulse">🔴</span>
          <span v-else class="text-h3 animate-bounce">✅</span>
        </button>
      </div>

      <div class="text-center text-caption text-bold text-amber-3 font-fredoka q-mb-sm z-top">
        {{ isListening ? 'Ayo sebutkan jawabannya sekarang!' : 'Tekan Tombol Mikrofon di atas untuk Bicara' }}
      </div>

      <!-- Fallback Option Cards for Easy Touch / Mic Alternative -->
      <div class="fallback-cards-section q-mt-xs relative-position z-top">
        <div class="text-caption text-bold text-purple-2 q-mb-xs font-fredoka text-center">
          💡 Atau Tekan Pilihan Gambar di Bawah:
        </div>
        <div class="row q-gutter-sm justify-center">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.name"
            class="btn-fallback-choice font-fredoka row items-center justify-center q-px-md q-py-sm col shadow-4"
            @click="handleManualOptionClick(opt.name)"
          >
            <span class="text-h5 q-mr-xs">{{ opt.emoji }}</span>
            <span class="text-bold">{{ opt.name }}</span>
          </button>
        </div>
      </div>

      <!-- Round Victory Banner -->
      <div v-if="isAnsweredCorrectly" class="victory-banner column items-center q-mt-md q-pa-md rounded-borders text-center shadow-12 animate-pop relative-position z-top">
        <div class="text-h5 font-fredoka text-bold text-amber-3">🎉 LUAR BIASA! JAWABAN BENAR!</div>
        <div class="row q-gutter-x-md text-bold text-white q-mt-xs font-fredoka text-subtitle1">
          <span>🪙 +30 Koin</span>
          <span>⭐ +50 XP</span>
          <span v-if="comboStreak > 1" class="text-amber-3">🔥 Bonus Combo!</span>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

interface OptionChoice {
  name: string;
  emoji: string;
}

interface VoiceQuestion {
  category: 'hewan' | 'angka' | 'warna' | 'kata';
  questionText: string;
  validTargets: string[];
  emoji: string;
  options: OptionChoice[];
}

const categories = [
  { id: 'hewan', label: 'Suara Hewan', emoji: '🐶' },
  { id: 'angka', label: 'Hitung Angka', emoji: '🔢' },
  { id: 'warna', label: 'Tebak Warna', emoji: '🎨' },
  { id: 'kata', label: 'Latihan Kata', emoji: '🔤' },
];

const currentCategory = ref<'hewan' | 'angka' | 'warna' | 'kata'>('hewan');

const allQuestions: VoiceQuestion[] = [
  // Category: Hewan
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya MEOONG?',
    validTargets: ['kucing', 'meong', 'cat', 'pus', 'pussy', 'mimi'],
    emoji: '🐱',
    options: [
      { name: 'Kucing', emoji: '🐱' },
      { name: 'Anjing', emoji: '🐶' },
      { name: 'Sapi', emoji: '🐮' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya GUK GUK?',
    validTargets: ['anjing', 'guguk', 'dog', 'guk'],
    emoji: '🐶',
    options: [
      { name: 'Kucing', emoji: '🐱' },
      { name: 'Anjing', emoji: '🐶' },
      { name: 'Jerapah', emoji: '🦒' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya MOOO?',
    validTargets: ['sapi', 'lembu', 'cow', 'moo'],
    emoji: '🐮',
    options: [
      { name: 'Sapi', emoji: '🐮' },
      { name: 'Dinosaurus', emoji: '🦖' },
      { name: 'Kucing', emoji: '🐱' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang lehernya sangat panjang?',
    validTargets: ['jerapah', 'giraffe', 'jerapa'],
    emoji: '🦒',
    options: [
      { name: 'Anjing', emoji: '🐶' },
      { name: 'Jerapah', emoji: '🦒' },
      { name: 'Sapi', emoji: '🐮' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya KWEK KWEK?',
    validTargets: ['bebek', 'duck', 'kwek'],
    emoji: '🦆',
    options: [
      { name: 'Bebek', emoji: '🦆' },
      { name: 'Ayam', emoji: '🐔' },
      { name: 'Burung', emoji: '🐦' }
    ]
  },

  // Category: Angka
  {
    category: 'angka',
    questionText: 'Ayo sebutkan angka SATU!',
    validTargets: ['satu', '1', 'one'],
    emoji: '1️⃣',
    options: [
      { name: 'Satu', emoji: '1️⃣' },
      { name: 'Dua', emoji: '2️⃣' },
      { name: 'Tiga', emoji: '3️⃣' }
    ]
  },
  {
    category: 'angka',
    questionText: 'Berapa jumlah 1 ditambah 1?',
    validTargets: ['dua', '2', 'two'],
    emoji: '2️⃣',
    options: [
      { name: 'Satu', emoji: '1️⃣' },
      { name: 'Dua', emoji: '2️⃣' },
      { name: 'Tiga', emoji: '3️⃣' }
    ]
  },
  {
    category: 'angka',
    questionText: 'Ayo sebutkan angka TIGA!',
    validTargets: ['tiga', '3', 'three'],
    emoji: '3️⃣',
    options: [
      { name: 'Dua', emoji: '2️⃣' },
      { name: 'Tiga', emoji: '3️⃣' },
      { name: 'Empat', emoji: '4️⃣' }
    ]
  },

  // Category: Warna
  {
    category: 'warna',
    questionText: 'Warna apa buah Pisang yang matang?',
    validTargets: ['kuning', 'yellow'],
    emoji: '🍌',
    options: [
      { name: 'Kuning', emoji: '🟨' },
      { name: 'Merah', emoji: '🟥' },
      { name: 'Hijau', emoji: '🟩' }
    ]
  },
  {
    category: 'warna',
    questionText: 'Warna apa daun di pohon yang segar?',
    validTargets: ['hijau', 'green'],
    emoji: '🍃',
    options: [
      { name: 'Hijau', emoji: '🟩' },
      { name: 'Biru', emoji: '🟦' },
      { name: 'Kuning', emoji: '🟨' }
    ]
  },
  {
    category: 'warna',
    questionText: 'Warna apa buah Apel manis di pohon?',
    validTargets: ['merah', 'red'],
    emoji: '🍎',
    options: [
      { name: 'Merah', emoji: '🟥' },
      { name: 'Hijau', emoji: '🟩' },
      { name: 'Biru', emoji: '🟦' }
    ]
  },

  // Category: Kata
  {
    category: 'kata',
    questionText: 'Ayo sebutkan kata APEL!',
    validTargets: ['apel', 'apple'],
    emoji: '🍎',
    options: [
      { name: 'Apel', emoji: '🍎' },
      { name: 'Bintang', emoji: '⭐' },
      { name: 'Mobil', emoji: '🚗' }
    ]
  },
  {
    category: 'kata',
    questionText: 'Ayo ucapkan kata ARKAN!',
    validTargets: ['arkan', 'arkanza'],
    emoji: '👦',
    options: [
      { name: 'Arkan', emoji: '👦' },
      { name: 'Pintar', emoji: '🌟' },
      { name: 'Hebat', emoji: '👏' }
    ]
  },
  {
    category: 'kata',
    questionText: 'Ayo sebutkan kata BINTANG!',
    validTargets: ['bintang', 'star'],
    emoji: '⭐',
    options: [
      { name: 'Bintang', emoji: '⭐' },
      { name: 'Bulan', emoji: '🌙' },
      { name: 'Matahari', emoji: '☀️' }
    ]
  }
];

const activeQuestions = computed(() => {
  return allQuestions.filter(q => q.category === currentCategory.value);
});

const currentRoundIndex = ref(0);
const isListening = ref(false);
const spokenTranscript = ref('');
const isAnsweredCorrectly = ref(false);
const comboStreak = ref(0);

const currentQuestion = computed(() => {
  const list = activeQuestions.value;
  return list[currentRoundIndex.value] || list[0] || allQuestions[0];
});

let currentAudioElement: HTMLAudioElement | null = null;
let recognition: any = null;

function playNaturalVoice(audioKey: string, fallbackText: string) {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }

  const audioUrl = `/audio/voices/${audioKey}.mp3`;
  const audio = new Audio(audioUrl);
  currentAudioElement = audio;

  audio.play().catch(() => {
    // Fallback to browser SpeechSynthesis if MP3 audio file is not loaded
    store.speak(fallbackText);
  });
}

function selectCategory(catId: any) {
  store.playSfx('click');
  currentCategory.value = catId;
  currentRoundIndex.value = 0;
  isAnsweredCorrectly.value = false;
  spokenTranscript.value = '';
  comboStreak.value = 0;
  speakCurrentQuestion();
}

function initSpeechRecognition() {
  if (typeof window !== 'undefined') {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      recognition = new SpeechRecognitionClass();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase().trim();
        spokenTranscript.value = `"${text}"`;
        if (event.results[0].isFinal) {
          isListening.value = false;
          evaluateAnswer(text);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech Recognition error:', err);
        isListening.value = false;
      };

      recognition.onend = () => {
        isListening.value = false;
      };
    }
  }
}

function startListening() {
  store.playSfx('click');
  spokenTranscript.value = '';
  isListening.value = true;

  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition error or already started:', e);
    }
  } else {
    spokenTranscript.value = 'Mikrofon tidak didukung di browser ini. Gunakan pilihan gambar di bawah!';
    isListening.value = false;
  }
}

function speakCurrentQuestion() {
  const audioKey = `q_${currentCategory.value}_${currentRoundIndex.value}`;
  playNaturalVoice(audioKey, currentQuestion.value.questionText);
}

function evaluateAnswer(userSpokenText: string) {
  const targets = currentQuestion.value.validTargets;
  const isMatch = targets.some(t => userSpokenText.includes(t));

  if (isMatch) {
    comboStreak.value++;
    handleCorrectAnswer();
  } else {
    comboStreak.value = 0;
    store.playSfx('wrong');
    playNaturalVoice('wrong_1', 'Hampir benar! Coba ucapkan sekali lagi ya!');
  }
}

function handleManualOptionClick(optionName: string) {
  spokenTranscript.value = `"${optionName}"`;
  evaluateAnswer(optionName.toLowerCase());
}

function handleCorrectAnswer() {
  isAnsweredCorrectly.value = true;
  store.playSfx('win');

  const praises = ['praise_1', 'praise_2', 'praise_3'];
  const randomPraiseKey = praises[Math.floor(Math.random() * praises.length)];
  const fallbackPraise = 'Pintar sekali! Jawabanmu benar!';

  playNaturalVoice(randomPraiseKey, fallbackPraise);

  store.child.coins += 30;
  store.child.xp += 50;

  setTimeout(() => {
    if (currentRoundIndex.value + 1 < activeQuestions.value.length) {
      currentRoundIndex.value++;
      isAnsweredCorrectly.value = false;
      spokenTranscript.value = '';
      speakCurrentQuestion();
    } else {
      playNaturalVoice('complete', 'Hore! Kamu berhasil menyelesaikan semua kuis di kategori ini!');
    }
  }, 2200);
}

function closeModal() {
  store.playSfx('click');
  if (currentAudioElement) {
    currentAudioElement.pause();
  }
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
  }
  isOpen.value = false;
}

watch(isOpen, (newVal) => {
  if (newVal) {
    currentRoundIndex.value = 0;
    isAnsweredCorrectly.value = false;
    spokenTranscript.value = '';
    comboStreak.value = 0;
    speakCurrentQuestion();
  } else if (currentAudioElement) {
    currentAudioElement.pause();
  }
});

onMounted(() => {
  initSpeechRecognition();
});
</script>

<style scoped>
.voice-quiz-card {
  width: 640px;
  max-width: 95vw;
  background: linear-gradient(145deg, #1e1b4b 0%, #311b92 60%, #4c1d95 100%);
  border-radius: 32px !important;
  border: 3.5px solid #818cf8;
}

/* Background Glow Orbs */
.glow-orb-1 {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.glow-orb-2 {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.avatar-circle-sm {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #f59e0b;
  overflow: hidden;
  background: #fef08a;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-close-fullscreen {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-close-fullscreen:hover {
  transform: scale(1.1);
  background: rgba(239, 68, 68, 0.8);
}

/* Category Selector Tabs */
.category-tab-btn {
  padding: 6px 14px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.25);
}

.category-tab-btn.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde047;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

/* Question Display Box */
.question-display-box {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
}

.question-text-glow {
  text-shadow: 0 0 12px rgba(253, 224, 71, 0.5);
}

.round-badge {
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  border: 1px solid #d8b4fe;
  color: white;
  padding: 4px 14px;
  border-radius: 14px;
  font-size: 13px;
}

.combo-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1.5px solid #fca5a5;
  color: white;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: bold;
}

.btn-repeat-audio {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid #93c5fd;
  border-radius: 18px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-repeat-audio:hover {
  transform: scale(1.05);
}

.revealed-animal-box {
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
}

.animal-emoji-giant {
  font-size: 58px;
}

/* Equalizer Bars Animation */
.equalizer-bars {
  height: 18px;
}

.bar {
  width: 4px;
  background: #f59e0b;
  border-radius: 4px;
  animation: equalizer 0.8s infinite alternate ease-in-out;
}

.bar-1 { height: 8px; animation-delay: 0.1s; }
.bar-2 { height: 16px; animation-delay: 0.3s; }
.bar-3 { height: 12px; animation-delay: 0.5s; }
.bar-4 { height: 18px; animation-delay: 0.2s; }
.bar-5 { height: 10px; animation-delay: 0.4s; }

@keyframes equalizer {
  0% { transform: scaleY(0.4); }
  100% { transform: scaleY(1.4); }
}

.transcript-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1.5px dashed #818cf8;
  border-radius: 20px;
  min-height: 60px;
}

.spoken-text {
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}

/* Microphone Ripple Rings */
.mic-button-wrapper {
  height: 100px;
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #f59e0b;
  animation: ripple 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.ring-1 { width: 90px; height: 90px; animation-delay: 0s; }
.ring-2 { width: 90px; height: 90px; animation-delay: 0.6s; }
.ring-3 { width: 90px; height: 90px; animation-delay: 1.2s; }

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}

.btn-mic-pulse {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 4px solid #fca5a5;
  transition: transform 0.2s ease;
  z-index: 2;
}

.btn-mic-pulse:hover:not(:disabled) {
  transform: scale(1.08);
}

.btn-mic-pulse.listening {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde68a;
}

.btn-mic-pulse.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-color: #bbf7d0;
}

.btn-fallback-choice {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-fallback-choice:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #fde047;
  transform: translateY(-2px);
}

.victory-banner {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border: 2px solid #bbf7d0;
  border-radius: 20px;
}
</style>
