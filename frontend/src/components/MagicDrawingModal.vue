<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="magic-drawing-card column no-wrap fit font-quicksand">
      <!-- Top Bar Header -->
      <div class="drawing-header-bar row items-center justify-between q-px-lg q-py-sm">
        <div class="row items-center q-gutter-x-md">
          <span class="text-h4">🎨✨</span>
          <div class="column">
            <div class="text-h5 font-fredoka text-bold text-amber-3">Studio Melukis Ajaib Arkan</div>
            <div class="text-caption text-purple-2 font-fredoka">Warnai sketsa, pakai kuas pelangi, tempel stiker & simpan karyamu!</div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <button class="btn-drawing-action btn-clear-canvas font-fredoka shadow-4" @click="handleClearCanvas">
            🗑️ Bersihkan
          </button>

          <button class="btn-drawing-action btn-save-artwork font-fredoka shadow-6" @click="handleSaveArtwork">
            📸 Simpan Karya 🌟
          </button>

          <button class="btn-drawing-action btn-print-artwork font-fredoka shadow-6" @click="handlePrintArtwork">
            🖨️ Cetak Karya
          </button>

          <button class="btn-close-fullscreen flex flex-center shadow-4 q-ml-md" @click="closeModal" title="Tutup Studio">
            ✕
          </button>
        </div>
      </div>

      <!-- Main Studio Body Workspace -->
      <div class="drawing-workspace row col no-wrap overflow-hidden">
        <!-- Left Sidebar: Tools, Templates & Brush Sizes -->
        <div class="drawing-tools-sidebar column q-pa-md q-gutter-y-md">
          <!-- 1. Tool Selection -->
          <div class="sidebar-section">
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">🛠️ Pilih Alat:</div>
            <div class="grid-tools column q-gutter-y-xs">
              <button
                class="btn-tool-choice font-fredoka row items-center q-px-sm q-py-xs"
                :class="{ active: currentTool === 'brush' }"
                @click="setTool('brush')"
              >
                <span class="q-mr-xs text-h6">🖌️</span>
                <span>Kuas Cat</span>
              </button>

              <button
                class="btn-tool-choice font-fredoka row items-center q-px-sm q-py-xs"
                :class="{ active: currentTool === 'rainbow' }"
                @click="setTool('rainbow')"
              >
                <span class="q-mr-xs text-h6">🌈</span>
                <span>Kuas Pelangi</span>
              </button>

              <button
                class="btn-tool-choice font-fredoka row items-center q-px-sm q-py-xs"
                :class="{ active: currentTool === 'bucket' }"
                @click="setTool('bucket')"
              >
                <span class="q-mr-xs text-h6">🎨</span>
                <span>Ember Cat</span>
              </button>

              <button
                class="btn-tool-choice font-fredoka row items-center q-px-sm q-py-xs"
                :class="{ active: currentTool === 'eraser' }"
                @click="setTool('eraser')"
              >
                <span class="q-mr-xs text-h6">🧽</span>
                <span>Penghapus</span>
              </button>
            </div>
          </div>

          <!-- 2. Brush Size Selector -->
          <div class="sidebar-section">
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">✏️ Ukuran Kuas:</div>
            <div class="row q-gutter-x-xs justify-between">
              <button
                v-for="size in brushSizes"
                :key="size.val"
                class="btn-size-chip font-fredoka flex flex-center"
                :class="{ active: currentBrushSize === size.val }"
                @click="currentBrushSize = size.val"
              >
                <div class="size-dot" :style="{ width: `${size.dot}px`, height: `${size.dot}px` }"></div>
              </button>
            </div>
          </div>

          <!-- 3. Templates (Sketsa) -->
          <div class="sidebar-section col column overflow-auto">
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">📄 Sketsa Mewarnai:</div>
            <div class="column q-gutter-y-xs">
              <button
                v-for="template in drawingTemplates"
                :key="template.id"
                class="btn-template-choice font-fredoka row items-center q-px-sm q-py-xs"
                :class="{ active: currentTemplateId === template.id }"
                @click="loadTemplate(template)"
              >
                <span class="q-mr-xs text-h6">{{ template.icon }}</span>
                <span class="text-caption line-clamp-1">{{ template.name }}</span>
              </button>
            </div>
          </div>

          <!-- 4. Sticker Stamps -->
          <div class="sidebar-section">
            <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">🌸 Stiker Tempel:</div>
            <div class="row q-gutter-xs wrap">
              <button
                v-for="stamp in stickerStamps"
                :key="stamp"
                class="btn-stamp-chip flex flex-center font-fredoka"
                :class="{ active: currentTool === 'stamp' && currentStamp === stamp }"
                @click="selectStamp(stamp)"
              >
                {{ stamp }}
              </button>
            </div>
          </div>
        </div>

        <!-- Center Stage: HTML5 Canvas -->
        <div class="drawing-canvas-stage col flex flex-center relative-position q-pa-md">
          <div class="canvas-frame shadow-16 relative-position">
            <canvas
              ref="canvasRef"
              width="860"
              height="520"
              class="main-html5-canvas cursor-crosshair"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart.prevent="handleTouchStart"
              @touchmove.prevent="handleTouchMove"
              @touchend.prevent="stopDrawing"
            ></canvas>
          </div>
        </div>

        <!-- Right Sidebar: Color Palette -->
        <div class="drawing-palette-sidebar column q-pa-md q-gutter-y-md">
          <div class="text-caption text-bold text-amber-4 q-mb-xs font-fredoka">🎨 Warna Cat:</div>
          <div class="row q-gutter-xs wrap justify-center">
            <button
              v-for="color in paletteColors"
              :key="color.hex"
              class="color-swatch-btn shadow-3"
              :class="{ active: currentColor === color.hex }"
              :style="{ backgroundColor: color.hex }"
              :title="color.name"
              @click="currentColor = color.hex"
            >
              <span v-if="currentColor === color.hex" class="swatch-check">✓</span>
            </button>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useGameStore } from '../application/stores/gameStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const store = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);

