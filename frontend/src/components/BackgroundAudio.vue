<template>
  <!-- Global Background Soundtrack Component for "Taklukan Langit" & Music Playlist -->
  <div class="bgm-player-container">
    <audio
      ref="audioRef"
      :src="currentTrack.src"
      preload="auto"
      @play="onAudioPlay"
      @pause="onAudioPause"
      @ended="onTrackEnded"
      @error="onAudioError"
    ></audio>

    <!-- Floating Audio Unblock Overlay Notification if Autoplay Blocked -->
    <div
      v-if="needUserGesture && !store.soundMuted"
      class="audio-unblock-banner row items-center justify-between shadow-8 cursor-pointer"
      @click="unlockAudio"
    >
      <div class="row items-center q-gutter-x-sm">
        <span class="music-icon-pulse">🎵</span>
        <div class="column text-left">
          <span class="text-bold text-white text-caption font-fredoka">
            Soundtrack "Taklukan Langit" ({{ currentTrackIndex + 1 }}/{{ SOUNDTRACK_PLAYLIST.length }})
          </span>
          <span class="text-white text-caption text-weight-medium font-quicksand">
            {{ currentTrack.emoji }} {{ currentTrack.title }} • Klik di sini untuk memutar 🔊
          </span>
        </div>
      </div>
      <button class="play-banner-btn flex flex-center font-fredoka shadow-2">▶ Putar</button>
    </div>

    <!-- Floating Soundtrack Control Widget (When Music Active & Unmuted) -->
    <div
      v-else-if="!store.soundMuted && !props.pauseBgm && !store.isGameActive"
      class="floating-music-widget shadow-10 text-white font-quicksand"
      :class="{ 'widget-collapsed': isCollapsed }"
    >
      <!-- Collapsed Pill View -->
      <div
        v-if="isCollapsed"
        class="compact-music-pill row items-center q-px-md q-py-xs cursor-pointer shadow-6"
        @click="isCollapsed = false"
      >
        <span class="music-icon-spin q-mr-xs">{{ isPlaying ? '🎵' : '⏸️' }}</span>
        <span class="text-bold text-caption font-fredoka ellipsis max-w-title">
          {{ currentTrack.emoji }} {{ currentTrack.title }}
        </span>
        <span class="text-caption text-amber-3 q-ml-xs text-bold">[{{ currentTrackIndex + 1 }}/5]</span>
      </div>

      <!-- Expanded Control Bar View -->
      <div v-else class="expanded-music-box column q-pa-sm rounded-borders shadow-12">
        <!-- Top Bar Header & Minimize -->
        <div class="row items-center justify-between q-mb-xs q-px-xs">
          <div class="row items-center gap-xs">
            <span class="text-subtitle2 font-fredoka text-amber-3">🎧 Backsound Taklukan Langit</span>
            <span class="badge-track-count text-bold text-caption font-mono">
              {{ currentTrackIndex + 1 }}/{{ SOUNDTRACK_PLAYLIST.length }}
            </span>
          </div>
          <button class="btn-icon-mini" title="Kecilkan Pemutar Musik" @click="isCollapsed = true">
            ✕
          </button>
        </div>

        <!-- Current Track Title Display -->
        <div class="track-title-card row items-center q-pa-xs q-mb-xs rounded-borders">
          <span class="track-emoji q-mr-sm">{{ currentTrack.emoji }}</span>
          <div class="column col overflow-hidden text-left">
            <span class="text-bold text-caption text-white font-fredoka ellipsis">
              {{ currentTrack.title }}
            </span>
            <span class="text-caption text-amber-2 text-weight-medium ellipsis font-mono" style="font-size: 11px">
              {{ currentTrack.artist }}
            </span>
          </div>
        </div>

        <!-- Track Dropdown Selector (Ganti Audio Folder) -->
        <div class="q-mb-xs">
          <select
            :value="currentTrackIndex"
            @change="onSelectTrackChange"
            class="track-select-dropdown font-quicksand text-caption text-bold full-width"
          >
            <option
              v-for="(track, idx) in SOUNDTRACK_PLAYLIST"
              :key="track.id"
              :value="idx"
            >
              {{ track.emoji }} {{ idx + 1 }}. {{ track.title }}
            </option>
          </select>
        </div>

        <!-- Audio Control Buttons (Repeat Mode, Prev, Play/Pause, Next) -->
        <div class="row items-center justify-around q-pt-xs">
          <button
            class="btn-music-ctrl shadow-2"
            :class="{ 'btn-mode-active': repeatMode === 'REPEAT_ONE' }"
            :title="repeatMode === 'AUTO_NEXT' ? 'Mode: Lanjut Otomatis (Klik untuk Ulang 1 Lagu)' : 'Mode: Ulang 1 Lagu (Klik untuk Lanjut Otomatis)'"
            @click="toggleRepeatMode"
          >
            {{ repeatMode === 'AUTO_NEXT' ? '🔀' : '🔁' }}
          </button>

          <button
            class="btn-music-ctrl shadow-2"
            title="Lagu Sebelumnya (Sebelumnya)"
            @click="prevTrack"
          >
            ⏮️
          </button>

          <button
            class="btn-music-ctrl btn-play-pause shadow-3"
            :title="isPlaying ? 'Pause Musik' : 'Putar Musik'"
            @click="togglePlayPause"
          >
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>

          <button
            class="btn-music-ctrl shadow-2"
            title="Lagu Berikutnya (Selanjutnya)"
            @click="nextTrack"
          >
            ⏭️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

