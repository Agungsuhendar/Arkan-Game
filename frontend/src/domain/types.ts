export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  level: number;
  xp: number;
  coins: number;
  diamonds: number;
  energy: number;
  hearts: number;
  avatar_url?: string;
}

export interface QuestionOption {
  id: string;
  option_text: string;
  option_asset?: string;
}


export interface Question {
  id: string;
  prompt_text: string;
  prompt_audio?: string;
  category: string;
  options: QuestionOption[];
}

export interface GameEngineConfig {
  id: string;
  code: string;
  name: string;
  engine_type: string;
  default_config: Record<string, any>;
}

export interface Level {
  id: string;
  level_number: number;
  title: string;
  reward_coins: number;
  reward_xp: number;
  engine: GameEngineConfig;
  questions: Question[];
}

export interface World {
  id: string;
  code: string;
  name: string;
  description?: string;
  boss_name?: string;
  npc_name?: string;
  icon_asset: string;
  bg_asset: string;
  order_index: number;
}

export interface ParentCategoryProgress {
  category: string;
  score_percentage: number;
  total_levels_completed: number;
}

export interface ParentAnalytics {
  child_name: string;
  total_playtime_minutes: number;
  total_stars: number;
  categories: ParentCategoryProgress[];
}
