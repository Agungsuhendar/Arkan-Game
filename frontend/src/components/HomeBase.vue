<template>
  <div
    class="home-dashboard-wrapper relative-position overflow-hidden"
    :style="{ backgroundImage: `url('${currentBg}')` }"
  >
    <!-- Full-Screen Interactive Game Dashboard Container -->
    <div class="home-game-screen fit relative-position">
      
      <!-- Warm Ambient Room Lighting Animation -->
      <div class="room-ambient-lighting" :class="{ 'is-daytime': isMorning }"></div>

      <!-- 1. Integrated Top Bar Header Overlay -->
      <div class="home-top-bar row items-center justify-between q-px-lg q-pt-md">
        <!-- Top Left: Arkan Profile Card -->
        <div class="profile-card-widget row items-center cursor-pointer shadow-4" @click="store.showParentDashboardModal = true">
          <div class="avatar-circle relative-position">
            <img src="/arkan_avatar_card.png?v=v2" class="avatar-img" alt="Arkan Avatar" />
            <div class="star-badge flex flex-center font-fredoka">⭐</div>
          </div>
          <div class="profile-info column q-ml-xs">
            <div class="row items-center q-gutter-x-xs">
              <span class="profile-name font-fredoka">{{ store.child.name }}</span>
              <span class="level-pill bg-amber-5 text-white font-fredoka text-caption text-bold q-px-xs rounded-borders">
                Level {{ store.child.level }}
              </span>
            </div>
            <div class="xp-container row items-center q-gutter-x-xs q-mt-xs">
              <div class="xp-bar-bg shadow-inner">
                <div class="xp-bar-fill" :style="{ width: `${store.xpPercent}%` }"></div>
              </div>
              <span class="xp-text font-quicksand text-bold">{{ store.xpDisplay }}</span>
            </div>
          </div>
        </div>

        <!-- Top Right: Currency Pills & Notification Buttons -->
        <div class="stats-pills-row row items-center q-gutter-x-sm">
          <!-- Star XP Pill (Hidden on Mobile) -->
          <div class="stat-pill hide-on-mobile bg-white shadow-3 row items-center">
            <span class="stat-icon">⭐</span>
            <span class="stat-value font-fredoka text-dark q-mx-xs">{{ store.child.xp }}</span>
            <button class="add-btn flex flex-center font-fredoka">+</button>
          </div>

          <!-- Coins Pill (Essential - Always Visible) -->
          <div class="stat-pill bg-white shadow-3 row items-center">
            <span class="stat-icon">🪙</span>
            <span class="stat-value font-fredoka text-dark q-mx-xs">{{ store.child.coins }}</span>
            <button class="add-btn flex flex-center font-fredoka">+</button>
          </div>

          <!-- Diamonds Pill (Hidden on Mobile) -->
          <div class="stat-pill hide-on-mobile bg-white shadow-3 row items-center">
            <span class="stat-icon">💎</span>
            <span class="stat-value font-fredoka text-dark q-mx-xs">{{ store.child.diamonds }}</span>
            <button class="add-btn flex flex-center font-fredoka">+</button>
          </div>

          <!-- Sound BGM Toggle Button (Essential - Always Visible) -->
          <button
            class="icon-action-btn bg-purple-3d text-white shadow-4 cursor-pointer"
            :title="store.soundMuted ? 'Nyalakan Musik (Taklukan Langit)' : 'Matikan Musik'"
            @click="store.toggleSound()"
          >
            {{ store.soundMuted ? '🔇' : '🎵' }}
          </button>

          <!-- Day / Night / Auto Background Theme Switcher Button -->
          <button
            class="icon-action-btn bg-amber-3d text-white shadow-4 cursor-pointer"
            :title="bgThemeMode === 'AUTO' ? 'Mode Suasana: Otomatis Jam Real-Time' : bgThemeMode === 'DAY' ? 'Mode Suasana: Siang' : 'Mode Suasana: Malam'"
            @click="toggleBgThemeMode"
          >
            {{ bgThemeMode === 'AUTO' ? '🕒' : bgThemeMode === 'DAY' ? '☀️' : '🌙' }}
          </button>

          <!-- Gift Button (Essential - Always Visible) -->
          <button class="icon-action-btn bg-pink-3d text-white shadow-4 cursor-pointer" title="Hadiah" @click="$emit('open-trophy')">
            🎁
            <span class="badge-count bg-amber-5 text-white flex flex-center font-fredoka">3</span>
          </button>

          <!-- Notification Bell Button (Hidden on Mobile) -->
          <button class="icon-action-btn hide-on-mobile bg-blue-3d text-white shadow-4 cursor-pointer" title="Notifikasi" @click="store.showParentDashboardModal = true">
            🔔
            <span class="badge-count bg-red text-white flex flex-center font-fredoka">3</span>
          </button>
        </div>
      </div>

      <!-- 2. Left Sidebar Navigation Menu (Vertical 3D Buttons) -->
      <div class="left-sidebar-menu column q-gutter-y-sm">
        <button class="nav-3d-btn bg-blue-btn" @click="$emit('launch-game', 'MatchLineGameScene')">
          <div class="btn-icon-box flex flex-center">
            <span class="btn-icon">📖</span>
          </div>
          <span class="btn-text font-fredoka">Belajar</span>
        </button>

        <button class="nav-3d-btn bg-red-pink-btn" @click="$emit('open-map')">
          <div class="btn-icon-box flex flex-center">
            <span class="btn-icon">🚩</span>
          </div>
          <span class="btn-text font-fredoka">Petualangan</span>
        </button>

        <button class="nav-3d-btn bg-orange-btn" @click="$emit('open-game-picker')">
          <div class="btn-icon-box flex flex-center">
            <span class="btn-icon">🎮</span>
          </div>
          <span class="btn-text font-fredoka">Game</span>
        </button>

        <button class="nav-3d-btn bg-green-btn" @click="$emit('open-story')">
          <div class="btn-icon-box flex flex-center">
            <span class="btn-icon">▶️</span>
          </div>
          <span class="btn-text font-fredoka">Cerita</span>
        </button>

        <button class="nav-3d-btn bg-purple-btn" @click="$emit('open-family')">
          <div class="btn-icon-box flex flex-center">
            <span class="btn-icon">👨‍👩‍👧</span>
          </div>
          <span class="btn-text font-fredoka">Keluarga</span>
        </button>
      </div>

      <!-- 3. ANIMATED CHARACTERS LAYER (Positioned on central floor rug) -->
      <div class="characters-interactive-stage">
        <!-- Orange Cat Character Layer -->
        <div class="character-wrapper cat-wrapper animate-cat-bounce cursor-pointer" title="Klik Kucing!" @click="triggerCatReaction">
          <img src="/cat_character_v2.png?v=hd_cut" class="character-img" alt="Kucing Arkan" />
        </div>

        <!-- Arkan Character Layer (Holding glowing tablet) -->
        <div class="character-wrapper arkan-wrapper animate-arkan-float cursor-pointer" title="Klik Arkan!" @click="triggerArkanReaction">
          <div class="tablet-glow-beam"></div>
          <img src="/arkan_character_v2.png?v=yellow_hoodie" class="character-img" alt="Arkan" />
        </div>

        <!-- Green Dino Character Layer (Wearing headphones) -->
        <div class="character-wrapper dino-wrapper animate-dino-sway cursor-pointer" title="Klik Dino!" @click="triggerDinoReaction">
          <img src="/dino_character_v2.png?v=hd_cut" class="character-img" alt="Dino Arkan" />
        </div>

        <!-- Glowing Treasure Chest Layer -->
        <div class="character-wrapper chest-wrapper animate-chest-glow cursor-pointer" title="Buka Peti Hadiah!" @click="$emit('open-trophy')">
          <div class="chest-magic-aura"></div>
          <img src="/chest_character.png" class="character-img" alt="Peti Hadiah" />
        </div>

        <!-- Center Dynamic Speech Bubble (Over Arkan) -->
        <div class="speech-bubble-center pulse-bounce shadow-6 font-fredoka">
          <span v-html="speechMessage"></span>
          <div class="speech-arrow-down"></div>
        </div>
      </div>

      <!-- 4. Right Sidebar Overlay Widgets (Collapsible on Mobile) -->
      <div class="right-widgets-wrapper column items-end">
        <button
          class="toggle-widgets-btn font-fredoka row items-center q-px-sm q-py-xs shadow-4 cursor-pointer q-mb-xs"
          @click="showRightWidgets = !showRightWidgets"
          :title="showRightWidgets ? 'Sembunyikan Foto Keluarga' : 'Tampilkan Foto Keluarga'"
        >
          <span class="q-mr-xs">{{ showRightWidgets ? '🙈' : '🖼️' }}</span>
          <span>{{ showRightWidgets ? 'Sembunyikan' : 'Foto Keluarga' }}</span>
        </button>

        <div v-if="showRightWidgets" class="right-widgets-column column q-gutter-y-sm">
          <!-- Widget 1: Keluarga Arkan Card -->
          <div class="family-card-widget shadow-5 cursor-pointer" @click="$emit('open-wardrobe')">
            <div class="family-header-banner row items-center justify-between q-px-md q-py-xs">
              <span class="family-title font-fredoka text-white text-bold">Keluarga {{ store.child.name }}</span>
              <span class="text-white text-subtitle2">💖</span>
            </div>
            <div class="family-card-body q-pa-xs text-center">
              <img src="/family_photo.png?v=family_v2" class="family-photo-img shadow-1" :alt="`Foto Keluarga ${store.child.name}`" />
              <div class="row justify-around q-mt-xs">
                <span class="tag-badge bg-blue-1 text-primary font-fredoka">Papa</span>
                <span class="tag-badge bg-amber-1 text-amber-10 font-fredoka">{{ store.child.name }}</span>
                <span class="tag-badge bg-pink-1 text-pink font-fredoka">Mama</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

