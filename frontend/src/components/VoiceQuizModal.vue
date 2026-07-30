<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="voice-quiz-card font-quicksand q-pa-lg text-white column no-wrap">
      <!-- Top Bar Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-x-sm">
          <span class="text-h4">🎙️✨</span>
          <div class="text-h5 font-fredoka text-bold text-amber-3">Kuis Suara & Bicara Arkan</div>
        </div>
        <button class="btn-close-fullscreen flex flex-center shadow-4" @click="closeModal" title="Tutup Kuis">✕</button>
      </div>

      <div class="text-subtitle2 text-purple-2 q-mb-md font-fredoka">
        Dengarkan pertanyaan Arkan, lalu tekan tombol mikrofon dan sebutkan jawabannya dengan suara yang jelas!
      </div>

      <!-- Question Card Display -->
      <div class="question-display-box column items-center text-center q-pa-lg shadow-10 relative-position q-mb-md">
        <div class="round-badge font-fredoka shadow-3 q-mb-sm">
          Pertanyaan #{{ currentRoundIndex + 1 }} / {{ quizRounds.length }}
        </div>

        <div class="text-h4 font-fredoka text-bold text-amber-3 q-my-sm">
          "{{ currentQuestion.questionText }}"
        </div>

        <button class="btn-repeat-audio font-fredoka row items-center q-px-md q-py-xs shadow-4" @click="speakCurrentQuestion">
          🔊 Dengarkan Suara Arkan
        </button>

        <!-- Revealed Animal Icon (Shown when answered correctly) -->
        <div v-if="isAnsweredCorrectly" class="revealed-animal-box animate-bounce q-mt-md flex flex-center">
          <span class="animal-emoji-giant">{{ currentQuestion.emoji }}</span>
        </div>
      </div>

      <!-- Real-time Spoken Transcript Box -->
      <div class="transcript-box column items-center justify-center q-py-md q-px-lg rounded-borders text-center q-mb-md">
        <span class="text-caption text-bold text-purple-2 font-fredoka">🗣️ Terdeteksi Suara Kamu:</span>
        <div class="text-h6 font-fredoka text-bold text-amber-4 q-mt-xs">
          {{ spokenTranscript || (isListening ? 'Mendengarkan ucapanmu...' : 'Belum ada suara terdeteksi') }}
        </div>
      </div>

      <!-- Pulsing Interactive Microphone Button -->
      <div class="mic-button-wrapper flex flex-center q-my-sm">
        <button
          class="btn-mic-pulse flex flex-center shadow-12 cursor-pointer"
          :class="{ listening: isListening, success: isAnsweredCorrectly }"
          :disabled="isListening || isAnsweredCorrectly"
          @click="startListening"
        >
          <span v-if="!isListening && !isAnsweredCorrectly" class="text-h3">🎙️</span>
          <span v-else-if="isListening" class="text-h3 animate-pulse">🔴</span>
          <span v-else class="text-h3">✅</span>
        </button>
      </div>

      <div class="text-center text-caption text-bold text-amber-3 font-fredoka q-mb-md">
        {{ isListening ? 'Ayo sebutkan jawabannya sekarang!' : 'Tekan Tombol Mikrofon di atas untuk Bicara' }}
      </div>

      <!-- Fallback Option Cards (If device mic is unavailable or for younger kids) -->
      <div class="fallback-cards-section q-mt-sm">
        <div class="text-caption text-bold text-purple-2 q-mb-xs font-fredoka text-center">💡 Atau Tekan Pilihan Gambar di Bawah:</div>
        <div class="row q-gutter-sm justify-center">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.name"
            class="btn-fallback-choice font-fredoka row items-center q-px-md q-py-sm col"
            @click="handleManualOptionClick(opt.name)"
          >
            <span class="text-h5 q-mr-xs">{{ opt.emoji }}</span>
            <span class="text-bold">{{ opt.name }}</span>
          </button>
        </div>
      </div>

      <!-- Round Victory Banner -->
      <div v-if="isAnsweredCorrectly" class="victory-banner column items-center q-mt-md q-pa-md rounded-borders text-center shadow-8">
        <div class="text-h5 font-fredoka text-bold text-amber-3">🎉 PINTAR! JAWABAN BENAR!</div>
        <div class="row q-gutter-x-md text-bold text-white q-mt-xs font-fredoka">
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
  store.speak(`Pintar sekali! Jawaban ${currentQuestion.value.options[0].name} benar!`);

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
  width: 540px;
  max-width: 95vw;
  background: linear-gradient(135deg, #1e1b4b 0%, #311b92 100%);
  border-radius: 24px !important;
  border: 3px solid #818cf8;
}

.question-display-box {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.round-badge {
  background: #a855f7;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
}

.btn-repeat-audio {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid #93c5fd;
  border-radius: 16px;
  cursor: pointer;
}

.revealed-animal-box {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
}

.animal-emoji-giant {
  font-size: 64px;
}

.transcript-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed #818cf8;
  border-radius: 16px;
  min-height: 60px;
}

.btn-mic-pulse {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 4px solid #fca5a5;
  transition: transform 0.2s ease;
}

.btn-mic-pulse:hover:not(:disabled) {
  transform: scale(1.08);
}

.btn-mic-pulse.listening {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde68a;
  animation: pulse 1s infinite alternate;
}

.btn-mic-pulse.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-color: #bbf7d0;
}

.btn-fallback-choice {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-fallback-choice:hover {
  background: rgba(255, 255, 255, 0.25);
}

.victory-banner {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border: 2px solid #bbf7d0;
}
</style>
