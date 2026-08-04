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
              <span>🎙️✨ Kuis Suara & Artikulasi Arkan</span>
            </div>
            <div class="text-caption text-purple-2 font-fredoka">
              Penilaian Pengucapan Suara & Kelancaran Bicara 🔊
            </div>
          </div>
        </div>

        <!-- Right Header Actions: Language Switcher & Close -->
        <div class="row items-center q-gutter-x-xs">
          <!-- Language Toggle Switcher -->
          <div class="lang-switcher-wrapper row items-center q-px-xs q-py-xs shadow-3">
            <button
              class="lang-btn font-fredoka"
              :class="{ active: selectedLang === 'id-ID' }"
              @click="setLanguage('id-ID')"
              title="Bahasa Indonesia"
            >
              🇮🇩 ID
            </button>
            <button
              class="lang-btn font-fredoka"
              :class="{ active: selectedLang === 'en-US' }"
              @click="setLanguage('en-US')"
              title="English (US)"
            >
              🇬🇧 EN
            </button>
          </div>

          <button class="btn-close-fullscreen flex flex-center shadow-4" @click="closeModal" title="Tutup Kuis">✕</button>
        </div>
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
          <span>{{ selectedLang === 'en-US' ? cat.labelEn : cat.label }}</span>
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
          "{{ activeQuestionText }}"
        </div>

        <!-- Interactive Syllables Breakdown Pill Guide -->
        <div v-if="currentQuestion.syllables" class="syllables-container row items-center justify-center gap-xs q-mb-sm">
          <span class="text-caption text-purple-2 font-fredoka q-mr-xs">Suku Kata:</span>
          <span
            v-for="(syl, idx) in currentQuestion.syllables"
            :key="idx"
            class="syllable-pill font-fredoka text-bold animate-pulse"
          >
            {{ syl }}
          </span>
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
          {{ spokenTranscript || (isListening ? (selectedLang === 'en-US' ? '🎙️ Listening to your voice...' : '🎙️ Mendengarkan ucapanmu...') : (selectedLang === 'en-US' ? 'No voice detected yet' : 'Belum ada suara terdeteksi')) }}
        </div>
      </div>

      <!-- Pronunciation Assessment Card (Show when evaluated) -->
      <div v-if="showAssessmentCard" class="pronunciation-card column items-center q-pa-md q-mb-md rounded-borders shadow-12 animate-pop relative-position z-top">
        <div class="row items-center justify-between full-width q-mb-xs">
          <div class="text-subtitle1 font-fredoka text-bold text-amber-3 row items-center gap-xs">
            <span>📊 Penilaian Artikulasi Suara</span>
          </div>
          <div class="star-rating row items-center">
            <span v-for="star in 3" :key="star" class="star-icon" :class="{ filled: star <= pronunciationStars }">
              ⭐
            </span>
          </div>
        </div>

        <!-- Score Meter Bar -->
        <div class="score-bar-wrapper full-width q-my-xs relative-position">
          <div class="score-bar-fill" :style="{ width: pronunciationScore + '%', background: scoreColor }"></div>
          <div class="score-text-overlay font-fredoka text-bold text-white text-caption">
            Kejelasan Kelancaran: {{ pronunciationScore }}%
          </div>
        </div>

        <!-- Articulation Grade & Feedback Badge -->
        <div class="text-subtitle2 font-fredoka text-bold q-mt-xs" :style="{ color: scoreColor }">
          {{ pronunciationBadge }}
        </div>

        <!-- Articulation Tip / Phonetic Guidance -->
        <div v-if="currentQuestion.phoneticTip" class="text-caption text-purple-2 font-fredoka text-center q-mt-xs tip-box q-pa-xs rounded-borders">
          💡 <strong>Tips Artikulasi:</strong> {{ currentQuestion.phoneticTip }}
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
        {{ isListening ? (selectedLang === 'en-US' ? 'Say the target word now!' : 'Ayo sebutkan jawabannya sekarang!') : (selectedLang === 'en-US' ? 'Tap Microphone to Speak' : 'Tekan Tombol Mikrofon di atas untuk Bicara') }}
      </div>

      <!-- Fallback Option Cards for Easy Touch / Mic Alternative -->
      <div class="fallback-cards-section q-mt-xs relative-position z-top">
        <div class="text-caption text-bold text-purple-2 q-mb-xs font-fredoka text-center">
          💡 {{ selectedLang === 'en-US' ? 'Or Tap Choice Cards Below:' : 'Atau Tekan Pilihan Gambar di Bawah:' }}
        </div>
        <div class="row q-gutter-sm justify-center">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.name"
            class="btn-fallback-choice font-fredoka row items-center justify-center q-px-md q-py-sm col shadow-4"
            @click="handleManualOptionClick(opt.name)"
          >
            <span class="text-h5 q-mr-xs">{{ opt.emoji }}</span>
            <span class="text-bold">{{ selectedLang === 'en-US' && opt.nameEn ? opt.nameEn : opt.name }}</span>
          </button>
        </div>
      </div>

      <!-- Round Victory Banner -->
      <div v-if="isAnsweredCorrectly" class="victory-banner column items-center q-mt-md q-pa-md rounded-borders text-center shadow-12 animate-pop relative-position z-top">
        <div class="text-h5 font-fredoka text-bold text-amber-3">🎉 LUAR BIASA! JAWABAN BENAR!</div>
        <div class="row q-gutter-x-md text-bold text-white q-mt-xs font-fredoka text-subtitle1">
          <span>🪙 +30 Koin</span>
          <span>⭐ +{{ 30 * pronunciationStars }} XP</span>
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
  nameEn?: string;
  emoji: string;
}

