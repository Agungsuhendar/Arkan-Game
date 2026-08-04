<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="certificate-modal-card font-quicksand q-pa-lg text-dark column no-wrap shadow-24 relative-position overflow-hidden">
      <!-- Top Action Bar -->
      <div class="row items-center justify-between q-mb-md header-bar relative-position z-top">
        <div class="row items-center q-gutter-x-sm text-white font-fredoka">
          <span class="text-h5">📜✨ Sertifikat Penghargaan Arkan-Game</span>
        </div>
        <button class="btn-close-fullscreen flex flex-center shadow-4" @click="closeModal" title="Tutup Sertifikat">✕</button>
      </div>

      <!-- Printable Certificate Paper Container -->
      <div id="printable-certificate" ref="certificateRef" class="certificate-paper column items-center text-center q-pa-xl relative-position shadow-12">
        <!-- Gold Luxury Border Frame -->
        <div class="gold-border-frame"></div>
        <div class="corner-ornament top-left">👑</div>
        <div class="corner-ornament top-right">👑</div>
        <div class="corner-ornament bottom-left">⭐</div>
        <div class="corner-ornament bottom-right">⭐</div>

        <!-- Certificate Header -->
        <div class="row items-center justify-center q-gutter-x-sm q-mb-xs">
          <img src="/arkan_character.png" class="cert-avatar" alt="Arkan" />
          <span class="cert-title font-fredoka text-bold text-amber-9">SERTIFIKAT KELULUSAN</span>
        </div>
        <div class="cert-subtitle font-fredoka text-subtitle1 text-purple-9 text-bold">
          Diberikan Kepada Bintang Kecil Hebat:
        </div>

        <!-- Student / Child Name -->
        <div class="student-name font-fredoka text-h3 text-bold text-amber-10 q-my-sm glow-gold-text">
          {{ childName }}
        </div>

        <div class="cert-body-text text-body1 font-quicksand text-bold text-grey-9 q-px-lg">
          Atas keberhasilan luar biasa dan kegigihan menyelesaikan seluruh tantangan edukasi di:
        </div>

        <!-- Completed World Badge -->
        <div class="world-title-badge font-fredoka text-h5 text-white bg-purple-9 q-px-lg q-py-xs rounded-borders shadow-4 q-my-md">
          🌍 {{ worldName }}
        </div>

        <div class="row items-center justify-center q-gutter-x-md text-amber-9 text-bold font-fredoka text-h6 q-mb-md">
          <span>⭐ Total 15/15 Bintang Emas</span>
          <span>•</span>
          <span>🏆 Nilai Sempurna 100</span>
        </div>

        <!-- Footer Signatures & Official Gold Seal -->
        <div class="cert-footer row items-end justify-between full-width q-px-md q-mt-lg">
          <!-- Left Signature: Tanggal -->
          <div class="signature-box column items-center">
            <div class="date-text font-fredoka text-caption text-bold text-grey-8">{{ currentDateStr }}</div>
            <div class="signature-line"></div>
            <div class="signature-title font-fredoka text-caption text-bold text-purple-9">Tanggal Kelulusan</div>
          </div>

          <!-- Center Official Gold Embossed Seal Badge -->
          <div class="gold-seal-badge flex flex-center shadow-8 animate-bounce">
            <div class="seal-inner column items-center justify-center text-white font-fredoka">
              <span class="text-h5">🥇</span>
              <span class="text-caption text-bold">ARKAN-GAME</span>
              <span class="seal-subtext">OFFICIAL</span>
            </div>
          </div>

          <!-- Right Signature: Arkan Companion -->
          <div class="signature-box column items-center">
            <div class="signature-name font-fredoka text-subtitle2 text-bold text-amber-9">Arkan & Tim Edukasi</div>
            <div class="signature-line"></div>
            <div class="signature-title font-fredoka text-caption text-bold text-purple-9">Pembimbing Utama</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="row q-gutter-x-md justify-center q-mt-lg relative-position z-top">
        <button class="btn-cert-action btn-download font-fredoka shadow-8 row items-center q-px-lg q-py-sm" @click="downloadCertificate">
          <span class="text-h6 q-mr-xs">📥</span>
          <span>Unduh Sertifikat (PNG)</span>
        </button>

        <button class="btn-cert-action btn-print font-fredoka shadow-8 row items-center q-px-lg q-py-sm" @click="printCertificate">
          <span class="text-h6 q-mr-xs">🖨️</span>
          <span>Cetak Sertifikat</span>
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  worldName?: string;
}>(), {
  worldName: 'Dunia Gunung Matematika'
});