defineEmits(['open-map', 'launch-game', 'open-game-picker', 'open-wardrobe', 'open-story', 'open-trophy', 'open-drawing', 'open-puzzle', 'open-voice-quiz', 'open-family']);
const store = useGameStore();

const showRightWidgets = ref(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
const isMorning = ref(false);
const currentBg = ref('/home_room_bg.webp');

const bgThemeMode = ref<'AUTO' | 'DAY' | 'NIGHT'>(
  (localStorage.getItem('arkan_bg_theme_mode') as 'AUTO' | 'DAY' | 'NIGHT') || 'AUTO'
);

function updateBgTheme() {
  if (bgThemeMode.value === 'DAY') {
    isMorning.value = true;
    currentBg.value = '/home_room_day.webp?v=day_v2';
  } else if (bgThemeMode.value === 'NIGHT') {
    isMorning.value = false;
    currentBg.value = '/home_room_bg.webp?v=night_v3';
  } else {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 18) {
      isMorning.value = true;
      currentBg.value = '/home_room_day.webp?v=day_v2';
    } else {
      isMorning.value = false;
      currentBg.value = '/home_room_bg.webp?v=night_v3';
    }
  }
}

let activeCharacterAudio: HTMLAudioElement | null = null;

function playCharacterVoice(mp3Path: string, fallbackText: string) {
  if (activeCharacterAudio) {
    activeCharacterAudio.pause();
    activeCharacterAudio = null;
  }
  const audio = new Audio(mp3Path);
  activeCharacterAudio = audio;
  audio.volume = 1.0;
  audio.play().catch(() => {
    store.speak(fallbackText);
  });
}

