<template>
  <q-dialog v-model="isOpen" transition-show="scale" transition-hide="scale">
    <q-card class="rounded-card-premium wardrobe-modal q-pa-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-bold text-primary font-fredoka">
          👕 Lemari Pakaian & Avatar Arkan
        </div>
        <q-btn flat round dense icon="close" color="primary" @click="isOpen = false" />
      </div>

      <div class="row q-col-gutter-md items-center">
        <!-- Avatar Preview -->
        <div class="col-12 col-md-5 text-center">
          <div class="avatar-preview-box rounded-card-premium q-pa-md">
            <div class="text-h1 floating-element">👦</div>
            <div class="text-h6 text-bold text-primary q-mt-sm">Gaya Arkan Saat Ini</div>
            <div class="text-caption text-grey-7">Kaos Merah & Ransel Petualang</div>
          </div>
        </div>

        <!-- Items Wardrobe Grid -->
        <div class="col-12 col-md-7">
          <div class="text-subtitle1 text-bold text-grey-9 q-mb-sm">Pilih Aksesoris:</div>
          <div class="row q-col-gutter-sm">
            <div v-for="item in items" :key="item.id" class="col-6 col-sm-4">
              <div
                class="rounded-card-premium item-card q-pa-sm text-center cursor-pointer"
                :class="{ 'border-active': selectedId === item.id }"
                @click="selectedId = item.id"
              >
                <div class="text-h4">{{ item.icon }}</div>
                <div class="text-caption text-bold text-grey-9 q-mt-xs">{{ item.name }}</div>
                <div class="text-caption text-amber-10 text-bold">🪙 {{ item.price }}</div>
              </div>
            </div>
          </div>

          <button class="btn-3d-cartoon btn-primary-yellow full-width q-mt-md" @click="isOpen = false">
            Gunakan Pakaian Ini ✨
          </button>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const selectedId = ref('1');

const items = [
  { id: '1', name: 'Kaos Merah', icon: '👕', price: 50 },
  { id: '2', name: 'Topi Kuning', icon: '🧢', price: 75 },
  { id: '3', name: 'Kacamata Keren', icon: '👓', price: 100 },
  { id: '4', name: 'Ransel Biru', icon: '🎒', price: 120 },
  { id: '5', name: 'Tongkat Sihir', icon: '🪄', price: 150 },
  { id: '6', name: 'Sepatu Roda', icon: '🛼', price: 200 },
];
</script>

<style scoped>
.wardrobe-modal {
  width: 700px;
  max-width: 95vw;
}

.avatar-preview-box {
  background: linear-gradient(180deg, #e0f2fe 0%, #ffffff 100%);
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.item-card {
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.border-active {
  border-color: #3b82f6 !important;
  background: #eff6ff !important;
}
</style>