const emit = defineEmits(['update:modelValue']);
const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const childName = computed(() => store.child.name || 'Arkan');

const currentDateStr = computed(() => {
  const d = new Date();
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
});

function printCertificate() {
  store.playSfx('click');
  window.print();
}

function downloadCertificate() {
  store.playSfx('win');
  store.speak(`Selamat ${childName.value}! Sertifikat kelulusanmu berhasil diunduh!`);

  // Create canvas representation of certificate
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill background
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Gold Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);

    // Title
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERTIFIKAT KELULUSAN', canvas.width / 2, 100);

    ctx.fillStyle = '#6d28d9';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Diberikan Kepada Bintang Kecil Hebat:', canvas.width / 2, 160);

    // Student Name
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(childName.value.toUpperCase(), canvas.width / 2, 240);

    // Description
    ctx.fillStyle = '#374151';
    ctx.font = '22px sans-serif';
    ctx.fillText('Atas keberhasilan luar biasa dan kegigihan menyelesaikan seluruh tantangan di:', canvas.width / 2, 310);

    // World Name
    ctx.fillStyle = '#5b21b6';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`🌍 ${props.worldName}`, canvas.width / 2, 380);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('⭐ Total 15/15 Bintang Emas • 🏆 Nilai Sempurna 100', canvas.width / 2, 440);

    // Footer
    ctx.fillStyle = '#4b5563';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Tanggal: ${currentDateStr.value}`, 200, 580);
    ctx.fillText('Arkan & Tim Edukasi', canvas.width - 200, 580);

    // Download PNG
    const link = document.createElement('a');
    link.download = `Sertifikat_Kelulusan_${childName.value}_${props.worldName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

function closeModal() {
  store.playSfx('click');
  isOpen.value = false;
}
</script>

<style scoped>
.certificate-modal-card {
  width: 760px;
  max-width: 95vw;
  background: linear-gradient(145deg, #1e1b4b 0%, #311b92 100%);
  border-radius: 28px !important;
  border: 3.5px solid #fbbf24;
}

.btn-close-fullscreen {
  width: 38px;
  height: 38px;
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

/* Printable Paper */
.certificate-paper {
  background: #fffdf5;
  border-radius: 20px;
  border: 6px solid #f59e0b;
  position: relative;
}

.gold-border-frame {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border: 2px double #d97706;
  border-radius: 12px;
  pointer-events: none;
}

.corner-ornament {
  position: absolute;
  font-size: 22px;
}

.top-left { top: 18px; left: 18px; }
.top-right { top: 18px; right: 18px; }
.bottom-left { bottom: 18px; left: 18px; }
.bottom-right { bottom: 18px; right: 18px; }

.cert-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #f59e0b;
}

.cert-title {
  font-size: 28px;
  letter-spacing: 2px;
}

.student-name {
  text-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
}

.signature-line {
  width: 140px;
  height: 2px;
  background: #cbd5e1;
  margin: 4px 0;
}

.gold-seal-badge {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: 3px double #fef08a;
}

.seal-subtext {
  font-size: 9px;
  letter-spacing: 1px;
}

.btn-cert-action {
  border-radius: 20px;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-cert-action:hover {
  transform: scale(1.05);
}

.btn-download {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.btn-print {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

@media print {
  body * {
    visibility: hidden;
  }
  #printable-certificate, #printable-certificate * {
    visibility: visible;
  }
  #printable-certificate {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
