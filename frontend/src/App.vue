<template>
  <q-layout view="lHh Lpr lFf">
    <HeaderBar v-if="currentTab !== 'beranda'" />

    <q-page-container>
      <!-- Mode 1: Gameplay Canvas (Phaser 3 Engine) -->
      <GameplayCanvas v-if="store.isGameActive" @exit="store.isGameActive = false" />

      <!-- Mode 2: Adventure Map (7 Worlds) -->
      <AdventureMap v-else-if="currentTab === 'petualangan'" @back="currentTab = 'beranda'" @select-level="() => store.isGameActive = true" />

      <!-- Mode 3: Home Base Room (Beranda) -->
      <HomeBase
        v-else
        @open-map="currentTab = 'petualangan'"
        @open-wardrobe="showWardrobe = true"
        @open-story="showStory = true"
        @open-trophy="showTrophy = true"
      />
    </q-page-container>

    <!-- Modals & Global Audio -->
    <BackgroundAudio />
    <ParentDashboardModal />
    <AvatarWardrobeModal v-model="showWardrobe" />
    <BedtimeStoryModal v-model="showStory" />
    <TrophyRoomModal v-model="showTrophy" />
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
const GameplayCanvas = defineAsyncComponent(() => import('./components/GameplayCanvas.vue'));
const ParentDashboardModal = defineAsyncComponent(() => import('./components/ParentDashboardModal.vue'));
const AvatarWardrobeModal = defineAsyncComponent(() => import('./components/AvatarWardrobeModal.vue'));
const BedtimeStoryModal = defineAsyncComponent(() => import('./components/BedtimeStoryModal.vue'));
const TrophyRoomModal = defineAsyncComponent(() => import('./components/TrophyRoomModal.vue'));

const store = useGameStore();
const currentTab = ref<'beranda' | 'game' | 'petualangan'>('beranda');

const showWardrobe = ref(false);
const showStory = ref(false);
const showTrophy = ref(false);

onMounted(() => {
  store.fetchWorlds();
  store.fetchChildProfile();
});
</script>

<style>
/* App Layout Custom Global Styles */
</style>