type ToolType = 'brush' | 'rainbow' | 'bucket' | 'eraser' | 'stamp';
const currentTool = ref<ToolType>('brush');
const currentBrushSize = ref(14);
const currentColor = ref('#ef4444');
const currentStamp = ref('🦖');
const currentTemplateId = ref('blank');

const brushSizes = [
  { val: 6, dot: 8 },
  { val: 14, dot: 14 },
  { val: 26, dot: 22 },
  { val: 42, dot: 30 }
];

const paletteColors = [
  { name: 'Merah', hex: '#ef4444' },
  { name: 'Oranye', hex: '#f97316' },
  { name: 'Kuning', hex: '#eab308' },
  { name: 'Hijau Segar', hex: '#22c55e' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Biru Cerah', hex: '#3b82f6' },
  { name: 'Ungu', hex: '#a855f7' },
  { name: 'Merah Muda', hex: '#ec4899' },
  { name: 'Cokelat', hex: '#854d0e' },
  { name: 'Hitam', hex: '#1e293b' },
  { name: 'Putih', hex: '#ffffff' }
];

const stickerStamps = ['🦖', '🚀', '🌟', '🌸', '⚽', '🐱', '👑', '🌈'];

interface DrawingTemplate {
  id: string;
  name: string;
  icon: string;
  drawOutline: (ctx: CanvasRenderingContext2D) => void;
}

const drawingTemplates: DrawingTemplate[] = [
  {
    id: 'blank',
    name: 'Kanvas Bebas',
    icon: '📄',
    drawOutline: () => {}
  },
  {
    id: 'arkan',
    name: 'Arkan & Rumah Pohon',
    icon: '👦',
    drawOutline: (c) => {
      // Tree Trunk & House Outline
      c.strokeStyle = '#1e293b';
      c.lineWidth = 4;
      c.strokeRect(330, 200, 200, 180); // House
      c.strokeRect(380, 260, 60, 120);  // Door
      // Roof
      c.beginPath();
      c.moveTo(300, 200);
      c.lineTo(430, 110);
      c.lineTo(560, 200);
      c.closePath();
      c.stroke();
      // Sun
      c.beginPath();
      c.arc(740, 100, 45, 0, Math.PI * 2);
      c.stroke();
    }
  },
  {
    id: 'dino',
    name: 'Dino Kiko',
    icon: '🦖',
    drawOutline: (c) => {
      c.strokeStyle = '#1e293b';
      c.lineWidth = 4;
      // Dino Head & Body Shape
      c.beginPath();
      c.arc(380, 220, 65, 0, Math.PI * 2); // Head
      c.arc(460, 320, 110, 0, Math.PI * 2); // Body
      c.stroke();
      // Eye
      c.beginPath();
      c.arc(365, 205, 12, 0, Math.PI * 2);
      c.stroke();
    }
  },
  {
    id: 'rocket',
    name: 'Roket Luar Angkasa',
    icon: '🚀',
    drawOutline: (c) => {
      c.strokeStyle = '#1e293b';
      c.lineWidth = 4;
      // Rocket Body
      c.strokeRect(390, 180, 80, 200);
      // Nose cone
      c.beginPath();
      c.moveTo(390, 180);
      c.lineTo(430, 90);
      c.lineTo(470, 180);
      c.closePath();
      c.stroke();
      // Window
      c.beginPath();
      c.arc(430, 240, 25, 0, Math.PI * 2);
      c.stroke();
    }
  }
];

function setTool(t: ToolType) {
  currentTool.value = t;
  store.playSfx('click');
}

function selectStamp(stamp: string) {
  currentTool.value = 'stamp';
  currentStamp.value = stamp;
  store.playSfx('pop');
}

function loadTemplate(tpl: DrawingTemplate) {
  currentTemplateId.value = tpl.id;
  store.playSfx('whoosh');
  resetCanvas();
}

function resetCanvas() {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  // Clear to white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // Draw current template outline
  const tpl = drawingTemplates.find(t => t.id === currentTemplateId.value);
  if (tpl) {
    tpl.drawOutline(ctx);
  }
}

function getCanvasCoords(e: MouseEvent | Touch): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function startDrawing(e: MouseEvent) {
  if (currentTool.value === 'stamp') {
    stampOnCanvas(e);
    return;
  }
  if (currentTool.value === 'bucket') {
    fillBucket(e);
    return;
  }

  isDrawing.value = true;
  const coords = getCanvasCoords(e);
  lastX.value = coords.x;
  lastY.value = coords.y;
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    if (currentTool.value === 'stamp') {
      stampOnCanvas(touch);
      return;
    }
    if (currentTool.value === 'bucket') {
      fillBucket(touch);
      return;
    }
    isDrawing.value = true;
    const coords = getCanvasCoords(touch);
    lastX.value = coords.x;
    lastY.value = coords.y;
  }
}

