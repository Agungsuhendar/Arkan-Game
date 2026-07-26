<template>
  <div class="gameplay-canvas-wrapper column items-center justify-center q-pa-md">
    <!-- Game Header Navigation -->
    <div class="row items-center justify-between full-width q-mb-md" style="max-width: 900px;">
      <button class="btn-3d-cartoon btn-accent-pink" @click="handleExit">
        ✖️ Keluar Game
      </button>

      <div class="row q-gutter-x-sm">
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'MountainClimbScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('MountainClimbScene')"
        >
          🏔️ Gunung Prestasi
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'SpaceScienceScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('SpaceScienceScene')"
        >
          🚀 Planet Sains
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'AnimalIslandScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('AnimalIslandScene')"
        >
          🏝️ Pulau Hewan
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'CastlePuzzleScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('CastlePuzzleScene')"
        >
          🏰 Kastil Puzzle
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'ColorCityScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('ColorCityScene')"
        >
          🎨 Kota Warna
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'NumberGardenScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('NumberGardenScene')"
        >
          🌻 Kebun Angka
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'MatchLineGameScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('MatchLineGameScene')"
        >
          🔗 Tarik Garis
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'BalloonGameScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('BalloonGameScene')"
        >
          🎈 Letus Balon
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'FishRescueScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('FishRescueScene')"
        >
          🐠 Selamatkan Ikan
        </button>
        <button
          class="btn-3d-cartoon q-px-sm q-py-xs"
          :class="activeScene === 'BikeRaceScene' ? 'btn-primary-yellow' : 'btn-primary-blue'"
          @click="switchScene('BikeRaceScene')"
        >
          🚴 Balapan Sepeda
        </button>
      </div>

      <div class="stat-pill bg-amber-2 text-amber-10 text-bold text-subtitle1">
        🪙 Reward: +{{ store.currentLevel?.reward_coins || 20 }}
      </div>
    </div>

    <!-- Phaser 3 Canvas Container Mount Point -->
    <div id="phaser-game-mount" class="rounded-card-premium shadow-5 overflow-hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '../application/stores/gameStore';
import { PhaserGameManager } from '../game/PhaserGameManager';

const emit = defineEmits(['exit']);
const store = useGameStore();
const activeScene = ref<string>('MountainClimbScene');

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
.gameplay-canvas-wrapper {
  width: 100%;
  min-height: calc(100vh - 120px);
}

#phaser-game-mount {
  width: 900px;
  height: 600px;
  border: 6px solid #ffffff;
}
</style>
