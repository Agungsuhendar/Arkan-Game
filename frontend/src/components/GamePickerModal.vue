<template>
  <q-dialog v-model="isOpen" transition-show="scale" transition-hide="scale">
    <div class="game-picker-card relative-position overflow-hidden shadow-24 q-pa-lg">
      <!-- Glow background decorations -->
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
      />

      <!-- Modal Header Title -->
      <div class="text-center q-mb-md relative-position z-top">
        <div class="text-h4 font-fredoka text-bold text-white title-glow-3d row items-center justify-center gap-sm">
          <span>🎮</span>
          <span>KATALOG GAME & KREASI ARKAN</span>
          <span>✨</span>
        </div>
        <div class="text-subtitle1 font-quicksand text-amber-3 text-bold q-mt-xs">
          Pilih Salah Satu Permainan di Bawah Ini untuk Langsung Bermain! 🚀
        </div>
      </div>

      <!-- Scrollable Grid Container -->
      <div class="picker-scroll-container custom-scrollbar relative-position z-top">
        <div class="row q-col-gutter-md justify-center">
          <div
            v-for="game in games"
            :key="game.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <!-- Thumbnail Card -->
            <div
              class="thumbnail-game-card column justify-between shadow-10 cursor-pointer relative-position"
              :class="`theme-card-${game.color}`"
              @click="selectAndLaunchGame(game)"
            >
              <!-- Badge Ribbon -->
              <div class="card-top-tag row items-center justify-between q-px-sm q-pt-xs">
                <span class="category-pill font-fredoka shadow-2">
                  {{ game.category }}
                </span>
                <span class="xp-badge font-fredoka shadow-2">
                  ⭐ +50 XP
                </span>
              </div>

              <!-- Thumbnail Image / Icon Banner -->
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

              <!-- Card Info Footer -->
              <div class="info-footer-box q-pa-sm text-center column col justify-between">
                <div>
                  <div class="text-subtitle1 font-fredoka text-bold text-dark line-clamp-1">
                    {{ game.title }}
                  </div>
                  <div class="text-caption font-quicksand text-grey-8 line-clamp-2 q-mt-xs">
                    {{ game.description }}
                  </div>
                </div>

                <!-- Play Button -->
                <q-btn
                  unelevated
                  rounded
                  class="play-now-btn full-width q-mt-sm font-fredoka"
                >
                  <div class="row items-center justify-center gap-xs">
                    <q-icon name="play_arrow" size="18px" />
                    <span class="text-bold">MAIN SEKARANG</span>
                  </div>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'launch-game', 'open-drawing', 'open-puzzle', 'open-voice-quiz', 'open-story']);

const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

interface GameItem {
  id: string;
  title: string;
  category: string;
  description: string;
  emoji: string;
  image?: string;
  sceneKey?: string;
  modalEvent?: string;
  color: string;
}

