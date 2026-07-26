import { defineStore } from 'pinia';
import { ChildProfile, World, Level } from '../../domain/types';
import { gameApi } from '../../services/api';

// XP yang dibutuhkan untuk naik level (konsisten di seluruh app)
export const XP_PER_LEVEL = 600;

export const useGameStore = defineStore('game', {
  state: () => ({
    child: {
      id: 'arkan_default_child_id',
      name: 'Arkan',
      age: 5,
      level: 2,
      xp: 150,
      coins: 250,
      diamonds: 15,
      energy: 100,
      hearts: 5,
    } as ChildProfile,
    worlds: [] as World[],
    selectedWorld: null as World | null,
    currentLevel: null as Level | null,
    isGameActive: false,
    soundMuted: localStorage.getItem('arkan_sound_muted') === 'true',
    showParentDashboardModal: false,
    isLoadingProfile: false,
  }),

  getters: {
    // XP progress dalam persen (0–100)
    xpPercent: (state) => Math.min((state.child.xp / XP_PER_LEVEL) * 100, 100),
    xpDisplay: (state) => `${state.child.xp} / ${XP_PER_LEVEL} XP`,
  },

  actions: {
    async fetchChildProfile() {
      this.isLoadingProfile = true;
      try {
        const profile = await gameApi.getChildProfile(this.child.id);
        this.child = { ...this.child, ...profile };
      } catch (e) {
        console.warn('Gagal fetch profil anak, menggunakan data lokal.');
      } finally {
        this.isLoadingProfile = false;
      }
    },

    async fetchWorlds() {
      this.worlds = await gameApi.getWorlds();
    },

    selectWorld(world: World) {
      this.selectedWorld = world;
    },

    async startLevel(levelId: string) {
      const config = await gameApi.getLevelConfig(levelId);
      this.currentLevel = config;
      this.isGameActive = true;
    },

    async completeLevel(stars: number, score: number, timeSpent: number, category: string) {
      if (this.currentLevel) {
        try {
          const res = await gameApi.finishGameSession(
            this.child.id,
            this.currentLevel.id,
            stars,
            score,
            timeSpent,
            category
          );
          this.child.coins = res.new_total_coins;
          this.child.xp = res.new_total_xp;
        } catch (e) {
          this.child.coins += 20 * stars;
          this.child.xp += 50 * stars;
        }
      }
      this.isGameActive = false;
    },

    toggleSound() {
      this.soundMuted = !this.soundMuted;
      try {
        localStorage.setItem('arkan_sound_muted', String(this.soundMuted));
      } catch (e) {
        console.warn('Gagal menyimpan status suara ke localStorage:', e);
      }
    }
  }
});