interface BGMTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  emoji: string;
}

const SOUNDTRACK_PLAYLIST: BGMTrack[] = [
  {
    id: 'taklukan_langit',
    title: 'Taklukan Langit',
    artist: 'Soundtrack Utama Arkan',
    src: '/audio/taklukan_langit.mp3',
    emoji: '🎵',
  },
  {
    id: 'jejak_menuju_pulau_langit',
    title: 'Jejak Menuju Pulau Langit',
    artist: 'Petualangan Awan & Langit',
    src: '/audio/jejak_menuju_pulau_langit.mp3',
    emoji: '🌌',
  },
  {
    id: 'jendela_warna-warni',
    title: 'Jendela Warna-Warni',
    artist: 'Melodi Keceriaan',
    src: '/audio/jendela_warna-warni.mp3',
    emoji: '🎨',
  },
  {
    id: 'kejar_bintang',
    title: 'Kejar Bintang',
    artist: 'Impian & Bintang',
    src: '/audio/kejar_bintang.mp3',
    emoji: '⭐',
  },
  {
    id: 'yuk_bermain_dengan_arkan',
    title: 'Yuk Bermain dengan Arkan',
    artist: 'Tema Bermain Ceria',
    src: '/audio/yuk_bermain_dengan_arkan.mp3',
    emoji: '🎈',
  },
];

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
const isCollapsed = ref(true);

const currentTrackIndex = ref<number>(
  parseInt(localStorage.getItem('arkan_bgm_track_index') || '0', 10) % SOUNDTRACK_PLAYLIST.length
);

const currentTrack = computed(() => SOUNDTRACK_PLAYLIST[currentTrackIndex.value]);

function changeTrack(index: number) {
  const targetIndex = (index + SOUNDTRACK_PLAYLIST.length) % SOUNDTRACK_PLAYLIST.length;
  currentTrackIndex.value = targetIndex;
  localStorage.setItem('arkan_bgm_track_index', String(targetIndex));

  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.src = currentTrack.value.src;
    audioRef.value.load();
    if (!store.soundMuted && !props.pauseBgm && !store.isGameActive) {
      audioRef.value.play().then(() => {
        isPlaying.value = true;
        needUserGesture.value = false;
      }).catch((err) => {
        console.info('Track play blocked:', err);
        needUserGesture.value = true;
      });
    }
  }
}

function nextTrack() {
  store.playSfx('click');
  changeTrack(currentTrackIndex.value + 1);
}

function prevTrack() {
  store.playSfx('click');
  changeTrack(currentTrackIndex.value - 1);
}

function onSelectTrackChange(e: Event) {
  store.playSfx('click');
  const target = e.target as HTMLSelectElement;
  changeTrack(parseInt(target.value, 10));
}

function togglePlayPause() {
  store.playSfx('click');
  if (isPlaying.value) {
    pauseAudio();
  } else {
    unlockAudio();
  }
}

const repeatMode = ref<'AUTO_NEXT' | 'REPEAT_ONE'>(
  (localStorage.getItem('arkan_bgm_repeat_mode') as 'AUTO_NEXT' | 'REPEAT_ONE') || 'AUTO_NEXT'
);

function toggleRepeatMode() {
  store.playSfx('click');
  repeatMode.value = repeatMode.value === 'AUTO_NEXT' ? 'REPEAT_ONE' : 'AUTO_NEXT';
  localStorage.setItem('arkan_bgm_repeat_mode', repeatMode.value);
}

function onTrackEnded() {
  if (repeatMode.value === 'REPEAT_ONE') {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      audioRef.value.play().then(() => {
        isPlaying.value = true;
      }).catch(() => {});
    }
  } else {
    changeTrack(currentTrackIndex.value + 1);
  }
}

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
  console.warn(`Error memuat file audio ${currentTrack.value.src}:`, e);
}

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
  window.addEventListener('click', handleGlobalUserInteraction, { once: false });
  window.addEventListener('touchstart', handleGlobalUserInteraction, { once: false });
  window.addEventListener('keydown', handleGlobalUserInteraction, { once: false });

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

/* Floating Music Widget */
.floating-music-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9990;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.compact-music-pill {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border: 2px solid #ffffff;
  border-radius: 30px;
  transition: all 0.25s ease;
}

.compact-music-pill:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.5);
}

.max-w-title {
  max-width: 140px;
}

.expanded-music-box {
  width: 260px;
  background: linear-gradient(145deg, #1e1b4b 0%, #3b0764 100%);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  backdrop-filter: blur(12px);
}

.badge-track-count {
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.btn-icon-mini {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-icon-mini:hover {
  background: rgba(239, 68, 68, 0.8);
}

.track-title-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.track-emoji {
  font-size: 22px;
}

.track-select-dropdown {
  background: #2e1065;
  color: #fef08a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 6px 8px;
  outline: none;
  cursor: pointer;
}

.btn-music-ctrl {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-music-ctrl:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.btn-mode-active {
  background: rgba(245, 158, 11, 0.4) !important;
  border-color: #f59e0b !important;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6) !important;
}

.btn-play-pause {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  width: 42px;
  height: 42px;
  font-size: 18px;
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
