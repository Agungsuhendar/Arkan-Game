<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    persistent
  >
    <q-card class="fullscreen-story-container column no-wrap overflow-hidden">
      
      <!-- ================= MODE 1: RAK BUKU / PERPUSTAKAAN CERITA FULLSCREEN ================= -->
      <template v-if="!selectedBook">
        <!-- Cosmic Gallery Header -->
        <div class="gallery-header row items-center justify-between q-px-xl q-py-lg">
          <div class="row items-center q-gutter-x-md">
            <div class="header-icon-box flex flex-center shadow-4">
              <span>📚</span>
            </div>
            <div>
              <div class="text-h4 font-fredoka text-bold text-white title-glow">
                Perpustakaan Cerita Arkan
              </div>
              <div class="text-subtitle1 font-quicksand text-purple-2 text-weight-bold">
                Pilih buku cerita favoritmu dan mulailah petualangan membaca menyenangkan!
              </div>
            </div>
          </div>

          <div class="row items-center q-gutter-x-md">
            <div class="books-count-badge font-fredoka shadow-3">
              ✨ {{ storyBooks.length }} Buku Cerita Tersedia
            </div>
            <button class="btn-close-fullscreen flex flex-center cursor-pointer shadow-4" @click="closeModal" title="Tutup Perpustakaan">
              ✕
            </button>
          </div>
        </div>

        <!-- Filter Category Pills Bar -->
        <div class="category-bar row items-center q-px-xl q-py-md q-gutter-x-sm">
          <button
            v-for="cat in categories"
            :key="cat"
            class="filter-pill-btn font-fredoka"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Book Shelf Gallery Grid -->
        <div class="col q-px-xl q-py-lg overflow-auto gallery-scroll-body">
          <div class="row q-col-gutter-lg">
            <div
              v-for="book in filteredBooks"
              :key="book.id"
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div class="fullscreen-book-card column justify-between shadow-8 cursor-pointer" @click="openBook(book)">
                <!-- Book Cover & Badges -->
                <div class="book-cover-wrapper relative-position overflow-hidden">
                  <img :src="book.coverImage" :alt="book.title" class="book-cover-img" @error="handleImageError" />
                  <div class="cover-vignette-overlay"></div>
                  
                  <!-- Top Badge -->
                  <span class="badge-tag font-fredoka shadow-4" :class="book.badgeColor">
                    {{ book.badge }}
                  </span>
                  
                  <!-- Page Counter -->
                  <span class="pages-badge font-fredoka shadow-4">
                    📖 {{ book.pages.length }} Halaman
                  </span>
                </div>

                <!-- Book Metadata Content -->
                <div class="book-info-box q-pa-md column col justify-between">
                  <div>
                    <div class="row items-center justify-between q-mb-xs">
                      <span class="category-pill font-fredoka">{{ book.category }}</span>
                      <span class="read-duration font-quicksand text-bold text-grey-4">⏱️ {{ book.readTime }}</span>
                    </div>

                    <div class="book-title font-fredoka text-white text-subtitle1 text-bold line-clamp-1">
                      {{ book.title }}
                    </div>
                    
                    <div class="book-summary font-quicksand text-slate-300 text-caption line-clamp-2 q-mt-xs">
                      {{ book.summary }}
                    </div>
                  </div>

                  <button class="btn-open-book font-fredoka q-mt-md row items-center justify-center">
                    <span>Baca Cerita</span>
                    <span class="q-ml-sm text-subtitle1">📖 ➡️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>


      <!-- ================= MODE 2: BACA BUKU CERITA (FULLSCREEN READER) ================= -->
      <template v-else>
        <!-- Reader Navigation Header -->
        <div class="reader-header row items-center justify-between q-px-xl q-py-md">
          <div class="row items-center q-gutter-x-md">
            <button class="btn-back-shelf-lg font-fredoka row items-center shadow-4" @click="backToShelf">
              ⬅️ Kembali ke Rak Buku
            </button>
            <div class="column">
              <span class="text-h6 font-fredoka text-bold text-white line-clamp-1 title-glow">{{ selectedBook.title }}</span>
              <span class="text-caption font-fredoka text-purple-2">Halaman {{ currentPage + 1 }} dari {{ selectedBook.pages.length }}</span>
            </div>
          </div>

          <div class="row items-center q-gutter-x-sm">
            <!-- Progress Dots -->
            <div class="progress-dots-row row items-center q-gutter-x-xs q-px-md q-py-xs rounded-borders bg-white-10">
              <div
                v-for="(page, idx) in selectedBook.pages"
                :key="idx"
                class="progress-dot cursor-pointer"
                :class="{ 'dot-active': idx === currentPage, 'dot-completed': idx < currentPage }"
                @click="currentPage = idx"
                :title="page.title"
              ></div>
            </div>

            <button class="btn-close-fullscreen flex flex-center cursor-pointer shadow-4 q-ml-md" @click="closeModal" title="Tutup Cerita">
              ✕
            </button>
          </div>
        </div>

        <!-- Main Reader Layout: Open Fairytale Storybook -->
        <div class="col q-px-lg q-pb-md overflow-hidden fairytale-reader-stage flex flex-center">
          <!-- 3D Open Magical Storybook Container -->
          <div class="fairytale-open-book shadow-24 relative-position row items-stretch">
            
            <!-- Book Spine Middle Shadow Line -->
            <div class="book-spine-line"></div>
            <!-- Book Bookmark Ribbon -->
            <div class="fairytale-bookmark-ribbon shadow-4"></div>

            <!-- LEFT PAGE: Giant Magical Picture Frame -->
            <div class="book-left-page col-12 col-md-6 column justify-between relative-position q-pa-lg">
              <!-- Golden Picture Frame -->
              <div class="golden-picture-frame col relative-position overflow-hidden shadow-10">
                <img
                  :src="activePage.image"
                  :alt="activePage.title"
                  class="fairytale-img"
                  @error="handleImageError"
                />
                <div class="fairytale-img-glow"></div>

                <!-- Page Emoji Badge Top Left -->
                <div class="story-emoji-badge shadow-4 font-fredoka">
                  {{ activePage.emoji || '✨ 📖 🌟' }}
                </div>
              </div>

              <!-- Dialogue Speech Scroll (Bottom of Picture) -->
              <div v-if="activePage.dialogueText" class="fairytale-dialogue-scroll q-mt-md q-pa-md shadow-5">
                <div class="row items-center q-gutter-x-xs q-mb-xs">
                  <span>✨ 💬</span>
                  <span class="speaker-name font-fredoka text-amber-10">{{ activePage.dialogueSpeaker }}</span>
                </div>
                <div class="speech-quote font-fredoka text-subtitle1">"{{ activePage.dialogueText }}"</div>
              </div>
            </div>

            <!-- RIGHT PAGE: Parchment Narrative & Interactive Controls -->
            <div class="book-right-page col-12 col-md-6 column justify-between q-pa-lg relative-position">
              <div class="column q-gutter-y-md col overflow-auto pr-xs">
                <!-- Chapter Header -->
                <div class="fairytale-chapter-header">
                  <div class="text-h4 font-fredoka text-bold text-amber-10 story-chapter-title">{{ activePage.title }}</div>
                  <div class="text-subtitle1 font-quicksand text-brown-8 text-weight-bolder q-mt-xs">{{ activePage.subtitle }}</div>
                </div>

                <!-- Classic Parchment Story Text Box -->
                <div class="parchment-story-box q-pa-lg font-quicksand text-h6 text-brown-10 text-weight-bolder shadow-3">
                  <span class="drop-cap font-fredoka">{{ activePage.storyContent.charAt(0) }}</span>
                  <span>{{ activePage.storyContent.slice(1) }}</span>
                </div>

                <!-- Magical Quest / Moral Badge -->
                <div v-if="activePage.missionText" class="fairytale-mission-badge row items-center justify-between q-pa-md shadow-3">
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-h6">📜</span>
                    <span class="font-fredoka text-bold text-purple-9 text-subtitle1">{{ activePage.missionText }}</span>
                  </div>
                  <span class="sparkle-icon">🌟</span>
                </div>
              </div>

              <!-- Narrator Voice Control Bar -->
              <div v-if="availableVoices.length > 0" class="fairytale-voice-box row items-center justify-between q-mt-xs q-px-md q-py-xs shadow-2">
                <div class="row items-center q-gutter-x-xs col">
                  <span class="text-caption font-fredoka text-brown-9 text-bold">🗣️ Suara:</span>
                  <select v-model="selectedVoiceURI" class="voice-select-fairytale font-quicksand text-weight-bold text-caption col">
                    <option v-for="v in availableVoices" :key="v.voiceURI" :value="v.voiceURI">
                      {{ v.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Page Control Navigation Bar -->
              <div class="fairytale-controls-row row items-center justify-between q-pt-sm q-gutter-x-xs">
                <button
                  class="btn-fairytale btn-prev-fairytale font-fredoka shadow-4"
                  :disabled="currentPage === 0"
                  @click="prevPage"
                >
                  ⬅️ Sebelum
                </button>

                <button class="btn-fairytale btn-audio-fairytale font-fredoka shadow-4" @click="toggleAudioNarration">
                  {{ isNarrating ? '🔊 Membaca...' : '🎧 Baca Dongeng' }}
                </button>

                <button class="btn-fairytale btn-lullaby-fairytale font-fredoka shadow-4" :class="{ active: isLullabyPlaying }" @click="toggleLullabyMusic">
                  {{ isLullabyPlaying ? '🎵 Musik: ON' : '🎵 Musik: OFF' }}
                </button>

                <button
                  v-if="currentPage < selectedBook.pages.length - 1"
                  class="btn-fairytale btn-next-fairytale font-fredoka shadow-4"
                  @click="nextPage"
                >
                  Lanjut ➡️
                </button>
                <button
                  v-else
                  class="btn-fairytale btn-finish-fairytale font-fredoka shadow-4"
                  @click="finishStory"
                >
                  Selesai 🏆
                </button>
              </div>
            </div>

          </div>
        </div>
      </template>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const selectedCategory = ref('Semua');
const categories = ['Semua 🌈', 'Karakter & Moral 💖', 'Petualangan 🚩', 'Eksplorasi 🌊', 'Olahraga 🚴', 'Sains & Logika 🧩'];

const selectedBook = ref<StoryBook | null>(null);
const currentPage = ref(0);
const isNarrating = ref(false);
const isLullabyPlaying = ref(false);
const isAutoAdvance = ref(true);
let lullabyTimer: any = null;
let lullabyCtx: AudioContext | null = null;

// Voice Narrator Options (Suara Dongeng)
const availableVoices = ref<SpeechSynthesisVoice[]>([]);
const selectedVoiceURI = ref<string>('');
const narratorPitch = ref<number>(1.15); // 1.15 = nada hangat khas dongeng
const narratorRate = ref<number>(0.88);  // 0.88 = tempo santai nina boko / cerita anak

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const allVoices = window.speechSynthesis.getVoices();
  if (!allVoices || allVoices.length === 0) return;

  // Utamakan Bahasa Indonesia (id)
  const idVoices = allVoices.filter(v => 
    v.lang.toLowerCase().includes('id') || 
    v.name.toLowerCase().includes('indonesia')
  );

  availableVoices.value = idVoices.length > 0 ? idVoices : allVoices;

  // Pilihlah suara terbaik secara otomatis (Google / Natural / Neural / Female / Aris / Gadis)
  if (!selectedVoiceURI.value && availableVoices.value.length > 0) {
    const priorityVoice = availableVoices.value.find(v => 
      v.name.toLowerCase().includes('natural') || 
      v.name.toLowerCase().includes('google') || 
      v.name.toLowerCase().includes('online') ||
      v.name.toLowerCase().includes('wavenet') ||
      v.name.toLowerCase().includes('gadis') ||
      v.name.toLowerCase().includes('aris') ||
      v.name.toLowerCase().includes('indah')
    ) || availableVoices.value[0];

    selectedVoiceURI.value = priorityVoice.voiceURI;
  }
}

onMounted(() => {
  loadVoices();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
});

interface StoryPage {
  pageNumber: number;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  badgeColor: string;
  dialogueSpeaker?: string;
  dialogueText?: string;
  storyContent: string;
  missionText?: string;
  bgGradient: string;
  emoji: string;
}

interface StoryBook {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  category: string;
  badge: string;
  badgeColor: string;
  readTime: string;
  summary: string;
  pages: StoryPage[];
}

const storyBooks = computed<StoryBook[]>(() => [
  {
    id: 'buku-7',
    title: 'Arkan si Pemberani Penolong Kucing Kecil',
    subtitle: 'Cerita untuk Anak Usia 4 Tahun',
    coverImage: '/arkan_kucing_cover.png?v=kucing_v1',
    category: 'Karakter & Moral 💖',
    badge: '🌟 Terbaru',
    badgeColor: 'bg-amber-8',
    readTime: '3 Menit',
    summary: 'Kisah keberanian Arkan menyelamatkan anak kucing oranye yang tersesat di semak-semak, memberinya makan, dan merawatnya hingga menjadi sahabat bernama Mimi!',
    pages: [
      {
        pageNumber: 1,
        title: 'Bagian 1: Mendengar Suara Meong',
        subtitle: 'Suara Misterius di Semak',
        image: '/arkan_kucing_1.png?v=kucing_v1',
        badge: 'Semak Taman',
        badgeColor: 'bg-green-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Suara apa itu, ya? Meong-meong?',
        storyContent: 'Suatu pagi, Arkan mendengar suara meong-meong di semak-semak. Arkan penasaran dan mencari dari mana suaranya.',
        missionText: '🐱 Mendengar Suara Kucing Kecil',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🐱 🌿 ❓'
      },
      {
        pageNumber: 2,
        title: 'Bagian 2: Menemukan Kucing Tersesat',
        subtitle: 'Keberanian Arkan Menolong',
        image: '/arkan_kucing_2.png?v=kucing_v1',
        badge: 'Kucing Takut',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Jangan takut, kucing kecil. Arkan akan tolong kamu.',
        storyContent: 'Ternyata ada seekor anak kucing yang tersesat dan tidak bisa keluar dari semak. Ia terlihat takut dan lapar.',
        missionText: '💪 Keberhatian Menolong Kucing',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '🥺 🐱 🤝'
      },
      {
        pageNumber: 3,
        title: 'Bagian 3: Memberi Makan & Minum',
        subtitle: 'Kasih Sayang di Rumah',
        image: '/arkan_kucing_3.png?v=kucing_v1',
        badge: 'Susu & Makanan',
        badgeColor: 'bg-blue-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Ini susu dan makanan untukmu. Makan yang banyak ya, biar sehat!',
        storyContent: 'Arkan dengan hati-hati mengeluarkan kucing kecil itu dari semak-semak. Ia membawanya pulang dan memberinya makan serta minum.',
        missionText: '🥛 Memberi Makan & Susu',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '🥛 🍲 🐱'
      },
      {
        pageNumber: 4,
        title: 'Bagian 4: Memberi Nama Mimi',
        subtitle: 'Sahabat Baru Arkan',
        image: '/arkan_kucing_4.png?v=kucing_v1',
        badge: 'Sahabat Mimi',
        badgeColor: 'bg-pink-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Hai, Mimi! Mulai sekarang kita berteman, ya!',
        storyContent: 'Setelah makan, kucing kecil itu merasa lebih baik dan tidak takut lagi. Arkan memberinya nama "Mimi".',
        missionText: '💖 Berteman dengan Mimi',
        bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        emoji: '🐈‍⬛ 💖 ✨'
      },
      {
        pageNumber: 5,
        title: 'Bagian 5: Bermain Bersama Mimi',
        subtitle: 'Merawat & Menjaga Kebersihan',
        image: '/arkan_kucing_5.png?v=kucing_v1',
        badge: 'Bermain Ceria',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Yay! Seru sekali bermain bersama Mimi!',
        storyContent: 'Arkan merawat Mimi setiap hari. Mereka bermain bersama dan selalu menjaga kebersihan rumah.',
        missionText: '🧶 Bermain & Merawat Kebersihan',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '🧶 🐱 🎉'
      },
      {
        pageNumber: 6,
        title: 'Bagian 6: Kebahagiaan Berbuat Baik',
        subtitle: 'Tumbuh Sehat & Bahagia',
        image: '/arkan_kucing_6.png?v=kucing_v1',
        badge: 'Hati Bahagia',
        badgeColor: 'bg-teal-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Aku senang dapat menolong Mimi. Berbuat baik membuat hati bahagia!',
        storyContent: 'Arkan belajar bahwa menolong makhluk kecil adalah perbuatan yang baik. Mimi pun tumbuh sehat dan bahagia bersama Arkan.',
        missionText: '🌟 Hati Bahagia karena Berbuat Baik',
        bgGradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
        emoji: '🤗 🐱 🌟'
      }
    ]
  },
  {
    id: 'buku-6',
    title: 'Arkan dan Petualangan di Hutan Mini',
    subtitle: 'Cerita untuk Anak Usia 4 Tahun',
    coverImage: '/arkan_hutan_cover.png?v=hutan_v1',
    category: 'Karakter & Moral 💖',
    badge: '🌟 Terbaru',
    badgeColor: 'bg-green-8',
    readTime: '3 Menit',
    summary: 'Petualangan seru Arkan dan Mama di Hutan Mini! Belajar kepedulian menolong anak burung jatuh dari sarang bersama pak petugas.',
    pages: [
      {
        pageNumber: 1,
        title: 'Bagian 1: Berkunjung ke Hutan Mini',
        subtitle: 'Melihat Banyak Hewan Lucu',
        image: '/arkan_hutan_1.png?v=hutan_v1',
        badge: 'Hutan Mini',
        badgeColor: 'bg-green-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Wah! Lihat itu, Mama! Kelinci! Lucu sekali!',
        storyContent: 'Hari Minggu, Arkan dan Mama berkunjung ke Hutan Mini di kota. Arkan sangat senang karena bisa melihat banyak hewan!',
        missionText: '🐰 Mengenal Hewan di Hutan Mini',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🐰 🌳 ✨'
      },
      {
        pageNumber: 2,
        title: 'Bagian 2: Anak Burung yang Jatuh',
        subtitle: 'Di Bawah Pohon Rindang',
        image: '/arkan_hutan_2.png?v=hutan_v1',
        badge: 'Anak Burung',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Aduh... kamu kenapa sendirian di sini?',
        storyContent: 'Tiba-tiba, Arkan melihat anak burung di bawah pohon. Anak burung itu sepertinya jatuh dari sarangnya.',
        missionText: '🐥 Menaruh Empati pada Hewan Kecil',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '🐥 🌳 🥺'
      },
      {
        pageNumber: 3,
        title: 'Bagian 3: Memanggil Petugas Hutan Mini',
        subtitle: 'Meminta Bantuan Pak Petugas',
        image: '/arkan_hutan_3.png?v=hutan_v1',
        badge: 'Pak Petugas',
        badgeColor: 'bg-blue-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Pak, ada anak burung yang jatuh dari sarangnya.',
        storyContent: 'Arkan tidak tega. Ia memanggil petugas Hutan Mini dan memberi tahu kejadian itu.',
        missionText: '👮‍♂️ Meminta Bantuan Petugas',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '👮‍♂️ 📣 🤝'
      },
      {
        pageNumber: 4,
        title: 'Bagian 4: Mengembalikan ke Sarang',
        subtitle: 'Anak Burung Aman Kembali',
        image: '/arkan_hutan_4.png?v=hutan_v1',
        badge: 'Sarang Burung',
        badgeColor: 'bg-teal-8',
        dialogueSpeaker: 'Petugas',
        dialogueText: 'Sekarang kamu aman ya, Nak. Hati-hati ya!',
        storyContent: 'Petugas bersama Arkan mengembalikan anak burung itu ke sarangnya yang aman.',
        missionText: '🪹 Menyelamatkan Anak Burung',
        bgGradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
        emoji: '🪹 🐥 💚'
      },
      {
        pageNumber: 5,
        title: 'Bagian 5: Hadiah Es Krim dari Mama',
        subtitle: 'Rasa Syukur & Kebahagiaan',
        image: '/arkan_hutan_5.png?v=hutan_v1',
        badge: 'Es Krim Lezat',
        badgeColor: 'bg-pink-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Terima kasih Mama! Hari ini menyenangkan sekali!',
        storyContent: 'Sebagai tanda terima kasih, Mama membelikan es krim favorit Arkan. Arkan senang sekali!',
        missionText: '🍦 Hadiah Kebaikan dari Mama',
        bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        emoji: '🍦 💖 😊'
      },
      {
        pageNumber: 6,
        title: 'Bagian 6: Menyayangi Semua Makhluk',
        subtitle: 'Pesan Kasih Sayang Hewan',
        image: '/arkan_hutan_6.png?v=hutan_v1',
        badge: 'Sayangi Hewan',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Aku akan selalu menjaga mereka. Semua makhluk hidup berhak bahagia!',
        storyContent: 'Arkan belajar bahwa menolong makhluk kecil adalah perbuatan baik. Ia berjanji akan selalu menjaga dan menyayangi hewan.',
        missionText: '💖 Menyayangi Semua Makhluk Hidup',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '💖 🌍 🕊️'
      }
    ]
  },
  {
    id: 'buku-5',
    title: 'Arkan Olahraga Pagi Sama Mama',
    subtitle: 'Cerita untuk Anak Usia 4 Tahun',
    coverImage: '/arkan_olahraga_cover.png?v=olahraga_v1',
    category: 'Olahraga 🚴',
    badge: '🌟 Terbaru',
    badgeColor: 'bg-emerald-8',
    readTime: '3 Menit',
    summary: 'Nikmatnya bangun pagi dan berolahraga bersama Mama yang memakai jilbab! Tubuh jadi sehat, segar, dan penuh kebahagiaan.',
    pages: [
      {
        pageNumber: 1,
        title: 'Bagian 1: Bangun Pagi dengan Semangat',
        subtitle: 'Bersiap Olahraga Pagi',
        image: '/arkan_olahraga_1.png?v=olahraga_v1',
        badge: 'Bangun Pagi',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Yay! Hari ini olahraga pagi sama Mama!',
        storyContent: 'Pagi-pagi Arkan bangun dengan semangat. Arkan siap olahraga bersama Mama!',
        missionText: '🌅 Bangun Pagi Ceria & Berenergi',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '🌅 🏃‍♂️ 💖'
      },
      {
        pageNumber: 2,
        title: 'Bagian 2: Pemanasan Bersama Mama',
        subtitle: 'Meregangkan Tubuh Sehat',
        image: '/arkan_olahraga_2.png?v=olahraga_v1',
        badge: 'Pemanasan Park',
        badgeColor: 'bg-blue-8',
        dialogueSpeaker: 'Mama',
        dialogueText: 'Pemanasan yuk, biar badan kita sehat!',
        storyContent: 'Mama mengajak Arkan pemanasan terlebih dahulu agar tubuh tidak kaku.',
        missionText: '🏃‍♂️ Pemanasan Sebelum Olahraga',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '🧘‍♂️ 🌳 🧕'
      },
      {
        pageNumber: 3,
        title: 'Bagian 3: Berlari-Lari Kecil di Taman',
        subtitle: 'Kegembiraan Berlari',
        image: '/arkan_olahraga_3.png?v=olahraga_v1',
        badge: 'Jogging Ceria',
        badgeColor: 'bg-teal-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Whee... asyik sekali!',
        storyContent: 'Arkan berlari-lari kecil mengelilingi taman. Arkan tertawa riang!',
        missionText: '🌳 Berlari Ceria Mengelilingi Taman',
        bgGradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
        emoji: '🏃‍♂️ 😁 💨'
      },
      {
        pageNumber: 4,
        title: 'Bagian 4: Bersepeda & Udara Segar',
        subtitle: 'Jalan Santai & Bersepeda',
        image: '/arkan_olahraga_4.png?v=olahraga_v1',
        badge: 'Bersepeda Taman',
        badgeColor: 'bg-sky-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Seru banget olahraga sama Mama!',
        storyContent: 'Setelah itu, mereka jalan santai dan bersepeda bersama. Udara pagi terasa segar!',
        missionText: '🚴‍♂️ Bersepeda Bersama Mama',
        bgGradient: 'linear-gradient(135deg, #cff4fc 0%, #9eeaf9 100%)',
        emoji: '🚴‍♂️ 🍃 🌞'
      },
      {
        pageNumber: 5,
        title: 'Bagian 5: Minum Air Putih & Makan Buah',
        subtitle: 'Menjaga Kesehatan Tubuh',
        image: '/arkan_olahraga_5.png?v=olahraga_v1',
        badge: 'Nutrisi Sehat',
        badgeColor: 'bg-emerald-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Segar dan berenergi!',
        storyContent: 'Setelah olahraga, Arkan minum air putih dan makan buah. Tubuh jadi segar dan berenergi!',
        missionText: '🍎 Nutrisi Sehat & Air Putih',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🍎 💧 🔋'
      },
      {
        pageNumber: 6,
        title: 'Bagian 6: Janji Rajin Olahraga',
        subtitle: 'Kebersamaan yang Menyenangkan',
        image: '/arkan_olahraga_6.png?v=olahraga_v1',
        badge: 'High Five Mama',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Olahraga bersama Mama itu menyenangkan! Besok kita olahraga lagi ya!',
        storyContent: 'Arkan senang bisa olahraga pagi bersama Mama. Arkan berjanji akan rajin olahraga setiap hari!',
        missionText: '💖 Rutin Olahraga Setiap Hari',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '✋ 💖 🌟'
      }
    ]
  },
  {
    id: 'buku-4',
    title: 'Arkan dan Sepeda Barunya',
    subtitle: 'Cerita untuk Anak Usia 4 Tahun',
    coverImage: '/arkan_sepeda_cover.png?v=sepeda_v1',
    category: 'Olahraga 🚴',
    badge: '🌟 Terbaru',
    badgeColor: 'bg-red-8',
    readTime: '3 Menit',
    summary: 'Belajar naik sepeda membutuhkan latihan dan kesabaran. Ikuti semangat pantang menyerah Arkan hingga bisa mengayuh seimbang!',
    pages: [
      {
        pageNumber: 1,
        title: 'Bagian 1: Sepeda Baru dari Papa',
        subtitle: 'Kegembiraan di Pagi Hari',
        image: '/arkan_sepeda_1.png?v=sepeda_v1',
        badge: 'Sepeda Merah',
        badgeColor: 'bg-red-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Wah! Sepeda baru untukku! Terima kasih, Papa!',
        storyContent: 'Suatu pagi, Papa memberi Arkan sepeda baru. Arkan sangat senang!',
        missionText: '🚲 Hadiah Sepeda Baru dari Papa',
        bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
        emoji: '🚲 🎁 ✨'
      },
      {
        pageNumber: 2,
        title: 'Bagian 2: Belajar Mengayuh Sepeda',
        subtitle: 'Mencoba Pertama Kali',
        image: '/arkan_sepeda_2.png?v=sepeda_v1',
        badge: 'Belajar Mengayuh',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Aduh! Oleng!',
        storyContent: 'Arkan ingin langsung bisa naik sepeda. Tapi... saat mulai mengayuh, ia oleng dan hampir jatuh.',
        missionText: '💪 Tidak Menyerah & Mencoba Lagi',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '⚖️ 🚲 😮'
      },
      {
        pageNumber: 3,
        title: 'Bagian 3: Berlatih Bersama Papa',
        subtitle: 'Semangat Berlatih',
        image: '/arkan_sepeda_3.png?v=sepeda_v1',
        badge: 'Didampingi Papa',
        badgeColor: 'bg-blue-8',
        dialogueSpeaker: 'Papa',
        dialogueText: 'Pelan-pelan ya, Arkan. Kamu pasti bisa!',
        storyContent: 'Arkan berlatih terus dengan semangat. Papa selalu mendampinginya dan memberi semangat.',
        missionText: '🔥 Berlatih dengan Semangat',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '👨‍👦 🚴‍♂️ 🌟'
      },
      {
        pageNumber: 4,
        title: 'Bagian 4: Bangkit Kembali Saat Jatuh',
        subtitle: 'Keberanian & Pantang Menyerah',
        image: '/arkan_sepeda_4.png?v=sepeda_v1',
        badge: 'Bangkit Kembali',
        badgeColor: 'bg-orange-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Tidak apa-apa. Aku akan coba lagi!',
        storyContent: 'Arkan jatuh lagi. Lututnya sedikit sakit, tapi ia bangkit dan tersenyum.',
        missionText: '🌟 Bangkit & Senyum dengan Berani',
        bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        emoji: '🙂 💪 🌳'
      },
      {
        pageNumber: 5,
        title: 'Bagian 5: Akhirnya Bisa Naik Sepeda!',
        subtitle: 'Keberhasilan Bersepeda',
        image: '/arkan_sepeda_5.png?v=sepeda_v1',
        badge: 'Mengayuh Seimbang',
        badgeColor: 'bg-emerald-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Yay! Aku bisa naik sepeda!',
        storyContent: 'Setelah berlatih berkali-kali, akhirnya Arkan bisa mengayuh dengan seimbang!',
        missionText: '🎉 Keberhasilan Mengayuh Seimbang',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🎉 🚴‍♂️ 💨'
      },
      {
        pageNumber: 6,
        title: 'Bagian 6: Bangga pada Diri Sendiri',
        subtitle: 'Pesan Kesabaran & Latihan',
        image: '/arkan_sepeda_6.png?v=sepeda_v1',
        badge: 'Pantang Menyerah',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Aku bangga pada diriku! Aku tidak menyerah!',
        storyContent: 'Arkan belajar bahwa dengan latihan, kesabaran, dan tidak mudah menyerah, kita bisa mencapai apa yang kita inginkan.',
        missionText: '👑 Pantang Menyerah Raih Impian',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '👑 👍 ✨'
      }
    ]
  },
  {
    id: 'buku-3',
    title: 'Arkan dan Toples Kebaikan',
    subtitle: 'Cerita Karakter & Moral (Usia 4 Tahun)',
    coverImage: '/arkan_toples_cover.png?v=toples_v1',
    category: 'Karakter & Moral 💖',
    badge: '✨ Terbaru',
    badgeColor: 'bg-amber-8',
    readTime: '3 Menit',
    summary: 'Kebaikan sekecil apa pun sangat berarti! Ikuti kisah Arkan mengumpulkan kancing kebaikan setiap hari di toplesnya.',
    pages: [
      {
        pageNumber: 1,
        title: 'Bagian 1: Toples Kebaikan Arkan',
        subtitle: 'Kebaikan Sekecil Apa pun Sangat Berarti',
        image: '/arkan_toples_1.png?v=toples_v1',
        badge: 'Toples Kancing',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Kebaikan sekecil apa pun, sangat berarti!',
        storyContent: 'Arkan memiliki sebuah toples kecil. Setiap kali Arkan melakukan kebaikan, Arkan memasukkan satu kancing ke dalamnya.',
        missionText: '🫙 Menghargai Kebaikan Kecil',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '🫙 ✨ 🟡'
      },
      {
        pageNumber: 2,
        title: 'Bagian 2: Membantu Mama Merapikan Mainan',
        subtitle: 'Kebaikan di Rumah',
        image: '/arkan_toples_2.png?v=toples_v1',
        badge: 'Kebaikan di Rumah',
        badgeColor: 'bg-emerald-8',
        dialogueSpeaker: 'Mama',
        dialogueText: 'Terima kasih ya, Arkan. Mama senang sekali!',
        storyContent: 'Pagi itu, Arkan membantu Mama merapikan mainan tanpa diminta. Arkan memasukkan satu kancing ke dalam toplesnya.',
        missionText: '🧸 Membantu Tanpa Diminta',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🧸 🧹 💖'
      },
      {
        pageNumber: 3,
        title: 'Bagian 3: Meminjamkan Pensil di Sekolah',
        subtitle: 'Berbagi dengan Teman',
        image: '/arkan_toples_3.png?v=toples_v1',
        badge: 'Berbagi di Sekolah',
        badgeColor: 'bg-sky-8',
        dialogueSpeaker: 'Teman',
        dialogueText: 'Terima kasih, Arkan. Kamu baik sekali!',
        storyContent: 'Di sekolah, Arkan melihat temannya sedih karena pensilnya jatuh dan patah. Arkan meminjamkan pensilnya. Arkan memasukkan satu kancing lagi.',
        missionText: '✏️ Suka Berbagi & Menolong',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '✏️ 🏫 🤝'
      },
      {
        pageNumber: 4,
        title: 'Bagian 4: Menyiram Tanaman Bersama Nenek',
        subtitle: 'Kebaikan di Sore Hari',
        image: '/arkan_toples_4.png?v=toples_v1',
        badge: 'Taman Nenek',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Nenek',
        dialogueText: 'Wah, cucu nenek hebat sekali!',
        storyContent: 'Sore hari, Arkan membantu nenek menyiram tanaman. Arkan memasukkan satu kancing lagi.',
        missionText: '🌻 Menyayangi Nenek & Tanaman',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '🌻 👵 💧'
      },
      {
        pageNumber: 5,
        title: 'Bagian 5: Toples Kebaikan Hampir Penuh',
        subtitle: 'Rasa Bangga & Bersyukur',
        image: '/arkan_toples_5.png?v=toples_v1',
        badge: 'Toples Hampir Penuh',
        badgeColor: 'bg-indigo-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Alhamdulillah, hari ini banyak kebaikan yang bisa aku lakukan!',
        storyContent: 'Malamnya, Arkan melihat toplesnya sudah hampir penuh! Arkan merasa senang dan bangga.',
        missionText: '✨ Bersyukur atas Kebaikan',
        bgGradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        emoji: '🌟 🫙 🤲'
      },
      {
        pageNumber: 6,
        title: 'Bagian 6: Berjanji Berbuat Baik Setiap Hari',
        subtitle: 'Dunia Lebih Indah',
        image: '/arkan_toples_6.png?v=toples_v1',
        badge: 'Pesan Kebaikan',
        badgeColor: 'bg-teal-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Ayo, teman-teman! Kita lakukan kebaikan setiap hari, agar dunia menjadi lebih indah!',
        storyContent: 'Arkan tahu, melakukan kebaikan membuat hati bahagia dan banyak orang tersenyum. Arkan berjanji akan terus berbuat baik setiap hari.',
        missionText: '🌟 Menebar Kebaikan Setiap Hari',
        bgGradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
        emoji: '🌍 😊 💕'
      }
    ]
  },
  {
    id: 'buku-2',
    title: 'Arkan dan Anak Burung Kecil',
    subtitle: 'Cerita Moral & Kasih Sayang Hewan (Usia 4 Tahun)',
    coverImage: '/arkan_burung_cover.jpg?v=burung_hd_v2',
    category: 'Karakter & Moral 💖',
    badge: '🌟 Cerita Terbaru',
    badgeColor: 'bg-blue-8',
    readTime: '3 Menit',
    summary: 'Berbuat baik kepada makhluk kecil adalah kebaikan yang sangat berharga. Ikuti kisah Arkan menjaga anak burung kecil dengan sabar!',
    pages: [
      {
        pageNumber: 1,
        title: 'Halaman 1: Mendengar Suara Cip-Cip',
        subtitle: 'Bermain di Halaman Rumah',
        image: '/arkan_burung_1.jpg?v=burung_hd_v2',
        badge: 'Halaman Rumah',
        badgeColor: 'bg-emerald-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Wah, ada anak burung! Kenapa sendirian, ya?',
        storyContent: 'Pagi itu, Arkan sedang bermain di halaman rumah. Tiba-tiba, Arkan mendengar suara cip... cip... cip...',
        missionText: '🐤 Menyayangi Hewan Kecil',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '🐣 🏡 🌳'
      },
      {
        pageNumber: 2,
        title: 'Halaman 2: Memperhatikan Sekeliling',
        subtitle: 'Menjaga Teman Kecil',
        image: '/arkan_burung_2.jpg?v=burung_hd_v2',
        badge: 'Menjaga Sekeliling',
        badgeColor: 'bg-sky-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Tenang ya, aku di sini jagain kamu.',
        storyContent: 'Arkan melihat sekeliling. Mungkin induknya sedang mencari makanan. Arkan tidak memindahkan anak burung itu agar induknya bisa menemukannya.',
        missionText: '👀 Bersikap Bijak & Peduli',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '👀 🌿 🐦'
      },
      {
        pageNumber: 3,
        title: 'Halaman 3: Tempat yang Nyaman',
        subtitle: 'Membuatkan Rumah Kecil',
        image: '/arkan_burung_3.jpg?v=burung_hd_v2',
        badge: 'Kardus Kecil',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Ini rumah kecilmu ya. Semoga kamu nyaman.',
        storyContent: 'Arkan membuatkan tempat yang nyaman untuk anak burung itu. Arkan mengambil daun kering yang lembut dan menaruhnya di dalam kardus kecil.',
        missionText: '📦 Memberikan Kenyamanan',
        bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        emoji: '📦 🍂 ✨'
      },
      {
        pageNumber: 4,
        title: 'Halaman 4: Menunggu dengan Sabar',
        subtitle: 'Belajar Kesabaran',
        image: '/arkan_burung_4.jpg?v=burung_hd_v2',
        badge: 'Taman Rumah',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Aku tunggu di sini ya...',
        storyContent: 'Arkan menunggu dengan sabar sampai siang hari. Ia tidak pergi jauh dari tempat itu.',
        missionText: '⏳ Belajar Bersabar',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '⏳ ☀️ 🌳'
      },
      {
        pageNumber: 5,
        title: 'Halaman 5: Induk Burung Kembali',
        subtitle: 'Kebahagiaan Menolong',
        image: '/arkan_burung_5.jpg?v=burung_hd_v2',
        badge: 'Induk Burung Datang',
        badgeColor: 'bg-teal-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Syukurlah, induknya sudah kembali!',
        storyContent: 'Akhirnya, induk burung kembali! Ia turun dan memberi makan anaknya. Arkan senang melihatnya.',
        missionText: '❤️ Merasakan Kebahagiaan',
        bgGradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
        emoji: '🕊️ 🌾 💞'
      },
      {
        pageNumber: 6,
        title: 'Halaman 6: Pesan Kebaikan',
        subtitle: 'Menolong dengan Hati Baik',
        image: '/arkan_burung_6.jpg?v=burung_hd_v2',
        badge: 'Salam Perpisahan',
        badgeColor: 'bg-emerald-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Sampai jumpa ya, teman kecil! Jaga dirimu baik-baik.',
        storyContent: 'Arkan melambaikan tangan pelan-pelan. Ia senang bisa menolong anak burung kecil. Arkan belajar bahwa menolong dengan hati yang baik itu membuat kita bahagia.',
        missionText: '🌟 Berbuat Baik Sangat Berharga',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '👋 🐤 💖'
      }
    ]
  },
  {
    id: 'buku-1',
    title: 'Arkan si Anak Baik Hati',
    subtitle: 'Cerita Karakter & Moral untuk Anak Usia 4 Tahun',
    coverImage: '/arkan_baik_hati_cover.jpg?v=20260726',
    category: 'Karakter & Moral 💖',
    badge: '✨ Terbaru',
    badgeColor: 'bg-emerald-7',
    readTime: '4 Menit',
    summary: 'Belajar tentang kebaikan hati, sifat suka menolong, dan indahnya persahabatan bersama Arkan dan temannya, Bima!',
    pages: [
      {
        pageNumber: 1,
        title: 'Halaman 1: Perkenalan Arkan',
        subtitle: 'Anak Suka Menolong',
        image: '/arkan_baik_hati_1.jpg?v=20260726',
        badge: 'Rumah Arkan',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Halo teman-teman! Namaku Arkan!',
        storyContent: 'Ini Arkan. Arkan adalah anak yang baik hati dan suka menolong.',
        missionText: '💛 Sifat Terpuji: Selalu Berbuat Baik & Menolong Sesama',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '👋 👦 🌟'
      },
      {
        pageNumber: 2,
        title: 'Halaman 2: Buku Bima Terjatuh',
        subtitle: 'Melihat Teman Kesusahan',
        image: '/arkan_baik_hati_2.jpg?v=20260726',
        badge: 'Taman Sekolah',
        badgeColor: 'bg-orange-8',
        dialogueSpeaker: 'Bima',
        dialogueText: 'Oh tidak, buku-bukuku terjatuh!',
        storyContent: 'Suatu hari, Arkan melihat temannya, Bima, menjatuhkan bukunya.',
        missionText: '👀 Kepedulian: Pekalah Saat Melihat Teman Membutuhkan Bantuan',
        bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
        emoji: '📚 😟 🏫'
      },
      {
        pageNumber: 3,
        title: 'Halaman 3: Menolong dengan Senyuman',
        subtitle: 'Suka Menolong',
        image: '/arkan_baik_hati_3.jpg?v=20260726',
        badge: 'Sikap Menolong',
        badgeColor: 'bg-green-7',
        dialogueSpeaker: 'Arkan',
        dialogueText: 'Mari kubantu ambilkan bukumu, Bima!',
        storyContent: 'Arkan segera membantu Bima mengambilkan buku-bukunya dengan senyum.',
        missionText: '🤝 Aksi Kebaikan: Bantu Teman Tanpa Ragu & Dengan Tulus',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🤝 😊 📚'
      },
      {
        pageNumber: 4,
        title: 'Halaman 4: Ucapan Terima Kasih',
        subtitle: 'Menjaga Pertemanan',
        image: '/arkan_baik_hati_4.jpg?v=20260726',
        badge: 'Menjaga Pertemanan',
        badgeColor: 'bg-teal-7',
        dialogueSpeaker: 'Bima',
        dialogueText: 'Terima kasih ya, Arkan! Kamu baik sekali!',
        storyContent: 'Bima berkata, "Terima kasih ya, Arkan! Kamu baik sekali!" Arkan hanya tersenyum.',
        missionText: '💬 Sopan Santun: Ucapkan Terima Kasih Saat Dibantu Teman',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '💖 😄 ✨'
      },
      {
        pageNumber: 5,
        title: 'Halaman 5: Pujian Ibu Guru',
        subtitle: 'Teladan di Kelas',
        image: '/arkan_baik_hati_5.jpg?v=20260726',
        badge: 'Ruang Kelas',
        badgeColor: 'bg-purple-7',
        dialogueSpeaker: 'Ibu Guru',
        dialogueText: 'Arkan anak yang baik hati. Kalian semua hebat!',
        storyContent: 'Ibu guru melihat itu dan memuji Arkan di depan teman-teman.',
        missionText: '👏 Teladan Baik: Menjadi Contoh Kebaikan Bagi Teman-Teman',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '👩‍🏫 👏 🏫'
      },
      {
        pageNumber: 6,
        title: 'Halaman 6: Kebahagiaan Hati',
        subtitle: 'Pesan Moral Cerita',
        image: '/arkan_baik_hati_6.jpg?v=20260726',
        badge: 'Refleksi Diri',
        badgeColor: 'bg-pink-7',
        dialogueSpeaker: 'Arkan & Ibu Guru',
        dialogueText: 'Menolong teman membuat hati tenang dan bahagia!',
        storyContent: 'Arkan belajar, menjadi anak baik hati membuat banyak teman senang dan Allah juga senang.',
        missionText: '⭐ Pesan cerita: Ayo jadi anak baik hati seperti Arkan!',
        bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        emoji: '❤️ 🙏 🌈'
      }
    ]
  },
  {
    id: 'buku-2',
    title: 'Petualangan Arkan di Hutan Huruf',
    subtitle: 'Menjelajah Alfabet & Menyelamatkan Ikan Badut',
    coverImage: '/bedtime_story_card.png',
    category: 'Petualangan 🚩',
    badge: '🔥 Populer',
    badgeColor: 'bg-red-7',
    readTime: '5 Menit',
    summary: 'Petualangan seru Arkan dan Tigo si Naga menjelajah Hutan Huruf, menyelam di laut, dan mengikuti balapan sepeda!',
    pages: [
      {
        pageNumber: 1,
        title: 'Halaman 1: Pendahuluan',
        subtitle: 'Ajakan Petualangan',
        image: '/image_0.png',
        badge: 'Kamar Arkan',
        badgeColor: 'bg-blue-7',
        dialogueSpeaker: 'Tigo (Naga)',
        dialogueText: `Ayo ${store.child.name}, hari ini kita petualangan lagi ke Hutan Huruf dan Pulau Hewan!`,
        storyContent: `Tigo (naga) berdiri di samping tempat tidur ${store.child.name} dengan headphone favoritnya, mengajak berpetualang. ${store.child.name} tersenyum setuju, dan Kiko si kucing meong gembira!`,
        missionText: 'Misi Hari Ini: Belajar Huruf & Hitung Angka',
        bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        emoji: '🌅 🐉 🐱'
      },
      {
        pageNumber: 2,
        title: 'Halaman 2: Petualangan Laut',
        subtitle: 'Menyelamatkan Ikan',
        image: '/image_1.png',
        badge: 'Laut Dalam',
        badgeColor: 'bg-cyan-8',
        dialogueSpeaker: 'Panel Kontrol Kapal',
        dialogueText: `Tolong ${store.child.name} selamatkan ikan dari jaring!`,
        storyContent: `${store.child.name} (memakai setelan selam) dan Tigo menyelam ke dasar laut untuk menyelamatkan ikan badut yang terjebak di jaring. ${store.child.name} dengan sigap menekan tombol 'A' di panel kontrol!`,
        missionText: 'Misi: Tekan Tombol A & Selamatkan Ikan Badut',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '🥽 🐠 🌊'
      },
      {
        pageNumber: 3,
        title: 'Halaman 3: Petualangan Darat',
        subtitle: 'Hutan Huruf & Pulau Hewan',
        image: '/image_2.png',
        badge: 'Hutan Huruf',
        badgeColor: 'bg-green-8',
        dialogueSpeaker: 'Tigo (Naga)',
        dialogueText: 'Hutan Huruf dan Pulau Hewan menanti kita!',
        storyContent: `Tigo mengumumkan kedatangan mereka! Mereka mendarat dengan balon udara di Hutan Huruf, di mana pohon-pohon berbentuk huruf raksasa. Hewan-hewan hutan menyambut sambil memegang blok angka.`,
        missionText: 'Misi: Petik Huruf Raksasa & Hitung Angka',
        bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        emoji: '🎈 🔤 🌳'
      },
      {
        pageNumber: 4,
        title: 'Halaman 4: Balapan Sepeda Keluarga',
        subtitle: 'Semangat Olahraga',
        image: '/image_3.png',
        badge: 'Jalur Outdoor',
        badgeColor: 'bg-orange-8',
        dialogueSpeaker: store.child.name,
        dialogueText: 'Hampir sampai!',
        storyContent: `${store.child.name} dan orang tuanya berbalapan sepeda di jalur outdoor yang cerah dan rindang. ${store.child.name} mengayuh kencang sambil berteriak gembira menuju garis finish!`,
        missionText: 'Timer Balapan: 00:45 Menuju Finish',
        bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
        emoji: '🚴‍♂️ 👨‍👩‍👦 🏁'
      },
      {
        pageNumber: 5,
        title: 'Halaman 5: Tantangan Logika',
        subtitle: 'Menghubungkan Bentuk',
        image: '/image_4.png',
        badge: 'Gerbang Kastil Ilmu',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Tigo (Naga)',
        dialogueText: `${store.child.name}, kita perlu menghubungkan segitiga kuning!`,
        storyContent: `Tigo menunjuk panel kontrol ajaib. Mereka menyelesaikan puzzle bentuk logika di depan gerbang Kastil Ilmu untuk membuka pintu gerbang raksasa!`,
        missionText: 'Misi: Hubungkan Bentuk Logika Segitiga Kuning',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '📐 🔮 🏰'
      },
      {
        pageNumber: 6,
        title: 'Halaman 6: Hadiah dan Perayaan',
        subtitle: 'Piala Emas & Level Up',
        image: '/image_5.png',
        badge: 'Trophy Room',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Pengumuman Game',
        dialogueText: `Hebat ${store.child.name}! Level 13 & Piala Emas Dimenangkan!`,
        storyContent: `${store.child.name} (Level 13 di profil tablet) dan teman-temannya kembali di kamar, merayakan kemenangan. ${store.child.name} memegang trofi piala emas besar dengan mahkota berkilauan!`,
        missionText: 'Hadiah: Piala Emas Mahkota & Level 13 Unlocked',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '👑 🏆 🎉'
      },
      {
        pageNumber: 7,
        title: 'Halaman 7: Cerita Malam dan Refleksi',
        subtitle: 'Kastil Ilmu Besok Hari',
        image: '/image_6.png',
        badge: 'Refleksi Malam',
        badgeColor: 'bg-indigo-8',
        dialogueSpeaker: 'Ayah & ' + store.child.name,
        dialogueText: `Selamat malam, ${store.child.name}. Besok ada petualangan baru!`,
        storyContent: `Keluarga berkumpul di tempat tidur ${store.child.name}. Ayah membacakan buku cerita tentang Kastil Ilmu. ${store.child.name} merenung bahagia: "Logika dan memoriku sudah 90%, besok kita akan mencoba Kastil Ilmu!"`,
        missionText: 'Stat Refleksi: Logika 90% | Memori 90%',
        bgGradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        emoji: '📚 🌙 🛌'
      }
    ]
  },
  {
    id: 'buku-3',
    title: 'Misteri Samudra & Terumbu Karang',
    subtitle: 'Misi Penyelamatan Ikan Badut di Dasar Laut',
    coverImage: '/underwater_game.png',
    category: 'Eksplorasi 🌊',
    badge: '✨ Buku Baru',
    badgeColor: 'bg-cyan-7',
    readTime: '3 Menit',
    summary: 'Menyelam jauh ke dalam laut samudra bersama Arkan dan Tigo untuk membebaskan ikan badut dari perangkap jaring terumbu karang!',
    pages: [
      {
        pageNumber: 1,
        title: 'Misi Penyelam Cilik',
        subtitle: 'Menyelam Bersama Tigo',
        image: '/underwater_game.png',
        badge: 'Samudra Dalam',
        badgeColor: 'bg-blue-8',
        dialogueSpeaker: 'Tigo (Naga)',
        dialogueText: `Perhatikan radar, ${store.child.name}! Ada gelombang sinyal ikan badut!`,
        storyContent: `${store.child.name} memakai kacamata selam dan tabung oksigen super. Bersama Tigo, mereka meluncur melintasi kawanan ikan warnawarni di terumbu karang.`,
        missionText: 'Misi: Temukan Sinyal Ikan Badut di Kedalaman 15 Meter',
        bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        emoji: '🥽 🐠 🌊'
      },
      {
        pageNumber: 2,
        title: 'Menyelesaikan Tombol Kontrol',
        subtitle: 'Aksi Cepat Tombol A',
        image: '/image_1.png',
        badge: 'Jaring Terumbu',
        badgeColor: 'bg-cyan-8',
        dialogueSpeaker: store.child.name,
        dialogueText: 'Tekan tombol A sekarang!',
        storyContent: `Jaring terperangkap di antara karang raksasa. Dengan ketangkasan tangan, ${store.child.name} mengarahkan robot pencapit dan menekan tombol A tepat pada waktunya!`,
        missionText: 'Kecepatan Reaksi: 100% Presisi Bebaskan Jaring',
        bgGradient: 'linear-gradient(135deg, #cff4fc 0%, #9eeaf9 100%)',
        emoji: '🦀 🕹️ ⚡'
      },
      {
        pageNumber: 3,
        title: 'Pesta Tarian Laut',
        subtitle: 'Dolphin & Ikan Bebas',
        image: '/underwater_game.png',
        badge: 'Kemenangan Laut',
        badgeColor: 'bg-teal-7',
        dialogueSpeaker: 'Lumba-lumba Cerdas',
        dialogueText: 'Terima kasih Arkan! Kamu pahlawan samudra kami!',
        storyContent: `Ikan badut melompat gembira dan kawanan lumba-lumba menari membentuk lingkaran air terjun di sekeliling Arkan dan Tigo. Misi samudra sukses besar!`,
        missionText: 'Bonus Poin: +150 XP Penyelam Handal',
        bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        emoji: '🐬 🌟 👑'
      }
    ]
  },
  {
    id: 'buku-3',
    title: 'Balapan Sepeda & Semangat Juara',
    subtitle: 'Mengayuh Kencang Menuju Garis Finish',
    coverImage: '/bicycle_race.png',
    category: 'Olahraga 🚴',
    badge: '⭐ Rekomendasi',
    badgeColor: 'bg-orange-7',
    readTime: '3 Menit',
    summary: 'Petualangan seru balapan sepeda outdoor bersama keluarga dan teman di lintasan hijau yang penuh rintangan menyenangkan.',
    pages: [
      {
        pageNumber: 1,
        title: 'Garis Start Ceria',
        subtitle: 'Persiapan Helm & Sepeda',
        image: '/bicycle_race.png',
        badge: 'Jalur Hijau',
        badgeColor: 'bg-orange-8',
        dialogueSpeaker: 'Ayah & Ibu',
        dialogueText: `Siap... satu, dua, tiga... kayuh sepedamu, ${store.child.name}!`,
        storyContent: `Roda sepeda Arkan berputar cepat di lintasan taman yang rindang. Burung-burung berkicau memberi semangat saat Arkan memimpin di garis depan!`,
        missionText: 'Misi: Kayuh Sepeda & Hindari Rintangan Daun',
        bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
        emoji: '🚴‍♂️ ☀️ 🍃'
      },
      {
        pageNumber: 2,
        title: 'Tanjakan Semangat',
        subtitle: 'Pantang Menyerah',
        image: '/image_3.png',
        badge: 'Tanjakan Emas',
        badgeColor: 'bg-amber-7',
        dialogueSpeaker: store.child.name,
        dialogueText: 'Aku pasti bisa sampai di puncak tanjakan!',
        storyContent: `Meskipun jalanan menanjak, ${store.child.name} tidak menyerah sedikit pun. Dengan stamina penuh, sepeda meluncur mulus melintasi tanjakan!`,
        missionText: 'Stamina: 100% Energi Pantang Menyerah',
        bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        emoji: '🔥 🏁 🏆'
      },
      {
        pageNumber: 3,
        title: 'Medali Sehat Keluarga',
        subtitle: 'Kebersamaan & Kebahagiaan',
        image: '/bicycle_race.png',
        badge: 'Garis Finish',
        badgeColor: 'bg-green-7',
        dialogueSpeaker: 'Seluruh Keluarga',
        dialogueText: `Hooray ${store.child.name}! Juara Satu Sehat Bersama!`,
        storyContent: `${store.child.name} melintasi garis finish pita merah dengan senyuman lebar. Seluruh keluarga bertepuk tangan bangga atas semangat olahraga Arkan!`,
        missionText: 'Hadiah: Medali Emas Sepeda & 50 Koin',
        bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        emoji: '🥇 🥳 🎉'
      }
    ]
  },
  {
    id: 'buku-4',
    title: 'Kastil Logika & Mahkota Emas',
    subtitle: 'Memecahkan Teka-Teki & Mengumpulkan Trofi',
    coverImage: '/arkan_room_trophy.png',
    category: 'Sains & Logika 🧩',
    badge: '🏆 Pilihan Utama',
    badgeColor: 'bg-purple-7',
    readTime: '4 Menit',
    summary: 'Gunakan kecerdasan memori dan logika pemecahan teka-teki bentuk untuk membuka pintu rahasia Kastil Ilmu dan memenangkan Mahkota Emas!',
    pages: [
      {
        pageNumber: 1,
        title: 'Pintu Gerbang Rahasia',
        subtitle: 'Teka-Teki Segitiga Kuning',
        image: '/image_4.png',
        badge: 'Gerbang Kastil',
        badgeColor: 'bg-purple-8',
        dialogueSpeaker: 'Ksatria Teka-Teki',
        dialogueText: `Cocokkan pola logika segitiga untuk membuka gerbang!`,
        storyContent: `Di depan pintu gerbang batu raksasa, ada kristal berbentuk geometri bercahaya. ${store.child.name} menganalisis pola bentuk warna dengan teliti!`,
        missionText: 'Logika: Cocokkan Segitiga & Lingkaran Emas',
        bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        emoji: '🔮 📐 🏰'
      },
      {
        pageNumber: 2,
        title: 'Ruang Mahkota Kebanggaan',
        subtitle: 'Piala Emas Mahkota',
        image: '/image_5.png',
        badge: 'Trophy Room',
        badgeColor: 'bg-amber-8',
        dialogueSpeaker: 'Peti Ajaib',
        dialogueText: `Selamat! Kamu adalah Pangeran Logika Cerdas!`,
        storyContent: `Pintu gerbang terbuka dengan efek sihir gemerlap. Di tengah ruangan berkilau trofi emas murni berpuncak mahkota megah!`,
        missionText: 'Buka Kunci: Mahkota Emas Cerdas Unlocked',
        bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        emoji: '👑 🏆 ✨'
      },
      {
        pageNumber: 3,
        title: 'Bintang Prestasi Arkan',
        subtitle: 'Koleksi Trofi Bertambah',
        image: '/arkan_room_trophy.png',
        badge: 'Ruang Trofi',
        badgeColor: 'bg-indigo-7',
        dialogueSpeaker: store.child.name,
        dialogueText: 'Rak pialaku semakin penuh dan keren!',
        storyContent: `${store.child.name} memajang piala emas barunya di rak kamar. Ruangan berbinar hangat menandai keberhasilan petualangan hari ini!`,
        missionText: 'Prestasi: Memori 95% | Pemecahan Masalah 98%',
        bgGradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        emoji: '🌟 📖 🎓'
      }
    ]
  }
]);

const filteredBooks = computed(() => {
  if (selectedCategory.value === 'Semua 🌈' || selectedCategory.value === 'Semua') return storyBooks.value;
  return storyBooks.value.filter(b => b.category === selectedCategory.value);
});

const activePage = computed(() => {
  if (!selectedBook.value) return storyBooks.value[0].pages[0];
  return selectedBook.value.pages[currentPage.value];
});

function openBook(book: StoryBook) {
  selectedBook.value = book;
  currentPage.value = 0;
  stopAudio();
}

function backToShelf() {
  stopAudio();
  selectedBook.value = null;
  currentPage.value = 0;
}

function nextPage() {
  if (selectedBook.value && currentPage.value < selectedBook.value.pages.length - 1) {
    currentPage.value++;
    stopAudio();
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    stopAudio();
  }
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/bedtime_story_card.png';
}

function toggleLullabyMusic() {
  if (isLullabyPlaying.value) {
    stopLullabyMusic();
  } else {
    startLullabyMusic();
  }
}

function startLullabyMusic() {
  stopLullabyMusic();
  isLullabyPlaying.value = true;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    lullabyCtx = new AudioContextClass();

    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // Pentatonic C5 scale
    let noteIdx = 0;

    const playPentatonicChime = () => {
      if (!isLullabyPlaying.value || !lullabyCtx) return;

      const osc = lullabyCtx.createOscillator();
      const gain = lullabyCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIdx % notes.length], lullabyCtx.currentTime);

      gain.gain.setValueAtTime(0.06, lullabyCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, lullabyCtx.currentTime + 2.8);

      osc.connect(gain);
      gain.connect(lullabyCtx.destination);

      osc.start();
      osc.stop(lullabyCtx.currentTime + 2.8);

      noteIdx = (noteIdx + 1) % notes.length;
      lullabyTimer = setTimeout(playPentatonicChime, 1800);
    };

    playPentatonicChime();
  } catch (err) {
    console.log('Lullaby Audio Context error:', err);
  }
}