const games: GameItem[] = [
  {
    id: 'bike_race',
    title: 'Balap Sepeda Arkan',
    category: 'Balapan',
    description: 'Balapan sepeda seru bersama Arkan, kumpulkan bintang & hindari rintangan!',
    emoji: '🚴💨',
    sceneKey: 'BikeRaceScene',
    color: 'cyan',
  },
  {
    id: 'balloon_game',
    title: 'Pop Balon Huruf',
    category: 'Ketangkasan',
    description: 'Pecahkan balon berisi huruf & angka sebelum melayang tinggi!',
    emoji: '🎈💥',
    sceneKey: 'BalloonGameScene',
    color: 'pink',
  },
  {
    id: 'fish_rescue',
    title: 'Penyelamatan Ikan',
    category: 'Petualangan Laut',
    description: 'Selamatkan ikan laut yang terperangkap dalam jaring!',
    emoji: '🐠🌊',
    image: '/underwater_game.png',
    sceneKey: 'FishRescueScene',
    color: 'blue',
  },
  {
    id: 'music_studio',
    title: 'Studio Pianika',
    category: 'Musik',
    description: 'Mainkan nada musik piano & dengarkan irama lagu edukasi!',
    emoji: '🎵🎹',
    sceneKey: 'MusicStudioScene',
    color: 'purple',
  },
  {
    id: 'spelling_garden',
    title: 'Taman Ejaan',
    category: 'Bahasa',
    description: 'Susun huruf menjadi kata yang benar di taman ajaib!',
    emoji: '🔤🌸',
    sceneKey: 'SpellingGardenScene',
    color: 'green',
  },
  {
    id: 'kebun_angka',
    title: 'Kebun Angka',
    category: 'Matematika',
    description: 'Belajar berhitung, menjumlah, & mengenali angka buah-buahan!',
    emoji: '🍉🔢',
    image: '/underwater_game.png',
    sceneKey: 'NumberGardenScene',
    color: 'amber',
  },
  {
    id: 'hutan_huruf',
    title: 'Hutan Huruf',
    category: 'Membaca',
    description: 'Petualangan abjad, membaca kata, dan mencocokkan garis!',
    emoji: '🌳🔤',
    image: '/adventure_map_card.png',
    sceneKey: 'MatchLineGameScene',
    color: 'green',
  },
  {
    id: 'kota_warna',
    title: 'Kota Warna',
    category: 'Seni & Warna',
    description: 'Tebak warna ajaib dan bentuk benda di sekitar!',
    emoji: '🎨🏙️',
    sceneKey: 'ColorCityScene',
    color: 'purple',
  },
  {
    id: 'pulau_hewan',
    title: 'Pulau Satwa',
    category: 'Sains',
    description: 'Mengenal nama, jenis, dan suara hewan hutan lucu!',
    emoji: '🦁🏝️',
    image: '/cat_character.png',
    sceneKey: 'AnimalIslandScene',
    color: 'orange',
  },
  {
    id: 'kastil_puzzle',
    title: 'Kastil Puzzle',
    category: 'Asah Otak',
    description: 'Permainan puzzle logika susun kastil kerajaan!',
    emoji: '🏰🧩',
    sceneKey: 'CastlePuzzleScene',
    color: 'cyan',
  },
  {
    id: 'sains_angkasa',
    title: 'Sains Luar Angkasa',
    category: 'Sains',
    description: 'Jelajahi planet, bintang, dan pengetahuan alam!',
    emoji: '🚀🪐',
    sceneKey: 'SpaceScienceScene',
    color: 'blue',
  },
  {
    id: 'panjat_gunung',
    title: 'Panjat Gunung XP',
    category: 'Petualangan',
    description: 'Panjat tebing tinggi, kumpulkan koin & bintang emas!',
    emoji: '🏆🏔️',
    image: '/world_map_4k_hd.png',
    sceneKey: 'MountainClimbScene',
    color: 'pink',
  },
  {
    id: 'studio_melukis',
    title: 'Studio Melukis',
    category: 'Kreativitas',
    description: 'Lukis & warnai gambar ajaib warna-warni bersama Arkan!',
    emoji: '🎨🖌️',
    modalEvent: 'open-drawing',
    color: 'purple',
  },
  {
    id: 'istana_puzzle',
    title: 'Istana Jigsaw',
    category: 'Puzzle Gambar',
    description: 'Susun kepingan puzzle gambar petualangan yang menyenangkan!',
    emoji: '🏰🧩',
    modalEvent: 'open-puzzle',
    color: 'cyan',
  },
  {
    id: 'kuis_suara',
    title: 'Kuis Suara Pintar',
    category: 'Suara & Bicara',
    description: 'Jawab tebakan seru menggunakan suaramu sendiri!',
    emoji: '🎙️✨',
    modalEvent: 'open-voice-quiz',
    color: 'amber',
  },
  {
    id: 'dongeng_cerita',
    title: 'Dongeng Cerita',
    category: 'Audio Dongeng',
    description: 'Dengarkan kisah dongeng cerita sebelum tidur yang menarik!',
    emoji: '📖🌙',
    modalEvent: 'open-story',
    color: 'green',
  },
];

const selectAndLaunchGame = (game: GameItem) => {
  store.playSfx('whoosh');
  isOpen.value = false;

  if (game.sceneKey) {
    emit('launch-game', game.sceneKey);
  } else if (game.modalEvent) {
    emit(game.modalEvent as any);
  }
};
</script>

<style scoped>
.game-picker-card {
  width: 95vw;
  max-width: 1080px;
  max-height: 88vh;
  border-radius: 32px;
  background: linear-gradient(165deg, #1e1b4b 0%, #311042 50%, #0f172a 100%);
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
}

.picker-scroll-container {
  overflow-y: auto;
  max-height: 65vh;
  padding-right: 4px;
}

/* Background Glow */
.glow-bg-1 {
  position: absolute;
  top: -50px;
  left: -50px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(0, 0, 0, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.glow-bg-2 {
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(0, 0, 0, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.title-glow-3d {
  text-shadow: 0 4px 0 #311042, 0 8px 20px rgba(0, 0, 0, 0.5);
}

/* Thumbnail Cards */
.thumbnail-game-card {
  border-radius: 24px;
  border: 3px solid #ffffff;
  min-height: 225px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.thumbnail-game-card:hover {
  transform: translateY(-8px) scale(1.03);
  border-color: #fde047;
  box-shadow: 0 18px 35px rgba(253, 224, 71, 0.35);
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
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.xp-badge {
  background: #f59e0b;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  border: 1px solid white;
}

/* Banner Image */
.thumbnail-banner {
  height: 75px;
}

.banner-aura {
  position: absolute;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
}

.game-thumb-img {
  width: 65px;
  height: 65px;
  object-fit: cover;
  border-radius: 16px;
  border: 2.5px solid white;
  z-index: 5;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
}

.game-thumb-emoji {
  font-size: 48px;
  z-index: 5;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.floating-bounce {
  animation: floatBounce 2.5s infinite alternate ease-in-out;
}

@keyframes floatBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-6px); }
}

/* Info Box */
.info-footer-box {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  margin: 6px;
}

.play-now-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  letter-spacing: 0.5px;
  font-size: 11px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  z-index: 20;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
