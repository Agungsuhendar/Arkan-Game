<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="smart-talking-card font-quicksand q-pa-lg text-white column no-wrap shadow-24 relative-position overflow-hidden">
      <!-- Background Ambient Light Glow -->
      <div class="glow-orb-1"></div>
      <div class="glow-orb-2"></div>

      <!-- Top Header Bar -->
      <div class="row items-center justify-between q-mb-md relative-position z-top">
        <div class="row items-center q-gutter-x-sm">
          <div class="avatar-circle-sm relative-position shadow-4">
            <img src="/arkan_character.png" class="avatar-img" alt="Arkan" />
          </div>
          <div>
            <div class="text-h5 font-fredoka text-bold text-amber-3 row items-center gap-xs">
              <span>🤖🎙️ Asisten Suara Arkan</span>
            </div>
            <div class="text-caption text-purple-2 font-fredoka">
              Tanyakan Apa Saja Tentang Sains, Alam & Hewan! 🌟
            </div>
          </div>
        </div>
        <button class="btn-close-fullscreen flex flex-center shadow-4" @click="closeModal" title="Tutup">✕</button>
      </div>

      <!-- Arkan Talking Stage & Speech Bubble Response -->
      <div class="stage-container column items-center text-center q-pa-md shadow-12 relative-position q-mb-md z-top">
        <!-- Speech Bubble Response from Arkan -->
        <div class="speech-bubble-response q-pa-md shadow-8 relative-position q-mb-md full-width">
          <div class="row items-center gap-xs q-mb-xs justify-center">
            <span class="text-caption font-fredoka text-amber-3 text-bold">
              {{ isThinking ? '✨ Arkan Sedang Berpikir...' : (isSpeaking ? '🔊 Arkan Sedang Berbicara...' : '💬 Jawaban Arkan:') }}
            </span>
          </div>
          <div class="text-subtitle1 font-fredoka text-white text-bold response-text">
            {{ activeAnswerText }}
          </div>
          <div class="speech-arrow-down-modal"></div>
        </div>

        <!-- Animated Arkan Character -->
        <div class="arkan-avatar-stage relative-position flex flex-center cursor-pointer" @click="repeatAnswer">
          <div class="character-glow-halo" :class="{ 'is-talking': isSpeaking }"></div>
          <img
            src="/arkan_character_v2.png?v=yellow_hoodie"
            class="arkan-stage-img"
            :class="{ 'animate-talking-bounce': isSpeaking }"
            alt="Arkan Talking Companion"
          />
        </div>
        <div class="text-caption text-purple-2 font-fredoka q-mt-xs">
          (Tekan Arkan untuk mendengarkan jawaban lagi 🔊)
        </div>
      </div>

      <!-- Real-time Spoken Transcript Display -->
      <div class="transcript-box column items-center justify-center q-py-sm q-px-md rounded-borders text-center q-mb-md relative-position z-top">
        <div class="row items-center gap-xs q-mb-xs">
          <span class="text-caption text-bold text-purple-2 font-fredoka">🗣️ Pertanyaan Kamu:</span>
          <div v-if="isListening" class="equalizer-bars row items-end gap-xs">
            <div class="bar bar-1"></div>
            <div class="bar bar-2"></div>
            <div class="bar bar-3"></div>
            <div class="bar bar-4"></div>
            <div class="bar bar-5"></div>
          </div>
        </div>
        <div class="text-h6 font-fredoka text-bold text-amber-3 spoken-text">
          {{ userQuery || (isListening ? '🎙️ Mendengarkan pertanyaanmu...' : 'Tekan tombol mikrofon untuk bertanya!') }}
        </div>
      </div>

      <!-- Interactive Pulsing Microphone Button -->
      <div class="mic-button-wrapper flex flex-center relative-position q-my-sm z-top">
        <div v-if="isListening" class="pulse-ring ring-1"></div>
        <div v-if="isListening" class="pulse-ring ring-2"></div>
        <div v-if="isListening" class="pulse-ring ring-3"></div>

        <button
          class="btn-mic-pulse flex flex-center shadow-16 cursor-pointer relative-position"
          :class="{ listening: isListening }"
          :disabled="isListening"
          @click="startListening"
        >
          <span v-if="!isListening" class="text-h3">🎙️</span>
          <span v-else class="text-h3 animate-pulse">🔴</span>
        </button>
      </div>
      <div class="text-center text-caption text-bold text-amber-3 font-fredoka q-mb-md z-top">
        {{ isListening ? 'Ayo utarakan pertanyaanmu sekarang!' : 'Tekan Mikrofon Merah untuk Berbicara' }}
      </div>

      <!-- Quick Preset Questions Grid (For Easy Tapping) -->
      <div class="quick-questions-section relative-position z-top">
        <div class="text-caption text-bold text-purple-2 q-mb-xs font-fredoka text-center">
          💡 Atau Pilih Pertanyaan Populer Di Bawah Ini:
        </div>
        <div class="row q-col-gutter-xs justify-center">
          <div
            v-for="(item, idx) in presetQuestions"
            :key="idx"
            class="col-12 col-sm-6"
          >
            <button
              class="btn-preset-question font-fredoka full-width row items-center q-px-sm q-py-xs shadow-3"
              @click="askPresetQuestion(item)"
            >
              <span class="text-h6 q-mr-xs">{{ item.emoji }}</span>
              <span class="text-bold text-caption text-left text-white col-grow ellipsis">{{ item.question }}</span>
            </button>
          </div>
        </div>
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

