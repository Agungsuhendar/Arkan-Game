import axios from 'axios';
import { World, Level, ParentAnalytics, ChildProfile } from '../domain/types';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('arsaku.web.id') || (!['localhost', '127.0.0.1'].includes(host) && host !== '')) {
      return `${window.location.protocol}//${host}/api/v1`;
    }
    if (window.location.port === '3005') {
      return 'http://localhost:8005/api/v1';
    }
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameApi = {
  async getWorlds(): Promise<World[]> {
    try {
      const res = await apiClient.get<World[]>('/game/worlds');
      return res.data;
    } catch (e) {
      // Fallback offline mock data for dev resilience
      return [
        { id: 'w1', code: 'hutan_huruf', name: 'Hutan Huruf', description: 'Dunia alfabet & fonik', boss_name: 'Raja Huruf', npc_name: 'Kelinci', icon_asset: 'hutan_huruf', bg_asset: 'bg_hutan', order_index: 1 },
        { id: 'w2', code: 'kebun_angka', name: 'Kebun Angka', description: 'Belajar berhitung di kebun', boss_name: 'Monster Hitung', npc_name: 'Tupai', icon_asset: 'kebun_angka', bg_asset: 'bg_kebun', order_index: 2 },
        { id: 'w3', code: 'kota_warna', name: 'Kota Warna', description: 'Mengenal warna & bentuk', boss_name: 'Pelukis', npc_name: 'Kucing', icon_asset: 'kota_warna', bg_asset: 'bg_kota', order_index: 3 },
        { id: 'w4', code: 'pulau_hewan', name: 'Pulau Hewan', description: 'Dunia flora & fauna', boss_name: 'Naga', npc_name: 'Lumba-lumba', icon_asset: 'pulau_hewan', bg_asset: 'bg_pulau', order_index: 4 },
        { id: 'w5', code: 'kastil_puzzle', name: 'Kastil Puzzle', description: 'Melatih logika & memori', boss_name: 'Ksatria', npc_name: 'Burung Hantu', icon_asset: 'kastil_puzzle', bg_asset: 'bg_kastil', order_index: 5 },
        { id: 'w6', code: 'planet_sains', name: 'Planet Sains', description: 'Eksplorasi alam & eksperimen', boss_name: 'Alien', npc_name: 'Robot', icon_asset: 'planet_sains', bg_asset: 'bg_planet', order_index: 6 },
        { id: 'w7', code: 'gunung_prestasi', name: 'Gunung Prestasi', description: 'Tantangan puncak & piala', boss_name: 'Master Arkan', npc_name: 'Elang Emas', icon_asset: 'gunung_prestasi', bg_asset: 'bg_gunung', order_index: 7 },
      ];
    }
  },

  async getLevelConfig(levelId: string): Promise<Level> {
    try {
      const res = await apiClient.get<Level>(`/game/level/${levelId}`);
      return res.data;
    } catch (e) {
      return {
        id: levelId,
        level_number: 1,
        title: 'Letuskan Balon Huruf A',
        reward_coins: 20,
        reward_xp: 50,
        engine: {
          id: 'eng1',
          code: 'balloon_game',
          name: 'Balloon Pop Engine',
          engine_type: 'phaser_3',
          default_config: {}
        },
        questions: [
          {
            id: 'q1',
            prompt_text: 'Letuskan balon yang berisi huruf A!',
            category: 'huruf',
            options: [
              { id: 'o1', option_text: 'A', is_correct: true },
              { id: 'o2', option_text: 'B', is_correct: false },
              { id: 'o3', option_text: 'C', is_correct: false }
            ]
          }
        ]
      };
    }
  },

  async finishGameSession(childId: string, levelId: string, stars: number, score: number, timeSpent: number, category: string) {
    const res = await apiClient.post('/game/finish', {
      child_id: childId,
      level_id: levelId,
      stars,
      score,
      time_spent_seconds: timeSpent,
      category
    });
    return res.data;
  },

  async getParentAnalytics(childId: string): Promise<ParentAnalytics> {
    try {
      const res = await apiClient.get<ParentAnalytics>(`/parent/analytics/${childId}`);
      return res.data;
    } catch (e) {
      return {
        child_name: 'Arkan',
        total_playtime_minutes: 45,
        total_stars: 18,
        categories: [
          { category: 'Huruf', score_percentage: 90, total_levels_completed: 6 },
          { category: 'Angka', score_percentage: 75, total_levels_completed: 5 },
          { category: 'Warna', score_percentage: 85, total_levels_completed: 4 },
          { category: 'Memori', score_percentage: 70, total_levels_completed: 3 },
          { category: 'Logika', score_percentage: 60, total_levels_completed: 2 },
        ]
      };
    }
  },

  async getChildProfile(childId: string): Promise<ChildProfile> {
    try {
      const res = await apiClient.get<ChildProfile>(`/game/child/${childId}`);
      return res.data;
    } catch (e) {
      // Fallback: return default profile jika server tidak tersedia
      return {
        id: childId,
        name: 'Arkan',
        age: 5,
        level: 2,
        xp: 150,
        coins: 250,
        diamonds: 15,
        energy: 100,
        hearts: 5,
      };
    }
  }
};
