import type { PlayerState } from "./types";
import { GAME_CONFIG } from "./types";

export class Player {
  state: PlayerState;
  private keys: Set<string> = new Set();
  private image: HTMLImageElement | null = null;
  private imageLoaded: boolean = false;

  // 이벤트 핸들러 (나중에 제거하기 위해 저장)
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyupHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.state = this.getInitialState();
    this.setupControls();
    this.loadImage();
  }

  private loadImage(): void {
    this.image = new Image();
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.src = "/player.svg";
  }

  private getInitialState(): PlayerState {
    return {
      position: {
        x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_HEIGHT - 20,
      },
      size: {
        width: GAME_CONFIG.PLAYER_WIDTH,
        height: GAME_CONFIG.PLAYER_HEIGHT,
      },
      velocity: { x: 0, y: 0 },
      isActive: true,
      lives: 3,
      isInvincible: false,
      invincibleTimer: 0,
    };
  }

  private setupControls(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // modifier 키가 눌린 경우 무시
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      // 허용된 키만 처리
      const allowedKeys = ["ArrowLeft", "ArrowRight", "a", "d", "A", "D"];
      if (allowedKeys.includes(e.key)) {
        e.preventDefault();
        this.keys.add(e.key.toLowerCase());
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", this.keydownHandler);
    window.addEventListener("keyup", this.keyupHandler);
  }

  update(deltaTime: number): void {
    // 좌우 이동
    let moveX = 0;
    if (this.keys.has("arrowleft") || this.keys.has("a")) {
      moveX = -GAME_CONFIG.PLAYER_SPEED;
    }
    if (this.keys.has("arrowright") || this.keys.has("d")) {
      moveX = GAME_CONFIG.PLAYER_SPEED;
    }

    this.state.position.x += moveX;

    // 화면 경계 체크
    if (this.state.position.x < 0) {
      this.state.position.x = 0;
    }
    if (
      this.state.position.x >
      GAME_CONFIG.CANVAS_WIDTH - this.state.size.width
    ) {
      this.state.position.x = GAME_CONFIG.CANVAS_WIDTH - this.state.size.width;
    }

    // 무적 타이머 업데이트
    if (this.state.isInvincible) {
      this.state.invincibleTimer -= deltaTime;
      if (this.state.invincibleTimer <= 0) {
        this.state.isInvincible = false;
        this.state.invincibleTimer = 0;
      }
    }
  }

  hit(): boolean {
    if (this.state.isInvincible) return false;

    this.state.lives--;
    if (this.state.lives > 0) {
      this.state.isInvincible = true;
      this.state.invincibleTimer = GAME_CONFIG.INVINCIBLE_DURATION;
    }
    return this.state.lives <= 0;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { position, size, isInvincible } = this.state;

    ctx.save();

    // 무적 상태일 때 깜빡임 효과
    if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 글로우 효과
    if (isInvincible) {
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 20;
    }

    // SVG 이미지 렌더링
    if (this.imageLoaded && this.image) {
      ctx.drawImage(
        this.image,
        position.x,
        position.y,
        size.width,
        size.height
      );
    } else {
      // 이미지 로드 전 폴백 (간단한 삼각형)
      ctx.fillStyle = "#1E90FF";
      ctx.beginPath();
      ctx.moveTo(position.x + size.width / 2, position.y);
      ctx.lineTo(position.x, position.y + size.height);
      ctx.lineTo(position.x + size.width, position.y + size.height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  reset(): void {
    this.state = this.getInitialState();
    this.keys.clear();
  }

  grantInvincibility(duration: number): void {
    this.state.isInvincible = true;
    this.state.invincibleTimer = duration;
  }

  // 모바일 컨트롤
  setMobileControl(direction: "left" | "right", pressed: boolean): void {
    const key = direction === "left" ? "arrowleft" : "arrowright";
    if (pressed) {
      this.keys.add(key);
    } else {
      this.keys.delete(key);
    }
  }

  destroy(): void {
    this.keys.clear();

    // 이벤트 리스너 제거
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.keyupHandler) {
      window.removeEventListener("keyup", this.keyupHandler);
      this.keyupHandler = null;
    }
  }
}