function draw(e: MouseEvent) {
  if (!isDrawing.value || !ctx) return;
  const coords = getCanvasCoords(e);
  executeStroke(coords.x, coords.y);
}

function handleTouchMove(e: TouchEvent) {
  if (!isDrawing.value || !ctx || e.touches.length === 0) return;
  const touch = e.touches[0];
  const coords = getCanvasCoords(touch);
  executeStroke(coords.x, coords.y);
}

function executeStroke(x: number, y: number) {
  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(lastX.value, lastY.value);
  ctx.lineTo(x, y);

  if (currentTool.value === 'eraser') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = currentBrushSize.value * 1.5;
  } else if (currentTool.value === 'rainbow') {
    const rainbowGrd = ctx.createLinearGradient(lastX.value, lastY.value, x, y);
    rainbowGrd.addColorStop(0, '#ef4444');
    rainbowGrd.addColorStop(0.2, '#f97316');
    rainbowGrd.addColorStop(0.4, '#eab308');
    rainbowGrd.addColorStop(0.6, '#22c55e');
    rainbowGrd.addColorStop(0.8, '#3b82f6');
    rainbowGrd.addColorStop(1, '#a855f7');
    ctx.strokeStyle = rainbowGrd;
    ctx.lineWidth = currentBrushSize.value;
  } else {
    ctx.strokeStyle = currentColor.value;
    ctx.lineWidth = currentBrushSize.value;
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  lastX.value = x;
  lastY.value = y;
}

