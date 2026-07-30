<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="voice-quiz-card font-quicksand q-pa-lg text-white column no-wrap shadow-24">
      <!-- Top Bar Header -->
      <div class="row items-center justify-between q-mb-md header-bar">
        <div class="row items-center q-gutter-x-sm">
          <span class="text-h4">🎙️✨</span>
          <div>
            <div class="text-h5 font-fredoka text-bold text-amber-3">Kuis Suara & Bicara Arkan</div>
            <div class="text-caption text-purple-2 font-fredoka">Bicaralah pada mikrofon & jawab pertanyaan hewan!</div>
          </div>
        </div>
        <button class="btn-close-fullscreen flex flex-center shadow-4" @click="closeModal" title="Tutup Kuis">✕</button>
      </div>

      <!-- Question Cartoon Speech Bubble Card -->
      <div class="question-display-box column items-center text-center q-pa-lg shadow-12 relative-position q-mb-md">
        <div class="round-badge font-fredoka shadow-4 q-mb-xs row items-center q-gutter-x-xs">
          <span>🎯</span>
          <span>Pertanyaan #{{ currentRoundIndex + 1 }} dari {{ quizRounds.length }}</span>
        </div>

        <!-- Animated Question Text -->
        <div class="text-h4 font-fredoka text-bold text-amber-3 q-my-sm question-text-glow">
          "{{ currentQuestion.questionText }}"
        </div>

        <button class="btn-repeat-audio font-fredoka row items-center q-px-md q-py-xs shadow-6 q-mt-xs" @click="speakCurrentQuestion">
          <span class="sound-wave-icon q-mr-xs">🔊</span>
          <span>Dengarkan Suara Arkan</span>
        </button>

        <!-- Revealed Animal Icon (Shown when answered correctly) -->
        <div v-if="isAnsweredCorrectly" class="revealed-animal-box animate-bounce q-mt-md flex flex-center shadow-8">
          <span class="animal-emoji-giant">{{ currentQuestion.emoji }}</span>
        </div>
      </div>

      <!-- Real-time Spoken Transcript Box -->
      <div class="transcript-box column items-center justify-center q-py-sm q-px-lg rounded-borders text-center q-mb-md">
        <span class="text-caption text-bold text-purple-2 font-fredoka">🗣️ Terdeteksi Suara Kamu:</span>
        <div class="text-h6 font-fredoka text-bold text-amber-3 q-mt-xs spoken-text">
          {{ spokenTranscript || (isListening ? '🎙️ Mendengarkan ucapanmu...' : 'Belum ada suara terdeteksi') }}
        </div>
      </div>

      <!-- Pulsing Interactive Microphone Button & Wave Visualizer -->
      <div class="mic-button-wrapper flex flex-center relative-position q-my-md">
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

      <div class="text-center text-caption text-bold text-amber-3 font-fredoka q-mb-md">
        {{ isListening ? 'Ayo sebutkan jawabannya sekarang!' : 'Tekan Tombol Mikrofon di atas untuk Bicara' }}
      </div>

      <!-- Fallback Option Cards (If device mic is unavailable or for younger kids) -->
      <div class="fallback-cards-section q-mt-xs">
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
      <div v-if="isAnsweredCorrectly" class="victory-banner column items-center q-mt-md q-pa-md rounded-borders text-center shadow-12 animate-pop">
        <div class="text-h5 font-fredoka text-bold text-amber-3">🎉 PINTAR! JAWABAN BENAR!</div>
        <div class="row q-gutter-x-md text-bold text-white q-mt-xs font-fredoka text-subtitle1">
          <span>🪙 +30 Koin</span>
          <span>⭐ +50 XP</span>
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
  questionText: string;
  validTargets: string[];
  emoji: string;
  options: OptionChoice[];
}

