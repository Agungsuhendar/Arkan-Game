<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <div class="pwa-modal-card relative-position overflow-hidden shadow-24">
      <!-- Glow background decoration -->
      <div class="glow-bg-1"></div>
      <div class="glow-bg-2"></div>

      <!-- Close Button -->
      <q-btn
        flat
        round
        dense
        icon="close"
        color="white"
        class="absolute-top-right q-ma-sm close-btn"
        v-close-popup
        @click="dismissPrompt"
      />

      <div class="q-pa-lg text-center relative-position z-top">
        <!-- Header Badge & Avatar -->
        <div class="avatar-wrapper q-mb-md">
          <div class="avatar-ring"></div>
          <img src="/arkan_avatar_card.png" alt="Arkan Avatar" class="arkan-avatar-img" />
          <div class="badge-sparkle">✨</div>
        </div>

        <div class="text-h5 text-bold text-white q-mb-xs title-text">
          Install Petualangan Arkan! 🚀
        </div>

        <p class="text-caption text-purple-2 q-mb-md font-quicksand sub-text">
          Mainkan game edukasi seru langsung dari layar utama HP atau Laptopmu tanpa browser!
        </p>

        <!-- Feature Benefits Grid -->
        <div class="features-grid q-mb-md">
          <div class="feature-item">
            <div class="feature-icon bg-amber-5 text-white">⚡</div>
            <div class="feature-info text-left">
              <div class="text-weight-bold text-white text-body2">Main Offline</div>
              <div class="text-caption text-purple-2">Tetap bisa main tanpa koneksi internet</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon bg-indigo-5 text-white">🎮</div>
            <div class="feature-info text-left">
              <div class="text-weight-bold text-white text-body2">Layar Penuh</div>
              <div class="text-caption text-purple-2">Tampilan game memukau tanpa bar browser</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon bg-pink-5 text-white">🚀</div>
            <div class="feature-info text-left">
              <div class="text-weight-bold text-white text-body2">Akses Cepat 1-Klik</div>
              <div class="text-caption text-purple-2">Buka dari Home Screen seperti aplikasi asli</div>
            </div>
          </div>
        </div>

        <!-- iOS Instructions Callout -->
        <div v-if="isIOS" class="ios-instructions q-pa-sm q-mb-md text-left">
          <div class="text-subtitle2 text-bold text-amber-3 flex items-center gap-xs q-mb-xs">
            <q-icon name="apple" size="20px" /> Cara Install di iPhone / iPad:
          </div>
          <ol class="q-pl-md q-ma-none text-caption text-white font-quicksand">
            <li>Ketuk tombol <strong>Bagikan</strong> <q-icon name="ios_share" color="light-blue-3" /> di bagian bawah Safari</li>
            <li>Geser ke bawah lalu pilih <strong>"Tambah ke Layar Utama"</strong> (Add to Home Screen) ➕</li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="column gap-sm items-center q-mt-sm">
          <q-btn
            v-if="!isIOS"
            unelevated
            rounded
            class="install-btn full-width q-py-sm"
            @click="installPwa"
          >
            <div class="row items-center justify-center gap-sm">
              <q-icon name="downloading" size="24px" />
              <span class="text-bold text-subtitle1">INSTALL SEKARANG</span>
            </div>
          </q-btn>

          <q-btn
            v-else
            unelevated
            rounded
            class="understand-btn full-width q-py-sm"
            v-close-popup
            @click="dismissPrompt"
          >
            <span class="text-bold text-subtitle1">SAYA MENGERTI 👍</span>
          </q-btn>

          <q-btn
            flat
            rounded
            no-caps
            color="grey-4"
            class="later-btn text-caption"
            v-close-popup
            @click="dismissPrompt"
          >
            Nanti Saja
          </q-btn>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isOpen = ref(false);
const deferredPrompt = ref<any>(null);
const isIOS = ref(false);

const DISMISS_KEY = 'arkan_pwa_prompt_dismissed_until';

const checkIsStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

const checkIsIOS = (): boolean => {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
};

const isDismissed = (): boolean => {
  const dismissedUntil = localStorage.getItem(DISMISS_KEY);
  if (!dismissedUntil) return false;
  return new Date().getTime() < parseInt(dismissedUntil, 10);
};

const dismissPrompt = () => {
  isOpen.value = false;
  // Don't show again for 24 hours
  const tomorrow = new Date().getTime() + 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, tomorrow.toString());
};

const installPwa = async () => {
  if (!deferredPrompt.value) return;

  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  
  if (outcome === 'accepted') {
    console.log('PWA installation accepted by user');
  }
  deferredPrompt.value = null;
  isOpen.value = false;
};

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault();
  deferredPrompt.value = e;

  if (!checkIsStandalone() && !isDismissed()) {
    setTimeout(() => {
      isOpen.value = true;
    }, 1500);
  }
};

const handleAppInstalled = () => {
  isOpen.value = false;
  deferredPrompt.value = null;
  console.log('PWA installed successfully');
};

onMounted(() => {
  isIOS.value = checkIsIOS();

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  // If on iOS and not standalone and not dismissed, show prompt after 2 seconds
  if (isIOS.value && !checkIsStandalone() && !isDismissed()) {
    setTimeout(() => {
      isOpen.value = true;
    }, 2000);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style scoped>
.pwa-modal-card {
  width: 90vw;
  max-width: 420px;
  border-radius: 28px;
  background: linear-gradient(160deg, #1e1b4b 0%, #311042 50%, #0f172a 100%);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* Background Glow Effect */
.glow-bg-1 {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(0, 0, 0, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.glow-bg-2 {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(0, 0, 0, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* Avatar Styling */
.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-top: 4px;
}

.avatar-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6);
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.arkan-avatar-img {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  border: 3px solid #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.badge-sparkle {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 20px;
  animation: bounce 2s infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-6px) scale(1.15); }
}

.title-text {
  font-family: 'Fredoka', cursive, sans-serif;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.sub-text {
  line-height: 1.4;
}

/* Features Grid */
.features-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.feature-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

/* iOS Callout */
.ios-instructions {
  background: rgba(245, 158, 11, 0.12);
  border: 1px dashed rgba(245, 158, 11, 0.4);
  border-radius: 16px;
}

/* Buttons */
.install-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4), 0 0 15px rgba(16, 185, 129, 0.2);
  font-family: 'Fredoka', cursive, sans-serif;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  animation: pulse-glow 2.5s infinite;
}

.install-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.6);
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 8px 35px rgba(16, 185, 129, 0.8), 0 0 20px rgba(52, 211, 153, 0.6); }
}

.understand-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  font-family: 'Fredoka', cursive, sans-serif;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  z-index: 20;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.font-quicksand {
  font-family: 'Quicksand', sans-serif;
}
</style>