function toggleBgThemeMode() {
  store.playSfx('click');
  if (bgThemeMode.value === 'AUTO') {
    bgThemeMode.value = 'DAY';
    playCharacterVoice('/audio/voices/theme_day.mp3', 'Mode Suasana Siang');
  } else if (bgThemeMode.value === 'DAY') {
    bgThemeMode.value = 'NIGHT';
    playCharacterVoice('/audio/voices/theme_night.mp3', 'Mode Suasana Malam');
  } else {
    bgThemeMode.value = 'AUTO';
    playCharacterVoice('/audio/voices/theme_auto.mp3', 'Mode Suasana Otomatis Jam');
  }
  localStorage.setItem('arkan_bg_theme_mode', bgThemeMode.value);
  updateBgTheme();
}

function handleResize() {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 768) {
      showRightWidgets.value = false;
    }
  }
}

onMounted(() => {
  updateBgTheme();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
  if (activeCharacterAudio) {
    activeCharacterAudio.pause();
    activeCharacterAudio = null;
  }
});

const getDefaultSpeech = () => `Ayo ${store.child.name},<br />hari ini kita<br />petualangan lagi!`;
const speechMessage = ref(getDefaultSpeech());

function triggerArkanReaction() {
  store.playSfx('click');
  playCharacterVoice('/audio/voices/arkan_greeting.mp3', `Hai! Ayo ${store.child.name}, kita belajar dan main game seru!`);
  speechMessage.value = 'Haii! Ayo kita<br />belajar dan main<br />game seru!';
  setTimeout(() => {
    speechMessage.value = getDefaultSpeech();
  }, 4500);
}