interface VoiceQuestion {
  category: 'hewan' | 'angka' | 'warna' | 'kata';
  questionText: string;
  enQuestionText?: string;
  validTargets: string[];
  enValidTargets?: string[];
  emoji: string;
  syllables?: string[];
  phoneticTip?: string;
  options: OptionChoice[];
}

const selectedLang = ref<'id-ID' | 'en-US'>('id-ID');

const categories = [
  { id: 'hewan', label: 'Suara Hewan', labelEn: 'Animal Sounds', emoji: '🐶' },
  { id: 'angka', label: 'Hitung Angka', labelEn: 'Count Numbers', emoji: '🔢' },
  { id: 'warna', label: 'Tebak Warna', labelEn: 'Guess Colors', emoji: '🎨' },
  { id: 'kata', label: 'Latihan Kata', labelEn: 'Word Practice', emoji: '🔤' },
];

const currentCategory = ref<'hewan' | 'angka' | 'warna' | 'kata'>('hewan');

const allQuestions: VoiceQuestion[] = [
  // Category: Hewan
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya MEOONG?',
    enQuestionText: 'Which animal says MEOW?',
    validTargets: ['kucing', 'meong', 'cat', 'pus', 'pussy'],
    enValidTargets: ['cat', 'meow', 'kitty'],
    emoji: '🐱',
    syllables: ['KU', 'CING'],
    phoneticTip: 'Buka mulut santai lalu bunyikan suku kata "KU" kemudian "CING" dengan jelas.',
    options: [
      { name: 'Kucing', nameEn: 'Cat', emoji: '🐱' },
      { name: 'Anjing', nameEn: 'Dog', emoji: '🐶' },
      { name: 'Sapi', nameEn: 'Cow', emoji: '🐮' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya GUK GUK?',
    enQuestionText: 'Which animal says WOOF WOOF?',
    validTargets: ['anjing', 'guguk', 'dog', 'guk'],
    enValidTargets: ['dog', 'doggie', 'puppy', 'woof'],
    emoji: '🐶',
    syllables: ['AN', 'JING'],
    phoneticTip: 'Ucapkan huruf "A" awal secara tegas, lalu sambung "NJING".',
    options: [
      { name: 'Kucing', nameEn: 'Cat', emoji: '🐱' },
      { name: 'Anjing', nameEn: 'Dog', emoji: '🐶' },
      { name: 'Jerapah', nameEn: 'Giraffe', emoji: '🦒' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya MOOO?',
    enQuestionText: 'Which animal says MOOO?',
    validTargets: ['sapi', 'lembu', 'cow', 'moo'],
    enValidTargets: ['cow', 'moo'],
    emoji: '🐮',
    syllables: ['SA', 'PI'],
    phoneticTip: 'Mulai dengan senyuman lembut "SA", dilanjutkan perapatan bibir "PI".',
    options: [
      { name: 'Sapi', nameEn: 'Cow', emoji: '🐮' },
      { name: 'Dinosaurus', nameEn: 'Dino', emoji: '🦖' },
      { name: 'Kucing', nameEn: 'Cat', emoji: '🐱' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang lehernya sangat panjang?',
    enQuestionText: 'Which animal has a very long neck?',
    validTargets: ['jerapah', 'giraffe', 'jerapa'],
    enValidTargets: ['giraffe'],
    emoji: '🦒',
    syllables: ['JE', 'RA', 'PAH'],
    phoneticTip: 'Tekankan suku kata tengah "RA" dengan artikulasi lidah di langit-langit mulut.',
    options: [
      { name: 'Anjing', nameEn: 'Dog', emoji: '🐶' },
      { name: 'Jerapah', nameEn: 'Giraffe', emoji: '🦒' },
      { name: 'Sapi', nameEn: 'Cow', emoji: '🐮' }
    ]
  },
  {
    category: 'hewan',
    questionText: 'Hewan apa yang suaranya KWEK KWEK?',
    enQuestionText: 'Which animal says QUACK QUACK?',
    validTargets: ['bebek', 'duck', 'kwek'],
    enValidTargets: ['duck', 'quack'],
    emoji: '🦆',
    syllables: ['BE', 'BEK'],
    phoneticTip: 'Latih artikulasi konsonan "B" rapat bibir lalu "BEK".',
    options: [
      { name: 'Bebek', nameEn: 'Duck', emoji: '🦆' },
      { name: 'Ayam', nameEn: 'Chicken', emoji: '🐔' },
      { name: 'Burung', nameEn: 'Bird', emoji: '🐦' }
    ]
  },

  // Category: Angka
  {
    category: 'angka',
    questionText: 'Ayo sebutkan angka SATU!',
    enQuestionText: 'Say the number ONE!',
    validTargets: ['satu', '1', 'one'],
    enValidTargets: ['one', '1'],
    emoji: '1️⃣',
    syllables: ['SA', 'TU'],
    phoneticTip: 'Bentuk bibir agak membulat saat menyebut suku kata "TU".',
    options: [
      { name: 'Satu', nameEn: 'One', emoji: '1️⃣' },
      { name: 'Dua', nameEn: 'Two', emoji: '2️⃣' },
      { name: 'Tiga', nameEn: 'Three', emoji: '3️⃣' }
    ]
  },
  {
    category: 'angka',
    questionText: 'Berapa jumlah 1 ditambah 1?',
    enQuestionText: 'What is 1 plus 1?',
    validTargets: ['dua', '2', 'two'],
    enValidTargets: ['two', '2'],
    emoji: '2️⃣',
    syllables: ['DU', 'A'],
    phoneticTip: 'Posisikan lidah di balik gigi atas untuk konsonan "D".',
    options: [
      { name: 'Satu', nameEn: 'One', emoji: '1️⃣' },
      { name: 'Dua', nameEn: 'Two', emoji: '2️⃣' },
      { name: 'Tiga', nameEn: 'Three', emoji: '3️⃣' }
    ]
  },
  {
    category: 'angka',
    questionText: 'Ayo sebutkan angka TIGA!',
    enQuestionText: 'Say the number THREE!',
    validTargets: ['tiga', '3', 'three'],
    enValidTargets: ['three', '3'],
    emoji: '3️⃣',
    syllables: ['TI', 'GA'],
    phoneticTip: 'Tekankan suku kata "TI" dengan senyum kecil lalu "GA".',
    options: [
      { name: 'Dua', nameEn: 'Two', emoji: '2️⃣' },
      { name: 'Tiga', nameEn: 'Three', emoji: '3️⃣' },
      { name: 'Empat', nameEn: 'Four', emoji: '4️⃣' }
    ]
  },

  // Category: Warna
  {
    category: 'warna',
    questionText: 'Warna apa buah Pisang yang matang?',
    enQuestionText: 'What color is a ripe Banana?',
    validTargets: ['kuning', 'yellow'],
    enValidTargets: ['yellow'],
    emoji: '🍌',
    syllables: ['KU', 'NING'],
    phoneticTip: 'Ucapkan konsonan "K" di tenggorokan dengan jelas.',
    options: [
      { name: 'Kuning', nameEn: 'Yellow', emoji: '🟨' },
      { name: 'Merah', nameEn: 'Red', emoji: '🟥' },
      { name: 'Hijau', nameEn: 'Green', emoji: '🟩' }
    ]
  },
  {
    category: 'warna',
    questionText: 'Warna apa daun di pohon yang segar?',
    enQuestionText: 'What color is a fresh leaf?',
    validTargets: ['hijau', 'green'],
    enValidTargets: ['green'],
    emoji: '🍃',
    syllables: ['HI', 'JAU'],
    phoneticTip: 'Hembuskan napas lembut saat vokal "HI" dilanjutkan "JAU".',
    options: [
      { name: 'Hijau', nameEn: 'Green', emoji: '🟩' },
      { name: 'Biru', nameEn: 'Blue', emoji: '🟦' },
      { name: 'Kuning', nameEn: 'Yellow', emoji: '🟨' }
    ]
  },
  {
    category: 'warna',
    questionText: 'Warna apa buah Apel manis di pohon?',
    enQuestionText: 'What color is a sweet Apple?',
    validTargets: ['merah', 'red'],
    enValidTargets: ['red'],
    emoji: '🍎',
    syllables: ['ME', 'RAH'],
    phoneticTip: 'Latih artikulasi konsonan "R" yang bergetar lembut.',
    options: [
      { name: 'Merah', nameEn: 'Red', emoji: '🟥' },
      { name: 'Hijau', nameEn: 'Green', emoji: '🟩' },
      { name: 'Biru', nameEn: 'Blue', emoji: '🟦' }
    ]
  },

  // Category: Kata
  {
    category: 'kata',
    questionText: 'Ayo sebutkan kata APEL!',
    enQuestionText: 'Say the word APPLE!',
    validTargets: ['apel', 'apple'],
    enValidTargets: ['apple'],
    emoji: '🍎',
    syllables: ['A', 'PEL'],
    phoneticTip: 'Buka mulut lebar untuk "A" lalu katupkan bibir pada "PEL".',
    options: [
      { name: 'Apel', nameEn: 'Apple', emoji: '🍎' },
      { name: 'Bintang', nameEn: 'Star', emoji: '⭐' },
      { name: 'Mobil', nameEn: 'Car', emoji: '🚗' }
    ]
  },
  {
    category: 'kata',
    questionText: 'Ayo ucapkan kata ARKAN!',
    enQuestionText: 'Say the word ARKAN!',
    validTargets: ['arkan', 'arkanza'],
    enValidTargets: ['arkan'],
    emoji: '👦',
    syllables: ['AR', 'KAN'],
    phoneticTip: 'Getarkan huruf "R" dan ucapkan "KAN" secara tegas.',
    options: [
      { name: 'Arkan', nameEn: 'Arkan', emoji: '👦' },
      { name: 'Pintar', nameEn: 'Smart', emoji: '🌟' },
      { name: 'Hebat', nameEn: 'Great', emoji: '👏' }
    ]
  },
  {
    category: 'kata',
    questionText: 'Ayo sebutkan kata BINTANG!',
    enQuestionText: 'Say the word STAR!',
    validTargets: ['bintang', 'star'],
    enValidTargets: ['star'],
    emoji: '⭐',
    syllables: ['BIN', 'TANG'],
    phoneticTip: 'Ucapkan "BIN" lalu perjelas akhiran "TANG".',
    options: [
      { name: 'Bintang', nameEn: 'Star', emoji: '⭐' },
      { name: 'Bulan', nameEn: 'Moon', emoji: '🌙' },
      { name: 'Matahari', nameEn: 'Sun', emoji: '☀️' }
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

// Pronunciation Assessment States
const showAssessmentCard = ref(false);
const pronunciationScore = ref(0);
const pronunciationStars = ref(0);
const pronunciationBadge = ref('');
const scoreColor = ref('#22c55e');

const currentQuestion = computed(() => {
  const list = activeQuestions.value;
  return list[currentRoundIndex.value] || list[0] || allQuestions[0];
});

const activeQuestionText = computed(() => {
  return selectedLang.value === 'en-US' && currentQuestion.value.enQuestionText
    ? currentQuestion.value.enQuestionText
    : currentQuestion.value.questionText;
});

let currentAudioElement: HTMLAudioElement | null = null;
let recognition: any = null;

function setLanguage(lang: 'id-ID' | 'en-US') {
  selectedLang.value = lang;
  store.playSfx('click');
  if (recognition) {
    recognition.lang = lang;
  }
  spokenTranscript.value = '';
  showAssessmentCard.value = false;
  speakCurrentQuestion();
}

function playNaturalVoice(audioKey: string, fallbackText: string) {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }

  const audioUrl = `/audio/voices/${audioKey}.mp3`;
  const audio = new Audio(audioUrl);
  currentAudioElement = audio;

  audio.play().catch(() => {
    // Fallback to browser SpeechSynthesis
    store.speak(fallbackText, selectedLang.value === 'en-US' ? 0.9 : 1.0);
  });
}

function selectCategory(catId: any) {
  store.playSfx('click');
  currentCategory.value = catId;
  currentRoundIndex.value = 0;
  isAnsweredCorrectly.value = false;
  spokenTranscript.value = '';
  showAssessmentCard.value = false;
  comboStreak.value = 0;
  speakCurrentQuestion();
}

function initSpeechRecognition() {
  if (typeof window !== 'undefined') {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      recognition = new SpeechRecognitionClass();
      recognition.lang = selectedLang.value;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = event.results[0][0].confidence || 0.85;
        spokenTranscript.value = `"${text}"`;
        if (event.results[0].isFinal) {
          isListening.value = false;
          evaluateAnswer(text, confidence);
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
  showAssessmentCard.value = false;
  isListening.value = true;

  if (recognition) {
    try {
      recognition.lang = selectedLang.value;
      recognition.start();
    } catch (e) {
      console.warn('Recognition error or already started:', e);
    }
  } else {
    spokenTranscript.value = selectedLang.value === 'en-US'
      ? 'Microphone not supported in this browser. Use picture buttons below!'
      : 'Mikrofon tidak didukung di browser ini. Gunakan pilihan gambar di bawah!';
    isListening.value = false;
  }
}

function speakCurrentQuestion() {
  const audioKey = `q_${currentCategory.value}_${currentRoundIndex.value}`;
  playNaturalVoice(audioKey, activeQuestionText.value);
}

// Levenshtein Similarity calculation for pronunciation scoring
function calculateStringSimilarity(s1: string, s2: string): number {
  let longer = s1.toLowerCase();
  let shorter = s2.toLowerCase();
  if (s1.length < s2.length) {
    longer = s2.toLowerCase();
    shorter = s1.toLowerCase();
  }
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const costs = new Array();
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longerLength - costs[shorter.length]) / longerLength;
}

function evaluateAnswer(userSpokenText: string, confidenceScore: number = 0.9) {
  const targets = selectedLang.value === 'en-US' && currentQuestion.value.enValidTargets
    ? currentQuestion.value.enValidTargets
    : currentQuestion.value.validTargets;

  let highestSim = 0;

  for (const t of targets) {
    if (userSpokenText.includes(t.toLowerCase())) {
      highestSim = 1.0;
      break;
    } else {
      const sim = calculateStringSimilarity(userSpokenText, t);
      if (sim > highestSim) {
        highestSim = sim;
      }
    }
  }

  // Combine similarity & confidence to get overall Pronunciation Score (0-100%)
  const rawScore = (highestSim * 0.7) + (confidenceScore * 0.3);
  const finalScorePercent = Math.min(Math.round(rawScore * 100), 100);

  pronunciationScore.value = finalScorePercent;
  showAssessmentCard.value = true;

  if (finalScorePercent >= 80) {
    pronunciationStars.value = 3;
    pronunciationBadge.value = selectedLang.value === 'en-US' ? '🌟 Excellent & Clear Fluency!' : '🌟 Sangat Fasih & Jelas!';
    scoreColor.value = '#22c55e';
    comboStreak.value++;
    handleCorrectAnswer();
  } else if (finalScorePercent >= 60) {
    pronunciationStars.value = 2;
    pronunciationBadge.value = selectedLang.value === 'en-US' ? '⭐ Good Pronunciation!' : '⭐ Bagus & Cukup Jelas!';
    scoreColor.value = '#f59e0b';
    comboStreak.value++;
    handleCorrectAnswer();
  } else {
    pronunciationStars.value = 1;
    pronunciationBadge.value = selectedLang.value === 'en-US' ? '💡 Needs Clearer Articulation' : '💡 Coba Ucapkan Lebih Tegas';
    scoreColor.value = '#ef4444';
    comboStreak.value = 0;
    store.playSfx('wrong');
    playNaturalVoice(
      'wrong_1',
      selectedLang.value === 'en-US' ? 'Almost there! Try saying it once more!' : 'Hampir benar! Coba ucapkan sekali lagi ya!'
    );
  }
}

function handleManualOptionClick(optionName: string) {
  spokenTranscript.value = `"${optionName}"`;
  evaluateAnswer(optionName.toLowerCase(), 0.95);
}

function handleCorrectAnswer() {
  isAnsweredCorrectly.value = true;
  store.playSfx('win');

  const praises = ['praise_1', 'praise_2', 'praise_3'];
  const randomPraiseKey = praises[Math.floor(Math.random() * praises.length)];
  const fallbackPraise = selectedLang.value === 'en-US' ? 'Wonderful! Great pronunciation!' : 'Pintar sekali! Artikulasi suaramu luar biasa!';

  playNaturalVoice(randomPraiseKey, fallbackPraise);

  store.child.coins += 30;
  store.child.xp += 30 * pronunciationStars.value;

  setTimeout(() => {
    if (currentRoundIndex.value + 1 < activeQuestions.value.length) {
      currentRoundIndex.value++;
      isAnsweredCorrectly.value = false;
      spokenTranscript.value = '';
      showAssessmentCard.value = false;
      speakCurrentQuestion();
    } else {
      playNaturalVoice(
        'complete',
        selectedLang.value === 'en-US'
          ? 'Hooray! You completed all voice quiz questions in this category!'
          : 'Hore! Kamu berhasil menyelesaikan semua kuis di kategori ini!'
      );
    }
  }, 2600);
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
    showAssessmentCard.value = false;
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
  width: 660px;
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

/* Language Toggle Switcher */
.lang-switcher-wrapper {
  background: rgba(0, 0, 0, 0.3);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.lang-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
}

.btn-close-fullscreen {
  width: 38px;
  height: 38px;
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

/* Syllable Pills */
.syllable-pill {
  background: rgba(245, 158, 11, 0.25);
  border: 1.5px solid #fde047;
  color: #fef08a;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  letter-spacing: 1px;
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

/* Pronunciation Assessment Card */
.pronunciation-card {
  background: rgba(15, 23, 42, 0.65);
  border: 2px solid #6366f1;
  border-radius: 20px;
}

.star-rating .star-icon {
  font-size: 18px;
  opacity: 0.25;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.star-rating .star-icon.filled {
  opacity: 1;
  filter: grayscale(0%);
  transform: scale(1.15);
}

.score-bar-wrapper {
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
}

.score-text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.tip-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.2);
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
