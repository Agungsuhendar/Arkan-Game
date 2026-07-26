<template>
  <div class="adventure-map q-pa-md">
    <!-- Map Header -->
    <div class="row items-center justify-between q-mb-md">
      <button class="btn-3d-cartoon btn-primary-blue" @click="$emit('back')">
        ⬅️ Kembali ke Rumah
      </button>
      <div class="text-h4 text-bold text-primary font-fredoka">
        🗺️ Peta Dunia Petualangan Arkan
      </div>
      <div class="stat-pill bg-amber-2 text-amber-10 text-bold text-subtitle1">
        ⭐ Total Bintang: {{ store.child.xp }}
      </div>
    </div>

    <!-- 7 Worlds Grid -->
    <div class="row q-col-gutter-lg">
      <div
        v-for="world in store.worlds"
        :key="world.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <div
          class="rounded-card-premium world-card q-pa-md text-center cursor-pointer relative-position"
          @click="handleSelectWorld(world)"
        >
          <div class="world-icon text-center q-my-sm floating-element">
            {{ getWorldEmoji(world.code) }}
          </div>
          <div class="text-h6 text-bold text-primary font-fredoka">
            {{ world.name }}
          </div>
          <div class="text-caption text-grey-7 q-mb-sm">
            {{ world.description }}
          </div>
          <div class="row justify-between items-center bg-blue-1 rounded-borders q-pa-xs">
            <span class="text-caption text-bold text-primary">👑 Boss: {{ world.boss_name }}</span>
            <span class="text-caption text-bold text-amber-9">3/3 ⭐</span>
          </div>
          
          <button class="btn-3d-cartoon btn-primary-yellow full-width q-mt-md">
            Main Sekarang ▶️
          </button>
        </div>
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
  };
  return map[code] || '🌟';
};

const handleSelectWorld = (world: World) => {
  store.selectWorld(world);
  // Default to Level 1 in Hutan Huruf
  store.startLevel('lvl_1');
  emit('select-level');
};
</script>

<style scoped>
.world-card {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.world-icon {
  font-size: 64px;
}
</style>