function triggerCatReaction() {
  store.playSfx('pop');
  playCharacterVoice('/audio/voices/mimi_cat.mp3?v=mimi_v2', 'Meong! Meong! Nyao! Aku Mimi si kucing imut!');
  speechMessage.value = 'Meong! Meong!<br />Aku Mimi si kucing<br />siap bermain!';
  setTimeout(() => {
    speechMessage.value = getDefaultSpeech();
  }, 4500);
}

function triggerDinoReaction() {
  store.playSfx('success');
  playCharacterVoice('/audio/voices/dino_friend.mp3', 'Rawr! Dino suka musik dan petualangan!');
  speechMessage.value = 'Rawr! Dino<br />suka musik dan<br />petualangan!';
  setTimeout(() => {
    speechMessage.value = getDefaultSpeech();
  }, 4500);
}
</script>

<style scoped>
/* Full-Screen Page Container */
.home-dashboard-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  transition: background-image 0.5s ease-in-out;
  z-index: 1;
  overflow: hidden;
}

.home-game-screen {
  width: 100%;
  height: 100%;
}

/* Warm Ambient Room Lighting Glow */
.room-ambient-lighting {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(255, 215, 0, 0.08) 0%, transparent 70%);
  pointer-events: none;
  animation: roomAmbientPulse 4s infinite alternate ease-in-out;
  z-index: 2;
}

@keyframes roomAmbientPulse {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 1. Integrated Top Bar Header Overlay */
.home-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
}

.profile-card-widget {
  background: #ffffff;
  border-radius: 40px;
  padding: 6px 18px 6px 8px;
  border: 3px solid rgba(255, 255, 255, 0.95);
  transition: transform 0.2s ease;
}

.profile-card-widget:hover {
  transform: scale(1.04);
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #3b82f6;
  background: #e0f2fe;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.star-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 11px;
  background: #f59e0b;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  color: white;
}

.profile-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.level-pill {
  font-size: 11px;
}

.xp-bar-bg {
  width: 90px;
  height: 9px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 10px;
}

.xp-text {
  font-size: 11px;
  color: #64748b;
}

/* Currency Pills & Notification Icons */
.stat-pill {
  border-radius: 26px;
  padding: 6px 12px;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
}

.add-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #22c55e;
  color: white;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}

