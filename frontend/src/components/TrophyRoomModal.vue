<template>
  <q-dialog v-model="isOpen" transition-show="scale" transition-hide="scale">
    <q-card class="rounded-card-premium trophy-modal q-pa-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-bold text-primary font-fredoka">
          🏆 Kamar Piala & Koleksi Hadiah Arkan
        </div>
        <q-btn flat round dense icon="close" color="primary" @click="isOpen = false" />
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="trophy in trophies" :key="trophy.name" class="col-6 col-sm-4">
          <div class="rounded-card-premium trophy-card q-pa-md text-center">
            <div class="text-h3 floating-element">{{ trophy.icon }}</div>
            <div class="text-subtitle2 text-bold text-primary q-mt-xs">{{ trophy.name }}</div>
            <div class="text-caption text-grey-7">{{ trophy.desc }}</div>
          </div>
        </div>
      </div>

      <div class="row justify-end q-mt-md">
        <button class="btn-3d-cartoon btn-primary-yellow" @click="isOpen = false">
          Tutup Koleksi
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const trophies = [
  { name: 'Mahkota Raja Huruf', icon: '👑', desc: 'Selesai Hutan Huruf' },
  { name: 'Piala Master Hitung', icon: '🏆', desc: 'Selesai Kebun Angka' },
  { name: 'Astronaut Roket', icon: '🚀', desc: 'Eksplorasi Planet Sains' },
  { name: 'Piala Top Learner', icon: '⭐', desc: 'Bintang 100+' },
  { name: 'Medali Petualang', icon: '🥇', desc: 'Misi Harian 7 Hari' },
  { name: 'Sertifikat Pintar', icon: '📜', desc: 'Lulus Ujian Dunia' },
];
</script>

<style scoped>
.trophy-modal {
  width: 680px;
  max-width: 95vw;
}

.trophy-card {
  background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
}
</style>
