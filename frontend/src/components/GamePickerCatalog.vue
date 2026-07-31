<template>
  <div
    ref="catalogWrapperRef"
    class="game-catalog-fullscreen relative-position"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUpOrLeave"
    @mouseleave="handleMouseUpOrLeave"
  >
    <!-- Sky & Magic Background Effects -->
    <div class="glow-bg-top"></div>
    <div class="glow-bg-bottom"></div>
    
    <div class="sparkles-overlay">
      <span class="sparkle s1">✨</span>
      <span class="sparkle s2">⭐</span>
      <span class="sparkle s3">🌟</span>
      <span class="sparkle s4">🎨</span>
      <span class="sparkle s5">🚀</span>
      <span class="sparkle s6">🎮</span>
    </div>

    <!-- 1. Top Header Bar -->
    <div class="catalog-top-bar row items-center justify-between q-px-lg q-pt-md relative-position z-top">
      <button class="btn-3d-cartoon btn-accent-pink shadow-6 font-fredoka btn-back-home" @click="handleBackHome">
        ⬅️ Beranda Rumah
      </button>

      <div class="catalog-title-badge column items-center">
        <div class="text-h3 font-fredoka text-bold text-white title-glow-3d row items-center q-gutter-x-sm">
          <span>🎮</span>
          <span>KATALOG GAME & KREASI ARKAN</span>
          <span>✨</span>
        </div>
        <span class="text-subtitle1 font-fredoka text-amber-3 text-bold subtitle-sparkle">
          Pilih Kategori atau Permainan Favoritmu di Bawah Ini! 🚀
        </span>
      </div>

      <div class="stat-pill bg-white shadow-6 row items-center q-px-md q-py-xs rounded-borders-lg">
        <span class="stat-icon-star">⭐</span>
        <span class="stat-value-xp font-fredoka text-amber-10 text-h6 text-bold q-ml-xs">{{ store.child.xp }} Bintang</span>
      </div>
    </div>

    <!-- 2. Category Filter Tabs Bar -->
    <div class="row q-gutter-xs justify-center q-my-md relative-position z-top catalog-tabs-bar">
      <button
        v-for="cat in catalogCategories"
        :key="cat.id"
        class="catalog-filter-btn font-fredoka shadow-4"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCatalogCategory(cat.id)"
      >
        <span class="q-mr-xs">{{ cat.emoji }}</span>
        <span>{{ cat.label }}</span>
      </button>
    </div>

    <!-- 3. Fullscreen Scrollable Games Grid -->
    <div class="catalog-scroll-stage q-px-xl q-pb-xl">
      <div class="row q-col-gutter-lg justify-center">
        <div
          v-for="game in filteredGames"
          :key="game.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <!-- 3D Game Thumbnail Card -->
          <div
            class="thumbnail-game-card column justify-between shadow-12 cursor-pointer relative-position"
            :class="`theme-card-${game.color}`"
            @click="selectAndLaunchGame(game)"
          >
            <!-- Card Top Ribbon Tag -->
            <div class="card-top-tag row items-center justify-between q-px-md q-pt-sm">
              <span class="category-pill font-fredoka shadow-2">
                {{ game.category }}
              </span>
              <span class="xp-badge font-fredoka shadow-2">
                ⭐ +50 XP
              </span>
            </div>

            <!-- Central Floating Emblem Banner -->
            <div class="thumbnail-banner flex flex-center q-my-xs relative-position">
              <div class="banner-aura"></div>
              <img
                v-if="game.image"
                :src="game.image"
                class="game-thumb-img floating-bounce"
                :alt="game.title"
              />
              <div v-else class="game-thumb-emoji floating-bounce">
                {{ game.emoji }}
              </div>
            </div>

            <!-- Card Info Box -->
            <div class="info-footer-box q-pa-md text-center column col justify-between">
              <div>
                <div class="text-h6 font-fredoka text-bold text-dark line-clamp-1 q-mb-xs">
                  {{ game.title }}
                </div>
                <div class="text-body2 font-quicksand text-grey-8 line-clamp-2">
                  {{ game.description }}
                </div>
              </div>

              <!-- Play Button -->
              <q-btn
                unelevated
                rounded
                class="play-now-btn full-width q-mt-md font-fredoka shadow-6"
              >
                <div class="row items-center justify-center gap-xs">
                  <q-icon name="play_arrow" size="20px" />
                  <span class="text-bold text-subtitle2">MAIN SEKARANG</span>
                </div>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Left Companion Banner -->
    <div class="catalog-companion-banner row items-center shadow-8 pulse-slow">
      <img src="/arkan_character.png" class="companion-avatar" alt="Arkan" />
      <div class="companion-speech font-fredoka q-ml-sm">
        <span>"Ayo {{ store.child.name }}, pilih game mana saja yang kamu suka!"</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const emit = defineEmits(['back', 'launch-game', 'open-drawing', 'open-puzzle', 'open-voice-quiz', 'open-story']);