const quizRounds: VoiceQuestion[] = [
  {
    questionText: 'Hewan apa yang suaranya MEOONG?',
    validTargets: ['kucing', 'kucing mimi', 'cat', 'meong', 'pussy'],
    emoji: '🐱',
    options: [
      { name: 'Kucing', emoji: '🐱' },
      { name: 'Anjing', emoji: '🐶' },
      { name: 'Sapi', emoji: '🐮' }
    ]
  },
  {
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
    questionText: 'Hewan apa yang suaranya RAWR?',
    validTargets: ['dinosaurus', 'dino', 'singa', 'harimau', 'rawr'],
    emoji: '🦖',
    options: [
      { name: 'Dinosaurus', emoji: '🦖' },
      { name: 'Kucing', emoji: '🐱' },
      { name: 'Jerapah', emoji: '🦒' }
    ]
  }
];

const currentRoundIndex = ref(0);
const isListening = ref(false);
const spokenTranscript = ref('');
const isAnsweredCorrectly = ref(false);

const currentQuestion = computed(() => quizRounds[currentRoundIndex.value] || quizRounds[0]);

let recognition: any = null;

function initSpeechRecognition() {
  if (typeof window !== 'undefined') {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      recognition = new SpeechRecognitionClass();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase().trim();
        spokenTranscript.value = `"${text}"`;
        isListening.value = false;
        evaluateAnswer(text);
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
      console.warn('Recognition already started or error:', e);
    }
  } else {
    // Fallback if browser doesn't support Web Speech Recognition
    spokenTranscript.value = 'Mikrofon tidak didukung di browser ini. Gunakan pilihan gambar di bawah!';
    isListening.value = false;
  }
}

function speakCurrentQuestion() {
  store.speak(currentQuestion.value.questionText);
}

function evaluateAnswer(userSpokenText: string) {
  const targets = currentQuestion.value.validTargets;
  const isMatch = targets.some(t => userSpokenText.includes(t));

  if (isMatch) {
    handleCorrectAnswer();
  } else {
    store.playSfx('wrong');
    store.speak('Hampir benar! Coba tebak sekali lagi ya!');
  }
}

function handleManualOptionClick(optionName: string) {
  spokenTranscript.value = `"${optionName}"`;
  evaluateAnswer(optionName.toLowerCase());
}

function handleCorrectAnswer() {
  isAnsweredCorrectly.value = true;
  store.playSfx('win');
  store.speak(`Pintar sekali! Jawaban ${currentQuestion.value.options.find(o => o.name.toLowerCase() === currentQuestion.value.validTargets[0])?.name || optionNameCorrect()} benar!`);

  store.child.coins += 30;
  store.child.xp += 50;

  setTimeout(() => {
    if (currentRoundIndex.value + 1 < quizRounds.length) {
      currentRoundIndex.value++;
      isAnsweredCorrectly.value = false;
      spokenTranscript.value = '';
      speakCurrentQuestion();
    } else {
      store.speak('Luar biasa! Arkan berhasil menjawab semua kuis suara!');
    }
  }, 2200);
}

function optionNameCorrect(): string {
  return currentQuestion.value.options[0].name;
}

function closeModal() {
  store.playSfx('click');
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
    speakCurrentQuestion();
  }
});

onMounted(() => {
  initSpeechRecognition();
});
</script>

<style scoped>
.voice-quiz-card {
  width: 580px;
  max-width: 95vw;
  background: linear-gradient(135deg, #1e1b4b 0%, #311b92 60%, #4c1d95 100%);
  border-radius: 28px !important;
  border: 3px solid #818cf8;
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

.question-display-box {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
}

.question-text-glow {
  text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
}

.round-badge {
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  border: 1px solid #d8b4fe;
  color: white;
  padding: 4px 14px;
  border-radius: 14px;
  font-size: 13px;
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
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
}

.animal-emoji-giant {
  font-size: 64px;
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
  height: 110px;
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
  width: 96px;
  height: 96px;
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