function stopLullabyMusic() {
  isLullabyPlaying.value = false;
  if (lullabyTimer) clearTimeout(lullabyTimer);
  if (lullabyCtx) {
    try {
      lullabyCtx.close();
    } catch (_) {}
    lullabyCtx = null;
  }
}

function toggleAudioNarration() {
  if (isNarrating.value) {
    stopAudio();
  } else {
    isNarrating.value = true;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const textToRead = activePage.value.storyContent;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.pitch = narratorPitch.value;
      utterance.rate = narratorRate.value;

      if (selectedVoiceURI.value && availableVoices.value.length > 0) {
        const foundVoice = availableVoices.value.find(v => v.voiceURI === selectedVoiceURI.value);
        if (foundVoice) {
          utterance.voice = foundVoice;
        }
      }

      utterance.onend = () => {
        isNarrating.value = false;
        // Auto advance to next page if enabled
        if (isAutoAdvance.value && selectedBook.value && currentPage.value < selectedBook.value.pages.length - 1) {
          setTimeout(() => {
            if (isAutoAdvance.value && selectedBook.value) {
              nextPage();
              toggleAudioNarration(); // Read next page
            }
          }, 2000);
        }
      };

      utterance.onerror = () => {
        isNarrating.value = false;
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        isNarrating.value = false;
      }, 4000);
    }
  }
}

