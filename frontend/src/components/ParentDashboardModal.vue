<template>
  <q-dialog v-model="store.showParentDashboardModal" persistent transition-show="scale" transition-hide="scale">
    <q-card class="rounded-card-premium parent-dashboard-card q-pa-lg">
      <!-- Modal Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-bold text-primary font-fredoka">
          👨‍👩‍👧 Dashboard Perkembangan Belajar {{ analytics?.child_name || 'Arkan' }}
        </div>
        <q-btn flat round dense icon="close" color="primary" @click="store.showParentDashboardModal = false" />
      </div>

      <!-- Stats Summary Cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-md-3">
          <div class="bg-blue-1 rounded-card-premium q-pa-md text-center">
            <div class="text-caption text-bold text-grey-7">Lama Bermain</div>
            <div class="text-h5 text-bold text-primary">{{ analytics?.total_playtime_minutes || 45 }} Mins</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="bg-amber-1 rounded-card-premium q-pa-md text-center">
            <div class="text-caption text-bold text-grey-7">Total Bintang</div>
            <div class="text-h5 text-bold text-amber-10">⭐ {{ analytics?.total_stars || 18 }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="bg-green-1 rounded-card-premium q-pa-md text-center">
            <div class="text-caption text-bold text-grey-7">Level Saat Ini</div>
            <div class="text-h5 text-bold text-positive">Level {{ store.child.level }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="bg-purple-1 rounded-card-premium q-pa-md text-center">
            <div class="text-caption text-bold text-grey-7">Status Perkembangan</div>
            <div class="text-h6 text-bold text-purple">Sangat Baik 🌟</div>
          </div>
        </div>
      </div>

      <!-- Skill Categories Progress Bars -->
      <div class="text-subtitle1 text-bold text-grey-9 q-mb-sm">
        📊 Analytics Aspek Perkembangan Anak (PAUD Curriculum):
      </div>

      <div v-for="item in analytics?.categories || []" :key="item.category" class="q-mb-sm">
        <div class="row justify-between items-center q-mb-xs">
          <span class="text-bold text-primary font-fredoka">{{ item.category }}</span>
          <span class="text-bold text-grey-8">{{ item.score_percentage }}% ({{ item.total_levels_completed }} level)</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${item.score_percentage}%` }"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row justify-end q-gutter-x-md q-mt-lg">
        <button class="btn-3d-cartoon btn-primary-blue" @click="downloadCertificate">
          🏆 Download Sertifikat
        </button>
        <button class="btn-3d-cartoon btn-primary-yellow" @click="store.showParentDashboardModal = false">
          Tutup Dashboard
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';
import { gameApi } from '../services/api';
import { ParentAnalytics } from '../domain/types';

const store = useGameStore();
const analytics = ref<ParentAnalytics | null>(null);

onMounted(async () => {
  analytics.value = await gameApi.getParentAnalytics(store.child.id);
});

const downloadCertificate = () => {
  const childName = analytics.value?.child_name || store.child.name;
  alert(`🏆 Sertifikat Prestasi Belajar ${childName} berhasil di-generate!`);
};
</script>

<style scoped>
.parent-dashboard-card {
  width: 750px;
  max-width: 95vw;
}

.progress-bg {
  width: 100%;
  height: 14px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #06d6a0);
  transition: width 0.4s ease;
}
</style>