const store = useGameStore();

interface GameItem {
  id: string;
  title: string;
  category: string;
  group: 'belajar' | 'matematika' | 'kreasi' | 'puzzle' | 'petualangan';
  description: string;
  emoji: string;
  image?: string;
  sceneKey?: string;
  modalEvent?: string;
  color: string;
}

const selectedCategory = ref('semua');

function selectCatalogCategory(catId: string) {
  store.playSfx('click');
  selectedCategory.value = catId;
}

const catalogCategories = computed(() => [
  { id: 'semua', label: `Semua Game (${games.length})`, emoji: '🌟' },
  { id: 'belajar', label: `Membaca & Bahasa (${games.filter(g => g.group === 'belajar').length})`, emoji: '📖' },
  { id: 'matematika', label: `Hitung & Angka (${games.filter(g => g.group === 'matematika').length})`, emoji: '🔢' },
  { id: 'kreasi', label: `Melukis & Musik (${games.filter(g => g.group === 'kreasi').length})`, emoji: '🎨' },
  { id: 'puzzle', label: `Puzzle & Sains (${games.filter(g => g.group === 'puzzle').length})`, emoji: '🧩' },
  { id: 'petualangan', label: `Aksi & Balapan (${games.filter(g => g.group === 'petualangan').length})`, emoji: '🚴' },
]);

