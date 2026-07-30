<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="scale" transition-hide="scale">
    <q-card class="jigsaw-puzzle-card column no-wrap fit font-quicksand">
      <!-- Top Bar Header -->
      <div class="puzzle-header-bar row items-center justify-between q-px-lg q-py-sm">
        <div class="row items-center q-gutter-x-md">
          <span class="text-h4 title-emoji-pulse">🧩✨</span>
          <div class="column">
            <div class="text-h5 font-fredoka text-bold text-amber-3 header-title-glow">
              Mainan Puzzle Gambar Ajaib Arkan
            </div>
            <div class="text-caption text-purple-2 font-fredoka">
              Geser atau tekan kepingan puzzle ke tempat yang cocok & lengkapi gambarnya!
            </div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <button class="btn-puzzle-action btn-hint-sparkle font-fredoka shadow-6" @click="handleSparkleHint">
            💡 Petunjuk Sparkle
          </button>

          <button
            class="btn-puzzle-action font-fredoka shadow-6"
            :class="showGhostHint ? 'btn-ghost-on' : 'btn-ghost-off'"
            @click="showGhostHint = !showGhostHint"
          >
            👁️ Bayangan: {{ showGhostHint ? 'ON' : 'OFF' }}
          </button>

          <button class="btn-close-fullscreen flex flex-center shadow-4 q-ml-md" @click="closeModal" title="Tutup Puzzle">
            ✕
          </button>
        </div>
      </div>

      <!-- Main Workspace -->
      <div class="puzzle-workspace row col no-wrap overflow-hidden">
        <!-- Left Sidebar: Theme Selector & Grid Size Selector -->
        <div class="puzzle-controls-sidebar column q-pa-md q-gutter-y-md">
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
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">🖼️ Pilih Gambar Puzzle:</div>
            <div class="column q-gutter-y-xs">
              <button
                v-for="theme in puzzleThemes"
                :key="theme.id"
                class="btn-theme-choice font-fredoka row items-center q-pa-xs shadow-3"
                :class="{ active: currentThemeId === theme.id }"
                @click="changeTheme(theme.id)"
              >
                <div class="theme-badge-icon flex flex-center font-fredoka q-mr-sm shadow-2">
                  {{ theme.emoji }}
                </div>
                <div class="column text-left">
                  <span class="text-subtitle2 text-bold line-clamp-1">{{ theme.title }}</span>
                  <span class="text-caption text-purple-2">{{ theme.tag }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Center Stage: Target Board Grid -->
        <div class="puzzle-board-stage col flex flex-center relative-position q-pa-md">
          <div class="board-frame shadow-24 relative-position">
            <!-- Ghost Image Background Hint -->
            <div
              class="ghost-hint-background fit absolute-top-left"
              :class="{ 'opacity-active': showGhostHint }"
              :style="{ background: currentTheme.bgGradient }"
            >
              <div class="ghost-emoji-center flex flex-center fit">
                <span class="ghost-emoji-giant">{{ currentTheme.emoji }}</span>
              </div>
            </div>

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
                class="puzzle-slot-cell flex flex-center relative-position cursor-pointer"
                :class="{ locked: slot.isFilled, highlighted: highlightedSlotIndex === idx }"
                :style="{ background: slot.isFilled ? currentTheme.pieceColors[idx] : 'rgba(255,255,255,0.06)' }"
              >
                <span v-if="slot.isFilled" class="slot-piece-emoji animate-pop">{{ currentTheme.pieceEmojis[idx] }}</span>
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
                  Hebat sekali! Arkan berhasil menyusun semua kepingan puzzle!
                </div>
                <div class="row q-gutter-x-md q-my-md font-fredoka text-bold text-amber-4 text-h6">
                  <span>🪙 +30 Koin</span>
                  <span>⭐ +50 XP</span>
                </div>
                <button class="btn-play-again font-fredoka shadow-8" @click="resetCurrentPuzzle">
                  🔄 Main Lagi!
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Unplaced Piece Tray -->
        <div class="puzzle-tray-sidebar column q-pa-md q-gutter-y-sm overflow-auto">
          <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka text-center">
            📦 Kepingan Puzzle ({{ remainingPieces.length }})
          </div>

          <div class="tray-pieces-wrapper column items-center q-gutter-y-md">
            <div
              v-for="piece in remainingPieces"
              :key="`piece-${piece.targetIdx}`"
              class="draggable-piece-card flex flex-center shadow-8 cursor-pointer relative-position"
              :style="{ background: currentTheme.pieceColors[piece.targetIdx] }"
              draggable="true"
              @dragstart="handleDragStart($event, piece.targetIdx)"
              @click="handlePieceClick(piece.targetIdx)"
            >
              <span class="piece-emoji">{{ currentTheme.pieceEmojis[piece.targetIdx] }}</span>
              <span class="piece-label font-fredoka">#{{ piece.targetIdx + 1 }}</span>
            </div>
          </div>
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

const currentGridSize = ref(2); // 2x2 default
const showGhostHint = ref(true);
const currentThemeId = ref('dino');
const isCompleted = ref(false);
const highlightedSlotIndex = ref<number | null>(null);

const gridOptions = [
  { size: 2, label: '2 x 2' },
  { size: 3, label: '3 x 3' },
  { size: 4, label: '4 x 4' }
];

interface PuzzleTheme {
  id: string;
  title: string;
  tag: string;
  emoji: string;
  bgGradient: string;
  pieceColors: string[];
  pieceEmojis: string[];
}

const puzzleThemes: Record<string, PuzzleTheme> = {
  dino: {
    id: 'dino',
    title: 'Dino Kiko',
    tag: 'Hutan Purbakala 🦖',
    emoji: '🦖',
    bgGradient: 'linear-gradient(135deg, #15803d 0%, #047857 100%)',
    pieceColors: ['#22c55e', '#16a34a', '#4ade80', '#86efac', '#15803d', '#059669', '#10b981', '#34d399', '#6ee7b7', '#047857', '#065f46', '#022c22', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
    pieceEmojis: ['🦖', '🌴', '🦴', '🌿', '🦕', '🌋', '🥚', '🍃', '🌴', '🦖', '🌿', '🦴', '🍃', '🦕', '🥚', '🌋']
  },
  space: {
    id: 'space',
    title: 'Roket Arkan',
    tag: 'Luar Angkasa 🚀',
    emoji: '🚀',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #311b92 100%)',
    pieceColors: ['#3b82f6', '#1d4ed8', '#60a5fa', '#93c5fd', '#2563eb', '#1e40af', '#38bdf8', '#7dd3fc', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'],
    pieceEmojis: ['🚀', '🌟', '🪐', '👾', '🛸', '⭐', '🌌', '☄️', '🚀', '🌟', '🪐', '🛸', '👾', '⭐', '🌌', '☄️']
  },
  cat: {
    id: 'cat',
    title: 'Kucing Mimi',
    tag: 'Taman Bunga 🐱',
    emoji: '🐱',
    bgGradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    pieceColors: ['#ec4899', '#db2777', '#f472b6', '#fbcfe8', '#be185d', '#9d174d', '#fb7185', '#fda4af', '#f43f5e', '#e11d48', '#be123c', '#881337', '#fce7f3', '#fbcfe8', '#f472b6', '#ec4899'],
    pieceEmojis: ['🐱', '🌸', '🪇', '🦋', '🌷', '🌻', '🎀', '🌺', '🐱', '🌸', '🪇', '🦋', '🌷', '🌻', '🎀', '🌺']
  },
  castle: {
    id: 'castle',
    title: 'Kastil Pelangi',
    tag: 'Kerajaan Naga 🏰',
    emoji: '🏰',
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    pieceColors: ['#a855f7', '#9333ea', '#c084fc', '#e9d5ff', '#7e22ce', '#6b21a8', '#a855f7', '#d8b4fe', '#9333ea', '#7e22ce', '#581c87', '#3b0764', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc'],
    pieceEmojis: ['🏰', '🐉', '👑', '💎', '🛡️', '⚔️', '✨', '🚩', '🏰', '🐉', '👑', '💎', '🛡️', '⚔️', '✨', '🚩']
  }
};

const currentTheme = computed(() => puzzleThemes[currentThemeId.value] || puzzleThemes.dino);
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

function initPuzzle() {
  isCompleted.value = false;
  highlightedSlotIndex.value = null;
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

function handlePieceClick(targetIdx: number) {
  placePieceInSlot(targetIdx);
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
  store.speak('Hebat sekali! Puzzle Arkan selesai dengan sempurna!');
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

.puzzle-controls-sidebar, .puzzle-tray-sidebar {
  width: 220px;
  background: rgba(255, 255, 255, 0.06);
  border-right: 2px solid rgba(255, 255, 255, 0.1);
}

.puzzle-tray-sidebar {
  border-right: none;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-grid-chip {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 2px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-grid-chip:hover {
  background: rgba(255, 255, 255, 0.22);
}

.btn-grid-chip.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: #fde047;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-theme-choice {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.btn-theme-choice:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(2px);
}

.btn-theme-choice.active {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  border-color: #e9d5ff;
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
}

.theme-badge-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 22px;
}

.board-frame {
  width: 530px;
  height: 530px;
  border-radius: 28px;
  border: 6px solid #818cf8;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
}

.ghost-hint-background {
  opacity: 0.15;
  transition: opacity 0.3s ease;
}

.ghost-hint-background.opacity-active {
  opacity: 0.45;
}

.ghost-emoji-giant {
  font-size: 150px;
}

.puzzle-grid-container {
  display: grid;
  gap: 6px;
  padding: 10px;
}

.puzzle-slot-cell {
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.puzzle-slot-cell.locked {
  border-style: solid;
  border-color: #fde047;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.puzzle-slot-cell.highlighted {
  border-color: #f59e0b;
  border-style: solid;
  border-width: 4px;
  animation: pulse 0.6s infinite alternate;
}

.slot-piece-emoji {
  font-size: 42px;
}

.slot-lock-badge {
  position: absolute;
  top: 4px;
  right: 6px;
  color: #fde047;
  font-weight: bold;
  font-size: 16px;
}

.slot-number-hint {
  color: rgba(255, 255, 255, 0.4);
  font-size: 20px;
}

.draggable-piece-card {
  width: 96px;
  height: 96px;
  border-radius: 20px;
  border: 3px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.draggable-piece-card:hover {
  transform: scale(1.1) translateY(-2px);
  border-color: #fde047;
}

.piece-emoji {
  font-size: 42px;
}

.piece-label {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 11px;
  color: white;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 6px;
  border-radius: 8px;
}

.victory-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.victory-banner {
  background: linear-gradient(135deg, #1e1b4b 0%, #311b92 100%);
  border: 4px solid #818cf8;
  border-radius: 32px;
}

.btn-play-again {
  background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: 2px solid #bbf7d0;
  border-radius: 22px;
  padding: 10px 28px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-play-again:hover {
  transform: scale(1.06);
}
</style>
