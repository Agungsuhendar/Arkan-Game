<template>
  <header class="header-bar row items-center justify-between q-px-md q-py-sm">
    <!-- Left: Arkan Profile Card -->
    <div class="profile-card row items-center q-px-md q-py-xs shadow-2">
      <div class="avatar-circle relative-position q-mr-sm shadow-2">
        <img src="/arkan_avatar_card.png" class="avatar-img" alt="Arkan Avatar" />
        <div class="star-badge flex flex-center">⭐</div>
      </div>
      <div class="profile-info">
        <div class="row items-center q-gutter-x-xs">
          <span class="text-bold text-dark text-subtitle1 font-fredoka">{{ store.child.name }}</span>
          <span class="level-pill bg-amber-5 text-white font-fredoka text-caption text-bold q-px-xs rounded-borders">
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

    <!-- Center/Right Stats & Quick Action Badges -->
    <div class="row items-center q-gutter-x-sm">
      <!-- Currency Pills with (+) buttons -->
      <div class="stat-pill bg-white shadow-2 row items-center">
        <span class="stat-icon">⭐</span>
        <span class="text-weight-bolder font-fredoka text-dark q-mx-xs">{{ store.child.xp }}</span>
        <button class="add-btn flex flex-center">+</button>
      </div>

      <div class="stat-pill bg-white shadow-2 row items-center">
        <span class="stat-icon">🪙</span>
        <span class="text-weight-bolder font-fredoka text-dark q-mx-xs">{{ store.child.coins }}</span>
        <button class="add-btn flex flex-center">+</button>
      </div>

      <div class="stat-pill bg-white shadow-2 row items-center">
        <span class="stat-icon">💎</span>
        <span class="text-weight-bolder font-fredoka text-dark q-mx-xs">{{ store.child.diamonds }}</span>
        <button class="add-btn flex flex-center">+</button>
      </div>

      <!-- Action Icons: Sound, Gift & Bell Notifications -->
      <button class="icon-action-btn bg-purple-gradient text-white shadow-3 cursor-pointer" @click="store.toggleSound()" :title="store.soundMuted ? 'Nyalakan Musik' : 'Matikan Musik'">
        {{ store.soundMuted ? '🔇' : '🎵' }}
      </button>

      <button class="icon-action-btn bg-pink-gradient text-white shadow-3 cursor-pointer" @click="store.playSfx('star')" title="Hadiah">
        🎁
        <span class="badge-count bg-amber-5 text-white flex flex-center">3</span>
      </button>

      <button class="icon-action-btn bg-blue-gradient text-white shadow-3 cursor-pointer" @click="openDashboard" title="Notifikasi">
        🔔
        <span class="badge-count bg-red text-white flex flex-center">3</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useGameStore } from '../application/stores/gameStore';

const store = useGameStore();

function openDashboard() {
  store.playSfx('whoosh');
  store.showParentDashboardModal = true;
}
</script>

<style scoped>
.header-bar {
  background: transparent;
  padding: 8px 16px;
  min-height: 64px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 2px solid #ffffff;
}

.avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fef08a;
  border: 2px solid #3b82f6;
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
  font-size: 12px;
  width: 18px;
  height: 18px;
  background: #eab308;
  border-radius: 50%;
  border: 1px solid white;
}

.level-pill {
  border-radius: 12px;
  font-size: 11px;
}

.xp-bar-bg {
  width: 90px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.stat-pill {
  padding: 4px 6px 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  border: 2px solid #f1f5f9;
}

.stat-icon {
  font-size: 18px;
}

.add-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}

.icon-action-btn {
  width: 44px;
  height: 44px;
  border-radius: 18px;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
}

.bg-purple-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
}

.bg-pink-gradient {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.bg-blue-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid white;
}
</style>
