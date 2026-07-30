<template>
  <div class="adventure-map-wrapper relative-position overflow-hidden">
    <!-- Animated Hot Air Balloons & Floating Birds -->

    <!-- Animated Hot Air Balloons & Floating Birds -->
    <div class="sky-decorations-layer">
      <div class="hot-air-balloon balloon-1">🎈</div>
      <div class="hot-air-balloon balloon-2">🧺🎈</div>
      <div class="flying-bird bird-1">🕊️</div>
      <div class="flying-bird bird-2">🕊️</div>
    </div>

    <div class="animated-clouds-layer">
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="cloud cloud-3">🌤️</div>
      <div class="cloud cloud-4">☁️</div>
      <div class="cloud cloud-5">☁️</div>
    </div>
    
    <!-- Floating Sparkles, Stars & Magic Bubbles Overhead -->
    <div class="sparkles-overlay">
      <span class="sparkle s1">✨</span>
      <span class="sparkle s2">⭐</span>
      <span class="sparkle s3">🌟</span>
      <span class="sparkle s4">✨</span>
      <span class="sparkle s5">🎨</span>
      <span class="sparkle s6">🌈</span>
      <span class="sparkle s7">🚀</span>
      <span class="sparkle s8">⭐</span>
    </div>

    <!-- 1. Integrated Top Navigation Header Bar -->
    <div class="adventure-top-bar row items-center justify-between q-px-lg q-pt-md relative-position">
      <button class="btn-3d-cartoon btn-accent-pink shadow-6 font-fredoka btn-back-home" @click="handleBackHome">
        ⬅️ Beranda Rumah
      </button>

      <div class="map-title-badge column items-center">
        <div class="text-h3 font-fredoka text-bold text-white title-glow-3d row items-center q-gutter-x-sm">
          <span>🗺️</span>
          <span>PETA DUNIA PETUALANGAN</span>
          <span>🌟</span>
        </div>
        <span class="text-subtitle1 font-fredoka text-amber-3 text-bold subtitle-sparkle">
          Pilih Pulau Petualangan dan Kumpulkan Semua Bintang Emas!
        </span>
      </div>

      <div class="stat-pill bg-white shadow-6 row items-center q-px-md q-py-xs rounded-borders-lg">
        <span class="stat-icon-star">⭐</span>
        <span class="stat-value-xp font-fredoka text-amber-10 text-h6 text-bold q-ml-xs">{{ store.child.xp }} Bintang</span>
      </div>
    </div>

    <!-- 2. Interactive Island Map Cards Grid (Scrollable Container) -->
    <div class="map-scroll-stage q-px-xl q-pt-lg q-pb-xl">
      <div class="row q-col-gutter-xl justify-center items-stretch">
        <div
          v-for="(world, index) in store.worlds"
          :key="world.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <!-- 3D Magical Island Card -->
          <div
            class="magical-world-card column justify-between shadow-12 cursor-pointer relative-position"
            :class="`theme-${world.code}`"
            @click="handleSelectWorld(world)"
          >
            <!-- Card Top Header Ribbon & Level Badge -->
            <div class="card-top-ribbon row items-center justify-between q-px-md q-pt-sm">
              <span class="world-number-badge font-fredoka shadow-3">
                Pulau #{{ index + 1 }}
              </span>
              <span class="stars-earned-badge font-fredoka shadow-3">
                ⭐⭐⭐ 3/3
              </span>
            </div>

            <!-- Central Floating Animated Island Emblem -->
            <div class="island-emblem-wrapper flex flex-center relative-position q-my-sm">
              <div class="island-aura-circle"></div>
              <img
                v-if="world.code === 'hutan_huruf'"
                src="/adventure_map_card.png"
                class="island-img-giant floating-bounce"
                alt="Hutan Huruf"
              />
              <img
                v-else-if="world.code === 'kebun_angka'"
                src="/underwater_game.png"
                class="island-img-giant floating-bounce"
                alt="Kebun Angka"
              />
              <div v-else class="world-emoji-giant floating-bounce">
                {{ getWorldEmoji(world.code) }}
              </div>
            </div>

            <!-- World Info Box -->
            <div class="world-details-box q-pa-md text-center column col justify-between">
              <div>
                <div class="world-name-title font-fredoka text-bold line-clamp-1 q-mb-xs">
                  {{ world.name }}
                </div>
                <div class="world-description-text font-quicksand text-bold line-clamp-2">
                  {{ world.description }}
                </div>
              </div>

              <!-- Boss Guardian Pill & Action Button -->
              <div class="q-mt-md column q-gutter-y-xs">
                <div class="boss-guardian-pill row items-center justify-center font-fredoka shadow-2">
                  <span class="q-mr-xs">👑 Penjaga:</span>
                  <span class="text-bold">{{ world.boss_name }}</span>
                </div>

                <button class="btn-play-island font-fredoka shadow-6 row items-center justify-center full-width">
                  <span>Mulai Main</span>
                  <span class="q-ml-xs font-bold">🚀 ➡️</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Character Companion Banner at Bottom Left -->
    <div class="map-companion-banner row items-center shadow-8 pulse-slow">
      <img src="/arkan_character.png" class="companion-avatar" alt="Arkan" />
      <div class="companion-speech font-fredoka q-ml-sm">
        <span>"Ayo {{ store.child.name }}, kita taklukkan semua pulau!"</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';
