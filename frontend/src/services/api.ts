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

// Automatically inject Bearer JWT token if user is logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem('refresh_token', res.data.refresh_token);
      }
    }
    return res.data;
  },

  async register(email: string, password: string, fullName: string, phone?: string) {
    const res = await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      phone
    });
    if (res.data?.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem('refresh_token', res.data.refresh_token);
      }
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getAccessToken() {
    return localStorage.getItem('access_token');
  }
};



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
        { id: 'w8', code: 'studio_musik', name: 'Studio Musik', description: 'Bermain piano & irama lagu anak', boss_name: 'Maestro Arkan', npc_name: 'Dino Drummer', icon_asset: 'studio_musik', bg_asset: 'bg_musik', order_index: 8 },
        { id: 'w9', code: 'taman_ejaan', name: 'Taman Ejaan Kata', description: 'Belajar mengeja kata & fonik', boss_name: 'Raja Ejaan', npc_name: 'Kelinci Eja', icon_asset: 'taman_ejaan', bg_asset: 'bg_ejaan', order_index: 9 },
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
              { id: 'o1', option_text: 'A' },
              { id: 'o2', option_text: 'B' },
              { id: 'o3', option_text: 'C' }
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
    const token = localStorage.getItem('access_token');
    if (!token || childId === 'arkan_default_child_id') {
      return {
        child_name: 'Arkan',
        total_playtime_minutes: 0,
        total_stars: 0,
        categories: []
      };
    }

    try {
      const res = await apiClient.get<ParentAnalytics>(`/parent/analytics/${childId}`);
      return res.data;
    } catch (e) {
      return {
        child_name: 'Arkan',
        total_playtime_minutes: 0,
        total_stars: 0,
        categories: []
      };
    }
  },



  async getChildProfile(childId: string): Promise<ChildProfile> {
    const token = localStorage.getItem('access_token');
    if (!token || childId === 'arkan_default_child_id') {
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

    try {
      const res = await apiClient.get<ChildProfile>(`/game/child/${childId}`);
      return res.data;
    } catch (e) {
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
  },


  async generateAiStory(topic: string, moralValue: string, category: string = 'Petualangan 🚩', targetAge: number = 4): Promise<any> {
    try {
      const res = await apiClient.post('/game/story/generate', {
        topic,
        moral_value: moralValue,
        category,
        target_age: targetAge
      });
      return res.data;
    } catch (e) {
      // Offline fallback story generator
      const timestamp = Date.now();
      const cleanTopic = topic || 'Petualangan Arkan yang Ajaib';
      const cleanMoral = moralValue || 'Suka Menolong & Menyayangi Sesama';
      return {
        id: `buku-ai-${timestamp}`,
        title: `Arkan dan ${cleanTopic}`,
        subtitle: `Cerita Dongeng AI untuk Usia ${targetAge} Tahun`,
        coverImage: '/arkan_cat_dino.png',
        category,
        badge: '✨ Dibuat AI',
        badgeColor: 'bg-purple-8',
        readTime: '3 Menit',
        summary: `Kisah ajaib buatan AI tentang ${cleanTopic} yang mengajari Arkan dan teman-teman tentang nilai moral ${cleanMoral}.`,
        pages: [
          {
            pageNumber: 1,
            title: `Bagian 1: Belajar Tentang ${cleanTopic}`,
            subtitle: 'Hari Baru yang Ceria',
            image: '/arkan_baik_hati_1.jpg',
            badge: 'Pagi Ceria',
            badgeColor: 'bg-amber-8',
            dialogueSpeaker: 'Arkan',
            dialogueText: `Wah! Hari ini aku siap berpetualang dan belajar tentang ${cleanTopic}!`,
            storyContent: `Di pagi hari yang cerah, Arkan bangun dengan senyuman ceria. Arkan siap belajar dan berpetualang tentang ${cleanTopic}.`,
            missionText: `🌅 Belajar tentang ${cleanTopic}`,
            bgGradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
            emoji: '✨ 🌅 🦖'
          },
          {
            pageNumber: 2,
            title: 'Bagian 2: Pengalaman & Teman Baru',
            subtitle: 'Bertemu Teman di Jalan',
            image: '/arkan_cat_dino.png',
            badge: 'Sahabat Baik',
            badgeColor: 'bg-blue-8',
            dialogueSpeaker: 'Teman Baru',
            dialogueText: 'Halo Arkan! Bersama-sama kita pasti bisa melakukan hal hebat!',
            storyContent: `Arkan bertemu teman baru yang ramah. Bersama-sama, mereka saling membantu dengan penuh kasih sayang.`,
            missionText: `🤝 ${cleanMoral}`,
            bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            emoji: '🤝 🦖 💖'
          },
          {
            pageNumber: 3,
            title: 'Bagian 3: Rintangan Kebaikan',
            subtitle: 'Tunjukkan Hati yang Baik',
            image: '/arkan_hutan_3.png',
            badge: 'Tantangan',
            badgeColor: 'bg-purple-8',
            dialogueSpeaker: 'Arkan',
            dialogueText: 'Jangan khawatir, aku pasti akan membantumu!',
            storyContent: `Saat ada kesulitan kecil, Arkan tidak ragu menolong dengan tulus sesuai nilai moral '${cleanMoral}'.`,
            missionText: `💖 Menebar ${cleanMoral}`,
            bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
            emoji: '💖 🌟 ✨'
          },
          {
            pageNumber: 4,
            title: 'Bagian 4: Kebahagiaan Bersama',
            subtitle: 'Senyuman Indah',
            image: '/arkan_toples_4.png',
            badge: 'Sukacita',
            badgeColor: 'bg-emerald-8',
            dialogueSpeaker: 'Mama & Papa',
            dialogueText: 'Arkan hebat sekali! Mama Papa bangga!',
            storyContent: `Semua merasa gembira. Arkan belajar bahwa berbuat baik membuat hati terasa sangat damai dan penuh syukur.`,
            missionText: '😊 Berbuat Baik Setiap Hari',
            bgGradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
            emoji: '😊 🫙 🌟'
          },
          {
            pageNumber: 5,
            title: 'Bagian 5: Janji Anak Pintar',
            subtitle: 'Menutup Hari dengan Syukur',
            image: '/arkan_baik_hati_6.jpg',
            badge: 'Pesan Dongeng AI',
            badgeColor: 'bg-pink-8',
            dialogueSpeaker: 'Arkan',
            dialogueText: `Mari kita selalu menerapkan ${cleanMoral} setiap hari!`,
            storyContent: `Arkan tersenyum dan berjanji akan terus menjadi anak yang baik hati, rajin belajar, dan menyayangi sesama.`,
            missionText: `📜 Pesan Moral: ${cleanMoral}`,
            bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
            emoji: '🌟 💖 🌍'
          }
        ]
      };
    }
  }
};