.icon-action-btn {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 18px;
  border: 2px solid white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.icon-action-btn:hover {
  transform: scale(1.08);
}

.bg-purple-3d {
  background: linear-gradient(180deg, #a855f7 0%, #6b21a8 100%);
  box-shadow: 0 4px 0 #581c87;
}

.bg-pink-3d {
  background: linear-gradient(180deg, #ec4899 0%, #be185d 100%);
  box-shadow: 0 4px 0 #9d174d;
}

.bg-blue-3d {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 0 #1e40af;
}

.bg-amber-3d {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 0 #b45309;
}

.badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  border: 2px solid white;
}

/* 2. Left Sidebar Navigation Menu (Premium 3D Cartoon Buttons) */
.left-sidebar-menu {
  position: absolute;
  left: 24px;
  top: 90px;
  z-index: 20;
  width: 195px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.nav-3d-btn {
  position: relative;
  border: 3.5px solid #ffffff;
  border-radius: 28px;
  padding: 10px 18px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: 100%;
  overflow: hidden;
  user-select: none;
  touch-action: manipulation;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, background 0.22s ease;
  transform-origin: center left;
  border-top-color: rgba(255, 255, 255, 0.95);
  border-left-color: rgba(255, 255, 255, 0.95);
}

/* Shimmer Highlight Light Effect across button */
.nav-3d-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
  pointer-events: none;
}

.nav-3d-btn:hover::before {
  left: 160%;
}

.nav-3d-btn:hover {
  transform: translateX(8px) scale(1.05) rotate(1deg);
}

.nav-3d-btn:active {
  transform: translateX(6px) translateY(5px) scale(0.97) !important;
}

.btn-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 100%);
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 3px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-3d-btn:hover .btn-icon-box {
  transform: scale(1.18) rotate(-10deg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%);
}

.btn-icon {
  font-size: 21px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

.btn-text {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

/* 3D Color Palettes & Shadows */
.bg-blue-btn {
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 40%, #1d4ed8 100%);
  box-shadow: 0 8px 0 #1e40af, 0 10px 20px rgba(29, 78, 216, 0.35);
}
.bg-blue-btn:hover {
  box-shadow: 0 10px 0 #1e40af, 0 14px 28px rgba(59, 130, 246, 0.55), 0 0 20px rgba(96, 165, 250, 0.6);
}
.bg-blue-btn:active {
  box-shadow: 0 3px 0 #1e40af, 0 4px 10px rgba(29, 78, 216, 0.3) !important;
}

.bg-red-pink-btn {
  background: linear-gradient(180deg, #fb7185 0%, #f43f5e 40%, #be123c 100%);
  box-shadow: 0 8px 0 #881337, 0 10px 20px rgba(190, 18, 60, 0.35);
}
.bg-red-pink-btn:hover {
  box-shadow: 0 10px 0 #881337, 0 14px 28px rgba(244, 63, 94, 0.55), 0 0 20px rgba(251, 113, 133, 0.6);
}
.bg-red-pink-btn:active {
  box-shadow: 0 3px 0 #881337, 0 4px 10px rgba(190, 18, 60, 0.3) !important;
}

.bg-orange-btn {
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 40%, #c2410c 100%);
  box-shadow: 0 8px 0 #9a3412, 0 10px 20px rgba(194, 65, 12, 0.35);
}
.bg-orange-btn:hover {
  box-shadow: 0 10px 0 #9a3412, 0 14px 28px rgba(249, 115, 22, 0.55), 0 0 20px rgba(251, 191, 36, 0.6);
}
.bg-orange-btn:active {
  box-shadow: 0 3px 0 #9a3412, 0 4px 10px rgba(194, 65, 12, 0.3) !important;
}

.bg-green-btn {
  background: linear-gradient(180deg, #4ade80 0%, #22c55e 40%, #15803d 100%);
  box-shadow: 0 8px 0 #166534, 0 10px 20px rgba(21, 128, 61, 0.35);
}
.bg-green-btn:hover {
  box-shadow: 0 10px 0 #166534, 0 14px 28px rgba(34, 197, 94, 0.55), 0 0 20px rgba(74, 222, 128, 0.6);
}
.bg-green-btn:active {
  box-shadow: 0 3px 0 #166534, 0 4px 10px rgba(21, 128, 61, 0.3) !important;
}

.bg-purple-btn {
  background: linear-gradient(180deg, #c084fc 0%, #a855f7 40%, #7e22ce 100%);
  box-shadow: 0 8px 0 #6b21a8, 0 10px 20px rgba(126, 34, 206, 0.35);
}
.bg-purple-btn:hover {
  box-shadow: 0 10px 0 #6b21a8, 0 14px 28px rgba(168, 85, 247, 0.55), 0 0 20px rgba(192, 132, 252, 0.6);
}
.bg-purple-btn:active {
  box-shadow: 0 3px 0 #6b21a8, 0 4px 10px rgba(126, 34, 206, 0.3) !important;
}

/* 3. ANIMATED CHARACTERS LAYER & STAGE */
.characters-interactive-stage {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: auto;
  --char-offset: clamp(145px, 14.5vw, 220px);
  --dino-offset: clamp(185px, 18.5vw, 275px);
  --arkan-width: clamp(260px, 23vw, 360px);
  --arkan-height: clamp(370px, 33vw, 510px);
  --cat-width: clamp(210px, 20vw, 300px);
  --cat-height: clamp(230px, 22vw, 330px);
  --dino-width: clamp(210px, 20vw, 300px);
  --dino-height: clamp(315px, 30vw, 450px);
  --chest-width: clamp(160px, 15vw, 220px);
  --chest-height: clamp(130px, 12vw, 180px);
}

.character-wrapper {
  position: absolute;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.character-wrapper:hover {
  transform: translateX(-50%) scale(1.05) !important;
}

.character-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45));
  mix-blend-mode: normal;
  border-radius: 12px;
}

/* Arkan (Center Floor) */
.arkan-wrapper {
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: var(--arkan-width);
  height: var(--arkan-height);
  z-index: 12;
}

.tablet-glow-beam {
  position: absolute;
  top: 50%;
  left: 25%;
  width: 50%;
  height: 25%;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.45) 0%, rgba(59, 130, 246, 0) 70%);
  animation: tabletPulse 2.2s infinite alternate ease-in-out;
  pointer-events: none;
}

/* Orange Cat (Left of Arkan - Constant Center Offset) */
.cat-wrapper {
  bottom: 12%;
  left: calc(50% - var(--char-offset));
  transform: translateX(-50%);
  width: var(--cat-width);
  height: var(--cat-height);
  z-index: 11;
}

/* Green Dino (Right of Arkan - Specific Dino Offset) */
.dino-wrapper {
  bottom: 12%;
  left: calc(50% + var(--dino-offset, clamp(185px, 18.5vw, 275px)));
  transform: translateX(-50%);
  width: var(--dino-width);
  height: var(--dino-height);
  z-index: 11;
}

/* Treasure Chest (In Front of Arkan) */
.chest-wrapper {
  bottom: 6%;
  left: 50%;
  transform: translateX(-50%);
  width: var(--chest-width);
  height: var(--chest-height);
  z-index: 14;
}

.chest-magic-aura {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, rgba(245, 158, 11, 0) 75%);
  animation: magicChestAura 2s infinite alternate ease-in-out;
  pointer-events: none;
}

/* CHARACTER ANIMATION KEYFRAMES */

/* 1. Arkan Gentle Breathing & Floating Motion */
.animate-arkan-float {
  animation: arkanFloat 3.4s infinite alternate ease-in-out;
}

@keyframes arkanFloat {
  0% {
    transform: translateX(-50%) translateY(0px);
  }
  50% {
    transform: translateX(-50%) translateY(-6px) rotate(0.5deg);
  }
  100% {
    transform: translateX(-50%) translateY(-3px) rotate(-0.5deg);
  }
}

@keyframes tabletPulse {
  0% { opacity: 0.4; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1.1); }
}

