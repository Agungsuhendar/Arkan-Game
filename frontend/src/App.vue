<template>
  <q-layout view="lHh Lpr lFf">
    <HeaderBar
      v-if="currentTab !== 'beranda' || store.isGameActive"
      :class="{ 'hide-on-mobile-catalog': currentTab === 'game' || currentTab === 'petualangan' }"
      @go-home="goHome"
      @open-map="openMap"
      @launch-game="(sceneKey) => launchDirectGame(sceneKey, 'katalog')"
      @open-game-picker="openCatalog"
    />

    <q-page-container>
      <!-- Mode 1: Gameplay Canvas (Phaser 3 Engine) -->
      <GameplayCanvas v-if="store.isGameActive" @exit="handleExitGame" />

      <!-- Mode 2: Full-Screen Game Catalog -->
      <GamePickerCatalog
        v-else-if="currentTab === 'game'"
        @back="goHome"
        @launch-game="(sceneKey) => launchDirectGame(sceneKey, 'katalog')"
        @open-drawing="showDrawing = true"
        @open-puzzle="showPuzzle = true"
        @open-voice-quiz="showVoiceQuiz = true"
        @open-story="showStory = true"
      />

      <!-- Mode 3: Adventure Map (7 Worlds + Special Mini Games) -->
      <AdventureMap
        v-else-if="currentTab === 'petualangan'"
        @back="goHome"
        @select-level="(sceneKey) => launchDirectGame(sceneKey, 'petualangan')"
        @open-drawing="showDrawing = true"
        @open-puzzle="showPuzzle = true"
        @open-voice-quiz="showVoiceQuiz = true"
        @open-story="showStory = true"
        @open-certificate="showCertificate = true"
      />

      <!-- Mode 4: Home Base Room (Beranda) -->
      <HomeBase
        v-else
        @open-map="openMap"
        @launch-game="(sceneKey) => launchDirectGame(sceneKey, 'katalog')"
        @open-game-picker="openCatalog"
        @open-wardrobe="showWardrobe = true"
        @open-story="showStory = true"
        @open-trophy="showTrophy = true"
        @open-drawing="showDrawing = true"
        @open-puzzle="showPuzzle = true"
        @open-voice-quiz="showVoiceQuiz = true"
        @open-family="store.showParentDashboardModal = true"
        @open-smart-talk="showSmartTalk = true"
      />
    </q-page-container>

    <!-- Modals & Global Audio -->
    <BackgroundAudio :pause-bgm="store.isGameActive || showStory || showVoiceQuiz || showDrawing || showPuzzle || showSmartTalk || showCertificate" />
    <ParentDashboardModal v-if="store.showParentDashboardModal" />
    <AvatarWardrobeModal v-if="showWardrobe" v-model="showWardrobe" />
    <BedtimeStoryModal v-if="showStory" v-model="showStory" />
    <TrophyRoomModal v-if="showTrophy" v-model="showTrophy" />
    <MagicDrawingModal v-if="showDrawing" v-model="showDrawing" />
    <JigsawPuzzleModal v-if="showPuzzle" v-model="showPuzzle" />
    <VoiceQuizModal v-if="showVoiceQuiz" v-model="showVoiceQuiz" />
    <SmartTalkingModal v-if="showSmartTalk" v-model="showSmartTalk" />
    <WorldCertificateModal v-if="showCertificate" v-model="showCertificate" />
    <PwaInstallPromptModal />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useGameStore } from './application/stores/gameStore';

import BackgroundAudio from './components/BackgroundAudio.vue';
import HeaderBar from './components/HeaderBar.vue';
import HomeBase from './components/HomeBase.vue';

// Lazy loaded async components for instant click responsiveness & fast bundle loading
const AdventureMap = defineAsyncComponent(() => import('./components/AdventureMap.vue'));
const GamePickerCatalog = defineAsyncComponent(() => import('./components/GamePickerCatalog.vue'));
const GameplayCanvas = defineAsyncComponent(() => import('./components/GameplayCanvas.vue'));
const ParentDashboardModal = defineAsyncComponent(() => import('./components/ParentDashboardModal.vue'));
const AvatarWardrobeModal = defineAsyncComponent(() => import('./components/AvatarWardrobeModal.vue'));
const BedtimeStoryModal = defineAsyncComponent(() => import('./components/BedtimeStoryModal.vue'));
const TrophyRoomModal = defineAsyncComponent(() => import('./components/TrophyRoomModal.vue'));
const MagicDrawingModal = defineAsyncComponent(() => import('./components/MagicDrawingModal.vue'));
const JigsawPuzzleModal = defineAsyncComponent(() => import('./components/JigsawPuzzleModal.vue'));
const VoiceQuizModal = defineAsyncComponent(() => import('./components/VoiceQuizModal.vue'));
const SmartTalkingModal = defineAsyncComponent(() => import('./components/SmartTalkingModal.vue'));
const WorldCertificateModal = defineAsyncComponent(() => import('./components/WorldCertificateModal.vue'));
const PwaInstallPromptModal = defineAsyncComponent(() => import('./components/PwaInstallPromptModal.vue'));

const store = useGameStore();
const currentTab = ref<'beranda' | 'game' | 'petualangan'>('beranda');
const entrySource = ref<'katalog' | 'petualangan'>('katalog');

const showWardrobe = ref(false);
const showStory = ref(false);
const showTrophy = ref(false);
const showDrawing = ref(false);
const showPuzzle = ref(false);
const showVoiceQuiz = ref(false);
const showSmartTalk = ref(false);
const showCertificate = ref(false);

const launchDirectGame = (sceneKey?: string, source: 'katalog' | 'petualangan' = 'katalog') => {
  entrySource.value = source;
  const targetScene = sceneKey || 'NumberGardenScene';
  store.startLevel('lvl_1', targetScene);
  store.isGameActive = true;
};

const handleExitGame = () => {
  store.isGameActive = false;
  if (entrySource.value === 'petualangan') {
    currentTab.value = 'petualangan';
  } else {
    currentTab.value = 'game';
  }
};

const openMap = () => {
  currentTab.value = 'petualangan';
  store.isGameActive = false;
};

const openCatalog = () => {
  currentTab.value = 'game';
  store.isGameActive = false;
};

const goHome = () => {
  currentTab.value = 'beranda';
  store.isGameActive = false;
};

onMounted(() => {
  store.fetchWorlds();
  store.fetchChildProfile();
});
</script>

<style>
/* App Layout Custom Global Styles */
@media (max-width: 600px) {
  .hide-on-mobile-catalog {
    display: none !important;
  }
}
</style>
