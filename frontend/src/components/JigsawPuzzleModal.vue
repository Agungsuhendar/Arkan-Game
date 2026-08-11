<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="scale" transition-hide="scale">
    <q-card class="jigsaw-puzzle-card column no-wrap fit font-quicksand relative-position">
      <!-- Top Bar Header -->
      <div class="puzzle-header-bar row items-center justify-between q-px-lg q-py-sm">
        <div class="row items-center q-gutter-x-md col-grow overflow-hidden">
          <span class="text-h4 title-emoji-pulse">🧩✨</span>
          <div class="column col ellipsis">
            <div class="text-h5 font-fredoka text-bold text-amber-3 header-title-glow ellipsis">
              Mainan Puzzle Gambar Ajaib Arkan
            </div>
            <div class="text-caption text-purple-2 font-fredoka ellipsis">
              {{ currentStep === 'select' ? 'Pilih Gambar & Jumlah Kepingan Puzzle Di Bawah Ini!' : 'Geser atau sentuh kepingan gambar ke tempat yang cocok!' }}
            </div>
          </div>
        </div>

        <!-- Desktop Top Action Buttons -->
        <div class="row items-center q-gutter-x-sm q-mr-md hide-on-mobile">
          <!-- Back to Selection Screen Button (Visible in Play Mode) -->
          <button
            v-if="currentStep === 'play'"
            class="btn-puzzle-action btn-change-theme font-fredoka shadow-6"
            @click="currentStep = 'select'"
            title="Pilih Gambar Lain"
          >
            🖼️ Ganti Gambar
          </button>

          <button
            v-if="currentStep === 'play'"
            class="btn-puzzle-action btn-hint-sparkle font-fredoka shadow-6"
            @click="handleSparkleHint"
          >
            💡 Petunjuk Sparkle
          </button>

          <button
            v-if="currentStep === 'play'"
            class="btn-puzzle-action font-fredoka shadow-6"
            :class="showGhostHint ? 'btn-ghost-on' : 'btn-ghost-off'"
            @click="showGhostHint = !showGhostHint"
          >
            👁️ Bayangan: {{ showGhostHint ? 'ON' : 'OFF' }}
          </button>
        </div>

        <!-- Global Top Right Close (X) Button -->
        <button
          class="close-puzzle-btn flex flex-center font-fredoka shadow-6 cursor-pointer"
          @click="closeModal"
          title="Tutup Puzzle"
        >
          ✖️
        </button>
      </div>

      <!-- STEP 1: Picture & Difficulty Selection Workspace (Katalog Gambar) -->
      <div v-if="currentStep === 'select'" class="selection-workspace column col items-center q-pa-md overflow-auto z-top relative-position">
        <div class="selection-container column items-center full-width">
          <!-- Difficulty Selection Bar -->
          <div class="difficulty-picker-card column items-center q-pa-sm q-mb-md rounded-borders shadow-12">
            <div class="text-subtitle1 font-fredoka text-bold text-amber-3 q-mb-xs">
              🧩 Pilih Jumlah Kepingan Puzzle:
            </div>
            <div class="row q-gutter-xs justify-center full-width wrap">
              <button
                v-for="grid in gridOptions"
                :key="grid.size"
                class="btn-grid-select font-fredoka shadow-4"
                :class="{ active: currentGridSize === grid.size }"
                @click="changeGridSize(grid.size)"
              >
                <span class="text-h6 q-mr-xs">{{ grid.icon }}</span>
                <span>{{ grid.label }}</span>
              </button>
            </div>
          </div>

          <!-- Picture Catalog Cards Grid Header -->
          <div class="text-h6 font-fredoka text-bold text-amber-3 q-mb-sm text-center full-width">
            🖼️ Pilih Gambar Favoritmu Di Bawah Ini:
          </div>

          <!-- Picture Catalog Cards Grid -->
          <div class="row q-col-gutter-md justify-center full-width">
            <div
              v-for="theme in puzzleThemesList"
              :key="theme.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <div
                class="picture-catalog-card column no-wrap overflow-hidden shadow-16 cursor-pointer relative-position animate-pop"
                :class="{ active: currentThemeId === theme.id }"
                @click="selectThemeAndPlay(theme.id)"
              >
                <div class="catalog-image-box full-width relative-position">
                  <img :src="theme.imageSrc" class="catalog-card-img" :alt="theme.title" />
                  <div class="piece-count-badge font-fredoka shadow-4">
                    🧩 {{ currentGridSize * currentGridSize }} Keping
                  </div>
                  <div class="emoji-corner-badge flex flex-center font-fredoka shadow-4">
                    {{ theme.emoji }}
                  </div>
                </div>
                <div class="catalog-card-body column q-pa-md bg-purple-9 text-white">
                  <div class="text-h6 font-fredoka text-bold text-amber-3 line-clamp-1">
                    {{ theme.title }}
                  </div>
                  <div class="text-caption font-fredoka text-purple-2 q-mb-xs">
                    {{ theme.tag }}
                  </div>
                  <button class="btn-play-theme font-fredoka text-bold shadow-6 q-mt-xs">
                    🎮 Mainkan Gambar Ini ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: Main Gameplay Board Workspace -->
      <div v-else class="puzzle-workspace row col no-wrap overflow-hidden">
        <!-- Left Sidebar: Theme Selector & Grid Size Selector (Desktop View) -->
        <div class="puzzle-controls-sidebar column q-pa-md q-gutter-y-md hide-on-mobile">
          <!-- Grid Size Picker -->
          <div class="sidebar-section">
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">🧩 Jumlah Kepingan:</div>
            <div class="row q-gutter-x-xs">
              <button
                v-for="grid in gridOptions"
                :key="grid.size"
                class="btn-grid-chip font-fredoka flex flex-center col shadow-3"
                :class="{ active: currentGridSize === grid.size }"
                @click="changeGridSize(grid.size)"
              >
                {{ grid.label }}
              </button>
            </div>
          </div>

          <!-- Theme Picture Selector -->
          <div class="sidebar-section col column overflow-auto">
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">🖼️ Pilih Gambar:</div>
            <div class="column q-gutter-y-xs">
              <button
                v-for="theme in puzzleThemesList"
                :key="theme.id"
                class="btn-theme-choice font-fredoka row items-center q-pa-xs shadow-3"
                :class="{ active: currentThemeId === theme.id }"
                @click="changeTheme(theme.id)"
              >
                <img :src="theme.imageSrc" class="theme-thumb-img q-mr-sm shadow-2" :alt="theme.title" />
                <div class="column text-left col">
                  <span class="text-subtitle2 text-bold line-clamp-1">{{ theme.title }}</span>
                  <span class="text-caption text-purple-2 line-clamp-1">{{ theme.tag }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Center Stage: Target Board Grid -->
        <div class="puzzle-board-stage col flex flex-center column relative-position q-pa-sm">
          <!-- Dedicated Mobile Gameplay Action Toolbar -->
          <div class="mobile-action-bar row items-center justify-center gap-xs q-mb-xs show-on-mobile hide-on-desktop full-width">
            <button class="btn-puzzle-action btn-change-theme font-fredoka shadow-4" @click="currentStep = 'select'">
              🖼️ Ganti Gambar
            </button>
            <button class="btn-puzzle-action btn-hint-sparkle font-fredoka shadow-4" @click="handleSparkleHint">
              💡 Petunjuk
            </button>
            <button
              class="btn-puzzle-action font-fredoka shadow-4"
              :class="showGhostHint ? 'btn-ghost-on' : 'btn-ghost-off'"
              @click="showGhostHint = !showGhostHint"
            >
              👁️ {{ showGhostHint ? 'Bayangan ON' : 'Bayangan OFF' }}
            </button>
          </div>
          <div class="board-frame shadow-24 relative-position">
            <!-- Ghost Image Background Hint -->
            <div
              class="ghost-hint-background fit absolute-top-left"
              :class="{ 'opacity-active': showGhostHint }"
              :style="{
                backgroundImage: `url(${currentTheme.imageSrc})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }"
            ></div>

            <!-- Puzzle Target Slots Grid -->
            <div
              class="puzzle-grid-container fit relative-position"
              :style="{
                gridTemplateColumns: `repeat(${currentGridSize}, 1fr)`,
                gridTemplateRows: `repeat(${currentGridSize}, 1fr)`
              }"
            >
              <div
                v-for="(slot, idx) in slots"
                :key="`slot-${idx}`"
                class="puzzle-slot-cell flex flex-center relative-position cursor-pointer overflow-hidden"
                :class="{ locked: slot.isFilled, highlighted: highlightedSlotIndex === idx }"
                :data-slot-index="idx"
                @dragover.prevent
                @drop="handleDrop($event, idx)"
              >
                <!-- Render Sliced Real Image Piece when Filled -->
                <div
                  v-if="slot.isFilled"
                  class="slot-piece-image fit animate-pop"
                  :style="getPieceStyle(slot.targetIdx, currentTheme.imageSrc)"
                ></div>
                <span v-if="slot.isFilled" class="slot-lock-badge">✓</span>
                <span v-else class="slot-number-hint font-fredoka">#{{ idx + 1 }}</span>
              </div>
            </div>

            <!-- Full Screen Victory Celebration Overlay -->
            <div v-if="isCompleted" class="victory-overlay fit flex flex-center column animate-fade">
              <div class="victory-banner column items-center q-pa-lg text-center shadow-24">
                <span class="text-h2 animate-bounce q-mb-sm">🏆 🌟 🎊</span>
                <div class="text-h4 font-fredoka text-bold text-amber-3">PUZZLE SELESAI!</div>
                <div class="text-subtitle1 font-fredoka text-white q-my-xs">
                  Hebat sekali! Arkan berhasil menyusun seluruh kepingan gambar dengan sempurna!
                </div>
                <div class="row q-gutter-x-md q-my-md font-fredoka text-bold text-amber-4 text-h6">
                  <span>🪙 +30 Koin</span>
                  <span>⭐ +50 XP</span>
                </div>
                <div class="row q-gutter-x-sm">
                  <button class="btn-play-again font-fredoka shadow-8" @click="resetCurrentPuzzle">
                    🔄 Main Lagi!
                  </button>
                  <button class="btn-play-again btn-change-theme font-fredoka shadow-8" @click="currentStep = 'select'">
                    🖼️ Pilih Gambar Lain
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Unplaced Piece Tray -->
        <div class="puzzle-tray-sidebar column q-pa-md q-gutter-y-sm overflow-auto">
          <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka text-center">
            📦 Kepingan Puzzle ({{ remainingPieces.length }})
          </div>

          <div class="tray-pieces-wrapper row items-center justify-center gap-xs">
            <div
              v-for="piece in remainingPieces"
              :key="`piece-${piece.targetIdx}`"
              class="draggable-piece-card flex flex-center shadow-8 cursor-grab relative-position overflow-hidden"
              :style="getPieceStyle(piece.targetIdx, currentTheme.imageSrc)"
              draggable="true"
              @dragstart="handleDragStart($event, piece.targetIdx)"
              @touchstart.prevent="handleTouchStart($event, piece.targetIdx)"
              @touchmove.prevent="handleTouchMove($event)"
              @touchend.prevent="handleTouchEnd(piece.targetIdx)"
            >
              <span class="piece-label font-fredoka">#{{ piece.targetIdx + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Floating Touch Drag Ghost Preview -->
        <div
          v-if="touchingPieceIdx !== null"
          class="floating-touch-ghost fixed pointer-events-none shadow-24"
          :style="{
            left: `${touchPos.x - 45}px`,
            top: `${touchPos.y - 45}px`,
            ...getPieceStyle(touchingPieceIdx, currentTheme.imageSrc)
          }"
        >
          <span class="piece-label font-fredoka">#{{ touchingPieceIdx + 1 }}</span>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const currentStep = ref<'select' | 'play'>('select');
const currentGridSize = ref(2); // 2x2 default
const showGhostHint = ref(true);
const currentThemeId = ref('hutan');
const isCompleted = ref(false);
const highlightedSlotIndex = ref<number | null>(null);

const gridOptions = [
  { size: 2, label: '2 x 2 (Mudah)', icon: '🟢' },
  { size: 3, label: '3 x 3 (Sedang)', icon: '🟡' },
  { size: 4, label: '4 x 4 (Tantangan)', icon: '🔴' }
];

interface PuzzleTheme {
  id: string;
  title: string;
  tag: string;
  emoji: string;
  imageSrc: string;
}

const puzzleThemes: Record<string, PuzzleTheme> = {
  hutan: {
    id: 'hutan',
    title: 'Hutan Ajaib Dino',
    tag: 'Petualangan Dinosaurus 🦖',
    emoji: '🦖',
    imageSrc: '/arkan_hutan_cover.png'
  },
  underwater: {
    id: 'underwater',
    title: 'Dunia Bawah Laut',
    tag: 'Istana Kerang 🌊',
    emoji: '🐬',
    imageSrc: '/underwater_game.png'
  },
  family: {
    id: 'family',
    title: 'Foto Keluarga',
    tag: 'Rumah Arkan 👨‍👩‍👦',
    emoji: '🏡',
    imageSrc: '/family_photo.jpg'
  },
  bike: {
    id: 'bike',
    title: 'Balap Sepeda Ceria',
    tag: 'Taman Bermain 🚴',
    emoji: '🚴',
    imageSrc: '/bicycle_race.png'
  },
  treasure: {
    id: 'treasure',
    title: 'Kamar Piala & Harta',
    tag: 'Peti Rahasia 💎',
    emoji: '🏆',
    imageSrc: '/arkan_room_trophy.png'
  }
};

const puzzleThemesList = computed(() => Object.values(puzzleThemes));
const currentTheme = computed(() => puzzleThemes[currentThemeId.value] || puzzleThemes.hutan);
const totalPiecesCount = computed(() => currentGridSize.value * currentGridSize.value);

interface SlotItem {
  targetIdx: number;
  isFilled: boolean;
}

interface PieceItem {
  targetIdx: number;
}

const slots = ref<SlotItem[]>([]);
const remainingPieces = ref<PieceItem[]>([]);

// Touch Dragging State for Mobile & Touch Devices
const touchingPieceIdx = ref<number | null>(null);
const touchPos = ref({ x: 0, y: 0 });

function selectThemeAndPlay(themeId: string) {
  currentThemeId.value = themeId;
  store.playSfx('whoosh');
  initPuzzle();
  currentStep.value = 'play';
}

function getPieceStyle(idx: number, imageUrl: string) {
  const N = currentGridSize.value;
  const r = Math.floor(idx / N);
  const c = idx % N;

  const posX = N > 1 ? (c / (N - 1)) * 100 : 0;
  const posY = N > 1 ? (r / (N - 1)) * 100 : 0;

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${N * 100}% ${N * 100}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: 'no-repeat'
  };
}

function initPuzzle() {
  isCompleted.value = false;
  highlightedSlotIndex.value = null;
  touchingPieceIdx.value = null;
  const count = totalPiecesCount.value;

  slots.value = Array.from({ length: count }, (_, i) => ({
    targetIdx: i,
    isFilled: false
  }));

  // Shuffle pieces for tray
  const pieces: PieceItem[] = Array.from({ length: count }, (_, i) => ({ targetIdx: i }));
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }

  remainingPieces.value = pieces;
}

function changeGridSize(size: number) {
  currentGridSize.value = size;
  store.playSfx('click');
  initPuzzle();
}

function changeTheme(themeId: string) {
  currentThemeId.value = themeId;
  store.playSfx('whoosh');
  initPuzzle();
}

function handleDragStart(e: DragEvent, targetIdx: number) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', String(targetIdx));
  }
}

function handleDrop(e: DragEvent, slotIdx: number) {
  if (!e.dataTransfer) return;
  const draggedIdxStr = e.dataTransfer.getData('text/plain');
  const targetIdx = parseInt(draggedIdxStr, 10);
  if (!isNaN(targetIdx) && targetIdx === slotIdx) {
    placePieceInSlot(targetIdx);
  } else {
    store.playSfx('wrong');
  }
}

// Touch Dragging Event Handlers
function handleTouchStart(e: TouchEvent, targetIdx: number) {
  if (e.touches.length > 0) {
    touchingPieceIdx.value = targetIdx;
    touchPos.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    store.playSfx('click');
  }
}

function handleTouchMove(e: TouchEvent) {
  if (touchingPieceIdx.value !== null && e.touches.length > 0) {
    touchPos.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }
}

function handleTouchEnd(targetIdx: number) {
  if (touchingPieceIdx.value === null) return;

  const dropX = touchPos.value.x;
  const dropY = touchPos.value.y;
  touchingPieceIdx.value = null;

  // Find element under touch position
  const element = document.elementFromPoint(dropX, dropY);
  if (element) {
    const slotEl = element.closest('[data-slot-index]');
    if (slotEl) {
      const slotIdxAttr = slotEl.getAttribute('data-slot-index');
      if (slotIdxAttr !== null) {
        const slotIdx = parseInt(slotIdxAttr, 10);
        if (!isNaN(slotIdx) && slotIdx === targetIdx) {
          placePieceInSlot(targetIdx);
          return;
        }
      }
    }
  }

  store.playSfx('wrong');
}

function placePieceInSlot(targetIdx: number) {
  if (targetIdx < 0 || targetIdx >= slots.value.length) return;

  const targetSlot = slots.value[targetIdx];
  if (targetSlot && !targetSlot.isFilled) {
    targetSlot.isFilled = true;
    remainingPieces.value = remainingPieces.value.filter(p => p.targetIdx !== targetIdx);
    store.playSfx('coin');

    if (remainingPieces.value.length === 0) {
      triggerVictory();
    }
  } else {
    store.playSfx('wrong');
  }
}

function handleSparkleHint() {
  if (remainingPieces.value.length === 0) return;
  store.playSfx('star');
  const unplaced = remainingPieces.value[0];
  if (unplaced) {
    highlightedSlotIndex.value = unplaced.targetIdx;
    setTimeout(() => {
      highlightedSlotIndex.value = null;
    }, 1500);
  }
}

function triggerVictory() {
  isCompleted.value = true;
  store.playSfx('win');
  store.speak('Hebat sekali! Puzzle Arkan berhasil disusun dengan sempurna!');
  store.child.coins += 30;
  store.child.xp += 50;
}

function resetCurrentPuzzle() {
  store.playSfx('click');
  initPuzzle();
}

function closeModal() {
  store.playSfx('click');
  isOpen.value = false;
}

watch(isOpen, (newVal) => {
  if (newVal) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      currentStep.value = 'select';
    } else {
      currentStep.value = 'play';
    }
    initPuzzle();
  }
});
</script>

<style scoped>
.jigsaw-puzzle-card {
  background: linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #4c1d95 100%);
  color: white;
}

.puzzle-header-bar {
  background: rgba(15, 23, 42, 0.7);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.header-title-glow {
  text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
}

/* Step 1 Selection Cards */
.selection-container {
  max-width: 1050px;
  margin: 0 auto;
}

.difficulty-picker-card {
  width: 100%;
  max-width: 750px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.btn-grid-select {
  padding: 8px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.25);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-grid-select.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde047;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.picture-catalog-card {
  border-radius: 24px;
  border: 3.5px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.picture-catalog-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: #fde047;
}

.catalog-image-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  position: relative;
  background: #0f172a;
}

.catalog-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.picture-catalog-card:hover .catalog-card-img {
  transform: scale(1.08);
}

.piece-count-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(124, 58, 237, 0.9);
  border: 1.5px solid #d8b4fe;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.emoji-corner-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.85);
  border: 2px solid #f59e0b;
  backdrop-filter: blur(4px);
  font-size: 20px;
}

.btn-play-theme {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: 2px solid #bbf7d0;
  border-radius: 16px;
  padding: 8px;
  cursor: pointer;
}

.btn-puzzle-action {
  border-radius: 18px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.15s ease, background 0.2s ease;
}

.btn-puzzle-action:hover {
  transform: scale(1.05);
}

.btn-change-theme {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: #93c5fd;
  color: white;
}

.btn-hint-sparkle {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde047;
  color: white;
}

.btn-ghost-on {
  background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  border-color: #bbf7d0;
  color: white;
}

.btn-ghost-off {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-color: #cbd5e1;
  color: white;
}

.close-puzzle-btn {
  position: absolute;
  top: 12px;
  right: 18px;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  border: 3px solid #ffffff;
  box-shadow: 0 5px 0 #991b1b, 0 8px 16px rgba(0, 0, 0, 0.35);
  color: white;
  font-size: 1.3rem;
}

.puzzle-controls-sidebar {
  width: 210px;
  background: rgba(255, 255, 255, 0.08);
  border-right: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-grid-chip {
  padding: 6px 4px;
  border-radius: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.btn-grid-chip.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fde047;
}

.btn-theme-choice {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-theme-choice.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
}

.theme-thumb-img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #f59e0b;
  object-fit: cover;
  flex-shrink: 0;
}

.puzzle-board-stage {
  background: radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
}

.board-frame {
  width: 520px;
  height: 520px;
  max-width: 85vw;
  max-height: 58vh;
  aspect-ratio: 1 / 1;
  background: rgba(15, 23, 42, 0.85);
  border: 6px solid #f59e0b;
  border-radius: 28px;
  overflow: hidden;
}

.ghost-hint-background {
  opacity: 0.1;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.ghost-hint-background.opacity-active {
  opacity: 0.35;
}

.puzzle-grid-container {
  display: grid;
  gap: 0px;
}

.puzzle-slot-cell {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.puzzle-slot-cell.locked {
  border: none !important;
  background: transparent !important;
}

.puzzle-slot-cell.highlighted {
  border: 3px solid #f59e0b !important;
  background: rgba(245, 158, 11, 0.35) !important;
  animation: pulseHighlight 0.6s infinite alternate;
}

@keyframes pulseHighlight {
  0% { transform: scale(0.98); }
  100% { transform: scale(1.02); }
}

.slot-lock-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  background: rgba(34, 197, 94, 0.85);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.slot-number-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
}

.puzzle-tray-sidebar {
  width: 210px;
  background: rgba(255, 255, 255, 0.06);
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.tray-pieces-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.draggable-piece-card {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  border: 2.5px solid #fde047;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.draggable-piece-card:hover {
  transform: scale(1.08) rotate(2deg);
}

.piece-label {
  position: absolute;
  bottom: 2px;
  right: 3px;
  background: rgba(0, 0, 0, 0.75);
  color: #fde047;
  padding: 1px 5px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: bold;
}

.floating-touch-ghost {
  width: 90px;
  height: 90px;
  border-radius: 16px;
  border: 3.5px solid #fde047;
  z-index: 9999;
  transform: scale(1.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.victory-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  z-index: 50;
}

.victory-banner {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border: 3.5px solid #bbf7d0;
  border-radius: 28px;
  max-width: 90%;
}

.btn-play-again {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  border: 2px solid #fde047;
  color: white;
  border-radius: 18px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.puzzle-header-bar {
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding-right: 70px !important;
}

@media (min-width: 769px) {
  .show-on-mobile {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
  .show-on-mobile {
    display: flex !important;
  }
  .puzzle-header-bar {
    padding-left: 12px !important;
    padding-right: 64px !important;
  }
  .header-title-glow {
    font-size: 1.1rem !important;
  }
  .btn-grid-select {
    padding: 6px 10px !important;
    font-size: 12px !important;
  }
  .btn-grid-select span.text-h6 {
    font-size: 14px !important;
  }
  .selection-workspace {
    padding: 10px !important;
  }
  .board-frame {
    width: 310px;
    height: 310px;
    max-width: 90vw;
  }
  .puzzle-tray-sidebar {
    width: 110px;
    padding: 8px !important;
  }
  .draggable-piece-card {
    width: 70px;
    height: 70px;
  }
  .btn-puzzle-action {
    padding: 6px 12px !important;
    font-size: 12px !important;
    border-radius: 14px !important;
  }
}
</style>