/* 2. Orange Cat Playful Bounce & Tail Sway */
.animate-cat-bounce {
  animation: catBounce 2.5s infinite alternate ease-in-out;
}

@keyframes catBounce {
  0% {
    transform: translateX(-50%) translateY(0px) rotate(-1deg);
  }
  50% {
    transform: translateX(-50%) translateY(-10px) rotate(3deg);
  }
  100% {
    transform: translateX(-50%) translateY(-4px) rotate(-2deg);
  }
}

/* 3. Green Dino Head Bobbing & Sway */
.animate-dino-sway {
  animation: dinoSway 2.8s infinite alternate ease-in-out;
}

@keyframes dinoSway {
  0% {
    transform: translateX(-50%) translateY(0px) rotate(1deg);
  }
  50% {
    transform: translateX(-50%) translateY(-10px) rotate(-3deg);
  }
  100% {
    transform: translateX(-50%) translateY(-5px) rotate(2deg);
  }
}

/* 4. Treasure Chest Magic Glow & Pulse */
.animate-chest-glow {
  animation: chestGlow 2.2s infinite alternate ease-in-out;
}

@keyframes chestGlow {
  0% {
    transform: translateX(-50%) scale(1);
    filter: drop-shadow(0 6px 12px rgba(168, 85, 247, 0.4));
  }
  100% {
    transform: translateX(-50%) scale(1.08);
    filter: drop-shadow(0 12px 25px rgba(245, 158, 11, 0.8)) drop-shadow(0 0 35px rgba(168, 85, 247, 0.9));
  }
}

