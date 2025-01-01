import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from "@/components/ui/card";
import { KartRiderMenu } from './KartRiderMenu';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lane: number;
}

interface GameState {
  player: GameObject;
  obstacles: GameObject[];
  score: number;
  gameOver: boolean;
}

export const KartRiderGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [_, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    player: { x: 200, y: 300, width: 40, height: 60, speed: 5, lane: 1 },
    obstacles: [],
    score: 0,
    gameOver: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showMenu) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    const ROAD_SPEED = 5;
    const LANE_WIDTH = canvas.width / 3;

    const gameLoop = (timestamp: number) => {
      if (gameState.gameOver) {
        setShowMenu(true);
        if (gameState.score > highScore) {
          setHighScore(gameState.score);
        }
        return;
      }

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lines
      ctx.strokeStyle = 'rgb(40,254,20)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]); // Dashed line
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * LANE_WIDTH, 0);
        ctx.lineTo(i * LANE_WIDTH, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset line style

      // Draw player car (retro style)
      const playerX = gameState.player.lane * LANE_WIDTH - LANE_WIDTH/2 - gameState.player.width/2;
      ctx.fillStyle = 'rgb(40,254,20)';
      // Car body
      ctx.fillRect(playerX, gameState.player.y, gameState.player.width, gameState.player.height);
      // Wheels
      ctx.fillRect(playerX - 5, gameState.player.y + 10, 5, 15);
      ctx.fillRect(playerX + gameState.player.width, gameState.player.y + 10, 5, 15);
      ctx.fillRect(playerX - 5, gameState.player.y + gameState.player.height - 25, 5, 15);
      ctx.fillRect(playerX + gameState.player.width, gameState.player.y + gameState.player.height - 25, 5, 15);

      // Update and draw obstacles
      const updatedObstacles = gameState.obstacles.map(obstacle => {
        obstacle.y += ROAD_SPEED;
        
        // Draw obstacle
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fillRect(
          obstacle.lane * LANE_WIDTH - LANE_WIDTH/2 - obstacle.width/2,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );

        return obstacle;
      }).filter(obstacle => obstacle.y < canvas.height);

      // Spawn new obstacles
      if (timestamp % 1500 < 20 && updatedObstacles.length < 3) {
        updatedObstacles.push({
          x: 0,
          y: -50,
          width: 30,
          height: 50,
          speed: ROAD_SPEED,
          lane: Math.floor(Math.random() * 3) + 1
        });
      }

      // Check collisions
      for (const obstacle of updatedObstacles) {
        if (obstacle.lane === gameState.player.lane &&
            obstacle.y + obstacle.height > gameState.player.y &&
            obstacle.y < gameState.player.y + gameState.player.height) {
          setGameState(prev => ({ ...prev, gameOver: true }));
          return;
        }
      }

      // Update score
      setGameState(prev => ({
        ...prev,
        obstacles: updatedObstacles,
        score: prev.score + 1
      }));

      // Draw score with retro style
      ctx.fillStyle = 'rgb(40,254,20)';
      ctx.font = '20px "Courier New"';
      ctx.fillText(`SCORE: ${gameState.score}`, 10, 30);

      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              lane: Math.max(1, prev.player.lane - 1)
            }
          }));
          break;
        case 'ArrowRight':
          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              lane: Math.min(3, prev.player.lane + 1)
            }
          }));
          break;
      }
    };

    requestAnimationFrame(gameLoop);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, showMenu]);

  const startGame = () => {
    setGameState({
      player: { x: 200, y: 300, width: 40, height: 60, speed: 5, lane: 1 },
      obstacles: [],
      score: 0,
      gameOver: false
    });
    setShowMenu(false);
  };

  const resetGame = () => {
    setGameState(prev => ({ ...prev, gameOver: true }));
    setShowMenu(true);
    setLocation('/'); // Navigate back to terminal view
  };

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      {showMenu ? (
        <KartRiderMenu
          onStartGame={startGame}
          onResetGame={resetGame}
          highScore={highScore}
        />
      ) : (
        <Card className="p-4 bg-black border-[rgb(40,254,20)]">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border-2 border-[rgb(40,254,20)] rounded-lg bg-black"
          />
        </Card>
      )}
    </div>
  );
};