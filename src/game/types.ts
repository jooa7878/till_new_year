// 게임 내 모든 타입 정의

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject {
  position: Position;
  size: Size;
  velocity: Position;
  isActive: boolean;
}

export interface PlayerState extends GameObject {
  lives: number;
  isInvincible: boolean;
  invincibleTimer: number;
}

export interface BulletState extends GameObject {
  type: "normal" | "fast" | "wave" | "boss";
  color: string;
}

export interface StageConfig {
  day: number; // 26, 27, 28, 29, 30, 31
  name: string;
  bulletSpeed: number;
  bulletFrequency: number; // ms between bullets
  bulletPatterns: BulletPattern[];
  duration: number; // stage duration in ms
  hasBoss: boolean;
}

export type BulletPattern = "random" | "aimed" | "spiral" | "wave" | "burst";

export interface GameState {
  status:
    | "menu"
    | "playing"
    | "paused"
    | "gameOver"
    | "stageComplete"
    | "victory";
  currentStage: number; // 0-5 (index)
  score: number;
  highScore: number;
}

// 게임 상수
export const GAME_CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  PLAYER_WIDTH: 43,
  PLAYER_HEIGHT: 55,
  PLAYER_SPEED: 6,
  BULLET_SIZE: 10,
  INVINCIBLE_DURATION: 2000, // 2초 무적
} as const;

// 스테이지 설정 (한 번에 2발씩 스폰)
export const STAGES: StageConfig[] = [
  {
    day: 26,
    name: "12월 26일이 지나고 있습니다",
    bulletSpeed: 3.3, // 3 → 3.3 (난이도 UP)
    bulletFrequency: 600, // 700 → 600 (난이도 UP)
    bulletPatterns: ["random", "aimed"],
    duration: 30000,
    hasBoss: false,
  },
  {
    day: 27,
    name: "12월 27일이 지나고 있습니다",
    bulletSpeed: 3.6, // 3.5 → 3.6 (난이도 UP)
    bulletFrequency: 550, // 600 → 550 (난이도 UP)
    bulletPatterns: ["random", "aimed"],
    duration: 33000,
    hasBoss: false,
  },
  {
    day: 28,
    name: "12월 28일이 지나고 있습니다",
    bulletSpeed: 3.5,
    bulletFrequency: 600,
    bulletPatterns: ["random", "aimed", "wave"], // wave 추가!
    duration: 35000,
    hasBoss: false,
  },
  {
    day: 29,
    name: "12월 29일이 지나고 있습니다",
    bulletSpeed: 3.6, // 그대로 유지
    bulletFrequency: 600,
    bulletPatterns: ["random", "aimed", "wave"],
    duration: 38000,
    hasBoss: false,
  },
  {
    day: 30,
    name: "12월 30일이 지나고 있습니다",
    bulletSpeed: 3.5, // 4 → 3.5 (난이도 DOWN)
    bulletFrequency: 650, // 550 → 650 (난이도 DOWN)
    bulletPatterns: ["random", "aimed", "wave", "burst"],
    duration: 42000,
    hasBoss: false,
  },
  {
    day: 31,
    name: "12월 31일... 새해가 다가옵니다!",
    bulletSpeed: 4,
    bulletFrequency: 550,
    bulletPatterns: ["random", "aimed", "wave", "burst", "spiral"],
    duration: 45000,
    hasBoss: true,
  },
];