const games: GameItem[] = [
  // 1. Membaca & Bahasa
  {
    id: 'tarik_garis',
    title: 'Tarik Garis Cocokkan',
    category: 'Tarik Garis',
    group: 'belajar',
    description: 'Tarik garis untuk mencocokkan hewan, makanan, & benda!',
    emoji: '🎯✏️',
    sceneKey: 'MatchLineGameScene',
    color: 'green',
  },
  {
    id: 'spelling_garden',
    title: 'Taman Ejaan Kata',
    category: 'Ejaan Kata',
    group: 'belajar',
    description: 'Susun huruf menjadi kata yang benar di taman ajaib!',
    emoji: '🔤🌸',
    sceneKey: 'SpellingGardenScene',
    color: 'green',
  },
  {
    id: 'kuis_suara',
    title: 'Kuis Suara Pintar',
    category: 'Suara & Bicara',
    group: 'belajar',
    description: 'Jawab tebakan seru hewan, angka & warna dengan suaramu!',
    emoji: '🎙️✨',
    modalEvent: 'open-voice-quiz',
    color: 'amber',
  },
  {
    id: 'dongeng_cerita',
    title: 'Dongeng Cerita',
    category: 'Audio Dongeng',
    group: 'belajar',
    description: 'Dengarkan kisah dongeng edukatif menyenangkan!',
    emoji: '📖🌙',
    modalEvent: 'open-story',
    color: 'purple',
  },

  // 2. Hitung & Angka
  {
    id: 'kebun_angka',
    title: 'Kebun Angka & Berhitung',
    category: 'Matematika',
    group: 'matematika',
    description: 'Belajar berhitung, menjumlah, & mengenali angka buah!',
    emoji: '🍉🔢',
    sceneKey: 'NumberGardenScene',
    color: 'amber',
  },

  // 3. Melukis & Musik (Kreasi)
  {
    id: 'studio_melukis',
    title: 'Studio Melukis Ajaib',
    category: 'Kreativitas',
    group: 'kreasi',
    description: 'Lukis & warnai gambar ajaib warna-warni bersama Arkan!',
    emoji: '🎨🖌️',
    modalEvent: 'open-drawing',
    color: 'purple',
  },
  {
    id: 'music_studio',
    title: 'Studio Pianika & Musik',
    category: 'Musik & Nada',
    group: 'kreasi',
    description: 'Mainkan nada musik piano & dengarkan irama lagu edukasi!',
    emoji: '🎵🎹',
    sceneKey: 'MusicStudioScene',
    color: 'purple',
  },
  {
    id: 'kota_warna',
    title: 'Kota Warna & Bentuk',
    category: 'Seni & Warna',
    group: 'kreasi',
    description: 'Tebak warna ajaib dan bentuk benda di sekitar!',
    emoji: '🎨🏙️',
    sceneKey: 'ColorCityScene',
    color: 'pink',
  },

  // 4. Puzzle & Sains
  {
    id: 'istana_puzzle',
    title: 'Istana Puzzle Jigsaw',
    category: 'Puzzle Gambar',
    group: 'puzzle',
    description: 'Susun kepingan puzzle gambar petualangan yang menyenangkan!',
    emoji: '🧩🏰',
    modalEvent: 'open-puzzle',
    color: 'cyan',
  },
  {
    id: 'kastil_puzzle',
    title: 'Kastil Puzzle Logika',
    category: 'Asah Otak',
    group: 'puzzle',
    description: 'Permainan puzzle logika susun kastil kerajaan!',
    emoji: '🏰🧱',
    sceneKey: 'CastlePuzzleScene',
    color: 'cyan',
  },
  {
    id: 'fish_rescue',
    title: 'Penyelamatan Ikan Laut',
    category: 'Petualangan Laut',
    group: 'puzzle',
    description: 'Selamatkan ikan laut yang terperangkap dalam jaring!',
    emoji: '🐠🌊',
    sceneKey: 'FishRescueScene',
    color: 'blue',
  },
  {
    id: 'sains_angkasa',
    title: 'Sains Luar Angkasa',
    category: 'Sains & Antariksa',
    group: 'puzzle',
    description: 'Jelajahi planet, bintang, dan pengetahuan alam!',
    emoji: '🚀🪐',
    sceneKey: 'SpaceScienceScene',
    color: 'blue',
  },
  {
    id: 'pulau_hewan',
    title: 'Pulau Satwa & Suara',
    category: 'Sains Satwa',
    group: 'puzzle',
    description: 'Mengenal nama, jenis, dan suara hewan hutan lucu!',
    emoji: '🦁🏝️',
    sceneKey: 'AnimalIslandScene',
    color: 'orange',
  },

  // 5. Aksi & Balapan (Petualangan)
  {
    id: 'bike_race',
    title: 'Balap Sepeda Arkan',
    category: 'Balapan',
    group: 'petualangan',
    description: 'Balapan sepeda seru bersama Arkan, Ayah & Ibu!',
    emoji: '🚴💨',
    sceneKey: 'BikeRaceScene',
    color: 'cyan',
  },
  {
    id: 'balloon_game',
    title: 'Pop Balon Huruf & Angka',
    category: 'Ketangkasan',
    group: 'petualangan',
    description: 'Pecahkan balon berisi huruf & angka sebelum melayang tinggi!',
    emoji: '🎈💥',
    sceneKey: 'BalloonGameScene',
    color: 'pink',
  },
  {
    id: 'panjat_gunung',
    title: 'Panjat Gunung XP',
    category: 'Petualangan',
    group: 'petualangan',
    description: 'Panjat tebing tinggi, kumpulkan koin & bintang emas!',
    emoji: '🏆🏔️',
    sceneKey: 'MountainClimbScene',
    color: 'pink',
  },
];

const filteredGames = computed(() => {
  if (selectedCategory.value === 'semua') return games;
  return games.filter(g => g.group === selectedCategory.value);
});

const handleBackHome = () => {
  store.playSfx('click');
  emit('back');
};

const selectAndLaunchGame = (game: GameItem) => {
  store.playSfx('whoosh');
  if (game.sceneKey) {
    emit('launch-game', game.sceneKey);
  } else if (game.modalEvent) {
    emit(game.modalEvent as any);
  }
};

// Drag to Scroll Logic for Mouse Dragging
const catalogWrapperRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startY = ref(0);
const scrollTopStart = ref(0);

const handleMouseDown = (e: MouseEvent) => {
  if (!catalogWrapperRef.value) return;
  const target = e.target as HTMLElement;
  if (target.closest('button') || target.closest('.thumbnail-game-card')) return;
  isDragging.value = true;
  startY.value = e.pageY - catalogWrapperRef.value.offsetTop;
  scrollTopStart.value = catalogWrapperRef.value.scrollTop;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !catalogWrapperRef.value) return;
  e.preventDefault();
  const y = e.pageY - catalogWrapperRef.value.offsetTop;
  const walk = (y - startY.value) * 1.5;
  catalogWrapperRef.value.scrollTop = scrollTopStart.value - walk;
};

const handleMouseUpOrLeave = () => {
  isDragging.value = false;
};
</script>