function stopAudio() {
  isNarrating.value = false;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function finishStory() {
  stopAudio();
  stopLullabyMusic();
  store.child.coins += 50;
  store.child.xp += 100;
  selectedBook.value = null;
  currentPage.value = 0;
}

function closeModal() {
  stopAudio();
  stopLullabyMusic();
  selectedBook.value = null;
  currentPage.value = 0;
  isOpen.value = false;
}
</script>

<style scoped>
.fullscreen-story-container {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  background: radial-gradient(circle at top center, #1e1b4b 0%, #0f172a 60%, #020617 100%);
  color: #ffffff;
}

.title-glow {
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(59, 130, 246, 0.4);
}

.header-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  font-size: 28px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.gallery-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
}

.books-count-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.btn-close-fullscreen {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.btn-close-fullscreen:hover {
  background: #ef4444;
  border-color: #f87171;
  transform: scale(1.1);
}

/* Category Filter Bar */
.category-bar {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-pill-btn {
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.filter-pill-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.filter-pill-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5);
}

/* Book Gallery Cards */
.gallery-scroll-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.fullscreen-book-card {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  height: 310px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fullscreen-book-card:hover {
  transform: translateY(-8px) scale(1.03);
  border-color: #a855f7;
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.4);
}

.book-cover-wrapper {
  height: 150px;
  width: 100%;
}

.book-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-vignette-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(15, 23, 42, 0.95) 100%);
}

