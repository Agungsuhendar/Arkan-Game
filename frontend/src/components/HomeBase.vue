<template>
  <div class="home-dashboard-wrapper relative-position overflow-hidden">
    <!-- Full-Screen Interactive Game Dashboard Container -->
    <div class="home-game-screen fit relative-position">
      
      <!-- Warm Ambient Room Lighting Animation -->
      <div class="room-ambient-lighting"></div>

      <!-- 1. Integrated Top Bar Header Overlay -->
      <div class="home-top-bar row items-center justify-between q-px-lg q-pt-md">
        <!-- Top Left: Arkan Profile Card -->
        <div class="profile-card-widget row items-center cursor-pointer shadow-4" @click="store.showParentDashboardModal = true">
          <div class="avatar-circle relative-position">
            <img src="/arkan_avatar_card.png" class="avatar-img" alt="Arkan Avatar" />
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
          <!-- Star XP Pill -->
          <div class="stat-pill bg-white shadow-3 row items-center">
            <span class="stat-icon">⭐</span>
            <span class="stat-value font-fredoka text-dark q-mx-xs">{{ store.child.xp }}</span>
            <button class="add-btn flex flex-center font-fredoka">+</button>
          </div>

          <!-- Coins Pill -->
          <div class="stat-pill bg-white shadow-3 row items-center">
            <span class="stat-icon">🪙</span>
            <span class="stat-value font-fredoka text-dark q-mx-xs">{{ store.child.coins }}</span>
            <button class="add-btn flex flex-center font-fredoka">+</button>
          </div>

          <!-- Diamonds Pill -->
          <div class="stat-pill bg-white shadow-3 row items-center">
            <span class="stat-icon">💎</span>
            <span class="stat-value font-fredoka text-dark q-mx-xs">{{ store.child.diamonds }}</span>
            <button class="add-btn flex flex-center font-fredoka">+</button>
          </div>

          <!-- Sound BGM Toggle Button -->
          <button
            class="icon-action-btn bg-purple-3d text-white shadow-4 cursor-pointer"
            :title="store.soundMuted ? 'Nyalakan Musik (Taklukan Langit)' : 'Matikan Musik'"
            @click="store.toggleSound()"
          >
            {{ store.soundMuted ? '🔇' : '🎵' }}
          </button>

          <!-- Gift Button -->
          <button class="icon-action-btn bg-pink-3d text-white shadow-4 cursor-pointer" title="Hadiah" @click="$emit('open-trophy')">
            🎁
            <span class="badge-count bg-amber-5 text-white flex flex-center font-fredoka">3</span>
          </button>

          <!-- Notification Bell Button -->
          <button class="icon-action-btn bg-blue-3d text-white shadow-4 cursor-pointer" title="Notifikasi" @click="store.showParentDashboardModal = true">
            🔔
            <span class="badge-count bg-red text-white flex flex-center font-fredoka">3</span>
          </button>
        </div>
      </div>

      <!-- 2. Left Sidebar Navigation Menu (Vertical 3D Buttons) -->
      <div class="left-sidebar-menu column q-gutter-y-sm">
        <button class="nav-3d-btn bg-blue-btn" @click="$emit('open-map')">
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

        <button class="nav-3d-btn bg-orange-btn" @click="$emit('open-map')">
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

        <button class="nav-3d-btn bg-pink-btn" @click="$emit('open-wardrobe')">
          <div class="btn-icon-box flex flex-center">
            <span class="btn-icon">💖</span>
          </div>
          <span class="btn-text font-fredoka">Keluarga</span>
        </button>
      </div>

      <!-- 3. ANIMATED CHARACTERS LAYER (Positioned on central floor rug) -->
      <div class="characters-interactive-stage">
        <!-- Orange Cat Character Layer -->
        <div class="character-wrapper cat-wrapper animate-cat-bounce cursor-pointer" title="Klik Kucing!" @click="triggerCatReaction">
          <img src="/cat_character.png" class="character-img" alt="Kucing Arkan" />
        </div>

        <!-- Arkan Character Layer (Holding glowing tablet) -->
        <div class="character-wrapper arkan-wrapper animate-arkan-float cursor-pointer" title="Klik Arkan!" @click="triggerArkanReaction">
          <div class="tablet-glow-beam"></div>
          <img src="/arkan_character.png" class="character-img" alt="Arkan" />
        </div>

        <!-- Green Dino Character Layer (Wearing headphones) -->
        <div class="character-wrapper dino-wrapper animate-dino-sway cursor-pointer" title="Klik Dino!" @click="triggerDinoReaction">
          <img src="/dino_character.png" class="character-img" alt="Dino Arkan" />
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

      <!-- 4. Right Sidebar Overlay Widgets -->
      <div class="right-widgets-column column q-gutter-y-sm">
        <!-- Widget 1: Keluarga Arkan Card -->
        <div class="family-card-widget shadow-5 cursor-pointer" @click="$emit('open-wardrobe')">
          <div class="family-header-banner row items-center justify-between q-px-md q-py-xs">
            <span class="family-title font-fredoka text-white text-bold">Keluarga {{ store.child.name }}</span>
            <span class="text-white text-subtitle2">💖</span>
          </div>
          <div class="family-card-body q-pa-xs text-center">
            <img src="/family_photo.png?v=family_v2" class="family-photo-img shadow-1" :alt="`Foto Keluarga ${store.child.name}`" />
            <div class="row justify-around q-mt-xs">
              <span class="tag-badge bg-blue-1 text-primary font-fredoka">Ayah</span>
              <span class="tag-badge bg-amber-1 text-amber-10 font-fredoka">{{ store.child.name }}</span>
              <span class="tag-badge bg-pink-1 text-pink font-fredoka">Ibu</span>
            </div>
          </div>
        </div>

        <!-- Widget 2: Misi Hari Ini Card -->
        <div class="quests-card-widget shadow-5">
          <div class="quest-header-banner row items-center justify-between q-px-md q-py-xs">
            <div class="row items-center q-gutter-x-xs">
              <span>📅</span>
              <span class="quest-title font-fredoka text-white text-bold">Misi Hari Ini</span>
            </div>
          </div>
          <div class="quest-list-box q-pa-xs">
            <div class="quest-row row items-center justify-between bg-green-1 q-px-sm q-py-xs q-mb-xs rounded-borders">
              <div class="row items-center">
                <span class="check-icon text-positive q-mr-xs">✓</span>
                <span class="quest-text font-fredoka">Belajar Huruf</span>
              </div>
              <span class="quest-progress text-amber-9 font-fredoka">5/5 ⭐</span>
            </div>

            <div class="quest-row row items-center justify-between bg-blue-1 q-px-sm q-py-xs q-mb-xs rounded-borders">
              <div class="row items-center">
                <span class="check-icon text-positive q-mr-xs">✓</span>
                <span class="quest-text font-fredoka">Hitung Angka</span>
              </div>
              <span class="quest-progress text-grey-7 font-fredoka">8/10 ⚪</span>
            </div>

            <div class="quest-row row items-center justify-between bg-purple-1 q-px-sm q-py-xs q-mb-xs rounded-borders">
              <div class="row items-center">
                <span class="check-icon text-positive q-mr-xs">✓</span>
                <span class="quest-text font-fredoka">Warna & Bentuk</span>
              </div>
              <span class="quest-progress text-amber-9 font-fredoka">3/3 ⭐</span>
            </div>

            <div class="quest-row row items-center justify-between bg-pink-1 q-px-sm q-py-xs rounded-borders">
              <div class="row items-center">
                <span class="check-icon text-negative q-mr-xs">✕</span>
                <span class="quest-text font-fredoka">Dengarkan Cerita</span>
              </div>
              <span class="quest-progress text-positive font-fredoka">1/1 ✓</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