@keyframes magicChestAura {
  0% { opacity: 0.4; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1.25); }
}

/* 3. Center Speech Bubble (Above Arkan) */
.speech-bubble-center {
  position: absolute;
  bottom: calc(10% + var(--arkan-height) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: #ffffff;
  color: #1e293b;
  font-weight: 700;
  font-size: 15px;
  line-height: 1.3;
  padding: 12px 24px;
  border-radius: 24px;
  border: 3px solid #3b82f6;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.speech-arrow-down {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #3b82f6;
}

/* 4. Right Sidebar Overlay Widgets Wrapper */
.right-widgets-wrapper {
  position: absolute;
  right: 24px;
  top: 90px;
  z-index: 25;
}

.toggle-widgets-btn {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: white;
  border: 2px solid #ffffff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: bold;
  transition: transform 0.2s ease, background 0.2s ease;
}

.toggle-widgets-btn:hover {
  transform: scale(1.05);
}

.right-widgets-column {
  width: 270px;
}

@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
  .home-top-bar {
    padding-left: 10px !important;
    padding-right: 10px !important;
    padding-top: 8px !important;
  }
  .profile-card-widget {
    padding: 4px 10px 4px 6px !important;
  }
  .xp-container {
    display: none !important;
  }
  .stat-pill {
    padding: 4px 8px !important;
  }
  .stat-value {
    display: none !important;
  }
  .add-btn {
    display: none !important;
  }
  .icon-action-btn {
    width: 38px !important;
    height: 38px !important;
    font-size: 18px !important;
    border-radius: 14px !important;
  }
  .left-sidebar-menu {
    left: 10px !important;
    top: 75px !important;
    width: 140px !important;
  }
  .nav-3d-btn {
    padding: 6px 10px !important;
    gap: 8px !important;
    border-radius: 18px !important;
  }
  .btn-icon-box {
    width: 28px !important;
    height: 28px !important;
  }
  .btn-icon {
    font-size: 15px !important;
  }
  .btn-text {
    font-size: 13px !important;
  }
  .right-widgets-wrapper {
    right: 10px;
    top: 75px;
  }
  .right-widgets-column {
    width: 230px;
  }
}

.family-card-widget, .quests-card-widget {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 3px solid #3b82f6;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.family-card-widget:hover {
  transform: scale(1.02);
}

.family-header-banner, .quest-header-banner {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.family-title, .quest-title {
  font-size: 15px;
}

.family-photo-img {
  width: 100%;
  height: 135px;
  object-fit: cover;
  border-radius: 14px;
}

.tag-badge {
  font-size: 13px;
  font-weight: bold;
  padding: 3px 12px;
  border-radius: 10px;
}

.quest-text {
  font-size: 12px;
  font-weight: bold;
  color: #334155;
}

.quest-progress {
  font-size: 11px;
  font-weight: bold;
}
</style>
