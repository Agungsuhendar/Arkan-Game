<template>
  <!-- Global Background Soundtrack Component for "Taklukan Langit" -->
  <div class="bgm-player-container">
    <audio
      ref="audioRef"
      src="/audio/taklukan_langit.mp3"
      preload="auto"
      loop
      @play="onAudioPlay"
      @pause="onAudioPause"
      @error="onAudioError"
    ></audio>

    <!-- Floating Audio Unblock Overlay Notification if Autoplay Blocked -->
    <div
      v-if="needUserGesture && !store.soundMuted"
      class="audio-unblock-banner row items-center justify-between shadow-6 cursor-pointer"
      @click="unlockAudio"
    >
      <div class="row items-center q-gutter-x-sm">
        <span class="music-icon-pulse">🎵</span>
        <div class="column">
          <span class="text-bold text-white text-caption font-fredoka">Soundtrack "Taklukan Langit"</span>
          <span class="text-white text-caption text-weight-medium font-quicksand">Klik di sini untuk memutar musik 🔊</span>
        </div>
      </div>
      <button class="play-banner-btn flex flex-center font-fredoka shadow-2">▶ Putar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = withDefaults(
  defineProps<{
    pauseBgm?: boolean;
  }>(),
  {
    pauseBgm: false,
  }
);

const store = useGameStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const needUserGesture = ref(false);

function unlockAudio() {
  needUserGesture.value = false;
  if (props.pauseBgm || store.isGameActive || store.soundMuted) return;

  if (audioRef.value) {
    audioRef.value.volume = 0.5;
    audioRef.value.play().then(() => {
      isPlaying.value = true;
      needUserGesture.value = false;
    }).catch((err) => {
      console.warn('Gagal memutar audio setelah gesture:', err);
    });
  }
}

function tryPlayAudio() {
  if (store.soundMuted || props.pauseBgm || store.isGameActive || !audioRef.value) {
    pauseAudio();
    return;
  }

  audioRef.value.volume = 0.5;
  const promise = audioRef.value.play();

  if (promise !== undefined) {
    promise.then(() => {
      isPlaying.value = true;
      needUserGesture.value = false;
    }).catch((err) => {
      console.info('Browser autoplay memblokir audio otomatis, menunggu interaksi pengguna...', err);
      needUserGesture.value = true;
    });
  }
}

function pauseAudio() {
  if (audioRef.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  }
}

function onAudioPlay() {
  isPlaying.value = true;
  needUserGesture.value = false;
}

function onAudioPause() {
  isPlaying.value = false;
}

function onAudioError(e: Event) {
  console.warn('Error saat memuat file audio /audio/taklukan_langit.mp3:', e);
}

// Global user interaction listener to auto-start audio on first click anywhere
function handleGlobalUserInteraction() {
  if (!store.soundMuted && !props.pauseBgm && !store.isGameActive && !isPlaying.value && audioRef.value) {
    unlockAudio();
  }
}

watch([() => store.soundMuted, () => store.isGameActive, () => props.pauseBgm], ([isMuted, isGameActive, pauseBgm]) => {
  if (isMuted || isGameActive || pauseBgm) {
    pauseAudio();
  } else {
    tryPlayAudio();
  }
});

onMounted(() => {
  // Attach click & touch listeners to document for instant unlock on first tap
  window.addEventListener('click', handleGlobalUserInteraction, { once: false });
  window.addEventListener('touchstart', handleGlobalUserInteraction, { once: false });
  window.addEventListener('keydown', handleGlobalUserInteraction, { once: false });

  // Attempt initial play
  tryPlayAudio();
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalUserInteraction);
  window.removeEventListener('touchstart', handleGlobalUserInteraction);
  window.removeEventListener('keydown', handleGlobalUserInteraction);
  pauseAudio();
});
</script>

<style scoped>
.audio-unblock-banner {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: linear-gradient(135deg, #7e22ce 0%, #3b82f6 100%);
  border: 2px solid #ffffff;
  padding: 10px 16px;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(126, 34, 206, 0.4);
  animation: bannerSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.music-icon-pulse {
  font-size: 24px;
  animation: pulseIcon 1.2s infinite alternate ease-in-out;
}

.play-banner-btn {
  background: #22c55e;
  color: white;
  border: 2px solid white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  margin-left: 12px;
  cursor: pointer;
}

.play-banner-btn:hover {
  transform: scale(1.05);
}

@keyframes pulseIcon {
  0% { transform: scale(1); }
  100% { transform: scale(1.25) rotate(10deg); }
}

@keyframes bannerSlideUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
