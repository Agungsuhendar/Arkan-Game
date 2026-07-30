<template>
  <q-dialog v-model="store.showParentDashboardModal" persistent transition-show="scale" transition-hide="scale">
    <q-card class="parent-dashboard-card font-quicksand text-white column no-wrap shadow-24">
      <!-- Modal Header -->
      <div class="row items-center justify-between q-pa-md dashboard-header">
        <div class="row items-center q-gutter-x-sm">
          <span class="text-h4">👨‍👩‍👧✨</span>
          <div>
            <div class="text-h5 font-fredoka text-bold text-amber-3">
              Dashboard Keluarga & Ortu: {{ analytics?.child_name || store.child.name || 'Arkan' }}
            </div>
            <div class="text-caption text-purple-2 font-fredoka">
              Pantau perkembangan belajar, kelola batas waktu bermain & unduh sertifikat!
            </div>
          </div>
        </div>
        <button class="btn-close-fullscreen flex flex-center shadow-4" @click="store.showParentDashboardModal = false">
          ✕
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="tab-row row justify-center q-px-md q-pt-xs q-gutter-x-sm">
        <button
          class="tab-btn font-fredoka row items-center q-px-md q-py-sm"
          :class="{ active: activeTab === 'report' }"
          @click="activeTab = 'report'"
        >
          <span class="q-mr-xs">📊</span> Laporan Perkembangan
        </button>
        <button
          class="tab-btn font-fredoka row items-center q-px-md q-py-sm"
          :class="{ active: activeTab === 'timer' }"
          @click="activeTab = 'timer'"
        >
          <span class="q-mr-xs">⏱️</span> Batas Waktu Layar
        </button>
        <button
          class="tab-btn font-fredoka row items-center q-px-md q-py-sm"
          :class="{ active: activeTab === 'certificate' }"
          @click="activeTab = 'certificate'"
        >
          <span class="q-mr-xs">📜</span> Sertifikat & Hadiah
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="dashboard-body q-pa-md col overflow-auto">
        <!-- TAB 1: REPORT & ANALYTICS -->
        <div v-if="activeTab === 'report'" class="column q-gutter-y-md">
          <!-- Summary Cards Grid -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-3">
              <div class="stat-card bg-blue-glow column items-center q-pa-md text-center">
                <span class="stat-icon">⏱️</span>
                <span class="text-caption text-bold text-blue-2 q-mt-xs">Lama Bermain</span>
                <span class="text-h5 font-fredoka text-bold text-white">{{ analytics?.total_playtime_minutes || 45 }} Menit</span>
              </div>
            </div>
            <div class="col-12 col-sm-3">
              <div class="stat-card bg-amber-glow column items-center q-pa-md text-center">
                <span class="stat-icon">⭐</span>
                <span class="text-caption text-bold text-amber-2 q-mt-xs">Total Bintang</span>
                <span class="text-h5 font-fredoka text-bold text-amber-3">{{ analytics?.total_stars || store.child.xp || 18 }}</span>
              </div>
            </div>
            <div class="col-12 col-sm-3">
              <div class="stat-card bg-green-glow column items-center q-pa-md text-center">
                <span class="stat-icon">🏆</span>
                <span class="text-caption text-bold text-green-2 q-mt-xs">Level Belajar</span>
                <span class="text-h5 font-fredoka text-bold text-emerald-3">Level {{ store.child.level }}</span>
              </div>
            </div>
            <div class="col-12 col-sm-3">
              <div class="stat-card bg-purple-glow column items-center q-pa-md text-center">
                <span class="stat-icon">🌟</span>
                <span class="text-caption text-bold text-purple-2 q-mt-xs">Status Anak</span>
                <span class="text-h6 font-fredoka text-bold text-purple-2">Sangat Baik</span>
              </div>
            </div>
          </div>

          <!-- PAUD Categories Progress -->
          <div class="analytics-box q-pa-md shadow-6">
            <div class="text-subtitle1 font-fredoka text-bold text-amber-3 q-mb-md row items-center">
              <span class="q-mr-xs">🎯</span> Analytics Aspek Perkembangan PAUD (Kurikulum Merdeka Play):
            </div>

            <div class="column q-gutter-y-md">
              <div v-for="item in displayCategories" :key="item.category" class="category-row">
                <div class="row justify-between items-center q-mb-xs">
                  <div class="row items-center">
                    <span class="cat-emoji q-mr-xs">{{ item.emoji }}</span>
                    <span class="font-fredoka text-bold text-white">{{ item.category }}</span>
                  </div>
                  <span class="text-caption text-bold font-fredoka" :style="{ color: item.badgeColor }">
                    {{ item.score_percentage }}% ({{ item.total_levels_completed }} Level Selesai)
                  </span>
                </div>
                <div class="progress-track shadow-inner">
                  <div
                    class="progress-bar-fill"
                    :style="{ width: `${item.score_percentage}%`, background: item.gradient }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: SCREEN TIME CONTROL -->
        <div v-else-if="activeTab === 'timer'" class="column q-gutter-y-md">
          <div class="analytics-box q-pa-md text-center column items-center">
            <span class="text-h3 animate-pulse q-mb-xs">⌛</span>
            <div class="text-h5 font-fredoka text-bold text-amber-3">Pengaturan Batas Waktu Bermain</div>
            <div class="text-caption text-purple-2 q-mb-md">
              Atur berapa lama anak dapat bermain Arkan Game secara aman setiap harinya.
            </div>

            <div class="row q-gutter-md justify-center q-mb-md">
              <button
                v-for="opt in timeLimitOptions"
                :key="opt.value"
                class="time-option-card column items-center justify-center q-pa-md"
                :class="{ active: selectedTimeLimit === opt.value }"
                @click="setTimeLimit(opt.value)"
              >
                <span class="text-h4 q-mb-xs">{{ opt.icon }}</span>
                <span class="font-fredoka text-bold text-white">{{ opt.label }}</span>
                <span class="text-caption text-purple-2">{{ opt.desc }}</span>
              </button>
            </div>

            <!-- Reminder Notification Toggle -->
            <div class="row items-center justify-between toggle-reminder-box q-pa-md fit shadow-4">
              <div class="row items-center q-gutter-x-sm">
                <span class="text-h5">🔔</span>
                <div class="text-left">
                  <div class="font-fredoka text-bold text-white">Notifikasi Pengingat Istirahat</div>
                  <div class="text-caption text-purple-2">Kirim pesan ramah dari Arkan jika waktu bermain hampir habis</div>
                </div>
              </div>
              <q-toggle v-model="breakReminderEnabled" color="amber" size="lg" />
            </div>
          </div>
        </div>

        <!-- TAB 3: CERTIFICATE & REWARDS -->
        <div v-else-if="activeTab === 'certificate'" class="column items-center justify-center q-gutter-y-md">
          <div class="certificate-preview-card column items-center text-center q-pa-lg shadow-16 fit">
            <div class="cert-border-gold fit column items-center q-pa-md">
              <span class="text-h3 q-mb-xs">📜 🏆 🌟</span>
              <div class="text-h4 font-fredoka text-bold text-amber-4">SERTIFIKAT PRESTASI BELAJAR</div>
              <div class="text-caption text-amber-2 q-mb-sm">Diberikan dengan bangga kepada:</div>
              <div class="text-h3 font-fredoka text-bold text-white cert-child-name shadow-text q-my-xs">
                {{ analytics?.child_name || store.child.name || 'Arkan' }}
              </div>
              <div class="text-subtitle1 font-quicksand text-purple-1 q-mb-md">
                Telah berhasil menyelesaikan level pembelajaran interaktif dengan hasil <b>SANGAT BAIK</b> pada Aplikasi Arkan Game!
              </div>

              <div class="row q-gutter-x-lg text-bold font-fredoka text-amber-3 text-subtitle1 q-mb-md">
                <span>⭐ {{ analytics?.total_stars || store.child.xp || 18 }} Bintang Kebanggaan</span>
                <span>🏅 Level {{ store.child.level }} Juara Cilik</span>
              </div>

              <button class="btn-cert-download font-fredoka row items-center q-px-lg q-py-sm shadow-6" @click="downloadCertificate">
                📥 Unduh / Cetak Sertifikat Ini
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="row justify-between items-center q-pa-md dashboard-footer">
        <div class="text-caption text-purple-2 font-fredoka">
          🔒 Dilindungi PIN Orang Tua • Modul Pembelajaran PAUD Anak
        </div>
        <button class="btn-close-main font-fredoka shadow-4" @click="store.showParentDashboardModal = false">
          Tutup Dashboard
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';
import { gameApi } from '../services/api';
import { ParentAnalytics } from '../domain/types';

