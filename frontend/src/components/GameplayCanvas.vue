<template>
  <div class="gameplay-canvas-fullscreen relative-position">
    <!-- Floating Overlay Top Bar -->
    <div class="gameplay-header-overlay row items-center justify-between q-px-lg q-py-sm">
      <button class="btn-3d-cartoon btn-accent-pink shadow-4" @click="handleExit">
        ✖️ Keluar Game
      </button>

      <div class="scenes-scroll-row row items-center q-gutter-x-xs no-wrap overflow-auto">
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'MountainClimbScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('MountainClimbScene')"
        >
          🏔️ Gunung
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'SpaceScienceScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('SpaceScienceScene')"
        >
          🚀 Sains
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'AnimalIslandScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('AnimalIslandScene')"
        >
          🏝️ Hewan
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'CastlePuzzleScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('CastlePuzzleScene')"
        >
          🏰 Kastil
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'ColorCityScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('ColorCityScene')"
        >
          🎨 Warna
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'NumberGardenScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('NumberGardenScene')"
        >
          🌻 Angka
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'MatchLineGameScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('MatchLineGameScene')"
        >
          🔗 Garis
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'BalloonGameScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('BalloonGameScene')"
        >
          🎈 Balon
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'FishRescueScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('FishRescueScene')"
        >
          🐠 Ikan
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'BikeRaceScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('BikeRaceScene')"
        >
          🚴 Sepeda
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'MusicStudioScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('MusicStudioScene')"
        >
          🎵 Musik
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs text-caption"
          :class="activeScene === 'SpellingGardenScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('SpellingGardenScene')"
        >
          🔤 Ejaan
        </button>
      </div>

      <div class="stat-pill bg-amber-5 text-white font-fredoka text-bold shadow-4 q-px-md q-py-xs rounded-borders">
        🪙 +{{ store.currentLevel?.reward_coins || 20 }}
      </div>
    </div>

    <!-- Phaser 3 Canvas Container Mount Point (Full Screen) -->
    <div id="phaser-game-mount" class="full-screen-canvas-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '../application/stores/gameStore';
import { PhaserGameManager } from '../game/PhaserGameManager';

const emit = defineEmits(['exit']);
const store = useGameStore();
const activeScene = ref<string>(store.activeSceneKey || 'MountainClimbScene');

const launchCurrentScene = () => {
  const prompt = store.currentLevel?.questions[0]?.prompt_text || 'Tolong Arkan selamatkan ikan dari jaring!';
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

const switchScene = (sceneKey: string) => {
  activeScene.value = sceneKey;
  launchCurrentScene();
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
  overflow: hidden;
}

.gameplay-header-overlay {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  z-index: 1010;
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
}

.scenes-scroll-row::-webkit-scrollbar {
  display: none;
}

.full-screen-canvas-container {
  width: 100%;
  height: 100%;
}

:deep(#phaser-game-mount canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