<style scoped>
.game-catalog-fullscreen {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  z-index: 10;
  background: linear-gradient(180deg, #1e1b4b 0%, #311042 50%, #0f172a 100%);
  overflow-x: hidden;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scroll-behavior: smooth;
  cursor: grab;
}

.game-catalog-fullscreen:active {
  cursor: grabbing;
}

/* Background Glows */
.glow-bg-top {
  position: absolute;
  top: -100px;
  left: 20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.glow-bg-bottom {
  position: absolute;
  bottom: -100px;
  right: 20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.sparkles-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.sparkle {
  position: absolute;
  font-size: 26px;
  animation: twinkleSparkle 2.4s infinite alternate ease-in-out;
}

.s1 { top: 10%; left: 15%; animation-delay: 0.2s; }
.s2 { top: 20%; right: 18%; animation-delay: 0.8s; font-size: 34px; }
.s3 { top: 5%; right: 40%; animation-delay: 1.4s; }
.s4 { top: 35%; left: 8%; animation-delay: 1.9s; }
.s5 { top: 25%; left: 88%; animation-delay: 0.5s; font-size: 34px; }
.s6 { top: 15%; left: 45%; animation-delay: 1.1s; font-size: 38px; }

@keyframes twinkleSparkle {
  0% { transform: scale(0.8) translateY(0); opacity: 0.4; }
  100% { transform: scale(1.3) translateY(-8px); opacity: 1; filter: drop-shadow(0 0 10px #fde047); }
}

.btn-back-home {
  font-size: 15px;
  padding: 10px 20px;
}

.title-glow-3d {
  text-shadow: 0 4px 0 #311042, 0 8px 20px rgba(0, 0, 0, 0.5);
}

.subtitle-sparkle {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.rounded-borders-lg {
  border-radius: 24px;
  border: 3px solid #6366f1;
}

.stat-icon-star {
  font-size: 26px;
}

/* Category Filter Buttons */
.catalog-tabs-bar {
  flex-wrap: wrap;
  gap: 8px;
}

.catalog-filter-btn {
  padding: 8px 18px;
  border-radius: 22px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.catalog-filter-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.25);
}

.catalog-filter-btn.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde047;
  color: white;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

/* Cards Grid Container */
.catalog-scroll-stage {
  z-index: 20;
  position: relative;
}

/* 3D Game Cards Styling */
.thumbnail-game-card {
  min-height: 310px;
  border-radius: 28px;
  border: 4px solid #ffffff;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.thumbnail-game-card:hover {
  transform: translateY(-10px) scale(1.04);
  box-shadow: 0 22px 45px rgba(253, 224, 71, 0.4);
  border-color: #fde047;
}

/* Card Themes */
.theme-card-amber { background: linear-gradient(180deg, #fef08a 0%, #eab308 100%); }
.theme-card-green { background: linear-gradient(180deg, #bbf7d0 0%, #22c55e 100%); }
.theme-card-purple { background: linear-gradient(180deg, #f5d0fe 0%, #a855f7 100%); }
.theme-card-orange { background: linear-gradient(180deg, #ffedd5 0%, #f97316 100%); }
.theme-card-pink { background: linear-gradient(180deg, #fbcfe8 0%, #ec4899 100%); }
.theme-card-cyan { background: linear-gradient(180deg, #cffafe 0%, #06b6d4 100%); }
.theme-card-blue { background: linear-gradient(180deg, #bae6fd 0%, #0284c7 100%); }

.category-pill {
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: bold;
}

.xp-badge {
  background: #f59e0b;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: bold;
  border: 1.5px solid white;
}

/* Thumbnail Banner & Emblem */
.thumbnail-banner {
  height: 95px;
}

.banner-aura {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
}

.game-thumb-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 20px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  z-index: 5;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.game-thumb-emoji {
  font-size: 58px;
  z-index: 5;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.floating-bounce {
  animation: giantBounce 2.6s infinite alternate ease-in-out;
}

@keyframes giantBounce {
  0% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
  100% { transform: translateY(-3px) rotate(-1deg); }
}

/* Info Box */
.info-footer-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 22px;
  margin: 8px;
}

.play-now-btn {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  color: white;
  border: 2px solid #a7f3d0;
  border-radius: 16px;
  padding: 8px 14px;
}

.catalog-companion-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 8px 18px 8px 10px;
  border: 3px solid #6366f1;
  z-index: 50;
}

.companion-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #f59e0b;
}

.companion-speech {
  color: #0f172a;
  font-size: 14px;
  font-weight: bold;
}
</style>
