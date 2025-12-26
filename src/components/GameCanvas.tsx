import { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "../game/GameEngine";
import { type GameState, type PlayerState, STAGES } from "../game/types";
import "./GameCanvas.css";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
    currentStage: 0,
    score: 0,
    highScore: 0,
  });
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.setCallbacks(
      (state) => setGameState(state),
      (state) => setPlayerState(state),
      (progress) => setStageProgress(progress)
    );

    // 초기 상태 가져오기
    setGameState(engine.getState());

    return () => {
      engine.destroy();
    };
  }, []);

  const handleStart = () => {
    engineRef.current?.startGame();
  };

  // 모바일 컨트롤 핸들러
  const handleMoveLeft = useCallback((pressed: boolean) => {
    engineRef.current?.setMobileControl("left", pressed);
  }, []);

  const handleMoveRight = useCallback((pressed: boolean) => {
    engineRef.current?.setMobileControl("right", pressed);
  }, []);

  // TODO: 공격 기능 개발 후 활성화
  // const handleAttack = useCallback(() => {
  //   engineRef.current?.playerAttack();
  // }, []);

  const currentStage = STAGES[gameState.currentStage];

  return (
    <div className="game-container">
      <div className="game-wrapper">
        {/* 게임 정보 HUD */}
        <div className="game-hud">
          <div className="hud-left">
            <div className="score">
              SCORE: {gameState.score.toLocaleString()}
            </div>
            <div className="high-score">
              HIGH: {gameState.highScore.toLocaleString()}
            </div>
          </div>
          <div className="hud-center">
            {gameState.status === "playing" && currentStage && (
              <>
                <div className="stage-name">{currentStage.name}</div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${stageProgress * 100}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {Math.floor(stageProgress * 100)}%
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="hud-right">
            {playerState && (
              <div className="lives">
                {"❤️".repeat(playerState.lives)}
                {"🖤".repeat(Math.max(0, 3 - playerState.lives))}
              </div>
            )}
          </div>
        </div>

        {/* 캔버스 */}
        <canvas ref={canvasRef} className="game-canvas" />

        {/* 오버레이 화면들 */}
        {gameState.status === "menu" && (
          <div className="overlay menu-overlay">
            <h1 className="game-title">Till New Year</h1>
            <p className="game-subtitle">새해까지 살아남아라!</p>
            <div className="stage-preview">
              {STAGES.map((stage, i) => (
                <div key={i} className="stage-day">
                  {stage.day}일
                </div>
              ))}
            </div>
            <button className="start-button" onClick={handleStart}>
              시작하기
            </button>
            <p className="controls-hint">← → 또는 A D 키로 이동</p>
          </div>
        )}

        {gameState.status === "paused" && (
          <div className="overlay pause-overlay">
            <h2>일시정지</h2>
            <p>ESC를 눌러 계속하기</p>
          </div>
        )}

        {gameState.status === "gameOver" && (
          <div className="overlay gameover-overlay">
            <h2>GAME OVER</h2>
            <p className="final-score">
              최종 점수: {gameState.score.toLocaleString()}
            </p>
            <p className="reached-stage">도달: {currentStage?.name}</p>
            <button className="start-button" onClick={handleStart}>
              다시 시작
            </button>
          </div>
        )}

        {gameState.status === "stageComplete" && (
          <div className="overlay stage-complete-overlay">
            <h2>🎉 STAGE CLEAR! 🎉</h2>
            <p className="cleared-stage">{currentStage?.name} 클리어!</p>
            <p className="bonus-score">
              보너스: +{(1000 * (gameState.currentStage + 1)).toLocaleString()}
            </p>
            <button
              className="start-button"
              onClick={() => engineRef.current?.nextStage()}
            >
              다음 스테이지
            </button>
          </div>
        )}

        {gameState.status === "victory" && (
          <div className="overlay victory-overlay">
            <div className="fireworks">🎆🎇🎆</div>
            <h1 className="victory-title">🎉 Happy New Year! 🎉</h1>
            <p className="victory-subtitle">2026년을 향해!</p>
            <p className="final-score">
              최종 점수: {gameState.score.toLocaleString()}
            </p>
            <button className="start-button" onClick={handleStart}>
              다시 도전
            </button>
          </div>
        )}
      </div>

      {/* 모바일 컨트롤 버튼 - 화면 아래에 배치: ◀ ⚔ ▶ 순서 */}
      <div className="mobile-controls">
        <button
          className="mobile-btn mobile-btn-move"
          onTouchStart={() => handleMoveLeft(true)}
          onTouchEnd={() => handleMoveLeft(false)}
          onMouseDown={() => handleMoveLeft(true)}
          onMouseUp={() => handleMoveLeft(false)}
          onMouseLeave={() => handleMoveLeft(false)}
        >
          ◀
        </button>
        {/* TODO: 공격 기능 개발 후 활성화
        <button
          className="mobile-btn mobile-btn-attack"
          onTouchStart={handleAttack}
          onMouseDown={handleAttack}
        >
          ⚔
        </button>
        */}
        <button
          className="mobile-btn mobile-btn-move"
          onTouchStart={() => handleMoveRight(true)}
          onTouchEnd={() => handleMoveRight(false)}
          onMouseDown={() => handleMoveRight(true)}
          onMouseUp={() => handleMoveRight(false)}
          onMouseLeave={() => handleMoveRight(false)}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
