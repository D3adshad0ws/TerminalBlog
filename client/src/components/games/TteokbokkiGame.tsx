import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { TteokbokkiGameMenu } from './TteokbokkiGameMenu';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  direction?: number;
  isActive?: boolean;
}

interface GameState {
  player: GameObject;
  enemies: GameObject[];
  bullets: GameObject[];
  score: number;
  gameOver: boolean;
}

export const TteokbokkiGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>({
    player: { x: 200, y: 350, width: 30, height: 30 },
    enemies: [],
    bullets: [],
    score: 0,
    gameOver: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showMenu) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    const BULLET_SPEED = 7;
    const ENEMY_SPEED = 2;

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

      // Update and draw bullets
      const updatedBullets = gameState.bullets.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(bullet.x, bullet.y, 3, 8);
        return bullet.y > 0;
      });

      // Update and draw enemies (Tteokbokki vessels)
      const updatedEnemies = gameState.enemies.map(enemy => {
        // Sine wave movement
        enemy.x += Math.sin(timestamp * 0.002) * 2;
        enemy.y += ENEMY_SPEED;

        // Draw enemy vessel (Tteokbokki-styled spaceship)
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width/2, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();

        // Add red glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        return enemy;
      }).filter(enemy => enemy.y < canvas.height);

      // Draw player spaceship
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.moveTo(gameState.player.x + gameState.player.width/2, gameState.player.y);
      ctx.lineTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height);
      ctx.lineTo(gameState.player.x, gameState.player.y + gameState.player.height);
      ctx.closePath();
      ctx.fill();

      // Add blue engine glow
      ctx.shadowColor = '#0000ff';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Collision detection
      for (const enemy of updatedEnemies) {
        // Check for collision with player
        if (checkCollision(gameState.player, enemy)) {
          setGameState(prev => ({ ...prev, gameOver: true }));
          return;
        }

        // Check for collision with bullets
        for (const bullet of updatedBullets) {
          if (checkCollision(bullet, enemy)) {
            bullet.isActive = false;
            enemy.isActive = false;
            setGameState(prev => ({ ...prev, score: prev.score + 100 }));
          }
        }
      }

      // Draw score with retro style
      ctx.fillStyle = '#00ff00';
      ctx.font = '20px "Courier New"';
      ctx.fillText(`SCORE: ${gameState.score}`, 10, 30);

      // Spawn new enemies periodically
      if (timestamp % 1000 < 20 && updatedEnemies.length < 5) {
        updatedEnemies.push({
          x: Math.random() * (canvas.width - 30),
          y: 0,
          width: 30,
          height: 30,
          isActive: true
        });
      }

      setGameState(prev => ({
        ...prev,
        enemies: updatedEnemies.filter(e => e.isActive !== false),
        bullets: updatedBullets.filter(b => b.isActive !== false)
      }));

      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      const newPlayer = { ...gameState.player };
      const speed = 5;

      switch (e.key) {
        case 'ArrowLeft':
          newPlayer.x = Math.max(0, newPlayer.x - speed);
          break;
        case 'ArrowRight':
          newPlayer.x = Math.min(canvas.width - newPlayer.width, newPlayer.x + speed);
          break;
        case ' ': // Spacebar
          setGameState(prev => ({
            ...prev,
            bullets: [...prev.bullets, {
              x: newPlayer.x + newPlayer.width/2 - 1.5,
              y: newPlayer.y,
              width: 3,
              height: 8,
              isActive: true
            }]
          }));
          break;
      }

      setGameState(prev => ({ ...prev, player: newPlayer }));
    };

    // Start game loop
    requestAnimationFrame(gameLoop);

    // Add keyboard controls
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, showMenu]);

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGameState({
      player: { x: canvas.width/2 - 15, y: 350, width: 30, height: 30 },
      enemies: [],
      bullets: [],
      score: 0,
      gameOver: false
    });
    setShowMenu(false);
  };

  const resetGame = () => {
    setGameState(prev => ({ ...prev, gameOver: true }));
    setShowMenu(true);
  };

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      {showMenu ? (
        <TteokbokkiGameMenu
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