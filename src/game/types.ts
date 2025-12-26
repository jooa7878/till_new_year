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

// 스테이지 설정 (한 번에 3발씩 스폰)
export const STAGES: StageConfig[] = [
  {
    day: 26,
    name: "STAGE 1",
    bulletSpeed: 3,
    bulletFrequency: 700, // 700ms마다 3발 = 초당 ~4.3발
    bulletPatterns: ["random"],
    duration: 30000, // 30초
    hasBoss: false,
  },
  {
    day: 27,
    name: "STAGE 2",
    bulletSpeed: 3.5,
    bulletFrequency: 600, // 600ms마다 3발 = 초당 5발
    bulletPatterns: ["random", "aimed"],
    duration: 33000, // 33초
    hasBoss: false,
  },
  {
    day: 28,
    name: "STAGE 3",
    bulletSpeed: 3.3,
    bulletFrequency: 650, // 650ms마다 2발 = 초당 ~3발
    bulletPatterns: ["random", "aimed"],
    duration: 35000, // 35초
    hasBoss: false,
  },
  {
    day: 29,
    name: "STAGE 4",
    bulletSpeed: 3.6,
    bulletFrequency: 600, // 600ms마다 2발 = 초당 ~3.3발
    bulletPatterns: ["random", "aimed", "wave"],
    duration: 38000, // 38초
    hasBoss: false,
  },
  {
    day: 30,
    name: "STAGE 5",
    bulletSpeed: 4,
    bulletFrequency: 550, // 550ms마다 2발 = 초당 ~3.6발
    bulletPatterns: ["random", "aimed", "wave", "burst"],
    duration: 42000, // 42초
    hasBoss: false,
  },
  {
    day: 31,
    name: "FINAL STAGE",
    bulletSpeed: 4.5,
    bulletFrequency: 500, // 500ms마다 2발 = 초당 4발
    bulletPatterns: ["random", "aimed", "wave", "burst", "spiral"],
    duration: 45000, // 45초
    hasBoss: true,
  },
];