import { World } from '../domain/types';

const emit = defineEmits(['back', 'select-level']);
const store = useGameStore();

onMounted(() => {
  store.fetchWorlds();
});

const getWorldEmoji = (code: string) => {
  const map: Record<string, string> = {
    hutan_huruf: '🌳🔤',
    kebun_angka: '🍉🔢',
    kota_warna: '🎨🏙️',
    pulau_hewan: '🦁🏝️',
    kastil_puzzle: '🏰🧩',
    planet_sains: '🚀🪐',
    gunung_prestasi: '🏆🏔️',
    studio_musik: '🎵🎹',
    taman_ejaan: '🔤⚽',
  };
  return map[code] || '🌟';
};

const handleBackHome = () => {
  store.playSfx('click');
  emit('back');
};

const handleSelectWorld = (world: World) => {
  store.selectWorld(world);

  // Map world code to Phaser 3 Game Scene Key
  const sceneMap: Record<string, string> = {
    hutan_huruf: 'MatchLineGameScene',
    kebun_angka: 'NumberGardenScene',
    kota_warna: 'ColorCityScene',
    pulau_hewan: 'AnimalIslandScene',
    kastil_puzzle: 'CastlePuzzleScene',
    planet_sains: 'SpaceScienceScene',
    gunung_prestasi: 'MountainClimbScene',
    studio_musik: 'MusicStudioScene',
    taman_ejaan: 'SpellingGardenScene',
  };

  const targetScene = sceneMap[world.code] || 'NumberGardenScene';
  store.startLevel('lvl_1', targetScene);
  emit('select-level', targetScene);
};
</script>

<style scoped>
/* Full Page Pure CSS Gradient Sky - 100% Crisp & Zero Blur */
.adventure-map-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  background: linear-gradient(180deg, #38bdf8 0%, #0284c7 50%, #0f172a 100%);
  overflow-x: hidden;
  overflow-y: auto;
}

/* Hot Air Balloons & Birds */
.sky-decorations-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.hot-air-balloon {
  position: absolute;
  font-size: 48px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
  animation: balloonSway 4s infinite alternate ease-in-out;
}

.balloon-1 { top: 12%; right: 12%; animation-duration: 4.5s; }
.balloon-2 { top: 28%; left: 6%; animation-duration: 5.2s; font-size: 40px; }

@keyframes balloonSway {
  0% { transform: translateY(0px) rotate(-3deg); }
  100% { transform: translateY(-16px) rotate(4deg); }
}

.flying-bird {
  position: absolute;
  font-size: 32px;
  opacity: 0.85;
  animation: flyBird 22s linear infinite;
}

.bird-1 { top: 18%; left: -5%; animation-duration: 24s; }
.bird-2 { top: 10%; left: -15%; animation-duration: 19s; animation-delay: 7s; font-size: 26px; }

@keyframes flyBird {
  0% { transform: translateX(-10vw) translateY(0); }
  50% { transform: translateX(50vw) translateY(-15px); }
  100% { transform: translateX(110vw) translateY(5px); }
}

/* Animated Clouds floating horizontally */
.animated-clouds-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.cloud {
  position: absolute;
  font-size: 64px;
  opacity: 0.8;
  filter: drop-shadow(0 8px 16px rgba(255, 255, 255, 0.4));
  animation: floatCloud 28s linear infinite;
}

.cloud-1 { top: 6%; left: -10%; animation-duration: 32s; }
.cloud-2 { top: 14%; left: -20%; animation-duration: 25s; animation-delay: 5s; }
.cloud-3 { top: 8%; left: -15%; animation-duration: 40s; animation-delay: 12s; font-size: 76px; }
.cloud-4 { top: 22%; left: -25%; animation-duration: 30s; animation-delay: 18s; }
.cloud-5 { top: 32%; left: -18%; animation-duration: 35s; animation-delay: 8s; font-size: 52px; }

@keyframes floatCloud {
  0% { transform: translateX(-10vw); }
  100% { transform: translateX(110vw); }
}