.badge-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pages-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 3px 12px;
  border-radius: 14px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category-pill {
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.btn-open-book {
  background: linear-gradient(180deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 0 #5b21b6;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-open-book:hover {
  transform: translateY(-2px);
}

/* ================= READER MODE STYLES ================= */
.reader-header {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-back-shelf-lg {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-back-shelf-lg:hover {
  transform: translateY(-2px);
}

.progress-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: all 0.2s ease;
}

.dot-completed {
  background: #3b82f6;
}

.dot-active {
  background: #f59e0b;
  transform: scale(1.4);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.8);
}

/* ================= MAGICAL FAIRYTALE READER MODE STYLES ================= */
.fairytale-reader-stage {
  height: calc(100vh - 65px);
  width: 100%;
}

.fairytale-open-book {
  width: 100%;
  max-width: 100%;
  height: calc(100vh - 80px);
  max-height: 100%;
  background: radial-gradient(circle at center, #fdf6e3 0%, #f4e8c1 100%);
  border-radius: 20px;
  border: 10px solid #5c3a21;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.7),
    inset 0 0 30px rgba(92, 58, 33, 0.3);
}

.book-spine-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 12px;
  transform: translateX(-50%);
  z-index: 20;
  background: linear-gradient(90deg, rgba(92, 58, 33, 0.35) 0%, rgba(40, 24, 12, 0.6) 50%, rgba(92, 58, 33, 0.35) 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.fairytale-bookmark-ribbon {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 90px;
  z-index: 25;
  background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
  border-radius: 0 0 6px 6px;
  border: 1px solid #7f1d1d;
}

/* Left Page (Golden Frame) */
.book-left-page {
  background: linear-gradient(135deg, #fffcf5 0%, #f8eed1 100%);
  border-radius: 20px 0 0 20px;
  border-right: 1px solid rgba(120, 80, 40, 0.15);
}

.golden-picture-frame {
  border: 6px solid #d97706;
  border-radius: 24px;
  background: #1e293b;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5);
}

.fairytale-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.golden-picture-frame:hover .fairytale-img {
  transform: scale(1.03);
}

.fairytale-img-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 30px rgba(217, 119, 6, 0.4);
  pointer-events: none;
}

.story-emoji-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.92);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 16px;
  border: 2px solid #f59e0b;
  color: #78350f;
}

.fairytale-dialogue-scroll {
  background: #fffbeb;
  border-left: 5px solid #f59e0b;
  border-radius: 16px;
  border: 2px solid #fde68a;
  color: #451a03;
}

/* Right Page (Parchment & Controls) */
.book-right-page {
  background: linear-gradient(135deg, #fefcf3 0%, #f5eac7 100%);
  border-radius: 0 20px 20px 0;
  border-left: 1px solid rgba(120, 80, 40, 0.15);
}

.story-chapter-title {
  color: #78350f;
  text-shadow: 1px 1px 2px rgba(251, 191, 36, 0.4);
}

.parchment-story-box {
  background: rgba(255, 255, 255, 0.65);
  border: 2px solid #eab308;
  border-radius: 20px;
  line-height: 1.75;
  color: #451a03;
}

.drop-cap {
  float: left;
  font-size: 52px;
  line-height: 42px;
  padding-top: 4px;
  padding-right: 8px;
  padding-left: 3px;
  color: #d97706;
  font-weight: bold;
}

.fairytale-mission-badge {
  background: #faf5ff;
  border: 2px dashed #c084fc;
  border-radius: 16px;
}

.fairytale-voice-box {
  background: rgba(254, 243, 199, 0.8);
  border: 1px solid #fde047;
  border-radius: 14px;
}

.voice-select-fairytale {
  background: #ffffff;
  color: #78350f;
  border: 1.5px solid #f59e0b;
  border-radius: 10px;
  padding: 3px 8px;
  outline: none;
  cursor: pointer;
}

/* Fairytale Buttons */
.btn-fairytale {
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.15s ease;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.btn-fairytale:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-prev-fairytale {
  background: linear-gradient(180deg, #78350f 0%, #451a03 100%);
  box-shadow: 0 4px 0 #270e02;
}

.btn-audio-fairytale {
  background: linear-gradient(180deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 0 #78350f;
}

.btn-lullaby-fairytale {
  background: linear-gradient(180deg, #9333ea 0%, #7e22ce 100%);
  box-shadow: 0 4px 0 #581c87;
}

.btn-lullaby-fairytale.active {
  background: linear-gradient(180deg, #ec4899 0%, #be185d 100%);
  box-shadow: 0 4px 0 #831843;
}

.btn-next-fairytale {
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 0 #1e40af;
}

.btn-finish-fairytale {
  background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  box-shadow: 0 4px 0 #166534;
}

.btn-fairytale:hover:not(:disabled) {
  transform: translateY(-2px);
}
</style>
