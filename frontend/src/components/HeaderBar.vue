<template>
  <header class="header-bar row items-center justify-between q-px-md q-py-sm">
    <!-- Left: Arkan Profile Card & Direct Nav Links -->
    <div class="row items-center q-gutter-x-sm">
      <div class="profile-card row items-center q-px-md q-py-xs shadow-6 cursor-pointer" @click="openDashboard" title="Buka Dashboard Keluarga">
        <div class="avatar-circle relative-position q-mr-sm shadow-3">
          <img src="/arkan_avatar_card.png" class="avatar-img" alt="Arkan Avatar" />
          <div class="star-badge flex flex-center font-fredoka">⭐</div>
        </div>
        <div class="profile-info">
          <div class="row items-center q-gutter-x-xs">
            <span class="text-bold text-dark text-subtitle1 font-fredoka profile-name-glow">{{ store.child.name }}</span>
            <span class="level-pill bg-amber-5 text-white font-fredoka text-caption text-bold q-px-xs rounded-borders shadow-2">
              Level {{ store.child.level }}
            </span>
          </div>
          <div class="xp-container row items-center q-gutter-x-xs q-mt-xs">
            <div class="xp-bar-bg shadow-inner">
              <div class="xp-bar-fill" :style="{ width: `${store.xpPercent}%` }"></div>
            </div>
            <span class="text-caption text-weight-bolder text-grey-8 font-quicksand">{{ store.xpDisplay }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Direct Nav Buttons -->
      <div class="row items-center q-gutter-x-xs gt-xs">
        <button class="nav-shortcut-btn bg-blue-btn text-white font-fredoka shadow-3" @click="handleGoHome">
          🏠 Beranda
        </button>
        <button class="nav-shortcut-btn bg-pink-btn text-white font-fredoka shadow-3" @click="handleOpenMap">
          🗺️ Peta
        </button>
        <button class="nav-shortcut-btn bg-green-btn text-white font-fredoka shadow-3" @click="handleLaunchGame">
          🎮 Main Game
        </button>
      </div>
    </div>

    <!-- Center/Right Stats & Quick Action Badges -->
    <div class="row items-center q-gutter-x-sm">
      <!-- Currency Pills with (+) buttons -->
      <div class="stat-pill bg-white shadow-4 row items-center cursor-pointer" @click="store.playSfx('coin')">
        <span class="stat-icon icon-bounce">⭐</span>
        <span class="text-weight-bolder font-fredoka text-dark q-mx-xs">{{ store.child.xp }}</span>
        <button class="add-btn flex flex-center font-fredoka shadow-2">+</button>
      </div>

      <div class="stat-pill bg-white shadow-4 row items-center cursor-pointer" @click="store.playSfx('coin')">
        <span class="stat-icon icon-bounce">🪙</span>
        <span class="text-weight-bolder font-fredoka text-dark q-mx-xs">{{ store.child.coins }}</span>
        <button class="add-btn flex flex-center font-fredoka shadow-2">+</button>
      </div>

      <div class="stat-pill bg-white shadow-4 row items-center cursor-pointer" @click="store.playSfx('coin')">
        <span class="stat-icon icon-bounce">💎</span>
        <span class="text-weight-bolder font-fredoka text-dark q-mx-xs">{{ store.child.diamonds }}</span>
        <button class="add-btn flex flex-center font-fredoka shadow-2">+</button>
      </div>

      <!-- Action Icons: Sound, Gift & Bell Notifications -->
      <button
        class="icon-action-btn bg-purple-gradient text-white shadow-6 cursor-pointer"
        @click="store.toggleSound()"
        :title="store.soundMuted ? 'Nyalakan Musik' : 'Matikan Musik'"
      >
        {{ store.soundMuted ? '🔇' : '🎵' }}
      </button>

      <button class="icon-action-btn bg-pink-gradient text-white shadow-6 cursor-pointer" @click="store.playSfx('star')" title="Hadiah">
        🎁
        <span class="badge-count bg-amber-5 text-white flex flex-center font-fredoka shadow-2">3</span>
      </button>

      <button class="icon-action-btn bg-blue-gradient text-white shadow-6 cursor-pointer" @click="openDashboard" title="Dashboard Ortu">
        🔔
        <span class="badge-count bg-red text-white flex flex-center font-fredoka shadow-2">3</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useGameStore } from '../application/stores/gameStore';

const emit = defineEmits(['go-home', 'open-map', 'launch-game', 'open-game-picker']);
const store = useGameStore();

function openDashboard() {
  store.playSfx('whoosh');
  store.showParentDashboardModal = true;
}

function handleGoHome() {
  store.playSfx('click');
  emit('go-home');
}

function handleOpenMap() {
  store.playSfx('click');
  emit('open-map');
}

function handleLaunchGame() {
  store.playSfx('whoosh');
  emit('open-game-picker');
}
</script>

<style scoped>
.header-bar {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 10px 20px;
  min-height: 70px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 50;
  transition: all 0.3s ease;
}

.nav-shortcut-btn {
  padding: 6px 14px;
  border-radius: 16px;
  border: 2px solid #ffffff;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.nav-shortcut-btn:hover {
  transform: translateY(-2px) scale(1.05);
}

.bg-blue-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.bg-pink-btn { background: linear-gradient(135deg, #ec4899, #db2777); }
.bg-green-btn { background: linear-gradient(135deg, #22c55e, #16a34a); }

.profile-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 28px;
  border: 2.5px solid #ffffff;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.25) !important;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef08a, #fde047);
  border: 3px solid #3b82f6;
  overflow: visible;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.star-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  font-size: 13px;
  width: 20px;
  height: 20px;
  background: #eab308;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.level-pill {
  border-radius: 12px;
  font-size: 11px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 1px solid #fde047;
}

.xp-bar-bg {
  width: 100px;
  height: 10px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #f59e0b 100%);
  border-radius: 8px;
  transition: width 0.4s ease;
}

.stat-pill {
  padding: 5px 8px 5px 12px;
  border-radius: 22px;
  font-size: 15px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
}

.stat-icon {
  font-size: 20px;
}

.icon-bounce {
  transition: transform 0.2s ease;
}

.stat-pill:hover .icon-bounce {
  transform: scale(1.2) rotate(10deg);
}

.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: 1.5px solid white;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.15s ease;
}

.add-btn:hover {
  transform: scale(1.15);
}

.icon-action-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 20px;
  border: 2.5px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.icon-action-btn:hover {
  transform: translateY(-3px) scale(1.08);
}

.bg-purple-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  box-shadow: 0 6px 14px rgba(168, 85, 247, 0.35);
}

.bg-pink-gradient {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  box-shadow: 0 6px 14px rgba(236, 72, 153, 0.35);
}

.bg-blue-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.35);
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
  animation: pulse 1.5s infinite alternate;
}
</style>