const store = useGameStore();
const analytics = ref<ParentAnalytics | null>(null);
const activeTab = ref<'report' | 'timer' | 'certificate'>('report');
const selectedTimeLimit = ref<number>(30);
const breakReminderEnabled = ref<boolean>(true);

const timeLimitOptions = [
  { value: 15, label: '15 Menit', icon: '⚡', desc: 'Ringkas & fokus' },
  { value: 30, label: '30 Menit', icon: '⏱️', desc: 'Ideal harian' },
  { value: 60, label: '60 Menit', icon: '⌛', desc: 'Sesi panjang' },
  { value: 0, label: 'Tanpa Batas', icon: '♾️', desc: 'Bebas ekspresi' }
];

const defaultCategories = [
  { category: 'Kemampuan Kognitif & Berpikir', emoji: '🧠', score_percentage: 88, total_levels_completed: 6, badgeColor: '#38bdf8', gradient: 'linear-gradient(90deg, #0284c7, #38bdf8)' },
  { category: 'Pengembangan Bahasa & Suara', emoji: '🎙️', score_percentage: 92, total_levels_completed: 5, badgeColor: '#f59e0b', gradient: 'linear-gradient(90deg, #d97706, #fbbf24)' },
  { category: 'Motorik Halus & Melukis', emoji: '🎨', score_percentage: 80, total_levels_completed: 4, badgeColor: '#ec4899', gradient: 'linear-gradient(90deg, #db2777, #f472b6)' },
  { category: 'Sosio-Emosional & Kemandirian', emoji: '💖', score_percentage: 95, total_levels_completed: 7, badgeColor: '#10b981', gradient: 'linear-gradient(90deg, #059669, #34d399)' }
];

