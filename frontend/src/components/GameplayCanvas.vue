<template>
  <div class="gameplay-canvas-fullscreen column relative-position overflow-hidden">
    <!-- Clean Non-Overlapping Top Header Bar -->
    <div class="gameplay-header-bar row items-center justify-between q-px-lg">
      <button class="btn-3d-cartoon btn-accent-pink shadow-4 btn-exit-game" @click="handleExit">
        ✖️ Keluar Game
      </button>

      <div class="active-game-title font-fredoka text-bold text-white text-h6 title-glow-3d row items-center gap-xs">
        <span>{{ activeSceneTitle }}</span>
      </div>

      <div class="stat-pill bg-amber-5 text-white font-fredoka text-bold shadow-4 q-px-md q-py-xs rounded-borders">
        🪙 +{{ store.currentLevel?.reward_coins || 20 }}
      </div>
    </div>

    <!-- Phaser 3 Canvas Container (Mounted cleanly BELOW header bar) -->
    <div id="phaser-game-mount" class="full-screen-canvas-container col"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '../application/stores/gameStore';
import { PhaserGameManager } from '../game/PhaserGameManager';

const emit = defineEmits(['exit']);
const store = useGameStore();
const activeScene = ref<string>(store.activeSceneKey || 'NumberGardenScene');

const sceneTitles: Record<string, string> = {
  BikeRaceScene: '🚴 Balap Sepeda Arkan',
  BalloonGameScene: '🎈 Pop Balon Huruf & Angka',
  FishRescueScene: '🐠 Penyelamatan Ikan Laut',
  MusicStudioScene: '🎵 Studio Pianika & Musik',
  SpellingGardenScene: '🔤 Taman Ejaan Kata',
  NumberGardenScene: '🍉 Kebun Angka & Berhitung',
  MatchLineGameScene: '🎯 Tarik Garis Cocokkan',
  ColorCityScene: '🎨 Kota Warna & Bentuk',
  AnimalIslandScene: '🦁 Pulau Satwa & Suara',
  CastlePuzzleScene: '🏰 Kastil Puzzle Logika',
  SpaceScienceScene: '🚀 Sains Luar Angkasa',
  MountainClimbScene: '🏆 Panjat Gunung XP',
};

const activeSceneTitle = computed(() => sceneTitles[activeScene.value] || '🎮 Game Petualangan Arkan');

const launchCurrentScene = () => {
  const prompt = store.currentLevel?.questions[0]?.prompt_text || 'Ayo main bersama Arkan!';
  PhaserGameManager.launch('phaser-game-mount', activeScene.value, {
    promptText: prompt,
    targetLetter: 'A',
    distractors: ['B', 'C', 'D'],
    category: 'huruf',
    onFinish: (stars: number, score: number) => {
      store.completeLevel(stars, score, 45, 'huruf');
      emit('exit');
    }
  });
};

onMounted(() => {
  launchCurrentScene();
});

onBeforeUnmount(() => {
  PhaserGameManager.stop();
});

const handleExit = () => {
  PhaserGameManager.stop();
  store.isGameActive = false;
  emit('exit');
};
</script>

<style scoped>
.gameplay-canvas-fullscreen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background-color: #0f172a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gameplay-header-bar {
  height: 60px;
  min-height: 60px;
  max-height: 60px;
  flex-shrink: 0;
  z-index: 1010;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.btn-exit-game {
  font-size: 13px;
  padding: 6px 14px;
}

.title-glow-3d {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.full-screen-canvas-container {
  flex: 1;
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  overflow: hidden;
}

:deep(#phaser-game-mount canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

@media (max-width: 600px) {
  .gameplay-header-bar {
    height: 48px;
    min-height: 48px;
    max-height: 48px;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  .full-screen-canvas-container {
    height: calc(100vh - 48px);
  }
  .btn-exit-game {
    font-size: 11px;
    padding: 4px 8px;
  }
  .active-game-title {
    font-size: 13px !important;
  }
  .stat-pill {
    font-size: 11px !important;
    padding: 3px 8px !important;
  }
}
</style>