interface QAItem {
  emoji: string;
  keywords: string[];
  question: string;
  answer: string;
}

const presetQuestions: QAItem[] = [
  {
    emoji: '🌌',
    keywords: ['langit', 'biru', 'sky', 'blue'],
    question: 'Mengapa langit berwarna biru?',
    answer: 'Langit berwarna biru karena udara dan atmosfer bumi membiaskan gelombang cahaya matahari yang berwarna biru ke segala arah di sekitar kita!'
  },
  {
    emoji: '🐘',
    keywords: ['gajah', 'suara gajah', 'elephant'],
    question: 'Suara gajah seperti apa?',
    answer: 'Gajah mengeluarkan suara terompet yang nyaring: PHUOOOO! Gajah meniupkan suara ini lewat belalainya yang panjang untuk menyapa kawanannya!'
  },
  {
    emoji: '🌈',
    keywords: ['pelangi', 'rainbow'],
    question: 'Bagaimana terjadinya pelangi?',
    answer: 'Pelangi terjadi saat sinar matahari menembus tetesan air hujan di udara, membias menjadi 7 warna indah: Merah, Jingga, Kuning, Hijau, Biru, Nila, dan Ungu!'
  },
  {
    emoji: '☀️',
    keywords: ['matahari', 'hangat', 'panas', 'sun'],
    question: 'Kenapa matahari terasa hangat?',
    answer: 'Matahari adalah bintang raksasa yang menghasilkan energi panas dan cahaya yang menyinari bumi agar kita dan tanaman tetap hangat dan tumbuh sehat!'
  },
  {
    emoji: '🐱',
    keywords: ['kucing', 'meong', 'cat'],
    question: 'Mengapa kucing suka mengeong?',
    answer: 'Kucing mengeong "Meoong" khusus untuk berkomunikasi dengan manusia! Kucing ingin menyapa, meminta makan, atau mengajak kita bermain bersama!'
  },
  {
    emoji: '🚀',
    keywords: ['planet', 'tata surya', 'antariksa', 'space'],
    question: 'Berapa jumlah planet di tata surya?',
    answer: 'Ada 8 planet utama di tata surya kita: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, dan Neptunus!'
  },
  {
    emoji: '🍎',
    keywords: ['buah', 'sayur', 'sehat', 'makan'],
    question: 'Mengapa kita harus makan buah & sayur?',
    answer: 'Buah dan sayur kaya akan vitamin dan serat alami agar tubuh Arkan menjadi super kuat, cerdas, berenergi, dan tidak mudah sakit!'
  }
];

const userQuery = ref('');
const activeAnswerText = ref('Halo! Aku Arkan. Tekan mikrofon atau pilih pertanyaan di bawah untuk bertanya padaku!');
const isListening = ref(false);
const isSpeaking = ref(false);
const isThinking = ref(false);

let recognition: any = null;

function initSpeechRecognition() {
  if (typeof window !== 'undefined') {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      recognition = new SpeechRecognitionClass();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        userQuery.value = `"${text}"`;
        if (event.results[0].isFinal) {
          isListening.value = false;
          processUserQuestion(text);
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
  store.stopSpeech();
  isSpeaking.value = false;
  userQuery.value = '';
  isListening.value = true;

  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition error or already started:', e);
    }
  } else {
    userQuery.value = 'Mikrofon tidak didukung di browser ini. Pilih pertanyaan di bawah ya!';
    isListening.value = false;
  }
}

function askPresetQuestion(item: QAItem) {
  store.playSfx('click');
  userQuery.value = `"${item.question}"`;
  respondWithAnswer(item.answer);
}