/* Sparkles & Floating Emojis */
.sparkles-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.sparkle {
  position: absolute;
  font-size: 26px;
  animation: twinkleSparkle 2.4s infinite alternate ease-in-out;
}

.s1 { top: 10%; left: 15%; animation-delay: 0.2s; }
.s2 { top: 20%; right: 18%; animation-delay: 0.8s; font-size: 34px; }
.s3 { top: 5%; right: 40%; animation-delay: 1.4s; }
.s4 { top: 35%; left: 8%; animation-delay: 1.9s; }
.s5 { top: 25%; left: 88%; animation-delay: 0.5s; font-size: 34px; }
.s6 { top: 15%; left: 45%; animation-delay: 1.1s; font-size: 38px; }
.s7 { top: 40%; right: 8%; animation-delay: 2.2s; font-size: 30px; }
.s8 { top: 8%; left: 30%; animation-delay: 1.6s; }

@keyframes twinkleSparkle {
  0% { transform: scale(0.8) translateY(0); opacity: 0.4; }
  100% { transform: scale(1.3) translateY(-8px); opacity: 1; filter: drop-shadow(0 0 10px #fde047); }
}

/* Top Header Bar */
.adventure-top-bar {
  z-index: 20;
}

.btn-back-home {
  font-size: 15px;
  padding: 10px 20px;
}

.title-glow-3d {
  text-shadow: 0 4px 0 #0284c7, 0 8px 20px rgba(0, 0, 0, 0.4);
}

.subtitle-sparkle {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.rounded-borders-lg {
  border-radius: 24px;
  border: 3px solid #38bdf8;
}

.stat-icon-star {
  font-size: 26px;
}

/* Map Scroll Container */
.map-scroll-stage {
  z-index: 20;
  position: relative;
}

/* 3D Island Cards Styling */
.magical-world-card {
  min-height: 340px;
  border-radius: 28px;
  border: 4px solid #ffffff;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.magical-world-card:hover {
  transform: translateY(-12px) scale(1.04);
  box-shadow: 0 25px 45px rgba(253, 224, 71, 0.4);
  border-color: #fde047;
}

/* Theme Colors for Each World */
.theme-hutan_huruf { background: linear-gradient(180deg, #dcfce7 0%, #22c55e 100%); }
.theme-kebun_angka { background: linear-gradient(180deg, #fef9c3 0%, #eab308 100%); }
.theme-kota_warna { background: linear-gradient(180deg, #fae8ff 0%, #a855f7 100%); }
.theme-pulau_hewan { background: linear-gradient(180deg, #ffedd5 0%, #f97316 100%); }
.theme-kastil_puzzle { background: linear-gradient(180deg, #e0e7ff 0%, #6366f1 100%); }
.theme-planet_sains { background: linear-gradient(180deg, #bae6fd 0%, #0284c7 100%); }
.theme-gunung_prestasi { background: linear-gradient(180deg, #fce7f3 0%, #ec4899 100%); }

.world-number-badge {
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: bold;
}

.stars-earned-badge {
  background: #f59e0b;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: bold;
  border: 1.5px solid white;
}

/* Island Emblem & Bounce Effect */
.island-emblem-wrapper {
  height: 110px;
}

.island-aura-circle {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
}

.island-img-giant {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 20px;
  z-index: 5;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  mix-blend-mode: multiply;
}

.world-emoji-giant {
  font-size: 68px;
  z-index: 5;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.floating-bounce {
  animation: giantBounce 2.6s infinite alternate ease-in-out;
}

@keyframes giantBounce {
  0% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
  100% { transform: translateY(-4px) rotate(-1deg); }
}

/* World Details Content Box */
.world-details-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 22px;
  margin: 8px;
}

.world-name-title {
  color: #0f172a;
  font-size: 20px;
}

.world-description-text {
  color: #475569;
  font-size: 13px;
  line-height: 1.35;
}

.boss-guardian-pill {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #cbd5e1;
}

.btn-play-island {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: 2px solid #fde047;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 4px 0 #b45309;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-play-island:hover {
  transform: scale(1.03);
}

/* Bottom Companion Arkan Floating Box */
.map-companion-banner {
  position: fixed;
  bottom: 20px;
  left: 24px;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 3px solid #38bdf8;
  border-radius: 28px;
  padding: 6px 18px 6px 10px;
  pointer-events: none;
}

.companion-avatar {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.companion-speech {
  color: #0369a1;
  font-size: 14px;
  font-weight: bold;
}

.pulse-slow {
  animation: pulseBox 3s infinite alternate ease-in-out;
}

@keyframes pulseBox {
  0% { transform: scale(1); }
  100% { transform: scale(1.04); }
}
</style>