defineEmits(['open-map', 'open-wardrobe', 'open-story', 'open-trophy']);
const store = useGameStore();

const getDefaultSpeech = () => `Ayo ${store.child.name},<br />hari ini kita<br />petualangan lagi!`;
const speechMessage = ref(getDefaultSpeech());

function triggerArkanReaction() {
  speechMessage.value = 'Haii! Ayo kita<br />belajar dan main<br />game seru!';
  setTimeout(() => {
    speechMessage.value = getDefaultSpeech();
  }, 4000);
}

function triggerCatReaction() {
  speechMessage.value = 'Meow! Kucing<br />siap menemanimu<br />belajar!';
  setTimeout(() => {
    speechMessage.value = getDefaultSpeech();
  }, 4000);
}

function triggerDinoReaction() {
  speechMessage.value = 'Rawr! Dino<br />suka musik dan<br />petualangan!';
  setTimeout(() => {
    speechMessage.value = getDefaultSpeech();
  }, 4000);
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
  background: url('/home_room_bg.webp') center center / cover no-repeat;
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

/* 2. Left Sidebar Navigation Menu */
.left-sidebar-menu {
  position: absolute;
  left: 24px;
  top: 90px;
  z-index: 20;
  width: 185px;
}

.nav-3d-btn {
  border: 3px solid #ffffff;
  border-radius: 24px;
  padding: 10px 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
}

.nav-3d-btn:hover {
  transform: translateX(6px);
}

.nav-3d-btn:active {
  transform: translateY(3px);
  box-shadow: none !important;
}

.btn-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.btn-icon {
  font-size: 19px;
}

.btn-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.bg-blue-btn { background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); box-shadow: 0 5px 0 #1e40af; }
.bg-red-pink-btn { background: linear-gradient(180deg, #f43f5e 0%, #be123c 100%); box-shadow: 0 5px 0 #881337; }
.bg-orange-btn { background: linear-gradient(180deg, #f97316 0%, #c2410c 100%); box-shadow: 0 5px 0 #9a3412; }
.bg-green-btn { background: linear-gradient(180deg, #22c55e 0%, #15803d 100%); box-shadow: 0 5px 0 #166534; }
.bg-pink-btn { background: linear-gradient(180deg, #ec4899 0%, #be185d 100%); box-shadow: 0 5px 0 #9d174d; }

/* 3. ANIMATED CHARACTERS LAYER & STAGE */
.characters-interactive-stage {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: auto;
  --char-offset: clamp(170px, 16.5vw, 260px);
  --arkan-width: clamp(240px, 22vw, 340px);
  --arkan-height: clamp(220px, 20vw, 310px);
  --cat-width: clamp(140px, 13vw, 200px);
  --cat-height: clamp(140px, 13vw, 200px);
  --dino-width: clamp(140px, 13vw, 200px);
  --dino-height: clamp(140px, 13vw, 200px);
  --chest-width: clamp(110px, 10vw, 150px);
  --chest-height: clamp(90px, 8vw, 120px);
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
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
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
  top: 45%;
  left: 20%;
  width: 50%;
  height: 35%;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0) 70%);
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

/* Green Dino (Right of Arkan - Constant Center Offset) */
.dino-wrapper {
  bottom: 12%;
  left: calc(50% + var(--char-offset));
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

/* 4. Right Sidebar Overlay Widgets */
.right-widgets-column {
  position: absolute;
  right: 24px;
  top: 90px;
  z-index: 20;
  width: 235px;
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
  font-size: 13px;
}

.family-photo-img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
}

.tag-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 10px;
  border-radius: 8px;
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