function stopDrawing() {
  isDrawing.value = false;
}

function stampOnCanvas(e: MouseEvent | Touch) {
  if (!ctx) return;
  const coords = getCanvasCoords(e);
  ctx.font = '54px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(currentStamp.value, coords.x, coords.y);
  store.playSfx('pop');
}

function fillBucket(e: MouseEvent | Touch) {
  if (!ctx || !canvasRef.value) return;
  const coords = getCanvasCoords(e);
  const startX = Math.floor(coords.x);
  const startY = Math.floor(coords.y);

  // Quick flood fill with simplified context fill
  ctx.fillStyle = currentColor.value;
  ctx.beginPath();
  ctx.arc(startX, startY, 40, 0, Math.PI * 2);
  ctx.fill();
  store.playSfx('pop');
}

function handleClearCanvas() {
  store.playSfx('whoosh');
  resetCanvas();
}

function handleSaveArtwork() {
  if (!canvasRef.value || !ctx) return;

  store.playSfx('win');
  store.speak('Wah, karya lukisan Arkan sangat indah sekali!');

  // Draw artist signature stamp on corner before exporting
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`🎨 Karya ${store.child.name} • ${new Date().toLocaleDateString('id-ID')}`, canvasRef.value.width - 20, canvasRef.value.height - 20);
  ctx.restore();

  // Trigger image download
  const link = document.createElement('a');
  link.download = `Karya_Melukis_${store.child.name}_${Date.now()}.png`;
  link.href = canvasRef.value.toDataURL('image/png');
  link.click();
}

function handlePrintArtwork() {
  if (!canvasRef.value) return;

  store.playSfx('click');
  store.speak('Mencetak hasil karya seni!');

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const dataUrl = canvasRef.value.toDataURL('image/png');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Karya - Arkan-Game</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; }
            img { max-width: 90vw; max-height: 80vh; border: 8px solid #f59e0b; border-radius: 16px; margin: 20px; }
            h2 { color: #7c3aed; }
          </style>
        </head>
        <body>
          <h2>🎨 Studio Melukis Ajaib - Karya ${store.child.name}</h2>
          <img src="${dataUrl}" />
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

function closeModal() {
  store.playSfx('click');
  isOpen.value = false;
}

onMounted(() => {
  nextTick(() => {
    resetCanvas();
  });
});
</script>

<style scoped>
.magic-drawing-card {
  background: linear-gradient(135deg, #1e1b4b 0%, #311b92 100%);
  color: white;
}

.drawing-header-bar {
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.btn-drawing-action {
  border-radius: 18px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.15s ease;
}

.btn-clear-canvas {
  background: linear-gradient(180deg, #e11d48 0%, #be123c 100%);
  color: white;
}

.btn-save-artwork {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-print-artwork {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-drawing-action:hover {
  transform: translateY(-2px);
}

.drawing-tools-sidebar, .drawing-palette-sidebar {
  width: 200px;
  background: rgba(255, 255, 255, 0.08);
  border-right: 2px solid rgba(255, 255, 255, 0.1);
}

.drawing-palette-sidebar {
  width: 140px;
  border-right: none;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-tool-choice, .btn-template-choice {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-tool-choice.active, .btn-template-choice.active {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  border-color: #e9d5ff;
  font-weight: bold;
}

.btn-size-chip {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.btn-size-chip.active {
  background: #f59e0b;
  border-color: #fef08a;
}

.size-dot {
  background: white;
  border-radius: 50%;
}

.btn-stamp-chip {
  width: 38px;
  height: 38px;
  font-size: 22px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.btn-stamp-chip.active {
  background: #ec4899;
  border-color: #fbcfe8;
}

.canvas-frame {
  background: white;
  border-radius: 20px;
  border: 6px solid #818cf8;
  overflow: hidden;
}

.main-html5-canvas {
  display: block;
  background: white;
}

.color-swatch-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.color-swatch-btn:hover {
  transform: scale(1.1);
}

.color-swatch-btn.active {
  border-color: #fde047;
  transform: scale(1.15);
}

.swatch-check {
  color: white;
  font-weight: bold;
  font-size: 20px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
</style>
