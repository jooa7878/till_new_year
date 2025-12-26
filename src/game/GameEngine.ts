import { Player } from "./Player";
import { BulletSpawner } from "./Bullet";
import { type GameState, GAME_CONFIG, STAGES, type PlayerState } from "./types";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private bulletSpawner: BulletSpawner;
  private gameState: GameState;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private stageStartTime: number = 0;
  private stageElapsedTime: number = 0;
  private isRunning: boolean = false;
  private scoreAccumulator: number = 0;

  // 콜백
  private onStateChange?: (state: GameState) => void;
  private onPlayerStateChange?: (state: PlayerState) => void;
  private onStageProgress?: (progress: number) => void;

  // 이벤트 핸들러 (나중에 제거하기 위해 저장)
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.player = new Player();
    this.bulletSpawner = new BulletSpawner();

    this.gameState = {
      status: "menu",
      currentStage: 0,
      score: 0,
      highScore: parseInt(localStorage.getItem("tillNewYear_highScore") || "0"),
    };

    // 캔버스 크기 설정
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // modifier 키가 눌린 경우 무시
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      // 허용된 키만 처리
      const allowedKeys = [
        "Escape",
        "Enter",
        " ",
        "ArrowLeft",
        "ArrowRight",
        "a",
        "d",
        "A",
        "D",
      ];
      if (!allowedKeys.includes(e.key)) {
        return;
      }

      // Enter/Space는 브라우저 기본 동작 방지 (버튼 클릭 방지)
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();

        if (
          this.gameState.status === "menu" ||
          this.gameState.status === "gameOver"
        ) {
          this.startGame();
        } else if (this.gameState.status === "stageComplete") {
          this.nextStage();
        }
      }

      if (e.key === "Escape") {
        if (this.gameState.status === "playing") {
          this.pause();
        } else if (this.gameState.status === "paused") {
          this.resume();
        }
      }
    };

    window.addEventListener("keydown", this.keydownHandler);
  }

  setCallbacks(
    onStateChange: (state: GameState) => void,
    onPlayerStateChange: (state: PlayerState) => void,
    onStageProgress: (progress: number) => void
  ): void {
    this.onStateChange = onStateChange;
    this.onPlayerStateChange = onPlayerStateChange;
    this.onStageProgress = onStageProgress;
  }

  private stopGameLoop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  startGame(): void {
    // 이미 playing 상태면 중복 호출 방지
    if (this.gameState.status === "playing") return;

    this.stopGameLoop();

    this.gameState.status = "playing";
    this.gameState.currentStage = 0;
    this.gameState.score = 0;
    this.scoreAccumulator = 0;

    const now = performance.now();
    this.lastTime = now;
    this.stageStartTime = now;

    this.player.reset();
    this.bulletSpawner.reset(now);
    this.setupStage();

    // 게임 시작 시 2초 무적 부여
    this.player.grantInvincibility(2000);

    this.notifyStateChange();
    this.isRunning = true;
    this.gameLoop();
  }

  private setupStage(): void {
    const stage = STAGES[this.gameState.currentStage];
    this.bulletSpawner.setBulletConfig(
      stage.bulletSpeed,
      stage.bulletFrequency,
      stage.bulletPatterns
    );
    this.stageElapsedTime = 0;
  }

  nextStage(): void {
    // stageComplete 상태가 아니면 무시
    if (this.gameState.status !== "stageComplete") return;

    this.stopGameLoop();

    if (this.gameState.currentStage < STAGES.length - 1) {
      this.gameState.currentStage++;
      this.gameState.status = "playing";

      // 시간 초기화
      const now = performance.now();
      this.lastTime = now;
      this.stageStartTime = now;

      // 총알 완전 리셋
      this.bulletSpawner.reset(now);
      this.setupStage();

      // 스테이지 시작 시 2초 무적 부여
      this.player.grantInvincibility(2000);

      this.notifyStateChange();
      this.isRunning = true;
      this.gameLoop();
    } else {
      // 모든 스테이지 클리어!
      this.gameState.status = "victory";
      this.saveHighScore();
      this.notifyStateChange();
    }
  }

  private gameLoop = (): void => {
    // 게임이 실행 중이 아니거나 playing 상태가 아니면 중단
    if (!this.isRunning || this.gameState.status !== "playing") {
      this.isRunning = false;
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime, currentTime);
    this.render();

    // 여전히 playing 상태이고 실행 중이면 다음 프레임 스케줄
    if (this.isRunning && this.gameState.status === "playing") {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  private update(deltaTime: number, currentTime: number): void {
    // 이미 게임이 끝났으면 업데이트 하지 않음
    if (this.gameState.status !== "playing") return;

    const stage = STAGES[this.gameState.currentStage];

    // 플레이어 업데이트 (먼저)
    this.player.update(deltaTime);
    this.onPlayerStateChange?.(this.player.state);

    // 총알 업데이트
    this.bulletSpawner.update(
      currentTime,
      this.player.state.position.x + this.player.state.size.width / 2
    );

    // 충돌 체크 (게임오버 가능) - 스테이지 클리어 체크보다 먼저!
    this.checkCollisions();

    // 게임오버 되었으면 여기서 중단
    if (this.gameState.status !== "playing") return;

    // 스테이지 진행 시간 체크
    this.stageElapsedTime = currentTime - this.stageStartTime;
    const progress = Math.min(this.stageElapsedTime / stage.duration, 1);
    this.onStageProgress?.(progress);

    // 스테이지 클리어 체크
    if (this.stageElapsedTime >= stage.duration) {
      this.stageComplete();
      return;
    }

    // 점수 증가 (생존 시간 - 오래 버틸수록 높은 점수)
    // 기본 점수 + (진행률에 따른 보너스)
    // 0%: x1배, 50%: x2배, 100%: x3배
    const scoreMultiplier = 1 + progress * 2;
    const stageBonus = 1 + this.gameState.currentStage * 0.3; // 스테이지별 추가 보너스
    
    // deltaTime을 누적해서 점수 계산 (초당 약 100점 기준)
    this.scoreAccumulator = (this.scoreAccumulator || 0) + deltaTime;
    if (this.scoreAccumulator >= 100) {
      const points = Math.floor(this.scoreAccumulator / 100);
      this.gameState.score += Math.floor(points * scoreMultiplier * stageBonus);
      this.scoreAccumulator = this.scoreAccumulator % 100;
    }

    // 점수를 UI에 실시간 반영
    this.notifyStateChange();
  }

  private checkCollisions(): void {
    // 게임이 playing 상태가 아니면 스킵
    if (this.gameState.status !== "playing") return;

    // 무적 상태면 충돌 체크 스킵
    if (this.player.state.isInvincible) return;

    // 히트박스를 플레이어 중심부로 축소
    const hitboxPadding = 12;
    const playerBounds = {
      left: this.player.state.position.x + hitboxPadding,
      right:
        this.player.state.position.x +
        this.player.state.size.width -
        hitboxPadding,
      top: this.player.state.position.y + hitboxPadding,
      bottom: this.player.state.position.y + this.player.state.size.height - 8,
    };

    for (const bullet of this.bulletSpawner.getBullets()) {
      // 이미 게임오버 되었으면 중단
      if (this.gameState.status !== "playing") return;

      // 이미 무적이면 중단 (한 프레임에서 한 번만 피격)
      if (this.player.state.isInvincible) return;

      if (!bullet.state.isActive) continue;

      const bulletBounds = {
        left: bullet.state.position.x + 2,
        right: bullet.state.position.x + bullet.state.size.width - 2,
        top: bullet.state.position.y + 2,
        bottom: bullet.state.position.y + bullet.state.size.height - 2,
      };

      // AABB 충돌 체크
      if (
        playerBounds.left < bulletBounds.right &&
        playerBounds.right > bulletBounds.left &&
        playerBounds.top < bulletBounds.bottom &&
        playerBounds.bottom > bulletBounds.top
      ) {
        bullet.state.isActive = false;
        const isDead = this.player.hit();

        if (isDead) {
          this.gameOver();
          return;
        }
        // 피격 후 무적이 되므로 더 이상 충돌 체크 불필요
        return;
      }
    }
  }

  private stageComplete(): void {
    this.stopGameLoop();
    this.gameState.status = "stageComplete";
    this.gameState.score += 1000 * (this.gameState.currentStage + 1);
    this.saveHighScore();
    this.notifyStateChange();
  }

  private gameOver(): void {
    this.stopGameLoop();
    this.gameState.status = "gameOver";
    this.saveHighScore();
    this.notifyStateChange();
  }

  private saveHighScore(): void {
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      localStorage.setItem(
        "tillNewYear_highScore",
        this.gameState.highScore.toString()
      );
    }
  }

  pause(): void {
    if (this.gameState.status !== "playing") return;
    this.stopGameLoop();
    this.gameState.status = "paused";
    this.notifyStateChange();
  }

  resume(): void {
    if (this.gameState.status !== "paused") return;
    this.gameState.status = "playing";
    this.lastTime = performance.now();
    this.stageStartTime = performance.now() - this.stageElapsedTime;
    this.notifyStateChange();
    this.isRunning = true;
    this.gameLoop();
  }

  private render(): void {
    const ctx = this.ctx;

    // 배경
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // 별 배경 효과
    this.renderStars();

    // 총알 렌더링
    this.bulletSpawner.render(ctx);

    // 플레이어 렌더링
    this.player.render(ctx);
  }

  private renderStars(): void {
    const ctx = this.ctx;
    const time = Date.now() / 1000;

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (let i = 0; i < 50; i++) {
      const x = (i * 73 + time * 10) % GAME_CONFIG.CANVAS_WIDTH;
      const y = (i * 137 + time * 20) % GAME_CONFIG.CANVAS_HEIGHT;
      const size = (Math.sin(i + time) + 1) * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private notifyStateChange(): void {
    this.onStateChange?.({ ...this.gameState });
  }

  getState(): GameState {
    return { ...this.gameState };
  }

  // 모바일 컨트롤
  setMobileControl(direction: "left" | "right", pressed: boolean): void {
    this.player.setMobileControl(direction, pressed);
  }

  // 플레이어 공격 (나중에 구현)
  playerAttack(): void {
    if (this.gameState.status !== "playing") return;
    // TODO: 공격 로직 구현
    console.log("Attack!");
  }

  destroy(): void {
    this.stopGameLoop();

    // 이벤트 리스너 제거
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }

    this.player.destroy();
  }
}