const displayCategories = computed(() => {
  if (!analytics.value?.categories || analytics.value.categories.length === 0) {
    return defaultCategories;
  }
  return analytics.value.categories.map((c, i) => {
    const def = defaultCategories[i % defaultCategories.length];
    return {
      category: c.category || def.category,
      emoji: def.emoji,
      score_percentage: c.score_percentage || def.score_percentage,
      total_levels_completed: c.total_levels_completed || def.total_levels_completed,
      badgeColor: def.badgeColor,
      gradient: def.gradient
    };
  });
});

onMounted(async () => {
  try {
    analytics.value = await gameApi.getParentAnalytics(store.child.id);
  } catch (e) {
    console.log('Using default analytics');
  }
});

const setTimeLimit = (val: number) => {
  selectedTimeLimit.value = val;
  store.playSfx('pop');
};

const downloadCertificate = () => {
  store.playSfx('win');
  const childName = analytics.value?.child_name || store.child.name || 'Arkan';
  alert(`🏆 Sertifikat Prestasi Belajar "${childName}" berhasil disiapkan untuk dicetak!`);
};
</script>

<style scoped>
.parent-dashboard-card {
  width: 820px;
  max-width: 95vw;
  max-height: 90vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #4a148c 100%);
  border-radius: 28px;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.dashboard-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.dashboard-footer {
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-close-fullscreen {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-close-fullscreen:hover {
  transform: scale(1.1);
  background: rgba(239, 68, 68, 0.8);
}

.tab-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px 16px 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: white;
}

.tab-btn.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: #fde047;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.stat-card {
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.stat-icon {
  font-size: 2rem;
}

.bg-blue-glow { background: rgba(14, 165, 233, 0.2); border-color: rgba(56, 189, 248, 0.4); }
.bg-amber-glow { background: rgba(245, 158, 11, 0.2); border-color: rgba(251, 191, 36, 0.4); }
.bg-green-glow { background: rgba(16, 185, 129, 0.2); border-color: rgba(52, 211, 153, 0.4); }
.bg-purple-glow { background: rgba(168, 85, 247, 0.2); border-color: rgba(192, 132, 252, 0.4); }

.analytics-box {
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
}

.progress-track {
  width: 100%;
  height: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.time-option-card {
  width: 150px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-option-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.15);
}

.time-option-card.active {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #6ee7b7;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.toggle-reminder-box {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

.certificate-preview-card {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 24px;
}

.cert-border-gold {
  border: 4px dashed #fbbf24;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.05);
}

.cert-child-name {
  color: #fde047;
  text-shadow: 0 0 12px rgba(253, 224, 71, 0.6);
}

.btn-cert-download {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 2px solid #fde047;
  color: white;
  border-radius: 20px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-cert-download:hover {
  transform: scale(1.05);
}

.btn-close-main {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: 2px solid #93c5fd;
  color: white;
  padding: 8px 24px;
  border-radius: 16px;
  cursor: pointer;
}
</style>