async function processUserQuestion(text: string) {
  isThinking.value = true;
  activeAnswerText.value = '✨ Arkan sedang berpikir...';

  try {
    const res = await fetch('/api/v1/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, language: 'id-ID' })
    });

    if (res.ok) {
      const data = await res.json();
      isThinking.value = false;
      respondWithAnswer(data.answer);
      return;
    }
  } catch (err) {
    console.warn('AI endpoint error, using local fallback:', err);
  }

  isThinking.value = false;
  const lower = text.toLowerCase();
  let matchedQA = presetQuestions.find(q =>
    q.keywords.some(k => lower.includes(k))
  );

  if (matchedQA) {
    respondWithAnswer(matchedQA.answer);
  } else {
    const fallbackAnswer = `Pertanyaan yang bagus sekali tentang "${text}"! 🌟 Dunia ini penuh dengan keajaiban sains dan alam. Ayo kita pelajari bersama Arkan melalui game dan petualangan! 🚀`;
    respondWithAnswer(fallbackAnswer);
  }
}

function respondWithAnswer(answerText: string) {
  activeAnswerText.value = answerText;
  isSpeaking.value = true;
  store.playSfx('pop');

  store.speak(answerText, 0.95);

  // Simulate speaking animation duration based on text length
  const approxSpeechDurationMs = Math.max(3000, answerText.length * 75);
  setTimeout(() => {
    isSpeaking.value = false;
  }, approxSpeechDurationMs);
}

function repeatAnswer() {
  if (activeAnswerText.value) {
    respondWithAnswer(activeAnswerText.value);
  }
}

function closeModal() {
  store.playSfx('click');
  store.stopSpeech();
  isSpeaking.value = false;
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
  }
  isOpen.value = false;
}

watch(isOpen, (newVal) => {
  if (newVal) {
    userQuery.value = '';
    activeAnswerText.value = 'Halo! Aku Arkan. Tekan mikrofon atau pilih pertanyaan di bawah untuk bertanya padaku!';
  } else {
    store.stopSpeech();
    isSpeaking.value = false;
  }
});

onMounted(() => {
  initSpeechRecognition();
});

onUnmounted(() => {
  store.stopSpeech();
});
</script>

<style scoped>
.smart-talking-card {
  width: 660px;
  max-width: 95vw;
  background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #311b92 100%);
  border-radius: 32px !important;
  border: 3.5px solid #818cf8;
}

.glow-orb-1 {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.glow-orb-2 {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 220px;
  height: 220px;
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

/* Stage Container & Speech Bubble */
.stage-container {
  background: rgba(255, 255, 255, 0.07);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
}

.speech-bubble-response {
  background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
  border: 2px solid #a5b4fc;
  border-radius: 20px;
}

.speech-arrow-down-modal {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #3730a3;
}

.arkan-avatar-stage {
  width: 110px;
  height: 110px;
}

.character-glow-halo {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
  transition: all 0.3s ease;
}

.character-glow-halo.is-talking {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, transparent 70%);
  transform: scale(1.2);
}

.arkan-stage-img {
  height: 100px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.animate-talking-bounce {
  animation: talkingBounce 0.5s infinite alternate ease-in-out;
}

@keyframes talkingBounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-8px) scale(1.06); }
}

/* Equalizer Bars Animation */
.equalizer-bars {
  height: 16px;
}

.bar {
  width: 4px;
  background: #f59e0b;
  border-radius: 4px;
  animation: equalizer 0.8s infinite alternate ease-in-out;
}

.bar-1 { height: 6px; animation-delay: 0.1s; }
.bar-2 { height: 14px; animation-delay: 0.3s; }
.bar-3 { height: 10px; animation-delay: 0.5s; }
.bar-4 { height: 16px; animation-delay: 0.2s; }
.bar-5 { height: 8px; animation-delay: 0.4s; }

@keyframes equalizer {
  0% { transform: scaleY(0.4); }
  100% { transform: scaleY(1.4); }
}

.transcript-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1.5px dashed #818cf8;
  border-radius: 20px;
  min-height: 54px;
}

/* Microphone Ripple Rings */
.mic-button-wrapper {
  height: 90px;
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #ef4444;
  animation: ripple 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.ring-1 { width: 80px; height: 80px; animation-delay: 0s; }
.ring-2 { width: 80px; height: 80px; animation-delay: 0.6s; }
.ring-3 { width: 80px; height: 80px; animation-delay: 1.2s; }

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}

.btn-mic-pulse {
  width: 80px;
  height: 80px;
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

.btn-preset-question {
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-preset-question:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #fde047;
  transform: translateY(-2px);
}
</style>
