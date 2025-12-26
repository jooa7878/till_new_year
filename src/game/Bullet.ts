import { GAME_CONFIG, type BulletState, type BulletPattern } from "./types";

export class Bullet {
  state: BulletState;

  constructor(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    type: BulletState["type"] = "normal"
  ) {
    this.state = {
      position: { x, y },
      size: { width: GAME_CONFIG.BULLET_SIZE, height: GAME_CONFIG.BULLET_SIZE },
      velocity: { x: velocityX, y: velocityY },
      isActive: true,
      type,
      color: this.getColorByType(type),
    };
  }

  private getColorByType(type: BulletState["type"]): string {
    switch (type) {
      case "normal":
        return "#ff4444";
      case "fast":
        return "#ff8800";
      case "wave":
        return "#aa44ff";
      case "boss":
        return "#ff0066";
      default:
        return "#ff4444";
    }
  }

  update(): void {
    this.state.position.x += this.state.velocity.x;
    this.state.position.y += this.state.velocity.y;

    // 화면 밖으로 나가면 비활성화
    if (
      this.state.position.y > GAME_CONFIG.CANVAS_HEIGHT + 20 ||
      this.state.position.x < -20 ||
      this.state.position.x > GAME_CONFIG.CANVAS_WIDTH + 20
    ) {
      this.state.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { position, size, color } = this.state;

    ctx.save();

    // 글로우 효과
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // 총알 (원형)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      position.x + size.width / 2,
      position.y + size.height / 2,
      size.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 내부 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(
      position.x + size.width / 2 - 2,
      position.y + size.height / 2 - 2,
      size.width / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
}

// 총알 생성 팩토리
export class BulletSpawner {
  private bullets: Bullet[] = [];
  private lastSpawnTime: number = 0;
  private spawnInterval: number = 800;
  private bulletSpeed: number = 3;
  private patterns: BulletPattern[] = ["random"];
  private spiralAngle: number = 0;
  private bulletsPerSpawn: number = 2; // 한 번에 스폰할 총알 수

  setBulletConfig(
    speed: number,
    interval: number,
    patterns: BulletPattern[]
  ): void {
    this.bulletSpeed = speed;
    this.spawnInterval = interval;
    this.patterns = patterns;
  }

  update(currentTime: number, playerX: number): void {
    // 새 총알 생성
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnBullets(playerX);
      this.lastSpawnTime = currentTime;
    }

    // 기존 총알 업데이트
    this.bullets.forEach((bullet) => bullet.update());

    // 비활성 총알 제거
    this.bullets = this.bullets.filter((bullet) => bullet.state.isActive);
  }

  private spawnBullets(playerX: number): void {
    // 한 번에 여러 발 스폰
    for (let i = 0; i < this.bulletsPerSpawn; i++) {
      const pattern =
        this.patterns[Math.floor(Math.random() * this.patterns.length)];

      switch (pattern) {
        case "random":
          this.spawnRandom();
          break;
        case "aimed":
          this.spawnAimed(playerX);
          break;
        case "wave":
          this.spawnWave();
          break;
        case "burst":
          this.spawnBurst();
          break;
        case "spiral":
          this.spawnSpiral();
          break;
      }
    }
  }

  private spawnRandom(): void {
    const x =
      Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.BULLET_SIZE);
    const bullet = new Bullet(
      x,
      -GAME_CONFIG.BULLET_SIZE,
      0,
      this.bulletSpeed,
      "normal"
    );
    this.bullets.push(bullet);
  }

  private spawnAimed(playerX: number): void {
    const x =
      Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.BULLET_SIZE);
    const dx = playerX - x;
    const dy = GAME_CONFIG.CANVAS_HEIGHT;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * this.bulletSpeed;
    const vy = (dy / distance) * this.bulletSpeed;

    const bullet = new Bullet(x, -GAME_CONFIG.BULLET_SIZE, vx, vy, "fast");
    this.bullets.push(bullet);
  }

  private spawnWave(): void {
    for (let i = 0; i < 4; i++) {
      const x = (GAME_CONFIG.CANVAS_WIDTH / 5) * (i + 1);
      const bullet = new Bullet(
        x,
        -GAME_CONFIG.BULLET_SIZE,
        0,
        this.bulletSpeed,
        "wave"
      );
      this.bullets.push(bullet);
    }
  }

  private spawnBurst(): void {
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 8) * i + Math.PI / 2;
      const vx = Math.cos(angle) * this.bulletSpeed * 0.5;
      const vy = Math.sin(angle) * this.bulletSpeed;
      const bullet = new Bullet(
        centerX,
        -GAME_CONFIG.BULLET_SIZE,
        vx,
        vy,
        "normal"
      );
      this.bullets.push(bullet);
    }
  }

  private spawnSpiral(): void {
    this.spiralAngle += 0.3;
    const x = GAME_CONFIG.CANVAS_WIDTH / 2 + Math.cos(this.spiralAngle) * 100;
    const vx = Math.sin(this.spiralAngle) * this.bulletSpeed * 0.3;
    const bullet = new Bullet(
      x,
      -GAME_CONFIG.BULLET_SIZE,
      vx,
      this.bulletSpeed,
      "wave"
    );
    this.bullets.push(bullet);
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.bullets.forEach((bullet) => bullet.render(ctx));
  }

  reset(currentTime: number = 0): void {
    this.bullets = [];
    // 현재 시간으로 설정하면 스테이지 시작 후 spawnInterval 후에 첫 총알 생성
    this.lastSpawnTime = currentTime;
    this.spiralAngle = 0;
  }
}
